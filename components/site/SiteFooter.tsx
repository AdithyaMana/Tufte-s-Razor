import React from 'react';

const team = [
  { name: 'Adithya Mana', href: 'mailto:adithyamana@gmail.com' },
  { name: 'Michael Lai', href: 'mailto:m.lai.s4074433@gmail.com' },
  { name: 'Mike Morrison', href: 'mailto:mikeamorrison@gmail.com' },
];

const SiteFooter: React.FC = () => (
  <footer className="border-t border-rule mt-8">
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row justify-between gap-10">
      <div className="max-w-md">
        <p className="font-serif italic text-lg text-ink leading-snug">
          “Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.”
        </p>
        <p className="kicker mt-3">Antoine de Saint-Exupéry</p>
      </div>

      <div className="flex flex-col md:items-end gap-5 text-sm text-ink-2 font-sans">
        <div className="md:text-right">
          <p className="kicker mb-1.5">Made by</p>
          <p className="flex flex-wrap md:justify-end gap-x-1.5 gap-y-1">
            {team.map((person, i) => (
              <React.Fragment key={person.name}>
                <a href={person.href} className="text-ink-2 hover:text-ink underline-offset-4 hover:underline">
                  {person.name}
                </a>
                {i < team.length - 1 && <span className="text-muted">·</span>}
              </React.Fragment>
            ))}
          </p>
          <p className="text-muted mt-1">© {new Date().getFullYear()} Tufte's Razor</p>
        </div>
        <a
          href="https://scienceux.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-60 hover:opacity-100 transition-opacity"
          aria-label="ScienceUX Labs"
        >
          <img src="/scienceux-logo.png" alt="ScienceUX Labs" className="h-8 w-auto dark:invert" />
        </a>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
