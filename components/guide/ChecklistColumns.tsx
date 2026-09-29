import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { CHECKLIST, type Effect } from '../../content/checklist.ts';

const COLUMNS: { effect: Effect; title: string; Icon: typeof ArrowUp }[] = [
  { effect: 'raises', title: 'Raise the ratio', Icon: ArrowUp },
  { effect: 'neutral', title: 'Little or no change', Icon: Minus },
  { effect: 'lowers', title: 'Lower the ratio', Icon: ArrowDown },
];

/** The 23 checklist items, grouped by how meeting each one moves the data-ink ratio. */
const ChecklistColumns: React.FC = () => (
  <figure className="my-10 md:my-12" aria-label="Data Visualization Checklist items grouped by their effect on the data-ink ratio">
    <div className="grid gap-8 md:grid-cols-[1fr_1.35fr_1fr] md:gap-10">
      {COLUMNS.map(({ effect, title, Icon }) => {
        const items = CHECKLIST.filter((c) => c.effect === effect);
        return (
          <div key={effect}>
            <p className="flex items-baseline gap-2 pb-2 border-b border-ink/80 font-sans">
              <Icon size={15} className="self-center text-ink" aria-hidden="true" />
              <span className="text-[0.9375rem] font-semibold text-ink">{title}</span>
              <span className="ml-auto text-[0.9375rem] tabular-nums text-muted">{items.length}</span>
            </p>
            <ul className="mt-3 space-y-1.5 font-sans text-[0.8125rem] leading-snug text-ink-2">
              {items.map((c) => (
                <li key={c.item}>{c.item}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
    <figcaption className="mt-6 font-sans text-xs text-muted max-w-2xl">
      Items from Stephanie Evergreen’s Data Visualization Checklist, scored by their typical effect on the ratio when met, in{' '}
      <cite>Balancing clarity and clutter</cite>.
    </figcaption>
  </figure>
);

export default ChecklistColumns;
