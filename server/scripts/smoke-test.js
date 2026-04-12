#!/usr/bin/env node
/**
 * Tests rapides contre une API locale (serveur déjà démarré).
 * Usage: SMOKE_URL=http://127.0.0.1:5000 node scripts/smoke-test.js
 */

const http = require('node:http');
const https = require('node:https');

const BASE = process.env.SMOKE_URL || 'http://127.0.0.1:5001';

function req(method, path, jsonBody) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, BASE);
    const lib = u.protocol === 'https:' ? https : http;
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method,
      headers: {},
    };
    let body = '';
    if (jsonBody !== undefined) {
      body = JSON.stringify(jsonBody);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const r = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => {
        data += c;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  let failed = 0;
  const t = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
    } catch (e) {
      console.error(`  ✗ ${name}: ${e.message}`);
      failed += 1;
    }
  };

  console.log(`Smoke tests → ${BASE}\n`);

  await t('GET /', async () => {
    const { status, body } = await req('GET', '/');
    assert(status === 200, `status ${status}`);
    assert(body.includes('ZenShop'), 'body');
  });

  await t('GET /api/health', async () => {
    const { status, body } = await req('GET', '/api/health');
    assert(status === 200, `status ${status}`);
    const j = JSON.parse(body);
    assert(j.ok === true, 'json.ok');
  });

  await t('GET /api/products', async () => {
    const { status, body } = await req('GET', '/api/products');
    assert(status === 200, `status ${status}`);
    const j = JSON.parse(body);
    assert(Array.isArray(j.products), 'products array');
  });

  await t('POST /api/auth/register invalid email → 400', async () => {
    const { status } = await req('POST', '/api/auth/register', {
      email: 'bad',
      password: 'secret12',
    });
    assert(status === 400, `status ${status}`);
  });

  await t('POST /api/auth/login unknown → 401', async () => {
    const { status } = await req('POST', '/api/auth/login', {
      email: 'nobody@example.com',
      password: 'wrongpass',
    });
    assert(status === 401, `status ${status}`);
  });

  await t('GET /api/messages/inbox/all sans token → 401', async () => {
    const { status } = await req('GET', '/api/messages/inbox/all');
    assert(status === 401, `status ${status}`);
  });

  console.log(failed ? `\n${failed} échec(s)` : '\nTous les tests OK.');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
