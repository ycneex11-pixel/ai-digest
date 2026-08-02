// @ts-check

import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import auth from 'auth-astro';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	output: 'server',
	adapter: vercel(),
	integrations: [mdx(), sitemap(), auth()],
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false,
		},
	},
});
