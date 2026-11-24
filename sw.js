const SCOPE = self.registration.scope;
const PREFIX = `operator-hub-shell:${SCOPE}:`;
const CACHE = `${PREFIX}cbf8e106b4ecb558`;
const SHELL_URL = new URL('index.html', SCOPE).href;
const PRECACHE = ["index.html","app.webmanifest","favicon.svg","apple-touch-icon.png","icon-192.png","icon-512.png","index-B9DDNbHm.css","index-DWAT14e3.js"].map(file => new URL(file, SCOPE).href);
const STATIC_URLS = new Set(PRECACHE);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' })));
    // Let existing tabs finish with their matching app version. The first
    // install activates immediately; updates activate once old tabs close.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Cache only the compiled app, never arbitrary requests or user records.
  const path = `${url.origin}${url.pathname}`;
  const isHome = event.request.mode === 'navigate' && (path === SCOPE || path === SHELL_URL);
  const key = isHome ? SHELL_URL : url.href;
  if (!STATIC_URLS.has(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(key)) ?? fetch(event.request);
  })());
});
