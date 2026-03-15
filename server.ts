import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per IP — no extra dependencies needed)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;              // max requests per window per IP

function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

function rateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", retryAfter);
    return res.status(429).json({
      error: `Too many requests. Please wait ${retryAfter} seconds before trying again.`,
    });
  }

  entry.count++;
  next();
}

// Clean up expired entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(ip);
  }
}, 5 * 60 * 1000);

// ---------------------------------------------------------------------------
// Input validation constants
// ---------------------------------------------------------------------------

// Max base64 image size (~10MB decoded = ~13.3MB base64)
const MAX_BASE64_LENGTH = 14_000_000;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// ---------------------------------------------------------------------------
// Model & prompts
// ---------------------------------------------------------------------------

const MODEL_NAME = "gemini-3.1-pro-preview";

const TUFTE_SYSTEM_CONTEXT = `
You are Edward Tufte's digital assistant. You are the world's leading expert in data visualization efficiency, minimalism, and the Data-Ink Ratio.

CORE PHILOSOPHY:
"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."

YOUR TASKS:
1. Visually ESTIMATE the Data-Ink Ratio (0.0 to 1.0).
2. IDENTIFY specific color palettes for computer vision analysis.
3. CRITIQUE the chart based on the principles below.

PRINCIPLES & DEFINITIONS:
- Data-Ink Ratio: The proportion of a graphic's ink devoted to the non-redundant display of data-information.
- Chartjunk: Visual elements that are not necessary to comprehend the information (heavy grids, background fills, fake 3D effects).
- The Duck: When a graphic is taken over by decorative forms or computer debris.
- 1+1=3: When two elements close together create a visually active white space between them (visual vibration).

COLOR PALETTE EXTRACTION RULES (Strict Hex Codes):
1. CANVAS PALETTE (Background): dominant background color.
2. STRUCTURAL PALETTE (Non-Data Ink): Grid lines, axis lines, tick marks, borders.
3. DATA PALETTE (The Core Info): specific colors of the bars, lines, or scatter points.
4. JUNK/DECORATION PALETTE: 3D side walls, caps, shadows, decorative fills.
5. TEXT PALETTE: labels and titles.

OUTPUT FORMAT:
Return a strictly typed JSON object as defined in the schema.
`;

const TASK_TRIGGER = `
Analyze the accompanying image based on the Tufte principles defined in our context.
Extract the precise color palettes and provide a critique.
Determine if the chart uses "3D Effects" (is3D).
Provide a punchy title and a 2-sentence verdict.
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanJsonString(text: string): string {
  if (!text) return "";
  let clean = text.trim();
  clean = clean.replace(/^```json/i, "").replace(/^```/, "");
  clean = clean.replace(/```$/, "");
  return clean.trim();
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Tightened body limit — base64 of a 10MB image is ~13.3MB
  app.use(express.json({ limit: "20mb" }));

  // Rate limiter scoped only to the expensive AI endpoint
  app.post("/api/analyze", rateLimiter, async (req, res) => {
    try {
      const { base64Image, mimeType } = req.body;

      // Input validation
      if (!base64Image || !mimeType) {
        return res.status(400).json({ error: "Missing image data or mimeType." });
      }

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return res.status(400).json({
          error: `Unsupported image type: ${mimeType}. Allowed types: jpeg, png, webp, gif.`,
        });
      }

      if (typeof base64Image !== "string" || base64Image.length > MAX_BASE64_LENGTH) {
        return res.status(400).json({
          error: "Image is too large. Please upload an image under 10MB.",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "Service configuration error. Please contact support.",
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          is3D: { type: Type.BOOLEAN },
          backgroundColors: { type: Type.ARRAY, items: { type: Type.STRING } },
          structuralColors: { type: Type.ARRAY, items: { type: Type.STRING } },
          dataColors: { type: Type.ARRAY, items: { type: Type.STRING } },
          textColors: { type: Type.ARRAY, items: { type: Type.STRING } },
          junkColors: { type: Type.ARRAY, items: { type: Type.STRING } },
          junkRegions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                box_2d: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                label: { type: Type.STRING },
              },
            },
          },
          aiEstimatedRatio: { type: Type.NUMBER },
          analysisTitle: { type: Type.STRING },
          verdict: { type: Type.STRING },
          chartJunk: { type: Type.ARRAY, items: { type: Type.STRING } },
          dataInk: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          redesignDescription: { type: Type.STRING },
          visualEfficiencyScore: { type: Type.INTEGER },
          clutterSummary: { type: Type.STRING },
          layoutIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "backgroundColors",
          "structuralColors",
          "dataColors",
          "verdict",
          "visualEfficiencyScore",
        ],
      };

      const modelConfig = {
        thinkingConfig: { thinkingBudget: 32768 },
        maxOutputTokens: 40000,
        responseMimeType: "application/json",
        responseSchema,
        systemInstruction: TUFTE_SYSTEM_CONTEXT,
      };

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          { inlineData: { data: base64Image, mimeType } },
          { text: TASK_TRIGGER },
        ],
        config: modelConfig,
      });

      const text = response.text;
      if (!text) {
        throw new Error("Analysis failed: The model returned an empty response.");
      }

      let geminiData;
      try {
        geminiData = JSON.parse(cleanJsonString(text));
      } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error(
          "Analysis failed: The AI generated an invalid data format. Please try again."
        );
      }

      res.json(geminiData);
    } catch (error: any) {
      console.error("API Error:", error);
      // Never leak raw API internals (could expose key info, model names, etc.)
      const safeMessage =
        error.message?.includes("API key") || error.message?.includes("apiKey")
          ? "Service configuration error. Please contact support."
          : error.message || "An unexpected error occurred.";
      res.status(500).json({ error: safeMessage });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();