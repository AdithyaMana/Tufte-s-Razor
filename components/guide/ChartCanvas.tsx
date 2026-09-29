import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { computeLayout, formatValue } from '../../ink/layout.ts';
import { measureText } from '../../ink/measure.ts';
import { chartPaint, drawLayer, inkMapPaint, LAYERS, type InkMapColours } from '../../ink/render.ts';
import { CHART_HEIGHT, CHART_WIDTH, orderedData, PAPER, type ChartSpec } from '../../ink/spec.ts';
import { useInkLens } from '../site/inkLens.ts';
import { useIsDark } from '../site/theme.ts';
import { useChartFontsReady } from './useInk.ts';

/** Ink-map colours; mirror the --ink-* tokens in index.css. The map is drawn on the page's paper. */
export function inkMapColours(isDark: boolean): InkMapColours & { background: string } {
  return isDark
    ? { data: '#4d93e8', redundant: '#2263b5', nonData: '#d95926', background: PAPER.dark }
    : { data: '#184f95', redundant: '#6da7ec', nonData: '#eb6834', background: PAPER.light };
}

export function describeChart(spec: ChartSpec): string {
  const values = orderedData(spec)
    .map((d) => `${d.label} ${formatValue(d.value)}`)
    .join(', ');
  return `Bar chart: ${values}.`;
}

interface ChartCanvasProps {
  spec: ChartSpec;
  /** Force the ink map on or off; by default the chart follows the site-wide ink map. */
  inkMap?: boolean;
  className?: string;
  label?: string;
}

/**
 * Draws a chart specimen with exactly the geometry that is counted, scaled to its
 * container and sharp on high-density screens.
 */
const ChartCanvas: React.FC<ChartCanvasProps> = ({ spec, inkMap, className = '', label }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cssWidth, setCssWidth] = useState(0);
  const fontsReady = useChartFontsReady();
  const isDark = useIsDark();
  const lens = useInkLens().on;
  const showMap = inkMap ?? lens;

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    setCssWidth(wrap.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setCssWidth(entry.contentRect.width));
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cssWidth === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const width = Math.round(cssWidth * dpr);
    const height = Math.round(((cssWidth * CHART_HEIGHT) / CHART_WIDTH) * dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.setTransform(width / CHART_WIDTH, 0, 0, height / CHART_HEIGHT, 0, 0);

    const layout = computeLayout(spec, measureText);
    const map = inkMapColours(isDark);
    ctx.fillStyle = showMap ? map.background : spec.background;
    ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT);
    const paint = showMap ? inkMapPaint(map) : chartPaint(spec);
    for (const { id } of LAYERS) drawLayer(ctx, id, layout, spec, paint);
  }, [spec, showMap, cssWidth, fontsReady, isDark]);

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`} style={{ aspectRatio: `${CHART_WIDTH} / ${CHART_HEIGHT}` }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${label ?? describeChart(spec)}${showMap ? ' Shown as an ink map.' : ''}`}
        className="block w-full h-full"
      />
    </div>
  );
};

export default ChartCanvas;
