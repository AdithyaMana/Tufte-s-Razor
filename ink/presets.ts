import { ChartSpec, defaultSpec, SPREADSHEET, themeColours } from './spec.ts';

// Readers choose colours by role ("pale background", "dark plot fill"), and the concrete
// colours are resolved per theme, so a chart that follows the site theme stays legible in
// both light and dark mode.

export type BackgroundChoice = 'theme' | 'white' | 'pale' | 'dark';
export type FillChoice = 'none' | 'white' | 'pale' | 'dark';
export type BarChoice = 'theme' | 'blue' | 'pale' | 'white';

export interface Look {
  background: BackgroundChoice;
  plotFill: FillChoice;
  bars: BarChoice;
  outline: boolean;
}

type ColourKey = 'background' | 'barColor' | 'textColor' | 'lineColor' | 'gridColor' | 'plotFill' | 'barOutline';

/** Everything about a chart except its colours. */
export type Shape = Omit<ChartSpec, ColourKey>;

export const DEFAULT_LOOK: Look = { background: 'theme', plotFill: 'none', bars: 'theme', outline: false };

export function defaultShape(): Shape {
  const { background, barColor, textColor, lineColor, gridColor, plotFill, barOutline, ...shape } = defaultSpec();
  return shape;
}

const { blue, paleBlue, white } = SPREADSHEET;

export function resolveSpec(shape: Shape, look: Look, isDark: boolean): ChartSpec {
  const theme = themeColours(isDark);
  const chrome =
    look.background === 'theme'
      ? theme
      : look.background === 'dark'
        ? { background: blue, textColor: white, lineColor: paleBlue, gridColor: '#7f9fd9' }
        : { background: look.background === 'white' ? white : paleBlue, textColor: SPREADSHEET.text, lineColor: SPREADSHEET.line, gridColor: SPREADSHEET.line };
  const barColor = look.bars === 'theme' ? theme.barColor : { blue, pale: paleBlue, white }[look.bars];
  // On dark paper a "pale" fill is a tint of the paper, not a light block.
  const pale = look.background === 'theme' && isDark ? '#233049' : paleBlue;
  const plotFill = look.plotFill === 'none' ? null : { white, pale, dark: blue }[look.plotFill];
  const barOutline = look.outline ? (barColor === blue ? '#2f5597' : blue) : null;
  return {
    ...shape,
    background: chrome.background,
    textColor: chrome.textColor,
    lineColor: chrome.lineColor,
    gridColor: chrome.gridColor,
    barColor,
    plotFill,
    barOutline,
  };
}

export interface Preset {
  id: string;
  label: string;
  group: string;
  shape?: Partial<Shape>;
  look?: Partial<Look>;
}

/** The article's colour and width figures: bars sorted, no gridlines. */
const FIGURE: Partial<Shape> = { sorted: true, gridlines: false };
const TEXT_FIGURE: Partial<Shape> = { ...FIGURE, plotBorder: true };

export const PRESETS: Preset[] = [
  { id: 'default', label: 'A typical default chart', group: 'Start here' },

  { id: 'A1', label: 'A1 · White background', group: 'Colour', shape: FIGURE, look: { background: 'white', bars: 'blue' } },
  { id: 'B1', label: 'B1 · Pale blue background', group: 'Colour', shape: FIGURE, look: { background: 'pale', bars: 'blue' } },
  { id: 'C1', label: 'C1 · Filled plot area', group: 'Colour', shape: FIGURE, look: { background: 'white', plotFill: 'pale', bars: 'blue' } },
  { id: 'D1', label: 'D1 · White bars on a dark fill', group: 'Colour', shape: FIGURE, look: { background: 'pale', plotFill: 'dark', bars: 'white' } },
  { id: 'A2', label: 'A2 · Box around the plot', group: 'Colour', shape: { ...FIGURE, plotBorder: true }, look: { background: 'white', bars: 'blue' } },
  { id: 'B2', label: 'B2 · Colours reversed', group: 'Colour', shape: FIGURE, look: { background: 'dark', bars: 'pale' } },
  { id: 'C2', label: 'C2 · Filled surround', group: 'Colour', shape: FIGURE, look: { background: 'pale', plotFill: 'white', bars: 'blue' } },
  { id: 'D2', label: 'D2 · Outlined bars', group: 'Colour', shape: FIGURE, look: { background: 'pale', bars: 'white', outline: true } },

  { id: 'redundancy-a', label: 'Every gridline and axis label', group: 'Redundancy' },
  { id: 'redundancy-b', label: 'Label the bars, drop the grid', group: 'Redundancy', shape: { gridlines: false, valueLabels: 'ends', valueAxisLine: true, dataLabels: true } },
  { id: 'redundancy-c', label: 'Sort, label only the values present', group: 'Redundancy', shape: { gridlines: false, valueLabels: 'data', valueAxisLine: true, sorted: true } },

  { id: 'width-a', label: 'Wide bars', group: 'Bar width', shape: { ...FIGURE, barWidth: 0.9 } },
  { id: 'width-b', label: 'Balanced bars', group: 'Bar width', shape: { ...FIGURE, barWidth: 0.5 } },
  { id: 'width-c', label: 'Thin bars', group: 'Bar width', shape: { ...FIGURE, barWidth: 0.16 } },

  { id: 'text-b1', label: 'Bigger title', group: 'Text size', shape: { ...TEXT_FIGURE, titleSize: 30 } },
  { id: 'text-b2', label: 'Bigger labels', group: 'Text size', shape: { ...TEXT_FIGURE, labelSize: 20 } },
  { id: 'text-c1', label: 'Smaller title', group: 'Text size', shape: { ...TEXT_FIGURE, titleSize: 9 } },
  { id: 'text-c2', label: 'Smaller labels', group: 'Text size', shape: { ...TEXT_FIGURE, labelSize: 6 } },

  {
    id: 'everything',
    label: 'Everything switched on',
    group: 'Extremes',
    shape: { gridlines: true, plotBorder: true, tickMarks: true, valueAxisLine: true, dataLabels: true, barWidth: 0.86, titleSize: 26, labelSize: 14 },
    look: { background: 'white', plotFill: 'pale', bars: 'blue', outline: true },
  },
  {
    id: 'razor',
    label: 'Nothing left to take away',
    group: 'Extremes',
    shape: { sorted: true, gridlines: false, chartBorder: false, baseline: false, valueLabels: 'none', categoryLabels: false, title: null, barWidth: 0 },
  },
];

export function applyPreset(preset: Preset): { shape: Shape; look: Look } {
  return {
    shape: { ...defaultShape(), ...preset.shape },
    look: { ...DEFAULT_LOOK, ...preset.look },
  };
}

export function presetSpec(id: string, isDark: boolean): ChartSpec {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(`Unknown preset: ${id}`);
  const { shape, look } = applyPreset(preset);
  return resolveSpec(shape, look, isDark);
}
