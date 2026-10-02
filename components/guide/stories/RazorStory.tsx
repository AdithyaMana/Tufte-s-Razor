import React, { useMemo, useState } from 'react';
import { ArrowDown, BookOpen, MousePointer2 } from 'lucide-react';
import { SECTIONS } from '../../../content/sections.ts';
import { RAZOR_STEPS, razorSpec } from '../../../ink/razor.ts';
import { useIsDark } from '../../site/theme.ts';
import { useView } from '../../site/view.ts';
import ChartPanels from '../ChartPanels.tsx';
import { decimal, pct, times } from '../format.ts';
import Guess from '../Guess.tsx';
import { InkKey, InkTerm } from '../InkReadout.tsx';
import RatioFormula from '../RatioFormula.tsx';
import ScrollStory from '../ScrollStory.tsx';
import StoryFigure, { usePointVerb } from '../StoryFigure.tsx';
import { useInkStatsList } from '../useInk.ts';

// Each step of the story: which cut of the razor the chart shows, and how. The thin lines and
// the heavy type (cuts 2 and 3) go in one step: together they barely move the ratio.
const STATES: { cut: number; map?: boolean; hideRatio?: boolean }[] = [
  { cut: 0, hideRatio: true },
  { cut: 0, map: true },
  { cut: 1 },
  { cut: 3 },
  { cut: 4 },
  { cut: 5 },
  { cut: 6 },
  { cut: 5 },
];

const Ratio: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-bold tabular-nums text-echo">{children}</strong>;

/** The opening: one cluttered chart, erased a piece at a time as the reader scrolls. */
const RazorStory: React.FC = () => {
  const isDark = useIsDark();
  const { Verb } = usePointVerb();
  const { view, setView } = useView();
  const article = view === 'article';
  const [guessed, setGuessed] = useState(false);
  const specs = useMemo(() => RAZOR_STEPS.map((_, i) => razorSpec(i, isDark)), [isDark]);
  const stats = useInkStatsList(specs);
  const start = stats[0];
  const r = (cut: number) => <Ratio>{pct(stats[cut].ratio)}</Ratio>;

  // The interactive story: guess first, then watch the chart lose one kind of ink per step.
  const steps = [
    <>
      <p>Here is a bar chart of five numbers. Whoever made it switched on every default and decoration their software offered.</p>
      <Guess
        className="mt-7"
        question="Every mark on it is ink. Erase the shaded background: does the share of ink that shows the five numbers go up, down, or stay the same?"
        options={[
          { value: 'up', label: 'Up' },
          { value: 'same', label: 'Stays the same' },
          { value: 'down', label: 'Down' },
        ]}
        answer="up"
        right="Right: it goes up."
        wrong="It goes up."
        reveal={
          <>
            The background shows no numbers, so erasing it leaves the same data in less ink. Right now that share is only {r(0)}. Most of
            the rest is decoration, or ink that repeats what the bars already show.
          </>
        }
        onGuess={() => setGuessed(true)}
      />
    </>,
    <>
      <p>
        Here is the same chart as an <em>ink map</em>, with every mark coloured by what it does.{' '}
        <InkTerm kind="data">Data-ink</InkTerm> tells the reader about the data: a thin line down each bar, as long as the bar, and
        the title and axis labels. <InkTerm kind="redundant">Repeated data-ink</InkTerm> says something again.{' '}
        <InkTerm kind="nonData">Non-data ink</InkTerm> is everything else.
      </p>
      <RatioFormula />
      <p>
        For this chart that’s about {r(0)}: an estimate, because what counts as ink is partly a judgement call. {Verb} any part of
        the chart to see what it is.
      </p>
    </>,
    <p>
      Edward Tufte’s advice: erase the ink that isn’t data, within reason. Start with the shaded background, the biggest piece of
      non-data ink here. The ratio rises to {r(1)}.
    </p>,
    <p>
      Next, the gridlines, the box, the tick marks, the outlines and the oversized type. The lines are light on ink, and smaller
      type is less data-ink, so the ratio slips to {r(3)}. Erasing clutter doesn’t always raise it. Most of the ink is still in the
      bars.
    </p>,
    <p>
      Now the biggest cut. A bar shows its value by its length; its width only repeats it. Slim the bars and the ratio jumps to{' '}
      {r(4)}, {times(stats[4].ratio, start.ratio)} where it started.
    </p>,
    <p>
      The axis labels and the numbers on the bars say each value twice. Erase the axis labels and the numbers on the bars carry
      the values alone, so they now count as data-ink. “Chart Title” becomes a title that says what the chart shows, with its
      unit. The ratio rises to {r(5)}, and the chart now says something.
    </p>,
    <p>
      Keep erasing and you reach {r(6)}: nothing but data. But what are these bars? What do they measure? Nothing says any more.
      The title and labels were data-ink too, so this cut lost information, yet the ratio still went up. It only compares the ink
      that’s left, so it can’t see what’s missing.
    </p>,
    <>
      <p>
        So chasing the highest ratio is a mistake. Keep the ink that helps someone read the chart, and cut the rest. One cut back,
        shown here again, was a good place to stop: {r(5)}, {times(stats[5].ratio, start.ratio)} the start, with nothing a reader
        needs gone.
      </p>
      <p>The rest of this guide shows where to stop, one kind of ink at a time.</p>
    </>,
  ];

  // The reading view: the same argument as prose, each figure after the paragraph that introduces it.
  const readingSteps = [
    <p>
      Here is a bar chart of five numbers: weekly bike-share trips, in thousands, at five stations. Whoever made it switched on every
      default and decoration their software offered. The second copy is an <em>ink map</em>: the same chart, with every mark coloured
      by what it does.
    </p>,
    <>
      <p>
        <InkTerm kind="data">Data-ink</InkTerm> tells the reader about the data: a thin line down each bar, as long as the bar, and
        the title and axis labels that say what the bars show. <InkTerm kind="redundant">Repeated data-ink</InkTerm> says something
        again: the rest of each bar’s width, and the numbers printed on top. <InkTerm kind="nonData">Non-data ink</InkTerm> is
        everything else: the shading, the gridlines, the borders and the axis lines.
      </p>
      <p>The <em>data-ink ratio</em>, at its simplest, is one share of the ink:</p>
      <RatioFormula />
      <p>
        For this chart it’s about {decimal(start.ratio)}, or {r(0)}. Most of the rest is decoration, or ink that repeats what the
        bars already show.
      </p>
      <p>
        Treat that number as an estimate rather than an exact value. How thin a bar can get before it’s hard to see, and how a chart
        looks on different screens, are judgement calls, so no count is exact. What holds up is the comparison between two versions
        of one chart, which Lai and Morrison call the <em>relative value</em>. That’s how this guide uses the ratio.
      </p>
    </>,
    <p>
      Edward Tufte’s advice is to erase the ink that isn’t data, within reason. Here is that advice applied one cut at a time, each
      chart keeping every cut before it.
    </p>,
    <p>
      The first cut is the shaded background, the biggest piece of non-data ink. It shows no numbers, so erasing it leaves the same
      data in less ink, and the ratio rises to {r(1)}.
    </p>,
    <p>
      The gridlines, the box, the tick marks, the outlines and the oversized type go next. The lines are light on ink, and smaller
      type is less data-ink, so the ratio slips to {r(3)}. Erasing clutter doesn’t always raise it. Most of the ink is still in the
      bars.
    </p>,
    <p>
      Then the biggest cut. A bar shows its value by its length; its width only repeats it. Slimmer bars take the ratio to {r(4)},{' '}
      {times(stats[4].ratio, start.ratio)} where it started.
    </p>,
    <p>
      The axis labels and the numbers on the bars say each value twice. Erase the axis labels and the numbers on the bars carry
      the values alone, so they now count as data-ink. “Chart Title” becomes a title that says what the chart shows, with its
      unit. The ratio rises to {r(5)}, and the chart now says something.
    </p>,
    <p>
      Keep erasing and the last chart reaches {r(6)}: nothing but data. But what are these bars? What do they measure? Nothing says
      any more. The title and labels were data-ink too, so that cut lost information, yet the ratio still went up. It only compares
      the ink that’s left, so it can’t see what’s missing.
    </p>,
    <>
      <p>
        So chasing the highest ratio is a mistake. Keep the ink that helps someone read the chart, and cut the rest. The fifth chart,
        “Each value said once”, is a good place to stop: {r(5)}, {times(stats[5].ratio, start.ratio)} the start, with nothing a reader
        needs gone.
      </p>
      <p>The rest of this guide shows where to stop, one kind of ink at a time.</p>
    </>,
  ];

  const articleFigures = [
    {
      after: 0,
      figure: (
        <ChartPanels
          columns={2}
          label="A cluttered bar chart, and the same chart as an ink map"
          panels={[
            { spec: specs[0], hideRatio: true, label: 'The chart', caption: 'Every default and decoration switched on.' },
            { spec: specs[0], inkMap: true, hideRatio: true, label: 'The same chart as an ink map', caption: <InkKey /> },
          ]}
        />
      ),
    },
    {
      after: 2,
      figure: (
        <ChartPanels
          columns={6}
          label="The chart erased one cut at a time"
          panels={[
            { spec: specs[0], label: 'Start' },
            { spec: specs[1], label: 'No shading' },
            { spec: specs[3], label: 'No lines, smaller type' },
            { spec: specs[4], label: 'Slimmer bars' },
            { spec: specs[5], label: 'Each value said once' },
            { spec: specs[6], label: 'Too far' },
          ]}
        />
      ),
    },
  ];

  // The choice between the two views, offered where every reader starts.
  const switchView = (
    <button
      type="button"
      onClick={() => setView(article ? 'interactive' : 'article')}
      className="inline-flex items-center gap-2 min-h-10 rounded-sm text-content underline decoration-line-2 underline-offset-4 hover:decoration-content"
    >
      {article ? <MousePointer2 size={14} aria-hidden="true" /> : <BookOpen size={14} aria-hidden="true" />}
      {article ? 'Switch to the interactive guide' : 'Rather just read? Switch to the reading view'}
    </button>
  );

  return (
    <section id="razor" aria-labelledby="razor-title" className="max-w-6xl mx-auto px-4 md:px-8 pt-10 md:pt-16">
      <p className="kicker">{article ? 'A guide to the data-ink ratio' : 'An interactive guide to the data-ink ratio'}</p>
      <h1
        id="razor-title"
        className="mt-4 max-w-4xl font-serif text-[2.6rem] sm:text-6xl lg:text-[4.5rem] leading-[1.02] tracking-tight text-content text-balance"
      >
        How much of a chart is data?
      </h1>
      <p className="article mt-5 max-w-2xl text-content-2 text-pretty">
        Edward Tufte’s <em>data-ink ratio</em> asks what share of a chart’s ink actually shows the data.{' '}
        {article
          ? 'This guide takes a cluttered chart apart, one piece at a time, then looks at what impact each piece has on the data-ink ratio, and how to optimise it for your chart.'
          : 'Scroll to take a cluttered chart apart, one piece at a time, and see what impact each piece has on the data-ink ratio, and how to optimise it for your chart.'}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 font-sans text-[0.8125rem] text-chrome">
        {!article && (
          <span className="flex items-center gap-2 min-h-10">
            <ArrowDown size={14} aria-hidden="true" /> Scroll to begin
          </span>
        )}
        <span className="flex items-center min-h-10">{SECTIONS.length} short parts, {article ? 'about 12 minutes to read' : 'about 15 minutes'}</span>
        {switchView}
      </div>

      <ScrollStory
        className="mt-8 md:mt-12"
        label="A cluttered bar chart, erased step by step"
        steps={article ? readingSteps : steps}
        articleFigures={articleFigures}
        figure={(step) => {
          const state = STATES[step];
          return (
            <StoryFigure
              spec={specs[state.cut]}
              stats={stats[state.cut]}
              scale={start.total}
              inkMap={state.map}
              hideRatio={state.hideRatio && !guessed}
              reference={state.cut > 0 ? { label: 'the start', stats: start } : null}
              label={`A bar chart of five values, after ${state.cut} of ${RAZOR_STEPS.length - 1} cuts. Latest cut: ${RAZOR_STEPS[state.cut].label}.`}
            />
          );
        }}
      />
    </section>
  );
};

export default RazorStory;
