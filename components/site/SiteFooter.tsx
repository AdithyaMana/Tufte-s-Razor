import React from 'react';
import { SECTIONS } from '../../content/sections.ts';
import { linkHandler } from './router.ts';
import { RazorMark } from './SiteHeader.tsx';
import { useView } from './view.ts';

const TEAM = [
  { name: 'Adithya Mana', href: 'mailto:adithyamana@gmail.com' },
  { name: 'Michael Lai', href: 'mailto:m.lai.s4074433@gmail.com' },
  { name: 'Mike Morrison', href: 'mailto:mikeamorrison@gmail.com' },
];

const READ_MORE = [
  { label: 'Balancing clarity and clutter (ScienceUX)', href: 'https://scienceux.org/' },
  { label: 'The Story of Goldilocks and the Three Charts', href: 'https://scienceux.org/articles/data-ink-ideal-vs-minimal' },
  { label: 'Design flaws the public calls junk (Lan & Liu)', href: 'https://flawviz.github.io/' },
  { label: 'Sources for this guide', href: '#sources' },
];

const link = 'text-content-2 hover:text-content hover:underline underline-offset-4 rounded-sm';

const Column: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="kicker">{title}</h2>
    <ul className="mt-3 space-y-2 text-[0.8125rem] leading-snug">{children}</ul>
  </div>
);

/** Everything a reader might want at the end: the guide's parts, where to read more, who made it. */
const SiteFooter: React.FC = () => {
  const { view, setView } = useView();
  return (
    <footer className="mt-20 max-w-6xl mx-auto w-full px-4 md:px-8 font-sans">
      <div className="pt-12 border-t border-line grid gap-10 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] md:gap-x-8">
        <div>
          <p className="flex items-center gap-2 text-content">
            <RazorMark className="w-5 h-5" />
            <span className="font-serif text-2xl leading-none tracking-tight">Tufte's Razor</span>
          </p>
          <p className="mt-3 max-w-xs text-[0.8125rem] leading-relaxed text-content-2">
            An interactive guide to Edward Tufte’s data-ink ratio: how much of a chart’s ink shows the data, and where to stop erasing.
          </p>
          <button
            type="button"
            onClick={() => setView(view === 'article' ? 'interactive' : 'article')}
            className="mt-3 min-h-10 text-[0.8125rem] text-content underline decoration-line-2 underline-offset-4 hover:decoration-content"
          >
            {view === 'article' ? 'Switch to the interactive guide' : 'Read it as a plain article'}
          </button>
        </div>

        <Column title="The guide">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={linkHandler(`#${s.id}`)} className={link}>
                <span className="tabular-nums text-chrome">{i + 1}.</span> {s.short}
              </a>
            </li>
          ))}
        </Column>

        <Column title="Read more">
          {READ_MORE.map((r) => (
            <li key={r.label}>
              <a href={r.href} onClick={r.href.startsWith('#') ? linkHandler(r.href) : undefined} className={link}>
                {r.label}
              </a>
            </li>
          ))}
        </Column>

        <Column title="Made by">
          {TEAM.map((person) => (
            <li key={person.name}>
              <a href={person.href} className={link}>
                {person.name}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a href="https://scienceux.org/" target="_blank" rel="noopener noreferrer" className="inline-block opacity-80 hover:opacity-100" aria-label="ScienceUX Labs">
              <img src="/scienceux-logo.png" alt="ScienceUX Labs" className="logo h-7 w-auto dark:invert" />
              <span className="logo-mask" aria-hidden="true" />
            </a>
          </li>
        </Column>
      </div>

      <div className="mt-12 mb-20 pt-6 border-t border-line flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <p className="max-w-xl font-serif italic text-[1.0625rem] leading-snug text-content">
          “Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.”
          <span className="not-italic font-sans text-xs text-content-2"> Antoine de Saint-Exupéry</span>
        </p>
        <p className="shrink-0 text-xs text-chrome">© {new Date().getFullYear()} Tufte's Razor · ScienceUX Labs</p>
      </div>
    </footer>
  );
};

export default SiteFooter;
