import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Part: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mt-8 first:mt-0">
    <h3 className="font-serif text-2xl text-content">{title}</h3>
    <div className="mt-2 space-y-3 font-sans text-sm leading-relaxed text-content-2">{children}</div>
  </section>
);

/** How the analyzer estimates a chart's ratio, what it can't see, and where the image goes. */
const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="methodology-title">
      <div className="absolute inset-0 bg-paper/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-md border border-line bg-paper p-6 md:p-10 shadow-[0_8px_40px_rgb(0_0_0/0.08)]">
        <div className="flex items-start justify-between gap-6">
          <h2 id="methodology-title" className="font-serif text-3xl md:text-4xl tracking-tight text-content">
            How the analyzer measures
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} className="p-1 -mr-1 rounded-sm text-chrome hover:text-content" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="mt-8">
          <Part title="Three steps">
            <p>
              <span className="font-medium text-content">1. Read.</span> Google’s Gemini model looks at the chart and names its colours:
              the data, the structure (axes, gridlines, borders), the text and the background. It also flags decoration such as 3D
              effects.
            </p>
            <p>
              <span className="font-medium text-content">2. Count.</span> Your browser compares every pixel with those colours, using
              perceptual colour distance (ΔE in CIELAB), and sorts it into background, data or non-data ink. Anti-aliased edges are
              cleaned up afterwards.
            </p>
            <p>
              <span className="font-medium text-content">3. Blend.</span> The reported ratio is 70% the pixel count and 30% the model’s
              own estimate.
            </p>
          </Part>

          <Part title="What it can’t see">
            <p>
              From a picture alone it can’t tell essential data-ink from repeated data-ink, so every data-coloured pixel counts as
              data: a wide bar scores higher than a thin one, the opposite of the guide’s strict ratio. Use it to compare versions of
              your own chart rather than to grade charts against each other.
            </p>
            <p>Busy backgrounds, gradients, 3D effects and low contrast can all throw the count off.</p>
          </Part>

          <Part title="Your image">
            <p>
              The image goes to this site’s server only to be passed to Google’s Gemini API. It is handled in memory and not stored.
              The API key never reaches your browser, and requests are rate-limited.
            </p>
            <p>Google’s Generative AI terms apply to what you upload, so avoid charts with sensitive data.</p>
          </Part>
        </div>
      </div>
    </div>
  );
};

export default MethodologyModal;
