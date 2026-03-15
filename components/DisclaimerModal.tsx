
import React, { useState } from 'react';
import { AlertTriangle, Check, ArrowRight } from 'lucide-react';

interface DisclaimerModalProps {
  onConfirm: (dontShowAgain: boolean) => void;
  isDarkMode: boolean;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onConfirm, isDarkMode }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur and deep fade */}
      <div 
        className="absolute inset-0 bg-zinc-200/50 dark:bg-black/60 backdrop-blur-[6px] animate-in fade-in duration-700"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.5)] max-w-[420px] w-full border border-white/50 dark:border-zinc-800 p-0 overflow-hidden transform transition-all animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ring-1 ring-zinc-900/5 dark:ring-white/10">
        
        {/* Main Content Area */}
        <div className="p-8 pb-6">
          {/* Icon Badge */}
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center mb-6 text-amber-600 dark:text-amber-500 ring-1 ring-amber-500/20 shadow-sm">
            <AlertTriangle size={26} strokeWidth={2.5} />
          </div>
          
          <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">
            Analysis Limitations
          </h3>
          
          <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            This analysis relies on <span className="font-semibold text-zinc-900 dark:text-zinc-200">experimental AI and computer vision</span> to interpret aesthetic principles. Results are subjective estimates intended solely for educational purposes and design iteration.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            Complex backgrounds, low-contrast charts, or non-standard visualizations may yield inaccurate metrics. Always verify suggestions with professional judgment.
          </p>
        </div>

        {/* Footer Action Area */}
        <div className="bg-zinc-50/80 dark:bg-zinc-900/50 p-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-5 backdrop-blur-sm">
           
           {/* Custom Checkbox */}
           <label className="flex items-center gap-3 cursor-pointer group select-none py-1">
            <div className="relative">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <div className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-zinc-400 dark:peer-focus:ring-offset-zinc-900
                ${dontShowAgain 
                  ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100 scale-100' 
                  : 'border-zinc-300 dark:border-zinc-600 bg-transparent hover:border-zinc-400 dark:hover:border-zinc-500'}
              `}>
                <Check size={12} className={`transform transition-transform duration-200 ${dontShowAgain ? 'scale-100 text-white dark:text-zinc-900' : 'scale-0'}`} strokeWidth={3} />
              </div>
            </div>
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
              Don't show this message again
            </span>
          </label>

          {/* Primary Action Button */}
          <button
            onClick={() => onConfirm(dontShowAgain)}
            className="group w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl font-semibold text-[15px] hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_20px_-4px_rgba(255,255,255,0.2)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Run Analysis
            <ArrowRight size={16} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
