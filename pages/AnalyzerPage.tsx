import React, { useCallback, useState } from 'react';
import { AppState, AnalysisResult } from '../types.ts';
import { analyzeImage } from '../services/geminiService.ts';
import UploadZone from '../components/UploadZone.tsx';
import AnalysisDashboard from '../components/AnalysisDashboard.tsx';
import DisclaimerModal from '../components/DisclaimerModal.tsx';
import MethodologyModal from '../components/MethodologyModal.tsx';
import { TextButton } from '../components/guide/controls.tsx';
import { linkHandler } from '../components/site/router.ts';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

/** The original AI-assisted chart critique tool, now one page of the site. */
const AnalyzerPage: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const closeMethodology = useCallback(() => setShowMethodology(false), []);

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

  const showResult = appState === AppState.SUCCESS && analysisResult && imageSrc;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-12 md:pt-20">
      {showDisclaimer && <DisclaimerModal onConfirm={handleDisclaimerConfirm} />}
      <MethodologyModal isOpen={showMethodology} onClose={closeMethodology} />

      {showResult ? (
        <AnalysisDashboard result={analysisResult} imageSrc={imageSrc} onReset={resetApp} />
      ) : (
        <div className="max-w-3xl">
          <p className="kicker">Beta · AI-assisted estimate</p>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight text-content">Measure your own chart</h1>
          <p className="mt-4 max-w-2xl font-serif italic text-xl md:text-2xl leading-snug text-content-2">
            Upload a chart image for an estimate of its data-ink ratio and a list of the chartjunk worth erasing.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
            <TextButton onClick={() => setShowMethodology(true)}>How it measures</TextButton>
            <a href="/" onClick={linkHandler('/')} className="font-sans text-[0.8125rem] text-chrome hover:text-content hover:underline underline-offset-4 rounded-sm">
              New to data-ink? Read the guide
            </a>
          </p>

          <div className="mt-10">
            {appState === AppState.PREVIEW && imageSrc ? (
              <figure>
                <img src={imageSrc} alt="The chart you chose" className="max-w-full max-h-96 object-contain" />
                <figcaption className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="rounded-sm bg-control px-5 py-2.5 font-sans text-sm font-medium text-paper hover:bg-control/85 transition-colors"
                  >
                    Measure this chart
                  </button>
                  <TextButton onClick={resetApp}>Choose a different image</TextButton>
                </figcaption>
              </figure>
            ) : (
              <UploadZone onFileSelect={handleFileSelect} isAnalyzing={appState === AppState.ANALYZING} />
            )}
          </div>

          {appState === AppState.ERROR && (
            <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-sans text-sm text-content" role="alert">
              <span>{errorMsg}</span>
              <TextButton onClick={resetApp}>Try again</TextButton>
            </p>
          )}

          <p className="mt-8 max-w-2xl font-sans text-xs leading-relaxed text-content-2">
            Your image is sent to Google’s Gemini API for the critique, handled in memory and not stored. The count itself runs in
            your browser.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyzerPage;
