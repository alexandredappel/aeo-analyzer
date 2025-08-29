import Stripe from 'stripe';
import { cookies, headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import logger from '@/utils/logger';

type CheckoutBody = {
  priceId?: string;
  userId?: string; // optional override, server will prefer session user
  guestFingerprint?: string; // optional override, server will prefer cookie
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripeSecretKey) {
  // Log once on module init if missing env var
  logger.error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : (null as unknown as Stripe);

function getOriginFromRequest(request: Request): string {
  const originHeader = request.headers.get('origin');
  if (originHeader) return originHeader;
  try {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
}

function buildCorsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

// Very simple in-memory rate limiter (best-effort, per runtime instance)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // per key per window

function getClientKey(headers: Headers, explicitKey?: string | null): string {
  if (explicitKey) return explicitKey;
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart > WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = getOriginFromRequest(request);
  return new Response(null, { status: 204, headers: buildCorsHeaders(origin) });
}

/**
 * POST /api/stripe/checkout
 * Body: { priceId: string, userId?: string, guestFingerprint?: string }
 * Returns: { checkoutUrl: string }
 */
async function handleCheckout(request: Request, method: 'POST' | 'GET'): Promise<Response> {
  const origin = getOriginFromRequest(request);
  const corsHeaders = buildCorsHeaders(origin);

  try {
    if (!stripeSecretKey || !publishableKey) {
      return Response.json(
        { error: 'Configuration Error', message: 'Stripe environment keys are not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Rate limiting
    const cookieStore = await cookies();
    let cookieFingerprint = cookieStore.get('guest_fingerprint')?.value || null;
    const h = await headers();
    const rateKey = getClientKey(h as unknown as Headers, cookieFingerprint);
    if (!checkRateLimit(rateKey)) {
      return Response.json(
        { error: 'Rate Limit Exceeded', message: 'Too many checkout attempts. Please wait a minute and try again.' },
        { status: 429, headers: corsHeaders }
      );
    }

    let body: CheckoutBody = {};
    let auto = 'false';
    if (method === 'POST') {
      try {
        body = (await request.json()) as CheckoutBody;
      } catch {
        return Response.json(
          { error: 'Invalid Request', message: 'Request body must be valid JSON' },
          { status: 400, headers: corsHeaders }
        );
      }
      try {
        const url = new URL(request.url);
        auto = url.searchParams.get('auto') || 'false';
      } catch {}
    } else {
      // GET support for auto=true path
      try {
        const url = new URL(request.url);
        auto = url.searchParams.get('auto') || 'false';
      } catch {}
    }

    const priceId = body.priceId || process.env.NEXT_PUBLIC_STRIPE_EARLY_BIRD_PRICE_ID;
    if (!priceId || typeof priceId !== 'string') {
      return Response.json(
        { error: 'Validation Error', message: 'Missing or invalid priceId' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Identify user (Supabase) or guest
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id || body.userId || null;
    let guestFingerprint = cookieFingerprint || body.guestFingerprint || null;

    // Ensure guest identification if user is not authenticated
    let setGuestCookie = false;
    if (!userId && !guestFingerprint) {
      guestFingerprint = uuidv4();
      setGuestCookie = true;
    }
    const customerEmail = user?.email || undefined;

    const upgradedFlag = auto === 'true' ? '&upgraded=true' : '';
    const successUrl = `${origin}/?checkout=success${upgradedFlag}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/?checkout=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_email: customerEmail,
      metadata: {
        app_env: process.env.NODE_ENV || 'development',
        is_guest: (!userId && !!guestFingerprint).toString(),
        user_id: userId || '',
        guest_fingerprint: guestFingerprint || '',
      },
      subscription_data: {
        metadata: {
          user_id: userId || '',
          guest_fingerprint: guestFingerprint || '',
        },
      },
    });

    logger.info(`Created Stripe checkout session ${session.id} for ${userId ?? guestFingerprint ?? 'unknown'}`);

    // Attach new guest fingerprint cookie if created
    if (setGuestCookie && guestFingerprint) {
      cookieStore.set('guest_fingerprint', guestFingerprint, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    // Auto redirect (signup upgrade flow)
    if (auto === 'true' && session.url) {
      return Response.redirect(session.url, 302);
    }

    // Normal JSON response (programmatic handling)
    return Response.json(
      { checkoutUrl: session.url },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error(`Stripe checkout error: ${(error as Error).message}`);
    return Response.json(
      { error: 'Stripe Error', message: 'Failed to create checkout session' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  return handleCheckout(request, 'POST');
}

export async function GET(request: Request): Promise<Response> {
  return handleCheckout(request, 'GET');
}


