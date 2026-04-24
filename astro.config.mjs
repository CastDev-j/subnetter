// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: cloudflare(),
  image: {
    service: passthroughImageService(),
  },
});