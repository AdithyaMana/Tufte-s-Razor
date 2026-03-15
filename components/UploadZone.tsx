
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Loader2, FileImage, MousePointerClick, ClipboardPaste } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isAnalyzing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    if (!isAnalyzing) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isAnalyzing) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            onFileSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isAnalyzing, onFileSelect]);

  return (
    <div
      onClick={handleClick}
      onDragOver={!isAnalyzing ? handleDragOver : undefined}
      onDragLeave={!isAnalyzing ? handleDragLeave : undefined}
      onDrop={!isAnalyzing ? handleDrop : undefined}
      className={`
        relative overflow-hidden
        w-full h-72 md:h-96
        rounded-2xl transition-all duration-500 ease-out
        flex flex-col items-center justify-center
        border border-dashed
        group
        ${isAnalyzing 
          ? 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 cursor-wait' 
          : isDragging
            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-400 dark:border-blue-500 scale-[1.01] shadow-xl'
            : 'bg-white/40 dark:bg-zinc-900/40 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-white/60 dark:hover:bg-zinc-900/60 shadow-sm hover:shadow-md cursor-pointer'
        }
        backdrop-blur-sm
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        className="hidden"
        disabled={isAnalyzing}
      />

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center animate-in fade-in duration-700">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700 rounded-full blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-700 ring-1 ring-zinc-900/5">
              <Loader2 className="w-10 h-10 text-zinc-800 dark:text-zinc-200 animate-spin" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">Analyzing Aesthetics</h3>
          <div className="flex flex-col items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 font-mono">
            <span className="animate-pulse">Calculating Pixel Ratios...</span>
            <span className="opacity-60 text-xs">This may take 10-15 seconds</span>
          </div>
        </div>
      ) : (
        <>
          <div className={`
            p-5 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl border border-zinc-100 dark:border-zinc-700 
            mb-6 transition-transform duration-500 ease-out
            ${isDragging ? 'scale-110 rotate-3' : 'group-hover:scale-105 group-hover:-rotate-2'}
          `}>
            {isDragging ? (
               <FileImage className="w-10 h-10 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />
            ) : (
               <Upload className="w-10 h-10 text-zinc-800 dark:text-zinc-200" strokeWidth={1.5} />
            )}
          </div>
          
          <h3 className="text-2xl md:text-3xl font-serif text-zinc-900 dark:text-white mb-3 tracking-tight">
            {isDragging ? 'Drop to Analyze' : 'Analyze Visualization'}
          </h3>
          
          <p className="text-zinc-500 dark:text-zinc-400 text-base max-w-sm text-center px-4 leading-relaxed mb-8">
            Drag and drop your chart image here, paste from clipboard, or click to browse.
            <span className="block mt-1 text-sm opacity-70">Supports PNG, JPG, WEBP</span>
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <div className="flex items-center gap-1.5">
               <MousePointerClick size={14} />
               <span>Click to Browse</span>
             </div>
             <div className="flex items-center gap-1.5">
               <ClipboardPaste size={14} />
               <span>Ctrl+V to Paste</span>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadZone;
