// Tiny static server for dist/ that behaves like Cloudflare Pages for the parts
// the tests care about: extensionless URLs (/about -> about.html), the
// public/_redirects rules, and a real 404 status with 404.html as the body.
// Usage: node tests/serve.mjs [port]   (default 4329)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2] || process.env.PORT || 4329);

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.json': 'application/json', '.woff2': 'font/woff2',
};

const redirects = [];
const rfile = path.join(root, '_redirects');
if (fs.existsSync(rfile)) {
  for (const line of fs.readFileSync(rfile, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [from, to, code = '302'] = t.split(/\s+/);
    redirects.push({ from, to, code: Number(code) });
  }
}

function send(res, status, file, extraHeaders = {}) {
  res.writeHead(status, { 'content-type': types[path.extname(file)] || 'application/octet-stream', ...extraHeaders });
  fs.createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let p = decodeURIComponent(url.pathname);

  const r = redirects.find((x) => x.from === p);
  if (r) { res.writeHead(r.code, { location: r.to }); return res.end(); }

  // Cloudflare Pages strips .html and trailing slashes with a redirect.
  if (p.endsWith('.html')) {
    const bare = p === '/index.html' ? '/' : p.slice(0, -5);
    res.writeHead(308, { location: bare + url.search }); return res.end();
  }
  if (p.length > 1 && p.endsWith('/')) {
    res.writeHead(308, { location: p.slice(0, -1) + url.search }); return res.end();
  }

  const candidates = p === '/' ? ['index.html'] : [p.slice(1), p.slice(1) + '.html', path.join(p.slice(1), 'index.html')];
  for (const c of candidates) {
    const f = path.join(root, c);
    if (!f.startsWith(root)) break;
    if (fs.existsSync(f) && fs.statSync(f).isFile() && !path.basename(f).startsWith('_')) return send(res, 200, f);
  }
  send(res, 404, path.join(root, '404.html'));
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
