import React, { useMemo } from 'react';
import { presetSpec } from '../../../ink/presets.ts';
import { useIsArticle } from '../../site/view.ts';
import ColourGrid from '../ColourGrid.tsx';
import { pct } from '../format.ts';
import Guess from '../Guess.tsx';
import ScrollStory from '../ScrollStory.tsx';
import StoryFigure, { usePointVerb } from '../StoryFigure.tsx';
import { useInkStatsList } from '../useInk.ts';

// The article's colour variations, in the order the story visits them. The rest are in the
// grid that follows the story.
const VARIANTS = ['A1', 'A1', 'B1', 'B2', 'C1'];

/** Paper isn't ink, but a colour painted on it is. */
const BackgroundStory: React.FC = () => {
  const { Verb } = usePointVerb();
  // In the article, each version is named, so it can be found in the grid of all eight.
  const article = useIsArticle();
  // These reproduce the article's colours, so they ignore the site theme.
  const specs = useMemo(() => VARIANTS.map((id) => presetSpec(id, false)), []);
  const stats = useInkStatsList(specs);
  const r = (i: number) => <strong className="font-bold tabular-nums text-echo">{pct(stats[i].ratio)}</strong>;

  const steps = [
    <Guess
      question="Suppose this chart’s white background turned pale blue. What would happen to the data-ink ratio?"
      options={[
        { value: 'up', label: 'It would go up' },
        { value: 'down', label: 'It would go down' },
        { value: 'same', label: 'It would stay the same' },
      ]}
      answer="same"
      reveal="The background is the paper the chart is printed on, and paper isn’t ink, whatever its colour."
    />,
    article ? <p>A1 has blue bars on white paper: {r(1)}.</p> : <p>Blue bars on white paper: {r(1)}.</p>,
    <p>
      {article ? 'B1 moves them onto pale blue paper' : 'On pale blue paper'}: exactly the same, {r(2)}. Nothing was added; only the
      paper changed.
    </p>,
    <p>
      {article ? 'B2 uses dark paper, and the ratio still doesn’t move' : 'Even on dark paper the ratio doesn’t move'}: {r(3)}. The
      text had to turn white to stay readable, though. Colour still matters to readers, even when it doesn’t change the ratio.
    </p>,
    <p>
      {article ? 'C1 paints' : 'Now paint'} a pale box behind the bars. That box is ink, non-data ink, and a lot of it: the ratio
      falls to {r(4)}.
      {!article && (
        <>
          {' '}
          <span className="text-content-2">({Verb} the box to see how much.)</span>
        </>
      )}
    </p>,
  ];

  return (
    <ScrollStory
      articleFigures={[{ after: 0, figure: <ColourGrid /> }]}
      label="The same chart with different background colours"
      steps={steps}
      figure={(step) => (
        <StoryFigure
          spec={specs[step]}
          stats={stats[step]}
          scale={Math.max(...stats.map((s) => s.total))}
          reference={step > 1 ? { label: 'blue on white', stats: stats[1] } : null}
          label={`Variation ${VARIANTS[step]} of the article’s chart.`}
        />
      )}
    />
  );
};

export default BackgroundStory;
