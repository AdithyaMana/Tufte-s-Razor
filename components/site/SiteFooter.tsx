import React from 'react';

const team = [
  { name: 'Adithya Mana', href: 'mailto:adithyamana@gmail.com' },
  { name: 'Michael Lai', href: 'mailto:m.lai.s4074433@gmail.com' },
  { name: 'Mike Morrison', href: 'mailto:mikeamorrison@gmail.com' },
];

const SiteFooter: React.FC = () => (
  <footer className="mt-16">
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-24 border-t border-line flex flex-col md:flex-row md:items-end justify-between gap-8 font-sans">
      <p className="max-w-md font-serif italic text-lg leading-snug text-content">
        “Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.”
        <span className="block mt-1 font-sans not-italic text-xs text-content-2">Antoine de Saint-Exupéry</span>
      </p>

      <div className="flex flex-col md:items-end gap-4 text-[0.8125rem] text-chrome">
        <p className="flex flex-wrap md:justify-end gap-x-1.5">
          <span>Made by</span>
          {team.map((person, i) => (
            <React.Fragment key={person.name}>
              <a href={person.href} className="rounded-sm hover:text-content hover:underline underline-offset-4">
                {person.name}
              </a>
              {i < team.length - 1 && <span aria-hidden="true">·</span>}
            </React.Fragment>
          ))}
        </p>
        <a
          href="https://scienceux.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="ScienceUX Labs"
        >
          <img src="/scienceux-logo.png" alt="ScienceUX Labs" className="logo h-7 w-auto dark:invert" />
          <span className="logo-mask" aria-hidden="true" />
        </a>
        <p className="text-xs">© {new Date().getFullYear()} Tufte's Razor</p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
