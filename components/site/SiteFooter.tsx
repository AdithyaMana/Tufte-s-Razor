import React from 'react';
import { Globe, Linkedin, Moon, Sun, Youtube } from 'lucide-react';
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
  { label: 'ScienceUX on LinkedIn', href: 'https://www.linkedin.com/company/scienceux', icon: Linkedin },
  { label: 'YouTube', href: 'https://www.youtube.com/@MikeMorrisonPhD', icon: Youtube },
];

const heading = 'text-[0.875rem] font-semibold text-content';
const link = 'text-[0.875rem] text-content-2 hover:text-content hover:underline underline-offset-4 rounded-sm';

/** Laid out like the #BetterPosters footer: brand, contact, Connect, then copyright and the theme switch. */
const SiteFooter: React.FC<{ isDark: boolean; onToggleTheme: () => void }> = ({ isDark, onToggleTheme }) => {
  return (
    <footer className="mt-20 border-t border-line font-sans">
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 pt-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))] md:gap-x-10">
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
    </footer>
  );
};

export default SiteFooter;
