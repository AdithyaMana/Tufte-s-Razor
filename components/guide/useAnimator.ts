import { useCallback, useEffect, useRef, useState } from 'react';

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

/**
 * Follows a target number, easing towards each new target over a few frames, so a story
 * step that changes a setting shows the change happening. Jumps when motion is reduced.
 */
export function useTween(target: number, duration = 480): number {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  const frame = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(frame.current);
    const from = current.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || from === target) {
      current.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      current.current = from + (target - from) * eased;
      setValue(current.current);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}
