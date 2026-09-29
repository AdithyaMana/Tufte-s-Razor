// How each item of Stephanie Evergreen's Data Visualization Checklist typically moves the
// data-ink ratio when the item is met, as scored in "Balancing clarity and clutter".

export type Effect = 'raises' | 'neutral' | 'lowers';

export interface ChecklistItem {
  item: string;
  effect: Effect;
}

export const CHECKLIST: ChecklistItem[] = [
  { item: 'Descriptive 8–20 word title, upper left', effect: 'neutral' },
  { item: 'Subtitle or annotations add information', effect: 'neutral' },
  { item: 'Text size is hierarchical and readable', effect: 'lowers' },
  { item: 'Text is horizontal', effect: 'neutral' },
  { item: 'Data are labelled directly', effect: 'neutral' },
  { item: 'Labels are used sparingly', effect: 'raises' },
  { item: 'Proportions are accurate', effect: 'neutral' },
  { item: 'Data are intentionally ordered', effect: 'neutral' },
  { item: 'Axis intervals are equidistant', effect: 'neutral' },
  { item: 'Graph is two-dimensional', effect: 'raises' },
  { item: 'Display is free from decoration', effect: 'raises' },
  { item: 'Gridlines, if present, are muted', effect: 'raises' },
  { item: 'Graph has no border line', effect: 'raises' },
  { item: 'No unnecessary tick marks or axis lines', effect: 'raises' },
  { item: 'One horizontal and one vertical axis', effect: 'raises' },
  { item: 'Colour scheme is intentional', effect: 'neutral' },
  { item: 'Colour highlights key patterns', effect: 'lowers' },
  { item: 'Legible when printed in black and white', effect: 'neutral' },
  { item: 'Legible for people with colour-blindness', effect: 'neutral' },
  { item: 'Text contrasts with the background', effect: 'neutral' },
  { item: 'Highlights a significant finding', effect: 'lowers' },
  { item: 'Chart type suits the data', effect: 'neutral' },
  { item: 'Appropriate level of precision', effect: 'neutral' },
];
