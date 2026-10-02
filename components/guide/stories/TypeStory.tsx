import React, { useMemo } from 'react';
import type { InkStats } from '../../../ink/measure.ts';
import { applyPreset, DEFAULT_LOOK, PRESETS, resolveSpec } from '../../../ink/presets.ts';
import { DEFAULT_LABEL_SIZE, DEFAULT_TITLE_SIZE } from '../../../ink/spec.ts';
import { useIsDark } from '../../site/theme.ts';
import { useIsArticle } from '../../site/view.ts';
import ChartPanels from '../ChartPanels.tsx';
import { pct } from '../format.ts';
import Guess from '../Guess.tsx';
import ScrollStory from '../ScrollStory.tsx';
import StoryFigure from '../StoryFigure.tsx';
import { useTween } from '../useAnimator.ts';
import { useInkStats, useInkStatsList } from '../useInk.ts';

// The article's text-size figures: sorted bars in a box, no gridlines.
const baseShape = applyPreset(PRESETS.find((p) => p.id === 'text-b1')!).shape;

// Type scale for each step: the default, bigger, smaller, and back.
const SCALES = [1, 1.8, 0.55, 1];

const sized = (scale: number) => ({
  ...baseShape,
  titleSize: Math.round(DEFAULT_TITLE_SIZE * scale),
  labelSize: Math.round(DEFAULT_LABEL_SIZE * scale),
});

const Figure: React.FC<{ target: number; reference: InkStats; scaleInk: number }> = ({ target, reference, scaleInk }) => {
  const isDark = useIsDark();
  const scale = useTween(target, 420);
  const spec = useMemo(() => resolveSpec(sized(scale), DEFAULT_LOOK, isDark), [scale, isDark]);
  const stats = useInkStats(spec);
  return (
    <StoryFigure
      spec={spec}
      stats={stats}
      scale={scaleInk}
      reference={Math.abs(scale - 1) > 0.01 ? { label: 'the default size', stats: reference } : null}
    />
  );
};

/** Bigger type raises the ratio, and costs the reader attention. */
const TypeStory: React.FC = () => {
  const isDark = useIsDark();
  const article = useIsArticle();
  const specs = useMemo(() => [...SCALES, 2].map((s) => resolveSpec(sized(s), DEFAULT_LOOK, isDark)), [isDark]);
  const stats = useInkStatsList(specs);
  const r = (i: number) => <strong className="font-bold tabular-nums text-echo">{pct(stats[i].ratio)}</strong>;

  const steps = [
    <Guess
      question="Make the title and labels bigger. What happens to the data-ink ratio?"
      options={[
        { value: 'falls', label: 'It falls' },
        { value: 'same', label: 'It barely moves' },
        { value: 'rises', label: 'It rises' },
      ]}
      answer="rises"
      reveal="The title and labels are data-ink, so bigger letters mean more data-ink, and the ratio rises."
    />,
    <p>
      Bigger type: the ratio rises from {r(0)} to {r(1)}. By the numbers, a better chart. But bigger type costs attention: in Lai
      and Morrison’s words, it “takes focus off the data in the chart.”
    </p>,
    <p>Smaller type: the ratio falls to {r(2)}, and now readers “work harder to see the details.”</p>,
    <p>
      So the ratio can’t settle type size. Keep the title larger than the labels, and nothing too small to read at arm’s length,
      whatever the number says.
    </p>,
  ];

  // The reading view: the point first, then the three sizes side by side.
  const readingSteps = [
    <p>Here is one chart with its text at three sizes.</p>,
    <p>
      The title and labels are data-ink, so bigger type raises the ratio, from {r(0)} to {r(1)}. By the numbers, a better chart.
      But bigger type costs attention: in Lai and Morrison’s words, it “takes focus off the data in the chart.”
    </p>,
    <p>Smaller type lowers the ratio to {r(2)}, and now readers “work harder to see the details.”</p>,
    <p>
      So the ratio can’t settle type size. Keep the title larger than the labels, and nothing too small to read at arm’s length,
      whatever the number says.
    </p>,
  ];

  const articleFigures = [
    {
      after: 0,
      figure: (
        <ChartPanels
          columns={3}
          label="The same chart with default, bigger and smaller text"
          panels={[
            { spec: specs[0], label: 'Default' },
            { spec: specs[1], label: 'Bigger' },
            { spec: specs[2], label: 'Smaller' },
          ]}
        />
      ),
    },
  ];

  return (
    <ScrollStory
      label="A bar chart whose text changes size"
      steps={article ? readingSteps : steps}
      articleFigures={articleFigures}
      figure={(step) => <Figure target={SCALES[step]} reference={stats[0]} scaleInk={stats[SCALES.length].total} />}
    />
  );
};

export default TypeStory;
