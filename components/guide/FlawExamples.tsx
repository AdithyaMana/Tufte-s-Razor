import React from 'react';

// A small drawing of each design flaw, so readers can recognise it rather than just read its name.
// Drawn on a 160 × 100 grid in the page's own colours, so they suit both themes.

const W = 160;
const H = 100;
const BASE = 88;
const VALUES = [70, 55, 40, 55, 55];
const barX = (i: number) => 16 + i * 28;

const Frame: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={label}>
    {children}
  </svg>
);

const Baseline = () => <line x1={10} x2={150} y1={BASE + 0.5} y2={BASE + 0.5} className="stroke-content-2" strokeWidth={1} />;

const EXAMPLES: Record<string, React.FC> = {
  'Stylized effects on data marks': () => (
    <Frame label="Bars drawn as shaded 3D blocks with drop shadows">
      <defs>
        <linearGradient id="flaw-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#9ec0f0" />
          <stop offset="0.5" stopColor="#4472c4" />
          <stop offset="1" stopColor="#1f3b70" />
        </linearGradient>
      </defs>
      {VALUES.map((v, i) => (
        <g key={i}>
          <rect x={barX(i) + 5} y={BASE - v + 5} width={18} height={v} className="fill-content/20" />
          <polygon points={`${barX(i)},${BASE - v} ${barX(i) + 6},${BASE - v - 6} ${barX(i) + 24},${BASE - v - 6} ${barX(i) + 18},${BASE - v}`} fill="#9ec0f0" />
          <polygon points={`${barX(i) + 18},${BASE - v} ${barX(i) + 24},${BASE - v - 6} ${barX(i) + 24},${BASE - 6} ${barX(i) + 18},${BASE}`} fill="#1f3b70" />
          <rect x={barX(i)} y={BASE - v} width={18} height={v} fill="url(#flaw-grad)" />
        </g>
      ))}
      <Baseline />
    </Frame>
  ),
  'Embellishment obscuring data': () => (
    <Frame label="A bar chart half hidden behind a big decorative picture">
      {VALUES.map((v, i) => (
        <rect key={i} x={barX(i)} y={BASE - v} width={18} height={v} className="fill-ink-data" />
      ))}
      <Baseline />
      <circle cx={92} cy={48} r={34} className="fill-warn" opacity={0.9} />
      <circle cx={82} cy={40} r={4} className="fill-paper" />
      <circle cx={102} cy={40} r={4} className="fill-paper" />
      <path d="M78 58 Q92 70 106 58" className="stroke-paper" strokeWidth={3} fill="none" strokeLinecap="round" />
    </Frame>
  ),
  'Several channels for one variable': () => (
    <Frame label="Each bar's value shown by its height, its width and its colour at once">
      {VALUES.map((v, i) => {
        const w = 8 + v / 5;
        const shade = ['#1f3b70', '#2f5597', '#6da7ec', '#2f5597', '#2f5597'][i];
        return <rect key={i} x={barX(i) + 11 - w / 2} y={BASE - v} width={w} height={v} fill={shade} />;
      })}
      <Baseline />
    </Frame>
  ),
  'Meaningless or confusing encoding': () => (
    <Frame label="Bars in random colours and patterns that stand for nothing">
      <defs>
        <pattern id="flaw-stripes" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2" height="4" fill="#eb6834" />
        </pattern>
      </defs>
      {VALUES.map((v, i) => (
        <rect key={i} x={barX(i)} y={BASE - v} width={18} height={v} fill={['#eb6834', 'url(#flaw-stripes)', '#6da7ec', '#b45309', '#184f95'][i]} />
      ))}
      <Baseline />
    </Frame>
  ),
  'Overused visual channels': () => (
    <Frame label="Points that vary in colour, size and shape all at once">
      {[
        [30, 30, 7, '#eb6834', 'c'],
        [55, 60, 4, '#184f95', 's'],
        [80, 40, 10, '#6da7ec', 't'],
        [105, 70, 5, '#b45309', 'c'],
        [130, 25, 8, '#2f5597', 's'],
        [45, 75, 6, '#6da7ec', 't'],
        [115, 50, 3, '#eb6834', 's'],
      ].map(([x, y, r, c, shape], i) =>
        shape === 'c' ? (
          <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={c as string} />
        ) : shape === 's' ? (
          <rect key={i} x={(x as number) - (r as number)} y={(y as number) - (r as number)} width={(r as number) * 2} height={(r as number) * 2} fill={c as string} />
        ) : (
          <polygon key={i} points={`${x},${(y as number) - (r as number)} ${(x as number) + (r as number)},${(y as number) + (r as number)} ${(x as number) - (r as number)},${(y as number) + (r as number)}`} fill={c as string} />
        ),
      )}
      <Baseline />
    </Frame>
  ),
  'Too many units': () => (
    <Frame label="Each value drawn as a stack of dozens of tiny icons">
      {VALUES.map((v, i) =>
        Array.from({ length: Math.round(v / 7) }, (_, j) =>
          [0, 1].map((k) => <circle key={`${i}-${j}-${k}`} cx={barX(i) + 5 + k * 8} cy={BASE - 4 - j * 7} r={2.6} className="fill-ink-data" />),
        ),
      )}
      <Baseline />
    </Frame>
  ),
  'Text or marks too small': () => (
    <Frame label="A chart whose labels are too small to read">
      {VALUES.map((v, i) => (
        <g key={i}>
          <rect x={barX(i) + 7} y={BASE - v} width={4} height={v} className="fill-ink-data" />
          <text x={barX(i) + 9} y={BASE + 6} textAnchor="middle" className="fill-content-2" fontSize={3.2}>
            Category {i + 1}
          </text>
          <text x={barX(i) + 9} y={BASE - v - 2} textAnchor="middle" className="fill-content-2" fontSize={3}>
            {v / 10}
          </text>
        </g>
      ))}
      <Baseline />
    </Frame>
  ),
  'Overlapping data marks': () => (
    <Frame label="Hundreds of scatter-plot dots piled on top of each other">
      {Array.from({ length: 220 }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const r = 3 + Math.sqrt(i) * 2.4;
        return <circle key={i} cx={80 + Math.cos(a) * r * 1.6} cy={48 + Math.sin(a) * r * 0.8} r={3.4} className="fill-ink-data" opacity={0.55} />;
      })}
    </Frame>
  ),
  'Cluttered label lines': () => (
    <Frame label="A pie of thin slices with a tangle of leader lines to its labels">
      {[0, 20, 55, 95, 140, 200, 260, 300, 330].map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const x1 = 80 + Math.cos(a) * 30;
        const y1 = 50 + Math.sin(a) * 30;
        const x2 = i % 2 ? 150 : 10;
        const y2 = 8 + i * 10;
        return (
          <g key={i}>
            <line x1={80} y1={50} x2={x1} y2={y1} className="stroke-paper" strokeWidth={1} />
            <polyline points={`${x1},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`} fill="none" className="stroke-content-2" strokeWidth={0.7} />
          </g>
        );
      })}
      <circle cx={80} cy={50} r={30} className="fill-ink-redundant" opacity={0.85} />
    </Frame>
  ),
  'Dual axes': () => (
    <Frame label="Bars read against a left axis and a line read against a different right axis">
      {VALUES.map((v, i) => (
        <rect key={i} x={barX(i) + 2} y={BASE - v} width={14} height={v} className="fill-ink-redundant" />
      ))}
      <polyline points="25,70 53,30 81,55 109,20 137,45" fill="none" className="stroke-warn" strokeWidth={2} />
      <line x1={10.5} x2={10.5} y1={10} y2={BASE} className="stroke-ink-redundant" strokeWidth={1.5} />
      <line x1={149.5} x2={149.5} y1={10} y2={BASE} className="stroke-warn" strokeWidth={1.5} />
      {[0, 1, 2, 3].map((k) => (
        <g key={k}>
          <text x={7} y={BASE - k * 25 + 2} textAnchor="end" fontSize={6} className="fill-content-2">
            {k * 10}
          </text>
          <text x={153} y={BASE - k * 25 + 2} fontSize={6} className="fill-content-2">
            {k * 250}
          </text>
        </g>
      ))}
      <Baseline />
    </Frame>
  ),
  'Very high information density': () => (
    <Frame label="Dozens of tangled lines crammed into one small plot">
      {Array.from({ length: 24 }, (_, s) => (
        <polyline
          key={s}
          points={Array.from({ length: 12 }, (_, i) => `${10 + i * 12.7},${50 + Math.sin(i * 0.9 + s) * (10 + (s % 7) * 4) + ((s * 13) % 17) - 8}`).join(' ')}
          fill="none"
          stroke={['#184f95', '#6da7ec', '#eb6834', '#b45309'][s % 4]}
          strokeWidth={0.9}
          opacity={0.8}
        />
      ))}
    </Frame>
  ),
};

export function FlawExample({ name }: { name: string }) {
  const Example = EXAMPLES[name];
  return Example ? <Example /> : null;
}
