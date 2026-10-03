import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { publicPath } from './src/lib/public-url.js';

// Reachable pages kept out of search results (each also sets noindex on the page).
// Compared as public paths, so /thanks, /thanks/ and /thanks.html all match.
const notInSitemap = new Set(['/thanks']);

export default defineConfig({
  site: 'https://getscamprep.com',
  trailingSlash: 'never',
  // One flat file per page (about.html), which Cloudflare Pages serves at /about
  // with a 200. Directory output (about/index.html) made /about redirect to /about/.
  build: { format: 'file' },
  integrations: [
    sitemap({ filter: (page) => !notInSitemap.has(publicPath(new URL(page).pathname)) }),
  ],
});
