// Service worker mÃ­nimo: permite instalar la web como app y abrirla aunque la seÃ±al sea mala.
// Siempre pide la versiÃ³n nueva a la red (sin cachÃ© del navegador) y usa la copia guardada solo si no hay conexiÃ³n.
const CACHE = 'mitash-v5';
const BASICOS = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Supabase y CDN van directo
  e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => {
    const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r;
  }).catch(() => caches.match(e.request)));
});
