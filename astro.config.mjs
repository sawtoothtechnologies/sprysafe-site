import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { publicPath } from './src/lib/public-url.js';

// Reachable pages kept out of search results (each also sets noindex on the page).
// Compared as public paths, so /thanks, /thanks/ and /thanks.html all match.
const notInSitemap = new Set(['/thanks', '/welcome', '/what-to-expect']);

export default defineConfig({
  site: 'https://getscamprep.com',
  trailingSlash: 'never',
  // One flat file per page (about.html), which Cloudflare Pages serves at /about
  // with a 200. Directory output (about/index.html) made /about redirect to /about/.
  build: { format: 'file' },
  // Shared stylesheets take their name from one of the pages that use them, so the
  // /guides/[slug] route would produce "_slug_.css". Files starting with "_" are
  // treated as special by Cloudflare Pages (and by tests/serve.mjs), so strip the
  // brackets and underscores from asset names.
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: (asset) => {
            const name = (asset.names?.[0] ?? asset.name ?? 'asset').replace(/\.[^.]+$/, '');
            const clean = name.replace(/[\[\]]/g, '').replace(/^_+|_+$/g, '') || 'asset';
            return `_astro/${clean}.[hash][extname]`;
          },
        },
      },
    },
  },
  integrations: [
    sitemap({ filter: (page) => !notInSitemap.has(publicPath(new URL(page).pathname)) }),
  ],
});
