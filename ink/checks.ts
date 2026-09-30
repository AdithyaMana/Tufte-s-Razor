import type { ChartSpec } from './spec.ts';

// The ratio can't see what a change costs the reader. These checks can, roughly.

export interface Check {
  id: string;
  text: string;
}

/**
 * Bar widths (as a share of each slot) between which bars are wide enough to compare and
 * far enough apart to tell apart — a rough guide drawn from the article's three examples,
 * not a rule.
 */
export const COMFORTABLE_BAR_WIDTH: readonly [number, number] = [0.2, 0.75];

export type WidthZone = 'sparse' | 'comfortable' | 'crowded';

export function widthZone(barWidth: number): WidthZone {
  if (barWidth < COMFORTABLE_BAR_WIDTH[0]) return 'sparse';
  if (barWidth > COMFORTABLE_BAR_WIDTH[1]) return 'crowded';
  return 'comfortable';
}

function luminance(hex: string): number {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!match) return 0;
  const [r, g, b] = match.slice(1).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours (1 to 21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function readabilityChecks(spec: ChartSpec): Check[] {
  const checks: Check[] = [];
  const zone = widthZone(spec.barWidth);

  if (zone === 'sparse') {
    checks.push({ id: 'sparse', text: 'Bars this thin sit far apart, so comparing their heights takes more effort.' });
  } else if (zone === 'crowded') {
    checks.push({ id: 'crowded', text: 'Bars this wide crowd into one block, and the extra width only repeats their values.' });
  }

  if (spec.valueLabels === 'none' && !spec.dataLabels) {
    checks.push({ id: 'no-values', text: 'Nothing says what the bars measure. With no axis labels and no data labels, the values themselves are lost.' });
  } else if (spec.valueLabels === 'ends' && !spec.dataLabels && !spec.gridlines) {
    checks.push({ id: 'ends-only', text: 'Only the ends of the axis are labelled, so readers can only estimate each value.' });
  }

  if (!spec.categoryLabels) {
    checks.push({ id: 'no-categories', text: 'Without category labels, readers can’t tell which bar is which.' });
  }

  if (spec.labelSize < 8) {
    checks.push({ id: 'small-labels', text: 'Labels this small are hard to read.' });
  } else if (spec.labelSize > 18) {
    checks.push({ id: 'big-labels', text: 'Oversized labels add visual weight that pulls attention away from the data.' });
  }
  if (spec.title && spec.titleSize < spec.labelSize) {
    checks.push({ id: 'hierarchy', text: 'The title is smaller than the labels, so the text hierarchy is upside down.' });
  } else if (spec.title && spec.titleSize > 30) {
    checks.push({ id: 'big-title', text: 'A title this large competes with the data for attention.' });
  }

  const behindBars = spec.plotFill ?? spec.background;
  if (!spec.barOutline && contrast(spec.barColor, behindBars) < 1.4) {
    checks.push({ id: 'bar-contrast', text: 'The bars barely stand out from what’s behind them.' });
  }
  if (contrast(spec.textColor, spec.background) < 3) {
    checks.push({ id: 'text-contrast', text: 'Text is hard to read against this background.' });
  }

  if (spec.gridlines && spec.dataLabels && spec.valueLabels === 'all') {
    checks.push({ id: 'triple', text: 'Each value is shown three ways: gridlines, axis labels and data labels. One or two would do.' });
  }

  return checks;
}
