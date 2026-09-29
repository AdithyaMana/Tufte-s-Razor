import React from 'react';
import { X } from 'lucide-react';
import { InkKey } from '../guide/InkReadout.tsx';
import { useInkLens } from './inkLens.ts';

/** While the ink map is on: what the colours mean, on the charts and on the page itself. */
const InkLensLegend: React.FC = () => {
  const { on, toggle } = useInkLens();
  if (!on) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none px-3 pb-3 sm:pb-4">
      <div
        role="region"
        aria-label="Ink map legend"
        className="pointer-events-auto mx-auto w-fit max-w-full rounded-md bg-paper/95 backdrop-blur-md border border-line px-4 py-2.5 font-sans shadow-[0_1px_12px_rgb(0_0_0/0.08)]"
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0">
            <InkKey />
            <p className="mt-1 text-xs leading-snug text-content-2">
              On this page too: the words are the data; menus, controls and rules are non-data ink.
            </p>
          </div>
          <button type="button" onClick={toggle} className="shrink-0 p-0.5 rounded-sm text-chrome hover:text-content" aria-label="Turn off the ink map">
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InkLensLegend;
