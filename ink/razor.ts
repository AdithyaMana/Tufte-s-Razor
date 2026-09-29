import { applyPreset, PRESETS, resolveSpec, type Look, type Shape } from './presets.ts';
import { DEFAULT_LABEL_SIZE, DEFAULT_TITLE_SIZE, FINDING_TITLE, type ChartSpec } from './spec.ts';

// The razor: one cluttered chart, cleaned up a step at a time — first non-data ink, then
// repeated data-ink, then one step too far. Each step keeps everything the previous step
// erased, so the data-ink ratio rises all the way.

export interface RazorStep {
  /** What this step erases, in a few words. */
  label: string;
  shape?: Partial<Shape>;
  look?: Partial<Look>;
}

export const RAZOR_STEPS: RazorStep[] = [
  { label: 'nothing yet' },
  {
    label: 'the shaded background',
    look: { plotFill: 'none' },
  },
  {
    label: 'gridlines, box and ticks',
    shape: { gridlines: false, plotBorder: false, tickMarks: false, chartBorder: false },
  },
  {
    label: 'outlines and heavy type',
    shape: { titleSize: DEFAULT_TITLE_SIZE, labelSize: DEFAULT_LABEL_SIZE },
    look: { outline: false },
  },
  {
    label: 'extra bar width',
    // Half of each slot: wide enough to compare easily, within the 50–67% many designers recommend.
    shape: { barWidth: 0.5 },
  },
  {
    label: 'repeated labels, and a vague title',
    shape: { valueLabels: 'none', valueAxisLine: false, sorted: true, title: FINDING_TITLE },
  },
  {
    label: 'the labels and axis, too',
    shape: { barWidth: 0, dataLabels: false, categoryLabels: false, title: null, baseline: false },
  },
];

/** The step the guide recommends stopping at: every value said once, and a title that says what it shows. */
export const STOP_STEP = 5;

/** The shape and look after the first `step` cuts: each keeps everything earlier cuts erased. */
export function razorShapeAndLook(step: number): { shape: Shape; look: Look } {
  const start = applyPreset(PRESETS.find((p) => p.id === 'everything')!);
  let shape = start.shape;
  // Drawn on the page's own paper, in either theme.
  let look: Look = { ...start.look, background: 'theme', bars: 'theme' };
  for (const s of RAZOR_STEPS.slice(0, step + 1)) {
    shape = { ...shape, ...s.shape };
    look = { ...look, ...s.look };
  }
  return { shape, look };
}

/** The chart after the first `step` cuts of the razor. */
export function razorSpec(step: number, isDark: boolean): ChartSpec {
  const { shape, look } = razorShapeAndLook(step);
  return resolveSpec(shape, look, isDark);
}
