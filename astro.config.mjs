// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://antisocialaudio.co.uk',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
