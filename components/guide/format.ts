const pxFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** A ratio: 0.04731 → "4.73%", 0.397 → "39.7%". Small ratios keep two decimals so small changes show. */
export function pct(share: number): string {
  const percent = share * 100;
  return `${percent < 10 ? percent.toFixed(2) : percent.toFixed(1)}%`;
}

/** A share of the ink budget, always to one decimal: 0.0473 → "4.7%". */
export function pct1(share: number): string {
  return `${(share * 100).toFixed(1)}%`;
}

/** 36123.4 → "36,123 px" */
export function px(pixels: number): string {
  return `${pxFormat.format(pixels)} px`;
}

/** How a value compares with a reference: "2.3×", "0.41×" or "same". */
export function times(value: number, reference: number): string {
  if (reference <= 0) return '—';
  const ratio = value / reference;
  if (Math.abs(ratio - 1) < 0.005) return 'same';
  return `${ratio >= 10 ? ratio.toFixed(0) : ratio.toFixed(ratio >= 1 ? 1 : 2)}×`;
}
