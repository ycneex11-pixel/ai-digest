import { defineMiddleware } from 'astro:middleware';
import { getSession } from 'auth-astro/server';

const PUBLIC_PATHS = ['/login'];

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	// /api/auth/* must stay reachable without a session — it's what issues the session.
	if (pathname.startsWith('/api/auth') || PUBLIC_PATHS.includes(pathname)) {
		return next();
	}

	const session = await getSession(context.request);
	if (!session) {
		const callbackUrl = encodeURIComponent(pathname + context.url.search);
		return context.redirect(`/login?callbackUrl=${callbackUrl}`);
	}

	return next();
});
