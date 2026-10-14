// Guides: reference pages at /guides/<slug>, one Markdown file each in
// src/content/guides/. The file name is the address, so keep it short and
// never change it once a guide is live (that would break links and rankings).
// How a guide gets made: ~/ScamPrep/seo/article-standard.md.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/guides' }),
  schema: z.object({
    // The h1 and the page title, in sentence case. Matches the search.
    title: z.string(),
    // Optional shorter title for the browser tab and Google (" | ScamPrep" is added).
    seoTitle: z.string().optional(),
    // The search description: 70 to 160 characters, approved by Bryce.
    description: z.string().min(50).max(170),
    published: z.coerce.date(),
    // Change only after a real review, and note what changed in the guide's
    // folder in ~/ScamPrep/seo/articles/.
    reviewed: z.coerce.date(),
    // Which part of the guides index it sits in (see src/data/guides.js).
    hub: z.enum(['before', 'scams', 'after']),
    // For scam guides: how the scam reaches people (groups the "scams" hub).
    arrives: z.enum(['calls', 'texts', 'emails', 'in-person']).optional(),
    // True for the three hub guides, which lead their section of the index.
    isHub: z.boolean().default(false),
    // Drafts are built only with SHOW_DRAFTS=1 (release checks), never in production.
    draft: z.boolean().default(false),
    // Primary sources, in the order they appear. Shown at the end of the guide.
    sources: z.array(z.object({
      publisher: z.string(),
      title: z.string(),
      url: z.string().url(),
      date: z.coerce.string().optional(), // as the source states it, e.g. 2026 or "June 2026"
    })).min(1),
    // Slugs of two to four related guides. Unpublished ones are skipped.
    related: z.array(z.string()).default([]),
    // Corrections that changed the advice, newest first. Shown at the end.
    corrections: z.array(z.object({ date: z.coerce.date(), note: z.string() })).default([]),
  }),
});

export const collections = { guides };
