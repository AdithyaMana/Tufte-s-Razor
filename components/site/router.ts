import type { MouseEvent } from 'react';

// One page, so "routing" is just moving between its parts.

/** Scrolls to the element named by a hash, or to the top when there is none. */
export function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, '');
  const el = id ? document.getElementById(id) : null;
  if (el) el.scrollIntoView();
  else window.scrollTo(0, 0);
}

/** Goes to a part of the page (e.g. "#bar-width", or "" for the top), keeping the address in step. */
export function navigate(hash: string) {
  // From another page (e.g. /contact), the guide's parts are a page load away.
  if (window.location.pathname !== '/') {
    window.location.assign(`/${window.location.search}${hash}`);
    return;
  }
  const url = window.location.pathname + window.location.search + hash;
  window.history.pushState({}, '', hash ? url : window.location.pathname + window.location.search);
  scrollToHash(hash);
}

/** onClick for plain <a href> links within the page. */
export function linkHandler(hash: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(hash);
  };
}
