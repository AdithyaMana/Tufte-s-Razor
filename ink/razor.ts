import { applyPreset, PRESETS, resolveSpec, type Look, type Shape } from './presets.ts';
import { DEFAULT_LABEL_SIZE, DEFAULT_TITLE_SIZE, type ChartSpec } from './spec.ts';

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
    shape: { barWidth: 0.31 },
  },
  {
    label: 'repeated labels',
    shape: { valueLabels: 'none', valueAxisLine: false },
  },
  {
    label: 'the labels and axis, too',
    shape: { barWidth: 0, dataLabels: false, categoryLabels: false, title: null, baseline: false },
  },
];

/** The chart after the first `step` cuts of the razor. */
export function razorSpec(step: number, isDark: boolean): ChartSpec {
  const start = applyPreset(PRESETS.find((p) => p.id === 'everything')!);
  let shape = start.shape;
  // Drawn on the page's own paper, in either theme.
  let look: Look = { ...start.look, background: 'theme', bars: 'theme' };
  for (const s of RAZOR_STEPS.slice(0, step + 1)) {
    shape = { ...shape, ...s.shape };
    look = { ...look, ...s.look };
  }
  return resolveSpec(shape, look, isDark);
}
