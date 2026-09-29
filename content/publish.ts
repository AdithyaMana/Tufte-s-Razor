// The guide's advice as a list to check a chart against before it goes out, in plain words.
// It covers what the ratio measures and, just as much, what it can't.

export interface PublishCheck {
  text: string;
  why: string;
}

export const PUBLISH_CHECKS: PublishCheck[] = [
  { text: 'The title says what the chart shows.', why: '“North is busiest” tells the reader what to look for; “Trips by station” leaves them to work it out.' },
  { text: 'Every number has its unit.', why: 'In the title, the axis or on the values: thousands of trips, not just “9”.' },
  { text: 'Each value is said once.', why: 'Values on the bars, or an axis with gridlines, but rarely both.' },
  { text: 'Nothing is shaded, boxed or outlined without a reason.', why: 'Backgrounds, borders and gridlines are the easiest ink to erase.' },
  { text: 'Bars fill about half to two-thirds of their space.', why: 'Wider bars add ink but no information; much thinner ones are hard to compare.' },
  { text: 'Bars start at zero.', why: 'A bar’s length is its value. Cut off the bottom and the lengths lie.' },
  { text: 'Labels sit next to what they name.', why: 'Label the bars or lines directly rather than making readers match colours to a legend.' },
  { text: 'Long names go on horizontal bars.', why: 'Station names fit under a column; “Central and Riverside interchange” doesn’t.' },
  { text: 'Categories are sorted, unless they have an order of their own.', why: 'Sort stations by size; leave months, years and age bands in order.' },
  { text: 'The one thing that matters stands out.', why: 'Colour the key bar and keep the rest muted, or add a short note beside it. It costs a little ink, and it’s ink that earns its place.' },
  { text: 'Every word is readable at arm’s length.', why: 'And the title is the biggest text on the chart.' },
];
