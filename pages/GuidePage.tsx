import React, { useEffect } from 'react';
import { PUBLISH_CHECKS } from '../content/publish.ts';
import { SECTIONS, sectionTitle } from '../content/sections.ts';
import { MarginNote, Prose, Section } from '../components/guide/Article.tsx';
import BarWidthLab from '../components/guide/BarWidthLab.tsx';
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
import ThreeCharts, { RelativeValueNote } from '../components/guide/ThreeCharts.tsx';
import { scrollToHash } from '../components/site/router.ts';
import { useIsArticle } from '../components/site/view.ts';

const GOLDILOCKS_URL = 'https://scienceux.org/articles/data-ink-ideal-vs-minimal';

/** "Part 3 of 9", for the section with this id. */
function partOf(id: string): string {
  return `Part ${SECTIONS.findIndex((s) => s.id === id) + 1} of ${SECTIONS.length}`;
}


/** A small heading inside a section, e.g. over a hands-on figure that follows a story. */
const SubHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = 'mt-4' }) => (
  <h3 className={`font-serif text-2xl md:text-[1.75rem] leading-tight text-content ${className}`}>{children}</h3>
);

const GuidePage: React.FC = () => {
  const article = useIsArticle();
  const title = (id: string) => sectionTitle(SECTIONS.find((s) => s.id === id)!, article);
  // Room between a scroll story's pinned chart and whatever follows it; the reading view just flows on.
  const afterStory = article ? 'mt-6' : 'mt-16 md:mt-28';
  // Content renders after load, so the browser can't jump to a #section on its own.
  useEffect(() => {
    if (window.location.hash) requestAnimationFrame(() => scrollToHash(window.location.hash));
  }, []);

  return (
    <article id="guide">
      <RazorStory />

      <Section id="ink" part={partOf('ink')} title={title('ink')} lead="And be aware of what is paper and what is ink">
        <InkKindsStory />
        <Prose
          className={afterStory}
          notes={
            <MarginNote title="Why a thin line?">
              Each bar is credited with the least ink that could show its value: a line 2 px wide. Change that allowance and every
              percentage shifts, but every comparison in this guide stays the same.
            </MarginNote>
          }
        >
          <p>
            Tufte called data-ink “the non-erasable core of a graphic, the non-redundant ink arranged in response to variation in the
            numbers represented.” That has two parts. Data-ink can’t be erased without losing information, <em>and</em> it changes
            when the values being represented changes.
          </p>
          <p>
            Strictly, a title and labels fail the second part: a bar’s name stays the same whatever its value. But erase them and
            the reader loses information they need, so this guide counts them as data-ink, and we use two simple questions to
            determine what type of ink it is: 1) Does it tell the reader something about the data? 2) And it is saying something
            that is already present somewhere else, so removing it won't result in the loss of information? The thin line down
            each bar, the title and the axis labels tell the reader something nothing else says: data-ink. The rest of each bar’s
            width, and numbers that repeat the axis, say it again: redundant data-ink. Shading, gridlines, borders and axis lines
            say nothing about the numbers themselves: non-data ink.
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
        lead="A bar represents a value with its height. Widening a bar uses more ink to encode the same value."
      >
        <BarWidthStory />
        {!article && <SubHeading className={afterStory}>Try any width</SubHeading>}
        <BarWidthLab />
      </Section>

      <Section
        id="background"
        part={partOf('background')}
        title={title('background')}
        lead="Its colour doesn’t count. A colour painted on top of it does."
      >
        <BackgroundStory />
        <Prose className={afterStory}>
          <p>
            A note on how this guide counts. It checks whether a pixel is inked, not how dark it is, so a faint tint costs as much as
            solid blue. Muting a gridline helps the reader but leaves the ratio alone. The paper is whatever colour sits at the back.
            That’s fair on a screen, where every colour costs the same, but in print a dark background would use the most ink of all.
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
        lead="The title and labels are data-ink, so bigger type raises the ratio. It also pulls the eye away from the bars."
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
        <Prose notes={<RelativeValueNote />}>
          <p>
            A ratio isn’t good or bad on its own. The right range depends on who’s reading and why, the case ScienceUX made in{' '}
            <a href={GOLDILOCKS_URL}>The Story of Goldilocks and the Three Charts</a>. So compare versions of one chart, as above,
            instead of grading a chart by itself. Lai and Morrison call this the <em>relative value</em>.
          </p>
          <p>These are the design flaws that most often push a chart out of that range, in one direction or the other.</p>
        </Prose>
        <FlawSpectrum />
      </Section>


      <Section
        id="your-turn"
        part={partOf('your-turn')}
        title={title('your-turn')}
        lead={
          article
            ? 'Everything in this guide, applied to the cluttered chart from Part 1.'
            : 'Everything in this guide, on one cluttered chart. Clean it up without losing anything a reader needs.'
        }
      >
        <FixChart />
      </Section>

      <Section
        id="checklist"
        part={partOf('checklist')}
        title={title('checklist')}
        lead="The whole guide as a list to check any bar chart against, including what the ratio can’t measure."
      >
        <ol className="article max-w-[38rem] space-y-5 list-none pl-0">
          {PUBLISH_CHECKS.map((check, i) => (
            <li key={check.text} className="grid grid-cols-[2rem_minmax(0,1fr)]">
              <span className="font-sans text-sm tabular-nums text-content-2 pt-1">{i + 1}</span>
              <div>
                <p className="text-content">{check.text}</p>
                <p className="mt-0.5 font-sans text-[0.875rem] leading-relaxed text-content-2">{check.why}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="this-page" part={partOf('this-page')} title={title('this-page')} lead="One last chart, of a kind.">
        <PageReveal />
      </Section>

      <section id="sources" aria-labelledby="sources-title" className="max-w-6xl mx-auto px-4 md:px-8 pt-16">
        <h2 className="kicker">Credits</h2>
        <p className="mt-3 mb-10 font-sans text-xs leading-relaxed text-content-2">
          Made by Adithya Manavalan, Michael Lai and Mike Morrison, ScienceUX Labs.
        </p>
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
