"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { RETURN_TO_PARAM, UMAMI_EVENTS } from '@/lib/constants';
import { sanitizeReturnTo } from '@/utils/urlGuards';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // If a magic link code is present, exchange it for a session first
        const code = searchParams.get('code');
        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch (e) {
            // ignore, fallback to getSession
          }
        }

        // Wait for session to be ready
        const { data: sessionData } = await supabase.auth.getSession();

        // If no session yet, briefly wait and retry once (supabase may finalize)
        if (!sessionData?.session) {
          await new Promise((r) => setTimeout(r, 300));
        }

        // Optional: try to call ensure profile endpoint (not implemented yet)
        try {
          // Placeholder: if you add /api/profile/ensure, switch to that
          (window as any).umami?.track(UMAMI_EVENTS.login_success);
        } catch {
          (window as any).umami?.track(UMAMI_EVENTS.login_success);
        }

        const r = searchParams.get(RETURN_TO_PARAM);
        const returnTo = sanitizeReturnTo(r) || '/';
        if (!cancelled) router.replace(returnTo);
      } catch (e) {
        // On error, redirect home as a safe fallback
        if (!cancelled) router.replace('/');
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="animate-pulse text-sm opacity-80">Signing you in…</div>
      </div>
    </div>
  );
}


