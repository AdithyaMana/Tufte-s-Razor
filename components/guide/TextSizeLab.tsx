import React, { useMemo, useState } from 'react';
import { readabilityChecks } from '../../ink/checks.ts';
import { applyPreset, DEFAULT_LOOK, PRESETS, resolveSpec } from '../../ink/presets.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { Segmented, Slider } from './controls.tsx';
import InkReadout, { CompactRatio } from './InkReadout.tsx';
import { InkMapLegend, InkMapToggle, LabFrame, Warnings } from './LabFrame.tsx';
import { useInkStats } from './useInk.ts';

type Size = 'default' | 'text-b1' | 'text-b2' | 'text-c1' | 'text-c2';

// The article's text-size figures: A (defaults), B1/B2 (larger), C1/C2 (smaller).
const SIZES: { value: Size; label: string; title: number; labels: number; hint: string }[] = [
  { value: 'default', label: 'Default', title: 18, labels: 11, hint: 'Example A: default text sizes' },
  { value: 'text-b1', label: 'Bigger title', title: 30, labels: 11, hint: 'Example B1' },
  { value: 'text-b2', label: 'Bigger labels', title: 18, labels: 20, hint: 'Example B2' },
  { value: 'text-c1', label: 'Smaller title', title: 9, labels: 11, hint: 'Example C1' },
  { value: 'text-c2', label: 'Smaller labels', title: 18, labels: 6, hint: 'Example C2' },
];

const RELEVANT = new Set(['small-labels', 'big-labels', 'hierarchy', 'big-title']);
const baseShape = applyPreset(PRESETS.find((p) => p.id === 'text-b1')!).shape;

const TextSizeLab: React.FC = () => {
  const isDark = useIsDark();
  const [titleSize, setTitleSize] = useState(18);
  const [labelSize, setLabelSize] = useState(11);
  const [inkMap, setInkMap] = useState(false);

  const spec = useMemo(() => resolveSpec({ ...baseShape, titleSize, labelSize }, DEFAULT_LOOK, isDark), [titleSize, labelSize, isDark]);
  const reference = useMemo(() => resolveSpec({ ...baseShape, titleSize: 18, labelSize: 11 }, DEFAULT_LOOK, isDark), [isDark]);
  const stats = useInkStats(spec);
  const referenceStats = useInkStats(reference);

  const size = SIZES.find((s) => s.title === titleSize && s.labels === labelSize)?.value ?? null;
  const warnings = readabilityChecks(spec).filter((c) => RELEVANT.has(c.id));

  return (
    <LabFrame label="Interactive · Text size">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-8 lg:gap-10">
        <div className="min-w-0">
          <ChartCanvas spec={spec} inkMap={inkMap} />
          {inkMap && <InkMapLegend className="mt-3" />}
          <CompactRatio stats={stats} className="mt-3" />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Slider label="Title size" value={titleSize} min={8} max={40} onChange={setTitleSize} format={(v) => `${v} px`} />
            <Slider label="Label size" value={labelSize} min={5} max={24} onChange={setLabelSize} format={(v) => `${v} px`} />
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <Segmented
              label="The article's examples"
              options={SIZES}
              value={size}
              onChange={(value) => {
                const next = SIZES.find((s) => s.value === value)!;
                setTitleSize(next.title);
                setLabelSize(next.labels);
              }}
              size="sm"
            />
            <InkMapToggle checked={inkMap} onChange={setInkMap} />
          </div>

          <Warnings warnings={warnings} className="mt-5" />
        </div>

        <InkReadout stats={stats} reference={size === 'default' ? null : { label: 'the default sizes', stats: referenceStats }} />
      </div>
    </LabFrame>
  );
};

export default TextSizeLab;
