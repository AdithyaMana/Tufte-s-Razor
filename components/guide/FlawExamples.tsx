import React, { useId } from 'react';
import { ARTICLE_DATA } from '../../ink/spec.ts';

// A drawing of each design flaw, so readers can recognise it rather than just read its name.
// Each is drawn from the guide's own data (weekly trips at five stations) on a 320 × 200 grid,
// in the page's colours where the flaw allows, so they suit both themes. Colours the flaw
// itself calls for (garish gradients, clashing hues) are fixed on purpose.

const W = 320;
const H = 200;
const BASE = 168;
const LEFT = 36;
const SLOT = 54;
const MAX = 10;
const PLOT_H = 130;

const barX = (i: number) => LEFT + i * SLOT;
const barH = (value: number) => (value / MAX) * PLOT_H;

const Frame: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={label}>
    {children}
  </svg>
);

const Baseline: React.FC<{ x1?: number; x2?: number }> = ({ x1 = LEFT - 8, x2 = W - 16 }) => (
  <line x1={x1} x2={x2} y1={BASE + 0.5} y2={BASE + 0.5} className="stroke-content-2" strokeWidth={1} />
);

/** Station names under a row of bars, at a readable size. */
const Names: React.FC<{ width?: number; size?: number }> = ({ width = 34, size = 10 }) => (
  <>
    {ARTICLE_DATA.map((d, i) => (
      <text key={d.label} x={barX(i) + width / 2} y={BASE + 15} textAnchor="middle" fontSize={size} className="fill-content-2 font-sans">
        {d.label}
      </text>
    ))}
  </>
);

/** Deterministic pseudo-random numbers, so drawings look scattered but never change. */
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const StylizedEffects: React.FC = () => {
  const id = useId();
  return (
    <Frame label="Bars drawn as glossy 3D blocks with gradients and drop shadows">
      <defs>
        <linearGradient id={`${id}f`} x1="0" x2="1">
          <stop offset="0" stopColor="#b9d3fb" />
          <stop offset="0.45" stopColor="#4472c4" />
          <stop offset="1" stopColor="#16305f" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}s`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <polygon points={`${LEFT - 14},${BASE} ${W - 10},${BASE} ${W - 24},${BASE + 16} ${LEFT - 28},${BASE + 16}`} className="fill-content/10" />
      {ARTICLE_DATA.map((d, i) => {
        const x = barX(i);
        const h = barH(d.value);
        const y = BASE - h;
        return (
          <g key={d.label}>
            <rect x={x + 10} y={y + 10} width={30} height={h} fill="#000" opacity={0.45} filter={`url(#${id}s)`} />
            <polygon points={`${x},${y} ${x + 10},${y - 10} ${x + 40},${y - 10} ${x + 30},${y}`} fill="#9fc0f5" />
            <polygon points={`${x + 30},${y} ${x + 40},${y - 10} ${x + 40},${BASE - 10} ${x + 30},${BASE}`} fill="#16305f" />
            <rect x={x} y={y} width={30} height={h} fill={`url(#${id}f)`} />
            <rect x={x + 3} y={y + 3} width={10} height={h - 6} fill={`url(#${id}g)`} />
          </g>
        );
      })}
    </Frame>
  );
};

const Embellishment: React.FC = () => (
  <Frame label="A bar chart half hidden behind a large decorative bicycle">
    {ARTICLE_DATA.map((d, i) => (
      <rect key={d.label} x={barX(i)} y={BASE - barH(d.value)} width={34} height={barH(d.value)} className="fill-ink-data" />
    ))}
    <Baseline />
    <Names />
    <g className="stroke-warn" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={112} cy={112} r={38} className="fill-paper/70" />
      <circle cx={232} cy={112} r={38} className="fill-paper/70" />
      <path d="M112 112 L150 60 L210 60 L232 112 M150 60 L172 112 L210 60 M172 112 L112 112 M140 44 L162 44 M210 60 L204 40 L222 40" />
    </g>
  </Frame>
);

const SeveralChannels: React.FC = () => {
  const shades = ['#0d2b5e', '#2f5597', '#9cc1f2', '#2f5597', '#2f5597'];
  return (
    <Frame label="Each station's trips shown by bar height, bar width and colour shade at once">
      {ARTICLE_DATA.map((d, i) => {
        const w = d.value * 4.8;
        return <rect key={d.label} x={barX(i) + 17 - w / 2} y={BASE - barH(d.value)} width={w} height={barH(d.value)} fill={shades[i]} />;
      })}
      <Baseline />
      <Names />
      <g className="font-sans" fontSize={9}>
        <text x={W - 16} y={16} textAnchor="end" className="fill-content-2">
          Darker = more trips · Wider = more trips
        </text>
      </g>
    </Frame>
  );
};

const MeaninglessEncoding: React.FC = () => {
  const id = useId();
  const fills = ['#eb6834', `url(#${id}p)`, '#7bc47f', '#b45309', `url(#${id}d)`];
  return (
    <Frame label="Bars in random colours and patterns, with a legend that explains nothing">
      <defs>
        <pattern id={`${id}p`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#f6c343" />
          <rect width="3" height="6" fill="#eb6834" />
        </pattern>
        <pattern id={`${id}d`} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#8a4fc7" />
          <circle cx="3" cy="3" r="1.4" fill="#fff" />
        </pattern>
      </defs>
      {ARTICLE_DATA.map((d, i) => (
        <rect key={d.label} x={barX(i)} y={BASE - barH(d.value)} width={34} height={barH(d.value)} fill={fills[i]} />
      ))}
      <Baseline />
      <Names />
      <g className="font-sans" fontSize={9}>
        {['Series 1', 'Series 2', 'Series 3', 'Series 4', 'Series 5'].map((s, i) => (
          <g key={s} transform={`translate(${LEFT + i * 54}, 12)`}>
            <rect width={9} height={9} fill={fills[i]} />
            <text x={13} y={8} className="fill-content-2">
              {s}
            </text>
          </g>
        ))}
      </g>
    </Frame>
  );
};

const OverusedChannels: React.FC = () => {
  const next = rand(7);
  const colours = ['#eb6834', '#4472c4', '#7bc47f', '#8a4fc7', '#f6c343'];
  const points = Array.from({ length: 22 }, () => ({
    x: 40 + next() * 250,
    y: 30 + next() * 125,
    r: 3 + next() * 9,
    c: colours[Math.floor(next() * colours.length)],
    shape: Math.floor(next() * 3),
    hollow: next() > 0.6,
  }));
  return (
    <Frame label="Points that vary in colour, size, shape and fill all at once, so none of them stands out">
      <line x1={32.5} x2={32.5} y1={20} y2={BASE} className="stroke-content-2" />
      <Baseline x1={32} />
      {points.map((p, i) => {
        const paint = p.hollow ? { fill: 'none', stroke: p.c, strokeWidth: 2 } : { fill: p.c };
        if (p.shape === 0) return <circle key={i} cx={p.x} cy={p.y} r={p.r} {...paint} />;
        if (p.shape === 1) return <rect key={i} x={p.x - p.r} y={p.y - p.r} width={p.r * 2} height={p.r * 2} {...paint} />;
        return <polygon key={i} points={`${p.x},${p.y - p.r} ${p.x + p.r},${p.y + p.r} ${p.x - p.r},${p.y + p.r}`} {...paint} />;
      })}
    </Frame>
  );
};

const TooManyUnits: React.FC = () => (
  <Frame label="Each station's trips drawn as dozens of separate dots instead of one bar">
    {ARTICLE_DATA.map((d, i) =>
      Array.from({ length: d.value * 5 }, (_, k) => (
        <circle key={`${d.label}-${k}`} cx={barX(i) + 5 + (k % 4) * 8} cy={BASE - 5 - Math.floor(k / 4) * 11.5} r={3.1} className="fill-ink-data" />
      )),
    )}
    <Baseline />
    <Names />
    <text x={W - 16} y={16} textAnchor="end" fontSize={9} className="fill-content-2 font-sans">
      ● = 200 trips
    </text>
  </Frame>
);

const TooSmall: React.FC = () => (
  <Frame label="Hairline bars with labels far too small to read">
    {ARTICLE_DATA.map((d, i) => (
      <g key={d.label}>
        <rect x={barX(i) + 16} y={BASE - barH(d.value)} width={1.5} height={barH(d.value)} className="fill-ink-data" />
        <text x={barX(i) + 17} y={BASE - barH(d.value) - 3} textAnchor="middle" fontSize={4} className="fill-content-2 font-sans">
          {d.value}k
        </text>
      </g>
    ))}
    <Baseline />
    <Names size={4} />
    <text x={LEFT - 8} y={16} fontSize={5} className="fill-content-2 font-sans">
      Weekly trips by station (thousands)
    </text>
  </Frame>
);

const Overlapping: React.FC = () => {
  const next = rand(3);
  const gauss = () => (next() + next() + next() - 1.5) / 1.5;
  return (
    <Frame label="Hundreds of scatter-plot dots piled on top of each other, hiding the pattern">
      <line x1={32.5} x2={32.5} y1={20} y2={BASE} className="stroke-content-2" />
      <Baseline x1={32} />
      {Array.from({ length: 420 }, (_, i) => {
        const cluster = i % 3;
        const cx = [110, 170, 225][cluster] + gauss() * 55;
        const cy = [110, 80, 120][cluster] + gauss() * 40;
        return <circle key={i} cx={cx} cy={cy} r={5} className="fill-ink-data stroke-paper" strokeWidth={0.8} />;
      })}
    </Frame>
  );
};

const ClutteredLabels: React.FC = () => {
  const slices = [22, 14, 11, 9, 8, 7, 6, 6, 5, 4, 3, 3, 2];
  const total = slices.reduce((a, b) => a + b, 0);
  const cx = 160;
  const cy = 100;
  const r = 58;
  let angle = -Math.PI / 2;
  const shades = ['#184f95', '#2f5597', '#4472c4', '#5a8ad6', '#79a3e3', '#9cc1f2'];
  return (
    <Frame label="A pie of many thin slices with a tangle of crossing leader lines to its labels">
      {slices.map((v, i) => {
        const a0 = angle;
        const a1 = angle + (v / total) * Math.PI * 2;
        angle = a1;
        const mid = (a0 + a1) / 2;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const path = `M${cx},${cy} L${cx + Math.cos(a0) * r},${cy + Math.sin(a0) * r} A${r},${r} 0 ${large} 1 ${cx + Math.cos(a1) * r},${cy + Math.sin(a1) * r} Z`;
        // Labels alternate sides regardless of where their slice is, so the lines cross.
        const side = i % 2 ? 1 : -1;
        const lx = cx + side * 128;
        const ly = 18 + i * 13;
        const ex = cx + Math.cos(mid) * (r - 8);
        const ey = cy + Math.sin(mid) * (r - 8);
        return (
          <g key={i}>
            <path d={path} fill={shades[i % shades.length]} className="stroke-paper" strokeWidth={1} />
            <polyline points={`${ex},${ey} ${cx + side * 80},${ly} ${lx},${ly}`} fill="none" className="stroke-content-2" strokeWidth={0.8} />
            <text x={lx + side * 3} y={ly + 3} textAnchor={side > 0 ? 'start' : 'end'} fontSize={8} className="fill-content-2 font-sans">
              Stop {i + 1}
            </text>
          </g>
        );
      })}
    </Frame>
  );
};

const DualAxes: React.FC = () => {
  const temps = [14, 22, 17, 25, 19];
  const tY = (t: number) => BASE - ((t - 10) / 20) * PLOT_H;
  return (
    <Frame label="Bars for trips read against a left axis and a line for temperature read against a different right axis">
      {[0, 2.5, 5, 7.5, 10].map((v) => (
        <line key={v} x1={LEFT - 6} x2={W - 32} y1={BASE - barH(v) + 0.5} y2={BASE - barH(v) + 0.5} className="stroke-content/15" />
      ))}
      {ARTICLE_DATA.map((d, i) => (
        <rect key={d.label} x={barX(i) + 2} y={BASE - barH(d.value)} width={30} height={barH(d.value)} className="fill-ink-data" />
      ))}
      <polyline points={temps.map((t, i) => `${barX(i) + 17},${tY(t)}`).join(' ')} fill="none" className="stroke-warn" strokeWidth={3} strokeLinejoin="round" />
      {temps.map((t, i) => (
        <circle key={i} cx={barX(i) + 17} cy={tY(t)} r={3.5} className="fill-warn" />
      ))}
      <g className="font-sans" fontSize={9}>
        {[0, 5, 10].map((v) => (
          <text key={v} x={LEFT - 10} y={BASE - barH(v) + 3} textAnchor="end" className="fill-ink-data">
            {v}k
          </text>
        ))}
        {[10, 20, 30].map((t) => (
          <text key={t} x={W - 28} y={tY(t) + 3} className="fill-warn">
            {t}°
          </text>
        ))}
      </g>
      <Baseline x2={W - 32} />
      <Names />
    </Frame>
  );
};

const HighDensity: React.FC = () => {
  const next = rand(11);
  const colours = ['#184f95', '#4472c4', '#eb6834', '#b45309', '#7bc47f', '#8a4fc7'];
  return (
    <Frame label="Thirty tangled lines crammed into one small plot">
      <line x1={24.5} x2={24.5} y1={14} y2={BASE} className="stroke-content-2" />
      <Baseline x1={24} x2={W - 10} />
      {Array.from({ length: 30 }, (_, s) => {
        let y = 40 + next() * 110;
        const pts = Array.from({ length: 26 }, (_, i) => {
          y = Math.min(BASE - 4, Math.max(18, y + (next() - 0.5) * 28));
          return `${26 + i * 11.4},${y.toFixed(1)}`;
        });
        return <polyline key={s} points={pts.join(' ')} fill="none" stroke={colours[s % colours.length]} strokeWidth={1.1} opacity={0.85} />;
      })}
    </Frame>
  );
};

const EXAMPLES: Record<string, React.FC> = {
  'Stylized effects on data marks': StylizedEffects,
  'Embellishment obscuring data': Embellishment,
  'Several channels for one variable': SeveralChannels,
  'Meaningless or confusing encoding': MeaninglessEncoding,
  'Overused visual channels': OverusedChannels,
  'Too many units': TooManyUnits,
  'Text or marks too small': TooSmall,
  'Overlapping data marks': Overlapping,
  'Cluttered label lines': ClutteredLabels,
  'Dual axes': DualAxes,
  'Very high information density': HighDensity,
};

export const FlawExample: React.FC<{ name: string }> = ({ name }) => {
  const Example = EXAMPLES[name];
  return Example ? <Example /> : null;
};
