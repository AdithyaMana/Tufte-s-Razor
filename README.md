# ✂️ Tufte's Razor

> *"Above all else show the data."* — Edward Tufte

**Tufte's Razor** is an interactive guide to Edward Tufte's **data-ink ratio**: how much of a chart's ink actually shows data, why that number moves the way it does, and why it is a range to aim for rather than a score to max out.

Every chart on the site is drawn on a canvas and **counted pixel by pixel** as you change it. Drag the razor through a cluttered chart, slide a bar from hairline to touching, strip out labels or resize the type, and watch the ink get sorted into data-ink, repeated data-ink and non-data ink in real time.

The guide is adapted from *Balancing clarity and clutter: the highs and lows of data-ink ratio in practice* by Michael Lai and Mike Morrison, and recreates that article's examples.

---

## ✨ What's inside

### The guide (`/`)

One long page, one idea per section, each stated in a sentence before it is shown:

| Section | Interactive |
|---|---|
| How much of a chart is data? | **The razor**: erase a cluttered chart one cut at a time, with all of its ink drawn to scale beside it, until one cut goes too far |
| Three kinds of ink | One bar taken apart into data-ink, repeated data-ink, non-data ink and paper; Tufte's definition |
| A bar's width isn't data | **Bar-width visualizer**: hairline to touching bars, the article's wide/balanced/thin examples, and the ratio at every width |
| The background is paper | The article's eight colour variations (A1–D2) as small multiples, each measured |
| Say it once | The article's label and gridline revisions, plus one step too far |
| Type costs attention, not ink | Text size |
| Aim for the middle | Three charts from too low to too high, and the design flaws that push the ratio each way |
| Most good advice leaves the ratio alone | The 23 Data Visualization Checklist items, grouped by their effect on the ratio |
| Playground | Every control, the article's charts as presets, and a pinned reference for comparing versions |

Plain-language warnings flag what a change costs the reader that the ratio can't see (lost values, illegible text, low contrast). Pixel counts and the second measure are one click away rather than on screen by default.

### The ink map

One switch in the header turns on the **ink map** for the whole site. Every chart is recoloured by kind of ink, and so is the page itself: its words are data-ink, the contents list (which repeats the headings) is repeated ink, and its menus, controls and rules are non-data ink.

### Measure a chart (`/analyze`, beta)

The original AI-assisted analyzer: upload a chart image for a pixel-level estimate of its data-ink ratio and a Gemini critique of its chartjunk, shown as plain numbers, an ink map of your chart and three short lists. It needs a Gemini API key; the guide does not.

## 🎨 Design: the site follows its own rule

The site is built the way the guide says charts should be:

- **The paper isn't ink.** Charts are drawn on the page's own paper colour, in light and dark mode.
- **Content is the data.** No cards, frames, shadows or decorative icons. Whitespace, alignment and type (ET Book) do the structuring.
- **Chrome is kept to what still works.** Choices are words with the chosen one underlined, options are plain checkboxes, sliders are hairlines, and detail sits behind "Show the count" and similar disclosures.
- **Colour is for data.** The only colours are the charts' and the three ink-map colours (validated for colour-vision deficiency in both themes). Everything else is ink on paper.
- **Within reason.** Controls still look like controls, and every chart keeps the labels it needs.

Design tokens in [`index.css`](index.css) are named by role (`content`, `chrome`, `repeat`, `line`, `paper`), which is exactly the split the page-wide ink map recolours.

## 🧮 How the counting works

The engine lives in [`ink/`](ink):

- **The chart's background is the paper.** Whatever its colour (white, dark mode, pale blue), it is never ink. Any fill painted on top of it, such as a shaded plot area, is.
- **Data-ink is the least ink that shows each value**: a 2 px hairline the length of each bar. A bar's value lives in its length, so every pixel of width beyond the hairline repeats the same number and counts as **repeated (redundant) data-ink**, as do bar outlines and values printed on the bars.
- **Non-data ink** is everything else that is drawn: axes, ticks, gridlines, borders, fills, titles and labels.
- **Hidden ink doesn't count.** Each chart is drawn once, offscreen at 640 × 400, with each kind of ink in its own colour channel (data red, redundant green, non-data blue). Ordinary paint compositing then gives each pixel to whatever is visible on top, anti-aliased edges count fractionally, and one pass over the image data adds it all up (`sumChannels` in [`ink/measure.ts`](ink/measure.ts)).
- **Bars keep their pixel width when labels change**, so a label change never also changes how much redundant bar ink there is.

The **data-ink ratio** shown everywhere is Tufte's strict version: essential data-ink ÷ total ink. The naive share (all data-coloured ink ÷ total ink) is available beside it, because the two move in opposite directions as bars widen.

Absolute values depend on these counting rules; the direction and size of each change are what the guide is about.

## 🛠️ Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 3 (built with PostCSS) |
| Charts | Canvas 2D (specimens and counting), hand-built SVG (explanatory charts) |
| Typography | ET Book (self-hosted, MIT) and Inter |
| Icons | Lucide React |
| Tests | Vitest |
| Backend | Express 5, Vite 6 (dev middleware) |
| AI (analyzer only) | Google Gemini (structured output + thinking) |
| Runtime | Node.js, tsx |

## 🚀 Getting started

### Prerequisites

- **Node.js** ≥ 18
- For the analyzer only: a **Google Gemini API key** ([get one here](https://aistudio.google.com/apikey))

### Setup

```bash
git clone https://github.com/AdithyaMana/Tufte-s-Razor.git
cd Tufte-s-Razor
npm install

# Only needed for /analyze
cp .env.example .env
# then set GEMINI_API_KEY=your_key_here
```

### Scripts

```bash
npm run dev        # dev server with hot reload at http://localhost:3000
npm test           # unit tests (layout and ink counting)
npm run typecheck  # TypeScript, no emit
npm run build      # production build into dist/
NODE_ENV=production npm start   # serve dist/ and the analyzer API
```

## 📁 Project structure

```
├── App.tsx                     # Site shell: header, routing, footer, theme
├── index.html / index.tsx      # Entry point
├── index.css                   # Tailwind, role-based tokens (light, dark, ink map), ET Book, controls
├── server.ts                   # Express: static site + Gemini proxy with rate limiting
├── ink/                        # The counting engine (framework-free)
│   ├── spec.ts                 # ChartSpec: every design choice the guide varies
│   ├── razor.ts                # The razor: a cluttered chart, cleaned up one cut at a time
│   ├── layout.ts               # Chart geometry (plot, bars, hairlines, labels)
│   ├── render.ts               # Draws each layer, for display, ink map or counting
│   ├── measure.ts              # Counts ink by kind; cached per chart
│   ├── checks.ts               # Readability warnings the ratio can't see
│   ├── presets.ts              # The article's figures, and colours by role
│   └── ink.test.ts             # Unit tests
├── content/                    # Checklist and design-flaw data from the article
├── pages/
│   ├── GuidePage.tsx           # The guide
│   └── AnalyzerPage.tsx        # The AI-assisted analyzer
├── components/
│   ├── guide/                  # Labs, readouts, controls, figures for the guide
│   ├── site/                   # Header, footer, router, theme, the site-wide ink map
│   └── *.tsx                   # Analyzer components
├── services/ utils/            # Analyzer: API client and pixel classifier
└── public/                     # Fonts (ET Book + licence), logo, favicon
```

## 🔒 Security (analyzer)

- **API key isolation** — The Gemini API key lives server-side only; the client never sees it
- **Rate limiting** — 10 requests per minute per IP with automatic cleanup
- **Input validation** — File type whitelist, 10 MB size cap, base64 length guard
- **Error sanitization** — Raw API errors are never leaked to the client

## 📚 Sources

- Michael Lai and Mike Morrison, *Balancing clarity and clutter: the highs and lows of data-ink ratio in practice*. ScienceUX Labs.
- ScienceUX Labs, [*The Story of Goldilocks and the Three Charts*](https://scienceux.org/articles/data-ink-ideal-vs-minimal).
- Edward R. Tufte, *The Visual Display of Quantitative Information*. Graphics Press, 1983; 2nd ed. 2001.
- X. Lan and Y. Liu, "'I Came Across a Junk': Understanding Design Flaws of Data Visualization from the Public's Perspective," *IEEE TVCG* 31(1), 2025, 393–403. [doi:10.1109/TVCG.2024.3456341](https://doi.org/10.1109/TVCG.2024.3456341)
- Stephanie Evergreen, *Data Visualization Checklist*.
- Wajdi Ben Saad, *GoldenViz*.

## 👥 Team

Built by [**ScienceUX Labs**](https://scienceux.org/):

- **Adithya Mana** — [adithyamana@gmail.com](mailto:adithyamana@gmail.com)
- **Michael Lai** — [m.lai.s4074433@gmail.com](mailto:m.lai.s4074433@gmail.com)
- **Mike Morrison** — [mikeamorrison@gmail.com](mailto:mikeamorrison@gmail.com)

## 📄 License

© 2026 Tufte's Razor. All rights reserved.

ET Book is © 2015 Dmitry Krasny, Bonnie Scranton and Edward Tufte, used under the MIT licence (see `public/fonts/et-book/LICENSE`).
