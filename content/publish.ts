// The guide's advice as a list to check a chart against before it goes out, in plain words.
// It covers what the ratio measures and, just as much, what it can't.

export interface PublishCheck {
  text: string;
  why: string;
}

export const PUBLISH_CHECKS: PublishCheck[] = [
  { text: 'The chart title gives the audience enough context about the data', why: '“North is busiest overall” tells the reader what to look for; “Trips by station” still leaves a lot for them to work out.' },
  { text: 'Every number has a unit of measure associated with it', why: 'In the title or the axis (it is a bit repetitive on the values): thousands of trips, not just “9”.' },
  { text: 'Reducing redundant values improves focus', why: 'Combinations of direct data labels, axis labels, tick marks and gridlines without using all of them at the same time' },
  { text: 'Using shading, borders or outlines a little as possible', why: 'Backgrounds, borders and gridlines are the easiest ink to erase.' },
  { text: 'Bar widths matter when it comes to information density and ease of comparison', why: 'Bars that are too wide add ink but no additional information; ones that are too narrow are hard to compare.' },
  { text: 'Show the full height of the bar', why: 'The height of the bar should represent the value; truncating the axis only when it is very clearly indicated, and is not misleading the audience in any way.' },
  { text: 'Directly label information where appropriate to reduce amount of focus switching', why: 'Label the values or categories directly to avoid having to switch focus between the axis and the bars, or the data and the legend.' },
  { text: 'Categories are sorted, unless they have a natural order of their own', why: 'Sort stations by size; leave months, years and age bands in their numerical order.' },
  { text: 'Highlight at most one or two things that matters so they stands out', why: 'Use a highlight colour on the critical value(s) and keep the rest muted; add an annotation next to at the cost of a little bit of ink and save a lot of time for the audience.' },
  { text: 'Make all text legible for the audience', why: 'Create a visual hierarchy without making the fine print too small to read.' },
];
