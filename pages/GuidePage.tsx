import React, { useEffect } from 'react';
import { MarginNote, Prose, Quote, Section } from '../components/guide/Article.tsx';
import BarAnatomy from '../components/guide/BarAnatomy.tsx';
import BarWidthLab from '../components/guide/BarWidthLab.tsx';
import ChecklistColumns from '../components/guide/ChecklistColumns.tsx';
import ColourGrid from '../components/guide/ColourGrid.tsx';
import { More } from '../components/guide/controls.tsx';
import FlawSpectrum from '../components/guide/FlawSpectrum.tsx';
import Playground from '../components/guide/Playground.tsx';
import RazorHero from '../components/guide/RazorHero.tsx';
import RedundancyLab from '../components/guide/RedundancyLab.tsx';
import ThreeCharts from '../components/guide/ThreeCharts.tsx';
import TypeLab from '../components/guide/TypeLab.tsx';
import { linkHandler, scrollToHash } from '../components/site/router.ts';

const GOLDILOCKS_URL = 'https://scienceux.org/articles/data-ink-ideal-vs-minimal';

const CONTENTS = [
  { id: 'ink', title: 'Three kinds of ink' },
  { id: 'bar-width', title: 'A bar’s width isn’t data' },
  { id: 'background', title: 'The background is paper' },
  { id: 'redundancy', title: 'Say it once' },
  { id: 'type', title: 'Type costs attention' },
  { id: 'balance', title: 'Aim for the middle' },
  { id: 'checklist', title: 'Most advice leaves it alone' },
  { id: 'playground', title: 'Playground' },
];

/** The ratio in words, with Tufte's own three-part definition one click away. */
const Equation: React.FC = () => (
  <div className="my-10 md:my-14">
    <p className="font-serif text-[1.65rem] md:text-4xl leading-snug text-content">
      Data-ink ratio <span className="text-content-2">=</span> data-ink <span className="text-content-2">÷</span> all the ink
    </p>
    <More label="Tufte’s full definition" className="mt-3">
      <div className="max-w-2xl space-y-1.5 font-serif text-lg leading-snug text-content-2">
        <p>= data-ink ÷ total ink used to print the graphic</p>
        <p>= proportion of a graphic’s ink devoted to the non-redundant display of data-information</p>
        <p>= 1.0 − proportion of a graphic that can be erased without loss of data-information</p>
        <p className="pt-1 font-sans text-xs text-content-2">
          Edward R. Tufte, <cite>The Visual Display of Quantitative Information</cite> (1983)
        </p>
      </div>
    </More>
  </div>
);

const GuidePage: React.FC = () => {
  // Content renders after load, so the browser can't jump to a #section on its own.
  useEffect(() => {
    if (window.location.hash) requestAnimationFrame(() => scrollToHash(window.location.hash));
  }, []);

  return (
    <article>
      <RazorHero />

      <nav aria-label="In this guide" className="max-w-6xl mx-auto px-4 md:px-8 font-sans">
        <p className="kicker mb-2">In this guide</p>
        <ol className="flex flex-wrap gap-x-5 gap-y-1.5 text-[0.8125rem]">
          {CONTENTS.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="rounded-sm text-repeat hover:text-content hover:underline underline-offset-4">
                {c.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Section id="ink" title="Every pixel is one of three kinds of ink" lead="Plus the paper, which isn’t ink at all.">
        <BarAnatomy />
        <Equation />
        <Prose
          notes={
            <MarginNote title="See it everywhere">
              Switch on the ink map at the top of the page. Every chart turns into these colours, and so does this page: its words
              are the data, and its menus, controls and rules are non-data ink.
            </MarginNote>
          }
        >
          <p>
            Tufte called data-ink “the non-erasable core of a graphic, the non-redundant ink arranged in response to variation in the
            numbers represented.” The test is simple: if you could erase a mark and the reader would still learn exactly the same
            numbers, it wasn’t data-ink.
          </p>
          <p>
            On a screen, the paper is whatever colour the chart sits on: white, black in dark mode, pale blue. Its colour never
            counts. Anything painted on top of it does.
          </p>
        </Prose>
      </Section>

      <Section
        id="bar-width"
        title="A bar’s width isn’t data"
        lead="A bar shows its value by its length. A wider bar adds ink, not information, so the ratio falls."
      >
        <BarWidthLab />
        <Prose
          notes={
            <MarginNote title="Why a hairline?">
              Each bar is credited with the least ink that could show its value: a 2 px line. Change that allowance and the
              percentages shift, but every direction on this page stays the same.
            </MarginNote>
          }
        >
          <p>
            The ratio alone would send you all the way to a hairline, but look at the chart when you get there. The article’s
            examples show the trade-off:
          </p>
          <Quote>Wide bars add “unnecessary visual clutter.” Very thin bars make “visual comparison more difficult.”</Quote>
          <p>The widths in between are the easiest to read.</p>
        </Prose>
      </Section>

      <Section id="background" title="The background is paper" lead="Its colour doesn’t count. A second colour painted on top of it does.">
        <ColourGrid />
        <Prose>
          <p>
            A1, B1 and B2 score the same: only the paper changed. C1, C2 and D1 also match, because each one paints a whole plot
            area, which costs far more ink than a thin box (A2) or an outline (D2).
          </p>
        </Prose>
      </Section>

      <Section
        id="redundancy"
        title="Say it once"
        lead="Five bars, three distinct values: 9, 7 and 5. A default chart describes them with ten gridlines and eleven axis labels."
      >
        <RedundancyLab />
        <Prose>
          <p>
            The ratio moves only a little here, because the bars hold most of this chart’s ink. Open “Show the count” and the
            non-data ink falls by more than half from A to B.
          </p>
          <p>
            D is a warning. Take away every value label and the ratio still rises, but the chart stops saying anything: that ink was
            doing a job.
          </p>
        </Prose>
      </Section>

      <Section
        id="type"
        title="Type costs attention, not ink"
        lead="Letters are mostly empty space, so resizing them barely moves the ratio. What changes is how hard the text pulls at the eye."
      >
        <TypeLab />
        <Prose>
          <p>
            In the article’s examples, bigger type adds weight that “takes focus off the data in the chart,” and smaller type forces
            “the reader to work harder to see the details.” Keep titles larger than labels, and no text smaller than about 9 points at
            arm’s length.
          </p>
        </Prose>
      </Section>

      <Section
        id="balance"
        title="Aim for the middle"
        lead="A higher ratio isn’t always better. Too much ink buries the data; too little leaves the reader guessing."
      >
        <ThreeCharts />
        <Prose>
          <p>
            An earlier ScienceUX article, <a href={GOLDILOCKS_URL}>The Story of Goldilocks and the Three Charts</a>, makes the case: a
            high or low ratio isn’t good or bad in itself. What matters is the right range for your context, audience and objective.
            Design flaws can push a chart out of that range either way.
          </p>
        </Prose>
        <FlawSpectrum />
        <Prose>
          <p>
            So compare versions of a chart rather than grading one on its own; the article calls this the relative value. Pin a
            reference in the playground to try it.
          </p>
        </Prose>
      </Section>

      <Section
        id="checklist"
        title="Most good advice leaves the ratio alone"
        lead="Of the 23 items on Stephanie Evergreen’s Data Visualization Checklist, 7 raise the ratio, 3 lower it and 13 barely touch it."
      >
        <ChecklistColumns />
        <Prose>
          <p>
            There are many ways to improve a chart without changing its density or clutter at all. Of the 25 rules in Wajdi Ben
            Saad’s GoldenViz, just one concerns chartjunk: that non-data ink should not distract from the main information.
          </p>
        </Prose>
      </Section>

      <Section
        id="playground"
        title="Playground"
        lead="Every control from this guide in one place. Start from any of the article’s charts, pin it, and compare."
      >
        <Playground />
      </Section>

      <section id="measure" className="max-w-6xl mx-auto px-4 md:px-8 pt-20 md:pt-28">
        <p className="article max-w-2xl">
          Have a chart of your own?{' '}
          <a href="/analyze" onClick={linkHandler('/analyze')}>
            Measure it
          </a>{' '}
          with the beta analyzer, which estimates the ratio from an image and adds an AI critique. From a picture alone it can’t
          tell data-ink from repeated data-ink, so treat its number as a starting point.
        </p>
      </section>

      <section id="sources" aria-labelledby="sources-title" className="max-w-6xl mx-auto px-4 md:px-8 pt-16">
        <h2 id="sources-title" className="kicker">
          Sources
        </h2>
        <ol className="mt-3 grid gap-x-12 gap-y-2.5 md:grid-cols-2 font-sans text-xs leading-relaxed text-content-2 max-w-5xl">
          <li>
            Michael Lai and Mike Morrison, <cite>Balancing clarity and clutter: the highs and lows of data-ink ratio in practice</cite>.
            ScienceUX Labs. The basis of this guide.
          </li>
          <li>
            ScienceUX Labs,{' '}
            <a className="underline underline-offset-2 hover:text-content" href={GOLDILOCKS_URL}>
              <cite>The Story of Goldilocks and the Three Charts</cite>
            </a>
            .
          </li>
          <li>
            Edward R. Tufte, <cite>The Visual Display of Quantitative Information</cite>. Graphics Press, 1983; second edition 2001.
          </li>
          <li>
            X. Lan and Y. Liu, “‘I Came Across a Junk’: Understanding Design Flaws of Data Visualization from the Public’s Perspective.”{' '}
            <cite>IEEE Transactions on Visualization and Computer Graphics</cite> 31(1), 2025, 393–403.{' '}
            <a className="underline underline-offset-2 hover:text-content" href="https://doi.org/10.1109/TVCG.2024.3456341">
              doi:10.1109/TVCG.2024.3456341
            </a>
            ; examples at{' '}
            <a className="underline underline-offset-2 hover:text-content" href="https://flawviz.github.io/">
              flawviz.github.io
            </a>
            .
          </li>
          <li>
            Stephanie Evergreen, <cite>Data Visualization Checklist</cite>. Wajdi Ben Saad, <cite>GoldenViz</cite>.
          </li>
          <li>Set in ET Book, by Dmitry Krasny, Bonnie Scranton and Edward Tufte (MIT licence), and Inter.</li>
        </ol>
      </section>
    </article>
  );
};

export default GuidePage;
