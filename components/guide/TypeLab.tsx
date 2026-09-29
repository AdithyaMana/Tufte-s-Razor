import React, { useMemo, useState } from 'react';
import { readabilityChecks } from '../../ink/checks.ts';
import { applyPreset, DEFAULT_LOOK, PRESETS, resolveSpec } from '../../ink/presets.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { Choice, Slider } from './controls.tsx';
import InkReadout from './InkReadout.tsx';
import { AllClear, Lab, Warnings } from './Lab.tsx';
import { useInkStats } from './useInk.ts';

// The article's text-size figures: sorted bars in a box, no gridlines.
const baseShape = applyPreset(PRESETS.find((p) => p.id === 'text-b1')!).shape;
const TITLE = 18;
const LABEL = 11;

type Size = 'smaller' | 'default' | 'bigger';

const SIZES: { value: Size; label: string; scale: number }[] = [
  { value: 'smaller', label: 'Smaller', scale: 0.55 },
  { value: 'default', label: 'Default', scale: 1 },
  { value: 'bigger', label: 'Bigger', scale: 1.8 },
];

const RELEVANT = new Set(['small-labels', 'big-labels', 'big-title']);

const sized = (scale: number) => ({ ...baseShape, titleSize: Math.round(TITLE * scale), labelSize: Math.round(LABEL * scale) });

const TypeLab: React.FC = () => {
  const isDark = useIsDark();
  const [scale, setScale] = useState(1);

  const spec = useMemo(() => resolveSpec(sized(scale), DEFAULT_LOOK, isDark), [scale, isDark]);
  const reference = useMemo(() => resolveSpec(sized(1), DEFAULT_LOOK, isDark), [isDark]);
  const biggest = useMemo(() => resolveSpec(sized(2), DEFAULT_LOOK, isDark), [isDark]);
  const stats = useInkStats(spec);
  const referenceStats = useInkStats(reference);
  const biggestStats = useInkStats(biggest);

  const size = SIZES.find((s) => Math.abs(s.scale - scale) < 0.001)?.value ?? null;
  const warnings = readabilityChecks(spec).filter((c) => RELEVANT.has(c.id));

  return (
    <Lab
      label="Text size and the data-ink ratio"
      chart={<ChartCanvas spec={spec} />}
      readout={
        <InkReadout
          stats={stats}
          scale={biggestStats.total}
          reference={size === 'default' ? null : { label: 'the default size', stats: referenceStats }}
        />
      }
      controls={
        <>
          <Slider
            label="Text size"
            value={Math.round(scale * 100)}
            min={50}
            max={200}
            step={5}
            onChange={(v) => setScale(v / 100)}
            format={(v) => `${Math.round((LABEL * v) / 100)} px labels`}
          />
          <Choice
            label="The article’s examples"
            options={SIZES}
            value={size}
            onChange={(value) => setScale(SIZES.find((s) => s.value === value)!.scale)}
          />
          {warnings.length ? <Warnings warnings={warnings} /> : <AllClear>Readable, and quiet enough to let the bars speak.</AllClear>}
        </>
      }
    />
  );
};

export default TypeLab;
