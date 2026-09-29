import React, { useMemo, useState } from 'react';
import { measureChart } from '../../ink/measure.ts';
import { presetSpec } from '../../ink/presets.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { pct } from './format.ts';
import InkReadout from './InkReadout.tsx';
import { InkMapLegend, InkMapToggle, LabFrame } from './LabFrame.tsx';
import { useChartFontsReady, useInkStats } from './useInk.ts';

// Captions paraphrase the article's notes on each figure.
const VARIANTS: { id: string; caption: string }[] = [
  { id: 'A1', caption: 'A typical bar chart: blue bars on a plain white background.' },
  {
    id: 'B1',
    caption:
      'The same chart on a pale blue background. The ratio is identical: the background is the paper, whatever its colour, so the data and non-data pixels are unchanged.',
  },
  {
    id: 'C1',
    caption:
      'Only the plot area is filled, inside a white border. Now thousands of non-data pixels appear, for information a thin box (A2) could carry.',
  },
  {
    id: 'D1',
    caption:
      'Another way to draw C1: white bars on a dark plot area. Three colours give enough contrast to read it — and the ink is exactly that of C1.',
  },
  {
    id: 'A2',
    caption:
      'A1 with a box around the plot area, often added to separate the data from a legend. The box takes few pixels, so the ratio barely moves.',
  },
  {
    id: 'B2',
    caption:
      'B1 with its colours reversed. The ratio doesn’t change, but the text and axes have to turn light to stay legible.',
  },
  {
    id: 'C2',
    caption:
      'C1 reversed: a white plot area on a pale chart. The bars gain contrast, but the whole outer area of the chart now gets unnecessary emphasis.',
  },
  {
    id: 'D2',
    caption:
      'A strong outline makes pale bars clearer, but it is extra data-ink that better fill and background colours would have made unnecessary.',
  },
];

const ColourLab: React.FC = () => {
  const isDark = useIsDark();
  const fontsReady = useChartFontsReady();
  const [selected, setSelected] = useState('C1');
  const [inkMap, setInkMap] = useState(false);

  // These specimens reproduce the article's colours, so they ignore the site theme.
  const specs = useMemo(() => Object.fromEntries(VARIANTS.map((v) => [v.id, presetSpec(v.id, false)])), []);
  const ratios = useMemo(
    () => Object.fromEntries(VARIANTS.map((v) => [v.id, measureChart(specs[v.id]).ratio])),
    [specs, fontsReady],
  );
  const spec = specs[selected];
  const stats = useInkStats(spec);
  const reference = useInkStats(specs.A1);
  const variant = VARIANTS.find((v) => v.id === selected)!;

  return (
    <LabFrame label="Interactive · Colour and background">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4" role="group" aria-label="The article's eight colour variations">
        {VARIANTS.map((v) => {
          const active = v.id === selected;
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(v.id)}
              className={`group text-left rounded-lg p-1.5 transition-colors ${active ? 'bg-ink/[0.06] ring-1 ring-ink' : 'hover:bg-ink/[0.04]'}`}
            >
              <ChartCanvas spec={specs[v.id]} inkMap={inkMap && active} label={`Variation ${v.id}`} />
              <span className="mt-1.5 flex items-baseline justify-between px-0.5 font-sans">
                <span className={`text-xs font-semibold ${active ? 'text-ink' : 'text-ink-2'}`}>{v.id}</span>
                <span className="text-xs tabular-nums text-muted">{pct(ratios[v.id])}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-rule grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-8 lg:gap-10">
        <div className="min-w-0">
          <ChartCanvas spec={spec} inkMap={inkMap} />
          {inkMap && <InkMapLegend className="mt-3" />}
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <p className="font-serif text-lg leading-snug text-ink max-w-xl">
              <span className="font-sans text-xs font-semibold text-muted mr-2 align-middle">{variant.id}</span>
              {variant.caption}
            </p>
            <InkMapToggle checked={inkMap} onChange={setInkMap} />
          </div>
        </div>
        <InkReadout stats={stats} reference={selected === 'A1' ? null : { label: 'A1', stats: reference }} />
      </div>
      {isDark && (
        <p className="mt-6 font-sans text-xs text-muted">These specimens keep the article’s colours in dark mode, so they can be compared like for like.</p>
      )}
    </LabFrame>
  );
};

export default ColourLab;
