import { getCollection } from 'astro:content';

// Drafts appear only in a build run with SHOW_DRAFTS=1 (used for release checks
// on a sample guide). A normal build, including the one Cloudflare runs, skips them.
export const showDrafts = () => process.env.SHOW_DRAFTS === '1';

export const getGuides = async () => {
  const all = await getCollection('guides', ({ data }) => showDrafts() || !data.draft);
  // Hubs first, then newest first.
  return all.sort((a, b) =>
    Number(b.data.isHub) - Number(a.data.isHub) || b.data.published - a.data.published);
};

// "October 15, 2026", fixed to UTC so the date never shifts with the build machine.
export const formatDate = (d) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// Frontmatter text (descriptions, source titles) is typed with straight apostrophes;
// show them curly, like the Markdown body text.
export const curly = (s) => s.replace(/'/g, '\u2019');

export const isoDate = (d) => d.toISOString().slice(0, 10);
