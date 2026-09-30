import React from 'react';
import { useInkMap } from '../site/inkMap.ts';
import { Swatch } from './InkReadout.tsx';

const REVEAL = [
  {
    kind: 'data',
    text: (
      <>
        The words are this page’s <strong className="font-bold">data-ink</strong>: what you came to read.
      </>
    ),
  },
  {
    kind: 'redundant',
    text: (
      <>
        The numbers that repeat what a chart already shows are <strong className="font-bold">repeated data-ink</strong>.
      </>
    ),
  },
  {
    kind: 'nonData',
    text: (
      <>
        Menus, buttons, rules and labels are <strong className="font-bold">non-data ink</strong>: needed, but kept in the background.
      </>
    ),
  },
] as const;

const Explanation: React.FC = () => (
  <>
    <ul className="space-y-2">
      {REVEAL.map(({ kind, text }) => (
        <li key={kind} className="grid grid-cols-[1em_minmax(0,1fr)] gap-x-2.5">
          <span className="pt-[0.1em]">
            <Swatch kind={kind} />
          </span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
    <p className="text-content-2">
      Treat this as an analogy, since a page isn’t a chart and words aren’t data. The question still works for anything you design:
      what is each mark doing for the reader?
    </p>
  </>
);

/** The last chart in the guide is the page itself: its ink, by the same three kinds. */
const PageReveal: React.FC = () => {
  const { page, setPage } = useInkMap();

  const button = (
    <button
      type="button"
      onClick={() => setPage(!page)}
      aria-pressed={page}
      className="mt-6 inline-flex items-center gap-3 min-h-12 rounded-md bg-control px-5 font-sans text-[0.9375rem] font-medium text-paper hover:bg-control/85 transition-colors"
    >
      <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
        <span className="w-[3px] h-3.5 bg-ink-data" />
        <span className="w-[3px] h-2.5 bg-ink-redundant" />
        <span className="w-[3px] h-1.5 bg-ink-nondata" />
      </span>
      {page ? 'Hide this page’s ink' : 'Show this page’s ink'}
    </button>
  );

  return (
    <div className="max-w-[38rem]">
      <div className="article">
        <p>
          A web page is ink on paper too. We designed this one by the guide’s own rule: the reading gets the ink, and everything else
          stays as quiet as it can while still doing its job. Want to see its ink?
        </p>
      </div>
      {button}
      <div aria-live="polite">
        {page && (
          <div className="article mt-8">
            <Explanation />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageReveal;
