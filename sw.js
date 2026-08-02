// ============================================================
//  VOYARA — Service Worker
//  ⚠️ SUBE LA VERSIÓN cada vez que cambies un archivo,
//     o los visitantes seguirán viendo la versión vieja.
// ============================================================
const VERSION = 'voyara-v2.1';

const ARCHIVOS = [
  './',
  './index.html',
  './legal.html',
  './css/style.css',
  './js/config.js',
  './js/cookies.js',
  './js/i18n.js',
  './js/data.js',
  './js/contenido.js',
  './js/fotos.js',
  './js/arte.js',
  './js/app.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Solo cacheamos lo nuestro; las APIs y los socios siempre van a la red
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  // Red primero para el HTML (así ven los cambios), caché primero para el resto
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(VERSION).then(k => k.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const c = res.clone();
      caches.open(VERSION).then(k => k.put(e.request, c));
      return res;
    }).catch(() => r))
  );
});
