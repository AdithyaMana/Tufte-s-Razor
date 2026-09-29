import React from 'react';
import { AnalysisResult } from '../types.ts';
import { More, TextButton } from './guide/controls.tsx';
import { linkHandler } from './site/router.ts';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  imageSrc: string;
  onReset: () => void;
}

const pxFormat = new Intl.NumberFormat('en-US');

/** A pixel map drawn as a shape in one of the site's ink colours (only its alpha is used). */
const MapLayer: React.FC<{ src: string; colour: string }> = ({ src, colour }) => (
  <div
    className="absolute inset-0"
    style={{
      backgroundColor: colour,
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskSize: '100% 100%',
      maskSize: '100% 100%',
    }}
  />
);

const Findings: React.FC<{ title: string; items: string[]; empty: string; numbered?: boolean }> = ({ title, items, empty, numbered = false }) => {
  const List = numbered ? 'ol' : 'ul';
  return (
    <div>
      <h2 className="pb-2 border-b border-content/70 font-sans text-[0.9375rem] font-semibold text-content">{title}</h2>
      {items.length ? (
        <List className={`mt-3 space-y-2 font-sans text-[0.8125rem] leading-snug text-content-2 ${numbered ? 'list-decimal pl-5' : ''}`}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </List>
      ) : (
        <p className="mt-3 font-sans text-[0.8125rem] text-content-2">{empty}</p>
      )}
    </div>
  );
};

/** The analyzer's result, laid out like the guide: the chart, its numbers, what to change. */
const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, imageSrc, onReset }) => {
  const title = result.analysisTitle || result.redesignDescription.split('.')[0];
  const stats = result.pixelStats;
  const maps = stats?.debugMaps;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="kicker">Your chart, measured · AI-assisted estimate</p>
        <TextButton onClick={onReset}>Measure another chart</TextButton>
      </div>
      <h1 className="mt-3 max-w-4xl font-serif text-4xl md:text-5xl leading-tight tracking-tight text-content text-balance">{title}</h1>
      <p className="mt-4 max-w-3xl font-serif italic text-xl md:text-2xl leading-snug text-content-2">{result.verdict}</p>

      <div className="lab-grid mt-12">
        <figure className="min-w-0" style={{ gridArea: 'chart' }}>
          <img src={imageSrc} alt="The chart you uploaded" className="max-w-full max-h-[520px] object-contain" />
          <figcaption className="mt-2 font-sans text-xs text-chrome">
            Your chart, {stats.width} × {stats.height} px as analysed
          </figcaption>
        </figure>

        <div className="font-sans" style={{ gridArea: 'readout' }}>
          <p className="kicker">Data-ink ratio, estimated</p>
          <p className="mt-1.5 text-[2.75rem] leading-none font-semibold tracking-tight text-content">{Math.round(result.dataInkRatio * 100)}%</p>
          <p className="mt-3 text-xs leading-relaxed text-content-2">
            From a picture, every data-coloured pixel counts as data-ink, repeated or not, so wide bars score high.{' '}
            <a href="/#bar-width" onClick={linkHandler('/#bar-width')} className="underline underline-offset-2 hover:text-content">
              Why that matters
            </a>
            .
          </p>
          <p className="kicker mt-8">Visual efficiency</p>
          <p className="mt-1.5 text-3xl font-semibold tracking-tight text-content">
            {result.visualEfficiencyScore}
            <span className="text-base font-normal text-content-2"> / 100</span>
          </p>
          {result.clutterSummary && <p className="mt-2 text-xs leading-relaxed text-content-2">{result.clutterSummary}</p>}
        </div>

        {maps && (
          <figure className="min-w-0" style={{ gridArea: 'controls' }}>
            <div className="relative w-full max-w-xl" style={{ aspectRatio: `${stats.width} / ${stats.height}` }}>
              <MapLayer src={maps.structureMap} colour="rgb(var(--ink-nondata))" />
              <MapLayer src={maps.dataMap} colour="rgb(var(--ink-data))" />
            </div>
            <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-sans text-xs text-content-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-ink-data" aria-hidden="true" /> Counted as data-ink: {pxFormat.format(stats.dataInkPixels)} px
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-ink-nondata" aria-hidden="true" /> Counted as non-data ink: {pxFormat.format(stats.structuralPixels)} px
              </span>
            </figcaption>
          </figure>
        )}
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-3">
        <Findings title="Chartjunk found" items={result.chartJunk} empty="No significant chartjunk found." />
        <Findings title="Data worth keeping" items={result.dataInk} empty="No clear data regions identified." />
        <Findings title="What to change" items={result.suggestions} empty="No changes suggested." numbered />
      </div>

      <More label="How this was measured" className="mt-12">
        <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1 w-fit font-sans text-[0.8125rem] tabular-nums text-content-2">
          <dt>Pixels analysed</dt>
          <dd className="text-right">{pxFormat.format(stats.totalPixels)}</dd>
          <dt>Ink pixels (not background)</dt>
          <dd className="text-right">{pxFormat.format(stats.inkPixels)}</dd>
          <dt>Data-ink pixels</dt>
          <dd className="text-right">{pxFormat.format(stats.dataInkPixels)}</dd>
          <dt>Background colour</dt>
          <dd className="text-right">{stats.backgroundHex}</dd>
          <dt>Pixel ratio / AI estimate</dt>
          <dd className="text-right">
            {Math.round(stats.dataInkRatio * 100)}% / {Math.round((result.aiEstimatedRatio || 0) * 100)}%
          </dd>
        </dl>
        <p className="mt-3 max-w-xl font-sans text-xs leading-relaxed text-content-2">
          The ratio above blends the pixel count (70%) with the AI’s own estimate (30%).
        </p>
      </More>
    </div>
  );
};

export default AnalysisDashboard;
