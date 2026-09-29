import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface InkMapState {
  /** Every chart drawn as an ink map: the switch in the header. */
  charts: boolean;
  /** The page itself coloured by role, as an analogy: the reveal at the end of the guide. */
  page: boolean;
  toggleCharts: () => void;
  setPage: (on: boolean) => void;
}

export function useInkMapState(): InkMapState {
  const [charts, setCharts] = useState(false);
  const [page, setPage] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('inkmap', page);
  }, [page]);

  // With the page map on, everything is already an ink map; the switch turns it all off.
  const toggleCharts = useCallback(() => {
    if (page) {
      setPage(false);
      setCharts(false);
    } else {
      setCharts((on) => !on);
    }
  }, [page]);

  return { charts, page, toggleCharts, setPage };
}

export const InkMapContext = createContext<InkMapState>({ charts: false, page: false, toggleCharts: () => {}, setPage: () => {} });

export function useInkMap() {
  return useContext(InkMapContext);
}

/** Whether charts should be drawn as ink maps right now. */
export function useChartsAsInkMaps(): boolean {
  const { charts, page } = useInkMap();
  return charts || page;
}
