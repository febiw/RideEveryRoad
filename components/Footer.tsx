'use client';

import Image from 'next/image';
import { useState } from 'react';
import StravaInfoDialog from './StravaInfoDialog';

export default function Footer() {
  const [stravaInfoOpen, setStravaInfoOpen] = useState(false);

  return (
    <>
      <footer className="max-w-[960px] mx-auto w-full px-4 flex items-center gap-4">
        <button onClick={() => setStravaInfoOpen(true)} className="bg-transparent border-none cursor-pointer p-0">
          <Image src="/PoweredByStrava.svg" alt="Powered by Strava" width={160} height={40} />
        </button>
      </footer>
      {stravaInfoOpen && <StravaInfoDialog onClose={() => setStravaInfoOpen(false)} />}
    </>
  );
}
