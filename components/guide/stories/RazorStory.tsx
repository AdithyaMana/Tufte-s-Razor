import React, { useMemo, useState } from 'react';
import { ArrowDown, BookOpen, MousePointer2 } from 'lucide-react';
import { SECTIONS } from '../../../content/sections.ts';
import { RAZOR_STEPS, razorSpec } from '../../../ink/razor.ts';
import { useIsDark } from '../../site/theme.ts';
import { useView } from '../../site/view.ts';
import ChartPanels from '../ChartPanels.tsx';
import { pct, times } from '../format.ts';
import Guess from '../Guess.tsx';
import { InkKey, InkTerm } from '../InkReadout.tsx';
import RatioFormula from '../RatioFormula.tsx';
import ScrollStory from '../ScrollStory.tsx';
import StoryFigure from '../StoryFigure.tsx';
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
  const { view, setView } = useView();
  const article = view === 'article';
  const [guessed, setGuessed] = useState(false);
  const specs = useMemo(() => RAZOR_STEPS.map((_, i) => razorSpec(i, isDark)), [isDark]);
  const stats = useInkStatsList(specs);
  const start = stats[0];
  const r = (cut: number) => <Ratio>{pct(stats[cut].ratio)}</Ratio>;
  const chartIntroduction = <p>Here is a typical bar chart containing five value. Whoever made it was happy to use the default design and style without making any changes.</p>;

  // The interactive story: guess first, then watch the chart lose one kind of ink per step.
  const steps = [
    <>
      {chartIntroduction}
      <Guess
        className="mt-7"
        question="Data-ink ratio measures the amount of ink used to represent data divided by the total mount of ink used to create the chart. If you remove the shaded background behind the bars, does the share of ink that shows the five numbers go up, down, or stay the same?"
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
        Here is the same chart shown as an ink map, colour coded by its property.{' '}
        <InkTerm kind="data">Data-ink</InkTerm> conveys some form of information or data, including the bars, the title and axis
        labels. <InkTerm kind="redundant">Redundant data-ink</InkTerm> is information or data that can be removed without loss of
        information. <InkTerm kind="nonData">Non-data ink</InkTerm> is everything else that doesn't represent any information or
        data, including the gridlines.
      </p>
      <RatioFormula />
      <p>
        For this chart that’s about {r(0)}: an estimate, because what counts as redundant data-ink is partly a judgement call.
        {!article && ' Point at any part of the chart to see what it is.'}
      </p>
    </>,
    <p>
      Edward Tufte’s advice: remove ink that does not represent data or convey meaning. Start with the shaded background, the
      biggest piece of non-data ink here. The ratio rises to {r(1)}.
    </p>,
    <p>
      Next, the gridlines, the tick marks, the borders, and the oversized type. The lines do not use much ink, and smaller type
      also uses less data-ink, so the ratio falls slightly to {r(3)}. What you quickly realize is that most of the data-ink is
      still in the bars, although a lot of it might be redundant.
    </p>,
    <p>
      Now the biggest cut. A bar represents a value by its length; the width of the bar is mostly redundant information. Slimming
      the bars and the ratio jumps to {r(4)}, {times(stats[4].ratio, start.ratio)} where it started.
    </p>,
    <p>
      The axis labels and the data labels on the bars provide the same information in different ways. Erase the axis labels and
      the data labels on the bars carry the values alone, so now count as data-ink. “Chart Title” becomes a meaningful title that
      provides some information and tells you the unit of measurement. The ratio rises to {r(5)}.
    </p>,
    <p>
      Keep erasing ink from the chart and you reach {r(6)}: nothing but pure data. But what are these lines? What do they measure?
      We've lost information. The title and labels were data-ink too, so removing them results in the loss of information, even
      though you continue to increase the data-ink ratio.
    </p>,
    <>
      <p>
        Clearly we should not just be chasing the highest data-ink ratio. Keep the ink that helps someone read the chart, and cut
        the rest. One cut back, shown here again, was a good place to stop: {r(5)}, {times(stats[5].ratio, start.ratio)} the start,
        with nothing a reader needs gone.
      </p>
      <p>The rest of this guide shows you how to work out what a chart with optimal data-ink ratio looks like.</p>
    </>,
  ];

  // Use the supplied prose in both views; the reading view omits the interactive guess.
  const readingSteps = [chartIntroduction, ...steps.slice(1)];

  const articleFigures = [
    {
      after: 0,
      figure: (
        <ChartPanels
          columns={2}
          label="A cluttered bar chart, and the same chart as an ink map"
          panels={[
            { spec: specs[0], hideRatio: true, label: 'The chart' },
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
    {
      after: 6,
      figure: <ChartPanels label="One cut back: a good place to stop" panels={[{ spec: specs[5], label: 'One cut back' }]} />,
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
        How much data is there in your chart?
      </h1>
      <p className="article mt-5 max-w-2xl text-content-2 text-pretty">
        Edward Tufte’s data-ink ratio can help us to understand the information density of a chart. Scroll down to see how changes
        to a chart can impact on the data-ink ratio, and how to optimize it for your chart.
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
