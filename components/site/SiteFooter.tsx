import React, { useEffect, useRef, useState } from 'react';
import { Globe, Linkedin, Moon, Sun, X, Youtube } from 'lucide-react';
import { RazorMark } from './SiteHeader.tsx';

/** Lucide has no Reddit mark, so a small one drawn to match its 24 × 24 stroke icons. */
const Reddit: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <ellipse cx="12" cy="14.5" rx="8" ry="5.5" />
    <circle cx="18.5" cy="4.5" r="1.5" />
    <path d="M12 9l1.5-5.5 3.5 1" />
    <circle cx="9" cy="13.5" r="0.6" fill="currentColor" />
    <circle cx="15" cy="13.5" r="0.6" fill="currentColor" />
    <path d="M9.5 16.8c1.5 1 3.5 1 5 0" />
  </svg>
);

const CONNECT = [
  { label: 'ScienceUX on Reddit', href: 'https://www.reddit.com/r/ScienceUX/', icon: Reddit },
  { label: 'ScienceUX website', href: 'https://scienceux.org/', icon: Globe },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/curvenote', icon: Linkedin },
  { label: 'YouTube', href: 'https://www.youtube.com/@MikeMorrisonPhD', icon: Youtube },
];

const SAVED_KEYS = ['tufte_theme', 'tufte_view'];

type LegalTopic = 'privacy' | 'terms' | 'cookies';

const LEGAL: { id: LegalTopic; label: string }[] = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms of Service' },
  { id: 'cookies', label: 'Cookies Settings' },
];

const LegalBody: React.FC<{ topic: LegalTopic }> = ({ topic }) => {
  const [cleared, setCleared] = useState(false);
  if (topic === 'privacy')
    return (
      <>
        <p>Tufte’s Razor collects no personal data. There are no accounts, forms, analytics or advertising trackers.</p>
        <p>
          Your browser keeps two preferences on your own device: light or dark theme, and interactive or article view. They are never sent to
          us. Links to other sites (ScienceUX, Reddit, LinkedIn, YouTube) follow those sites’ own policies.
        </p>
      </>
    );
  if (topic === 'terms')
    return (
      <>
        <p>Tufte’s Razor is a free educational guide from ScienceUX. You’re welcome to read, share and link to it.</p>
        <p>
          It’s provided as is, without warranty. The ink counts follow the conventions the guide explains; treat them as a teaching aid, not a
          measurement of your own charts. Quoted and cited works belong to their authors.
        </p>
      </>
    );
  return (
    <>
      <p>This site sets no cookies. It only remembers your theme and view choice in your browser’s storage.</p>
      <button
        type="button"
        onClick={() => {
          try {
            SAVED_KEYS.forEach((key) => localStorage.removeItem(key));
          } catch {
            // Storage may be blocked, in which case nothing was saved.
          }
          setCleared(true);
        }}
        className="mt-1 inline-flex items-center min-h-10 px-4 rounded-md border border-line text-content hover:border-line-2"
      >
        {cleared ? 'Cleared' : 'Clear saved preferences'}
      </button>
    </>
  );
};

const LegalDialog: React.FC<{ topic: LegalTopic | null; onClose: () => void }> = ({ topic, onClose }) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (topic && !dialog.open) dialog.showModal();
    if (!topic && dialog.open) dialog.close();
  }, [topic]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      aria-labelledby="legal-title"
      className="w-[min(32rem,calc(100vw-2rem))] rounded-md border border-line bg-paper text-content p-0 backdrop:bg-black/50"
    >
      {topic && (
        <div className="p-6 font-sans text-[0.9375rem] leading-relaxed text-content-2 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h2 id="legal-title" className="text-lg font-semibold text-content">
              {LEGAL.find((l) => l.id === topic)?.label}
            </h2>
            <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-2 inline-flex items-center justify-center w-10 h-10 text-chrome hover:text-content">
              <X size={16} />
            </button>
          </div>
          <LegalBody topic={topic} />
        </div>
      )}
    </dialog>
  );
};

const heading = 'text-[0.875rem] font-semibold text-content';
const link = 'text-[0.875rem] text-content-2 hover:text-content hover:underline underline-offset-4 rounded-sm';

/** Laid out like the #BetterPosters footer: brand, Legal, Connect, then copyright and the theme switch. */
const SiteFooter: React.FC<{ isDark: boolean; onToggleTheme: () => void }> = ({ isDark, onToggleTheme }) => {
  const [legal, setLegal] = useState<LegalTopic | null>(null);
  return (
    <footer className="mt-20 border-t border-line font-sans">
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 pt-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] md:gap-x-10">
          <div>
            <p className="flex items-center gap-2 text-content">
              <RazorMark className="w-5 h-5" />
              <span className="font-serif text-xl font-semibold leading-none tracking-tight">Tufte's Razor</span>
            </p>
            <p className="mt-1 ml-7 text-[0.6875rem] text-content-2">by ScienceUX</p>
            <p className="mt-4 max-w-sm text-[0.875rem] leading-relaxed text-content-2">
              An interactive guide to Edward Tufte’s data-ink ratio: how much of a chart’s ink shows the data, and where to stop erasing.
            </p>
          </div>

          <div>
            <h2 className={heading}>Get in touch</h2>
            <ul className="mt-5 space-y-4 leading-snug">
              <li>
                <a href="/contact" className={link}>
                  Contact us
                </a>
              </li>
              <li>
                <a href="/" className={link}>
                  The guide
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className={heading}>Legal</h2>
            <ul className="mt-5 space-y-4 leading-snug">
              {LEGAL.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => setLegal(item.id)} className={link}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={heading}>Connect</h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {CONNECT.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-md border border-line bg-content/5 text-content-2 hover:text-content hover:border-line-2"
                  >
                    <Icon size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 mb-12 pt-8 border-t border-line flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs text-content-2">© {new Date().getFullYear()} Tufte's Razor. An initiative by ScienceUX</p>
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-2 min-h-10 px-4 rounded-md border border-line text-[0.875rem] text-content hover:border-line-2"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
      <LegalDialog topic={legal} onClose={() => setLegal(null)} />
    </footer>
  );
};

export default SiteFooter;
