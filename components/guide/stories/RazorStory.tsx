import React, { useMemo, useState } from 'react';
import { ArrowDown, BookOpen, MousePointer2 } from 'lucide-react';
import { RAZOR_STEPS, razorSpec } from '../../../ink/razor.ts';
import { useIsDark } from '../../site/theme.ts';
import { useView } from '../../site/view.ts';
import ChartPanels from '../ChartPanels.tsx';
import { pct, times } from '../format.ts';
import Guess from '../Guess.tsx';
import { InkKey, InkTerm } from '../InkReadout.tsx';
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

  const steps = [
    <>
      <p>
        Here is a bar chart of five numbers{article ? ', on the left' : ''}. Whoever made it switched on every default and decoration
        their software offered.
      </p>
      <Guess
        className="mt-7"
        question="Every mark on it is ink. How much of that ink do you think shows the five numbers?"
        options={[
          { value: 'half', label: 'About half' },
          { value: 'fifth', label: 'About a fifth' },
          { value: 'sliver', label: 'Less than a twentieth' },
        ]}
        answer="sliver"
        right="Right: a sliver."
        wrong="Less than that."
        reveal={<>Just {r(0)}. The rest is decoration, scaffolding, and ink that repeats what the bars already show.</>}
        onGuess={() => setGuessed(true)}
      />
    </>,
    <>
      <p>
        {article ? 'On the right is' : 'Here is'} the same chart as an <em>ink map</em>, with every mark coloured by what it does.{' '}
        <InkTerm kind="data">Data-ink</InkTerm> shows the values: a thin line down each bar, as long as the bar.{' '}
        <InkTerm kind="redundant">Repeated data-ink</InkTerm> says a value again. <InkTerm kind="nonData">Non-data ink</InkTerm> is everything else.
      </p>
      <p>
        The data-ink ratio is the data-ink divided by all of it: {r(0)}.{article ? '' : ` ${Verb} any part of the chart to see what it is.`}
      </p>
    </>,
    <p>
      Edward Tufte’s advice: erase the ink that isn’t data, within reason.{article ? ' The charts above do it one cut at a time.' : ''}{' '}
      Start with the shaded background, the biggest piece of non-data ink here. The ratio rises to {r(1)}.
    </p>,
    <p>
      Next, the gridlines, the box, the tick marks, the outlines and the heavy type. Together they’re light on ink, so the ratio
      barely moves: {r(3)}. Most of the ink is still in the bars.
    </p>,
    <p>
      Now the biggest cut. A bar shows its value by its length; its width only repeats it. Slim the bars and the ratio jumps to{' '}
      {r(4)}, {times(stats[4].ratio, start.ratio)} where it started.
    </p>,
    <p>
      The axis labels repeat the numbers printed on the bars, so they go too. Each value is now said once: {r(5)}.
    </p>,
    <p>
      Keep erasing and you reach {r(6)}: nothing but data. But what are these bars? What do they measure? Nothing says any more.
    </p>,
    <>
      <p>
        So the goal isn’t the highest ratio. It’s ink that earns its place.{' '}
        {article ? 'The cut before that' : 'One cut back, shown here again,'} was a good place to stop: {r(5)},{' '}
        {times(stats[5].ratio, start.ratio)} the start, and nothing a reader needs is gone.
      </p>
      <p>The rest of this guide shows where to stop, one kind of ink at a time.</p>
    </>,
  ];

  const articleFigures = [
    {
      after: -1,
      figure: (
        <ChartPanels
          columns={2}
          label="A cluttered bar chart, and the same chart as an ink map"
          panels={[
            { spec: specs[0], label: 'The chart', caption: 'Every default and decoration switched on.' },
            { spec: specs[0], inkMap: true, hideRatio: true, label: 'The same chart as an ink map', caption: <InkKey /> },
          ]}
        />
      ),
    },
    {
      after: 1,
      figure: (
        <ChartPanels
          columns={6}
          label="The chart erased one cut at a time"
          panels={[
            { spec: specs[0], label: 'Start' },
            { spec: specs[1], label: 'No shading' },
            { spec: specs[3], label: 'No lines or heavy type' },
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
      {article ? 'Switch to the interactive guide' : 'Rather just read? Switch to the article view'}
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
          ? 'This guide takes a cluttered chart apart, one piece at a time, then looks at each kind of ink in turn.'
          : 'Scroll to take a cluttered chart apart, one piece at a time.'}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 font-sans text-[0.8125rem] text-chrome">
        {!article && (
          <span className="flex items-center gap-2 min-h-10">
            <ArrowDown size={14} aria-hidden="true" /> Scroll to begin
          </span>
        )}
        <span className="flex items-center min-h-10">{article ? '9 short parts, about 11 minutes to read' : '9 short parts, about 14 minutes'}</span>
        {switchView}
      </div>

      <ScrollStory
        className="mt-8 md:mt-12"
        label="A cluttered bar chart, erased step by step"
        steps={steps}
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
