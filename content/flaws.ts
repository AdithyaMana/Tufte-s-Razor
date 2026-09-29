// Design flaws from Lan & Liu's study of 2,000+ visualizations the public called out as
// "junk" (IEEE TVCG, 2025), with the direction "Balancing clarity and clutter" expects each
// to push the data-ink ratio relative to its optimal range.

export interface Flaw {
  name: string;
  description: string;
  category: string;
  /** What to do instead, in a line. */
  fix: string;
  /** Why the ratio can't register this flaw, when it's about perception rather than ink. */
  ratioBlind?: string;
}

export const TOO_LOW: Flaw[] = [
  { name: 'Stylized effects on data marks', description: 'Shadows and heavy gradients make the data itself harder to read.', category: 'Low readability', fix: 'Flat bars in one colour. Depth and shine add nothing to a length.' },
  { name: 'Embellishment obscuring data', description: 'Decoration covers or overshadows the numbers.', category: 'Low readability', fix: 'Put the picture beside the chart, never on top of the data.' },
  { name: 'Several channels for one variable', description: 'Colour, size and shape all encoding the same thing.', category: 'Low coherence', fix: 'Let length alone carry the value; keep width and colour the same.' },
  { name: 'Meaningless or confusing encoding', description: 'Visual choices the reader can’t decode.', category: 'Overcomplexity', fix: 'One colour for every bar. Add a second only to point at something.' },
  { name: 'Overused visual channels', description: 'So many cues that none stands out.', category: 'Overcomplexity', fix: 'Encode each variable once, and only the variables you need.' },
  { name: 'Too many units', description: 'Individual items drawn where a summary would do.', category: 'Overcomplexity', fix: 'Draw the total as one bar. Show single units only when counting them is the point.' },
];

export const TOO_HIGH: Flaw[] = [
  { name: 'Text or marks too small', description: 'Little ink, but readers struggle to make out details.', category: 'Low readability', fix: 'Labels you can read at arm’s length, and bars wide enough to see.' },
  { name: 'Overlapping data marks', description: 'Points hide each other, and patterns with them.', category: 'Low readability', fix: 'Smaller or see-through points, or summarise them in bins.', ratioBlind: 'Hidden points use no ink, so a counter can’t see what overlap costs. Only a reader can.' },
  { name: 'Cluttered label lines', description: 'Leader lines crowd around the data.', category: 'Low readability', fix: 'Label beside the marks, or swap the pie for sorted bars.' },
  { name: 'Dual axes', description: 'Two scales in one plot the reader must bridge.', category: 'Low coherence', fix: 'Two charts side by side, sharing the horizontal axis.', ratioBlind: 'A second axis costs little ink. The cost is in the reader’s head, bridging two scales.' },
  { name: 'Very high information density', description: 'Too much data packed into too little space.', category: 'Overcomplexity', fix: 'Highlight the series that matters and grey the rest, or split into small multiples.', ratioBlind: 'Tufte counts density as a separate measure, and argues for more of it. The problem here is crowding, not the ratio.' },
];
