'use client';

import Link from 'next/link';
import { useState } from 'react';
import FeedbackDialog from './FeedbackDialog';

export default function Header() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <header className="max-w-[960px] mx-auto w-full px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-black hover:text-black no-underline">
          <h1 className="text-2xl font-semibold m-0">Ride Every Road</h1>
        </Link>
        <button
          onClick={() => setFeedbackOpen(true)}
          className="px-4 py-2 bg-[#ff5722] text-white rounded shadow hover:bg-[#e64a19] transition-colors"
        >
          Give Feedback!
        </button>
      </header>
      {feedbackOpen && <FeedbackDialog onClose={() => setFeedbackOpen(false)} />}
    </>
  );
}
