import React from 'react';
import { X } from 'lucide-react';
import { InkKey } from '../guide/InkReadout.tsx';
import { useInkMap } from './inkMap.ts';

/** While an ink map is on: what its colours mean, and a way to turn it off. */
const InkMapLegend: React.FC = () => {
  const { charts, page, toggleCharts, setPage } = useInkMap();
  if (!charts && !page) return null;
  const turnOff = () => (page ? setPage(false) : toggleCharts());
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none px-3 pb-3 sm:pb-4">
      <div
        role="region"
        aria-label="Ink map legend"
        className="pointer-events-auto mx-auto w-fit max-w-full rounded-md bg-paper/95 backdrop-blur-md border border-line pl-4 pr-1 py-1.5 font-sans shadow-[0_1px_12px_rgb(0_0_0/0.08)]"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 py-1">
            <InkKey />
            <p className="mt-1 text-xs leading-snug text-content-2">
              {page
                ? 'The page too, as an analogy: the words are the data; menus, controls and rules are non-data ink.'
                : 'Every chart is coloured by kind of ink.'}
            </p>
          </div>
          <button
            type="button"
            onClick={turnOff}
            className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-sm text-chrome hover:text-content"
            aria-label="Turn off the ink map"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InkMapLegend;
