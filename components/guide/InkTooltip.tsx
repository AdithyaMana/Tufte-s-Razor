import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PARTS } from '../../content/parts.ts';
import { PART_GROUPS, type InkPart } from '../../ink/inspect.ts';
import { measureChart, measureGroups } from '../../ink/measure.ts';
import { GROUP_KIND, type InkKind } from '../../ink/render.ts';
import type { ChartSpec } from '../../ink/spec.ts';
import { pct1, px } from './format.ts';
import { INK_KINDS } from './InkReadout.tsx';

interface Row {
  kind: InkKind;
  label: string;
  pixels: number;
}

function rowsFor(part: InkPart, spec: ChartSpec): Row[] {
  const groups = measureGroups(spec);
  const kindLabel = (kind: InkKind) => INK_KINDS.find((k) => k.key === kind)!.label;
  switch (part) {
    case 'paper':
      return [];
    case 'bars':
      return [
        { kind: 'data', label: 'Data-ink: a thin line down each bar', pixels: groups.hairlines },
        {
          kind: 'redundant',
          label: spec.barOutline ? 'Repeated: the rest of each bar, and its outline' : 'Repeated: the rest of each bar',
          pixels: groups.barWidth + groups.outlines,
        },
      ];
    default:
      return PART_GROUPS[part].map((group) => {
        const kind = GROUP_KIND[group];
        return { kind, label: kindLabel(kind), pixels: groups[group] };
      });
  }
}

interface InkTooltipProps {
  id: string;
  part: InkPart;
  spec: ChartSpec;
  /** Where the reader pointed, in px from the chart's top left. */
  x: number;
  y: number;
  /** The chart's size on screen. */
  width: number;
  height: number;
}

const SWATCH: Record<InkKind, string> = { data: 'bg-ink-data', redundant: 'bg-ink-redundant', nonData: 'bg-ink-nondata' };

/** What the reader is pointing at: its name, its kind of ink and how much of it there is. */
const InkTooltip: React.FC<InkTooltipProps> = ({ id, part, spec, x, y, width, height }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const key = JSON.stringify(spec);
  const rows = useMemo(() => rowsFor(part, spec), [part, key]);
  const total = useMemo(() => measureChart(spec).total, [key]);
  const { name, why } = PARTS[part];

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setSize({ w: el.offsetWidth, h: el.offsetHeight });
  }, [part, rows]);

  // Above the pointer when there is room, otherwise below it; never past the chart's sides.
  const gap = 14;
  const left = Math.min(Math.max(x - size.w / 2, 0), Math.max(width - size.w, 0));
  const above = y - size.h - gap;
  const top = above >= 0 ? above : Math.min(y + gap, Math.max(height - size.h, 0));

  return (
    <div
      ref={ref}
      id={id}
      role="status"
      className="pointer-events-none absolute z-20 w-max max-w-[min(17rem,100%)] rounded-md bg-paper/95 backdrop-blur-sm px-3 py-2 font-sans shadow-[0_2px_14px_rgb(0_0_0/0.10)] ring-1 ring-line"
      style={{ left, top, visibility: size.w ? 'visible' : 'hidden' }}
    >
      <p className="text-[0.8125rem] font-semibold text-content">{name}</p>
      {rows.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {rows.map((row) => (
            <li key={row.kind} className="flex items-baseline gap-1.5 text-xs leading-snug text-content-2">
              <span className={`w-2 h-2 shrink-0 translate-y-[1px] ${SWATCH[row.kind]}`} aria-hidden="true" />
              <span>
                {row.label} · <span className="tabular-nums">{px(row.pixels)}</span>
                <span className="tabular-nums text-chrome"> ({pct1(total ? row.pixels / total : 0)} of the ink)</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1 text-xs leading-snug text-content-2">{why}</p>
    </div>
  );
};

export default InkTooltip;
