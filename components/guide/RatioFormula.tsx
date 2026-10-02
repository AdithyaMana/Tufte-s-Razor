import React from 'react';

/** The data-ink ratio in its simplest form, set as a fraction. */
const RatioFormula: React.FC<{ className?: string }> = ({ className = 'my-6' }) => (
  <div
    role="math"
    aria-label="Data-ink ratio equals the ink used to show the data, divided by all the ink used in the chart."
    className={`flex flex-wrap items-center gap-x-4 gap-y-2 font-serif text-content ${className}`}
  >
    <span aria-hidden="true">Data-ink ratio&nbsp;&nbsp;=</span>
    <span aria-hidden="true" className="inline-flex flex-col items-center text-center leading-snug">
      <span className="px-2 pb-1">ink used to show the data</span>
      <span className="self-stretch border-t border-content px-2 pt-1">all the ink used in the chart</span>
    </span>
  </div>
);

export default RatioFormula;
