import React, { useMemo } from 'react';
import type { InkGroup } from '../../../ink/render.ts';
import { defaultSpec } from '../../../ink/spec.ts';
import { useIsDark } from '../../site/theme.ts';
import { useIsArticle } from '../../site/view.ts';
import ChartPanels from '../ChartPanels.tsx';
import { pct } from '../format.ts';
import { InkTerm } from '../InkReadout.tsx';
import ScrollStory from '../ScrollStory.tsx';
import StoryFigure from '../StoryFigure.tsx';
import { useInkStats } from '../useInk.ts';

const DATA: InkGroup[] = ['hairlines', 'title', 'valueLabels', 'categoryLabels'];
const NON_DATA: InkGroup[] = ['plotFill', 'gridlines', 'borders', 'axes'];

// What each step picks out on the chart. An empty list picks out the paper.
const HIGHLIGHTS: (readonly InkGroup[] | null)[] = [DATA, ['barWidth', 'outlines', 'dataLabels'], NON_DATA, [], null];

/** The three kinds of ink, picked out on one chart in turn. */
const InkKindsStory: React.FC = () => {
  const isDark = useIsDark();
  const article = useIsArticle();
  const spec = useMemo(() => ({ ...defaultSpec(isDark), dataLabels: true }), [isDark]);
  const stats = useInkStats(spec);
  const share = (n: number) => <strong className="font-bold tabular-nums text-echo">{pct(stats.total ? n / stats.total : 0)}</strong>;

  // Part 1 named the three kinds; this part looks at each one up close, on a plainer chart.
  const steps = [
    <>
      <p>
        Part 1 introduced three types of ink on a chart. Here they are again up close, on a plain chart.
      </p>
      <p>
        <InkTerm kind="data">Data-ink</InkTerm> encodes or conveys some form of information or data. A bar represents a value with
        its height, so a thin line down each bar is the minimum amount of ink that can be used to show the value. The title and
        the axis labels tells you more information about what those numbers are. Erase any of it and the reader loses something.
        Here it makes up around{' '}
        {share(stats.data)} of the ink.
      </p>
    </>,
    <p>
      <InkTerm kind="redundant">Redundant data-ink</InkTerm> is contained within the width of each bar, and the data labels shown
      on the bars that you can work out from lining the top of the bar with the axis. It can help the reader work out the value,
      but you don't lose any information by removing it. On this chart it makes up around {share(stats.redundant)} of the ink.
    </p>,
    <p>
      <InkTerm kind="nonData">Non-data ink</InkTerm> is everything else: the axis line, the gridlines and the border. Some of it
      helps people read the chart, but none of it says anything about the numbers. Here it makes up {share(stats.nonData)}.
    </p>,
    <p>
      The paper does not contain data-ink at all, regardless of its colour. Neither is ink hidden behind other ink: so the part
      of the gridlines behind a bar don’t count, because they are not actually visible to the reader.
    </p>,
    <p>
      So theoretically this chart’s data-ink ratio is{' '}
      <strong className="font-bold tabular-nums text-echo">{pct(stats.ratio)}</strong>: its data-ink divided by all of the ink that's
      there.
      {!article &&
        ' Now point at any part of the chart to see which kind of ink it is, and how much of it there is (with a keyboard, move to the chart and use the arrow keys).'}
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
            { spec, highlight: HIGHLIGHTS[1], hideRatio: true, label: 'Redundant data-ink', caption: shareOf(stats.redundant) },
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
