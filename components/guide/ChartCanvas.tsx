import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';
import { hitTest, PART_GROUPS, partAnchor, presentParts, type InkPart } from '../../ink/inspect.ts';
import { computeLayout, formatValue } from '../../ink/layout.ts';
import { measureText } from '../../ink/measure.ts';
import { chartPaint, drawChart, drawVisible, inkMapPaint, type InkGroup, type InkMapColours } from '../../ink/render.ts';
import { CHART_HEIGHT, CHART_WIDTH, orderedData, PAPER, type ChartSpec } from '../../ink/spec.ts';
import { PARTS } from '../../content/parts.ts';
import { useChartsAsInkMaps } from '../site/inkMap.ts';
import { useIsDark } from '../site/theme.ts';
import InkTooltip from './InkTooltip.tsx';
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

/** How much of the rest of the chart shows through while one part is picked out. */
const FADED = 0.16;

// Finger-sized and mouse-sized reach for thin marks, in screen px.
const TOUCH_REACH = 12;
const MOUSE_REACH = 5;

interface Inspecting {
  part: InkPart;
  /** Where the reader pointed, in px from the chart's top left. */
  x: number;
  y: number;
  via: 'mouse' | 'touch' | 'keyboard';
}

interface ChartCanvasProps {
  spec: ChartSpec;
  /** Force the ink map on or off; by default the chart follows the ink-map switch. */
  inkMap?: boolean;
  /** Ink groups to pick out while the rest of the chart fades. An empty list picks out the paper. */
  highlight?: readonly InkGroup[] | null;
  /** Let readers point at, tap or arrow through the chart's parts to see what kind of ink each is. */
  inspectable?: boolean;
  className?: string;
  label?: string;
}

/**
 * Draws a chart specimen with exactly the geometry that is counted, scaled to its
 * container and sharp on high-density screens.
 */
const ChartCanvasInner: React.FC<ChartCanvasProps> = ({ spec, inkMap, highlight = null, inspectable = false, className = '', label }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointer = useRef<string>('mouse');
  const [cssWidth, setCssWidth] = useState(0);
  const [inspecting, setInspecting] = useState<Inspecting | null>(null);
  const tooltipId = useId();
  const fontsReady = useChartFontsReady();
  const isDark = useIsDark();
  const mapsOn = useChartsAsInkMaps();
  const showMap = inkMap ?? mapsOn;
  const specKey = JSON.stringify(spec);
  const layout = useMemo(() => computeLayout(spec, measureText), [specKey, fontsReady]);

  // What to pick out: the part being inspected, or else whatever the page asks for.
  const picked = inspecting ? PART_GROUPS[inspecting.part] : highlight;
  const pickedKey = picked ? picked.join(',') || 'paper' : '';

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

    const toChart = (c: CanvasRenderingContext2D) => c.setTransform(width / CHART_WIDTH, 0, 0, height / CHART_HEIGHT, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    toChart(ctx);

    const map = inkMapColours(isDark);
    const background = showMap ? map.background : spec.background;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT);
    drawChart(ctx, layout, spec, showMap ? inkMapPaint(map) : chartPaint(spec));
    if (!picked) return;

    // Fade the whole chart towards its paper, then draw the picked groups on top in their
    // ink-map colours, only where they are visible on the finished chart.
    ctx.globalAlpha = 1 - FADED;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT);
    ctx.globalAlpha = 1;
    if (!picked.length) return;

    const layer = (layerRef.current ??= document.createElement('canvas'));
    if (layer.width !== width) layer.width = width;
    if (layer.height !== height) layer.height = height;
    const layerCtx = layer.getContext('2d');
    if (!layerCtx) return;
    layerCtx.setTransform(1, 0, 0, 1, 0, 0);
    layerCtx.clearRect(0, 0, width, height);
    toChart(layerCtx);
    drawVisible(layerCtx, layout, spec, (group, kind) => (picked.includes(group) ? map[kind] : null));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(layer, 0, 0);
  }, [layout, specKey, showMap, cssWidth, isDark, pickedKey]);

  // A touch inspection stays until the reader taps elsewhere; a mouse one ends on scroll.
  useEffect(() => {
    if (!inspecting || inspecting.via === 'keyboard') return;
    if (inspecting.via === 'touch') {
      const onDown = (event: PointerEvent) => {
        if (!wrapRef.current?.contains(event.target as Node)) setInspecting(null);
      };
      document.addEventListener('pointerdown', onDown);
      return () => document.removeEventListener('pointerdown', onDown);
    }
    const onScroll = () => setInspecting(null);
    window.addEventListener('scroll', onScroll, { passive: true, once: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [inspecting?.via, inspecting === null]);

  // Parts come and go as the chart changes; drop an inspection whose part is gone.
  useEffect(() => {
    if (inspecting && !presentParts(layout, spec).includes(inspecting.part)) setInspecting(null);
  }, [layout]);

  const pointAt = (clientX: number, clientY: number, reach: number, via: Inspecting['via']): Inspecting | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scale = CHART_WIDTH / rect.width;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const part = hitTest(layout, spec, x * scale, y * scale, reach * scale, measureText);
    return { part, x, y, via };
  };

  const handlers: React.HTMLAttributes<HTMLDivElement> = inspectable
    ? {
        tabIndex: 0,
        role: 'group',
        'aria-label': 'Chart. Press the left and right arrow keys to go through its parts.',
        'aria-describedby': inspecting ? tooltipId : undefined,
        onPointerDown: (e) => {
          lastPointer.current = e.pointerType;
        },
        onPointerMove: (e) => {
          if (e.pointerType !== 'mouse') return;
          const next = pointAt(e.clientX, e.clientY, MOUSE_REACH, 'mouse');
          setInspecting((current) =>
            next && current && current.part === next.part && Math.abs(current.x - next.x) + Math.abs(current.y - next.y) < 1 ? current : next,
          );
        },
        onPointerLeave: (e) => {
          if (e.pointerType === 'mouse') setInspecting((current) => (current?.via === 'mouse' ? null : current));
        },
        onClick: (e) => {
          if (lastPointer.current === 'mouse') return;
          const next = pointAt(e.clientX, e.clientY, TOUCH_REACH, 'touch');
          setInspecting((current) => (current && next && current.part === next.part ? null : next));
        },
        onKeyDown: (e) => {
          if (e.key === 'Escape') {
            setInspecting(null);
            return;
          }
          const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          const parts = presentParts(layout, spec);
          const index = inspecting ? parts.indexOf(inspecting.part) : step > 0 ? -1 : 0;
          const part = parts[(index + step + parts.length) % parts.length];
          const anchor = partAnchor(part, layout, spec, measureText);
          const scale = cssWidth / CHART_WIDTH;
          setInspecting({ part, x: anchor.x * scale, y: anchor.y * scale, via: 'keyboard' });
        },
        onBlur: () => setInspecting((current) => (current?.via === 'keyboard' ? null : current)),
      }
    : {};

  const cssHeight = (cssWidth * CHART_HEIGHT) / CHART_WIDTH;
  const description = `${label ?? describeChart(spec)}${showMap ? ' Shown as an ink map.' : ''}${
    inspecting ? ` Showing: ${PARTS[inspecting.part].name}.` : ''
  }`;

  return (
    <div
      ref={wrapRef}
      className={`relative w-full rounded-[1px] ${inspectable ? 'touch-manipulation select-none' : ''} ${className}`}
      style={{ aspectRatio: `${CHART_WIDTH} / ${CHART_HEIGHT}` }}
      {...handlers}
    >
      <canvas ref={canvasRef} role="img" aria-label={description} className="block w-full h-full" />
      {inspecting && (
        <InkTooltip
          id={tooltipId}
          part={inspecting.part}
          spec={spec}
          x={inspecting.x}
          y={inspecting.y}
          width={cssWidth}
          height={cssHeight}
        />
      )}
    </div>
  );
};

/** A chart, blown up to fill the screen. Escape, the close button or a click outside closes it. */
const EnlargedChart: React.FC<ChartCanvasProps & { onClose: () => void }> = ({ onClose, ...props }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus();
    };
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Enlarged chart">
      <div className="absolute inset-0 bg-paper/90 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-[min(72rem,calc((100vh-6rem)*1.6))]">
        <div className="mb-2 flex items-center justify-between font-sans text-[0.8125rem] text-content-2">
          <span>{props.inspectable ? 'Point at or tap any part to see what kind of ink it is.' : ''}</span>
          <button ref={closeRef} type="button" onClick={onClose} className="inline-flex items-center gap-1.5 min-h-10 px-2 -mr-2 rounded-sm text-chrome hover:text-content">
            <X size={16} aria-hidden="true" /> Close
          </button>
        </div>
        <ChartCanvasInner {...props} />
      </div>
    </div>,
    document.body,
  );
};

/** A chart with a button to see it bigger. */
const ChartCanvas: React.FC<ChartCanvasProps & { enlargeable?: boolean }> = ({ enlargeable = true, ...props }) => {
  const [big, setBig] = useState(false);
  const close = useCallback(() => setBig(false), []);
  if (!enlargeable) return <ChartCanvasInner {...props} />;
  return (
    <div className="relative group/chart">
      <ChartCanvasInner {...props} />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setBig(true);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute right-1.5 top-1.5 z-10 grid place-items-center w-8 h-8 rounded-sm bg-paper/85 text-chrome ring-1 ring-line opacity-70 sm:opacity-0 sm:group-hover/chart:opacity-100 focus-visible:opacity-100 hover:text-content transition-opacity"
        aria-label="Enlarge this chart"
        title="Enlarge"
      >
        <Maximize2 size={14} aria-hidden="true" />
      </button>
      {big && <EnlargedChart {...props} onClose={close} />}
    </div>
  );
};

export default ChartCanvas;
