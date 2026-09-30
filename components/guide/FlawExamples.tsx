import React, { useId } from 'react';
import { ARTICLE_DATA } from '../../ink/spec.ts';

// A drawing of each design flaw, made to look like a real published chart that happens to have
// the flaw, so readers recognise it in the wild. All share one frame: a left-aligned title,
// hairline gridlines and quiet axis text in the page's own colours, so they suit both themes.
// Where the flaw is about colour, the colours come from one fixed categorical palette, used in
// order; charts that don't need colour use the guide's data blue.

const W = 320;
const H = 200;
/** The plot area every framed chart shares. */
const PLOT = { left: 44, right: 304, top: 40, bottom: 164 };
const PLOT_H = PLOT.bottom - PLOT.top;
const MAX = 10;
const SLOT = (PLOT.right - PLOT.left) / ARTICLE_DATA.length;

const slotX = (i: number) => PLOT.left + i * SLOT;
const yOf = (value: number) => PLOT.bottom - (value / MAX) * PLOT_H;

/** A fixed categorical order (blue, orange, aqua, yellow, magenta), validated on both papers. */
const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];

const Frame: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block font-sans" role="img" aria-label={label}>
    {children}
  </svg>
);

const Title: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 11 }) => (
  <text x={12} y={20} fontSize={size} fontWeight={600} className="fill-content">
    {children}
  </text>
);

/** Hairline gridlines with their values at the left, in thousands of trips. */
const Grid: React.FC<{ ticks?: number[]; right?: number; size?: number }> = ({ ticks = [0, 5, 10], right = PLOT.right, size = 9 }) => (
  <g>
    {ticks.map((t) => (
      <g key={t}>
        <line x1={PLOT.left} x2={right} y1={yOf(t) + 0.5} y2={yOf(t) + 0.5} className={t === 0 ? 'stroke-content/40' : 'stroke-content/10'} />
        <text x={PLOT.left - 6} y={yOf(t) + 3} fontSize={size} textAnchor="end" className="fill-content-2 tabular-nums">
          {t === 0 ? '0' : `${t}k`}
        </text>
      </g>
    ))}
  </g>
);

/** Station names under their slots. */
const Stations: React.FC<{ size?: number }> = ({ size = 9 }) => (
  <g>
    {ARTICLE_DATA.map((d, i) => (
      <text key={d.label} x={slotX(i) + SLOT / 2} y={PLOT.bottom + 14} fontSize={size} textAnchor="middle" className="fill-content-2">
        {d.label}
      </text>
    ))}
  </g>
);

/** A column with a slightly rounded top, square at the baseline. */
function column(x: number, w: number, value: number, r = 2): string {
  const top = yOf(value);
  return `M${x},${PLOT.bottom} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${PLOT.bottom} Z`;
}

/** Deterministic pseudo-random numbers, so the scattered drawings never change. */
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---- Too low: ink that crowds out the data ----------------------------------------------------

/** A spreadsheet's "3-D column" preset: perspective floor, back wall, glossy bars, soft shadows. */
const StylizedEffects: React.FC = () => {
  const id = useId();
  const dx = 10;
  const dy = 8;
  const w = 24;
  return (
    <Frame label="A bar chart drawn as glossy 3D columns on a perspective floor, with shadows">
      <defs>
        <linearGradient id={`${id}front`} x1="0" x2="1">
          <stop offset="0" stopColor="#8fbdf2" />
          <stop offset="0.35" stopColor="#2a78d6" />
          <stop offset="1" stopColor="#154a8c" />
        </linearGradient>
        <linearGradient id={`${id}shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <Title>Weekly trips by station</Title>
      {/* Back wall and floor, drawn in perspective behind the columns. */}
      {[0, 5, 10].map((t) => (
        <g key={t}>
          <line x1={PLOT.left + dx} x2={PLOT.right} y1={yOf(t) - dy} y2={yOf(t) - dy} className="stroke-content/15" />
          <line x1={PLOT.left} x2={PLOT.left + dx} y1={yOf(t)} y2={yOf(t) - dy} className="stroke-content/15" />
          <text x={PLOT.left - 6} y={yOf(t) + 3} fontSize={9} textAnchor="end" className="fill-content-2">
            {t === 0 ? '0' : `${t}k`}
          </text>
        </g>
      ))}
      <polygon
        points={`${PLOT.left},${PLOT.bottom} ${PLOT.left + dx},${PLOT.bottom - dy} ${PLOT.right},${PLOT.bottom - dy} ${PLOT.right - dx},${PLOT.bottom}`}
        className="fill-content/10"
      />
      {ARTICLE_DATA.map((d, i) => {
        const x = slotX(i) + (SLOT - w) / 2 - dx / 2;
        const top = yOf(d.value);
        return (
          <g key={d.label}>
            <rect x={x + 6} y={top + 6} width={w} height={PLOT.bottom - top - 4} fill="#000" opacity={0.35} filter={`url(#${id}blur)`} />
            <polygon points={`${x},${top} ${x + dx},${top - dy} ${x + w + dx},${top - dy} ${x + w},${top}`} fill="#b3d2f7" />
            <polygon points={`${x + w},${top} ${x + w + dx},${top - dy} ${x + w + dx},${PLOT.bottom - dy} ${x + w},${PLOT.bottom}`} fill="#123f78" />
            <rect x={x} y={top} width={w} height={PLOT.bottom - top} fill={`url(#${id}front)`} />
            <rect x={x + 3} y={top + 2} width={7} height={PLOT.bottom - top - 4} fill={`url(#${id}shine)`} />
          </g>
        );
      })}
      <Stations />
    </Frame>
  );
};

/** A marketing-style badge stamped across the middle of the columns. */
const Embellishment: React.FC = () => (
  <Frame label="A bar chart with a large 'Record week' badge covering the middle columns">
    <Title>Weekly trips by station</Title>
    <Grid />
    {ARTICLE_DATA.map((d, i) => (
      <path key={d.label} d={column(slotX(i) + SLOT / 4, SLOT / 2, d.value)} className="fill-ink-data" />
    ))}
    <Stations />
    <g transform="translate(150 94) rotate(-8)">
      <circle r={46} fill="#000" opacity={0.18} transform="translate(3 4)" />
      <circle r={46} fill="#eb6834" />
      <circle r={40} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={1.2} strokeDasharray="2 3" />
      {/* A bicycle, in the badge's line style. */}
      <g fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" transform="translate(-17 -30)">
        <circle cx={6} cy={16} r={6} />
        <circle cx={28} cy={16} r={6} />
        <path d="M6 16 L13 5 H24 L28 16 M13 5 L17 16 L24 5 M11 2 H15" />
      </g>
      <text y={4} fontSize={13} fontWeight={800} textAnchor="middle" fill="#fff" letterSpacing="0.06em">
        RECORD
      </text>
      <text y={19} fontSize={13} fontWeight={800} textAnchor="middle" fill="#fff" letterSpacing="0.06em">
        WEEK!
      </text>
    </g>
  </Frame>
);

/** Height, width and shade all say the same number, with a legend for the shade. */
const SeveralChannels: React.FC = () => {
  const id = useId();
  const shades = ['#cde2fb', '#86b6ef', '#3987e5', '#1c5cab', '#0d366b'];
  const shadeOf = (v: number) => shades[Math.round(((v - 5) / 4) * (shades.length - 1))];
  return (
    <Frame label="Bars whose height, width and colour all encode the same value">
      <defs>
        <linearGradient id={`${id}ramp`} x1="0" x2="1">
          {shades.map((c, i) => (
            <stop key={c} offset={i / (shades.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <Title>Weekly trips by station</Title>
      <g transform="translate(222 11)">
        <rect width={52} height={7} rx={1} fill={`url(#${id}ramp)`} />
        <text x={-4} y={6.5} fontSize={8} textAnchor="end" className="fill-content-2">
          5k
        </text>
        <text x={56} y={6.5} fontSize={8} className="fill-content-2">
          9k
        </text>
      </g>
      <Grid />
      {ARTICLE_DATA.map((d, i) => {
        const w = 8 + (d.value - 4) * 7;
        return <path key={d.label} d={column(slotX(i) + (SLOT - w) / 2, w, d.value)} fill={shadeOf(d.value)} />;
      })}
      <Stations />
    </Frame>
  );
};

/** A spreadsheet's "vary colours by point": five colours, and a legend that explains nothing. */
const MeaninglessEncoding: React.FC = () => (
  <Frame label="Bars in five different colours with a legend of Series 1 to 5 that means nothing">
    <Title>Weekly trips by station</Title>
    <g>
      {PALETTE.map((c, i) => (
        <g key={c} transform={`translate(${PLOT.left + i * 52} 28)`}>
          <rect width={7} height={7} rx={1} fill={c} />
          <text x={10} y={6.5} fontSize={8} className="fill-content-2">
            Series {i + 1}
          </text>
        </g>
      ))}
    </g>
    <Grid />
    {ARTICLE_DATA.map((d, i) => (
      <path key={d.label} d={column(slotX(i) + SLOT / 4, SLOT / 2, d.value)} fill={PALETTE[i]} />
    ))}
    <Stations />
  </Frame>
);

/** Colour, size, shape and fill all vary at once, each with its own legend. */
const OverusedChannels: React.FC = () => {
  const next = rand(21);
  const right = 222;
  const points = Array.from({ length: 22 }, () => ({
    x: PLOT.left + 8 + next() * (right - PLOT.left - 16),
    y: PLOT.top + 10 + next() * (PLOT_H - 20),
    colour: PALETTE[Math.floor(next() * 4)],
    size: [3, 5, 7.5][Math.floor(next() * 3)],
    shape: Math.floor(next() * 3),
    hollow: next() > 0.65,
  }));
  const mark = (shape: number, x: number, y: number, r: number, paint: React.SVGProps<SVGElement>, key?: React.Key) =>
    shape === 0 ? (
      <circle key={key} cx={x} cy={y} r={r} {...(paint as React.SVGProps<SVGCircleElement>)} />
    ) : shape === 1 ? (
      <rect key={key} x={x - r} y={y - r} width={r * 2} height={r * 2} {...(paint as React.SVGProps<SVGRectElement>)} />
    ) : (
      <polygon key={key} points={`${x},${y - r * 1.15} ${x + r * 1.1},${y + r * 0.8} ${x - r * 1.1},${y + r * 0.8}`} {...(paint as React.SVGProps<SVGPolygonElement>)} />
    );
  return (
    <Frame label="A scatter plot whose points vary in colour, size, shape and fill at once, with three legends">
      <Title>Trips vs. distance, by station</Title>
      <Grid right={right} ticks={[0, 5, 10]} />
      {points.map((p, i) =>
        mark(p.shape, p.x, p.y, p.size, p.hollow ? { fill: 'none', stroke: p.colour, strokeWidth: 1.6 } : { fill: p.colour }, i),
      )}
      <text x={(PLOT.left + right) / 2} y={PLOT.bottom + 14} fontSize={9} textAnchor="middle" className="fill-content-2">
        Distance (km)
      </text>
      <g transform="translate(236 42)" fontSize={8}>
        <text className="fill-content" fontWeight={600}>
          Zone
        </text>
        {['North', 'East', 'South', 'West'].map((z, i) => (
          <g key={z} transform={`translate(0 ${11 + i * 10})`}>
            <rect y={-6} width={6} height={6} rx={1} fill={PALETTE[i]} />
            <text x={10} className="fill-content-2">
              {z}
            </text>
          </g>
        ))}
        <text y={60} className="fill-content" fontWeight={600}>
          Type
        </text>
        {['Dock', 'Hub', 'Pop-up'].map((t, i) => (
          <g key={t} transform={`translate(0 ${71 + i * 10})`}>
            {mark(i, 3, -3, 3, { className: 'fill-content-2' })}
            <text x={10} className="fill-content-2">
              {t}
            </text>
          </g>
        ))}
        <text y={110} className="fill-content" fontWeight={600}>
          Riders
        </text>
        <g transform="translate(0 124)">
          {[2, 3.5, 5].map((r, i) => (
            <circle key={r} cx={4 + i * 13} cy={-3} r={r} className="fill-none stroke-content-2" strokeWidth={1} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

/** An isotype-style chart where every 100 trips gets its own dot: 350 marks for five numbers. */
const TooManyUnits: React.FC = () => {
  const perRow = 30;
  const gap = 7.4;
  const rowH = 5.6;
  return (
    <Frame label="Each station's trips drawn as rows of tiny dots, one per hundred trips, instead of one bar">
      <Title>Weekly trips by station</Title>
      <g transform="translate(236 11)">
        <circle cx={3} cy={3.5} r={2.3} className="fill-ink-data" />
        <text x={9} y={6.5} fontSize={8} className="fill-content-2">
          = 100 trips
        </text>
      </g>
      {ARTICLE_DATA.map((d, i) => {
        const units = d.value * 10;
        const top = 38 + i * 29;
        return (
          <g key={d.label}>
            <text x={12} y={top + 9} fontSize={9} className="fill-content-2">
              {d.label}
            </text>
            {Array.from({ length: units }, (_, k) => (
              <circle key={k} cx={70 + (k % perRow) * gap} cy={top + 2 + Math.floor(k / perRow) * rowH} r={2.3} className="fill-ink-data" />
            ))}
          </g>
        );
      })}
    </Frame>
  );
};

// ---- Too high: too little help for the reader -------------------------------------------------

/** Minimal to a fault: hairline bars and type too small to read. */
const TooSmall: React.FC = () => (
  <Frame label="A bar chart with hairline bars and labels far too small to read">
    <Title size={5.5}>Weekly trips by station (thousands)</Title>
    <Grid size={4.5} />
    {ARTICLE_DATA.map((d, i) => (
      <g key={d.label}>
        <rect x={slotX(i) + SLOT / 2 - 0.75} y={yOf(d.value)} width={1.5} height={PLOT.bottom - yOf(d.value)} className="fill-ink-data" />
        <text x={slotX(i) + SLOT / 2} y={yOf(d.value) - 3} fontSize={4.5} textAnchor="middle" className="fill-content-2">
          {d.value}k
        </text>
      </g>
    ))}
    <Stations size={4.5} />
  </Frame>
);

/** Hundreds of solid points, so the dense middle is one blob. */
const Overlapping: React.FC = () => {
  const next = rand(5);
  const gauss = () => (next() + next() + next() - 1.5) / 1.5;
  return (
    <Frame label="A scatter plot of hundreds of solid points piled on top of each other">
      <Title>Trip length vs. duration</Title>
      {[0, 20, 40, 60].map((t, i) => {
        const y = PLOT.bottom - (i / 3) * PLOT_H;
        return (
          <g key={t}>
            <line x1={PLOT.left} x2={PLOT.right} y1={y + 0.5} y2={y + 0.5} className={t === 0 ? 'stroke-content/40' : 'stroke-content/10'} />
            <text x={PLOT.left - 6} y={y + 3} fontSize={9} textAnchor="end" className="fill-content-2">
              {t}
            </text>
          </g>
        );
      })}
      {Array.from({ length: 480 }, (_, i) => {
        const along = next();
        const x = PLOT.left + 14 + along * 220 + gauss() * 18;
        const y = PLOT.bottom - 14 - along * 86 + gauss() * 22;
        return <circle key={i} cx={x} cy={Math.min(PLOT.bottom - 4, Math.max(PLOT.top + 4, y))} r={4.2} className="fill-ink-data" />;
      })}
      <text x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 14} fontSize={9} textAnchor="middle" className="fill-content-2">
        Distance (km)
      </text>
      <text x={12} y={34} fontSize={8} className="fill-content-2">
        Minutes
      </text>
    </Frame>
  );
};

/** A pie of many thin slices, with labels pushed to alternate sides so their leader lines cross. */
const ClutteredLabels: React.FC = () => {
  const names = ['Harbour', 'Market St', 'Station Sq', 'Park Ave', 'Museum', 'Old Town', 'Riverside', 'Library', 'Stadium', 'Campus', 'Hospital', 'Airport', 'Pier'];
  const slices = [22, 14, 11, 9, 8, 7, 6, 6, 5, 4, 3, 3, 2];
  const total = slices.reduce((a, b) => a + b, 0);
  const cx = 160;
  const cy = 110;
  const r = 50;
  const shades = ['#104281', '#184f95', '#1c5cab', '#256abf', '#2a78d6', '#3987e5', '#5598e7', '#6da7ec', '#86b6ef'];
  let angle = -Math.PI / 2;
  return (
    <Frame label="A pie chart of thirteen thin slices with a tangle of crossing leader lines to its labels">
      <Title>Share of trips by station</Title>
      {slices.map((v, i) => {
        const a0 = angle;
        const a1 = angle + (v / total) * Math.PI * 2;
        angle = a1;
        const mid = (a0 + a1) / 2;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const path = `M${cx},${cy} L${cx + Math.cos(a0) * r},${cy + Math.sin(a0) * r} A${r},${r} 0 ${large} 1 ${cx + Math.cos(a1) * r},${cy + Math.sin(a1) * r} Z`;
        // Labels alternate sides whatever side their slice is on, so the leader lines cross.
        const side = i % 2 ? 1 : -1;
        const lx = cx + side * 92;
        const ly = 38 + i * 11.2;
        const ex = cx + Math.cos(mid) * (r - 6);
        const ey = cy + Math.sin(mid) * (r - 6);
        return (
          <g key={names[i]}>
            <path d={path} fill={shades[i % shades.length]} className="stroke-paper" strokeWidth={1} />
            <polyline points={`${ex},${ey} ${cx + side * 64},${ly} ${lx},${ly}`} fill="none" className="stroke-content-2" strokeWidth={0.6} />
            <text x={lx + side * 3} y={ly + 3} fontSize={8} textAnchor={side > 0 ? 'start' : 'end'} className="fill-content-2">
              {names[i]} {Math.round((v / total) * 100)}%
            </text>
          </g>
        );
      })}
    </Frame>
  );
};

/** Trips against a left axis and temperature against a right one, on unrelated scales. */
const DualAxes: React.FC = () => {
  const temps = [14, 22, 17, 25, 19];
  const tY = (t: number) => PLOT.bottom - ((t - 10) / 20) * PLOT_H;
  const right = PLOT.right - 20;
  return (
    <Frame label="Bars for trips read against a left axis and a line for temperature read against a different right axis">
      <Title>Trips and temperature</Title>
      <g transform="translate(176 11)" fontSize={8}>
        <rect y={0} width={7} height={7} rx={1} className="fill-ink-data" />
        <text x={10} y={6.5} className="fill-content-2">
          Trips
        </text>
        <line x1={46} x2={58} y1={3.5} y2={3.5} stroke="#eb6834" strokeWidth={2} />
        <text x={62} y={6.5} className="fill-content-2">
          Temperature
        </text>
      </g>
      <Grid right={right} />
      {ARTICLE_DATA.map((d, i) => {
        const slot = (right - PLOT.left) / ARTICLE_DATA.length;
        return <path key={d.label} d={column(PLOT.left + i * slot + slot / 4, slot / 2, d.value)} className="fill-ink-data" />;
      })}
      <polyline
        points={temps.map((t, i) => `${PLOT.left + ((right - PLOT.left) / 5) * (i + 0.5)},${tY(t)}`).join(' ')}
        fill="none"
        stroke="#eb6834"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {temps.map((t, i) => (
        <circle key={i} cx={PLOT.left + ((right - PLOT.left) / 5) * (i + 0.5)} cy={tY(t)} r={3.5} fill="#eb6834" className="stroke-paper" strokeWidth={1.5} />
      ))}
      {[10, 20, 30].map((t) => (
        <text key={t} x={right + 6} y={tY(t) + 3} fontSize={9} className="fill-content-2">
          {t}°C
        </text>
      ))}
      {ARTICLE_DATA.map((d, i) => {
        const slot = (right - PLOT.left) / ARTICLE_DATA.length;
        return (
          <text key={d.label} x={PLOT.left + i * slot + slot / 2} y={PLOT.bottom + 14} fontSize={9} textAnchor="middle" className="fill-content-2">
            {d.label}
          </text>
        );
      })}
    </Frame>
  );
};

/** Thirty stations' daily trips as thirty lines in one small plot. */
const HighDensity: React.FC = () => {
  const next = rand(11);
  const days = 28;
  const step = (PLOT.right - PLOT.left) / (days - 1);
  return (
    <Frame label="Thirty tangled lines, one per station, crammed into one small plot">
      <Title>Daily trips at 30 stations, February</Title>
      <Grid />
      {Array.from({ length: 30 }, (_, s) => {
        let v = 2 + next() * 7;
        const pts = Array.from({ length: days }, (_, i) => {
          v = Math.min(9.6, Math.max(0.6, v + (next() - 0.5) * 2.4));
          return `${(PLOT.left + i * step).toFixed(1)},${yOf(v).toFixed(1)}`;
        });
        return <polyline key={s} points={pts.join(' ')} fill="none" stroke={PALETTE[s % PALETTE.length]} strokeWidth={1} strokeLinejoin="round" opacity={0.9} />;
      })}
      {[1, 8, 15, 22].map((day) => (
        <text key={day} x={PLOT.left + (day - 1) * step} y={PLOT.bottom + 14} fontSize={9} textAnchor="middle" className="fill-content-2">
          {day} Feb
        </text>
      ))}
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
