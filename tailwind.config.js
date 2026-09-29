/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './*.tsx',
    './components/**/*.tsx',
    './pages/**/*.tsx',
    './ink/**/*.ts',
    './content/**/*.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        serif: ['"ET Book"', 'Palatino', '"Palatino Linotype"', '"Book Antiqua"', 'Georgia', 'serif'],
      },
      // Site tokens live as CSS variables in index.css so light/dark swap in one place.
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--ink-2) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        rule: 'rgb(var(--rule) / <alpha-value>)',
        'rule-2': 'rgb(var(--rule-2) / <alpha-value>)',
        'ink-data': 'rgb(var(--ink-data) / <alpha-value>)',
        'ink-redundant': 'rgb(var(--ink-redundant) / <alpha-value>)',
        'ink-nondata': 'rgb(var(--ink-nondata) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
      },
      maxWidth: {
        prose: '38rem',
      },
    },
  },
  plugins: [],
};
