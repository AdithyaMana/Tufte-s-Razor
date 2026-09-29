import { useCallback, useEffect, useRef } from 'react';

/**
 * Eases a number from one value to another over a few frames, e.g. when a preset button
 * is pressed, so the reader sees the chart (and its count) change rather than jump.
 */
export function useAnimator(set: (value: number) => void, duration = 420) {
  const frame = useRef(0);

  const stop = useCallback(() => cancelAnimationFrame(frame.current), []);

  const animate = useCallback(
    (from: number, to: number) => {
      cancelAnimationFrame(frame.current);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || from === to) {
        set(to);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) ** 3;
        set(from + (to - from) * eased);
        if (t < 1) frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [set, duration],
  );

  useEffect(() => stop, [stop]);

  return { animate, stop };
}
