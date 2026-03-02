import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// Change adapter for production:
//   Vercel → import vercel from '@astrojs/vercel'; adapter: vercel()
//   Netlify → import netlify from '@astrojs/netlify'; adapter: netlify()
export default defineConfig({
  site: 'https://www.splittours.com', // update before deploy
  // output: 'static' is the default in Astro 5. Pages are statically prerendered
  // unless they opt out with `export const prerender = false` (e.g. API routes).
  adapter: node({ mode: 'standalone' }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
