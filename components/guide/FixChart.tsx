import React, { useMemo, useState } from 'react';
import { Check as CheckIcon, Circle } from 'lucide-react';
import { COMFORTABLE_BAR_WIDTH, readabilityChecks, widthZone } from '../../ink/checks.ts';
import { computeLayout } from '../../ink/layout.ts';
import { measureText } from '../../ink/measure.ts';
import {
  applyPreset,
  PRESETS,
  resolveSpec,
  type BackgroundChoice,
  type BarChoice,
  type FillChoice,
  type Look,
  type Shape,
} from '../../ink/presets.ts';
import { razorShapeAndLook, STOP_STEP } from '../../ink/razor.ts';
import { FINDING_TITLE, GENERIC_TITLE, type ChartSpec, type ValueLabelMode } from '../../ink/spec.ts';
import { useIsDark } from '../site/theme.ts';
import { useView } from '../site/view.ts';
import ChartCanvas from './ChartCanvas.tsx';
import ChartPanels from './ChartPanels.tsx';
import { Segmented, Slider, TextButton, Toggle } from './controls.tsx';
import { pct, times } from './format.ts';
import { InkMeter, type ReferenceStats } from './InkReadout.tsx';
import { Warnings } from './Lab.tsx';
import { StickyLayout } from './ScrollStory.tsx';
import { useInkStats } from './useInk.ts';

/**
 * How much of the start's non-data ink must go. A target on non-data ink rather than on the
 * ratio, so it rewards erasing clutter without pushing bars thinner than readers like.
 */
export const NON_DATA_CUT = 0.5;

// The cluttered chart from the start of the guide, on the page's own paper in either theme.
const EVERYTHING = applyPreset(PRESETS.find((p) => p.id === 'everything')!);
const START = { shape: EVERYTHING.shape, look: { ...EVERYTHING.look, background: 'theme', bars: 'theme' } satisfies Look };

// One answer among many, and the same chart Part 1 stops at: everything a reader needs, each
// value said once, under a title that says what the chart shows.
const SOLUTION = razorShapeAndLook(STOP_STEP);

const TITLES = [
  { value: 'none', label: 'None' },
  { value: 'generic', label: GENERIC_TITLE },
  { value: 'finding', label: 'States the finding' },
] as const;
type TitleChoice = (typeof TITLES)[number]['value'];
const TITLE_TEXT: Record<TitleChoice, string | null> = { none: null, generic: GENERIC_TITLE, finding: FINDING_TITLE };

const TEXT_SIZES = [
  { value: 'small', label: 'Small', title: 11, labels: 7 },
  { value: 'default', label: 'Default', title: 18, labels: 12 },
  { value: 'large', label: 'Large', title: 26, labels: 14 },
] as const;
type TextSize = (typeof TEXT_SIZES)[number]['value'];

const FILLS: { value: FillChoice; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pale', label: 'Pale' },
  { value: 'dark', label: 'Dark' },
];

const VALUE_LABELS: { value: ValueLabelMode; label: string }[] = [
  { value: 'all', label: 'Every tick' },
  { value: 'ends', label: 'Ends' },
  { value: 'data', label: 'Data values' },
  { value: 'none', label: 'None' },
];

const PAPERS: { value: BackgroundChoice; label: string }[] = [
  { value: 'theme', label: 'Page' },
  { value: 'white', label: 'White' },
  { value: 'pale', label: 'Pale blue' },
  { value: 'dark', label: 'Dark blue' },
];

const BAR_COLOURS: { value: BarChoice; label: string }[] = [
  { value: 'theme', label: 'Default' },
  { value: 'blue', label: 'Blue' },
  { value: 'pale', label: 'Pale blue' },
  { value: 'white', label: 'White' },
];

const GROUPS = [...new Set(PRESETS.map((p) => p.group))];

interface Goal {
  id: string;
  text: string;
  met: boolean;
}

/**
 * The next useful thing to try: the first goal not yet met, and for the ratio, the biggest
 * piece of ink still left to cut.
 */
function hintFor(goals: Goal[], spec: ChartSpec, has: (id: string) => boolean): string | null {
  const unmet = (id: string) => goals.some((g) => g.id === id && !g.met);
  if (unmet('values')) {
    return has('no-values')
      ? 'Nothing shows the values any more. Bring back the axis labels, or put the values on the bars.'
      : 'With only the ends of the axis labelled, readers can only estimate the values. Label the data values, or put them on the bars.';
  }
  if (unmet('names')) return 'Nothing says which bar is which. Turn the category labels back on.';
  if (unmet('text')) {
    if (has('small-labels')) return 'Some text is too small to read. Try the default text size.';
    if (has('hierarchy')) return 'The title has ended up smaller than the labels. Try the default text size.';
    if (has('text-contrast')) return 'The text is hard to read against what’s behind it.';
    return 'Some text is so large it competes with the bars. Try the default text size.';
  }
  if (unmet('contrast')) return 'The bars blend into what’s behind them. Take away the shading, or outline the bars.';
  if (unmet('compare')) {
    return spec.barWidth > COMFORTABLE_BAR_WIDTH[1]
      ? 'Bars this wide crowd together, and their extra width only repeats their values. Narrow them.'
      : 'Bars this thin are hard to compare. Widen them a little.';
  }
  if (unmet('title')) return 'A title should tell the reader what to see. Swap “Chart Title” for one that states the finding.';
  if (unmet('cut')) {
    if (spec.plotFill) return 'The shaded plot area is the biggest piece of non-data ink left. Try taking it away.';
    return 'Erase the lines a reader doesn’t need: gridlines, borders, tick marks and outlines.';
  }
  return null;
}

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <fieldset className="min-w-0">
    <legend className="kicker mb-3">{title}</legend>
    <div className="space-y-4">{children}</div>
  </fieldset>
);

const Chips: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="flex flex-wrap gap-2">{children}</div>;

const GoalList: React.FC<{ goals: Goal[] }> = ({ goals }) => (
  <ul className="space-y-1.5 font-sans">
    {goals.map((goal) => (
      <li key={goal.id} className={`flex gap-2.5 text-[0.875rem] leading-snug ${goal.met ? 'text-content' : 'text-content-2'}`}>
        <span className={`mt-[1px] grid place-items-center w-4 h-4 shrink-0 rounded-full ${goal.met ? 'bg-control text-paper' : 'text-chrome'}`}>
          {goal.met ? <CheckIcon size={11} strokeWidth={3} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
        </span>
        <span>
          <span className="sr-only">{goal.met ? 'Done: ' : 'Not yet: '}</span>
          {goal.text}
        </span>
      </li>
    ))}
  </ul>
);

// The goals, as the guide's advice in brief (for the article view).
const PRINCIPLES = [
  'Erase at least half of the non-data ink.',
  'Give it a title that says what the chart shows.',
  'Keep every value readable.',
  'Keep every bar named.',
  'Keep the bars easy to compare: not too wide, not too thin.',
  'Keep all the text easy to read.',
  'Keep the bars standing out from what’s behind them.',
];

/** The challenge, for readers of the article view: its goals, and one way to meet them. */
const ChallengeSummary: React.FC = () => {
  const isDark = useIsDark();
  const { setView } = useView();
  const panels = useMemo(
    () => [
      { spec: resolveSpec(START.shape, START.look, isDark), label: 'Before' },
      { spec: resolveSpec(SOLUTION.shape, SOLUTION.look, isDark), label: 'After: one way to fix it' },
    ],
    [isDark],
  );
  return (
    <>
      <div className="article max-w-[38rem] space-y-[1em]">
        <p>
          In the interactive guide, this part is a challenge: clean up the cluttered chart from the start of the guide without losing
          anything a reader needs. Its seven goals sum up the whole guide.
        </p>
        <ol className="list-decimal pl-7 space-y-1 marker:text-content-2">
          {PRINCIPLES.map((principle) => (
            <li key={principle} className="pl-1">
              {principle}
            </li>
          ))}
        </ol>
      </div>
      <ChartPanels columns={2} panels={panels} label="The cluttered chart, and one way to fix it" />
      <div className="article max-w-[38rem] space-y-[1em]">
        <p>
          This fix, the same one Part 1 stops at, drops the shading, the gridlines, the borders, the tick marks and the outlines, slims
          the bars to half their space, sorts them, says each value once, on its bar, and swaps “Chart Title” for the finding.
          Everything a reader needs is still there.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setView('interactive')}
        className="mt-4 inline-flex items-center min-h-10 rounded-sm font-sans text-[0.8125rem] text-content underline decoration-line-2 underline-offset-4 hover:decoration-content"
      >
        Try it yourself in the interactive guide
      </button>
    </>
  );
};

/** The whole guide in one exercise: clean up a cluttered chart without losing anything a reader needs. */
const FixChart: React.FC = () => {
  const { view } = useView();
  return view === 'article' ? <ChallengeSummary /> : <Challenge />;
};

const Challenge: React.FC = () => {
  const isDark = useIsDark();
  const [mode, setMode] = useState<'challenge' | 'free'>('challenge');
  const [shape, setShape] = useState<Shape>(START.shape);
  const [look, setLook] = useState<Look>(START.look);
  const [presetId, setPresetId] = useState('everything');
  const [pinned, setPinned] = useState<ReferenceStats | null>(null);
  const [hinting, setHinting] = useState(false);

  const spec = useMemo(() => resolveSpec(shape, look, isDark), [shape, look, isDark]);
  const startSpec = useMemo(() => resolveSpec(START.shape, START.look, isDark), [isDark]);
  const stats = useInkStats(spec);
  const start = useInkStats(startSpec);
  const barPx = useMemo(() => computeLayout(spec, measureText).bars[0].w, [spec]);

  const warnings = readabilityChecks(spec);
  const has = (id: string) => warnings.some((w) => w.id === id);
  const goals: Goal[] = [
    { id: 'cut', text: 'Erase at least half of the non-data ink', met: stats.nonData <= start.nonData * (1 - NON_DATA_CUT) },
    { id: 'title', text: 'The title says what the chart shows', met: shape.title === FINDING_TITLE },
    { id: 'values', text: 'Every value can still be read', met: !has('no-values') && !has('ends-only') },
    { id: 'names', text: 'Every bar is still named', met: !has('no-categories') },
    { id: 'compare', text: 'The bars are easy to compare: not too wide, not too thin', met: widthZone(spec.barWidth) === 'comfortable' },
    { id: 'text', text: 'All the text is easy to read', met: !['small-labels', 'big-labels', 'hierarchy', 'big-title', 'text-contrast'].some(has) },
    { id: 'contrast', text: 'The bars stand out from what’s behind them', met: !has('bar-contrast') },
  ];
  const metCount = goals.filter((g) => g.met).length;
  const solved = metCount === goals.length;
  const hint = hintFor(goals, spec, has);

  const edit = (patch: { shape?: Partial<Shape>; look?: Partial<Look> }) => {
    if (patch.shape) setShape((s) => ({ ...s, ...patch.shape }));
    if (patch.look) setLook((l) => ({ ...l, ...patch.look }));
    setPresetId('');
  };
  const load = (next: { shape: Shape; look: Look }, id = '') => {
    setShape(next.shape);
    setLook(next.look);
    setPresetId(id);
  };
  const loadPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) load(applyPreset(preset), id);
  };

  const titleChoice: TitleChoice = shape.title === null ? 'none' : shape.title === FINDING_TITLE ? 'finding' : 'generic';
  const textSize: TextSize | null = TEXT_SIZES.find((t) => t.title === shape.titleSize && t.labels === shape.labelSize)?.value ?? null;
  const reference = mode === 'free' ? pinned : { label: 'the start', stats: start };
  const presetLabel = PRESETS.find((p) => p.id === presetId)?.label;

  const figure = (
    <>
      <ChartCanvas spec={spec} inspectable />
      <InkMeter stats={stats} scale={start.total} reference={reference} className="mt-3" />
      {mode === 'challenge' ? (
        // The status and the hint stay in view with the chart while the controls scroll.
        <div className="mt-1 font-sans text-[0.8125rem] text-content-2">
          <div className="flex flex-wrap items-center gap-x-4">
            <p aria-live="polite" className="py-2.5">
              {solved ? (
                <span className="font-semibold text-content">All {goals.length} goals met.</span>
              ) : (
                <>
                  <span className="tabular-nums">
                    {metCount} of {goals.length}
                  </span>{' '}
                  goals met
                </>
              )}
            </p>
            {!solved && !hinting && <TextButton onClick={() => setHinting(true)}>Need a hint?</TextButton>}
          </div>
          {!solved && hinting && hint && (
            <p className="leading-snug text-content max-w-xl" aria-live="polite">
              <span className="font-semibold">Hint:</span> {hint}
            </p>
          )}
        </div>
      ) : (
        <Warnings warnings={warnings} className="mt-3" />
      )}
    </>
  );

  return (
    <StickyLayout figure={figure} label="Your chart" className="mt-2">
      <div className="pt-6 lg:pt-0 pb-10 space-y-10">
        <Segmented
          label="Mode"
          showLabel={false}
          options={[
            { value: 'challenge', label: 'The challenge' },
            { value: 'free', label: 'Free play' },
          ]}
          value={mode}
          onChange={setMode}
        />

        {mode === 'challenge' ? (
          <div className="space-y-5">
            <p className="article">
              This chart starts at <strong className="font-bold tabular-nums">{pct(start.ratio)}</strong>. Clean it up using everything
              in this guide, without losing anything a reader needs.
            </p>
            <GoalList goals={goals} />
            {solved && (
              <p className="font-serif text-[1.1875rem] md:text-[1.3125rem] leading-snug text-content" role="status">
                <strong className="font-bold">Done.</strong> {pct(stats.ratio)}, {times(stats.ratio, start.ratio)} the start, and still
                easy to read. That’s the whole idea.
              </p>
            )}
            <div className="flex flex-wrap gap-x-5">
              <TextButton onClick={() => load(SOLUTION)}>Show one solution</TextButton>
              <TextButton
                onClick={() => {
                  load(START, 'everything');
                  setHinting(false);
                }}
              >
                Start again
              </TextButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="article">
              Start from any chart in the article, change anything, and pin a version to compare against: the article calls this the
              chart’s <em>relative value</em>.
            </p>
            <label className="flex flex-col gap-1.5 font-sans text-[0.8125rem] text-chrome">
              <span className="font-medium">Start from</span>
              <select
                value={presetId}
                onChange={(e) => loadPreset(e.target.value)}
                className="min-h-10 w-full max-w-sm rounded-md border border-line-2 bg-paper px-2.5 text-[0.875rem] text-content"
              >
                {presetId === '' && <option value="">Your own design</option>}
                {GROUPS.map((group) => (
                  <optgroup key={group} label={group}>
                    {PRESETS.filter((p) => p.group === group).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-x-5">
              <TextButton onClick={() => setPinned({ label: presetLabel ? `“${presetLabel}”` : 'your pinned chart', stats })}>
                {pinned ? 'Pin this instead' : 'Pin as reference'}
              </TextButton>
              {pinned && <TextButton onClick={() => setPinned(null)}>Unpin</TextButton>}
            </div>
          </div>
        )}

        <Group title="Bars">
          <Slider
            label="Width"
            value={Math.round(shape.barWidth * 100)}
            min={0}
            max={100}
            onChange={(v) => edit({ shape: { barWidth: v / 100 } })}
            format={(v) => (v === 0 ? 'hairline, 2 px' : `${barPx} px`)}
            valueText={`${barPx} pixels wide. Data-ink ratio ${pct(stats.ratio)}.`}
          />
          <Chips>
            <Toggle label="Outlines" on={look.outline} onChange={(outline) => edit({ look: { outline } })} />
            <Toggle label="Sorted by value" on={shape.sorted} onChange={(sorted) => edit({ shape: { sorted } })} />
          </Chips>
          {mode === 'free' && <Segmented label="Colour" options={BAR_COLOURS} value={look.bars} onChange={(bars) => edit({ look: { bars } })} />}
        </Group>

        <Group title="Background">
          <Segmented label="Shaded plot area" options={FILLS} value={look.plotFill === 'white' ? null : look.plotFill} onChange={(plotFill) => edit({ look: { plotFill } })} />
          {mode === 'free' && (
            <Segmented label="Paper" options={PAPERS} value={look.background} onChange={(background) => edit({ look: { background } })} />
          )}
        </Group>

        <Group title="Lines">
          <Chips>
            <Toggle label="Gridlines" on={shape.gridlines} onChange={(gridlines) => edit({ shape: { gridlines } })} />
            <Toggle label="Chart border" on={shape.chartBorder} onChange={(chartBorder) => edit({ shape: { chartBorder } })} />
            <Toggle label="Box around the plot" on={shape.plotBorder} onChange={(plotBorder) => edit({ shape: { plotBorder } })} />
            <Toggle label="Tick marks" on={shape.tickMarks} onChange={(tickMarks) => edit({ shape: { tickMarks } })} />
            <Toggle label="Value axis line" on={shape.valueAxisLine} onChange={(valueAxisLine) => edit({ shape: { valueAxisLine } })} />
            <Toggle label="Baseline" on={shape.baseline} onChange={(baseline) => edit({ shape: { baseline } })} />
          </Chips>
        </Group>

        <Group title="Text">
          <Segmented label="Axis labels" options={VALUE_LABELS} value={shape.valueLabels} onChange={(valueLabels) => edit({ shape: { valueLabels } })} />
          <Chips>
            <Toggle label="Values on the bars" on={shape.dataLabels} onChange={(dataLabels) => edit({ shape: { dataLabels } })} />
            <Toggle label="Category labels" on={shape.categoryLabels} onChange={(categoryLabels) => edit({ shape: { categoryLabels } })} />
          </Chips>
          <Segmented
            label="Title"
            options={TITLES.map(({ value, label }) => ({ value, label }))}
            value={titleChoice}
            onChange={(value) => edit({ shape: { title: TITLE_TEXT[value as TitleChoice] } })}
          />
          <Segmented
            label="Text size"
            options={TEXT_SIZES.map(({ value, label }) => ({ value, label }))}
            value={textSize}
            onChange={(value) => {
              const size = TEXT_SIZES.find((t) => t.value === value)!;
              edit({ shape: { titleSize: size.title, labelSize: size.labels } });
            }}
          />
        </Group>
      </div>
    </StickyLayout>
  );
};

export default FixChart;
