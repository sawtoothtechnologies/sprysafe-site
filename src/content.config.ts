// Guides: reference pages at /guides/<slug>, one Markdown file each in
// src/content/guides/. The file name is the address, so keep it short and
// never change it once a guide is live (that would break links and rankings).
// How a guide gets made: ~/ScamPrep/seo/article-standard.md.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

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
    // The guide's own share image (1200 by 630, in public/share/) and its alt text.
    // Required once a guide is published (checked below).
    // Rule: ~/ScamPrep/seo/article-standard.md, "Its own preview image".
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    // Slugs of two to four related guides. Unpublished ones are skipped.
    related: z.array(z.string()).default([]),
    // Corrections that changed the advice, newest first. Shown at the end.
    corrections: z.array(z.object({ date: z.coerce.date(), note: z.string() })).default([]),
  }).superRefine((d, ctx) => {
    // Every published guide needs its own share image, so it can't go live with the
    // generic one. This fails the build (locally and on Cloudflare) until it's fixed.
    // How to make one: brand/share-image/README.md, "One image per guide".
    if (d.draft) return;
    const fix = 'see brand/share-image/README.md, "One image per guide"';
    if (!d.image) {
      ctx.addIssue({ code: 'custom', path: ['image'], message: `Published guides need their own share image (${fix}).` });
      return;
    }
    if (!/^\/share\/[a-z0-9-]+\.png$/.test(d.image)) {
      ctx.addIssue({ code: 'custom', path: ['image'], message: `Share image should be /share/<guide-slug>.png, got ${d.image}.` });
    } else if (!existsSync(join(process.cwd(), 'public', d.image))) {
      ctx.addIssue({ code: 'custom', path: ['image'], message: `Share image public${d.image} doesn't exist (${fix}).` });
    }
    if (!d.imageAlt) {
      ctx.addIssue({ code: 'custom', path: ['imageAlt'], message: 'Published guides need imageAlt text for their share image.' });
    }
  }),
});

export const collections = { guides };
