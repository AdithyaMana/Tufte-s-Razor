import React from 'react';

// Layout pieces for the long-form guide: a reading column with notes in the margin,
// and full-width room for the interactive figures.

export const Section: React.FC<{ id: string; number: string; title: React.ReactNode; children: React.ReactNode }> = ({
  id,
  number,
  title,
  children,
}) => (
  <section id={id} aria-labelledby={`${id}-title`} className="max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-24">
    <p className="kicker">{number}</p>
    <h2 id={`${id}-title`} className="mt-3 font-serif text-[2.1rem] md:text-5xl leading-[1.08] tracking-tight text-ink max-w-3xl text-balance">
      {title}
    </h2>
    <div className="mt-6 md:mt-8">{children}</div>
  </section>
);

/** Reading text, with optional margin notes beside it on wide screens (below it on narrow ones). */
export const Prose: React.FC<{ children: React.ReactNode; notes?: React.ReactNode; className?: string }> = ({ children, notes, className = '' }) => (
  <div className={`grid lg:grid-cols-[minmax(0,38rem)_minmax(0,16rem)] lg:gap-x-16 xl:gap-x-24 ${className}`}>
    <div className="article">{children}</div>
    {notes && <aside className="mt-8 lg:mt-1.5 space-y-6">{notes}</aside>}
  </div>
);

export const MarginNote: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="font-sans text-[0.8125rem] leading-relaxed text-ink-2 border-l-2 border-rule pl-4">
    {title && <p className="font-semibold text-ink mb-1">{title}</p>}
    {children}
  </div>
);

export const Epigraph: React.FC<{ children: React.ReactNode; cite: React.ReactNode }> = ({ children, cite }) => (
  <blockquote className="max-w-2xl">
    <p className="font-serif italic text-2xl md:text-[1.75rem] leading-snug text-ink">{children}</p>
    <footer className="mt-2 font-sans text-[0.8125rem] text-muted">— {cite}</footer>
  </blockquote>
);

/** A pull-quote from the source article, set apart from the running text. */
export const Quote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="my-6 pl-5 border-l-2 border-ink/70 font-serif italic text-ink-2">{children}</p>
);
