// Where a visit came from, for the early-access form (see SITE-OPS.md).
//
// An "arrival" is a page view that starts a visit or comes from outside the site:
// the first page opened in this browser tab, a page reached from another website,
// or a link carrying campaign tags (?utm_source=...). Clicks between our own pages,
// reloads, and back/forward are not arrivals.
//
// Each arrival is kept as one record (page, referring site, campaign tags), so those
// values always belong together. We keep the first arrival in the tab and, if the
// visitor later comes back in the same tab through another link, the latest one too.
// Only the site and path of a referrer are kept, never query strings or search terms.
// Records live in sessionStorage: they stay in this tab, leave the browser only if
// the visitor submits the form, and disappear when the tab closes. If storage is
// blocked, nothing is remembered and unknown values stay blank instead of guessed.

export const TAG_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];
const FIRST = 'scamprep_arrival_first';
const LATEST = 'scamprep_arrival_latest';
const MAX = 200; // longest value kept, in characters

const read = (key) => {
  try {
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
const referrerUrl = () => {
  try {
    return document.referrer ? new URL(document.referrer) : null;
  } catch {
    return null;
  }
};
const navigationType = () => {
  try {
    return performance.getEntriesByType('navigation')[0]?.type || 'navigate';
  } catch {
    return 'navigate';
  }
};

function recordThisPageView() {
  const ref = referrerUrl();
  const internal = !!ref && ref.hostname === location.hostname;
  const view = {
    page: location.pathname.slice(0, MAX),
    referrer: ref && !internal ? (ref.origin + ref.pathname).slice(0, MAX) : '',
  };
  const params = new URLSearchParams(location.search);
  for (const k of TAG_KEYS) {
    const v = params.get(k);
    if (v) view[k] = v.slice(0, MAX);
  }
  const fromOutside = !!view.referrer || TAG_KEYS.some((k) => view[k]);
  const revisit = ['reload', 'back_forward'].includes(navigationType());

  const first = read(FIRST);
  if (!first) {
    // A first page reached from one of our own pages (for example a link opened in a
    // new tab) has no knowable starting point, so it is not recorded as an arrival.
    if (internal && !fromOutside) return { first: null, latest: null };
    if (write(FIRST, view)) return { first: view, latest: null };
    // Storage is blocked: only this page's own evidence of an outside arrival counts.
    return { first: fromOutside ? view : null, latest: null };
  }
  if (fromOutside && !revisit && write(LATEST, view)) return { first, latest: view };
  return { first, latest: read(LATEST) };
}

// Records this page view once (the layout and the form page both ask) and returns
// { first, latest }, either of which may be null.
export function recordArrival() {
  if (!window.__scamprepArrival) window.__scamprepArrival = recordThisPageView();
  return window.__scamprepArrival;
}

// The page on our own site the visitor clicked through from, or '' if unknown.
export function previousPage() {
  const ref = referrerUrl();
  if (!ref || ref.hostname !== location.hostname || ref.pathname === location.pathname) return '';
  return ref.pathname.slice(0, MAX);
}
