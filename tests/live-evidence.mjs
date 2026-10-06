import * as cheerio from 'cheerio';

// Compare authored content and behavior, ignoring the analytics script Cloudflare
// injects and harmless HTML serialization differences. This is not a byte-for-byte
// deployment attestation; pair it with the deployed commit in Cloudflare.
export function pageSignature(html) {
  const $ = cheerio.load(html);
  $('script[src*="cloudflareinsights.com"]').remove();
  const text = (s) => s.replace(/\s+/g, ' ').trim();
  const scripts = $('script').toArray().map((el) => ({
    src: $(el).attr('src') || '', type: $(el).attr('type') || '', content: text($(el).text()),
  }));
  $('script, style').remove();
  return JSON.stringify({
    title: $('title').text(),
    metadata: $('meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"]').toArray().map((el) => $(el).attr('content')),
    canonical: $('link[rel="canonical"]').attr('href'),
    text: text($('body').text()),
    controls: $('a, form, input, button, select, textarea, img, link[rel="stylesheet"]').toArray().map((el) => {
      const attrs = {};
      for (const key of ['href', 'action', 'method', 'src', 'name', 'type', 'value', 'required', 'aria-label', 'aria-controls', 'data-annual', 'data-monthly']) {
        const value = $(el).attr(key);
        if (value !== undefined) attrs[key] = value;
      }
      return attrs;
    }),
    scripts,
  });
}

export function formEndpointStatus(status) {
  if (status === 404) return 'missing';
  // A GET can legitimately return 405 for a POST-only form. It does not
  // establish that submissions will be accepted or delivered to the inbox.
  if (status === 405 || (status >= 200 && status < 400)) return 'reachable';
  return 'unverified';
}
