// 001:T002 Static output, site URL, bilingual routing and sitemap (research R1, R3)
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sammieetje.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  i18n: {
    locales: ['en', 'nl'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en-GB', nl: 'nl-NL' } },
      filter: (page) => !page.endsWith('/404/'),
    }),
  ],
});
