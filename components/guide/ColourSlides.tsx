import React, { useState } from 'react';
import { presetSpec } from '../../ink/presets.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { SlideNav, useSlideGestures } from './controls.tsx';
import { pct } from './format.ts';
import { InkMeter } from './InkReadout.tsx';
import { useInkStatsList } from './useInk.ts';

// The article's eight colour variations. Captions paraphrase its notes.
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

const NOTE = 'Data-ink ratio under each name. These keep the article’s colours in dark mode, so they can be compared like for like.';

// These specimens reproduce the article's colours, so they ignore the site theme.
const SPECS = VARIANTS.map((v) => presetSpec(v.id, false));

/** The article's colour variations, one at a time, each compared with plain blue on white. */
const ColourSlides: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [index, setIndex] = useState(0);
  const { go, props: gestures } = useSlideGestures(index, VARIANTS.length, setIndex);
  const stats = useInkStatsList(SPECS);
  const variant = VARIANTS[index];
  const reference = index === 0 ? null : { label: 'A1', stats: stats[0] };

  return (
    <figure
      className={`font-sans ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="The article’s eight colour variations of one chart, one at a time"
      {...gestures}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-10 items-center">
        <ChartCanvas key={variant.id} spec={SPECS[index]} label={`Variation ${variant.id}: ${variant.caption}`} inspectable />
        <div aria-live="polite">
          <p className="font-serif text-4xl leading-none text-content">{variant.id}</p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-content-2">{variant.caption}</p>
          <InkMeter stats={stats[index]} scale={Math.max(...stats.map((s) => s.total))} reference={reference} className="mt-5" />
          <SlideNav index={index} count={VARIANTS.length} onGo={go} noun="version" className="mt-6" />
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-4 gap-1.5 max-w-xl" aria-label="Jump to a version">
        {VARIANTS.map((v, i) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={i === index ? 'true' : undefined}
              className={`w-full min-h-11 rounded-sm border px-2 py-1.5 text-left transition-colors ${
                i === index ? 'border-content text-content' : 'border-line text-content-2 hover:border-line-2 hover:text-content'
              }`}
            >
              <span className="block text-[0.8125rem] font-semibold">{v.id}</span>
              <span className="block text-xs tabular-nums">{pct(stats[i].ratio)}</span>
            </button>
          </li>
        ))}
      </ul>
      <figcaption className="mt-4 text-xs text-content-2 max-w-2xl">{NOTE}</figcaption>
    </figure>
  );
};

export default ColourSlides;
