import React, { useMemo } from 'react';
import { readabilityChecks } from '../../ink/checks.ts';
import { presetSpec } from '../../ink/presets.ts';
import { useIsDark } from '../site/theme.ts';
import ChartPanels from './ChartPanels.tsx';

const CHARTS = [
  { id: 'everything', verdict: 'Too low', text: 'Fills, gridlines, outlines and heavy type bury five numbers.' },
  { id: 'redundancy-b', verdict: 'About right', text: 'Each value said once, on its bar, with just enough axis.' },
  { id: 'razor', verdict: 'Too high', text: 'All data-ink, and no way to tell what any bar shows.' },
] as const;

/** Goldilocks and the three charts: the ratio is a range to aim for, not a score to max out. */
const ThreeCharts: React.FC = () => {
  const isDark = useIsDark();
  const panels = useMemo(
    () =>
      CHARTS.map((chart) => {
        const spec = presetSpec(chart.id, isDark);
        const issues = readabilityChecks(spec).length;
        return {
          spec,
          label: chart.verdict,
          caption: (
            <>
              <p className="text-[0.8125rem] leading-snug">{chart.text}</p>
              {issues > 0 && (
                <p className="mt-1">
                  {issues} readability warning{issues > 1 ? 's' : ''}
                </p>
              )}
            </>
          ),
        };
      }),
    [isDark],
  );
  return <ChartPanels panels={panels} columns={3} label="Three versions of one chart: too little, about right and too much" inspectable />;
};

export default ThreeCharts;
