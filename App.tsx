import React, { Suspense, lazy } from 'react';
import SiteHeader from './components/site/SiteHeader.tsx';
import SiteFooter from './components/site/SiteFooter.tsx';
import InkLensLegend from './components/site/InkLensLegend.tsx';
import { InkLensContext, useInkLensState } from './components/site/inkLens.ts';
import { usePathname } from './components/site/router.ts';
import { ThemeContext, useThemeState } from './components/site/theme.ts';
import GuidePage from './pages/GuidePage.tsx';

// The AI analyzer brings its own code (API client, pixel classifier); load it only when visited.
const AnalyzerPage = lazy(() => import('./pages/AnalyzerPage.tsx'));

const App: React.FC = () => {
  const { isDark, toggle } = useThemeState();
  const inkLens = useInkLensState();
  const pathname = usePathname();
  const page = pathname.startsWith('/analyze') ? 'analyze' : 'guide';

  return (
    <ThemeContext.Provider value={isDark}>
      <InkLensContext.Provider value={inkLens}>
        <div className="min-h-screen flex flex-col">
          <SiteHeader page={page} isDark={isDark} onToggleTheme={toggle} />
          <main className="flex-1">
            {page === 'analyze' ? (
              <Suspense fallback={<div className="min-h-[60vh]" />}>
                <AnalyzerPage />
              </Suspense>
            ) : (
              <GuidePage />
            )}
          </main>
          <SiteFooter />
          <InkLensLegend />
        </div>
      </InkLensContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
