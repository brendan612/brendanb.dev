import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
		repoUrl: z.string().url().optional(),
		liveUrl: z.string().url().optional(),
		status: z.enum(['live', 'in-progress', 'archived']).default('live'),
	}),
});

export const collections = { projects };
