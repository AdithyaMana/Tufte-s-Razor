// A bar chart described by every design choice the guide lets readers change.
// Each choice maps to an example in "Balancing clarity and clutter" (Lai & Morrison).

export interface Datum {
  label: string;
  value: number;
}

/** Which values the vertical axis labels. */
export type ValueLabelMode = 'all' | 'ends' | 'data' | 'none';

export interface ChartSpec {
  data: Datum[];
  /** Sort categories from largest to smallest value. */
  sorted: boolean;
  /** Bar width as a share (0–1) of the horizontal slot each category gets in a standard-width plot. */
  barWidth: number;
  barColor: string;
  /** Outline drawn around each bar, or null for none. */
  barOutline: string | null;
  /** The chart's own background — the "paper". Never counted as ink, whatever its colour. */
  background: string;
  /** A fill painted over the plot area. Counted as (non-data) ink. */
  plotFill: string | null;
  textColor: string;
  lineColor: string;
  gridColor: string;
  chartBorder: boolean;
  plotBorder: boolean;
  gridlines: boolean;
  /** Horizontal axis line along the bottom of the bars. */
  baseline: boolean;
  /** Vertical axis line beside the value labels. */
  valueAxisLine: boolean;
  tickMarks: boolean;
  valueLabels: ValueLabelMode;
  categoryLabels: boolean;
  /** Numbers printed above each bar. */
  dataLabels: boolean;
  title: string | null;
  /** Font sizes in px, relative to the chart's 640px reference width. */
  titleSize: number;
  labelSize: number;
}

/** Charts are drawn and counted at this fixed logical size, then scaled to fit the screen. */
export const CHART_WIDTH = 640;
export const CHART_HEIGHT = 400;

/**
 * The thinnest bar that still shows its value: a 2px hairline. Only this much of each bar
 * counts as data-ink — a bar's value lives in its length, so every pixel of extra width
 * repeats the same number and is redundant.
 */
export const ESSENTIAL_WIDTH = 2;

export const CHART_FONT_FAMILY = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

/** The dataset from the article: three distinct values, one repeated three times. */
export const ARTICLE_DATA: Datum[] = [
  { label: 'A', value: 9 },
  { label: 'B', value: 7 },
  { label: 'C', value: 5 },
  { label: 'D', value: 7 },
  { label: 'E', value: 7 },
];

/** Default spreadsheet colours, as in the article's figures. */
export const SPREADSHEET = {
  blue: '#4472c4',
  paleBlue: '#dae3f3',
  white: '#ffffff',
  text: '#595959',
  line: '#d9d9d9',
};

type SpecimenColours = Pick<ChartSpec, 'background' | 'barColor' | 'textColor' | 'lineColor' | 'gridColor'>;

/** The site's own paper, light and dark (the --paper token in index.css). */
export const PAPER = { light: '#fffff8', dark: '#151514' };

/**
 * Colours for a specimen that follows the site theme. Its background is the page's own
 * paper, so the chart sits on the page the way a chart sits on the paper it is printed on.
 */
export function themeColours(isDark: boolean): SpecimenColours {
  return isDark
    ? { background: PAPER.dark, barColor: '#5a8ad6', textColor: '#b4b2a8', lineColor: '#4a4944', gridColor: '#3b3a36' }
    : { background: PAPER.light, barColor: SPREADSHEET.blue, textColor: SPREADSHEET.text, lineColor: SPREADSHEET.line, gridColor: SPREADSHEET.line };
}

/** A typical default chart, like the article's first example: every default switched on. */
export function defaultSpec(isDark = false): ChartSpec {
  return {
    data: ARTICLE_DATA,
    sorted: false,
    barWidth: 0.31,
    barOutline: null,
    plotFill: null,
    chartBorder: true,
    plotBorder: false,
    gridlines: true,
    baseline: true,
    valueAxisLine: false,
    tickMarks: false,
    valueLabels: 'all',
    categoryLabels: true,
    dataLabels: false,
    title: 'Chart Title',
    titleSize: 18,
    labelSize: 11,
    ...themeColours(isDark),
  };
}

/** Categories in drawing order. */
export function orderedData(spec: ChartSpec): Datum[] {
  if (!spec.sorted) return spec.data;
  return [...spec.data].sort((a, b) => b.value - a.value);
}
