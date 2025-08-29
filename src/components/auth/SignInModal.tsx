"use client";

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { AUTH_CALLBACK_PATH, RETURN_TO_PARAM, AUTH_FLAG_PARAM, UMAMI_EVENTS } from '@/lib/constants';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const titleId = useMemo(() => 'sign-in-title', []);
  const supabase = createClient();

  // Focus email input on open
  useEffect(() => {
    if (isOpen) {
      // Reset transient error when reopening
      setError(null);
      setTimeout(() => {
        const el = document.getElementById('sign-in-email') as HTMLInputElement | null;
        el?.focus();
      }, 0);
    } else {
      // Reset state when closing
      setStatus('idle');
      setEmail('');
      setError(null);
    }
  }, [isOpen]);

  // Close on Escape when not sending
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'sending') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, status, onClose]);

  const buildReturnTo = (): string => {
    if (typeof window === 'undefined') return '/report';
    const url = new URL(window.location.href);
    // Ensure auth=1 param
    url.searchParams.set(AUTH_FLAG_PARAM, '1');
    return url.pathname + (url.search ? url.search : '');
  };

  const handleSend = async (): Promise<void> => {
    const trimmed = (email || '').trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      (window as any).umami?.track(UMAMI_EVENTS.signup_started);
      setStatus('sending');
      setError(null);

      const return_to = buildReturnTo();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirect = `${origin}${AUTH_CALLBACK_PATH}?${RETURN_TO_PARAM}=${encodeURIComponent(return_to)}`;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: redirect,
        },
      });

      if (signInError) {
        throw signInError;
      }

      setStatus('sent');
    } catch (e) {
      setStatus('error');
      setError('Invalid email or too many attempts, please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="fixed inset-0 bg-black/60" aria-hidden="true"></div>
      <div className="relative z-10 w-full max-w-md mx-4 rounded-[var(--radius)] bg-card border border-accent-1 shadow-xl">
        <div className="p-6 md:p-8">
          <h1 id={titleId} className="mb-2 text-xl font-semibold">Sign in to download your report</h1>
          {status !== 'sent' && (
            <p className="text-sm text-foreground/80">Enter your email to get a sign-in link. No password needed.</p>
          )}

          {status !== 'sent' && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sign-in-email" className="block text-sm">Email</Label>
                <Input
                  id="sign-in-email"
                  name="sign-in-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'sending'}
                />
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <div className="flex gap-3">
                <Button onClick={handleSend} disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send link'}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={status === 'sending'}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {status === 'sent' && (
            <div className="mt-6 space-y-4">
              <div className="rounded-[var(--radius)] border border-accent-1 bg-surface p-4 text-sm">
                Check your inbox. You can close this window.
              </div>
              <div className="flex gap-3">
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignInModal;


