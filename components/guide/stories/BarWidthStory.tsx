import React, { useMemo } from 'react';
import { useIsDark } from '../../site/theme.ts';
import { useIsArticle } from '../../site/view.ts';
import { barWidthSpec } from '../BarWidthLab.tsx';
import ChartPanels from '../ChartPanels.tsx';
import { pct } from '../format.ts';
import Guess from '../Guess.tsx';
import ScrollStory from '../ScrollStory.tsx';
import StoryFigure from '../StoryFigure.tsx';
import { useTween } from '../useAnimator.ts';
import { useInkStats, useInkStatsList } from '../useInk.ts';

// Bar width for each step: balanced (half of each slot), then the article's wide and thin examples, a hairline, and back.
const WIDTHS = [0.5, 0.9, 0.16, 0, 0.5];

const Figure: React.FC<{ target: number; widest: number }> = ({ target, widest }) => {
  const isDark = useIsDark();
  // Round the eased width to whole steps, so each frame's count can be cached.
  const width = Math.round(useTween(target) * 200) / 200;
  const spec = useMemo(() => ({ ...barWidthSpec(isDark), barWidth: width }), [isDark, width]);
  const stats = useInkStats(spec);
  return <StoryFigure spec={spec} stats={stats} scale={widest} />;
};

/** Wider bars, lower ratio: guessed first, then shown. */
const BarWidthStory: React.FC = () => {
  const isDark = useIsDark();
  const article = useIsArticle();
  const specs = useMemo(() => [...WIDTHS, 1].map((barWidth) => ({ ...barWidthSpec(isDark), barWidth })), [isDark]);
  const stats = useInkStatsList(specs);
  const r = (i: number) => <strong className="font-bold tabular-nums text-echo">{pct(stats[i].ratio)}</strong>;

  const steps = [
    <Guess
      question="Bar widths can be made wider or thinner. What happens to the data-ink ratio as they get wider?"
      options={[
        { value: 'up', label: 'It goes up' },
        { value: 'down', label: 'It goes down' },
        { value: 'same', label: 'It stays the same' },
      ]}
      answer="down"
      reveal="A bar represents a value with its height. Widening a bar uses more ink to encode the same value."
    />,
    <p>
      Wide bars: the same five values, drawn with far more ink. The ratio falls to {r(1)}.
    </p>,
    <p>Thin bars: less ink for the same values, so the ratio rises, to {r(2)}.</p>,
    <p>
      At a hairline width the ratio peaks, at {r(3)}. But look at the chart: bars this thin are easy to miss, and they make reading
      the value and any visual comparison more difficult.
    </p>,
    <p>
      So aim for something between the two: bars wide enough to see, with gaps wide enough to tell them apart. Like these, at{' '}
      {r(4)}: each bar fills half the space it gets. See how this compares to the default settings for bar width on your
      spreadsheet or charting software.
    </p>,
  ];

  // The reading view uses the same paragraphs without the interactive guess.
  const readingSteps = steps.slice(1);

  const articleFigures = [
    {
      after: 0,
      figure: (
        <ChartPanels
          label="The same chart with wide, balanced, thin and hairline bars"
          panels={[
            { spec: specs[1], label: 'Wide' },
            { spec: specs[0], label: 'Balanced' },
            { spec: specs[2], label: 'Thin' },
            { spec: specs[3], label: 'Hairline' },
          ]}
        />
      ),
    },
  ];

  return (
    <ScrollStory
      label="A bar chart whose bars change width"
      steps={article ? readingSteps : steps}
      articleFigures={articleFigures}
      figure={(step) => <Figure target={WIDTHS[step]} widest={stats[WIDTHS.length].total} />}
    />
  );
};

export default BarWidthStory;
