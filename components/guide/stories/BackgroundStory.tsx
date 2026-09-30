import React, { useMemo } from 'react';
import { presetSpec } from '../../../ink/presets.ts';
import { useIsArticle } from '../../site/view.ts';
import ChartPanels from '../ChartPanels.tsx';
import { pct } from '../format.ts';
import Guess from '../Guess.tsx';
import ScrollStory from '../ScrollStory.tsx';
import StoryFigure, { usePointVerb } from '../StoryFigure.tsx';
import { useInkStatsList } from '../useInk.ts';

// Lai and Morrison's colour variations, in the order the story visits them.
const VARIANTS = ['A1', 'A1', 'B1', 'B2', 'C1'];

/** Paper isn't ink, but a colour painted on it is. */
const BackgroundStory: React.FC = () => {
  const { Verb } = usePointVerb();
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
    <p>Blue bars on white paper: {r(1)}.</p>,
    <p>On pale blue paper: exactly the same, {r(2)}. Nothing was added; only the paper changed.</p>,
    <p>
      Even on dark paper the ratio doesn’t move: {r(3)}. The text had to turn white to stay readable, though. Colour still matters to
      readers, even when it doesn’t change the ratio.
    </p>,
    <p>
      Now paint a pale box behind the bars. That box is ink, non-data ink, and a lot of it: the ratio falls to {r(4)}.{' '}
      <span className="text-content-2">({Verb} the box to see how much.)</span>
    </p>,
  ];

  // The reading view shows the four versions side by side, after the paragraph that introduces them.
  const readingSteps = [
    <p>
      A chart’s background is the paper it’s printed on. Lai and Morrison show what that means by colouring one chart four ways.
    </p>,
    <p>
      On white paper the ratio is {r(1)}. On pale blue paper it’s exactly the same, {r(2)}: nothing was added; only the paper
      changed. Dark paper doesn’t move it either, {r(3)}, though the text had to turn white to stay readable. Colour still matters
      to readers, even when it doesn’t change the ratio.
    </p>,
    <p>
      The last version paints a pale box behind the bars instead. That box is ink, non-data ink, and a lot of it: the ratio falls to{' '}
      {r(4)}.
    </p>,
  ];

  const articleFigures = [
    {
      after: 0,
      figure: (
        <ChartPanels
          label="One chart on white, pale blue and dark paper, and with a painted plot area"
          panels={[
            { spec: specs[1], label: 'White paper' },
            { spec: specs[2], label: 'Pale blue paper' },
            { spec: specs[3], label: 'Dark paper' },
            { spec: specs[4], label: 'A painted plot area' },
          ]}
        />
      ),
    },
  ];

  return (
    <ScrollStory
      articleFigures={articleFigures}
      label="The same chart with different background colours"
      steps={article ? readingSteps : steps}
      figure={(step) => (
        <StoryFigure
          spec={specs[step]}
          stats={stats[step]}
          scale={Math.max(...stats.map((s) => s.total))}
          reference={step > 1 ? { label: 'blue on white', stats: stats[1] } : null}
          label={`Variation ${VARIANTS[step]} of Lai and Morrison’s chart.`}
        />
      )}
    />
  );
};

export default BackgroundStory;
