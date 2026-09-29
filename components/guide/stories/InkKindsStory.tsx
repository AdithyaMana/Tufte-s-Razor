import React, { useMemo } from 'react';
import type { InkGroup } from '../../../ink/render.ts';
import { defaultSpec } from '../../../ink/spec.ts';
import { useIsDark } from '../../site/theme.ts';
import { pct, pct1 } from '../format.ts';
import { Swatch } from '../InkReadout.tsx';
import ScrollStory from '../ScrollStory.tsx';
import StoryFigure, { usePointVerb } from '../StoryFigure.tsx';
import { useInkStats } from '../useInk.ts';

const NON_DATA: InkGroup[] = ['plotFill', 'gridlines', 'borders', 'axes', 'title', 'valueLabels', 'categoryLabels'];

// What each step picks out on the chart. An empty list picks out the paper.
const HIGHLIGHTS: (readonly InkGroup[] | null)[] = [['hairlines'], ['barWidth', 'outlines', 'dataLabels'], NON_DATA, [], null];

/** The three kinds of ink, picked out on one chart in turn. */
const InkKindsStory: React.FC = () => {
  const isDark = useIsDark();
  const { verb } = usePointVerb();
  const spec = useMemo(() => ({ ...defaultSpec(isDark), dataLabels: true }), [isDark]);
  const stats = useInkStats(spec);
  const share = (n: number) => <strong className="font-bold tabular-nums text-echo">{pct1(stats.total ? n / stats.total : 0)}</strong>;

  const steps = [
    <>
      <p>Look closely at any chart and every mark on it is one of three kinds of ink. This one has all three.</p>
      <p>
        <Swatch kind="data" />
        <strong className="font-bold">Data-ink</strong> shows the values. A bar shows its value by its length, so its data-ink is a
        thin line as long as the bar: the least ink that could still show the number. Here that’s {share(stats.data)} of the ink.
      </p>
    </>,
    <p>
      <Swatch kind="redundant" />
      <strong className="font-bold">Repeated data-ink</strong> shows a value again: the rest of each bar’s width, and the numbers
      printed on the bars. It can help the reader, but it adds no new information. Here: {share(stats.redundant)}.
    </p>,
    <p>
      <Swatch kind="nonData" />
      <strong className="font-bold">Non-data ink</strong> is everything else: the title, the labels, the axis, the gridlines and
      the border. Much of it helps people read the chart. None of it is data. Here: {share(stats.nonData)}.
    </p>,
    <p>
      And the <strong className="font-bold">paper</strong> isn’t ink at all, whatever its colour. Neither is ink hidden behind
      other ink: gridlines behind a bar don’t count, because nobody can see them.
    </p>,
    <>
      <p>The data-ink ratio is the data-ink divided by all the ink:</p>
      <p className="my-4 font-serif text-[1.5rem] md:text-[1.75rem] leading-snug text-content">
        data-ink <span className="text-content-2">÷</span> all the ink
      </p>
      <p>
        For this chart, <strong className="font-bold tabular-nums text-echo">{pct(stats.ratio)}</strong>. Now {verb} any
        part of the chart to see which kind of ink it is, and how much of it there is. (With a keyboard, move to the chart and use the
        arrow keys.)
      </p>
    </>,
  ];

  return (
    <ScrollStory
      label="A bar chart with each kind of ink picked out in turn"
      steps={steps}
      figure={(step) => <StoryFigure spec={spec} stats={stats} highlight={HIGHLIGHTS[step]} />}
    />
  );
};

export default InkKindsStory;
