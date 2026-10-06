import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageSignature, formEndpointStatus } from './live-evidence.mjs';

const html = '<html><head><title>Same title</title><link rel="stylesheet" href="/_astro/a.css"></head><body><main><p>Annual $108</p><form action="https://formspree.io/f/example"><input name="email" required></form></main><script>const retry = 1;</script></body></html>';
test('same title cannot conceal stale copy, form destinations, scripts or assets', () => {
  for (const [before, after] of [['$108', '$109'], ['/f/example', '/f/wrong'], ['retry = 1', 'retry = 2'], ['a.css', 'b.css']]) {
    assert.notEqual(pageSignature(html), pageSignature(html.replace(before, after)));
  }
});
test('edge analytics injection does not masquerade as a stale deployment', () => {
  assert.equal(pageSignature(html), pageSignature(html.replace('</body>', '<script src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="example"></script></body>')));
});
test('Formspree network errors, rate limits and server failures cannot pass', () => {
  for (const status of ['fetch failed', undefined, 429, 500, 503]) assert.equal(formEndpointStatus(status), 'unverified');
  assert.equal(formEndpointStatus(404), 'missing');
  for (const status of [200, 302, 405]) assert.equal(formEndpointStatus(status), 'reachable');
});
