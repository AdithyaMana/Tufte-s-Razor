import type { InkPart } from '../ink/inspect.ts';

// What each part of a chart is called, and what it does for the reader, in a line.

export const PARTS: Record<InkPart, { name: string; why: string }> = {
  bars: { name: 'Bars', why: 'A bar shows its value by its length. The rest of its width says the same thing again.' },
  dataLabels: { name: 'Values on the bars', why: 'They repeat the values the axis gives. With no axis labels they’re the only place the values are written, so they count as data-ink.' },
  title: { name: 'Title', why: 'Tells readers what they are looking at. Erase it and that’s lost, so it counts as data-ink.' },
  valueLabels: { name: 'Axis labels', why: 'The scale the bars are read against. Without them, nobody can read a value.' },
  categoryLabels: { name: 'Category labels', why: 'They name the bars. Without them, nobody knows which bar is which.' },
  axes: { name: 'Axis lines and ticks', why: 'They anchor the bars and mark where zero is, but carry no values of their own.' },
  borders: { name: 'Border', why: 'A frame around the chart. It shows no data.' },
  gridlines: { name: 'Gridlines', why: 'They help the eye carry a bar’s height across to the axis. Where a bar hides them, they don’t count.' },
  plotFill: { name: 'Shaded plot area', why: 'Every pixel of it is ink, and none of it shows data.' },
  paper: { name: 'Paper', why: 'Not ink at all. Its colour never counts, whatever it is.' },
};
