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

// Bar width for each step: balanced, then the article's wide and thin examples, a hairline, and back.
const WIDTHS = [0.31, 0.9, 0.16, 0, 0.31];

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
      question="Bars can be wide or thin. What happens to the data-ink ratio as they get wider?"
      options={[
        { value: 'up', label: 'It goes up' },
        { value: 'down', label: 'It goes down' },
        { value: 'same', label: 'It stays the same' },
      ]}
      answer="down"
      reveal="A bar’s value is in its length, so extra width is extra ink that says nothing new."
    />,
    <p>
      Wide bars: the same five values, drawn with far more ink. The ratio falls to {r(1)}. The article calls this “unnecessary visual
      clutter.”
    </p>,
    <p>Thin bars: less ink for the same values, so the ratio rises, to {r(2)}.</p>,
    <p>
      At a hairline the ratio peaks, at {r(3)}. But look at the chart: bars this thin are hard to compare, and easy to miss. Very thin
      bars make “visual comparison more difficult.”
    </p>,
    <p>
      So aim between the two: bars wide enough to see, with gaps wide enough to tell them apart.{' '}
      {article ? 'Like the balanced bars above' : 'Like these'}, at {r(4)}.
    </p>,
  ];

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
      steps={steps}
      articleFigures={articleFigures}
      figure={(step) => <Figure target={WIDTHS[step]} widest={stats[WIDTHS.length].total} />}
    />
  );
};

export default BarWidthStory;
