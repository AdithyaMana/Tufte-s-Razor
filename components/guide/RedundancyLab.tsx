import React, { useMemo, useState } from 'react';
import { readabilityChecks } from '../../ink/checks.ts';
import { applyPreset, DEFAULT_LOOK, defaultShape, PRESETS, resolveSpec, type Shape } from '../../ink/presets.ts';
import type { ValueLabelMode } from '../../ink/spec.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { Segmented, Toggle } from './controls.tsx';
import InkReadout, { CompactRatio } from './InkReadout.tsx';
import { InkMapLegend, InkMapToggle, LabFrame, Warnings } from './LabFrame.tsx';
import { useInkStats } from './useInk.ts';

type Step = 'redundancy-a' | 'redundancy-b' | 'redundancy-c';

const STEPS: { value: Step; label: string; hint: string }[] = [
  { value: 'redundancy-a', label: 'A · Defaults', hint: 'Eleven gridlines and eleven axis labels for three distinct values' },
  { value: 'redundancy-b', label: 'B · Label the bars', hint: 'Drop the gridlines and most axis labels; print the values on the bars' },
  { value: 'redundancy-c', label: 'C · Sort, label what’s there', hint: 'Sort the bars and label only the values that occur' },
];

const stepShapes = Object.fromEntries(
  STEPS.map((s) => [s.value, applyPreset(PRESETS.find((p) => p.id === s.value)!).shape]),
) as Record<Step, Shape>;

const VALUE_LABELS: { value: ValueLabelMode; label: string; hint: string }[] = [
  { value: 'all', label: 'Every tick', hint: '0, 1, 2 … 10' },
  { value: 'ends', label: 'Ends', hint: '0 and 10 only' },
  { value: 'data', label: 'Data values', hint: '0, 10 and each value that occurs' },
  { value: 'none', label: 'None', hint: 'No axis labels' },
];

const RELEVANT = new Set(['no-values', 'ends-only', 'triple', 'no-categories']);

function sameShape(a: Shape, b: Shape) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const RedundancyLab: React.FC = () => {
  const isDark = useIsDark();
  const [shape, setShape] = useState<Shape>(stepShapes['redundancy-a']);
  const [inkMap, setInkMap] = useState(false);

  const spec = useMemo(() => resolveSpec(shape, DEFAULT_LOOK, isDark), [shape, isDark]);
  const baseline = useMemo(() => resolveSpec(defaultShape(), DEFAULT_LOOK, isDark), [isDark]);
  const stats = useInkStats(spec);
  const reference = useInkStats(baseline);

  const step = STEPS.find((s) => sameShape(stepShapes[s.value], shape))?.value ?? null;
  const set = (patch: Partial<Shape>) => setShape((current) => ({ ...current, ...patch }));
  const warnings = readabilityChecks(spec).filter((c) => RELEVANT.has(c.id));

  return (
    <LabFrame label="Interactive · Redundant ink">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-8 lg:gap-10">
        <div className="min-w-0">
          <ChartCanvas spec={spec} inkMap={inkMap} />
          {inkMap && <InkMapLegend className="mt-3" />}
          <CompactRatio stats={stats} className="mt-3" />

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <Segmented label="The article's revisions" options={STEPS} value={step} onChange={(value) => setShape(stepShapes[value])} size="sm" />
            <InkMapToggle checked={inkMap} onChange={setInkMap} />
          </div>

          <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <Segmented
                label="Value-axis labels"
                options={VALUE_LABELS}
                value={shape.valueLabels}
                onChange={(valueLabels) => set({ valueLabels })}
                size="sm"
              />
            </div>
            <div className="-my-1.5">
              <Toggle label="Data labels on the bars" checked={shape.dataLabels} onChange={(dataLabels) => set({ dataLabels })} />
              <Toggle label="Gridlines" checked={shape.gridlines} onChange={(gridlines) => set({ gridlines })} />
              <Toggle label="Sort by value" checked={shape.sorted} onChange={(sorted) => set({ sorted })} />
              <Toggle label="Value-axis line" checked={shape.valueAxisLine} onChange={(valueAxisLine) => set({ valueAxisLine })} />
              <Toggle label="Tick marks" checked={shape.tickMarks} onChange={(tickMarks) => set({ tickMarks })} />
              <Toggle label="Chart border" checked={shape.chartBorder} onChange={(chartBorder) => set({ chartBorder })} />
            </div>
          </div>

          <Warnings warnings={warnings} className="mt-5" />
        </div>

        <InkReadout stats={stats} reference={step === 'redundancy-a' ? null : { label: 'the default chart', stats: reference }} />
      </div>
    </LabFrame>
  );
};

export default RedundancyLab;
