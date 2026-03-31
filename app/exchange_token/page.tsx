'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCode } from '@/lib/strava';
import { Suspense } from 'react';
import Spinner from '@/components/Spinner';

function ExchangeTokenHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleExchange() {
      const code = searchParams.get('code');
      const scope = searchParams.get('scope');

      if (!code || !scope) {
        throw new Error('Missing code or scope from Strava OAuth');
      }

      const scopes = scope.split(',');
      const required = ['read', 'activity:read_all', 'activity:read'];
      const sufficient = required.every((s) => scopes.includes(s));

      if (!sufficient) {
        throw new Error('Scopes prescribed are insufficient');
      }

      await exchangeCode(code);
      router.push('/map');
    }

    handleExchange().catch((err) => {
      console.error('Token exchange failed:', err);
      setError(err instanceof Error ? err.message : String(err));
    });
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <p className="text-red-500 font-semibold">Authentication failed</p>
        <p className="text-sm text-gray-400 max-w-md text-center">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Try again
        </button>
      </div>
    );
  }

  return <Spinner />;
}

export default function ExchangeTokenPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ExchangeTokenHandler />
    </Suspense>
  );
}
