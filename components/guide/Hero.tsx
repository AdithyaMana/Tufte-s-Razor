import React, { useMemo, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { defaultSpec } from '../../ink/spec.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { Segmented } from './controls.tsx';
import { pct } from './format.ts';
import { InkMapLegend } from './LabFrame.tsx';
import { useInkStats } from './useInk.ts';

type View = 'chart' | 'map';

const VIEWS: { value: View; label: string }[] = [
  { value: 'chart', label: 'As drawn' },
  { value: 'map', label: 'Ink map' },
];

const Hero: React.FC = () => {
  const isDark = useIsDark();
  const [view, setView] = useState<View>('map');
  const spec = useMemo(() => defaultSpec(isDark), [isDark]);
  const stats = useInkStats(spec);

  return (
    <header className="max-w-6xl mx-auto px-4 md:px-8 pt-12 md:pt-20">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-14 items-center">
        <div>
          <p className="kicker">An interactive guide to the data-ink ratio</p>
          <h1 className="mt-4 font-serif text-[2.9rem] sm:text-6xl lg:text-[4.25rem] leading-[1.02] tracking-tight text-ink text-balance">
            How much of your chart is <em>data</em>?
          </h1>
          <div className="article mt-6 text-ink-2">
            <p>
              Every chart is made of ink — on a screen, of pixels. In the ordinary chart here, only{' '}
              <strong className="font-sans font-semibold text-ink">{pct(stats.ratio)}</strong> of it is data-ink in Tufte’s strict
              sense. The rest frames the five numbers, labels them, or says them again.
            </p>
            <p>
              Edward Tufte called that share the <em>data-ink ratio</em>. This guide lets you pull every lever yourself — bar width,
              colour, gridlines, labels, type — and watch every pixel get counted.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-sans text-sm">
            <a
              href="#bar-width"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 font-medium text-paper hover:bg-ink/85 transition-colors"
            >
              Start with bar width <ArrowDown size={15} aria-hidden="true" />
            </a>
            <a href="#ratio" className="text-ink-2 hover:text-ink underline underline-offset-4 decoration-rule-2 hover:decoration-ink">
              Begin at the beginning
            </a>
          </div>
        </div>

        <figure className="min-w-0">
          <div className="relative rounded-md ring-1 ring-rule overflow-hidden">
            <ChartCanvas spec={spec} className={`transition-opacity duration-500 ${view === 'map' ? 'opacity-0' : 'opacity-100'}`} />
            <div className={`absolute inset-0 transition-opacity duration-500 ${view === 'map' ? 'opacity-100' : 'opacity-0'}`}>
              <ChartCanvas spec={spec} inkMap label="The same chart, coloured by kind of ink" />
            </div>
          </div>
          <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <Segmented label="Show the chart" options={VIEWS} value={view} onChange={setView} size="sm" hideLabel />
            <InkMapLegend className={`transition-opacity ${view === 'map' ? 'opacity-100' : 'opacity-40'}`} />
          </figcaption>
        </figure>
      </div>
    </header>
  );
};

export default Hero;
