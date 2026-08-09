// @ts-check

import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
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
	// Render терминирует TLS и проксирует до приложения по http. Без этого списка
	// Astro игнорирует x-forwarded-proto, считает соединение незашифрованным,
	// и Auth.js выдаёт куки без Secure и callback-адреса на http://.
	security: {
		allowedDomains: [{ hostname: 'ai-digest-qedk.onrender.com', protocol: 'https' }],
	},
	integrations: [mdx(), auth()],
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false,
		},
	},
});
