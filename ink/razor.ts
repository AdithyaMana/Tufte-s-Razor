import { applyPreset, PRESETS, resolveSpec, type Look, type Shape } from './presets.ts';
import type { ChartSpec } from './spec.ts';

// The razor: one cluttered chart, cleaned up a step at a time — first non-data ink, then
// repeated data-ink, then one step too far. Each step keeps everything the previous step
// erased, so the data-ink ratio rises all the way.

export interface RazorStep {
  /** What this step erases, in a few words (read after “Erased:”). */
  label: string;
  /** What the reader should notice. */
  caption: string;
  shape?: Partial<Shape>;
  look?: Partial<Look>;
}

export const RAZOR_STEPS: RazorStep[] = [
  {
    label: 'nothing yet',
    caption: 'A chart with every default and decoration switched on. Only a sliver of its ink shows the five values.',
  },
  {
    label: 'the shaded background',
    caption: 'The shaded background was the biggest piece of non-data ink on the chart.',
    look: { plotFill: 'none' },
  },
  {
    label: 'gridlines, box and ticks',
    caption: 'Thin lines, so the ratio barely moves: most of the ink is still in the bars.',
    shape: { gridlines: false, plotBorder: false, tickMarks: false, chartBorder: false },
  },
  {
    label: 'outlines and heavy type',
    caption: 'Outlines and oversized type are gone, and every value is still there.',
    shape: { titleSize: 18, labelSize: 11 },
    look: { outline: false },
  },
  {
    label: 'extra bar width',
    caption: 'The biggest cut. A bar shows its value by its length; its width only repeats it.',
    shape: { barWidth: 0.31 },
  },
  {
    label: 'repeated labels',
    caption: 'Each value now appears once, on its bar. This is a good place to stop.',
    shape: { valueLabels: 'none', valueAxisLine: false },
  },
  {
    label: 'the labels and axis, too',
    caption: 'Nothing left to erase — and nothing left to read. Erase, but within reason.',
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
