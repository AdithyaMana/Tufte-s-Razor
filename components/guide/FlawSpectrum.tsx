import React, { useState } from 'react';
import { TOO_HIGH, TOO_LOW, type Flaw } from '../../content/flaws.ts';
import { SlideNav, useSlideGestures } from './controls.tsx';
import { FlawExample } from './FlawExamples.tsx';

const SIDES = [
  { key: 'low', title: 'Pushes the ratio too low', short: 'Too low', blurb: 'Ink that crowds out the data', flaws: TOO_LOW },
  { key: 'high', title: 'Pushes the ratio too high', short: 'Too high', blurb: 'Too little help for the reader', flaws: TOO_HIGH },
] as const;

const SLIDES = SIDES.flatMap((side) => side.flaws.map((flaw) => ({ flaw, side })));

const Caption: React.FC = () => (
  <figcaption className="mt-6 font-sans text-xs text-content-2 max-w-2xl">
    Flaws from Lan and Liu’s study of over 2,000 visualizations the public called out as “junk” (IEEE TVCG, 2025), with the direction
    each pushes the ratio as assessed in <cite>Balancing clarity and clutter</cite>. The drawings are illustrations, made for this guide.
  </figcaption>
);

const FlawText: React.FC<{ flaw: Flaw }> = ({ flaw }) => (
  <>
    <p className="font-medium text-content text-xl leading-snug">{flaw.name}</p>
    <p className="mt-1 text-content-2 text-[0.9375rem] leading-relaxed">{flaw.description}</p>
    <p className="mt-2 text-content text-[0.9375rem] leading-relaxed">
      <span className="font-semibold">Instead: </span>
      {flaw.fix}
    </p>
    {flaw.ratioBlind && (
      <p className="mt-2 italic text-content-2 text-[0.875rem] leading-relaxed">
        <span className="not-italic font-semibold">The ratio can’t see this. </span>
        {flaw.ratioBlind}
      </p>
    )}
  </>
);

/** Design flaws on either side of the right range: one at a time, large, with thumbnails to jump between them. */
const FlawSpectrum: React.FC = () => {
  const [index, setIndex] = useState(0);
  const { go, props: gestures } = useSlideGestures(index, SLIDES.length, setIndex);
  const { flaw, side } = SLIDES[index];

  return (
    <figure
      className="my-12 md:my-14 font-sans"
      role="region"
      aria-roledescription="carousel"
      aria-label="Design flaws that push the data-ink ratio below or above its best range"
      {...gestures}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-10 items-center">
        <div className="rounded-md border border-line p-4 md:p-6 bg-content/[0.02]" aria-live="polite">
          <FlawExample key={flaw.name} name={flaw.name} />
        </div>
        <div>
          <p className="kicker">
            <span className={side.key === 'low' ? 'text-ink-nondata' : 'text-ink-data'}>{side.title}</span>
            <span className="text-chrome"> · {side.blurb}</span>
          </p>
          <div className="mt-3">
            <FlawText flaw={flaw} />
          </div>
          <SlideNav index={index} count={SLIDES.length} onGo={go} noun="flaw" className="mt-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-[6fr_5fr]">
        {SIDES.map((s) => (
          <div key={s.key} className="min-w-0">
            <p className="text-xs font-semibold text-content-2">{s.short}</p>
            <ul className="mt-2 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${s.flaws.length}, minmax(0, 1fr))` }}>
              {s.flaws.map((f) => {
                const i = SLIDES.findIndex((slide) => slide.flaw === f);
                const current = i === index;
                return (
                  <li key={f.name}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-label={f.name}
                      aria-current={current ? 'true' : undefined}
                      title={f.name}
                      className={`block w-full rounded-sm border p-1 transition-opacity ${
                        current ? 'border-content opacity-100' : 'border-line opacity-50 hover:opacity-90'
                      }`}
                    >
                      <FlawExample name={f.name} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <Caption />
    </figure>
  );
};

export default FlawSpectrum;
