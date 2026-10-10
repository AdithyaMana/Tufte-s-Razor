import React from 'react';
import { useInkMap } from '../site/inkMap.ts';
import { MarginNote, Prose } from './Article.tsx';
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
        The numbers that repeat what a chart already shows are <strong className="font-bold">redundant data-ink</strong>.
      </>
    ),
  },
  {
    kind: 'nonData',
    text: (
      <>
        Menus, buttons and rules are <strong className="font-bold">non-data ink</strong>: needed, but kept in the background.
      </>
    ),
  },
] as const;

const Explanation: React.FC = () => (
  <>
    <ul className="mt-8 space-y-2">
      {REVEAL.map(({ kind, text }) => (
        <li key={kind} className="grid grid-cols-[1em_minmax(0,1fr)] gap-x-2.5">
          <span className="pt-[0.1em]">
            <Swatch kind={kind} />
          </span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
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
      {page ? 'Hide this page’s data-pixels' : 'Show this page’s data-pixels'}
    </button>
  );

  return (
    <Prose
      notes={
        <MarginNote title="An analogy, not a measurement">
          A web page isn’t a chart and words aren’t numbers, but question still works for anything you design: what is each
          ink/pixel doing for the reader?
        </MarginNote>
      }
    >
      <p>
        A web page is ink on paper too (or at least pixels on a display). We tried to design this one using the same principles:
        optimize the data-pixels while making sure that the information is still easy to understand. How did we do?
      </p>
      {button}
      <div aria-live="polite">{page && <Explanation />}</div>
    </Prose>
  );
};

export default PageReveal;
