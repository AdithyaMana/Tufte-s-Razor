import React, { useMemo, useState } from 'react';
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
import { Check, Choice, Slider, TextButton } from './controls.tsx';
import InkReadout from './InkReadout.tsx';
import { Lab, Warnings } from './Lab.tsx';
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
  { value: 'pale', label: 'Pale' },
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

/** Ink scale for the playground's ink bar: roomy enough for the most cluttered preset. */
const PLAYGROUND_SCALE = 180_000;

interface Reference {
  label: string;
  stats: InkStats;
}

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <fieldset className="min-w-0">
    <legend className="kicker mb-3">{title}</legend>
    <div className="space-y-3">{children}</div>
  </fieldset>
);

const Playground: React.FC = () => {
  const isDark = useIsDark();
  const initial = applyPreset(PRESETS[0]);
  const [shape, setShape] = useState<Shape>(initial.shape);
  const [look, setLook] = useState<Look>(initial.look);
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [reference, setReference] = useState<Reference | null>(null);

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
    <>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 font-sans text-[0.8125rem]">
        <label className="flex items-baseline gap-2 text-chrome min-w-0">
          <span className="font-medium">Start from</span>
          <select
            value={presetId}
            onChange={(e) => loadPreset(e.target.value)}
            className="min-w-0 max-w-[16rem] bg-transparent border-b border-line-2 py-0.5 pr-1 text-content rounded-none"
          >
            {presetId === '' && <option value="">your own design</option>}
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
        <TextButton onClick={() => setReference({ label: presetLabel ? `“${presetLabel}”` : 'your pinned chart', stats })}>
          {reference ? 'Pin this instead' : 'Pin as reference'}
        </TextButton>
        {reference && <TextButton onClick={() => setReference(null)}>Unpin</TextButton>}
        <TextButton onClick={() => loadPreset(PRESETS[0].id)}>Reset</TextButton>
      </div>

      <Lab
        label="Playground"
        chart={
          <>
            <ChartCanvas spec={spec} />
            <Warnings warnings={warnings} className="mt-4" />
          </>
        }
        readout={
          <>
            <InkReadout stats={stats} scale={PLAYGROUND_SCALE} reference={reference} />
            {reference && (
              <p className="mt-4 font-sans text-xs leading-relaxed text-content-2 max-w-[17rem]">
                Compared with {reference.label}. The article calls this the relative value: a comparison between versions,
                not a grade.
              </p>
            )}
          </>
        }
        controls={
          <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2 pt-2">
            <Group title="Bars">
              <Slider
                label="Width"
                value={Math.round(shape.barWidth * 100)}
                min={0}
                max={100}
                onChange={(v) => setShapeField({ barWidth: v / 100 })}
                format={(v) => (v === 0 ? 'hairline' : `${v}%`)}
              />
              <Choice label="Colour" options={BARS} value={look.bars} onChange={(bars) => setLookField({ bars })} />
              <div>
                <Check label="Outline" checked={look.outline} onChange={(outline) => setLookField({ outline })} />
                <Check label="Sort by value" checked={shape.sorted} onChange={(sorted) => setShapeField({ sorted })} />
              </div>
            </Group>

            <Group title="Background">
              <Choice label="Paper" options={BACKGROUNDS} value={look.background} onChange={(background) => setLookField({ background })} />
              <Choice label="Plot fill" options={FILLS} value={look.plotFill} onChange={(plotFill) => setLookField({ plotFill })} />
            </Group>

            <Group title="Lines">
              <div>
                <Check label="Gridlines" checked={shape.gridlines} onChange={(gridlines) => setShapeField({ gridlines })} />
                <Check label="Chart border" checked={shape.chartBorder} onChange={(chartBorder) => setShapeField({ chartBorder })} />
                <Check label="Box around the plot" checked={shape.plotBorder} onChange={(plotBorder) => setShapeField({ plotBorder })} />
                <Check label="Baseline" checked={shape.baseline} onChange={(baseline) => setShapeField({ baseline })} />
                <Check label="Value-axis line" checked={shape.valueAxisLine} onChange={(valueAxisLine) => setShapeField({ valueAxisLine })} />
                <Check label="Tick marks" checked={shape.tickMarks} onChange={(tickMarks) => setShapeField({ tickMarks })} />
              </div>
            </Group>

            <Group title="Text">
              <Choice
                label="Axis labels"
                options={VALUE_LABELS}
                value={shape.valueLabels}
                onChange={(valueLabels) => setShapeField({ valueLabels })}
              />
              <div>
                <Check label="Title" checked={shape.title !== null} onChange={(on) => setShapeField({ title: on ? 'Chart Title' : null })} />
                <Check label="Category labels" checked={shape.categoryLabels} onChange={(categoryLabels) => setShapeField({ categoryLabels })} />
                <Check label="Values on the bars" checked={shape.dataLabels} onChange={(dataLabels) => setShapeField({ dataLabels })} />
              </div>
              <Slider label="Title size" value={shape.titleSize} min={8} max={40} onChange={(titleSize) => setShapeField({ titleSize })} format={(v) => `${v} px`} />
              <Slider label="Label size" value={shape.labelSize} min={5} max={24} onChange={(labelSize) => setShapeField({ labelSize })} format={(v) => `${v} px`} />
            </Group>
          </div>
        }
      />
    </>
  );
};

export default Playground;
