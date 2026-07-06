import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://ape-bambooemf.com',
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    icon(),
  ],
});
