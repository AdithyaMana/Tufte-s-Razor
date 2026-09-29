import React, { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../site/media.ts';

/** A figure that stays in view while the content beside (or below) it scrolls. */
export const StickyLayout: React.FC<{ figure: React.ReactNode; children: React.ReactNode; label?: string; className?: string }> = ({
  figure,
  children,
  label,
  className = '',
}) => (
  <div className={`sticky-layout ${className}`}>
    <figure className="sticky-figure min-w-0" aria-label={label}>
      {figure}
    </figure>
    <div className="sticky-body min-w-0">{children}</div>
  </div>
);

/** Dots for the steps of a story: where you are in it, and a way to go back to any step. */
const StoryDots: React.FC<{ count: number; active: number; onPick: (index: number) => void }> = ({ count, active, onPick }) => (
  <div role="group" className="flex items-center gap-0.5 -ml-2" aria-label="Steps">
    {Array.from({ length: count }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onPick(i)}
        aria-label={`Step ${i + 1} of ${count}`}
        aria-current={i === active ? 'step' : undefined}
        className="grid place-items-center w-6 h-6 rounded-full group"
      >
        <span
          className={`block rounded-full transition-all ${
            i === active ? 'w-2 h-2 bg-control' : i < active ? 'w-1.5 h-1.5 bg-chrome/70 group-hover:bg-content' : 'w-1.5 h-1.5 bg-line-2 group-hover:bg-chrome'
          }`}
        />
      </button>
    ))}
  </div>
);

interface ScrollStoryProps {
  /** The text of each step, in order. */
  steps: React.ReactNode[];
  /** The figure for the step being read. */
  figure: (step: number) => React.ReactNode;
  label: string;
  className?: string;
}

/**
 * A scroll-driven story: the figure stays in view, and changes as each step of the text
 * scrolls past the middle of the space left for reading. Every step stays on the page, so
 * nothing is hidden from readers who skim, search or use a screen reader.
 */
const ScrollStory: React.FC<ScrollStoryProps> = ({ steps, figure, label, className = '' }) => {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const figureRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const wide = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // Beside the figure, read at the middle of the screen; under it, in the middle of what's left.
      const figureBottom = figureRef.current?.getBoundingClientRect().bottom ?? 0;
      const top = wide ? 0 : Math.min(Math.max(figureBottom, 0), window.innerHeight * 0.7);
      const line = top + (window.innerHeight - top) * 0.5;
      let next = 0;
      stepRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < line) next = i;
      });
      setActive(next);
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
  }, [wide, steps.length]);

  const goTo = (index: number) => stepRefs.current[index]?.scrollIntoView({ block: 'center' });

  return (
    <div className={`sticky-layout ${className}`}>
      <figure ref={figureRef} className="sticky-figure min-w-0" aria-label={label}>
        {figure(active)}
        {steps.length > 1 && (
          <div className="hidden lg:block mt-3">
            <StoryDots count={steps.length} active={active} onPick={goTo} />
          </div>
        )}
      </figure>
      <div className="sticky-body min-w-0 pt-8 lg:pt-4 pb-[12vh] lg:pb-[20vh]">
        {steps.map((step, i) => (
          <div
            key={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            data-active={i === active}
            className="story-step article text-pretty [&:not(:last-child)]:mb-[24vh] lg:[&:not(:last-child)]:mb-[28vh]"
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollStory;
