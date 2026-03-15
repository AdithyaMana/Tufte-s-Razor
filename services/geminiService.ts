
import { AnalysisResult, SemanticHints } from "../types.ts";
import { analyzeImagePixels } from "../utils/imageAnalysis.ts";

// --- MAIN ANALYSIS FUNCTION ---

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ base64Image, mimeType })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const geminiData = await response.json();

    const hints: SemanticHints = {
      backgroundColor: geminiData.backgroundColors?.[0] || "#ffffff",
      backgroundColors: geminiData.backgroundColors || ["#ffffff"],
      dataColors: geminiData.dataColors || [],
      structuralColors: geminiData.structuralColors || [],
      textColors: geminiData.textColors || [],
      junkColors: geminiData.junkColors || [],
      junkRegions: geminiData.junkRegions || [],
      dataRegions: [], 
      isComplexBackground: (geminiData.backgroundColors?.length || 0) > 2,
      is3D: geminiData.is3D || false
    };

    const dataUri = `data:${mimeType};base64,${base64Image}`;
    const precisePixelStats = await analyzeImagePixels(dataUri, hints);

    // Hybrid Scoring Logic
    const aiRatio = geminiData.aiEstimatedRatio || 0.5;
    const hybridRatio = (precisePixelStats.dataInkRatio * 0.7) + (aiRatio * 0.3);
    const finalRatio = Math.max(0, Math.min(1, hybridRatio));

    return {
      dataInkRatio: finalRatio,
      aiEstimatedRatio: aiRatio,
      analysisTitle: geminiData.analysisTitle || "Analysis Result",
      verdict: geminiData.verdict || "Analysis complete.",
      chartJunk: geminiData.chartJunk || [],
      dataInk: geminiData.dataInk || [],
      suggestions: geminiData.suggestions || [],
      redesignDescription: geminiData.redesignDescription || "",
      methodUsed: 'semantic-guided',
      pixelStats: precisePixelStats,
      visualEfficiencyScore: geminiData.visualEfficiencyScore || 50,
      clutterSummary: geminiData.clutterSummary || "",
      layoutIssues: geminiData.layoutIssues || []
    };

  } catch (error: any) {
    console.error("AI Service Error:", error);
    // Sanitize error message before passing to UI
    const userMessage = error.message?.includes("API key") 
      ? "Service configuration error. Please contact support." 
      : (error.message || "An unexpected error occurred during analysis.");
    throw new Error(userMessage);
  }
};
