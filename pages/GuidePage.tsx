import React, { useEffect } from 'react';
import { SECTIONS } from '../content/sections.ts';
import { MarginNote, Prose, Section } from '../components/guide/Article.tsx';
import BarWidthLab from '../components/guide/BarWidthLab.tsx';
import ColourGrid from '../components/guide/ColourGrid.tsx';
import { More } from '../components/guide/controls.tsx';
import FixChart from '../components/guide/FixChart.tsx';
import FlawSpectrum from '../components/guide/FlawSpectrum.tsx';
import PageReveal from '../components/guide/PageReveal.tsx';
import BackgroundStory from '../components/guide/stories/BackgroundStory.tsx';
import BarWidthStory from '../components/guide/stories/BarWidthStory.tsx';
import InkKindsStory from '../components/guide/stories/InkKindsStory.tsx';
import RazorStory from '../components/guide/stories/RazorStory.tsx';
import RedundancyStory from '../components/guide/stories/RedundancyStory.tsx';
import TypeStory from '../components/guide/stories/TypeStory.tsx';
import ThreeCharts from '../components/guide/ThreeCharts.tsx';
import { scrollToHash } from '../components/site/router.ts';
import { useIsArticle } from '../components/site/view.ts';

const GOLDILOCKS_URL = 'https://scienceux.org/articles/data-ink-ideal-vs-minimal';

/** "Part 3 of 9", for the section with this id. */
function partOf(id: string): string {
  return `Part ${SECTIONS.findIndex((s) => s.id === id) + 1} of ${SECTIONS.length}`;
}

const title = (id: string) => SECTIONS.find((s) => s.id === id)!.title;

/** A small heading inside a section, e.g. over a hands-on figure that follows a story. */
const SubHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="mt-4 font-serif text-2xl md:text-[1.75rem] leading-tight text-content">{children}</h3>
);

const GuidePage: React.FC = () => {
  const article = useIsArticle();
  // Content renders after load, so the browser can't jump to a #section on its own.
  useEffect(() => {
    if (window.location.hash) requestAnimationFrame(() => scrollToHash(window.location.hash));
  }, []);

  return (
    <article id="guide">
      <RazorStory />

      <Section id="ink" part={partOf('ink')} title="Every mark is one of three kinds of ink" lead="Plus the paper, which isn’t ink at all.">
        <InkKindsStory />
        <Prose
          notes={
            <MarginNote title="Why a thin line?">
              Each bar is credited with the least ink that could show its value: a line 2 px wide. Change that allowance and every
              percentage shifts, but every comparison in this guide stays the same.
            </MarginNote>
          }
        >
          <p>
            Tufte called data-ink “the non-erasable core of a graphic, the non-redundant ink arranged in response to variation in the
            numbers represented.” The test is simple: if you could erase a mark and the reader would still learn exactly the same
            numbers, it wasn’t data-ink.
          </p>
          <More label="Tufte’s full definition" className="mt-5">
            <div className="space-y-1.5 font-serif text-lg leading-snug text-content-2">
              <p>Data-ink ratio = data-ink ÷ total ink used to print the graphic</p>
              <p>= proportion of a graphic’s ink devoted to the non-redundant display of data-information</p>
              <p>= 1.0 − proportion of a graphic that can be erased without loss of data-information</p>
              <p className="pt-1 font-sans text-xs text-content-2">
                Edward R. Tufte, <cite>The Visual Display of Quantitative Information</cite> (1983)
              </p>
            </div>
          </More>
        </Prose>
      </Section>

      <Section
        id="bar-width"
        part={partOf('bar-width')}
        title={title('bar-width')}
        lead="A bar shows its value by its length. Extra width adds ink, not information."
      >
        <BarWidthStory />
        {!article && <SubHeading>Try any width</SubHeading>}
        <BarWidthLab />
      </Section>

      <Section
        id="background"
        part={partOf('background')}
        title={title('background')}
        lead="Its colour doesn’t count. A colour painted on top of it does."
      >
        <BackgroundStory />
        {/* The article view shows the grid within the story. */}
        {!article && (
          <>
            <SubHeading>All eight of the article’s versions</SubHeading>
            <ColourGrid className="mt-6 md:mt-8" />
          </>
        )}
        <Prose>
          <p>
            A1, B1 and B2 score the same: only the paper changed. C1, C2 and D1 also match each other, because each paints a whole
            plot area, which costs far more ink than a thin box (A2) or outlines (D2).
          </p>
        </Prose>
      </Section>

      <Section
        id="redundancy"
        part={partOf('redundancy')}
        title={title('redundancy')}
        lead="A default chart often says each value three ways: a gridline, an axis label and the bar itself."
      >
        <RedundancyStory />
      </Section>

      <Section
        id="type"
        part={partOf('type')}
        title={title('type')}
        lead="Letters are mostly empty space, so resizing them barely moves the ratio. What changes is how hard the text pulls at the eye."
      >
        <TypeStory />
      </Section>

      <Section
        id="balance"
        part={partOf('balance')}
        title={title('balance')}
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
            So compare versions of a chart rather than grading one on its own; the article calls this the <em>relative value</em>.{' '}
            {article
              ? 'The interactive guide lets you try it, in free play at the end.'
              : 'You can try it in free play, at the end of this guide.'}
          </p>
        </Prose>
      </Section>


      <Section
        id="your-turn"
        part={partOf('your-turn')}
        title={title('your-turn')}
        lead={
          article
            ? 'Everything in this guide, applied to one cluttered chart.'
            : 'Everything in this guide, on one cluttered chart. Clean it up without losing anything a reader needs.'
        }
      >
        <FixChart />
      </Section>

      <Section id="this-page" part={partOf('this-page')} title={title('this-page')} lead="One last chart, of a kind.">
        <PageReveal />
      </Section>

      <section id="sources" aria-labelledby="sources-title" className="max-w-6xl mx-auto px-4 md:px-8 pt-16">
        <h2 id="sources-title" className="kicker">
          Sources
        </h2>
        <ol className="mt-3 grid gap-x-5 lg:gap-x-8 gap-y-2.5 md:grid-cols-2 font-sans text-xs leading-relaxed text-content-2">
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
          <li>Set in ET Book, by Dmitry Krasny, Bonnie Scranton and Edward Tufte (MIT licence), and Inter.</li>
        </ol>
      </section>
    </article>
  );
};

export default GuidePage;
