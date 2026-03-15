
import React, { useState } from 'react';
import { AnalysisResult } from '../types.ts';
import RatioChart from './RatioChart.tsx';
import { 
  CheckCircle2, XCircle, ArrowRight, Eraser, PenTool, 
  Eye, Layout, ScanLine, Lightbulb, RotateCcw,
  Maximize2, FileText, Zap, Lock
} from 'lucide-react';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  imageSrc: string;
  onReset: () => void;
  isDarkMode: boolean;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, imageSrc, onReset, isDarkMode }) => {
  const [showTechnical, setShowTechnical] = useState(false);

  // Score Colors
  const getScoreColor = (ratio: number) => {
    if (ratio >= 0.7) return 'text-emerald-600 dark:text-emerald-400';
    if (ratio >= 0.4) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const scoreColorClass = getScoreColor(result.dataInkRatio);
  
  // Efficiency Gauge Color
  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const hasDebugMaps = !!result.pixelStats?.debugMaps;

  // Formatting the title safely
  const title = result.analysisTitle || result.redesignDescription.split('.')[0]; 

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* 1. HERO HEADER - Clean & Concise */}
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
         <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                          <ScanLine size={16} className="text-zinc-500" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                        AI + Pixel Analysis
                        <Lock size={10} className="text-emerald-500" />
                      </span>
                   </div>
                </div>

                <button 
                   onClick={onReset}
                   className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
                 >
                   <RotateCcw size={14} />
                   <span>New Analysis</span>
                </button>
             </div>

             <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight max-w-4xl tracking-tight">
                {title}
             </h2>
         </div>
      </div>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: Viewer & Breakdown */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Simple Main Viewer */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
             <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center gap-2">
                <Maximize2 size={14} className="text-zinc-400"/>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Original Chart Source</span>
             </div>
             
             <div className="relative p-6 bg-zinc-100/50 dark:bg-zinc-950/50 flex items-center justify-center min-h-[300px]">
                {/* Checkered Background */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#8882_25%,transparent_25%,transparent_75%,#8882_75%,#8882),linear-gradient(45deg,#8882_25%,transparent_25%,transparent_75%,#8882_75%,#8882)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] opacity-[0.05] pointer-events-none" />
                
                <img 
                  src={imageSrc} 
                  alt="Original Chart" 
                  className="max-w-full max-h-[500px] object-contain shadow-lg rounded-lg relative z-10"
                />
             </div>
             <div className="px-4 py-2 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 font-mono text-right">
                {result.pixelStats.width}x{result.pixelStats.height}px
             </div>
          </div>

          {/* Analysis Breakdown with Integrated Visuals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             {/* Data Ink Details */}
             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col h-full shadow-sm hover:border-emerald-500/30 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100">Data Preserved</h3>
                   </div>
                   <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                     Ink Layer
                   </span>
                </div>

                {hasDebugMaps && (
                  <div className="mb-5 bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-center h-48 relative overflow-hidden group-hover:shadow-inner transition-shadow">
                       <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]" />
                       <img 
                         src={result.pixelStats.debugMaps.dataMap} 
                         className="max-h-full max-w-full object-contain p-4 relative z-10"
                         alt="Data Ink Map"
                       />
                       <div className="absolute bottom-2 right-2 text-[10px] text-zinc-400 font-mono bg-white/80 dark:bg-black/80 px-1.5 rounded backdrop-blur-sm">
                         {result.pixelStats.dataInkPixels.toLocaleString()} px
                       </div>
                  </div>
                )}

                <ul className="space-y-3 mt-auto">
                   {result.dataInk.length > 0 ? (
                     result.dataInk.slice(0, 5).map((item, idx) => (
                       <li key={idx} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-1 shrink-0" />
                          <span className="leading-snug">{item}</span>
                       </li>
                     ))
                   ) : (
                     <p className="text-sm text-zinc-500 italic">No clear data regions identified.</p>
                   )}
                </ul>
             </div>

             {/* Chartjunk Details */}
             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col h-full shadow-sm hover:border-rose-500/30 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                      <Eraser className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100">Junk Detected</h3>
                   </div>
                   <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
                     Junk Layer
                   </span>
                </div>

                {hasDebugMaps && (
                  <div className="mb-5 bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-center h-48 relative overflow-hidden group-hover:shadow-inner transition-shadow">
                       <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]" />
                       <img 
                         src={result.pixelStats.debugMaps.structureMap} 
                         className="max-h-full max-w-full object-contain p-4 relative z-10"
                         alt="Chart Junk Map"
                       />
                       <div className="absolute bottom-2 right-2 text-[10px] text-zinc-400 font-mono bg-white/80 dark:bg-black/80 px-1.5 rounded backdrop-blur-sm">
                         {result.pixelStats.structuralPixels.toLocaleString()} px
                       </div>
                  </div>
                )}

                <ul className="space-y-3 mt-auto">
                   {result.chartJunk.length > 0 ? (
                     result.chartJunk.slice(0, 5).map((item, idx) => (
                       <li key={idx} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-400 mt-1 shrink-0" />
                          <span className="leading-snug">{item}</span>
                       </li>
                     ))
                   ) : (
                     <p className="text-sm text-zinc-500 italic">No significant chartjunk detected.</p>
                   )}
                </ul>
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Metrics & Optimization Plan */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Executive Summary (Moved from Header Box) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-3">
                 <FileText size={16} className={scoreColorClass} />
                 <h3 className={`text-xs font-bold uppercase tracking-widest ${scoreColorClass}`}>Analysis Verdict</h3>
             </div>
             <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {result.verdict}
             </p>
          </div>

          {/* Scorecard */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
             <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
               <ScanLine size={14} /> Performance Metrics
             </h3>
             
             <div className="grid grid-cols-2 gap-4">
                {/* Data Ink Ratio */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 flex flex-col items-center justify-center relative border border-zinc-100 dark:border-zinc-800">
                   <div className="h-28 w-28">
                      <RatioChart ratio={result.dataInkRatio} isDarkMode={isDarkMode} />
                   </div>
                   <span className="text-xs font-medium text-zinc-500 mt-2">Data-Ink Ratio</span>
                </div>

                {/* Efficiency Score */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 flex flex-col items-center justify-center border border-zinc-100 dark:border-zinc-800">
                   <div className="h-28 w-28 flex items-center justify-center relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                         <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-200 dark:text-zinc-700 opacity-30" />
                         <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={213} strokeDashoffset={213 - (213 * result.visualEfficiencyScore) / 100} className={`${getEfficiencyColor(result.visualEfficiencyScore)} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                         <span className="text-3xl font-serif font-bold text-zinc-900 dark:text-white">{result.visualEfficiencyScore}</span>
                         <span className="text-[10px] uppercase text-zinc-400">Score</span>
                      </div>
                   </div>
                   <span className="text-xs font-medium text-zinc-500 mt-2">Visual Efficiency</span>
                </div>
             </div>
          </div>

          {/* Optimization Plan (The Checklist) */}
          <div className="bg-zinc-900 dark:bg-zinc-800 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
             
             <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                <Lightbulb className="text-amber-400" size={24} />
                Optimization Plan
             </h3>

             <div className="space-y-4 relative z-10">
                {result.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex gap-4 group/item">
                     <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-mono text-zinc-400 group-hover/item:bg-amber-400 group-hover/item:text-zinc-900 transition-colors">
                           {idx + 1}
                        </div>
                        {idx !== result.suggestions.length - 1 && <div className="w-px h-full bg-white/10" />}
                     </div>
                     <p className="text-sm text-zinc-300 leading-relaxed pb-6 group-hover/item:text-white transition-colors">
                        {suggestion}
                     </p>
                  </div>
                ))}
             </div>
             
             <div className="mt-2 pt-6 border-t border-white/10 flex justify-between items-center">
                 <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Action Items</span>
                 <button onClick={onReset} className="text-sm text-white hover:text-amber-400 transition-colors flex items-center gap-1 font-medium">
                    Analyze Next Chart <ArrowRight size={14} />
                 </button>
             </div>
          </div>
          
          {/* Technical Toggle */}
          <div className="flex justify-center">
             <button 
               onClick={() => setShowTechnical(!showTechnical)}
               className="text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400 flex items-center gap-1 transition-colors"
             >
               <Eye size={12} />
               {showTechnical ? 'Hide Technical Details' : 'Show Technical Logic'}
             </button>
          </div>

          {showTechnical && (
            <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-xl text-xs text-zinc-500 font-mono leading-relaxed border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
              <p>Pixel Total: {result.pixelStats.totalPixels.toLocaleString()}</p>
              <p>Ink Pixels (Non-BG): {result.pixelStats.inkPixels.toLocaleString()}</p>
              <p>Data Ink Pixels: {result.pixelStats.dataInkPixels.toLocaleString()}</p>
              <p>Background: {result.pixelStats.backgroundHex}</p>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                 Hybrid Score: {Math.round(result.dataInkRatio * 100)}% (Pixel) / {Math.round((result.aiEstimatedRatio || 0) * 100)}% (AI Estimate)
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
