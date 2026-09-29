import type { ChartLayout, TextItem } from './layout.ts';
import { CHART_FONT_FAMILY, ChartSpec } from './spec.ts';

/** The three kinds of ink the guide counts. The chart's background is never ink. */
export type InkKind = 'data' | 'redundant' | 'nonData';

/** Every mark on a chart belongs to one of these groups, and each group to one kind of ink. */
export type InkGroup =
  | 'plotFill'
  | 'gridlines'
  | 'borders'
  | 'axes'
  | 'barWidth'
  | 'outlines'
  | 'hairlines'
  | 'title'
  | 'valueLabels'
  | 'categoryLabels'
  | 'dataLabels';

/**
 * Drawing order, bottom to top. A pixel belongs to whichever group is visible on top of
 * it: gridlines hidden behind a bar are not ink, because nobody can see them.
 */
export const GROUPS: ReadonlyArray<{ id: InkGroup; kind: InkKind }> = [
  { id: 'plotFill', kind: 'nonData' },
  { id: 'gridlines', kind: 'nonData' },
  // Chart border and the box around the plot.
  { id: 'borders', kind: 'nonData' },
  // Baseline, value-axis line and tick marks.
  { id: 'axes', kind: 'nonData' },
  // Whole bars. The hairline that carries each value is drawn on top and counted as data.
  { id: 'barWidth', kind: 'redundant' },
  { id: 'outlines', kind: 'redundant' },
  { id: 'hairlines', kind: 'data' },
  { id: 'title', kind: 'nonData' },
  { id: 'valueLabels', kind: 'nonData' },
  { id: 'categoryLabels', kind: 'nonData' },
  // Values printed on the bars repeat what the bar lengths already show.
  { id: 'dataLabels', kind: 'redundant' },
];

export const GROUP_KIND = Object.fromEntries(GROUPS.map((g) => [g.id, g.kind])) as Record<InkGroup, InkKind>;

/** The colour to draw each group in, or null to leave it out. */
export type Paint = (group: InkGroup, kind: InkKind) => string | null;

const TICK = 5;

export function chartFont(size: number): string {
  return `400 ${size}px ${CHART_FONT_FAMILY}`;
}

function drawText(ctx: CanvasRenderingContext2D, item: TextItem) {
  ctx.font = chartFont(item.size);
  ctx.textAlign = item.align;
  ctx.textBaseline = item.baseline;
  ctx.fillText(item.text, item.x, item.y);
}

/** Draws one group in one colour. Groups the chart doesn't have draw nothing. */
export function drawGroup(ctx: CanvasRenderingContext2D, id: InkGroup, layout: ChartLayout, spec: ChartSpec, colour: string) {
  const { plot } = layout;
  const plotBottom = plot.y + plot.h;
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;

  switch (id) {
    case 'plotFill':
      if (spec.plotFill) ctx.fillRect(plot.x, plot.y, plot.w, plot.h);
      break;
    case 'gridlines':
      if (!layout.gridValues.length) break;
      ctx.beginPath();
      for (const value of layout.gridValues) {
        const y = Math.round(layout.yOf(value)) + 0.5;
        ctx.moveTo(plot.x, y);
        ctx.lineTo(plot.x + plot.w, y);
      }
      ctx.stroke();
      break;
    case 'borders':
      if (spec.plotBorder) ctx.strokeRect(plot.x + 0.5, plot.y + 0.5, plot.w - 1, plot.h - 1);
      if (spec.chartBorder) ctx.strokeRect(0.5, 0.5, layout.width - 1, layout.height - 1);
      break;
    case 'axes':
      ctx.beginPath();
      if (spec.baseline) {
        ctx.moveTo(plot.x, plotBottom + 0.5);
        ctx.lineTo(plot.x + plot.w, plotBottom + 0.5);
      }
      if (spec.valueAxisLine) {
        ctx.moveTo(plot.x - 0.5, plot.y);
        ctx.lineTo(plot.x - 0.5, plotBottom + 1);
      }
      if (spec.tickMarks) {
        for (const value of layout.labelValues) {
          const y = Math.round(layout.yOf(value)) + 0.5;
          ctx.moveTo(plot.x - 1 - TICK, y);
          ctx.lineTo(plot.x - 1, y);
        }
        for (let i = 0; i <= layout.bars.length; i++) {
          const x = Math.round(layout.slotStart + layout.slot * i) + 0.5;
          ctx.moveTo(x, plotBottom + 1);
          ctx.lineTo(x, plotBottom + 1 + TICK);
        }
      }
      ctx.stroke();
      break;
    case 'barWidth':
      for (const bar of layout.bars) ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
      break;
    case 'outlines':
      if (!spec.barOutline) break;
      // Centred on the bar's edge, like a spreadsheet outline: half of it sits outside the fill.
      ctx.lineWidth = 2;
      for (const bar of layout.bars) ctx.strokeRect(bar.x, bar.y, bar.w, bar.h);
      break;
    case 'hairlines':
      for (const { essential: e } of layout.bars) ctx.fillRect(e.x, e.y, e.w, e.h);
      break;
    case 'title':
      if (layout.title) drawText(ctx, layout.title);
      break;
    case 'valueLabels':
      for (const item of layout.valueLabels) drawText(ctx, item);
      break;
    case 'categoryLabels':
      for (const item of layout.categoryLabels) drawText(ctx, item);
      break;
    case 'dataLabels':
      for (const item of layout.dataLabels) drawText(ctx, item);
      break;
  }
}

/** Draws every group, bottom to top, in the colours `paint` gives them. */
export function drawChart(ctx: CanvasRenderingContext2D, layout: ChartLayout, spec: ChartSpec, paint: Paint) {
  for (const { id, kind } of GROUPS) {
    const colour = paint(id, kind);
    if (colour) drawGroup(ctx, id, layout, spec, colour);
  }
}

/** The chart as a reader sees it. */
export function chartPaint(spec: ChartSpec): Paint {
  return (group) => {
    switch (group) {
      case 'plotFill':
        return spec.plotFill;
      case 'gridlines':
        return spec.gridColor;
      case 'borders':
      case 'axes':
        return spec.lineColor;
      case 'barWidth':
        return spec.barColor;
      case 'outlines':
        return spec.barOutline;
      case 'hairlines':
        // Not drawn separately: to a reader it is just part of the bar.
        return null;
      default:
        return spec.textColor;
    }
  };
}

export type InkMapColours = Record<InkKind, string>;

/** The same chart with every mark coloured by the kind of ink it is. */
export function inkMapPaint(colours: InkMapColours): Paint {
  return (_, kind) => colours[kind];
}

/** One colour channel per kind of ink, for counting (see sumChannels in measure.ts). */
export const INK_CHANNEL: Record<InkKind, string> = { data: '#ff0000', redundant: '#00ff00', nonData: '#0000ff' };

/** The offscreen counting render: every mark painted in its kind's channel. */
export const countPaint: Paint = (_, kind) => INK_CHANNEL[kind];

/**
 * Draws some groups as they show on the finished chart: each group is drawn where it is
 * visible, and every other group erases whatever it covers, so ink hidden under other ink
 * stays hidden. Used to count one group at a time, and to highlight parts of a chart.
 */
export function drawVisible(
  ctx: CanvasRenderingContext2D,
  layout: ChartLayout,
  spec: ChartSpec,
  colourOf: (group: InkGroup, kind: InkKind) => string | null,
) {
  for (const { id, kind } of GROUPS) {
    const colour = colourOf(id, kind);
    ctx.globalCompositeOperation = colour ? 'source-over' : 'destination-out';
    drawGroup(ctx, id, layout, spec, colour ?? '#000000');
  }
  ctx.globalCompositeOperation = 'source-over';
}
