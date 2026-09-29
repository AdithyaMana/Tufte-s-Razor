import React from 'react';

const Marker: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g>
    <circle cx={x} cy={y} r={10} className="fill-control stroke-paper" strokeWidth={2.5} />
    <text x={x} y={y} dy="0.35em" textAnchor="middle" className="fill-paper font-sans text-[11px] font-semibold">
      {n}
    </text>
  </g>
);

const KINDS = [
  {
    n: 1,
    title: 'Data-ink',
    swatch: 'bg-ink-data',
    text: 'Shows the values. For a bar, that is a thin line as long as the bar: the least ink that could show its value.',
  },
  {
    n: 2,
    title: 'Repeated data-ink',
    swatch: 'bg-ink-redundant',
    text: 'Says a value again: the rest of the bar’s width, an outline, a number printed on the bar.',
  },
  {
    n: 3,
    title: 'Non-data ink',
    swatch: 'bg-ink-nondata',
    text: 'Everything else that is drawn: axes, gridlines, borders, shaded backgrounds, titles and labels.',
  },
  {
    n: 4,
    title: 'Paper',
    swatch: 'bg-paper border border-line-2',
    text: 'The background, whatever its colour. It isn’t ink at all, and neither is ink hidden behind other ink.',
  },
];

/** One bar, taken apart into the kinds of ink the guide counts. */
const BarAnatomy: React.FC = () => (
  <figure className="my-10 md:my-14 grid md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] gap-8 md:gap-14 items-center">
    <svg
      viewBox="0 0 300 270"
      className="w-full max-w-[17rem] mx-auto"
      role="img"
      aria-label="Diagram of one bar: a thin dark line down its centre is data-ink, the rest of the bar is repeated data-ink, and the gridlines, axis line and label are non-data ink."
    >
      {[70, 120, 170].map((y) => (
        <line key={y} x1={30} x2={270} y1={y + 0.5} y2={y + 0.5} className="stroke-ink-nondata" strokeWidth={1.5} />
      ))}
      <rect x={105} y={90} width={90} height={140} className="fill-ink-redundant" />
      <rect x={148.5} y={90} width={3} height={140} className="fill-ink-data" />
      <line x1={30} x2={270} y1={231} y2={231} className="stroke-ink-nondata" strokeWidth={2} />
      <text x={150} y={254} textAnchor="middle" className="fill-ink-nondata font-sans text-[14px]">
        B
      </text>
      <Marker x={150} y={160} n={1} />
      <Marker x={178} y={200} n={2} />
      <Marker x={235} y={120} n={3} />
      <Marker x={62} y={200} n={4} />
    </svg>
    <ol className="space-y-4 font-sans">
      {KINDS.map((kind) => (
        <li key={kind.n} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3">
          <span className="mt-0.5 w-5 h-5 rounded-full bg-control text-paper text-[11px] font-semibold grid place-items-center" aria-hidden="true">
            {kind.n}
          </span>
          <div>
            <p className="flex items-center gap-2 text-[0.9375rem] font-semibold text-content">
              <span className={`w-2.5 h-2.5 ${kind.swatch}`} aria-hidden="true" />
              {kind.title}
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-content-2">{kind.text}</p>
          </div>
        </li>
      ))}
    </ol>
  </figure>
);

export default BarAnatomy;
