// The guide's parts, in reading order. The header's contents menu and progress use these ids.

export interface GuideSection {
  id: string;
  title: string;
  /** For the contents menu. */
  short: string;
}

export const SECTIONS: GuideSection[] = [
  { id: 'razor', title: 'How much of a chart is data?', short: 'Erase a chart' },
  { id: 'ink', title: 'Three kinds of ink', short: 'Three kinds of ink' },
  { id: 'bar-width', title: 'A bar’s width isn’t data', short: 'Bar width' },
  { id: 'background', title: 'The background is paper', short: 'Background' },
  { id: 'redundancy', title: 'Say it once', short: 'Say it once' },
  { id: 'type', title: 'Type costs attention, not ink', short: 'Type size' },
  { id: 'balance', title: 'Aim for the middle', short: 'Aim for the middle' },
  { id: 'your-turn', title: 'Your turn: fix this chart', short: 'Your turn' },
  { id: 'this-page', title: 'Now look at this page', short: 'This page' },
];
