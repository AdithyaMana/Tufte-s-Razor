import React, { useMemo } from 'react';
import { presetSpec } from '../../ink/presets.ts';
import ChartPanels from './ChartPanels.tsx';

// The article's eight colour variations, as small multiples. Captions paraphrase its notes.
const VARIANTS: { id: string; caption: string }[] = [
  { id: 'A1', caption: 'Blue bars on white.' },
  { id: 'B1', caption: 'Pale blue paper: same ink, same ratio.' },
  { id: 'C1', caption: 'A shaded plot area: all of it non-data ink.' },
  { id: 'D1', caption: 'White bars on a dark fill: the same ink as C1.' },
  { id: 'A2', caption: 'A thin box around the plot: barely any ink.' },
  { id: 'B2', caption: 'B1 reversed: same ratio, but text must turn light.' },
  { id: 'C2', caption: 'C1 reversed: the heavy colour now frames the chart.' },
  { id: 'D2', caption: 'Outlined bars: a little extra, repeated ink.' },
];

/** Every variation measured, side by side. */
const ColourGrid: React.FC<{ className?: string }> = ({ className }) => {
  // These specimens reproduce the article's colours, so they ignore the site theme.
  const panels = useMemo(
    () =>
      VARIANTS.map((v) => ({
        spec: presetSpec(v.id, false),
        label: v.id,
        caption: v.caption,
        description: `Variation ${v.id}: ${v.caption}`,
      })),
    [],
  );
  return (
    <ChartPanels
      panels={panels}
      label="The article’s eight colour variations of one chart, each measured"
      note="Data-ink ratio beside each name. These keep the article’s colours in dark mode, so they can be compared like for like."
      className={className}
    />
  );
};

export default ColourGrid;
