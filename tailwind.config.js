/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './*.tsx',
    // .ts too: some class names (e.g. the page-wide "inkmap") are only toggled from TypeScript.
    './components/**/*.{ts,tsx}',
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
      // Tokens live as CSS variables in index.css, so light, dark and the ink map swap in one
      // place. They are named by role: content (what the page says) versus chrome (how you
      // move around it), which is exactly the split the page-wide ink map shows.
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        content: 'rgb(var(--content) / <alpha-value>)',
        'content-2': 'rgb(var(--content-2) / <alpha-value>)',
        chrome: 'rgb(var(--chrome) / <alpha-value>)',
        control: 'rgb(var(--control) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        'line-2': 'rgb(var(--line-2) / <alpha-value>)',
        repeat: 'rgb(var(--repeat) / <alpha-value>)',
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
