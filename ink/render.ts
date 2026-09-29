import type { ChartLayout, TextItem } from './layout.ts';
import { CHART_FONT_FAMILY, ChartSpec } from './spec.ts';

/** The three kinds of ink the guide counts. The chart's background is never ink. */
export type InkKind = 'data' | 'redundant' | 'nonData';

export type LayerId = 'structure' | 'bars' | 'outline' | 'essential' | 'text' | 'dataLabels';

/**
 * Drawing order, bottom to top. Each layer is drawn (and counted) separately, so a pixel
 * belongs to whichever layer is visible on top of it — gridlines hidden behind a bar
 * are not ink, because nobody can see them.
 */
export const LAYERS: ReadonlyArray<{ id: LayerId; kind: InkKind }> = [
  // Plot-area fill, gridlines, borders, axis lines and tick marks.
  { id: 'structure', kind: 'nonData' },
  // Whole bars. The hairline that carries each value is drawn on top and counted as data.
  { id: 'bars', kind: 'redundant' },
  { id: 'outline', kind: 'redundant' },
  { id: 'essential', kind: 'data' },
  // Title, value-axis labels and category labels.
  { id: 'text', kind: 'nonData' },
  // Values printed on the bars repeat what the bar lengths already show.
  { id: 'dataLabels', kind: 'redundant' },
];

export interface LayerPaint {
  plotFill: string;
  grid: string;
  line: string;
  bar: string;
  outline: string;
  /** null draws no separate hairline (the normal view: it is just part of the bar). */
  essential: string | null;
  text: string;
  dataLabel: string;
}

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

export function drawLayer(
  ctx: CanvasRenderingContext2D,
  id: LayerId,
  layout: ChartLayout,
  spec: ChartSpec,
  paint: LayerPaint,
) {
  const { plot } = layout;
  const plotBottom = plot.y + plot.h;
  ctx.lineWidth = 1;

  switch (id) {
    case 'structure': {
      if (spec.plotFill) {
        ctx.fillStyle = paint.plotFill;
        ctx.fillRect(plot.x, plot.y, plot.w, plot.h);
      }
      if (layout.gridValues.length) {
        ctx.strokeStyle = paint.grid;
        ctx.beginPath();
        for (const value of layout.gridValues) {
          const y = Math.round(layout.yOf(value)) + 0.5;
          ctx.moveTo(plot.x, y);
          ctx.lineTo(plot.x + plot.w, y);
        }
        ctx.stroke();
      }
      ctx.strokeStyle = paint.line;
      if (spec.plotBorder) ctx.strokeRect(plot.x + 0.5, plot.y + 0.5, plot.w - 1, plot.h - 1);
      if (spec.chartBorder) ctx.strokeRect(0.5, 0.5, layout.width - 1, layout.height - 1);
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
          const x = Math.round(plot.x + layout.slot * i) + 0.5;
          ctx.moveTo(x, plotBottom + 1);
          ctx.lineTo(x, plotBottom + 1 + TICK);
        }
      }
      ctx.stroke();
      break;
    }
    case 'bars': {
      ctx.fillStyle = paint.bar;
      for (const bar of layout.bars) ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
      break;
    }
    case 'outline': {
      if (!spec.barOutline) break;
      // Centred on the bar's edge, like a spreadsheet outline: half of it sits outside the fill.
      ctx.strokeStyle = paint.outline;
      ctx.lineWidth = 2;
      for (const bar of layout.bars) ctx.strokeRect(bar.x, bar.y, bar.w, bar.h);
      break;
    }
    case 'essential': {
      if (!paint.essential) break;
      ctx.fillStyle = paint.essential;
      for (const bar of layout.bars) {
        const e = bar.essential;
        ctx.fillRect(e.x, e.y, e.w, e.h);
      }
      break;
    }
    case 'text': {
      ctx.fillStyle = paint.text;
      if (layout.title) drawText(ctx, layout.title);
      for (const item of layout.valueLabels) drawText(ctx, item);
      for (const item of layout.categoryLabels) drawText(ctx, item);
      break;
    }
    case 'dataLabels': {
      ctx.fillStyle = paint.dataLabel;
      for (const item of layout.dataLabels) drawText(ctx, item);
      break;
    }
  }
}

/** The chart as a reader sees it. */
export function chartPaint(spec: ChartSpec): LayerPaint {
  return {
    plotFill: spec.plotFill ?? 'transparent',
    grid: spec.gridColor,
    line: spec.lineColor,
    bar: spec.barColor,
    outline: spec.barOutline ?? spec.barColor,
    essential: null,
    text: spec.textColor,
    dataLabel: spec.textColor,
  };
}

export interface InkMapColours {
  data: string;
  redundant: string;
  nonData: string;
}

/** The same chart with every pixel coloured by the kind of ink it is. */
export function inkMapPaint(colours: InkMapColours): LayerPaint {
  return {
    plotFill: colours.nonData,
    grid: colours.nonData,
    line: colours.nonData,
    bar: colours.redundant,
    outline: colours.redundant,
    essential: colours.data,
    text: colours.nonData,
    dataLabel: colours.redundant,
  };
}

/** One colour channel per kind of ink, for counting (see sumChannels in measure.ts). */
export const INK_CHANNEL: Record<InkKind, string> = { data: '#ff0000', redundant: '#00ff00', nonData: '#0000ff' };

/** The offscreen counting render: every element painted in its kind's channel. */
export const COUNT_PAINT: LayerPaint = {
  plotFill: INK_CHANNEL.nonData,
  grid: INK_CHANNEL.nonData,
  line: INK_CHANNEL.nonData,
  bar: INK_CHANNEL.redundant,
  outline: INK_CHANNEL.redundant,
  essential: INK_CHANNEL.data,
  text: INK_CHANNEL.nonData,
  dataLabel: INK_CHANNEL.redundant,
};
