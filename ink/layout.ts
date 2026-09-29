import { CHART_HEIGHT, CHART_WIDTH, ChartSpec, ESSENTIAL_WIDTH, orderedData } from './spec.ts';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BarGeometry extends Rect {
  label: string;
  value: number;
  /** Centre of the category's slot. */
  cx: number;
  /** The hairline inside the bar that carries its value (the essential data-ink). */
  essential: Rect;
}

export interface TextItem {
  text: string;
  x: number;
  y: number;
  size: number;
  align: CanvasTextAlign;
  baseline: CanvasTextBaseline;
}

export interface ChartLayout {
  width: number;
  height: number;
  plot: Rect;
  yMax: number;
  /** Values that get a label (and a tick mark) on the vertical axis. */
  labelValues: number[];
  /** Values that get a gridline. */
  gridValues: number[];
  slot: number;
  /** Left edge of the first category's slot. */
  slotStart: number;
  bars: BarGeometry[];
  title: TextItem | null;
  valueLabels: TextItem[];
  categoryLabels: TextItem[];
  dataLabels: TextItem[];
  /** y position of a value, in px. */
  yOf: (value: number) => number;
}

/** Measures text width in px for a given font size. */
export type TextMeasurer = (text: string, size: number) => number;

/** Space between the chart's edge and anything drawn on it. */
export const PAD = 12;
const TICK = 5;
/** Plot width of the default chart; bar widths are shares of a slot at this width. */
export const REFERENCE_PLOT_WIDTH = 420;

/** Rounds a maximum up to a tidy axis end: 9 → 10, 42 → 50, 180 → 200. */
export function niceMax(max: number): number {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (m * magnitude >= max) return m * magnitude;
  }
  return 10 * magnitude;
}

/**
 * Picks the axis step (1, 2, 5, 10…) so labels stay at least ~1.6 line-heights apart,
 * the way spreadsheet tools thin out labels as the font grows.
 */
export function tickStep(yMax: number, plotHeight: number, labelSize: number): number {
  const minGap = labelSize * 1.6;
  const magnitude = 10 ** Math.floor(Math.log10(yMax / 10 || 1));
  for (const m of [1, 2, 5, 10, 20, 50]) {
    const step = m * magnitude;
    if ((step / yMax) * plotHeight >= minGap) return step;
  }
  return yMax;
}

function range(step: number, max: number): number[] {
  const values: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) values.push(Math.round(v * 1e6) / 1e6);
  return values;
}

export function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function computeLayout(spec: ChartSpec, measure: TextMeasurer): ChartLayout {
  const width = CHART_WIDTH;
  const height = CHART_HEIGHT;
  const data = orderedData(spec);
  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const yMax = niceMax(maxValue);

  const titleBlock = spec.title ? spec.titleSize * 1.2 + 12 : 0;
  const top = PAD + titleBlock + (spec.valueLabels !== 'none' ? spec.labelSize * 0.6 : 4);
  const categoryBlock = spec.categoryLabels ? spec.labelSize * 1.2 + 10 : 6;
  const bottom = height - PAD - categoryBlock;

  // Leave room above the tallest bar for its data label.
  let plotTop = top;
  if (spec.dataLabels) {
    const headroom = spec.labelSize + 10;
    const plotHeight = bottom - top;
    const gap = (1 - maxValue / yMax) * plotHeight;
    if (gap < headroom) plotTop = top + (headroom - gap) / (maxValue / yMax || 1);
  }
  const plotHeight = bottom - plotTop;

  const step = tickStep(yMax, plotHeight, spec.labelSize);
  const allTicks = range(step, yMax);
  let labelValues: number[];
  switch (spec.valueLabels) {
    case 'all':
      labelValues = allTicks;
      break;
    case 'ends':
      labelValues = [0, yMax];
      break;
    case 'data':
      labelValues = [...new Set([0, yMax, ...data.map((d) => d.value)])].sort((a, b) => a - b);
      break;
    default:
      labelValues = [];
  }

  const labelWidth = labelValues.length
    ? Math.max(...labelValues.map((v) => measure(formatValue(v), spec.labelSize))) + 7
    : 0;
  const left = PAD + labelWidth + (spec.tickMarks ? TICK : 0) + (labelValues.length ? 4 : 8);
  const right = width - PAD - 10;

  const plot: Rect = {
    x: Math.round(left),
    y: Math.round(plotTop),
    w: Math.round(right - left),
    h: Math.round(bottom - plotTop),
  };
  const plotBottom = plot.y + plot.h;
  const yOf = (value: number) => plotBottom - (value / yMax) * plot.h;

  // Whole-pixel slots, centred in the plot, so every gap between bars is exactly the same.
  const slot = Math.floor(plot.w / data.length);
  const slotsLeft = plot.x + Math.floor((plot.w - slot * data.length) / 2);
  // Bars are sized against a standard plot width, so they keep their pixel width when
  // labels are added, removed or resized around them. Otherwise a label change would also
  // change how much redundant bar ink there is, and muddle every comparison.
  const referenceSlot = REFERENCE_PLOT_WIDTH / data.length;
  const barPx = Math.min(Math.round(spec.barWidth * referenceSlot), slot);
  const bars: BarGeometry[] = data.map((d, i) => {
    const w = Math.max(ESSENTIAL_WIDTH, barPx);
    const x = slotsLeft + i * slot + Math.floor((slot - w) / 2);
    const cx = x + w / 2;
    const top = Math.round(yOf(d.value));
    const h = plotBottom - top;
    const ew = Math.min(w, ESSENTIAL_WIDTH);
    const ex = x + Math.floor((w - ew) / 2);
    return { label: d.label, value: d.value, cx, x, y: top, w, h, essential: { x: ex, y: top, w: ew, h } };
  });

  const title: TextItem | null = spec.title
    ? { text: spec.title, x: PAD, y: PAD + spec.titleSize * 0.95, size: spec.titleSize, align: 'left', baseline: 'alphabetic' }
    : null;

  const valueLabels: TextItem[] = labelValues.map((v) => ({
    text: formatValue(v),
    x: plot.x - (spec.tickMarks ? TICK : 0) - 6,
    y: yOf(v),
    size: spec.labelSize,
    align: 'right',
    baseline: 'middle',
  }));

  const categoryLabels: TextItem[] = spec.categoryLabels
    ? bars.map((b) => ({ text: b.label, x: b.cx, y: plotBottom + 8, size: spec.labelSize, align: 'center', baseline: 'top' }))
    : [];

  const dataLabels: TextItem[] = spec.dataLabels
    ? bars.map((b) => ({ text: formatValue(b.value), x: b.cx, y: b.y - 6, size: spec.labelSize, align: 'center', baseline: 'alphabetic' }))
    : [];

  const gridValues = spec.gridlines ? allTicks.filter((v) => v > 0 || !spec.baseline) : [];

  return { width, height, plot, yMax, labelValues, gridValues, slot, slotStart: slotsLeft, bars, title, valueLabels, categoryLabels, dataLabels, yOf };
}
