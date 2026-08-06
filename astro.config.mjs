import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://getscamprep.com',
  trailingSlash: 'never',
  integrations: [sitemap()],
});
