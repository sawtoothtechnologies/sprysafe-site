// Public page addresses, shared by Base.astro and the sitemap config.
//
// The site builds one flat file per page (build.format 'file': about.astro ->
// about.html, solutions/index.astro -> solutions.html), and Cloudflare Pages
// serves each at its extensionless path: /about, never /about.html or /about/.
// During a build Astro.url.pathname is the file (/about.html, and the homepage
// could appear as /index.html), so anything that prints a page's own address
// runs it through publicPath first. Don't use this for asset URLs.

/**
 * '/index.html' -> '/', '/solutions/index.html' -> '/solutions',
 * '/solutions.html' -> '/solutions', '/solutions/' -> '/solutions'.
 * Only a terminal '/index.html' or '.html' is removed, never text mid-path.
 */
export function publicPath(pathname) {
  let path = pathname.replace(/[?#].*$/, ''); // no query string or fragment
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/+$/, ''); // no trailing slash
  if (path.endsWith('/index.html')) path = path.slice(0, -'/index.html'.length);
  else if (path.endsWith('.html')) path = path.slice(0, -'.html'.length);
  return path || '/';
}

/** Absolute public URL, e.g. ('/about.html', site) -> 'https://getscamprep.com/about'. */
export function publicUrl(pathname, site) {
  return new URL(publicPath(pathname), site).href;
}
