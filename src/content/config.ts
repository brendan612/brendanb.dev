import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
	type: 'content',
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
