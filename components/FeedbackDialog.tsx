'use client';

import { useState } from 'react';
import Dialog from './Dialog';

interface FeedbackDialogProps {
  onClose: () => void;
}

export default function FeedbackDialog({ onClose }: FeedbackDialogProps) {
  const [feedbackType, setFeedbackType] = useState('feature');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [toast, setToast] = useState('');

  async function handleSubmit() {
    if (!summary.trim()) {
      setToast('Invalid form, please try again');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    await fetch('https://formspree.io/f/xayvneor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedbackType,
        summary,
        description,
        name,
        timeStamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
    });

    setToast('Thank you, your feedback has been submitted');
    setTimeout(() => {
      setToast('');
      onClose();
    }, 2000);
  }

  return (
    <Dialog title="Submit a new feature request or report a bug!" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Feedback type:</label>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded border ${feedbackType === 'feature' ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-gray-300'}`}
              onClick={() => setFeedbackType('feature')}
            >
              New feature
            </button>
            <button
              className={`px-3 py-1 rounded border ${feedbackType === 'bug' ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-gray-300'}`}
              onClick={() => setFeedbackType('bug')}
            >
              Report a bug
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Summary</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Add the title of your feedback"
            maxLength={100}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Give a bit more detail here"
            maxLength={255}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-gray-400 text-right mt-1">{description.length}/255</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Name (optional)</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Add your name if you like!"
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex justify-between pt-2">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#ff5722] text-white rounded hover:bg-[#e64a19] transition-colors"
          >
            Submit
          </button>
        </div>

        {toast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </Dialog>
  );
}
