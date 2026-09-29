import React from 'react';
import { TOO_HIGH, TOO_LOW, type Flaw } from '../../content/flaws.ts';
import { FlawExample } from './FlawExamples.tsx';

const FlawList: React.FC<{ title: string; flaws: Flaw[] }> = ({ title, flaws }) => (
  <div>
    <p className="pb-2 border-b border-content/70 font-sans text-[0.9375rem] font-semibold text-content">{title}</p>
    <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6">
      {flaws.map((flaw) => (
        <li key={flaw.name} className="min-w-0 font-sans text-[0.8125rem] leading-snug">
          <div className="rounded-sm border border-line p-1.5">
            <FlawExample name={flaw.name} />
          </div>
          <p className="mt-2 font-medium text-content">{flaw.name}</p>
          <p className="mt-0.5 text-content-2">{flaw.description}</p>
        </li>
      ))}
    </ul>
  </div>
);

/** Design flaws on either side of the right range. */
const FlawSpectrum: React.FC = () => (
  <figure className="my-12 md:my-14" aria-label="Design flaws that push the data-ink ratio below or above its best range">
    <div className="grid gap-y-10 md:grid-cols-2 gap-x-5 lg:gap-x-8">
      <FlawList title="Push the ratio too low: ink that crowds out the data" flaws={TOO_LOW} />
      <FlawList title="Push it too high: too little help for the reader" flaws={TOO_HIGH} />
    </div>
    <figcaption className="mt-6 font-sans text-xs text-content-2 max-w-2xl">
      Flaws from Lan and Liu’s study of over 2,000 visualizations the public called out as “junk” (IEEE TVCG, 2025), with the direction
      each pushes the ratio as assessed in <cite>Balancing clarity and clutter</cite>.
    </figcaption>
  </figure>
);

export default FlawSpectrum;
