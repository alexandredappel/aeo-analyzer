import Stripe from 'stripe';
import logger from '@/utils/logger';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : (null as unknown as Stripe);

function getTimestampSeconds(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

async function upsertSubscription(params: {
  userId: string | null;
  guestFingerprint: string | null;
  customerId: string;
  subscriptionId: string | null;
  status: string;
  priceId: string | null;
  planType: string; // 'early_bird' | 'starter'
  cancelAtPeriodEnd: boolean | null;
  currentPeriodStart: number | null; // epoch seconds
  currentPeriodEnd: number | null; // epoch seconds
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('upsert_subscription', {
      p_user_id: params.userId,
      p_guest_fingerprint: params.guestFingerprint,
      p_stripe_customer_id: params.customerId,
      p_stripe_subscription_id: params.subscriptionId,
      p_status: params.status,
      p_price_id: params.priceId,
      p_plan_type: params.planType,
      p_cancel_at_period_end: params.cancelAtPeriodEnd,
      p_current_period_start: params.currentPeriodStart
        ? new Date(params.currentPeriodStart * 1000).toISOString()
        : null,
      p_current_period_end: params.currentPeriodEnd
        ? new Date(params.currentPeriodEnd * 1000).toISOString()
        : null,
    });
    if (error) {
      logger.error(`Supabase upsert_subscription error: ${error.message}`);
    } else {
      logger.success(
        `Supabase upsert_subscription OK (sub=${params.subscriptionId}, status=${params.status})`
      );
    }
  } catch (error) {
    logger.error(`Supabase RPC failed: ${(error as Error).message}`);
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!stripeSecretKey || !webhookSecret) {
    logger.error('Stripe webhook is not configured: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return new Response('Webhook not configured', { status: 500 });
  }

  let event: Stripe.Event;
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing Stripe-Signature header', { status: 400 });
  }

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${(err as Error).message}`);
    return new Response('Signature verification failed', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata?.user_id as string) || null;
        const guestFingerprint = (session.metadata?.guest_fingerprint as string) || null;
        const customerId = (session.customer as string) || '';
        const subscriptionId = (session.subscription as string) || null;
        let priceId: string | null = null;
        let status = 'active';
        let cancelAtPeriodEnd: boolean | null = null;
        let currentPeriodStart: number | null = null;
        let currentPeriodEnd: number | null = null;

        // Ignore non-subscription sessions or sessions without a subscription id
        if (session.mode !== 'subscription' || !subscriptionId) {
          logger.info(
            `Ignoring checkout.session.completed without subscription (mode=${session.mode}, sub=${subscriptionId})`
          );
          break;
        }

        if (subscriptionId) {
          try {
            const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
            status = subscription?.status ?? status;
            cancelAtPeriodEnd = typeof subscription?.cancel_at_period_end === 'boolean' ? subscription.cancel_at_period_end : null;
            currentPeriodStart = getTimestampSeconds(subscription?.current_period_start);
            currentPeriodEnd = getTimestampSeconds(subscription?.current_period_end);
            const firstItem = subscription?.items?.data?.[0];
            priceId = (firstItem?.price?.id as string) || priceId;
            
          } catch (e) {
            logger.error(`Failed to retrieve subscription ${subscriptionId}: ${(e as Error).message}`);
          }
        }

        if (customerId) {
          const planType = priceId === process.env.NEXT_PUBLIC_STRIPE_EARLY_BIRD_PRICE_ID ? 'early_bird' : 'starter';
          const upsertPayload = {
            userId,
            guestFingerprint,
            customerId,
            subscriptionId,
            status,
            priceId,
            planType,
            cancelAtPeriodEnd,
            currentPeriodStart,
            currentPeriodEnd,
          };
          await upsertSubscription(upsertPayload);
          logger.success(
            `Upserted subscription ${subscriptionId} (status=${status}) for ${userId ?? guestFingerprint ?? customerId}`
          );
        }

        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscriptionObj = event.data.object as any;
        const customerId = (subscriptionObj?.customer as string) || '';
        const subscriptionId = subscriptionObj?.id as string;
        const status = subscriptionObj?.status as string;
        const firstItem = subscriptionObj?.items?.data?.[0];
        const priceId = (firstItem?.price?.id as string) || null;
        const cancelAtPeriodEnd = typeof subscriptionObj?.cancel_at_period_end === 'boolean' ? subscriptionObj.cancel_at_period_end : null;
        const currentPeriodStart = getTimestampSeconds(subscriptionObj?.current_period_start);
        const currentPeriodEnd = getTimestampSeconds(subscriptionObj?.current_period_end);

        // Pull metadata from subscription if available (can be set via subscription_data.metadata)
        const userId = (subscriptionObj?.metadata?.user_id as string) || null;
        const guestFingerprint = (subscriptionObj?.metadata?.guest_fingerprint as string) || null;

        
        if (customerId) {
          const planType = priceId === process.env.NEXT_PUBLIC_STRIPE_EARLY_BIRD_PRICE_ID ? 'early_bird' : 'starter';
          const upsertPayload = {
            userId,
            guestFingerprint,
            customerId,
            subscriptionId,
            status,
            priceId,
            planType,
            cancelAtPeriodEnd,
            currentPeriodStart,
            currentPeriodEnd,
          };
          await upsertSubscription(upsertPayload);
          logger.success(
            `Upserted subscription ${subscriptionId} (status=${status}) for ${userId ?? guestFingerprint ?? customerId}`
          );
        }
        break;
      }
      default: {
        // No-op for unhandled events
        break;
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    logger.error(`Error handling webhook event ${event?.type}: ${(err as Error).message}`);
    return new Response('Webhook handler error', { status: 500 });
  }
}


