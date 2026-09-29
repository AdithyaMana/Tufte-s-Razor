import React, { useEffect } from 'react';
import InkMapLegend from './components/site/InkMapLegend.tsx';
import { InkMapContext, useInkMapState } from './components/site/inkMap.ts';
import SiteFooter from './components/site/SiteFooter.tsx';
import SiteHeader, { ContentsDock, useGuideProgress } from './components/site/SiteHeader.tsx';
import { ThemeContext, useThemeState } from './components/site/theme.ts';
import { useViewState, ViewContext } from './components/site/view.ts';
import GuidePage from './pages/GuidePage.tsx';

const App: React.FC = () => {
  const { isDark, toggle } = useThemeState();
  const inkMap = useInkMapState();
  const view = useViewState();

  // The site is one page; old links to other paths (e.g. the retired /analyze) land on it.
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (pathname !== '/') window.history.replaceState(null, '', `/${search}${hash}`);
  }, []);

  return (
    <ThemeContext.Provider value={isDark}>
      <InkMapContext.Provider value={inkMap}>
        <ViewContext.Provider value={view}>
          <Shell isDark={isDark} onToggleTheme={toggle} />
        </ViewContext.Provider>
      </InkMapContext.Provider>
    </ThemeContext.Provider>
  );
};

/** The page: it reads the view from context, so it sits inside the providers. */
const Shell: React.FC<{ isDark: boolean; onToggleTheme: () => void }> = ({ isDark, onToggleTheme }) => {
  const progress = useGuideProgress();
  return (
          <div className="min-h-screen flex flex-col">
            <SiteHeader isDark={isDark} onToggleTheme={onToggleTheme} progress={progress} />
            <main className="flex-1">
              <GuidePage />
            </main>
            <SiteFooter />
            <InkMapLegend />
            <ContentsDock progress={progress} />
          </div>
  );
};

export default App;
