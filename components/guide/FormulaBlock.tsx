import React from 'react';

/** Tufte's definition, in its three equivalent forms. */
const FormulaBlock: React.FC = () => (
  <figure className="my-10 md:my-12 max-w-3xl" aria-label="The data-ink ratio, defined three ways">
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 md:gap-x-6 gap-y-5 items-center font-serif text-ink">
      <span className="text-xl md:text-2xl whitespace-nowrap">Data-ink ratio</span>
      <span className="flex items-center gap-4 md:gap-6">
        <span className="text-xl md:text-2xl text-muted">=</span>
        <span className="inline-flex flex-col items-center text-lg md:text-xl leading-tight">
          <span className="px-2 pb-1.5 border-b border-ink">data-ink</span>
          <span className="px-2 pt-1.5 text-center">total ink used to print the graphic</span>
        </span>
      </span>

      <span aria-hidden="true" />
      <span className="flex items-baseline gap-4 md:gap-6">
        <span className="text-xl md:text-2xl text-muted">=</span>
        <span className="text-lg md:text-xl leading-snug">
          proportion of a graphic’s ink devoted to the <em>non-redundant</em> display of data-information
        </span>
      </span>

      <span aria-hidden="true" />
      <span className="flex items-baseline gap-4 md:gap-6">
        <span className="text-xl md:text-2xl text-muted">=</span>
        <span className="text-lg md:text-xl leading-snug">
          1.0 − proportion of a graphic that can be <em>erased</em> without loss of data-information
        </span>
      </span>
    </div>
    <figcaption className="mt-5 font-sans text-xs text-muted">
      Edward R. Tufte, <cite>The Visual Display of Quantitative Information</cite> (1983)
    </figcaption>
  </figure>
);

export default FormulaBlock;
