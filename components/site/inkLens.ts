import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * The ink map, as a lens over the whole site: when it is on, every chart is coloured by
 * kind of ink, and so is the page itself (see the .inkmap tokens in index.css).
 */
export function useInkLensState() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('inkmap', on);
  }, [on]);

  const toggle = useCallback(() => setOn((current) => !current), []);

  return { on, toggle };
}

export const InkLensContext = createContext<{ on: boolean; toggle: () => void }>({ on: false, toggle: () => {} });

export function useInkLens() {
  return useContext(InkLensContext);
}
