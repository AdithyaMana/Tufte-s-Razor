import React, { useMemo } from 'react';
import type { InkGroup } from '../../../ink/render.ts';
import { defaultSpec } from '../../../ink/spec.ts';
import { useIsDark } from '../../site/theme.ts';
import { useIsArticle } from '../../site/view.ts';
import ChartPanels from '../ChartPanels.tsx';
import { pct } from '../format.ts';
import { InkTerm } from '../InkReadout.tsx';
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
  const article = useIsArticle();
  const spec = useMemo(() => ({ ...defaultSpec(isDark), dataLabels: true }), [isDark]);
  const stats = useInkStats(spec);
  const share = (n: number) => <strong className="font-bold tabular-nums text-echo">{pct(stats.total ? n / stats.total : 0)}</strong>;

  // Part 1 named the three kinds; this part looks at each one up close, on a plainer chart.
  const steps = [
    <>
      <p>
        Part 1 sorted a chart’s ink into three kinds. Here they are up close, on a plainer chart
        {article ? ', picked out one kind at a time above' : ''}.
      </p>
      <p>
        <InkTerm kind="data">Data-ink</InkTerm> is a thin line down each bar, as long as the bar. A bar shows its value by its length,
        so that line is the least ink that could still show the number. Here it’s {share(stats.data)} of the ink.
      </p>
    </>,
    <p>
      <InkTerm kind="redundant">Repeated data-ink</InkTerm> is the rest of each bar’s width, and the numbers printed on the bars. It
      can help the reader, but it says nothing new. On this chart it’s {share(stats.redundant)} of the ink.
    </p>,
    <p>
      <InkTerm kind="nonData">Non-data ink</InkTerm> is everything else: the title, the labels, the axis, the gridlines and the
      border. Much of it helps people read the chart, but none of it is data. Here it’s {share(stats.nonData)}.
    </p>,
    <p>
      The <strong className="font-bold">paper</strong> isn’t ink at all, whatever its colour. Neither is ink hidden behind other
      ink: gridlines behind a bar don’t count, because nobody can see them.
    </p>,
    <p>
      So this chart’s data-ink ratio is <strong className="font-bold tabular-nums text-echo">{pct(stats.ratio)}</strong>: its
      data-ink divided by all its ink.
      {!article &&
        ` Now ${verb} any part of the chart to see which kind of ink it is, and how much of it there is. (With a keyboard, move to the chart and use the arrow keys.)`}
    </p>,
  ];

  const shareOf = (n: number) => `${pct(stats.total ? n / stats.total : 0)} of the ink`;
  const articleFigures = [
    {
      after: -1,
      figure: (
        <ChartPanels
          label="One chart, with each kind of ink picked out in turn"
          panels={[
            { spec, highlight: HIGHLIGHTS[0], hideRatio: true, label: 'Data-ink', caption: shareOf(stats.data) },
            { spec, highlight: HIGHLIGHTS[1], hideRatio: true, label: 'Repeated data-ink', caption: shareOf(stats.redundant) },
            { spec, highlight: HIGHLIGHTS[2], hideRatio: true, label: 'Non-data ink', caption: shareOf(stats.nonData) },
            { spec, highlight: HIGHLIGHTS[3], hideRatio: true, label: 'Paper', caption: 'Not ink at all' },
          ]}
        />
      ),
    },
  ];

  return (
    <ScrollStory
      label="A bar chart with each kind of ink picked out in turn"
      steps={steps}
      articleFigures={articleFigures}
      figure={(step) => <StoryFigure spec={spec} stats={stats} highlight={HIGHLIGHTS[step]} />}
    />
  );
};

export default InkKindsStory;
