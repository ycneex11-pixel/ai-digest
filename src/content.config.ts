import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			// Обложка, сгенерированная cover-artist: удалённый URL с Replicate.
			// В отличие от heroImage это не локальный файл, поэтому не image().
			cover: z.string().url().optional(),
			source: z.string().url().optional(),
			tags: z.array(z.string()).default([]),
		}),
});

export const collections = { blog };
