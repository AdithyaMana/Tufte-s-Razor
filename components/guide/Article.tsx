import React from 'react';

// Layout for the long-form guide. No boxes or rules: space, type and position do the work.

/** A section: which part of the guide it is, the idea as a headline, then in one sentence, then whatever shows it. */
export const Section: React.FC<{
  id: string;
  part?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, part, title, lead, children }) => (
  <section id={id} aria-labelledby={`${id}-title`} className="max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-28">
    {part && <p className="kicker mb-3">{part}</p>}
    <h2 id={`${id}-title`} className="font-serif text-[2.1rem] md:text-5xl leading-[1.08] tracking-tight text-content max-w-3xl text-balance">
      {title}
    </h2>
    {lead && <p className="mt-4 max-w-2xl font-serif italic text-xl md:text-2xl leading-snug text-content-2 text-pretty">{lead}</p>}
    <div className="mt-8 md:mt-10">{children}</div>
  </section>
);

/** Reading text, with optional notes in the margin on wide screens (after it on narrow ones). */
export const Prose: React.FC<{ children: React.ReactNode; notes?: React.ReactNode; className?: string }> = ({ children, notes, className = '' }) => (
  <div className={`grid lg:grid-cols-[minmax(0,38rem)_minmax(0,15rem)] lg:gap-x-16 xl:gap-x-24 ${className}`}>
    <div className="article">{children}</div>
    {notes && <aside className="mt-6 lg:mt-1.5 space-y-6">{notes}</aside>}
  </div>
);

export const MarginNote: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="font-sans text-[0.8125rem] leading-relaxed text-content-2">
    {title && <p className="font-semibold text-content mb-0.5">{title}</p>}
    {children}
  </div>
);

/** Words from the source article, set apart by italics and indentation rather than a rule. */
export const Quote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="my-5 pl-6 font-serif italic text-content-2">{children}</p>
);
