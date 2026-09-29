import { useEffect, useState } from 'react';

export interface ReadingProgress {
  /** Index of the section being read, or -1 when none is on screen (e.g. on another page). */
  active: number;
  /** Sections the reader has been in, by index. */
  visited: boolean[];
  /** How far through the whole guide, 0 to 1. */
  fraction: number;
}

/**
 * Where the reader is in a long page of sections: the one under a line a third of the way
 * down the screen, the ones already read, and how far through the page they are.
 */
export function useReadingProgress(containerId: string, sectionIds: string[], watch: unknown): ReadingProgress {
  const [state, setState] = useState<ReadingProgress>({ active: -1, visited: sectionIds.map(() => false), fraction: 0 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const container = document.getElementById(containerId);
      if (!container) {
        setState((s) => (s.active === -1 ? s : { ...s, active: -1 }));
        return;
      }
      const line = window.innerHeight * 0.35;
      let active = -1;
      sectionIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) active = i;
      });
      const box = container.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      const fraction = travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 1;
      setState((s) => {
        const visited = active >= 0 && !s.visited[active] ? s.visited.map((v, i) => v || i === active) : s.visited;
        if (s.active === active && s.visited === visited && Math.abs(s.fraction - fraction) < 0.001) return s;
        return { active, visited, fraction };
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [containerId, sectionIds.join(), watch]);

  return state;
}
