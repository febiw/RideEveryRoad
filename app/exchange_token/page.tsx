'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCode } from '@/lib/strava';
import { Suspense } from 'react';
import Spinner from '@/components/Spinner';

function ExchangeTokenHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

    handleExchange();
  }, [router, searchParams]);

  return <Spinner />;
}

export default function ExchangeTokenPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ExchangeTokenHandler />
    </Suspense>
  );
}
