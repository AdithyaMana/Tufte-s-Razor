
import React, { useState, useEffect } from 'react';
import { AppState, AnalysisResult } from './types.ts';
import { analyzeImage } from './services/geminiService.ts';
import UploadZone from './components/UploadZone.tsx';
import AnalysisDashboard from './components/AnalysisDashboard.tsx';
import DisclaimerModal from './components/DisclaimerModal.tsx';
import MethodologyModal from './components/MethodologyModal.tsx';
import { Scissors, Info, Moon, Sun, ShieldCheck, ExternalLink, ImagePlus, Scan } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-700 transition-colors duration-500">
      
      {/* Modals */}
      {showDisclaimer && (
        <DisclaimerModal onConfirm={handleDisclaimerConfirm} isDarkMode={isDarkMode} />
      )}
      <MethodologyModal isOpen={showMethodology} onClose={() => setShowMethodology(false)} isDarkMode={isDarkMode} />

      {/* Header */}
      <header className={`
        fixed top-0 left-0 right-0 z-50
        bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50
        transition-all duration-300 ${showDisclaimer ? 'blur-sm' : ''}
      `}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetApp}>
            <div className="bg-zinc-900 dark:bg-zinc-100 p-1.5 rounded-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <Scissors className="w-5 h-5 text-zinc-100 dark:text-zinc-900" />
            </div>
            <h1 className="font-serif font-bold text-xl tracking-tight text-zinc-900 dark:text-white group-hover:opacity-80 transition-opacity">
              Tufte's Razor
            </h1>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button 
                onClick={() => setShowMethodology(true)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                <Info size={16} /> Methodology
              </button>
              <a 
                href="https://www.edwardtufte.com/tufte/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
              >
                Principles <ExternalLink size={14} />
              </a>
            </div>
            
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>

            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`
        pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto
        transition-all duration-500
        ${showDisclaimer ? 'blur-sm pointer-events-none' : ''}
      `}>
        
        {appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR || appState === AppState.PREVIEW ? (
          <div className="max-w-3xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-5xl md:text-7xl font-serif font-medium text-zinc-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                "Above all else <br/> show the data."
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl leading-relaxed max-w-xl mx-auto font-light">
                An AI-powered critique engine that evaluates your visualizations against Edward Tufte's principles of minimalism.
              </p>
            </div>

            <div className="w-full mb-12 relative z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 dark:to-zinc-950/50 pointer-events-none -z-10 blur-xl"></div>
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
      </main>

      {/* Footer */}
      <footer className={`
        border-t border-zinc-200 dark:border-zinc-800 py-12 bg-white dark:bg-zinc-950
        transition-colors duration-300 ${showDisclaimer ? 'blur-sm' : ''}
      `}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-center md:text-left">
              <p className="font-serif italic text-lg text-zinc-800 dark:text-zinc-200 mb-2">
                "Perfection is achieved not when there is nothing more to add,<br/> but when there is nothing left to take away."
              </p>
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium">Antoine de Saint-Exupéry</p>
           </div>
           
           <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex flex-col items-center md:items-end gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <p>© {new Date().getFullYear()} Tufte's Razor</p>
                  <div className="flex flex-col md:items-end gap-0.5 text-xs mt-1">
                      <span className="opacity-60 uppercase tracking-wider text-[10px]">Team</span>
                      <div className="flex flex-wrap justify-center md:justify-end gap-1.5 font-medium">
                        <a href="mailto:adithyamana@gmail.com" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-600">Adithya Mana</a>
                        <span className="opacity-40">,</span>
                        <a href="mailto:m.lai.s4074433@gmail.com" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-600">Michael Lai</a>
                        <span className="opacity-40">,</span>
                        <a href="mailto:mikeamorrison@gmail.com" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-600">Mike Morrison</a>
                      </div>
                  </div>
              </div>
              
              <a 
                href="https://scienceux.org/" 
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity transform hover:scale-105 duration-300"
                aria-label="ScienceUX Labs"
              >
                  <img src="/scienceux-logo.png" alt="ScienceUX Logo" className="h-8 w-auto dark:invert" />
              </a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
