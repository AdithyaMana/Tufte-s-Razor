import React, { useMemo, useState } from 'react';
import { readabilityChecks } from '../../ink/checks.ts';
import { applyPreset, DEFAULT_LOOK, PRESETS, resolveSpec, type Shape } from '../../ink/presets.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { Choice } from './controls.tsx';
import InkReadout from './InkReadout.tsx';
import { Lab, Warnings } from './Lab.tsx';
import { useInkStats } from './useInk.ts';

type Step = 'a' | 'b' | 'c' | 'd';

const presetShape = (id: string) => applyPreset(PRESETS.find((p) => p.id === id)!).shape;

// The article's revisions (A to C), plus one step too far.
const STEPS: { value: Step; label: string; shape: Shape; caption: string }[] = [
  {
    value: 'a',
    label: 'A · Default',
    shape: presetShape('redundancy-a'),
    caption: 'Ten gridlines and eleven axis labels, to describe three distinct values.',
  },
  {
    value: 'b',
    label: 'B · Label the bars',
    shape: presetShape('redundancy-b'),
    caption: 'Each value printed on its bar; the axis keeps only its ends. Nothing is lost.',
  },
  {
    value: 'c',
    label: 'C · Sort, mark what’s there',
    shape: presetShape('redundancy-c'),
    caption: 'Bars in order, and the axis marks only the values that occur.',
  },
  {
    value: 'd',
    label: 'D · Too far',
    shape: { ...presetShape('redundancy-a'), gridlines: false, valueLabels: 'none', dataLabels: false },
    caption: 'Every value label gone. The ratio still rises, but what do the bars measure?',
  },
];

const RELEVANT = new Set(['no-values', 'ends-only', 'triple']);

const RedundancyLab: React.FC = () => {
  const isDark = useIsDark();
  const [step, setStep] = useState<Step>('a');
  const current = STEPS.find((s) => s.value === step)!;

  const spec = useMemo(() => resolveSpec(current.shape, DEFAULT_LOOK, isDark), [current, isDark]);
  const start = useMemo(() => resolveSpec(STEPS[0].shape, DEFAULT_LOOK, isDark), [isDark]);
  const stats = useInkStats(spec);
  const startStats = useInkStats(start);
  const warnings = readabilityChecks(spec).filter((c) => RELEVANT.has(c.id));

  return (
    <Lab
      label="Removing repeated labels and lines"
      chart={<ChartCanvas spec={spec} />}
      readout={
        <InkReadout
          stats={stats}
          scale={startStats.total}
          reference={step === 'a' ? null : { label: 'the default', stats: startStats }}
        />
      }
      controls={
        <>
          <Choice label="The article’s revisions" options={STEPS} value={step} onChange={setStep} />
          <p className="font-serif italic text-lg leading-snug text-content-2">{current.caption}</p>
          <Warnings warnings={warnings} />
        </>
      }
    />
  );
};

export default RedundancyLab;
