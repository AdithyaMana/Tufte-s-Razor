import React from 'react';
import { CHECKLIST, type Effect } from '../../content/checklist.ts';

const COLUMNS: { effect: Effect; title: string }[] = [
  { effect: 'raises', title: 'Raise the ratio' },
  { effect: 'neutral', title: 'Little or no change' },
  { effect: 'lowers', title: 'Lower the ratio' },
];

/** The 23 checklist items, grouped by how meeting each one moves the data-ink ratio. */
const ChecklistColumns: React.FC = () => (
  <figure className="my-12 md:my-14" aria-label="Data Visualization Checklist items grouped by their effect on the data-ink ratio">
    <div className="grid gap-10 md:grid-cols-[1fr_1.35fr_1fr] md:gap-10">
      {COLUMNS.map(({ effect, title }) => {
        const items = CHECKLIST.filter((c) => c.effect === effect);
        return (
          <div key={effect}>
            <p className="flex items-baseline gap-2 pb-2 border-b border-content/70 font-sans">
              <span className="text-[0.9375rem] font-semibold text-content">{title}</span>
              <span className="ml-auto text-[0.9375rem] font-semibold tabular-nums text-content">{items.length}</span>
            </p>
            <ul className="mt-3 space-y-1.5 font-sans text-[0.8125rem] leading-snug text-content-2">
              {items.map((c) => (
                <li key={c.item}>{c.item}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
    <figcaption className="mt-6 font-sans text-xs text-content-2 max-w-2xl">
      Items from Stephanie Evergreen’s Data Visualization Checklist, scored by their typical effect on the ratio when met, in{' '}
      <cite>Balancing clarity and clutter</cite>.
    </figcaption>
  </figure>
);

export default ChecklistColumns;
