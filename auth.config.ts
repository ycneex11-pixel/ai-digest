import Credentials from '@auth/core/providers/credentials';
import { defineConfig } from 'auth-astro';

export default defineConfig({
	providers: [
		Credentials({
			name: 'Email и пароль',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Пароль', type: 'password' },
			},
			authorize(credentials) {
				const email = credentials?.email as string | undefined;
				const password = credentials?.password as string | undefined;
				const validEmail = import.meta.env.AUTH_EMAIL;
				const validPassword = import.meta.env.AUTH_PASSWORD;

				if (!validEmail || !validPassword) return null;
				if (email === validEmail && password === validPassword) {
					return { id: '1', email };
				}
				return null;
			},
		}),
	],
	pages: {
		signIn: '/login',
	},
});
