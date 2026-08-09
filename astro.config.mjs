// @ts-check

import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import auth from 'auth-astro';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://ai-digest-qedk.onrender.com',
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	// Render пробрасывает порт через PORT и проверяет его снаружи —
	// сервер должен слушать 0.0.0.0, а не localhost.
	server: { host: true },
	integrations: [mdx(), sitemap(), auth()],
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false,
		},
	},
});
