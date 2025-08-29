import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Admin client for bypassing RLS when reading quota
function createAdminClient() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // For authenticated users: read directly from monthly_usage table
      // 1) Check subscription for plan type
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, plan_type')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      const isPayingUser = !subError && !!subscription
      const planType = (subscription as any)?.plan_type || 'free'
      const monthlyLimit = isPayingUser ? 100 : 5

      // 2) Get current month usage
      const currentDate = new Date()
      const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      
      const { data: usageData, error: usageError } = await supabase
        .from('monthly_usage')
        .select('analysis_count')
        .eq('user_id', user.id)
        .eq('month_year', monthYear)
        .single()

      if (usageError) {
        // No usage record yet -> full allowance
        return Response.json({ remaining: monthlyLimit }, { status: 200 })
      }

      const analysisCount = (usageData as any)?.analysis_count || 0
      const remaining = analysisCount
      
      return Response.json({ remaining }, { status: 200 })
    } else {
      // For guests: use admin client to bypass RLS and read monthly_usage directly
      const cookieStore = await cookies()
      const guestFingerprint = cookieStore.get('guest_fingerprint')?.value || null
      
      if (!guestFingerprint) {
        // No fingerprint yet -> full guest allowance
        return Response.json({ remaining: 5 }, { status: 200 })
      }

      // Use admin client to bypass RLS
      const adminClient = createAdminClient()
      const currentDate = new Date()
      const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      
      const { data: guestUsageData, error: guestUsageError } = await adminClient
        .from('monthly_usage')
        .select('analysis_count')
        .eq('guest_fingerprint', guestFingerprint)
        .eq('month_year', monthYear)
        .single()

      if (guestUsageError) {
        // No usage record yet -> full guest allowance
        return Response.json({ remaining: 5 }, { status: 200 })
      }

      const analysisCount = (guestUsageData as any)?.analysis_count || 0
      const remaining = analysisCount
      
      return Response.json({ remaining }, { status: 200 })
    }
  } catch {
    // Silent error handling
    return Response.json({ remaining: 0 }, { status: 200 })
  }
}


