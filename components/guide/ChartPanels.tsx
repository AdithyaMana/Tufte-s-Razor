import React from 'react';
import type { InkGroup } from '../../ink/render.ts';
import type { ChartSpec } from '../../ink/spec.ts';
import { useIsArticle } from '../site/view.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { pct } from './format.ts';
import { useInkStatsList } from './useInk.ts';

export interface Panel {
  spec: ChartSpec;
  /** A short name, set beside the chart's ratio. */
  label: string;
  caption?: React.ReactNode;
  highlight?: readonly InkGroup[] | null;
  inkMap?: boolean;
  /** Leave out the ratio, e.g. where it would give away the point of the panel. */
  hideRatio?: boolean;
  /** What a screen reader hears for the chart; by default its values. */
  description?: string;
}

// One chart per row on a phone: side by side, their labels shrink to a few pixels.
const COLUMNS = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  6: 'grid-cols-1 sm:grid-cols-3',
} as const;

interface ChartPanelsProps {
  panels: Panel[];
  /** Names the whole figure for screen readers. */
  label: string;
  columns?: keyof typeof COLUMNS;
  /** A note under the whole figure. */
  note?: React.ReactNode;
  /** Let readers point at the charts' parts (only in the interactive view). */
  inspectable?: boolean;
  className?: string;
}

/**
 * Small multiples: several versions of a chart side by side, each with its data-ink ratio,
 * so the eye can do the comparing.
 */
const ChartPanels: React.FC<ChartPanelsProps> = ({ panels, label, columns = 4, note, inspectable = false, className = '' }) => {
  const article = useIsArticle();
  const stats = useInkStatsList(panels.map((p) => p.spec));
  return (
    <figure className={`my-10 md:my-14 ${columns === 2 ? 'max-w-4xl' : ''} ${className}`} aria-label={label}>
      <div className={`grid ${COLUMNS[columns]} gap-x-5 gap-y-8 lg:gap-x-8`}>
        {panels.map((panel, i) => (
          <div key={i} className="min-w-0">
            <ChartCanvas
              spec={panel.spec}
              highlight={panel.highlight}
              inkMap={panel.inkMap}
              inspectable={inspectable && !article}
              label={panel.description}
            />
            <p className="mt-2 flex items-baseline justify-between gap-3 font-sans">
              <span className="text-[0.8125rem] font-semibold leading-snug text-content">{panel.label}</span>
              {!panel.hideRatio && (
                <span className="text-[0.8125rem] font-semibold tabular-nums text-echo">{pct(stats[i].ratio)}</span>
              )}
            </p>
            {panel.caption && <div className="mt-0.5 font-sans text-xs leading-snug text-content-2">{panel.caption}</div>}
          </div>
        ))}
      </div>
      {note && <figcaption className="mt-6 max-w-2xl font-sans text-xs leading-relaxed text-content-2">{note}</figcaption>}
    </figure>
  );
};

export default ChartPanels;
