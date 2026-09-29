import { useSyncExternalStore, type MouseEvent } from 'react';

// A two-page site doesn't need a router library: pushState plus a subscription is enough.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

/** Scrolls to the element named by a hash, or to the top when there is none. */
export function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, '');
  const el = id ? document.getElementById(id) : null;
  if (el) el.scrollIntoView();
  else window.scrollTo(0, 0);
}

export function navigate(to: string) {
  const url = new URL(to, window.location.href);
  const samePage = url.pathname === window.location.pathname;
  window.history.pushState({}, '', url.pathname + url.hash);
  listeners.forEach((listener) => listener());
  // Let the new page render before scrolling to an anchor on it.
  if (samePage) scrollToHash(url.hash);
  else requestAnimationFrame(() => scrollToHash(url.hash));
}

/** onClick for plain <a href> elements that should route without a full reload. */
export function linkHandler(to: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  };
}
