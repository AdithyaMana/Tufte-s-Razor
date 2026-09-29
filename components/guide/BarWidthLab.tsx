import React, { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { COMFORTABLE_BAR_WIDTH, readabilityChecks, widthZone } from '../../ink/checks.ts';
import { computeLayout } from '../../ink/layout.ts';
import { measureText } from '../../ink/measure.ts';
import { defaultSpec, type ChartSpec } from '../../ink/spec.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { Segmented, Slider } from './controls.tsx';
import { pct } from './format.ts';
import InkReadout, { CompactRatio } from './InkReadout.tsx';
import { InkMapLegend, InkMapToggle, LabFrame, Warnings } from './LabFrame.tsx';
import SweepChart from './SweepChart.tsx';
import { useAnimator } from './useAnimator.ts';
import { useInkStats, useInkSweep } from './useInk.ts';

type Preset = 'wide' | 'balanced' | 'thin' | 'hairline';

// The article's three examples (A, B, C), plus the limit where only data-ink is left.
const PRESETS: { value: Preset; label: string; width: number; hint: string }[] = [
  { value: 'wide', label: 'Wide', width: 0.9, hint: 'Example A: wide bars, minimal gaps' },
  { value: 'balanced', label: 'Balanced', width: 0.31, hint: 'Example B: sufficient whitespace around the bars' },
  { value: 'thin', label: 'Thin', width: 0.16, hint: 'Example C: very thin bars, far apart' },
  { value: 'hairline', label: 'Hairline', width: 0, hint: 'Nothing left but data-ink' },
];

// 0 (a 2px hairline) to 1 (bars touching), every 2.5%.
const SWEEP = Array.from({ length: 41 }, (_, i) => i / 40);
const withWidth = (spec: ChartSpec, barWidth: number) => ({ ...spec, barWidth });

/** The article's bar-width figures: sorted bars, no gridlines. */
export function barWidthSpec(isDark: boolean): ChartSpec {
  return { ...defaultSpec(isDark), sorted: true, gridlines: false };
}

const BarWidthLab: React.FC = () => {
  const isDark = useIsDark();
  const [width, setWidth] = useState(0.31);
  const [inkMap, setInkMap] = useState(false);
  const { animate, stop } = useAnimator(setWidth);

  const base = useMemo(() => barWidthSpec(isDark), [isDark]);
  const spec = useMemo(() => withWidth(base, width), [base, width]);
  const stats = useInkStats(spec);
  const sweep = useInkSweep(base, SWEEP, withWidth);

  const barPx = useMemo(() => computeLayout(spec, measureText).bars[0].w, [spec]);
  const preset = PRESETS.find((p) => Math.abs(p.width - width) < 0.004)?.value ?? null;
  const zone = widthZone(width);
  const zoneWarnings = readabilityChecks(spec).filter((c) => c.id === 'sparse' || c.id === 'crowded');

  const ratioPoints = sweep?.map((p) => ({ x: p.x, y: p.stats.ratio })) ?? null;
  const sharePoints = sweep?.map((p) => ({ x: p.x, y: p.stats.dataShare })) ?? null;
  const widthLabel = (w: number) => (w < 0.005 ? 'hairline' : `${Math.round(w * 100)}%`);

  return (
    <LabFrame label="Interactive · Bar width">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-8 lg:gap-10">
        <div className="min-w-0">
          <ChartCanvas spec={spec} inkMap={inkMap} className="rounded-sm" />
          {inkMap && <InkMapLegend className="mt-3" />}
          <CompactRatio stats={stats} className="mt-3" />

          <div className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Slider
              label="Bar width"
              value={Math.round(width * 100)}
              min={0}
              max={100}
              onChange={(v) => {
                stop();
                setWidth(v / 100);
              }}
              format={(v) => (v === 0 ? 'hairline · 2 px' : `${v}% of slot · ${barPx} px`)}
              valueText={`${widthLabel(width)} of each slot, data-ink ratio ${pct(stats.ratio)}`}
            />
            <InkMapToggle checked={inkMap} onChange={setInkMap} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Segmented
              label="The article's examples"
              options={PRESETS}
              value={preset}
              onChange={(value) => animate(width, PRESETS.find((p) => p.value === value)!.width)}
              size="sm"
            />
          </div>

          <div className="mt-5 min-h-[2.5rem]">
            {zone === 'comfortable' ? (
              <p className="flex gap-2 font-sans text-[0.8125rem] leading-snug text-ink-2">
                <CheckCircle2 size={15} className="shrink-0 mt-[1px] text-ink-data" aria-hidden="true" />
                Comfortable: enough bar to see and compare, enough gap to tell the categories apart.
              </p>
            ) : (
              <Warnings warnings={zoneWarnings} />
            )}
          </div>
        </div>

        <InkReadout stats={stats} />
      </div>

      <div className="mt-8 pt-6 border-t border-rule grid gap-8 md:grid-cols-2">
        <SweepChart
          title="Data-ink ratio"
          subtitle="Essential data-ink ÷ total ink — falls as bars widen"
          points={ratioPoints}
          current={{ x: width, y: stats.ratio }}
          colour="rgb(var(--ink-data))"
          zone={[COMFORTABLE_BAR_WIDTH[0], COMFORTABLE_BAR_WIDTH[1]]}
          zoneLabel="comfortable widths"
          xLabel="Bar width, as a share of each slot"
          formatX={(x) => `${Math.round(x * 100)}%`}
          formatY={pct}
          formatTick={(y) => `${Math.round(y * 100)}%`}
          onPick={(x) => animate(width, x)}
          ariaLabel={
            ratioPoints
              ? `Line chart: the data-ink ratio falls from ${pct(ratioPoints[0].y)} with hairline bars to ${pct(ratioPoints[ratioPoints.length - 1].y)} with bars that fill their slots.`
              : 'Line chart of data-ink ratio against bar width, loading.'
          }
        />
        <SweepChart
          title="Share of ink in data colours"
          subtitle="All data-ink, redundant included ÷ total ink — rises as bars widen"
          points={sharePoints}
          current={{ x: width, y: stats.dataShare }}
          colour="rgb(var(--ink-2))"
          xLabel="Bar width, as a share of each slot"
          formatX={(x) => `${Math.round(x * 100)}%`}
          formatY={(y) => `${Math.round(y * 100)}%`}
          onPick={(x) => animate(width, x)}
          ariaLabel={
            sharePoints
              ? `Line chart: the share of ink in data colours rises from ${pct(sharePoints[0].y)} with hairline bars to ${pct(sharePoints[sharePoints.length - 1].y)} with bars that fill their slots.`
              : 'Line chart of the share of ink in data colours against bar width, loading.'
          }
        />
      </div>

      {sweep && (
        <details className="mt-6 font-sans text-[0.8125rem] text-ink-2 group">
          <summary className="cursor-pointer select-none text-muted hover:text-ink w-fit">Show these numbers as a table</summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full max-w-lg tabular-nums">
              <thead>
                <tr className="text-left text-muted border-b border-rule">
                  <th className="py-1.5 pr-4 font-medium">Bar width</th>
                  <th className="py-1.5 pr-4 font-medium text-right">Data-ink ratio</th>
                  <th className="py-1.5 font-medium text-right">Share in data colours</th>
                </tr>
              </thead>
              <tbody>
                {sweep
                  .filter((_, i) => i % 4 === 0)
                  .map((p) => (
                    <tr key={p.x} className="border-b border-rule/60">
                      <td className="py-1 pr-4">{widthLabel(p.x)}</td>
                      <td className="py-1 pr-4 text-right text-ink">{pct(p.stats.ratio)}</td>
                      <td className="py-1 text-right">{pct(p.stats.dataShare)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </LabFrame>
  );
};

export default BarWidthLab;
