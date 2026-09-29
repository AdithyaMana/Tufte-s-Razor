import React, { useMemo, useState } from 'react';
import { RAZOR_STEPS, razorSpec } from '../../ink/razor.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { Slider, TextButton } from './controls.tsx';
import { pct } from './format.ts';
import InkReadout from './InkReadout.tsx';
import { Lab } from './Lab.tsx';
import { useInkStats } from './useInk.ts';

const LAST = RAZOR_STEPS.length - 1;

/** The whole idea in one control: erase a cluttered chart a step at a time. */
const RazorHero: React.FC = () => {
  const isDark = useIsDark();
  const [step, setStep] = useState(0);
  const specs = useMemo(() => RAZOR_STEPS.map((_, i) => razorSpec(i, isDark)), [isDark]);
  const stats = useInkStats(specs[step]);
  const start = useInkStats(specs[0]);
  const current = RAZOR_STEPS[step];

  return (
    <header className="max-w-6xl mx-auto px-4 md:px-8 pt-12 md:pt-20">
      <p className="kicker">An interactive guide to the data-ink ratio</p>
      <h1 className="mt-4 max-w-4xl font-serif text-[2.75rem] sm:text-6xl lg:text-[4.5rem] leading-[1.02] tracking-tight text-content text-balance">
        How much of a chart is data?
      </h1>
      <p className="article mt-5 max-w-2xl text-content-2">
        Edward Tufte’s <em>data-ink ratio</em> is the share of a chart’s ink that shows the data. Drag the razor to erase the
        rest — and notice where to stop.
      </p>

      <Lab
        label="The razor"
        chart={<ChartCanvas spec={specs[step]} />}
        readout={
          <>
            <InkReadout stats={stats} scale={start.total} />
            <p className="mt-4 font-sans text-xs leading-relaxed text-content-2 max-w-[17rem]">
              The bar is all of the chart’s ink, to scale. The dark sliver is the data-ink; the razor erases the rest.
            </p>
          </>
        }
        controls={
          <>
            <Slider
              label="The razor"
              value={step}
              min={0}
              max={LAST}
              onChange={setStep}
              format={(v) => (v === 0 ? 'Drag to erase' : `Cut ${v} of ${LAST}`)}
              valueText={`Cut ${step} of ${LAST}: ${current.label}. Data-ink ratio ${pct(stats.ratio)}.`}
              marks={LAST + 1}
            />
            <div className="min-h-[5.5rem]">
              <p className="font-sans text-[0.8125rem] font-medium text-content">Erased: {current.label}</p>
              <p className="mt-1 font-serif italic text-lg md:text-xl leading-snug text-content-2">{current.caption}</p>
              {step === LAST && (
                <TextButton className="mt-2" onClick={() => setStep(0)}>
                  Start again
                </TextButton>
              )}
            </div>
          </>
        }
      />
    </header>
  );
};

export default RazorHero;
