import React from 'react';
import { TOO_HIGH, TOO_LOW, type Flaw } from '../../content/flaws.ts';

const FlawList: React.FC<{ title: string; subtitle: string; flaws: Flaw[]; align: 'left' | 'right' }> = ({ title, subtitle, flaws, align }) => (
  <div className={align === 'right' ? 'md:text-right' : ''}>
    <p className="font-sans text-[0.9375rem] font-semibold text-ink">{title}</p>
    <p className="font-sans text-xs text-muted mt-0.5">{subtitle}</p>
    <ul className="mt-4 space-y-3">
      {flaws.map((flaw) => (
        <li key={flaw.name}>
          <p className="font-serif text-lg leading-snug text-ink">{flaw.name}</p>
          <p className="font-sans text-[0.8125rem] leading-snug text-ink-2">{flaw.description}</p>
        </li>
      ))}
    </ul>
  </div>
);

/** Design flaws on either side of the comfortable range. */
const FlawSpectrum: React.FC = () => (
  <figure className="my-10 md:my-12" aria-label="Design flaws that push the data-ink ratio below or above its optimal range">
    <div className="font-sans" aria-hidden="true">
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-px bg-rule-2" />
        <div className="absolute left-[38%] right-[38%] top-1/2 -translate-y-1/2 h-3 rounded-full bg-ink-data/25 ring-1 ring-ink-data/60" />
        <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[1px] w-2 h-2 border-l border-b border-rule-2 rotate-45" />
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[1px] w-2 h-2 border-r border-t border-rule-2 rotate-45" />
      </div>
      <div className="grid grid-cols-3 text-[0.6875rem] uppercase tracking-[0.12em] font-semibold text-muted">
        <span>Lower data-ink ratio</span>
        <span className="text-center text-ink-2">Optimal range</span>
        <span className="text-right">Higher data-ink ratio</span>
      </div>
    </div>
    <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
      <FlawList title="Push the ratio too low" subtitle="Ink that crowds out the data" flaws={TOO_LOW} align="left" />
      <FlawList title="Push the ratio too high" subtitle="Too little help for the reader" flaws={TOO_HIGH} align="right" />
    </div>
    <figcaption className="mt-8 font-sans text-xs text-muted max-w-2xl">
      Flaws from Lan and Liu’s study of over 2,000 visualizations the public called out as “junk” (IEEE TVCG, 2025), with the direction
      each pushes the ratio as assessed in <cite>Balancing clarity and clutter</cite>.
    </figcaption>
  </figure>
);

export default FlawSpectrum;
