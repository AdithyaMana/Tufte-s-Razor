import React, { useMemo } from 'react';
import { computeLayout } from '../../../ink/layout.ts';
import { measureText } from '../../../ink/measure.ts';
import { applyPreset, DEFAULT_LOOK, PRESETS, resolveSpec, type Shape } from '../../../ink/presets.ts';
import { useIsDark } from '../../site/theme.ts';
import { pct } from '../format.ts';
import ScrollStory from '../ScrollStory.tsx';
import StoryFigure from '../StoryFigure.tsx';
import { useChartFontsReady, useInkStatsList } from '../useInk.ts';

const presetShape = (id: string) => applyPreset(PRESETS.find((p) => p.id === id)!).shape;

// The article's revisions, A to C, plus one step too far.
const SHAPES: Shape[] = [
  presetShape('redundancy-a'),
  presetShape('redundancy-b'),
  presetShape('redundancy-c'),
  { ...presetShape('redundancy-a'), gridlines: false, valueLabels: 'none', dataLabels: false },
];

/** Five bars, three values: say each one once. */
const RedundancyStory: React.FC = () => {
  const isDark = useIsDark();
  const fontsReady = useChartFontsReady();
  const specs = useMemo(() => SHAPES.map((shape) => resolveSpec(shape, DEFAULT_LOOK, isDark)), [isDark]);
  const stats = useInkStatsList(specs);
  const first = useMemo(() => computeLayout(specs[0], measureText), [specs, fontsReady]);
  const r = (i: number) => <strong className="font-bold tabular-nums text-echo">{pct(stats[i].ratio)}</strong>;
  const nonDataCut = 1 - stats[1].nonData / stats[0].nonData;

  const steps = [
    <p>
      Five bars, but only three different values: 9, 7 and 5. To describe them, this default chart draws {first.gridValues.length}{' '}
      gridlines and {first.labelValues.length} axis labels. Its ratio: {r(0)}.
    </p>,
    <p>
      Print each value on its bar and the gridlines can go; the axis keeps only its two ends. Nothing is lost, and the non-data ink
      falls by {Math.round(nonDataCut * 100)}%. The ratio: {r(1)}.
    </p>,
    <p>Sort the bars from tallest to shortest, and mark on the axis only the values that occur: {r(2)}.</p>,
    <p>
      Take away every value label and the ratio rises again, to {r(3)}. But now nothing says what the bars measure. That ink was
      doing a job.
    </p>,
  ];

  return (
    <ScrollStory
      label="A bar chart with its repeated labels and lines removed step by step"
      steps={steps}
      figure={(step) => (
        <StoryFigure
          spec={specs[step]}
          stats={stats[step]}
          scale={stats[0].total}
          reference={step > 0 ? { label: 'the default', stats: stats[0] } : null}
        />
      )}
    />
  );
};

export default RedundancyStory;
