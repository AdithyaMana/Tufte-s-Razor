import React, { useMemo } from 'react';
import { measureChart } from '../../ink/measure.ts';
import { presetSpec } from '../../ink/presets.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { pct } from './format.ts';
import { useChartFontsReady } from './useInk.ts';

// The article's eight colour variations, as small multiples. Captions paraphrase its notes.
const VARIANTS: { id: string; caption: string }[] = [
  { id: 'A1', caption: 'Blue bars on white.' },
  { id: 'B1', caption: 'Pale blue paper: same ink, same ratio.' },
  { id: 'C1', caption: 'A shaded plot area: all of it non-data ink.' },
  { id: 'D1', caption: 'White bars on a dark fill: the same ink as C1.' },
  { id: 'A2', caption: 'A thin box around the plot: barely any ink.' },
  { id: 'B2', caption: 'B1 reversed: same ratio, but text must turn light.' },
  { id: 'C2', caption: 'C1 reversed: the heavy colour now frames the chart.' },
  { id: 'D2', caption: 'Outlined bars: a little extra, repeated ink.' },
];

/** Every variation measured, side by side, so the eye can do the comparing. */
const ColourGrid: React.FC = () => {
  const fontsReady = useChartFontsReady();
  // These specimens reproduce the article's colours, so they ignore the site theme.
  const specs = useMemo(() => Object.fromEntries(VARIANTS.map((v) => [v.id, presetSpec(v.id, false)])), []);
  const ratios = useMemo(
    () => Object.fromEntries(VARIANTS.map((v) => [v.id, measureChart(specs[v.id]).ratio])),
    [specs, fontsReady],
  );

  return (
    <figure className="my-12 md:my-16" aria-label="The article’s eight colour variations of one chart, each measured">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
        {VARIANTS.map((v) => (
          <div key={v.id} className="min-w-0">
            <ChartCanvas spec={specs[v.id]} label={`Variation ${v.id}: ${v.caption}`} />
            <p className="mt-2 flex items-baseline justify-between gap-2 font-sans">
              <span className="text-xs font-semibold text-content">{v.id}</span>
              <span className="text-[0.8125rem] font-semibold tabular-nums text-echo">{pct(ratios[v.id])}</span>
            </p>
            <p className="mt-0.5 font-sans text-xs leading-snug text-content-2">{v.caption}</p>
          </div>
        ))}
      </div>
      <figcaption className="mt-6 font-sans text-xs text-content-2">
        Data-ink ratio under each chart. These keep the article’s colours in dark mode, so they can be compared like for like.
      </figcaption>
    </figure>
  );
};

export default ColourGrid;
