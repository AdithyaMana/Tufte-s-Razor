
import React, { useEffect, useState } from 'react';
import { X, Brain, ScanLine, Cpu, Layers, Zap, Scale, Trash2, ShieldCheck, Lock, EyeOff, Key } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'philosophy' | 'tech' | 'principles' | 'security'>('philosophy');

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-50/90 dark:bg-black/90 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`
        relative bg-white dark:bg-zinc-900 w-full max-w-5xl h-[85vh] flex flex-col md:flex-row
        rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800
        transform transition-all duration-500 ease-out overflow-hidden
        ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}
      `}>
        
        {/* Sidebar / Tabs */}
        <div className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-950/50 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-row md:flex-col shrink-0">
          <div className="p-6 hidden md:block">
             <h2 className="font-serif font-bold text-xl text-zinc-900 dark:text-zinc-100">Methodology</h2>
             <p className="text-xs text-zinc-500 mt-1">Deep dive into Tufte's Razor</p>
          </div>
          
          <nav className="flex-1 flex md:flex-col overflow-x-auto md:overflow-visible">
            <button 
              onClick={() => setActiveTab('philosophy')}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'philosophy' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-b-2 md:border-b-0 md:border-r-2 border-zinc-900 dark:border-zinc-100' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
            >
              <Scale size={18} />
              The Philosophy
            </button>
            <button 
              onClick={() => setActiveTab('tech')}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'tech' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-b-2 md:border-b-0 md:border-r-2 border-zinc-900 dark:border-zinc-100' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
            >
              <Cpu size={18} />
              The Engine
            </button>
            <button 
              onClick={() => setActiveTab('principles')}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'principles' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-b-2 md:border-b-0 md:border-r-2 border-zinc-900 dark:border-zinc-100' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
            >
              <Trash2 size={18} />
              Definitions
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'security' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-b-2 md:border-b-0 md:border-r-2 border-zinc-900 dark:border-zinc-100' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
            >
              <ShieldCheck size={18} />
              Privacy & Safety
            </button>
          </nav>

          <div className="p-4 md:p-6 border-l md:border-l-0 md:border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-center md:justify-start">
            <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
               <X size={20} className="text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
          
          {/* TAB: PHILOSOPHY */}
          {activeTab === 'philosophy' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                <h3 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">The Data-Ink Ratio</h3>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-8 mb-8 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 font-serif text-lg md:text-2xl text-zinc-800 dark:text-zinc-200">
                    <span className="font-bold">Data-Ink Ratio</span>
                    <span>=</span>
                    <div className="flex flex-col items-center">
                      <span className="border-b border-zinc-400 dark:border-zinc-500 pb-2 px-4">Data-Ink</span>
                      <span className="pt-2 px-4 text-zinc-500 dark:text-zinc-400">Total Ink used to print the graphic</span>
                    </div>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
                  <p>
                    Edward Tufte argued that <strong className="text-zinc-900 dark:text-zinc-200">perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.</strong>
                  </p>
                  <p>
                    Every pixel in your chart competes for attention. Ink that depicts data is essential. Ink that depicts something else—grid lines, redundant labels—is <em>chartjunk</em>.
                  </p>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                       <Scale size={18} /> High Data-Ink
                    </h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-500 leading-relaxed">
                       Minimalist. Precise. The ink changes only as the data changes.
                    </p>
                 </div>
                 <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                    <h4 className="font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                       <Trash2 size={18} /> Low Data-Ink
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-500 leading-relaxed">
                       Cluttered. Distracting. Decorative elements rather than information.
                    </p>
                 </div>
              </section>
            </div>
          )}

          {/* TAB: TECH */}
          {activeTab === 'tech' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8">
                  <h3 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Hybrid Analysis Engine</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                    We combine multimodal AI logic with deterministic pixel-by-pixel computer vision.
                  </p>
               </div>

               <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 space-y-12">
                  <div className="relative pl-8">
                     <div className="absolute -left-[21px] top-0 w-10 h-10 bg-white dark:bg-zinc-900 border-2 border-purple-500 rounded-full flex items-center justify-center text-purple-600 font-bold">1</div>
                     <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Semantic Vision</h4>
                     <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        Gemini Pro acts as the "Art Critic", identifying the intent behind colors and structures.
                     </p>
                  </div>

                  <div className="relative pl-8">
                     <div className="absolute -left-[21px] top-0 w-10 h-10 bg-white dark:bg-zinc-900 border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
                     <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Pixel Calibration</h4>
                     <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        We perform a pixel-by-pixel scan using the <strong>CIELAB (ΔE)</strong> color space, mimicking human visual perception.
                     </p>
                  </div>

                  <div className="relative pl-8">
                     <div className="absolute -left-[21px] top-0 w-10 h-10 bg-white dark:bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-600 font-bold">3</div>
                     <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">The Calculation</h4>
                     <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        The final ratio is a rigorous count, not a subjective guess.
                     </p>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: PRINCIPLES */}
          {activeTab === 'principles' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <h3 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">Core Definitions</h3>
               <div className="grid grid-cols-1 gap-6">
                  <div className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
                           <Trash2 size={24} />
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Chartjunk</h4>
                           <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">Visual elements not necessary to comprehend information.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
               <section>
                 <h3 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Security & Data Privacy</h3>
                 <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl">
                   Tufte's Razor is built with a serverless architecture, ensuring your data never leaves your control without your intent.
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                       <Lock className="w-8 h-8 text-zinc-900 dark:text-zinc-100 mb-4" />
                       <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">No Server Storage</h4>
                       <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          We do not have a database. Your uploaded charts are processed in memory and never stored on a server. Analysis is ephemeral.
                       </p>
                    </div>

                    <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                       <Key className="w-8 h-8 text-zinc-900 dark:text-zinc-100 mb-4" />
                       <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">Environment Security</h4>
                       <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          API keys are injected via secure environment variables managed by the host platform, never exposed in client-side source code.
                       </p>
                    </div>

                    <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                       <EyeOff className="w-8 h-8 text-zinc-900 dark:text-zinc-100 mb-4" />
                       <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">Client-Side Logic</h4>
                       <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Pixel analysis, color extraction, and UI rendering happen entirely within your browser's secure sandbox.
                       </p>
                    </div>

                    <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                       <ShieldCheck className="w-8 h-8 text-zinc-900 dark:text-zinc-100 mb-4" />
                       <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">Encrypted Transit</h4>
                       <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Communication with the Google Gemini API is conducted over industry-standard TLS encryption (HTTPS).
                       </p>
                    </div>

                    <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                       <Zap className="w-8 h-8 text-zinc-900 dark:text-zinc-100 mb-4" />
                       <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">XSS Sanitization</h4>
                       <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          All AI-generated text is sanitized by React's rendering engine, preventing malicious injection of scripts.
                       </p>
                    </div>
                 </div>
               </section>
               
               <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6 rounded-xl">
                  <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-2">External Policies</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-500 leading-relaxed">
                    By using this tool, your data is subject to Google's Generative AI privacy policies. We recommend only uploading non-sensitive data for educational analysis.
                  </p>
               </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default MethodologyModal;
