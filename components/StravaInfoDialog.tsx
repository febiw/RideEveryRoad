'use client';

import Dialog from './Dialog';

interface StravaInfoDialogProps {
  onClose: () => void;
}

export default function StravaInfoDialog({ onClose }: StravaInfoDialogProps) {
  return (
    <Dialog title="Strava API Brand Guidelines Disclaimer" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm">
          This is not an official Strava application, it has not been developed by, nor is sponsored
          or endorsed by Strava.
        </p>
        <p className="text-sm">
          The Strava name and logos are all protected by applicable trademark, copyright and
          intellectual property laws.
        </p>
        <p className="text-sm">
          Strava reserves the right to cancel, modify or change these guidelines or the Strava API
          Agreement at its sole discretion.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm">Visit the <em>Strava Developers Site</em></span>
          <a
            href="https://developers.strava.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff5722] hover:text-[#e64a19]"
          >
            ↗
          </a>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  );
}
