'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getOAuthUrl, hasCachedRefreshToken, refreshTokens } from '@/lib/strava';

export default function LandingPage() {
  const router = useRouter();

  async function startAuthFlow() {
    if (hasCachedRefreshToken()) {
      try {
        await refreshTokens();
        router.push('/map');
        return;
      } catch {
        // Stale or revoked token — fall through to re-auth
      }
    }
    window.location.href = getOAuthUrl();
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 py-8">
      <div className="flex-1 space-y-4">
        <h2 className="text-xl font-semibold">Welcome to ride every road!</h2>
        <p>
          Ever wished you could view all of your strava activities on the same map?
          <br />
          Make sure you always explore new routes!
          <br />
          See how much of the map you have covered ...
        </p>
        <p>To view all of your strava runs, rides, swims and more:</p>
        <button onClick={startAuthFlow} className="bg-transparent border-none cursor-pointer p-0">
          <Image
            src="/ConnectWithStrava.svg"
            alt="Connect with Strava"
            width={200}
            height={48}
            priority
          />
        </button>
      </div>
      <div className="flex-1">
        <Image
          src="/example.png"
          alt="Example map view"
          width={400}
          height={300}
          className="rounded-lg max-w-full h-auto"
          priority
        />
      </div>
    </div>
  );
}
