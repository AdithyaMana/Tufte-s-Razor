import React, { useState } from 'react';
import { Check } from './guide/controls.tsx';

interface DisclaimerModalProps {
  onConfirm: (dontShowAgain: boolean) => void;
}

/** Shown once after a first analysis: what the numbers are, and what they aren't. */
const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onConfirm }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
      <div className="absolute inset-0 bg-paper/80 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-md border border-line bg-paper p-6 md:p-8 shadow-[0_8px_40px_rgb(0_0_0/0.08)]">
        <h2 id="disclaimer-title" className="font-serif text-2xl text-content">
          About these numbers
        </h2>
        <div className="mt-3 space-y-3 font-sans text-sm leading-relaxed text-content-2">
          <p>
            This analysis uses an experimental mix of AI and pixel counting. Treat its results as estimates for learning and for
            comparing versions of a chart, not as a verdict.
          </p>
          <p>Busy backgrounds, gradients, 3D effects and low contrast can all throw the count off. Trust your own eye, too.</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Check label="Don’t show this again" checked={dontShowAgain} onChange={setDontShowAgain} />
          <button
            type="button"
            onClick={() => onConfirm(dontShowAgain)}
            className="rounded-sm bg-control px-4 py-2 font-sans text-sm font-medium text-paper hover:bg-control/85 transition-colors"
            autoFocus
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
