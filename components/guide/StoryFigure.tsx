import React from 'react';
import type { InkStats } from '../../ink/measure.ts';
import type { InkGroup } from '../../ink/render.ts';
import type { ChartSpec } from '../../ink/spec.ts';
import { useCanHover } from '../site/media.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { InkMeter, type ReferenceStats } from './InkReadout.tsx';

interface StoryFigureProps {
  spec: ChartSpec;
  stats: InkStats;
  /** Pixels of ink the ink bar's full width stands for. */
  scale?: number;
  reference?: ReferenceStats | null;
  highlight?: readonly InkGroup[] | null;
  inkMap?: boolean;
  /** Keep the ratio back, e.g. until the reader has guessed. */
  hideRatio?: boolean;
  label?: string;
}

/** The chart a story is about, and its count, kept in view while the story is read. */
const StoryFigure: React.FC<StoryFigureProps> = ({ spec, stats, scale, reference, highlight, inkMap, hideRatio, label }) => (
  <>
    <ChartCanvas spec={spec} highlight={highlight} inkMap={inkMap} label={label} inspectable />
    <InkMeter stats={stats} scale={scale} reference={reference} hidden={hideRatio} className="mt-3" />
  </>
);

export default StoryFigure;

/** How to inspect a chart on this device: "Point at" or "Tap". */
export function usePointVerb(): { verb: string; Verb: string } {
  const canHover = useCanHover();
  return canHover ? { verb: 'point at', Verb: 'Point at' } : { verb: 'tap', Verb: 'Tap' };
}
