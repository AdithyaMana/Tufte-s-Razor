# ✂️ Tufte's Razor

> *"Above all else show the data."* — Edward Tufte

**Tufte's Razor** is an interactive guide to Edward Tufte's **data-ink ratio**: how much of a chart's ink actually shows data, why that number moves the way it does, and why it is a range to aim for rather than a score to max out.

The guide is a set of short **scroll-driven stories**: a chart stays in view while the text beside it scrolls, and each step changes the chart. Every chart is drawn on a canvas and **counted pixel by pixel** as it changes, so the ink is sorted into data-ink, repeated data-ink and non-data ink in real time. Readers guess before each surprise, point at any part of a chart to see what kind of ink it is, and finish by fixing a cluttered chart themselves. Anyone who would rather just read can switch to a reading view of the same guide.

The guide is adapted from *Balancing clarity and clutter: the highs and lows of data-ink ratio in practice* by Michael Lai and Mike Morrison, and recreates that article's examples.

---

## ✨ What's inside

### The guide (`/`)

Ten parts, each a headline, one sentence, then a story or figure that shows it:

| Part | What the reader does |
|---|---|
| 1. How much of a chart is data? | Guesses which way the ratio moves when the background goes, sees it as an ink map, then scrolls to erase it one cut at a time, until one cut goes too far |
| 2. Three kinds of ink | Each kind picked out on one chart in turn, then the equation, then free inspection |
| 3. A bar's width isn't data | Guesses which way the ratio moves as bars widen; wide, thin, hairline and balanced bars; then a slider and the ratio at every width |
| 4. The background is paper | Guesses whether a background colour counts; the same chart on white, pale blue and dark paper, then with a painted plot area |
| 5. Say it once | The article's label and gridline revisions, plus one step too far |
| 6. Size type for the reader, not the ratio | Guesses which way bigger type moves the ratio (it rises: text is data-ink); bigger, smaller, and back |
| 7. Aim for the middle | Three charts from too low to too high, then a slideshow of each design flaw that pushes the ratio one way or the other, with what to do instead |
| 8. Your turn: fix this chart | Cleans up the cluttered chart against seven goals (halve the non-data ink and give it a title that states the finding, without losing values, names, comparability, legible text or contrast), with a hint on request that follows what's still missing; then free play with the article's charts as presets and a pinned reference |
| 9. Before you publish | The guide as a checklist, including what the ratio can't measure |
| 10. Now look at this page | Reveals the page's own ink, as an analogy |

### How it reads

- **Scroll stories.** On wide screens the text runs on the left and the chart sticks on the right; on phones the chart sticks under the header and the text scrolls up beneath it. Every step stays on the page, so nothing is hidden from people who skim, search or use a screen reader, and dots under the chart jump back to any step.
- **Guess first.** Before each counter-intuitive result the reader predicts it. Nothing waits on the guess: scrolling on shows the answer anyway.
- **Point to inspect.** Hover, tap or arrow-key through any chart's parts. The part is picked out in its ink colour while the rest fades, with its name, kind of ink, pixel count and share of the chart's ink.
- **Where am I.** The opening says what's ahead (9 short parts, about 15 minutes). A reading-progress line runs under the header, and a contents button at the foot of the screen (tucked away while scrolling down) shows the part being read (3/9), jumps to any part and ticks off the ones already read. Any chart can be enlarged to fill the screen.
- **Detail on demand.** Plain language first; pixel counts, Tufte's full definition and the naive measure sit behind disclosures.
- **Or just read.** The header's Interactive switch (and a link in the opening) turns the whole guide into a reading view. Each part has its own text, written as prose rather than as steps: no guesses, no pointing, every chart introduced before it appears and placed as a still figure, and disclosures open. Part 8 becomes a worked example instead of a challenge. The choice is remembered, links can open it directly with `?view=article`, and switching keeps the reader in the same part.

### The page's own ink

At the end of the guide the reader can reveal the page's own ink: its words are data-ink, the numbers that repeat a chart are repeated ink, and menus, controls and rules are non-data ink. It is labelled as an analogy, not a measurement.

## 🎨 Design: the site follows its own rule

The site is built the way the guide says charts should be:

- **The paper isn't ink.** Charts are drawn on the page's own paper colour, in light and dark mode.
- **Content is the data.** No cards, frames, shadows or decorative icons. Whitespace, alignment and type (ET Book) do the structuring.
- **Chrome is kept to what still works.** Controls are quiet (hairline borders, no fills until chosen) but never smaller than a finger: segmented buttons and on/off chips are about 40 px tall, and detail sits behind "Show the count" and similar disclosures.
- **Colour is for data.** The only colours are the charts' and the three ink-map colours (validated for colour-vision deficiency in both themes). Everything else is ink on paper.
- **Within reason.** Controls still look like controls, and every chart keeps the labels it needs.

Design tokens in [`index.css`](index.css) are named by role (`content`, `echo`, `chrome`, `line`, `paper`), which is exactly the split the page's ink map recolours.

## 🧮 How the counting works

The engine lives in [`ink/`](ink):

- **The chart's background is the paper.** Whatever its colour (white, dark mode, pale blue), it is never ink. Any fill painted on top of it, such as a shaded plot area, is.
- **Two questions sort every mark**: does it tell the reader something about the data, and is that already said somewhere else, so erasing it loses nothing?
- **Data-ink is the least ink that shows each value**, a 2 px hairline the length of each bar, **plus the title, axis labels and category labels**, which say what the values are. Erase them and the reader loses information.
- **Repeated (redundant) data-ink**: a bar's value lives in its length, so every pixel of width beyond the hairline repeats the same number, as do bar outlines. Values printed on the bars repeat the labelled axis; on a chart with no axis labels they are the only place the values are written, so they count as data-ink (`groupKind` in [`ink/render.ts`](ink/render.ts)).
- **Non-data ink** is everything else that is drawn: axis lines, ticks, gridlines, borders and fills.
- **Hidden ink doesn't count.** Each chart is drawn once, offscreen at 480 × 300 (a spreadsheet's default chart size, so default type looks as it does in a spreadsheet and stays readable on a phone), with each kind of ink in its own colour channel (data red, redundant green, non-data blue). Ordinary paint compositing then gives each pixel to whatever is visible on top, anti-aliased edges count fractionally, and one pass over the image data adds it all up (`sumChannels` in [`ink/measure.ts`](ink/measure.ts)).
- **Bars keep their pixel width when labels change**, so a label change never also changes how much redundant bar ink there is.
- **Every mark belongs to one of eleven ink groups** (plot fill, gridlines, borders, axes, bar width, outlines, hairlines, title, axis labels, category labels, values on bars). Pointing at a chart hit-tests those groups geometrically ([`ink/inspect.ts`](ink/inspect.ts)); each group's visible pixels are counted three at a time, one per colour channel, while the other groups only erase what they cover (`measureGroups`). The same trick draws a highlighted part exactly where it is visible.

The **data-ink ratio** shown everywhere is the simplest version: ink used to show the data ÷ all the ink used in the chart, leaving repeated data-ink out of the top. The naive share (all data-coloured ink ÷ total ink) is available beside it, because the two move in opposite directions as bars widen.

Absolute values depend on these counting rules; the direction and size of each change are what the guide is about.

## 🛠️ Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 3 (built with PostCSS) |
| Charts | Canvas 2D (specimens and counting), hand-built SVG (explanatory charts) |
| Typography | ET Book (self-hosted, MIT) and Inter |
| Icons | Lucide React |
| Tests | Vitest |
| Server | A static site: Vite 6 in development; a small Express 5 server serves the build |
| Runtime | Node.js, tsx |

## 🚀 Getting started

### Prerequisites

- **Node.js** ≥ 18. No API keys or environment variables are needed.

### Setup

```bash
git clone https://github.com/AdithyaMana/Tufte-s-Razor.git
cd Tufte-s-Razor
npm install
```

### Scripts

```bash
npm run dev        # dev server with hot reload at http://localhost:3000
npm test           # unit tests (layout and ink counting)
npm run typecheck  # TypeScript, no emit
npm run build      # production build into dist/
NODE_ENV=production npm start   # serve dist/ (any static host works too)
```

## 📁 Project structure

```
├── App.tsx                     # Site shell: header, footer, theme, view (interactive or reading)
├── index.html / index.tsx      # Entry point
├── index.css                   # Tailwind, role-based tokens (light, dark, ink map), ET Book, controls
├── server.ts                   # Serves the site: Vite in development, dist/ in production
├── ink/                        # The counting engine (framework-free)
│   ├── spec.ts                 # ChartSpec: every design choice the guide varies
│   ├── razor.ts                # The razor: a cluttered chart, cleaned up one cut at a time
│   ├── layout.ts               # Chart geometry (plot, bars, hairlines, labels)
│   ├── render.ts               # Draws each ink group, for display, ink map, highlight or counting
│   ├── measure.ts              # Counts ink by kind and by group; cached per chart
│   ├── inspect.ts              # What a reader is pointing at: hit testing and parts
│   ├── checks.ts               # Readability warnings the ratio can't see
│   ├── presets.ts              # The article's figures, and colours by role
│   └── ink.test.ts             # Unit tests
├── content/                    # The guide's parts, chart-part descriptions, and design flaws
├── pages/
│   └── GuidePage.tsx           # The guide
├── components/
│   ├── guide/                  # Scroll stories, guesses, the challenge, charts, readouts and controls
│   │   └── stories/            # One scroll story per part of the guide
│   └── site/                   # Header (progress, contents), footer, theme, view, ink maps
└── public/                     # Fonts (ET Book + licence), logo, favicon
```

## 📚 Sources

- Michael Lai and Mike Morrison, *Balancing clarity and clutter: the highs and lows of data-ink ratio in practice*. ScienceUX Labs.
- ScienceUX Labs, [*The Story of Goldilocks and the Three Charts*](https://scienceux.org/articles/data-ink-ideal-vs-minimal).
- Edward R. Tufte, *The Visual Display of Quantitative Information*. Graphics Press, 1983; 2nd ed. 2001.
- X. Lan and Y. Liu, "'I Came Across a Junk': Understanding Design Flaws of Data Visualization from the Public's Perspective," *IEEE TVCG* 31(1), 2025, 393–403. [doi:10.1109/TVCG.2024.3456341](https://doi.org/10.1109/TVCG.2024.3456341)

## 👥 Team

Built by [**ScienceUX Labs**](https://scienceux.org/):

- **Adithya Manavalan** — [adithyamana@gmail.com](mailto:adithyamana@gmail.com)
- **Michael Lai** — [m.lai.s4074433@gmail.com](mailto:m.lai.s4074433@gmail.com)
- **Mike Morrison** — [mikeamorrison@gmail.com](mailto:mikeamorrison@gmail.com)

## 📄 License

© 2026 Tufte's Razor. All rights reserved.

ET Book is © 2015 Dmitry Krasny, Bonnie Scranton and Edward Tufte, used under the MIT licence (see `public/fonts/et-book/LICENSE`).
