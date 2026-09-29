import React, { useMemo, useState } from 'react';
import { Pin, PinOff, RotateCcw } from 'lucide-react';
import { readabilityChecks } from '../../ink/checks.ts';
import type { InkStats } from '../../ink/measure.ts';
import {
  applyPreset,
  PRESETS,
  resolveSpec,
  type BackgroundChoice,
  type BarChoice,
  type FillChoice,
  type Look,
  type Shape,
} from '../../ink/presets.ts';
import type { ValueLabelMode } from '../../ink/spec.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { QuietButton, Segmented, Slider, Toggle } from './controls.tsx';
import { pct } from './format.ts';
import InkReadout, { CompactRatio } from './InkReadout.tsx';
import { InkMapLegend, InkMapToggle, LabFrame, Warnings } from './LabFrame.tsx';
import { useInkStats } from './useInk.ts';

const BACKGROUNDS: { value: BackgroundChoice; label: string }[] = [
  { value: 'theme', label: 'Page' },
  { value: 'white', label: 'White' },
  { value: 'pale', label: 'Pale blue' },
  { value: 'dark', label: 'Dark blue' },
];

const FILLS: { value: FillChoice; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'white', label: 'White' },
  { value: 'pale', label: 'Pale blue' },
  { value: 'dark', label: 'Dark blue' },
];

const BARS: { value: BarChoice; label: string }[] = [
  { value: 'theme', label: 'Default' },
  { value: 'blue', label: 'Blue' },
  { value: 'pale', label: 'Pale blue' },
  { value: 'white', label: 'White' },
];

const VALUE_LABELS: { value: ValueLabelMode; label: string }[] = [
  { value: 'all', label: 'Every tick' },
  { value: 'ends', label: 'Ends' },
  { value: 'data', label: 'Data values' },
  { value: 'none', label: 'None' },
];

const GROUPS = [...new Set(PRESETS.map((p) => p.group))];

interface Reference {
  label: string;
  stats: InkStats;
}

const ControlGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <fieldset className="min-w-0">
    <legend className="kicker mb-3">{title}</legend>
    <div className="space-y-4">{children}</div>
  </fieldset>
);

const Playground: React.FC = () => {
  const isDark = useIsDark();
  const initial = applyPreset(PRESETS[0]);
  const [shape, setShape] = useState<Shape>(initial.shape);
  const [look, setLook] = useState<Look>(initial.look);
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [reference, setReference] = useState<Reference | null>(null);
  const [inkMap, setInkMap] = useState(false);

  const spec = useMemo(() => resolveSpec(shape, look, isDark), [shape, look, isDark]);
  const stats = useInkStats(spec);
  const warnings = readabilityChecks(spec);

  const setShapeField = (patch: Partial<Shape>) => {
    setShape((s) => ({ ...s, ...patch }));
    setPresetId('');
  };
  const setLookField = (patch: Partial<Look>) => {
    setLook((l) => ({ ...l, ...patch }));
    setPresetId('');
  };
  const loadPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const next = applyPreset(preset);
    setShape(next.shape);
    setLook(next.look);
    setPresetId(id);
  };
  const presetLabel = PRESETS.find((p) => p.id === presetId)?.label;

  return (
    <LabFrame label="Playground · Every control in one place">
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <label className="font-sans min-w-0">
          <span className="block text-[0.8125rem] font-medium text-ink mb-1.5">Start from</span>
          <select
            value={presetId}
            onChange={(e) => loadPreset(e.target.value)}
            className="max-w-full rounded-md border border-rule bg-card px-3 py-1.5 text-[0.8125rem] text-ink focus-visible:outline-2"
          >
            {presetId === '' && <option value="">Your own design</option>}
            {GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {PRESETS.filter((p) => p.group === group).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <QuietButton onClick={() => setReference({ label: presetLabel ? `“${presetLabel}”` : 'your pinned chart', stats })}>
          <Pin size={14} aria-hidden="true" /> Pin as reference
        </QuietButton>
        {reference && (
          <QuietButton onClick={() => setReference(null)}>
            <PinOff size={14} aria-hidden="true" /> Unpin
          </QuietButton>
        )}
        <QuietButton onClick={() => loadPreset(PRESETS[0].id)}>
          <RotateCcw size={14} aria-hidden="true" /> Reset
        </QuietButton>
        <div className="ml-auto">
          <InkMapToggle checked={inkMap} onChange={setInkMap} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-8 lg:gap-10">
        <div className="min-w-0">
          <ChartCanvas spec={spec} inkMap={inkMap} />
          {inkMap && <InkMapLegend className="mt-3" />}
          <CompactRatio stats={stats} className="mt-3" />
          <Warnings warnings={warnings} className="mt-5" />
        </div>
        <div>
          <InkReadout stats={stats} reference={reference} />
          {reference && (
            <p className="mt-4 font-sans text-xs text-muted">
              Reference: {reference.label} at {pct(reference.stats.ratio)}. The article calls this the <em>relative</em> value — the
              difference against a version you chose, rather than a grade on its own.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-rule grid gap-x-12 gap-y-10 md:grid-cols-2">
        <ControlGroup title="Bars">
          <Slider
            label="Width"
            value={Math.round(shape.barWidth * 100)}
            min={0}
            max={100}
            onChange={(v) => setShapeField({ barWidth: v / 100 })}
            format={(v) => (v === 0 ? 'hairline' : `${v}% of slot`)}
          />
          <Segmented label="Colour" options={BARS} value={look.bars} onChange={(bars) => setLookField({ bars })} size="sm" />
          <div className="-my-1.5">
            <Toggle label="Outline" checked={look.outline} onChange={(outline) => setLookField({ outline })} />
            <Toggle label="Sort by value" checked={shape.sorted} onChange={(sorted) => setShapeField({ sorted })} />
          </div>
        </ControlGroup>

        <ControlGroup title="Background">
          <Segmented label="Chart background (the paper)" options={BACKGROUNDS} value={look.background} onChange={(background) => setLookField({ background })} size="sm" />
          <Segmented label="Plot-area fill (paint)" options={FILLS} value={look.plotFill} onChange={(plotFill) => setLookField({ plotFill })} size="sm" />
        </ControlGroup>

        <ControlGroup title="Lines">
          <div className="-my-1.5">
            <Toggle label="Gridlines" checked={shape.gridlines} onChange={(gridlines) => setShapeField({ gridlines })} />
            <Toggle label="Chart border" checked={shape.chartBorder} onChange={(chartBorder) => setShapeField({ chartBorder })} />
            <Toggle label="Box around the plot" checked={shape.plotBorder} onChange={(plotBorder) => setShapeField({ plotBorder })} />
            <Toggle label="Baseline" checked={shape.baseline} onChange={(baseline) => setShapeField({ baseline })} />
            <Toggle label="Value-axis line" checked={shape.valueAxisLine} onChange={(valueAxisLine) => setShapeField({ valueAxisLine })} />
            <Toggle label="Tick marks" checked={shape.tickMarks} onChange={(tickMarks) => setShapeField({ tickMarks })} />
          </div>
        </ControlGroup>

        <ControlGroup title="Text">
          <Segmented label="Value-axis labels" options={VALUE_LABELS} value={shape.valueLabels} onChange={(valueLabels) => setShapeField({ valueLabels })} size="sm" />
          <div className="-my-1.5">
            <Toggle label="Title" checked={shape.title !== null} onChange={(on) => setShapeField({ title: on ? 'Chart Title' : null })} />
            <Toggle label="Category labels" checked={shape.categoryLabels} onChange={(categoryLabels) => setShapeField({ categoryLabels })} />
            <Toggle label="Data labels on the bars" checked={shape.dataLabels} onChange={(dataLabels) => setShapeField({ dataLabels })} />
          </div>
          <Slider label="Title size" value={shape.titleSize} min={8} max={40} onChange={(titleSize) => setShapeField({ titleSize })} format={(v) => `${v} px`} />
          <Slider label="Label size" value={shape.labelSize} min={5} max={24} onChange={(labelSize) => setShapeField({ labelSize })} format={(v) => `${v} px`} />
        </ControlGroup>
      </div>
    </LabFrame>
  );
};

export default Playground;
