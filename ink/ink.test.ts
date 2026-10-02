import { describe, expect, it } from 'vitest';
import { hitTest, presentParts, textBox } from './inspect.ts';
import { computeLayout, niceMax, PAD, tickStep, type TextMeasurer } from './layout.ts';
import { sumChannels, toStats } from './measure.ts';
import { RAZOR_STEPS, razorSpec } from './razor.ts';
import { groupKind } from './render.ts';
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
    expect(layout.bars.map((b) => b.label).join(' ')).toBe('North East West Central South');
  });

  it('labels only the values present in the data, plus the axis ends', () => {
    const layout = computeLayout({ ...defaultSpec(), valueLabels: 'data' }, measure);
    expect(layout.labelValues).toEqual([0, 5, 7, 9, 10]);
  });

  it('leaves room above the tallest bar for its data label', () => {
    const spec = { ...defaultSpec(), dataLabels: true, labelSize: 30 };
    const layout = computeLayout(spec, measure);
    const tallest = Math.min(...layout.bars.map((b) => b.y));
    const titleBottom = PAD + spec.titleSize * 1.2 + 12;
    expect(tallest - 6 - spec.labelSize).toBeGreaterThanOrEqual(titleBottom - 1);
  });

  it('draws no gridline under the baseline', () => {
    const layout = computeLayout(defaultSpec(), measure);
    expect(layout.gridValues).not.toContain(0);
    expect(layout.gridValues).toContain(10);
  });
});

describe('razor', () => {
  it('starts with everything switched on', () => {
    const spec = razorSpec(0, false);
    expect(spec.plotFill).not.toBeNull();
    expect(spec.barOutline).not.toBeNull();
    expect(spec.gridlines && spec.plotBorder && spec.tickMarks && spec.dataLabels).toBe(true);
  });

  it('keeps every earlier cut at each step', () => {
    for (let step = 1; step < RAZOR_STEPS.length; step++) {
      const spec = razorSpec(step, false);
      expect(spec.plotFill).toBeNull();
      if (step >= 2) expect(spec.gridlines || spec.plotBorder || spec.tickMarks || spec.chartBorder).toBe(false);
      if (step >= 3) expect(spec.barOutline).toBeNull();
      if (step >= 4) expect(spec.barWidth).toBeLessThanOrEqual(0.5);
    }
  });

  it('ends one step too far: hairlines and no labels', () => {
    const last = razorSpec(RAZOR_STEPS.length - 1, false);
    expect(last.barWidth).toBe(0);
    expect(last.title).toBeNull();
    expect(last.categoryLabels || last.dataLabels || last.valueLabels !== 'none').toBe(false);
  });
});

describe('hitTest', () => {
  const spec = { ...defaultSpec(), dataLabels: true };
  const layout = computeLayout(spec, measure);
  const at = (x: number, y: number, tolerance = 4) => hitTest(layout, spec, x, y, tolerance, measure);
  const plotBottom = layout.plot.y + layout.plot.h;

  it('finds a bar anywhere on it, and a hairline bar from nearby', () => {
    const bar = layout.bars[2];
    expect(at(bar.x + 1, bar.y + bar.h / 2)).toBe('bars');
    const thin = { ...spec, barWidth: 0 };
    const thinLayout = computeLayout(thin, measure);
    const hairline = thinLayout.bars[2];
    expect(hitTest(thinLayout, thin, hairline.cx + 6, hairline.y + 20, 10, measure)).toBe('bars');
  });

  it('finds text by the space it covers', () => {
    const title = textBox(layout.title!, measure);
    expect(at(title.x + title.w / 2, title.y + title.h / 2)).toBe('title');
    const label = layout.dataLabels[0];
    expect(at(label.x, label.y - 3)).toBe('dataLabels');
    const category = layout.categoryLabels[1];
    expect(at(category.x, category.y + 4)).toBe('categoryLabels');
  });

  it('finds thin lines from a few px away', () => {
    const gap = (layout.bars[0].x + layout.bars[0].w + layout.bars[1].x) / 2;
    const gridY = layout.yOf(layout.gridValues[0]);
    expect(at(gap, gridY + 3)).toBe('gridlines');
    expect(at(gap, plotBottom + 2)).toBe('axes');
    expect(at(2, layout.height / 2)).toBe('borders');
  });

  it('calls the space between marks paper, or the plot fill when there is one', () => {
    const gap = (layout.bars[0].x + layout.bars[0].w + layout.bars[1].x) / 2;
    const between = (layout.yOf(layout.gridValues[0]) + layout.yOf(layout.gridValues[1])) / 2;
    expect(at(gap, between)).toBe('paper');
    const filled = { ...spec, plotFill: '#dae3f3' };
    expect(hitTest(computeLayout(filled, measure), filled, gap, between, 4, measure)).toBe('plotFill');
  });

  it('lists only the parts a chart has', () => {
    expect(presentParts(layout, spec)).toEqual(['title', 'bars', 'dataLabels', 'valueLabels', 'categoryLabels', 'gridlines', 'axes', 'borders', 'paper']);
    const bare = { ...spec, title: null, gridlines: false, chartBorder: false, baseline: false, valueLabels: 'none' as const, dataLabels: false, categoryLabels: false };
    expect(presentParts(computeLayout(bare, measure), bare)).toEqual(['bars', 'paper']);
  });
});

describe('bar spacing', () => {
  it('leaves exactly the same gap between every pair of bars, at any width', () => {
    for (let barWidth = 0; barWidth <= 1; barWidth += 0.05) {
      const layout = computeLayout({ ...defaultSpec(), barWidth }, measure);
      const gaps = layout.bars.slice(1).map((b, i) => b.x - (layout.bars[i].x + layout.bars[i].w));
      expect(new Set(gaps).size).toBe(1);
      expect(gaps[0]).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('groupKind', () => {
  it('counts the title and labels as data-ink, and lines and fills as non-data ink', () => {
    const spec = defaultSpec();
    for (const group of ['hairlines', 'title', 'valueLabels', 'categoryLabels'] as const) expect(groupKind(group, spec)).toBe('data');
    for (const group of ['plotFill', 'gridlines', 'borders', 'axes'] as const) expect(groupKind(group, spec)).toBe('nonData');
  });

  it('counts values on the bars as repeated while the axis is labelled, and as data-ink once it isn’t', () => {
    expect(groupKind('dataLabels', { ...defaultSpec(), dataLabels: true })).toBe('redundant');
    expect(groupKind('dataLabels', { ...defaultSpec(), dataLabels: true, valueLabels: 'none' })).toBe('data');
  });
});
