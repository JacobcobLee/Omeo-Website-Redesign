/* ============================================================
   OMEO — Local dev server + Claude API proxy
   Run:  node server.js
   Then: open http://localhost:3000
   ============================================================ */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const API_KEY  = process.env.ANTHROPIC_API_KEY || '';
const PORT     = 3000;
const ROOT     = __dirname;

/* ---------- System prompt ---------- */
const SYSTEM = `You are the OMEO Alpine Concierge — the hype person at Billie's OMEO Ski Hire in Omeo, Victoria, the gateway to the Victorian Alps. You're that friend who's been shredding since forever and genuinely loves helping people find the right gear.

VIBE: Fun, energetic, knowledgeable. Use snow/ski culture language when it fits naturally. Never be boring. Keep replies SHORT — 2 to 4 sentences unless they ask for detail. Be real, not corporate.

OMEO STORE INFO:
- Based in Omeo, VIC — gateway to Mount Hotham and Falls Creek
- 10+ years outfitting riders and skiers
- Free shipping on orders over $500

CURRENT PRODUCT CATALOG:
Snowboards:
  • Turbo Men's Snowboard — $699 | All-mountain, hybrid camber, paulownia wood core, 152–168cm, stiff flex (7/10), Midnight Black / Arctic Blue / Storm Grey

Bindings:
  • Hydra-Flex Pro Bindings — $249
  • Blaster AsymWrap Bindings — $199

Skis:
  • Azure Velocity Skis — $599
  • Mindbender 90 Skis — $749 | K2, all-mountain

Apparel:
  • Sabre Snow Jacket — $649 | Arc'teryx-style, black
  • Essentials Cotton Hoodie — $89 | 380gsm organic cotton, XS–XXL, Black / Slate Grey / Off-White

Accessories:
  • Bag Pro (snowboard bag) — $129
  • Method II Snow Goggles — $219

Footwear:
  • Booties — $79

When recommending products, be specific and enthusiastic. If someone asks what they need for their first season or a specific mountain, give them a real answer. If you don't know something about snow conditions or real-world current events, say so honestly.`;

/* ---------- MIME types ---------- */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.md':   'text/plain',
};

/* ---------- Server ---------- */
const server = http.createServer((req, res) => {

  /* CORS pre-flight */
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  /* ── API proxy ─────────────────────────────────────────── */
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!API_KEY) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set on server' }));
        return;
      }

      let parsed;
      try { parsed = JSON.parse(body); }
      catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const payload = JSON.stringify({
        model:      'claude-haiku-4-5',
        max_tokens: 512,
        system:     SYSTEM,
        messages:   parsed.messages || [],
      });

      const apiReq = https.request(
        {
          hostname: 'api.anthropic.com',
          path:     '/v1/messages',
          method:   'POST',
          headers:  {
            'Content-Type':      'application/json',
            'Content-Length':    Buffer.byteLength(payload),
            'x-api-key':         API_KEY,
            'anthropic-version': '2023-06-01',
          },
        },
        apiRes => {
          let data = '';
          apiRes.on('data', chunk => { data += chunk; });
          apiRes.on('end', () => {
            res.writeHead(apiRes.statusCode, {
              'Content-Type':                'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(data);
          });
        }
      );

      apiReq.on('error', err => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });

      apiReq.write(payload);
      apiReq.end();
    });
    return;
  }

  /* ── Static file server ────────────────────────────────── */
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/')        urlPath = '/index.html';

  /* Block access to server internals */
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') { res.writeHead(404); res.end('Not found'); }
      else                       { res.writeHead(500); res.end('Server error'); }
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n🏔️  OMEO local server ready');
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   API key: ${API_KEY ? '✅ loaded from ANTHROPIC_API_KEY' : '❌ not set — run: set ANTHROPIC_API_KEY=sk-ant-...'}\n`);
});
