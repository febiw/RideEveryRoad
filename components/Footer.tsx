'use client';

import Image from 'next/image';
import { useState } from 'react';
import StravaInfoDialog from './StravaInfoDialog';

export default function Footer() {
  const [stravaInfoOpen, setStravaInfoOpen] = useState(false);

  return (
    <>
      <footer className="max-w-[960px] mx-auto w-full px-4 py-3 flex items-center gap-4">
        <button onClick={() => setStravaInfoOpen(true)} className="bg-transparent border-none cursor-pointer p-0">
          <Image src="/PoweredByStrava.svg" alt="Powered by Strava" width={160} height={40} />
        </button>
        <a href="https://github.com/adj97/RideEveryRoad" target="_blank" rel="noopener noreferrer">
          <Image src="/GitHubRepo.svg" alt="GitHub Repository" width={40} height={40} />
        </a>
      </footer>
      {stravaInfoOpen && <StravaInfoDialog onClose={() => setStravaInfoOpen(false)} />}
    </>
  );
}
