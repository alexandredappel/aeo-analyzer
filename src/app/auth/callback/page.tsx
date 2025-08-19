import { Suspense } from 'react';
import CallbackRunner from './CallbackRunner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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


