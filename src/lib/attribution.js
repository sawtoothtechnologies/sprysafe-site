// Where a visit came from, for the early-access form (see SITE-OPS.md).
// Base.astro inlines this file as a plain script on every page, so it runs while the
// page loads, before the form's own script, with nothing extra to download.
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
(() => {
  const TAG_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];
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
  // A reload or back/forward keeps the page's original referrer, so it must not count
  // as a new arrival. Three checks, strongest first:
  // 1. Each page view marks its own entry in the browser's history. A reload or a
  //    back/forward visit returns to an entry that is already marked; a genuine new
  //    arrival always starts in a fresh, unmarked entry.
  // 2. The navigation type the browser reports (reload or back_forward).
  // 3. If the browser gives neither sign (Firefox under the test tool gave none), a
  //    page view that exactly repeats the most recent arrival is the same visit.
  //    Comparing with the most recent arrival only (not the first) keeps a genuine
  //    return to an earlier source, like Google, then LinkedIn, then Google again.
  const sameArrival = (a, b) =>
    !!a && !!b && a.page === b.page && a.referrer === b.referrer && TAG_KEYS.every((k) => (a[k] || '') === (b[k] || ''));
  const alreadySeen = () => {
    try {
      const state = history.state && typeof history.state === 'object' ? history.state : null;
      if (state && state.scamprepSeen) return true;
      history.replaceState({ ...(state || {}), scamprepSeen: true }, '');
    } catch {}
    return false;
  };

  const recordThisPageView = () => {
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
    const repeat = alreadySeen() || ['reload', 'back_forward'].includes(navigationType());

    const first = read(FIRST);
    if (!first) {
      // A first page reached from one of our own pages (for example a link opened in a
      // new tab) has no knowable starting point, so it is not recorded as an arrival.
      if (internal && !fromOutside) return { first: null, latest: null };
      if (write(FIRST, view)) return { first: view, latest: null };
      // Storage is blocked: only this page's own evidence of an outside arrival counts.
      return { first: fromOutside ? view : null, latest: null };
    }
    const latest = read(LATEST);
    const sameVisit = repeat || sameArrival(view, latest || first);
    if (fromOutside && !sameVisit && write(LATEST, view)) return { first, latest: view };
    return { first, latest };
  };

  let result = null;
  window.scamprepAttribution = {
    TAG_KEYS,
    // Records this page view once and returns { first, latest }, either may be null.
    recordArrival: () => result || (result = recordThisPageView()),
    // The page on our own site the visitor clicked through from, or '' if unknown.
    previousPage: () => {
      const ref = referrerUrl();
      if (!ref || ref.hostname !== location.hostname || ref.pathname === location.pathname) return '';
      return ref.pathname.slice(0, MAX);
    },
  };
  window.scamprepAttribution.recordArrival();
})();
