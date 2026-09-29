import { useEffect, useMemo, useState } from 'react';
import { clearInkCache, measureChart, type InkStats } from '../../ink/measure.ts';
import { chartFont } from '../../ink/render.ts';
import type { ChartSpec } from '../../ink/spec.ts';

let fontsLoaded = false;
let fontsPromise: Promise<void> | null = null;

function loadChartFonts(): Promise<void> {
  if (!fontsPromise) {
    const faces = [chartFont(11), chartFont(18)].map((font) => document.fonts.load(font));
    // Counts made with a fallback font are stale once the real one arrives.
    const settle = () => {
      fontsLoaded = true;
      clearInkCache();
    };
    fontsPromise = Promise.all(faces).then(settle, settle);
  }
  return fontsPromise;
}

/** True once the chart typeface has loaded; charts redraw and recount when it flips. */
export function useChartFontsReady(): boolean {
  const [ready, setReady] = useState(fontsLoaded);
  useEffect(() => {
    if (ready) return;
    let active = true;
    loadChartFonts().then(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [ready]);
  return ready;
}

/** Live ink counts for a chart. */
export function useInkStats(spec: ChartSpec): InkStats {
  const fontsReady = useChartFontsReady();
  const key = JSON.stringify(spec);
  return useMemo(() => measureChart(spec), [key, fontsReady]);
}

/** Ink counts for several charts at once, e.g. every step of a story. */
export function useInkStatsList(specs: ChartSpec[]): InkStats[] {
  const fontsReady = useChartFontsReady();
  const key = JSON.stringify(specs);
  return useMemo(() => specs.map(measureChart), [key, fontsReady]);
}

export interface SweepPoint {
  x: number;
  stats: InkStats;
}

/**
 * Counts the chart at many values of one setting (e.g. bar width), a few per frame so
 * the page stays responsive. Returns null until the sweep is complete.
 */
export function useInkSweep(spec: ChartSpec, values: number[], apply: (spec: ChartSpec, value: number) => ChartSpec) {
  const fontsReady = useChartFontsReady();
  const [points, setPoints] = useState<SweepPoint[] | null>(null);
  const key = JSON.stringify(spec) + values.join(',');

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const done: SweepPoint[] = [];
    const step = () => {
      if (cancelled) return;
      const until = performance.now() + 8;
      while (done.length < values.length && performance.now() < until) {
        const x = values[done.length];
        done.push({ x, stats: measureChart(apply(spec, x)) });
      }
      if (done.length < values.length) frame = requestAnimationFrame(step);
      else setPoints(done);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [key, fontsReady]);

  return points;
}
