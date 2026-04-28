# ✂️ Tufte's Razor

> *"Above all else, show the data."* — Edward Tufte

**Tufte's Razor** is an AI-powered data visualization critique tool that evaluates charts and graphs against [Edward Tufte's](https://www.edwardtufte.com/tufte/) principles of information design. Upload any chart image and receive an instant, multi-dimensional analysis of its **Data-Ink Ratio**, chartjunk, and actionable suggestions for improvement.

---

## ✨ Features

- **Data-Ink Ratio Calculation** — Hybrid scoring combining pixel-level computer vision with AI semantic understanding (70/30 weighted blend)
- **Chartjunk Detection** — Identifies decorative elements, fake 3D effects, heavy grids, and unnecessary clutter
- **Pixel-Level Debug Maps** — Visual overlays showing exactly which pixels are classified as data-ink vs. structural ink vs. background
- **AI-Powered Critique** — Powered by Gemini 3.1 Pro with structured output for consistent, detailed analysis
- **Redesign Suggestions** — Actionable, Tufte-aligned recommendations for improving visual efficiency
- **Dark Mode** — System-preference-aware theme toggle
- **Privacy-Focused** — Images are processed in-memory and never stored

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Browser (React SPA)            │
│                                             │
│  UploadZone → App → AnalysisDashboard       │
│                ↓                            │
│  geminiService.ts ──→ imageAnalysis.ts       │
│  (API call)           (Canvas pixel engine)  │
│        ↓                     ↓              │
│   Semantic Hints ──→ Hybrid Data-Ink Ratio   │
└──────────────┬──────────────────────────────┘
               │ POST /api/analyze
┌──────────────▼──────────────────────────────┐
│           Express + Vite Server              │
│                                             │
│  • Rate limiting (10 req/min per IP)         │
│  • Input validation (size, MIME type)        │
│  • Gemini API proxy (key never exposed)      │
│  • Structured JSON schema enforcement        │
└─────────────────────────────────────────────┘
```

### How It Works

1. **Upload** — User drops a chart image (PNG/JPG/WEBP, max 10 MB)
2. **AI Analysis** — The server proxies the image to Gemini 3.1 Pro, which extracts color palettes, identifies chartjunk regions, and estimates a Data-Ink Ratio
3. **Pixel Engine** — The browser-side canvas engine uses the AI's semantic hints (color palettes, spatial junk regions, 3D detection) to classify every pixel using CIE ΔE color distance in CIELAB space
4. **Hybrid Score** — The final Data-Ink Ratio blends pixel analysis (70%) with the AI estimate (30%), then a despeckling pass corrects anti-aliasing artifacts
5. **Dashboard** — Results are displayed with interactive debug overlays, a gauge chart, and categorized critique sections

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Typography | Inter + Playfair Display (Google Fonts) |
| Backend | Express 5, Vite 6 (dev middleware) |
| AI | Google Gemini 3.1 Pro (structured output + thinking) |
| Runtime | Node.js, tsx |

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Google Gemini API key** ([get one here](https://aistudio.google.com/apikey))

### Setup

```bash
# Clone the repository
git clone https://github.com/AdithyaMana/Tufte-s-Razor.git
cd Tufte-s-Razor

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Edit .env and add your Gemini API key:
#   GEMINI_API_KEY=your_key_here
```

### Run

```bash
# Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Build for Production

```bash
npm run build
NODE_ENV=production npm start
```

## 📁 Project Structure

```
├── App.tsx                     # Main application component & state machine
├── index.html                  # Entry point with Tailwind config & import map
├── index.tsx                   # React DOM mount
├── server.ts                   # Express server with Gemini proxy & rate limiting
├── types.ts                    # TypeScript interfaces & enums
├── vite.config.ts              # Vite dev server configuration
├── components/
│   ├── AnalysisDashboard.tsx   # Results dashboard with debug overlays
│   ├── DisclaimerModal.tsx     # AI disclaimer popup
│   ├── MethodologyModal.tsx    # Methodology explainer modal
│   ├── RatioChart.tsx          # Data-Ink Ratio gauge chart
│   └── UploadZone.tsx          # Drag-and-drop file upload component
├── services/
│   └── geminiService.ts        # Client-side API call & hybrid scoring
├── utils/
│   └── imageAnalysis.ts        # Canvas-based pixel classification engine
└── public/
    └── scienceux-logo.png      # ScienceUX Labs logo
```

## 🔒 Security

- **API key isolation** — The Gemini API key lives server-side only; the client never sees it
- **Rate limiting** — 10 requests per minute per IP with automatic cleanup
- **Input validation** — File type whitelist, 10 MB size cap, base64 length guard
- **Error sanitization** — Raw API errors are never leaked to the client

## 🧪 Methodology

The analysis is grounded in Edward Tufte's **Data-Ink Ratio** principle:

```
Data-Ink Ratio = Data Ink / Total Ink
```

Where *data ink* is the non-redundant, non-erasable core of a graphic. The tool uses CIELAB color space (ΔE distance) for perceptually accurate pixel classification, guided by AI-extracted semantic palettes.

Read more about the methodology in the in-app **Methodology** modal.

## 👥 Team

Built by [**ScienceUX Labs**](https://scienceux.org/):

- **Adithya Mana** — [adithyamana@gmail.com](mailto:adithyamana@gmail.com)
- **Michael Lai** — [m.lai.s4074433@gmail.com](mailto:m.lai.s4074433@gmail.com)
- **Mike Morrison** — [mikeamorrison@gmail.com](mailto:mikeamorrison@gmail.com)

## 📄 License

© 2026 Tufte's Razor. All rights reserved.
