import React, { useState } from 'react';
import { AppState, AnalysisResult } from '../types.ts';
import { analyzeImage } from '../services/geminiService.ts';
import UploadZone from '../components/UploadZone.tsx';
import AnalysisDashboard from '../components/AnalysisDashboard.tsx';
import DisclaimerModal from '../components/DisclaimerModal.tsx';
import MethodologyModal from '../components/MethodologyModal.tsx';
import { Scissors, Info, ShieldCheck, ImagePlus, Scan, ArrowLeft } from 'lucide-react';
import { linkHandler } from '../components/site/router.ts';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

interface AnalyzerPageProps {
  isDarkMode: boolean;
}

/** The original AI-assisted chart critique tool, now one page of the site. */
const AnalyzerPage: React.FC<AnalyzerPageProps> = ({ isDarkMode }) => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Basic Security: Validate file size and type
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg("File is too large. Please upload a chart under 10MB.");
      setAppState(AppState.ERROR);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMsg("Invalid file type. Please upload a standard image (PNG, JPG, WEBP).");
      setAppState(AppState.ERROR);
      return;
    }

    try {
      setAppState(AppState.PREVIEW);
      setErrorMsg(null);
      setSelectedFile(file);

      const reader = new FileReader();

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file from disk."));
      });

      reader.readAsDataURL(file);
      const base64StringFull = await base64Promise;
      setImageSrc(base64StringFull);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to read the image.");
      setAppState(AppState.ERROR);
    }
  };

  const handleAnalyze = async () => {
    if (!imageSrc || !selectedFile) return;

    try {
      setAppState(AppState.ANALYZING);
      setErrorMsg(null);

      const base64Data = imageSrc.split(',')[1];
      const mimeType = selectedFile.type;

      const result = await analyzeImage(base64Data, mimeType);

      setAnalysisResult(result);
      setAppState(AppState.SUCCESS);

      const optOut = localStorage.getItem('tufte_disclaimer_opt_out') === 'true';
      if (!optOut) {
        setShowDisclaimer(true);
      } else {
        setShowDisclaimer(false);
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze the image. Please ensure it is a clear chart image.");
      setAppState(AppState.ERROR);
    }
  };

  const handleDisclaimerConfirm = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('tufte_disclaimer_opt_out', 'true');
    }
    setShowDisclaimer(false);
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setAnalysisResult(null);
    setImageSrc(null);
    setSelectedFile(null);
    setErrorMsg(null);
    setShowDisclaimer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="text-zinc-900 dark:text-zinc-100">

      {/* Modals */}
      {showDisclaimer && (
        <DisclaimerModal onConfirm={handleDisclaimerConfirm} isDarkMode={isDarkMode} />
      )}
      <MethodologyModal isOpen={showMethodology} onClose={() => setShowMethodology(false)} isDarkMode={isDarkMode} />

      <div className={`
        pt-12 md:pt-16 pb-20 px-4 md:px-8 max-w-7xl mx-auto
        transition-all duration-500
        ${showDisclaimer ? 'blur-sm pointer-events-none' : ''}
      `}>

        {appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR || appState === AppState.PREVIEW ? (
          <div className="max-w-3xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">

            <div className="text-center mb-12 md:mb-16">
              <p className="kicker mb-5">Beta · AI-assisted estimate</p>
              <h1 className="text-5xl md:text-6xl font-serif text-zinc-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                Measure your own chart
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl leading-relaxed max-w-xl mx-auto font-light">
                Upload a chart image for a pixel-level estimate of its data-ink ratio, plus an AI critique of its chartjunk.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
                <button
                  onClick={() => setShowMethodology(true)}
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <Info size={16} /> Methodology
                </button>
                <a
                  href="/"
                  onClick={linkHandler('/')}
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} /> New to data-ink? Read the guide
                </a>
              </div>
            </div>

            <div className="w-full mb-12 relative z-10">
              {appState === AppState.PREVIEW && imageSrc ? (
                <div className="w-full flex flex-col items-center bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-xl font-serif text-zinc-900 dark:text-white mb-4">Confirm Chart</h3>
                  <div className="relative w-full max-h-96 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center mb-6">
                    <img src={imageSrc} alt="Chart Preview" className="max-w-full max-h-96 object-contain" />
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                      onClick={resetApp}
                      className="flex-1 md:flex-none px-6 py-3 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Change Image
                    </button>
                    <button
                      onClick={handleAnalyze}
                      className="flex-1 md:flex-none px-8 py-3 rounded-xl font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-md"
                    >
                      Analyze Chart
                    </button>
                  </div>
                </div>
              ) : (
                <UploadZone onFileSelect={handleFileSelect} isAnalyzing={appState === AppState.ANALYZING} />
              )}
            </div>

            {appState === AppState.ERROR && (
              <div className="mb-8 px-6 py-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-3 animate-in shake">
                 <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                 <p className="text-rose-700 dark:text-rose-400 text-sm font-medium">{errorMsg}</p>
                 <button onClick={resetApp} className="ml-auto text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider hover:underline">Retry</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full pt-10 border-t border-zinc-200/60 dark:border-zinc-800/60">
               <div className="text-center md:text-left">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3 flex items-center justify-center md:justify-start gap-2">
                   <ImagePlus size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                   Upload
                 </h3>
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">Drop your chart image to begin the multi-dimensional analysis.</p>
               </div>
               <div className="text-center md:text-left">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3 flex items-center justify-center md:justify-start gap-2">
                   <Scan size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                   Measure
                 </h3>
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">AI calculates the Data-Ink Ratio and detects chartjunk.</p>
               </div>
               <div className="text-center md:text-left">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3 flex items-center justify-center md:justify-start gap-2">
                   <Scissors size={16} className="text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                   Refine
                 </h3>
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">Get specific, actionable steps to reduce clutter.</p>
               </div>
            </div>

            <div className="mt-16 flex items-center gap-2 text-zinc-400 dark:text-zinc-600 text-xs font-medium uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>Secure & Privacy-Focused Analysis</span>
            </div>

          </div>
        ) : (
          analysisResult && imageSrc && (
            <AnalysisDashboard
              result={analysisResult}
              imageSrc={imageSrc}
              onReset={resetApp}
              isDarkMode={isDarkMode}
            />
          )
        )}
      </div>
    </div>
  );
};

export default AnalyzerPage;
