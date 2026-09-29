import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Epigraph, MarginNote, Prose, Quote, Section } from '../components/guide/Article.tsx';
import BarAnatomy from '../components/guide/BarAnatomy.tsx';
import BarWidthLab from '../components/guide/BarWidthLab.tsx';
import ChecklistColumns from '../components/guide/ChecklistColumns.tsx';
import ColourLab from '../components/guide/ColourLab.tsx';
import FlawSpectrum from '../components/guide/FlawSpectrum.tsx';
import FormulaBlock from '../components/guide/FormulaBlock.tsx';
import Hero from '../components/guide/Hero.tsx';
import Playground from '../components/guide/Playground.tsx';
import RedundancyLab from '../components/guide/RedundancyLab.tsx';
import TextSizeLab from '../components/guide/TextSizeLab.tsx';
import ThreeCharts from '../components/guide/ThreeCharts.tsx';
import { linkHandler, scrollToHash } from '../components/site/router.ts';

const GOLDILOCKS_URL = 'https://scienceux.org/articles/data-ink-ideal-vs-minimal';

const CONTENTS = [
  { id: 'ratio', title: 'Data-ink, and the ratio' },
  { id: 'screen', title: 'What counts as ink on a screen?' },
  { id: 'bar-width', title: 'The width of a bar is not data' },
  { id: 'redundancy', title: 'Say it once' },
  { id: 'text-size', title: 'Type has weight too' },
  { id: 'balance', title: 'A range, not a score' },
  { id: 'checklist', title: 'Most good advice leaves the ratio alone' },
  { id: 'playground', title: 'Playground' },
];

const sectionNumber = (id: string) => String(CONTENTS.findIndex((c) => c.id === id) + 1).padStart(2, '0');

const GuidePage: React.FC = () => {
  // Content renders after load, so the browser can't jump to a #section on its own.
  useEffect(() => {
    if (window.location.hash) requestAnimationFrame(() => scrollToHash(window.location.hash));
  }, []);

  return (
    <article className="pb-16">
      <Hero />

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-16 md:mt-24 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16 items-start">
        <Epigraph cite={<>Edward R. Tufte, <cite>The Visual Display of Quantitative Information</cite></>}>Above all else show the data.</Epigraph>
        <nav aria-label="Contents" className="font-sans">
          <p className="kicker mb-3">Contents</p>
          <ol className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2 text-sm">
            {CONTENTS.map((c, i) => (
              <li key={c.id} className="flex gap-2.5">
                <span className="tabular-nums text-muted">{String(i + 1).padStart(2, '0')}</span>
                <a href={`#${c.id}`} className="text-ink-2 hover:text-ink hover:underline underline-offset-4">
                  {c.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <Section id="ratio" number={sectionNumber('ratio')} title="Data-ink, and the ratio">
        <Prose
          notes={
            <>
              <MarginNote title="Within reason">
                Tufte’s own rules carry a qualifier that tends to get dropped: erase non-data-ink, and redundant data-ink, <em>within reason</em>.
              </MarginNote>
              <MarginNote title="About this guide">
                Adapted from <cite>Balancing clarity and clutter: the highs and lows of data-ink ratio in practice</cite> by Michael Lai and
                Mike Morrison. The charts recreate the article’s examples.
              </MarginNote>
            </>
          }
        >
          <p>
            In <cite>The Visual Display of Quantitative Information</cite>, Edward Tufte sorted the ink in a graphic into two kinds.{' '}
            <em>Data-ink</em> is “the non-erasable core of a graphic, the non-redundant ink arranged in response to variation in the numbers
            represented.” Everything else — frames, fills, gridlines, decoration — is non-data-ink. The data-ink ratio is the share of the
            first kind in the whole.
          </p>
        </Prose>
        <FormulaBlock />
        <Prose>
          <p>
            Two words carry most of the weight. <em>Non-redundant</em> means ink that repeats something already shown doesn’t count as
            data-ink, even when it is drawn in data colours. <em>Erased</em> gives a practical test: if a mark could vanish and the reader
            would still learn exactly the same numbers, it wasn’t data-ink.
          </p>
          <p>
            The idea is often boiled down to “delete everything”, then dismissed as impractical. The article behind this guide argues for a
            better reading. Some good design choices raise the ratio and others lower it, and a ratio that is too high hurts readers as
            surely as one that is too low. The aim is a value in the right range for your audience and purpose — and knowing which way each
            choice will push it.
          </p>
        </Prose>
      </Section>

      <Section id="screen" number={sectionNumber('screen')} title="What counts as ink on a screen?">
        <Prose
          notes={
            <MarginNote title="Why a hairline?">
              A bar shows its value with its length; a bar twice as wide shows the same number. So each bar is credited with the thinnest
              mark that still reads clearly — a 2 px line — and the rest counts as redundant. Change that allowance and the absolute numbers
              shift, but not the direction of any change.
            </MarginNote>
          }
        >
          <p>
            On paper the line is physical: ink is laid on paper, and the paper is not ink. A screen has no paper. A background pixel is lit
            just like a bar’s pixel, so we have to decide what counts.
          </p>
          <p>
            Following the article, treat the chart’s own background — white, near-black in dark mode, pale blue if that is what it sits on —
            as the paper, and count everything drawn on top of it. Recolour the paper and nothing changes. Paint a second colour over part of
            it, and that paint is ink. The ink then sorts into three kinds.
          </p>
        </Prose>
        <BarAnatomy />
        <Prose>
          <p>
            Every chart in this guide is drawn on a 640 × 400 canvas and counted pixel by pixel, one layer at a time. Anti-aliased edges
            count in part, and gridlines hidden behind bars don’t count at all, because nobody can see them. Below are the article’s eight
            colour variations of one chart. Pick one to inspect it.
          </p>
        </Prose>
        <ColourLab />
      </Section>

      <Section id="bar-width" number={sectionNumber('bar-width')} title="The width of a bar is not data">
        <Prose
          notes={
            <MarginNote title="Try this">
              Drag the slider to both ends, or click a point on either curve to jump there. Turn on the ink map to see the hairline inside
              each bar.
            </MarginNote>
          }
        >
          <p>
            A bar chart encodes each value as a length. The width of a bar carries no information at all, so only a hairline’s worth of
            each bar is data-ink, and every pixel of width beyond it is redundant.
          </p>
          <p>
            That leads to a result most people don’t expect. Widen the bars and the chart looks more data-heavy — yet its data-ink ratio
            falls, because the extra ink says nothing new. Narrow them and the ratio climbs, all the way to the hairline.
          </p>
        </Prose>
        <BarWidthLab />
        <Prose>
          <p>The ratio alone would have you stop at the hairline. The article’s three versions show why you shouldn’t:</p>
          <Quote>
            Wide bars with minimal gaps give “a low data-ink ratio and unnecessary visual clutter.” Bars with “sufficient whitespace around
            the bars to distinguish each category” strike a balance. Very thin bars earn “a very high data-ink ratio, but the distance
            between categories makes visual comparison more difficult.”
          </Quote>
          <p>
            The grey curve shows what many tools report instead: every data-coloured pixel, divided by all the ink. It rises as bars widen,
            rewarding exactly the ink that carries no information. The word <em>non-redundant</em> in Tufte’s definition is there to
            prevent that.
          </p>
        </Prose>
      </Section>

      <Section id="redundancy" number={sectionNumber('redundancy')} title="Say it once">
        <Prose>
          <p>
            Bar width is one kind of redundancy; labels and lines are another. The article’s example data has five categories but only
            three distinct values — 9, 7 and 5, with 7 appearing three times. A default chart still draws ten gridlines and eleven axis
            labels to describe them.
          </p>
          <p>
            Step through the article’s two revisions. In B, the gridlines and most axis labels go, and the values are printed on the bars
            so that no information is lost. In C, the bars are sorted and the axis labels only the values that actually occur.
          </p>
        </Prose>
        <RedundancyLab />
        <Prose>
          <p>
            Notice how modestly the ratio moves. The bars hold most of this chart’s ink, so trimming lines and labels shifts the total by
            only a few percent; the non-data ink row tells the bigger story, falling by more than half from A to B.
          </p>
          <p>
            Some redundancy earns its keep, too: a bar with its number beside it is quicker to read than either alone. The goal isn’t zero
            redundancy but knowing what each mark is for. Watch the warnings as you go. Turn off both the axis labels and the data labels
            and the reader no longer knows what the bars measure. That ink wasn’t erasable after all.
          </p>
        </Prose>
      </Section>

      <Section id="text-size" number={sectionNumber('text-size')} title="Type has weight too">
        <Prose>
          <p>
            Titles and labels are non-data ink: usually necessary, but not the data. In the article’s examples, larger type lowers the
            ratio “without necessarily adding to the visual clarity or improving comprehension,” and its added visual weight “takes focus
            off the data in the chart.” Smaller type raises the ratio, but “the reduced visual weight forces the reader to work harder to
            see the details.”
          </p>
        </Prose>
        <TextSizeLab />
        <Prose
          notes={
            <MarginNote title="Rule of thumb">
              Make titles larger than labels, and keep text no smaller than about 9 points at arm’s length (20 for a large room), as
              Evergreen’s checklist suggests.
            </MarginNote>
          }
        >
          <p>
            Count the pixels, though, and type turns out to be light: letters are mostly empty space. The article’s four variations move
            this chart’s ratio by only a couple of percent, in the directions it describes. What oversized type really costs is weight —
            how hard it pulls the eye from the data — and what undersized type costs is legibility. Neither shows up in a pixel count,
            which is why the warnings matter more here than the number.
          </p>
        </Prose>
      </Section>

      <Section id="balance" number={sectionNumber('balance')} title="A range, not a score">
        <Prose>
          <p>
            Every lever that raised the ratio above — thinner bars, fewer labels, smaller type — eventually made the chart harder to read.
            Push far enough and you reach a chart made of nothing but data-ink, which says nothing at all.
          </p>
          <p>
            An earlier ScienceUX article, <a href={GOLDILOCKS_URL}>The Story of Goldilocks and the Three Charts</a>, explores this idea: a
            high or low ratio isn’t good or bad in itself. What matters is finding the optimal range for your context, audience and
            objective.
          </p>
        </Prose>
        <ThreeCharts />
        <Prose>
          <p>
            So a chart can miss in either direction. The article maps design flaws from Lan and Liu’s study of visualizations the public
            called out as “junk” onto the ratio: some push it below its optimal range, others above it.
          </p>
        </Prose>
        <FlawSpectrum />
        <Prose>
          <p>
            The article also separates two ways of using the number. The <em>absolute</em> value describes a chart on its own: its
            information density, redundancy included, and its clutter, chartjunk included. The <em>relative</em> value compares a chart with
            a reference version of it — usually the more useful question while you revise. The playground below lets you pin a reference and
            compare.
          </p>
        </Prose>
      </Section>

      <Section id="checklist" number={sectionNumber('checklist')} title="Most good advice leaves the ratio alone">
        <Prose>
          <p>
            The article scored the 23 items of Stephanie Evergreen’s Data Visualization Checklist by how each typically moves the ratio.
            Seven raise it, three lower it, and thirteen make little difference: there are many ways to improve a chart without changing
            its density or clutter at all.
          </p>
        </Prose>
        <ChecklistColumns />
        <Prose>
          <p>
            Other rulebooks agree in spirit. Of the 25 rules in Wajdi Ben Saad’s GoldenViz, just one concerns chartjunk: that non-data ink
            should not distract the audience from the main information.
          </p>
        </Prose>
      </Section>

      <Section id="playground" number={sectionNumber('playground')} title="Playground">
        <Prose>
          <p>
            Every control from this guide, in one place. Start from any of the article’s figures, pin it as a reference, and see what each
            change does to the count — and what the warnings say it costs.
          </p>
        </Prose>
        <Playground />
      </Section>

      <section id="measure" className="max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="rounded-xl border border-rule p-6 md:p-10 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className="kicker">Beta</p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl tracking-tight text-ink">Measure your own chart</h2>
            <p className="mt-3 article text-ink-2 max-w-2xl">
              Our analyzer estimates the data-ink ratio of a chart image, pairing pixel-level colour analysis with an AI critique. Treat it
              as a starting point: from a picture alone, it can’t tell essential data-ink from redundant.
            </p>
          </div>
          <a
            href="/analyze"
            onClick={linkHandler('/analyze')}
            className="justify-self-start inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 font-sans text-sm font-medium text-paper hover:bg-ink/85 transition-colors"
          >
            Measure a chart <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="sources" aria-labelledby="sources-title" className="max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-20">
        <h2 id="sources-title" className="kicker">
          Sources
        </h2>
        <ol className="mt-4 grid gap-x-12 gap-y-3 md:grid-cols-2 font-sans text-[0.8125rem] leading-relaxed text-ink-2 max-w-5xl">
          <li>
            Michael Lai and Mike Morrison, <cite>Balancing clarity and clutter: the highs and lows of data-ink ratio in practice</cite>.
            ScienceUX Labs. The basis of this guide.
          </li>
          <li>
            ScienceUX Labs,{' '}
            <a className="underline underline-offset-2 hover:text-ink" href={GOLDILOCKS_URL}>
              <cite>The Story of Goldilocks and the Three Charts</cite>
            </a>
            . The earlier article on finding the right range.
          </li>
          <li>
            Edward R. Tufte, <cite>The Visual Display of Quantitative Information</cite>. Graphics Press, 1983; second edition 2001.
          </li>
          <li>
            X. Lan and Y. Liu, “‘I Came Across a Junk’: Understanding Design Flaws of Data Visualization from the Public’s Perspective.”{' '}
            <cite>IEEE Transactions on Visualization and Computer Graphics</cite> 31(1), 2025, 393–403.{' '}
            <a className="underline underline-offset-2 hover:text-ink" href="https://doi.org/10.1109/TVCG.2024.3456341">
              doi:10.1109/TVCG.2024.3456341
            </a>
            ; examples at{' '}
            <a className="underline underline-offset-2 hover:text-ink" href="https://flawviz.github.io/">
              flawviz.github.io
            </a>
            .
          </li>
          <li>Stephanie Evergreen, <cite>Data Visualization Checklist</cite>.</li>
          <li>Wajdi Ben Saad, <cite>GoldenViz</cite>: 25 rules for data visualization.</li>
          <li>
            Set in ET Book, by Dmitry Krasny, Bonnie Scranton and Edward Tufte (MIT licence), and Inter.
          </li>
        </ol>
      </section>
    </article>
  );
};

export default GuidePage;
