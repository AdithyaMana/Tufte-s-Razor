// Design flaws from Lan & Liu's study of 2,000+ visualizations the public called out as
// "junk" (IEEE TVCG, 2025), with the direction "Balancing clarity and clutter" expects each
// to push the data-ink ratio relative to its optimal range.

export interface Flaw {
  name: string;
  description: string;
  category: string;
}

export const TOO_LOW: Flaw[] = [
  { name: 'Stylized effects on data marks', description: 'Shadows and heavy gradients make the data itself harder to read.', category: 'Low readability' },
  { name: 'Embellishment obscuring data', description: 'Decoration covers or overshadows the numbers.', category: 'Low readability' },
  { name: 'Several channels for one variable', description: 'Colour, size and shape all encoding the same thing.', category: 'Low coherence' },
  { name: 'Meaningless or confusing encoding', description: 'Visual choices the reader can’t decode.', category: 'Overcomplexity' },
  { name: 'Overused visual channels', description: 'So many cues that none stands out.', category: 'Overcomplexity' },
  { name: 'Too many units', description: 'Individual items drawn where a summary would do.', category: 'Overcomplexity' },
];

export const TOO_HIGH: Flaw[] = [
  { name: 'Text or marks too small', description: 'Little ink, but readers struggle to make out details.', category: 'Low readability' },
  { name: 'Overlapping data marks', description: 'Points hide each other, and patterns with them.', category: 'Low readability' },
  { name: 'Cluttered label lines', description: 'Leader lines crowd around the data.', category: 'Low readability' },
  { name: 'Dual axes', description: 'Two scales in one plot the reader must bridge.', category: 'Low coherence' },
  { name: 'Very high information density', description: 'Too much data packed into too little space.', category: 'Overcomplexity' },
];
