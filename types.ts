
export interface ImageAnalysisStats {
  dataInkRatio: number;
  totalPixels: number;
  inkPixels: number;
  dataInkPixels: number;
  structuralPixels: number;
  backgroundHex: string;
  detectedJunkAttributes: string[];
  debugMaps: {
    inkMap: string;
    structureMap: string;
    dataMap: string;
  };
  width: number;
  height: number;
}

export interface AnalysisResult {
  dataInkRatio: number;
  aiEstimatedRatio?: number; // New field for hybrid calculation
  analysisTitle?: string; // New field for concise title
  verdict: string;
  chartJunk: string[];
  dataInk: string[];
  suggestions: string[];
  redesignDescription: string;
  methodUsed?: 'heuristic' | 'semantic-guided';
  pixelStats: ImageAnalysisStats; 
  visualEfficiencyScore: number;
  clutterSummary: string;
  layoutIssues: string[];
}

export interface SemanticHints {
  backgroundColor?: string;
  backgroundColors?: string[]; 
  
  // Refined Palettes
  dataColors?: string[];       // The core data (bars, lines, points)
  structuralColors?: string[]; // Grid lines, ticks, borders, axes lines
  textColors?: string[];       // Labels, titles (usually counted as data-ink if useful)
  junkColors?: string[];       // Specific fills or deco colors
  
  // Spatial fallback
  junkRegions?: { box_2d: number[], label: string }[]; 
  dataRegions?: { box_2d: number[], label: string }[];
  isComplexBackground: boolean;
  is3D?: boolean;              // New flag for 3D detection
}

export enum AppState {
  IDLE = 'IDLE',
  PREVIEW = 'PREVIEW',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AnalysisHistoryItem {
  id: string;
  imageUrl: string;
  result: AnalysisResult;
  timestamp: number;
}