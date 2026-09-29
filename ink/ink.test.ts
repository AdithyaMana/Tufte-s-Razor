import { describe, expect, it } from 'vitest';
import { computeLayout, niceMax, tickStep, type TextMeasurer } from './layout.ts';
import { sumChannels, toStats } from './measure.ts';
import { defaultSpec, ESSENTIAL_WIDTH } from './spec.ts';

// Roughly Inter's average advance; exact widths only matter in the browser.
const measure: TextMeasurer = (text, size) => text.length * size * 0.6;

// What a canvas holds after painting pure-channel layers bottom to top with source-over,
// read back as getImageData returns it: un-premultiplied, 8 bits per channel.
function painted(layers: { channel: 0 | 1 | 2; coverage: number }[]): number[] {
  let colour = [0, 0, 0];
  let alpha = 0;
  for (const { channel, coverage } of layers) {
    colour = colour.map((v, i) => (i === channel ? coverage : 0) + v * (1 - coverage));
    alpha = coverage + alpha * (1 - coverage);
  }
  const a8 = Math.round(alpha * 255);
  return [...colour.map((v) => (alpha ? Math.round((v / alpha) * 255) : 0)), a8];
}

const DATA = 0;
const REDUNDANT = 1;
const NON_DATA = 2;

describe('sumChannels', () => {
  it('counts a fully covered pixel as one pixel of its kind', () => {
    expect(sumChannels(painted([{ channel: NON_DATA, coverage: 1 }]))).toEqual({ data: 0, redundant: 0, nonData: 1 });
  });

  it('does not count ink hidden behind other ink', () => {
    const gridlineUnderBar = painted([
      { channel: NON_DATA, coverage: 1 },
      { channel: REDUNDANT, coverage: 1 },
    ]);
    expect(sumChannels(gridlineUnderBar)).toEqual({ data: 0, redundant: 1, nonData: 0 });
  });

  it('shares anti-aliased pixels between kinds like paint', () => {
    const textEdgeOverBar = sumChannels(painted([
      { channel: REDUNDANT, coverage: 1 },
      { channel: NON_DATA, coverage: 0.2 },
    ]));
    expect(textEdgeOverBar.redundant).toBeCloseTo(0.8, 2);
    expect(textEdgeOverBar.nonData).toBeCloseTo(0.2, 2);

    const partialOverPartial = sumChannels(painted([
      { channel: REDUNDANT, coverage: 0.5 },
      { channel: NON_DATA, coverage: 0.4 },
    ]));
    expect(partialOverPartial.redundant).toBeCloseTo(0.3, 2);
    expect(partialOverPartial.nonData).toBeCloseTo(0.4, 2);
  });

  it('never counts more than one pixel of ink per pixel', () => {
    const rgba = [
      ...painted([{ channel: NON_DATA, coverage: 1 }, { channel: REDUNDANT, coverage: 1 }, { channel: DATA, coverage: 1 }]),
      ...painted([{ channel: NON_DATA, coverage: 0.5 }, { channel: REDUNDANT, coverage: 0.5 }, { channel: DATA, coverage: 0.5 }]),
    ];
    const sums = sumChannels(rgba);
    const total = sums.data + sums.redundant + sums.nonData;
    expect(total).toBeLessThanOrEqual(2.01);
    expect(total).toBeCloseTo(1.875, 1);
  });

  it('ignores transparent pixels', () => {
    expect(sumChannels([0, 0, 0, 0, 255, 0, 0, 0])).toEqual({ data: 0, redundant: 0, nonData: 0 });
  });
});

describe('toStats', () => {
  it('divides essential data-ink by all ink', () => {
    const stats = toStats({ data: 10, redundant: 30, nonData: 60 });
    expect(stats.total).toBe(100);
    expect(stats.ratio).toBeCloseTo(0.1);
    expect(stats.dataShare).toBeCloseTo(0.4);
  });

  it('handles a chart with no ink', () => {
    expect(toStats({ data: 0, redundant: 0, nonData: 0 }).ratio).toBe(0);
  });
});

describe('axis helpers', () => {
  it('rounds the axis end up to a tidy number', () => {
    expect(niceMax(9)).toBe(10);
    expect(niceMax(42)).toBe(50);
    expect(niceMax(180)).toBe(200);
  });

  it('thins out axis labels as the font grows, as in the article’s larger-label example', () => {
    expect(tickStep(10, 290, 11)).toBe(1);
    expect(tickStep(10, 290, 22)).toBe(2);
  });
});

describe('computeLayout', () => {
  it('keeps every bar at least a hairline wide, with the hairline inside the bar', () => {
    for (const barWidth of [0, 0.01, 0.31, 1]) {
      const layout = computeLayout({ ...defaultSpec(), barWidth }, measure);
      for (const bar of layout.bars) {
        expect(bar.w).toBeGreaterThanOrEqual(ESSENTIAL_WIDTH);
        expect(bar.essential.w).toBe(Math.min(bar.w, ESSENTIAL_WIDTH));
        expect(bar.essential.x).toBeGreaterThanOrEqual(bar.x);
        expect(bar.essential.x + bar.essential.w).toBeLessThanOrEqual(bar.x + bar.w);
        expect(bar.essential.h).toBe(bar.h);
      }
    }
  });

  it('keeps bars the same pixel width when labels change around them', () => {
    const widths = [
      defaultSpec(),
      { ...defaultSpec(), valueLabels: 'none' as const },
      { ...defaultSpec(), labelSize: 20 },
      { ...defaultSpec(), tickMarks: true },
    ].map((spec) => computeLayout(spec, measure).bars[0].w);
    expect(new Set(widths).size).toBe(1);
  });

  it('never lets touching bars overlap', () => {
    const layout = computeLayout({ ...defaultSpec(), barWidth: 1, labelSize: 24 }, measure);
    for (let i = 1; i < layout.bars.length; i++) {
      expect(layout.bars[i].x).toBeGreaterThanOrEqual(layout.bars[i - 1].x + layout.bars[i - 1].w - 1);
    }
  });

  it('makes bar length proportional to value', () => {
    const layout = computeLayout(defaultSpec(), measure);
    const [a, , c] = layout.bars;
    expect(a.h / c.h).toBeCloseTo(9 / 5, 1);
  });

  it('sorts categories from largest to smallest when asked', () => {
    const layout = computeLayout({ ...defaultSpec(), sorted: true }, measure);
    expect(layout.bars.map((b) => b.label).join('')).toBe('ABDEC');
  });

  it('labels only the values present in the data, plus the axis ends', () => {
    const layout = computeLayout({ ...defaultSpec(), valueLabels: 'data' }, measure);
    expect(layout.labelValues).toEqual([0, 5, 7, 9, 10]);
  });

  it('leaves room above the tallest bar for its data label', () => {
    const spec = { ...defaultSpec(), dataLabels: true, labelSize: 30 };
    const layout = computeLayout(spec, measure);
    const tallest = Math.min(...layout.bars.map((b) => b.y));
    const titleBottom = 14 + spec.titleSize * 1.2 + 12;
    expect(tallest - 6 - spec.labelSize).toBeGreaterThanOrEqual(titleBottom - 1);
  });

  it('draws no gridline under the baseline', () => {
    const layout = computeLayout(defaultSpec(), measure);
    expect(layout.gridValues).not.toContain(0);
    expect(layout.gridValues).toContain(10);
  });
});
