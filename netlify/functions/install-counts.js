// Tracks REAL install-button clicks per automation, persisted in Netlify Blobs
// (a free key/value store built into Netlify — no external service or signup
// needed). This is what lets the homepage show genuine "X installs" numbers
// instead of static marketing copy.
//
//   GET  /api/install-counts        -> { [automationId]: liveTrackedCount, ... }
//   POST /api/install-counts {id}   -> { id, installs }  (increments by 1)
//
// Note: increments are read-modify-write, not atomic. Under heavy concurrent
// traffic a handful of clicks landing in the same instant could undercount by
// one or two — an acceptable trade-off for a "look how popular this is" stat
// on a marketplace page, and avoids needing a real database.

import { getStore } from '@netlify/blobs';

const STORE_NAME = 'pokepals-install-counts';
const ID_PATTERN = /^[a-z0-9-]{1,100}$/i;

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}

export default async (request) => {
  const store = getStore(STORE_NAME);

  if (request.method === 'GET') {
    const { blobs } = await store.list();
    const counts = {};
    await Promise.all(blobs.map(async ({ key }) => {
      counts[key] = parseInt(await store.get(key), 10) || 0;
    }));
    return json(counts, { headers: { 'Cache-Control': 'public, max-age=15' } });
  }

  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const id = typeof body?.id === 'string' ? body.id.trim() : '';
    if (!ID_PATTERN.test(id)) {
      return json({ error: 'Invalid or missing automation id' }, { status: 400 });
    }

    const current = parseInt(await store.get(id), 10) || 0;
    const next = current + 1;
    await store.set(id, String(next));
    return json({ id, installs: next });
  }

  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });
};

export const config = {
  path: '/api/install-counts',
};
