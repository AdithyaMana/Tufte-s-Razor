const pxFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/**
 * A ratio: 0.04731 → "4.7%", 0.397 → "40%". The counts rest on conventions (what counts as
 * paper, how thin a bar can be), so more precision than this would be false precision.
 */
export function pct(share: number): string {
  const percent = share * 100;
  return `${percent < 10 ? percent.toFixed(1) : percent.toFixed(0)}%`;
}

/** A share of the ink budget, always to one decimal: 0.0473 → "4.7%". */
export function pct1(share: number): string {
  return `${(share * 100).toFixed(1)}%`;
}

/** 36123.4 → "36,000 px": two significant figures, for the same reason as pct. */
export function px(pixels: number): string {
  if (pixels < 100) return `${pxFormat.format(pixels)} px`;
  const step = 10 ** (Math.floor(Math.log10(pixels)) - 1);
  return `${pxFormat.format(Math.round(pixels / step) * step)} px`;
}

/** How a value compares with a reference: "2.3×", "0.41×" or "same". */
export function times(value: number, reference: number): string {
  if (reference <= 0) return '—';
  const ratio = value / reference;
  if (Math.abs(ratio - 1) < 0.005) return 'same';
  return `${ratio >= 10 ? ratio.toFixed(0) : ratio.toFixed(ratio >= 1 ? 1 : 2)}×`;
}
