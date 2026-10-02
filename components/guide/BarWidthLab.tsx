import React, { useMemo, useState } from 'react';
import { COMFORTABLE_BAR_WIDTH, readabilityChecks, widthZone } from '../../ink/checks.ts';
import { computeLayout, REFERENCE_PLOT_WIDTH } from '../../ink/layout.ts';
import { measureText } from '../../ink/measure.ts';
import { ARTICLE_DATA, defaultSpec, ESSENTIAL_WIDTH, type ChartSpec } from '../../ink/spec.ts';
import { useIsDark } from '../site/theme.ts';
import { useIsArticle } from '../site/view.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { More, Segmented, Slider } from './controls.tsx';
import { pct } from './format.ts';
import InkReadout from './InkReadout.tsx';
import { AllClear, Lab, Warnings } from './Lab.tsx';
import SweepChart from './SweepChart.tsx';
import { useAnimator } from './useAnimator.ts';
import { useInkStats, useInkSweep } from './useInk.ts';

type Preset = 'wide' | 'balanced' | 'thin';

// The article's wide and thin examples (A and C), and balanced bars at half of each slot.
const PRESETS: { value: Preset; label: string; width: number; hint: string }[] = [
  { value: 'wide', label: 'Wide', width: 0.9, hint: 'Lai and Morrison’s example A: wide bars, minimal gaps' },
  { value: 'balanced', label: 'Balanced', width: 0.5, hint: 'Bars fill half of each slot' },
  { value: 'thin', label: 'Thin', width: 0.16, hint: 'Example C: very thin bars, far apart' },
];

// From a 2px hairline (0) to bars that touch (1), every 2.5%.
const SWEEP = Array.from({ length: 41 }, (_, i) => i / 40);
const withWidth = (spec: ChartSpec, barWidth: number) => ({ ...spec, barWidth });

/** The article's bar-width figures: sorted bars, no gridlines. */
export function barWidthSpec(isDark: boolean): ChartSpec {
  return { ...defaultSpec(isDark), sorted: true, gridlines: false };
}

// Widths are read in pixels everywhere, the slider and the charts below it alike. Each bar
// gets an 84 px slot, so at 84 px the bars touch.
const SLOT_PX = REFERENCE_PLOT_WIDTH / ARTICLE_DATA.length;
const pxOf = (x: number) => Math.max(ESSENTIAL_WIDTH, Math.round(x * SLOT_PX));
const widthTick = (x: number) => `${pxOf(x)} px`;
const WIDTH_TICKS = [0, 20, 40, 60, SLOT_PX].map((px) => px / SLOT_PX);
const WIDTH_AXIS = `Bar width, in px (each bar has ${SLOT_PX} px of space)`;

const BarWidthLab: React.FC = () => {
  const isDark = useIsDark();
  const article = useIsArticle();
  const [width, setWidth] = useState(0.5);
  const { animate, stop } = useAnimator(setWidth);

  const base = useMemo(() => barWidthSpec(isDark), [isDark]);
  const spec = useMemo(() => withWidth(base, width), [base, width]);
  const stats = useInkStats(spec);
  const widest = useInkStats(withWidth(base, 1));
  const sweep = useInkSweep(base, SWEEP, withWidth);

  const barPx = useMemo(() => computeLayout(spec, measureText).bars[0].w, [spec]);
  const preset = PRESETS.find((p) => Math.abs(p.width - width) < 0.004)?.value ?? null;
  const zoneWarnings = readabilityChecks(spec).filter((c) => c.id === 'sparse' || c.id === 'crowded');

  const ratioPoints = sweep?.map((p) => ({ x: p.x, y: p.stats.ratio })) ?? null;
  const sharePoints = sweep?.map((p) => ({ x: p.x, y: p.stats.dataShare })) ?? null;

  // In the article view this is all there is: the ratio at every width, and what it means.
  const sweepFigure = (
    <div className="max-w-3xl">
      <SweepChart
        title="The data-ink ratio at every width"
        subtitle={article ? undefined : 'Click anywhere on the line to try that width.'}
        still={article}
        points={ratioPoints}
        current={{ x: width, y: stats.ratio }}
        colour="rgb(var(--ink-data))"
        zone={[COMFORTABLE_BAR_WIDTH[0], COMFORTABLE_BAR_WIDTH[1]]}
        zoneLabel="easiest to compare"
        xLabel={WIDTH_AXIS}
        xTicks={WIDTH_TICKS}
        formatX={widthTick}
        formatY={pct}
        formatTick={(y) => `${Math.round(y * 100)}%`}
        onPick={(x) => animate(width, x)}
        ariaLabel={
          ratioPoints
            ? `Line chart: the data-ink ratio falls from ${pct(ratioPoints[0].y)} with 2 px hairlines to ${pct(ratioPoints[ratioPoints.length - 1].y)} with ${SLOT_PX} px bars that touch.`
            : 'Line chart of the data-ink ratio against bar width, loading.'
        }
      />
      <div className={article ? 'mt-10 space-y-10' : 'mt-6 space-y-3'}>
        <More label="Why do wider bars look like more data?">
          <div className="max-w-2xl">
            <p className="article text-[1.0625rem] md:text-lg text-content-2">
              Count every blue pixel as data and wider bars do score higher, as this second line shows. That count skips one
              word in Tufte’s definition: data-ink is <em>non-redundant</em>. A bar twice as wide says the same number twice as
              loudly.
            </p>
            <div className="mt-4">
              <SweepChart
                title="Share of ink in data colours"
                points={sharePoints}
                current={{ x: width, y: stats.dataShare }}
                colour="rgb(var(--content-2))"
                xLabel={WIDTH_AXIS}
                xTicks={WIDTH_TICKS}
                formatX={widthTick}
                formatY={(y) => `${Math.round(y * 100)}%`}
                onPick={(x) => animate(width, x)}
                still={article}
                ariaLabel={
                  sharePoints
                    ? `Line chart: the share of ink in data colours rises from ${pct(sharePoints[0].y)} with 2 px hairlines to ${pct(sharePoints[sharePoints.length - 1].y)} with ${SLOT_PX} px bars that touch.`
                    : 'Line chart of the share of ink in data colours against bar width, loading.'
                }
              />
            </div>
          </div>
        </More>
        {sweep && !article && (
          <More label="Show the numbers" heading="The numbers">
            <table className="w-full max-w-md font-sans text-[0.8125rem] tabular-nums text-content-2">
              <thead>
                <tr className="text-left border-b border-line">
                  <th className="py-1.5 pr-4 font-medium">Bar width</th>
                  <th className="py-1.5 pr-4 font-medium text-right">Data-ink ratio</th>
                  <th className="py-1.5 font-medium text-right">In data colours</th>
                </tr>
              </thead>
              <tbody>
                {sweep
                  .filter((_, i) => i % 4 === 0)
                  .map((p) => (
                    <tr key={p.x} className="border-b border-line/60">
                      <td className="py-1 pr-4">{widthTick(p.x)}</td>
                      <td className="py-1 pr-4 text-right text-content">{pct(p.stats.ratio)}</td>
                      <td className="py-1 text-right">{pct(p.stats.dataShare)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </More>
        )}
      </div>
    </div>
  );

  if (article) {
    return (
      <div className="my-10 md:my-12">
        <p className="article max-w-[38rem] mb-6">
          The chart below follows the ratio through every width, from a 2 px hairline to {SLOT_PX} px bars that touch. The shaded
          band marks the widths that are easiest to compare.
        </p>
        {sweepFigure}
      </div>
    );
  }

  return (
    <Lab
      label="Bar width and the data-ink ratio"
      chart={<ChartCanvas spec={spec} inspectable />}
      readout={<InkReadout stats={stats} scale={widest.total} />}
      controls={
        <>
          <Slider
            label="Bar width"
            value={Math.round(width * 100)}
            min={0}
            max={100}
            onChange={(v) => {
              stop();
              setWidth(v / 100);
            }}
            format={(v) => (v === 0 ? 'hairline, 2 px' : `${barPx} px`)}
            valueText={`${barPx} pixels wide. Data-ink ratio ${pct(stats.ratio)}.`}
          />
          <Segmented
            label="Examples"
            options={PRESETS}
            value={preset}
            onChange={(value) => animate(width, PRESETS.find((p) => p.value === value)!.width)}
          />
          {widthZone(width) === 'comfortable' ? (
            <AllClear>Easy to compare: enough bar to see, enough gap to tell the bars apart.</AllClear>
          ) : (
            <Warnings warnings={zoneWarnings} />
          )}
        </>
      }
      after={<div className="mt-10">{sweepFigure}</div>}
    />
  );
};

export default BarWidthLab;
