import type { ChartLayout, Rect, TextItem, TextMeasurer } from './layout.ts';
import type { InkGroup } from './render.ts';
import type { ChartSpec } from './spec.ts';

// Pointing at a chart: what the reader is pointing at, in the words they would use for it.

/** A part of a chart a reader can point at. */
export type InkPart =
  | 'bars'
  | 'dataLabels'
  | 'title'
  | 'valueLabels'
  | 'categoryLabels'
  | 'axes'
  | 'borders'
  | 'gridlines'
  | 'plotFill'
  | 'paper';

/** The ink groups that make up each part. The paper has none: it isn't ink. */
export const PART_GROUPS: Record<InkPart, readonly InkGroup[]> = {
  bars: ['hairlines', 'barWidth', 'outlines'],
  dataLabels: ['dataLabels'],
  title: ['title'],
  valueLabels: ['valueLabels'],
  categoryLabels: ['categoryLabels'],
  axes: ['axes'],
  borders: ['borders'],
  gridlines: ['gridlines'],
  plotFill: ['plotFill'],
  paper: [],
};

/** The area a line of text covers, from its anchor, alignment and baseline. */
export function textBox(item: TextItem, measure: TextMeasurer): Rect {
  const w = measure(item.text, item.size);
  const x = item.align === 'center' ? item.x - w / 2 : item.align === 'right' || item.align === 'end' ? item.x - w : item.x;
  const s = item.size;
  const [top, bottom] =
    item.baseline === 'middle' ? [-0.45 * s, 0.45 * s] : item.baseline === 'top' ? [0, 0.85 * s] : [-0.78 * s, 0.22 * s];
  return { x, y: item.y + top, w, h: bottom - top };
}

function inside(r: Rect, x: number, y: number, pad = 0): boolean {
  return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;
}

function nearSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number, tolerance: number): boolean {
  // Axis-aligned segments only.
  if (y1 === y2) return Math.abs(y - y1) <= tolerance && x >= Math.min(x1, x2) - tolerance && x <= Math.max(x1, x2) + tolerance;
  return Math.abs(x - x1) <= tolerance && y >= Math.min(y1, y2) - tolerance && y <= Math.max(y1, y2) + tolerance;
}

function nearRectEdge(r: Rect, x: number, y: number, tolerance: number): boolean {
  const right = r.x + r.w;
  const bottom = r.y + r.h;
  return (
    nearSegment(x, y, r.x, r.y, right, r.y, tolerance) ||
    nearSegment(x, y, r.x, bottom, right, bottom, tolerance) ||
    nearSegment(x, y, r.x, r.y, r.x, bottom, tolerance) ||
    nearSegment(x, y, right, r.y, right, bottom, tolerance)
  );
}

/**
 * The part of the chart at (x, y), in chart px. Parts drawn on top win, and thin marks
 * (lines, hairline bars) can be hit from up to `tolerance` px away, so they can be pointed
 * at with a finger. Anything else is the paper.
 */
export function hitTest(layout: ChartLayout, spec: ChartSpec, x: number, y: number, tolerance: number, measure: TextMeasurer): InkPart {
  const { plot } = layout;
  const plotBottom = plot.y + plot.h;
  const textPad = Math.min(tolerance / 2, 4);
  const onText = (items: TextItem[]) => items.some((item) => inside(textBox(item, measure), x, y, textPad));

  if (onText(layout.dataLabels)) return 'dataLabels';
  if (onText(layout.categoryLabels)) return 'categoryLabels';
  if (onText(layout.valueLabels)) return 'valueLabels';
  if (layout.title && onText([layout.title])) return 'title';

  for (const bar of layout.bars) {
    const halfWidth = Math.max(bar.w / 2, tolerance);
    const centre = bar.x + bar.w / 2;
    if (Math.abs(x - centre) <= halfWidth && y >= bar.y - tolerance / 2 && y <= plotBottom) return 'bars';
  }

  const axisTolerance = Math.max(tolerance, 3);
  if (spec.baseline && nearSegment(x, y, plot.x, plotBottom, plot.x + plot.w, plotBottom, axisTolerance)) return 'axes';
  if (spec.valueAxisLine && nearSegment(x, y, plot.x, plot.y, plot.x, plotBottom, axisTolerance)) return 'axes';
  if (spec.tickMarks) {
    const nearTick =
      layout.labelValues.some((v) => nearSegment(x, y, plot.x - 6, layout.yOf(v), plot.x, layout.yOf(v), axisTolerance)) ||
      layout.bars.some((_, i) => {
        const tx = plot.x + layout.slot * i;
        return nearSegment(x, y, tx, plotBottom, tx, plotBottom + 6, axisTolerance);
      }) ||
      nearSegment(x, y, plot.x + plot.w, plotBottom, plot.x + plot.w, plotBottom + 6, axisTolerance);
    if (nearTick) return 'axes';
  }

  if (spec.plotBorder && nearRectEdge(plot, x, y, axisTolerance)) return 'borders';
  if (spec.chartBorder && nearRectEdge({ x: 0, y: 0, w: layout.width, h: layout.height }, x, y, axisTolerance)) return 'borders';

  if (inside(plot, x, y)) {
    for (const value of layout.gridValues) {
      if (Math.abs(y - layout.yOf(value)) <= axisTolerance) return 'gridlines';
    }
    if (spec.plotFill) return 'plotFill';
  }
  return 'paper';
}

/** The parts this chart has, in the order a keyboard steps through them. */
export function presentParts(layout: ChartLayout, spec: ChartSpec): InkPart[] {
  const parts: InkPart[] = [];
  if (layout.title) parts.push('title');
  parts.push('bars');
  if (layout.dataLabels.length) parts.push('dataLabels');
  if (layout.valueLabels.length) parts.push('valueLabels');
  if (layout.categoryLabels.length) parts.push('categoryLabels');
  if (layout.gridValues.length) parts.push('gridlines');
  if (spec.baseline || spec.valueAxisLine || spec.tickMarks) parts.push('axes');
  if (spec.chartBorder || spec.plotBorder) parts.push('borders');
  if (spec.plotFill) parts.push('plotFill');
  parts.push('paper');
  return parts;
}

/** Where a tooltip for a part can point, e.g. when it is chosen from the keyboard. */
export function partAnchor(part: InkPart, layout: ChartLayout, spec: ChartSpec, measure: TextMeasurer): { x: number; y: number } {
  const { plot } = layout;
  const centreOf = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
  const middle = <T>(items: T[]) => items[Math.floor((items.length - 1) / 2)];
  switch (part) {
    case 'bars': {
      const bar = middle(layout.bars);
      return { x: bar.x + bar.w / 2, y: bar.y + bar.h * 0.4 };
    }
    case 'dataLabels':
      return centreOf(textBox(middle(layout.dataLabels), measure));
    case 'title':
      return layout.title ? centreOf(textBox(layout.title, measure)) : { x: layout.width / 2, y: 12 };
    case 'valueLabels':
      return centreOf(textBox(middle(layout.valueLabels), measure));
    case 'categoryLabels':
      return centreOf(textBox(middle(layout.categoryLabels), measure));
    case 'gridlines': {
      const value = layout.gridValues[layout.gridValues.length - 1];
      return { x: plot.x + plot.w - 12, y: layout.yOf(value) };
    }
    case 'axes':
      return spec.baseline ? { x: plot.x + plot.w - 12, y: plot.y + plot.h } : { x: plot.x, y: plot.y + plot.h / 2 };
    case 'borders':
      return spec.plotBorder ? { x: plot.x + plot.w, y: plot.y + plot.h / 2 } : { x: layout.width - 1, y: layout.height / 2 };
    case 'plotFill':
      return { x: plot.x + plot.w - 20, y: plot.y + 16 };
    case 'paper':
      return { x: layout.width - 16, y: layout.height - 10 };
  }
}
