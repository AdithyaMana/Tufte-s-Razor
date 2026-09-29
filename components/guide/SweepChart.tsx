import React, { useLayoutEffect, useRef, useState } from 'react';

export interface SweepDatum {
  x: number;
  y: number;
}

interface SweepChartProps {
  title: string;
  subtitle?: string;
  points: SweepDatum[] | null;
  current: SweepDatum;
  /** CSS colour of the line, e.g. "rgb(var(--ink-data))". */
  colour: string;
  /** A highlighted x range, e.g. the comfortable bar widths. */
  zone?: [number, number];
  zoneLabel?: string;
  xLabel: string;
  formatX: (x: number) => string;
  formatY: (y: number) => string;
  /** Axis tick labels; defaults to formatY. */
  formatTick?: (y: number) => string;
  /** Clicking the chart moves the setting to that x. */
  onPick?: (x: number) => void;
  ariaLabel: string;
}

const HEIGHT = 180;
const M = { l: 42, r: 14, t: 16, b: 38 };

function niceTop(max: number): number {
  for (const top of [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1]) {
    if (top >= max * 1.04) return top;
  }
  return Math.ceil(max * 10) / 10;
}

/** A single-series line chart of how the ratio responds to one setting, with hover readout. */
const SweepChart: React.FC<SweepChartProps> = ({
  title,
  subtitle,
  points,
  current,
  colour,
  zone,
  zoneLabel,
  xLabel,
  formatX,
  formatY,
  formatTick = formatY,
  onPick,
  ariaLabel,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<SweepDatum | null>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    setWidth(wrap.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const data = points ?? [];
  const yTop = niceTop(Math.max(current.y, ...data.map((p) => p.y), 0.01));
  const innerW = Math.max(0, width - M.l - M.r);
  const innerH = HEIGHT - M.t - M.b;
  const sx = (x: number) => M.l + x * innerW;
  const sy = (y: number) => M.t + innerH - (y / yTop) * innerH;
  const yTicks = [0, yTop / 2, yTop];
  const xTicks = [0, 0.25, 0.5, 0.75, 1];

  const path = data.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join('');

  const nearest = (clientX: number): SweepDatum | null => {
    const wrap = wrapRef.current;
    if (!wrap || !data.length) return null;
    const x = (clientX - wrap.getBoundingClientRect().left - M.l) / innerW;
    let best = data[0];
    for (const p of data) if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p;
    return best;
  };

  // The readout sits beside the current point, or the hovered one, above it when there is room.
  const shown = hover ?? current;
  const tooltipLeft = Math.min(Math.max(sx(shown.x), M.l + 50), width - 60);
  const tooltipTop = sy(shown.y) - 34 < 0 ? sy(shown.y) + 12 : sy(shown.y) - 34;

  return (
    <figure className="font-sans">
      <figcaption className="mb-1">
        <span className="text-[0.8125rem] font-semibold text-content">{title}</span>
        {subtitle && <span className="block text-xs text-content-2">{subtitle}</span>}
      </figcaption>
      <div
        ref={wrapRef}
        className={`relative ${onPick ? 'cursor-pointer' : ''}`}
        style={{ height: HEIGHT }}
        onPointerMove={(e) => setHover(nearest(e.clientX))}
        onPointerLeave={() => setHover(null)}
        onClick={(e) => {
          const p = nearest(e.clientX);
          if (p && onPick) onPick(p.x);
        }}
      >
        {width > 0 && (
          <svg width={width} height={HEIGHT} role="img" aria-label={ariaLabel} className="block overflow-visible">
            {zone && (
              <g>
                <rect x={sx(zone[0])} y={M.t} width={sx(zone[1]) - sx(zone[0])} height={innerH} className="fill-content/[0.045]" />
                {zoneLabel && (
                  <text x={sx(zone[0]) + 6} y={M.t + 12} className="fill-chrome text-[10px]">
                    {zoneLabel}
                  </text>
                )}
              </g>
            )}
            {yTicks.map((t) => (
              <g key={t}>
                <line x1={M.l} x2={M.l + innerW} y1={sy(t) + 0.5} y2={sy(t) + 0.5} className={t === 0 ? 'stroke-line-2' : 'stroke-line'} strokeWidth={1} />
                <text x={M.l - 8} y={sy(t)} dy="0.32em" textAnchor="end" className="fill-chrome text-[10.5px] tabular-nums">
                  {formatTick(t)}
                </text>
              </g>
            ))}
            {xTicks.map((t) => (
              <text key={t} x={sx(t)} y={M.t + innerH + 16} textAnchor="middle" className="fill-chrome text-[10.5px] tabular-nums">
                {formatX(t)}
              </text>
            ))}
            <text x={M.l + innerW / 2} y={HEIGHT - 4} textAnchor="middle" className="fill-chrome text-[10.5px]">
              {xLabel}
            </text>

            <path d={path} fill="none" style={{ stroke: colour }} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

            {hover && (
              <line x1={sx(hover.x)} x2={sx(hover.x)} y1={M.t} y2={M.t + innerH} className="stroke-content-2/40" strokeWidth={1} />
            )}
            <circle cx={sx(current.x)} cy={sy(current.y)} r={4.5} style={{ fill: colour }} className="stroke-paper" strokeWidth={2} />
            {hover && <circle cx={sx(hover.x)} cy={sy(hover.y)} r={3.5} style={{ fill: colour }} className="stroke-paper" strokeWidth={2} />}
          </svg>
        )}
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-sm bg-paper/95 px-1.5 py-0.5 text-xs ring-1 ring-line whitespace-nowrap"
          style={{ left: tooltipLeft, top: tooltipTop }}
        >
          <span className="font-semibold text-content tabular-nums">{formatY(shown.y)}</span>
          <span className="text-content-2"> at {formatX(shown.x)}</span>
        </div>
      </div>
    </figure>
  );
};

export default SweepChart;
