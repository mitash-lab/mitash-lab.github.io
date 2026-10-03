// Service worker mínimo: permite instalar la web como app y abrirla aunque la señal sea mala.
// Siempre intenta la red primero (para tener la última versión) y usa la copia guardada si no hay conexión.
const CACHE = 'mitash-v2';
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
  e.respondWith(fetch(e.request).then(r => {
    const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r;
  }).catch(() => caches.match(e.request)));
});
