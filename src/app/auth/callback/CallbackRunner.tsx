"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { RETURN_TO_PARAM, UMAMI_EVENTS } from '@/lib/constants';
import { sanitizeReturnTo } from '@/utils/urlGuards';

export default function CallbackRunner() {
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

        // Determine signup vs login based on presence of profile
        try {
          const { data: userData } = await supabase.auth.getUser();
          const user = userData?.user;
          if (user) {
            // Check if profile exists
            const { data: existingList, error: selectError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .limit(1);

            const exists = Array.isArray(existingList) && existingList.length > 0;

            if (exists) {
              try { (window as any).umami?.track(UMAMI_EVENTS.login_success); } catch {}
            } else {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([{ id: user.id, email: user.email }]);

              if (!insertError) {
                try { (window as any).umami?.track(UMAMI_EVENTS.signup_success); } catch {}
              } else {
                const code = (insertError as any)?.code || '';
                const message = ((insertError as any)?.message || '').toString();
                const isDuplicate = code === '23505' || /duplicate/i.test(message);
                try { (window as any).umami?.track(UMAMI_EVENTS.login_success); } catch {}
              }
            }
          } else {
            // No user info; fallback to login_success when session exists
            try { (window as any).umami?.track(UMAMI_EVENTS.login_success); } catch {}
          }
        } catch {
          // If any error while checking/inserting profile, still consider login success
          try { (window as any).umami?.track(UMAMI_EVENTS.login_success); } catch {}
        }

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


