import { createContext, useCallback, useContext, useState } from 'react';
import { SECTIONS } from '../../content/sections.ts';

/** How the guide is read: scroll stories with things to try, or a plain article. */
export type View = 'interactive' | 'article';

const STORAGE_KEY = 'tufte_view';

// A link with ?view=article opens the article; otherwise the reader's last choice wins.
function initialView(): View {
  const param = new URLSearchParams(window.location.search).get('view');
  if (param === 'article' || param === 'interactive') return param;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'article' ? 'article' : 'interactive';
  } catch {
    return 'interactive';
  }
}

/** The part of the guide at the top of the screen, to return to after the layout changes. */
function sectionInView(): string | null {
  let current: string | null = null;
  for (const { id } of SECTIONS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = id;
  }
  return current;
}

export function useViewState() {
  const [view, setViewState] = useState<View>(initialView);

  const setView = useCallback((next: View) => {
    // The two views differ in length, so keep the reader in the same part of the guide.
    const place = sectionInView();
    setViewState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the switch still works for this visit.
    }
    const url = new URL(window.location.href);
    if (next === 'article') url.searchParams.set('view', 'article');
    else url.searchParams.delete('view');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = place ? document.getElementById(place) : null;
        if (el && place !== SECTIONS[0].id) el.scrollIntoView({ behavior: 'instant' });
        else window.scrollTo({ top: 0, behavior: 'instant' });
      }),
    );
  }, []);

  return { view, setView };
}

export const ViewContext = createContext<{ view: View; setView: (view: View) => void }>({
  view: 'interactive',
  setView: () => {},
});

export function useView() {
  return useContext(ViewContext);
}

/** True when the guide is being read as a plain article. */
export function useIsArticle(): boolean {
  return useView().view === 'article';
}
