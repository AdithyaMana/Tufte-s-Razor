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
  /** Font sizes in px, on the chart's 480 px width. */
  titleSize: number;
  labelSize: number;
}

/**
 * Charts are drawn and counted at this fixed logical size, then scaled to fit the screen:
 * about the size of a spreadsheet's default chart (5 × 3 inches), so default type sizes
 * look the way they do in a spreadsheet, and stay readable on a phone.
 */
export const CHART_WIDTH = 480;
export const CHART_HEIGHT = 300;

/** A spreadsheet's default type: a 14 pt title and 9 pt labels, in px. */
export const DEFAULT_TITLE_SIZE = 18;
export const DEFAULT_LABEL_SIZE = 12;

/**
 * The thinnest bar that still shows its value: a 2px hairline. Only this much of each bar
 * counts as data-ink — a bar's value lives in its length, so every pixel of extra width
 * repeats the same number and is redundant.
 */
export const ESSENTIAL_WIDTH = 2;

export const CHART_FONT_FAMILY = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * The article's values (three distinct values, one repeated three times), given names and a
 * unit so the charts can say something: weekly bike-share trips, in thousands, at five
 * stations of an illustrative city. Stations have no natural order, so sorting them is fair.
 */
export const ARTICLE_DATA: Datum[] = [
  { label: 'North', value: 9 },
  { label: 'East', value: 7 },
  { label: 'South', value: 5 },
  { label: 'West', value: 7 },
  { label: 'Central', value: 7 },
];

/** What a spreadsheet puts on a new chart. */
export const GENERIC_TITLE = 'Chart Title';

/** A title that states the finding, with the unit: what a good chart leads with. */
export const FINDING_TITLE = 'North is busiest: 9k trips a week';

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
    title: GENERIC_TITLE,
    titleSize: DEFAULT_TITLE_SIZE,
    labelSize: DEFAULT_LABEL_SIZE,
    ...themeColours(isDark),
  };
}

/** Categories in drawing order. */
export function orderedData(spec: ChartSpec): Datum[] {
  if (!spec.sorted) return spec.data;
  return [...spec.data].sort((a, b) => b.value - a.value);
}
