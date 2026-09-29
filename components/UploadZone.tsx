import React, { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

/**
 * A drop target: a dashed hairline is the least that still says "drop here". Also opens a
 * file picker on click or Enter, and accepts a pasted image.
 */
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
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
      role="button"
      tabIndex={isAnalyzing ? -1 : 0}
      aria-busy={isAnalyzing}
      aria-label="Choose a chart image to measure"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={!isAnalyzing ? handleDragOver : undefined}
      onDragLeave={!isAnalyzing ? handleDragLeave : undefined}
      onDrop={!isAnalyzing ? handleDrop : undefined}
      className={`w-full h-64 md:h-80 rounded-md border border-dashed flex flex-col items-center justify-center text-center px-6 transition-colors ${
        isAnalyzing
          ? 'border-line-2 cursor-wait'
          : isDragging
            ? 'border-control bg-content/[0.03]'
            : 'border-line-2 hover:border-chrome cursor-pointer'
      }`}
    >
      <input type="file" ref={fileInputRef} onChange={handleInputChange} accept="image/*" className="hidden" disabled={isAnalyzing} />

      {isAnalyzing ? (
        <div className="flex flex-col items-center font-sans">
          <Loader2 className="w-6 h-6 text-chrome animate-spin" strokeWidth={1.5} aria-hidden="true" />
          <p className="mt-4 font-serif text-2xl text-content">Measuring your chart…</p>
          <p className="mt-1 text-[0.8125rem] text-content-2">This takes 10 to 15 seconds.</p>
        </div>
      ) : (
        <>
          <p className="font-serif text-2xl md:text-3xl text-content">{isDragging ? 'Drop it here' : 'Drop a chart image here'}</p>
          <p className="mt-2 font-sans text-[0.8125rem] text-content-2">
            or click to choose one, or paste it with Ctrl+V. PNG, JPG or WEBP, up to 10 MB.
          </p>
        </>
      )}
    </div>
  );
};

export default UploadZone;
