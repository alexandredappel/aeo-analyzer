"use client";

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { RETURN_TO_PARAM, UMAMI_EVENTS } from '@/lib/constants';
import { sanitizeReturnTo } from '@/utils/urlGuards';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function CallbackRunner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const code = searchParams.get('code');
        if (code) {
          try { await supabase.auth.exchangeCodeForSession(code); } catch {}
        }
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) { await new Promise(r => setTimeout(r, 300)); }

        try { (window as any).umami?.track(UMAMI_EVENTS.login_success); } catch {}

        const r = searchParams.get(RETURN_TO_PARAM);
        const returnTo = sanitizeReturnTo(r) || '/';
        if (!cancelled) router.replace(returnTo);
      } catch {
        if (!cancelled) router.replace('/');
      }
    };
    run();

    return () => { cancelled = true; };
  }, [router, searchParams]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="animate-pulse text-sm opacity-80">Signing you in…</div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-pulse text-sm opacity-80">Signing you in…</div>
        </div>
      </div>
    }>
      <CallbackRunner />
    </Suspense>
  );
}


