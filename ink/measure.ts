import { computeLayout, type TextMeasurer } from './layout.ts';
import { chartFont, countPaint, drawChart, drawVisible, GROUPS, INK_CHANNEL, type InkGroup } from './render.ts';
import { CHART_HEIGHT, CHART_WIDTH, ChartSpec } from './spec.ts';

export interface InkStats {
  /** Essential data-ink: the hairline length of every bar, in px. */
  data: number;
  /** Data-ink that repeats a value already shown: extra bar width, outlines, value labels. */
  redundant: number;
  /** Everything else: axes, gridlines, borders, fills, titles and labels. */
  nonData: number;
  total: number;
  /** Tufte's data-ink ratio: non-redundant data-ink ÷ total ink. */
  ratio: number;
  /** The naive version: all data-ink, redundant or not, ÷ total ink. */
  dataShare: number;
}

/**
 * Adds up how much of each kind of ink a counting render left visible.
 *
 * The counting render paints each kind of ink in its own colour channel (data red,
 * redundant green, non-data blue) on a transparent canvas, bottom layer first. Ordinary
 * paint compositing then does the bookkeeping: where ink overlaps, the top layer claims its
 * share of the pixel and whatever shows through keeps the rest, so anti-aliased edges count
 * fractionally and hidden ink counts not at all. Each channel, weighted by the pixel's
 * alpha, is that kind's share of the pixel. (Image data comes un-premultiplied, hence the
 * product with alpha.)
 */
export function sumChannels(rgba: ArrayLike<number>): { data: number; redundant: number; nonData: number } {
  let red = 0;
  let green = 0;
  let blue = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const alpha = rgba[i + 3];
    if (alpha === 0) continue;
    red += rgba[i] * alpha;
    green += rgba[i + 1] * alpha;
    blue += rgba[i + 2] * alpha;
  }
  const scale = 1 / (255 * 255);
  return { data: red * scale, redundant: green * scale, nonData: blue * scale };
}

export function toStats(sums: { data: number; redundant: number; nonData: number }): InkStats {
  const total = sums.data + sums.redundant + sums.nonData;
  return {
    ...sums,
    total,
    ratio: total > 0 ? sums.data / total : 0,
    dataShare: total > 0 ? (sums.data + sums.redundant) / total : 0,
  };
}

let context: CanvasRenderingContext2D | null = null;

function counterContext(): CanvasRenderingContext2D {
  if (!context) {
    const canvas = document.createElement('canvas');
    canvas.width = CHART_WIDTH;
    canvas.height = CHART_HEIGHT;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D is not available.');
    context = ctx;
  }
  return context;
}

/** Text widths from the same canvas the charts are drawn with. */
export const measureText: TextMeasurer = (text, size) => {
  const ctx = counterContext();
  ctx.font = chartFont(size);
  return ctx.measureText(text).width;
};

// Colours never change a count, so they are left out of the cache key.
function countKey(spec: ChartSpec): string {
  const { background, barColor, textColor, lineColor, gridColor, barOutline, plotFill, ...shape } = spec;
  return JSON.stringify({ ...shape, outline: !!barOutline, fill: !!plotFill });
}

const CACHE_LIMIT = 600;
const cache = new Map<string, InkStats>();
const groupCache = new Map<string, Record<InkGroup, number>>();

function remember<T>(map: Map<string, T>, key: string, value: T): T {
  if (map.size >= CACHE_LIMIT) map.delete(map.keys().next().value as string);
  map.set(key, value);
  return value;
}

/** Forget cached counts, e.g. once web fonts finish loading and text widths change. */
export function clearInkCache() {
  cache.clear();
  groupCache.clear();
}

function readSums(ctx: CanvasRenderingContext2D) {
  return sumChannels(ctx.getImageData(0, 0, CHART_WIDTH, CHART_HEIGHT).data);
}

/**
 * Draws the chart offscreen at its fixed size, each kind of ink in its own colour channel,
 * and counts every pixel of ink by kind.
 */
export function measureChart(spec: ChartSpec): InkStats {
  const key = countKey(spec);
  const hit = cache.get(key);
  if (hit) return hit;

  const ctx = counterContext();
  const layout = computeLayout(spec, measureText);
  ctx.clearRect(0, 0, CHART_WIDTH, CHART_HEIGHT);
  drawChart(ctx, layout, spec, countPaint);
  return remember(cache, key, toStats(readSums(ctx)));
}

const CHANNELS = [INK_CHANNEL.data, INK_CHANNEL.redundant, INK_CHANNEL.nonData];

/**
 * The visible ink of every group, in px: what pointing at one part of a chart reports.
 * Three groups are counted per pass, one per colour channel, while the rest only hide what
 * they cover; the groups of each kind add up to that kind's total in measureChart.
 */
export function measureGroups(spec: ChartSpec): Record<InkGroup, number> {
  const key = countKey(spec);
  const hit = groupCache.get(key);
  if (hit) return hit;

  const ctx = counterContext();
  const layout = computeLayout(spec, measureText);
  const result = {} as Record<InkGroup, number>;
  for (let first = 0; first < GROUPS.length; first += CHANNELS.length) {
    const targets = GROUPS.slice(first, first + CHANNELS.length).map((g) => g.id);
    ctx.clearRect(0, 0, CHART_WIDTH, CHART_HEIGHT);
    drawVisible(ctx, layout, spec, (group) => {
      const channel = targets.indexOf(group);
      return channel === -1 ? null : CHANNELS[channel];
    });
    const sums = readSums(ctx);
    const counts = [sums.data, sums.redundant, sums.nonData];
    targets.forEach((group, channel) => {
      result[group] = counts[channel];
    });
  }
  return remember(groupCache, key, result);
}
