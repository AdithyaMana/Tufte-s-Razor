import React, { Suspense, lazy } from 'react';
import SiteHeader from './components/site/SiteHeader.tsx';
import SiteFooter from './components/site/SiteFooter.tsx';
import { usePathname } from './components/site/router.ts';
import { ThemeContext, useThemeState } from './components/site/theme.ts';
import GuidePage from './pages/GuidePage.tsx';

// The AI analyzer pulls in its own dependencies (e.g. Recharts); load it only when visited.
const AnalyzerPage = lazy(() => import('./pages/AnalyzerPage.tsx'));

const App: React.FC = () => {
  const { isDark, toggle } = useThemeState();
  const pathname = usePathname();
  const page = pathname.startsWith('/analyze') ? 'analyze' : 'guide';

  return (
    <ThemeContext.Provider value={isDark}>
      <div className="min-h-screen flex flex-col">
        <SiteHeader page={page} isDark={isDark} onToggleTheme={toggle} />
        <main className="flex-1">
          {page === 'analyze' ? (
            <Suspense fallback={<div className="min-h-[60vh]" />}>
              <AnalyzerPage isDarkMode={isDark} />
            </Suspense>
          ) : (
            <GuidePage />
          )}
        </main>
        <SiteFooter />
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
