import { createContext, useContext, useEffect, useState } from 'react';

export interface InkMapState {
  /** The page itself coloured by role, as an analogy: the reveal at the end of the guide. */
  page: boolean;
  setPage: (on: boolean) => void;
}

export function useInkMapState(): InkMapState {
  const [page, setPage] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('inkmap', page);
  }, [page]);

  return { page, setPage };
}

export const InkMapContext = createContext<InkMapState>({ page: false, setPage: () => {} });

export function useInkMap() {
  return useContext(InkMapContext);
}

/** Whether charts should be drawn as ink maps right now: only while the page reveal is on. */
export function useChartsAsInkMaps(): boolean {
  return useInkMap().page;
}
