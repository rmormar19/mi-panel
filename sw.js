/* Mi panel · service worker: la app abre sin internet. Los datos viven en el celular (localStorage), no acá. */
const V = 'mipanel-202611122209';
const BASE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './fuentes/plex-400.woff2', './fuentes/plex-500.woff2', './fuentes/plex-600.woff2', './fuentes/manrope-700.woff2', './fuentes/manrope-800.woff2'];
/* 11 nov 2026 · al instalar una versión nueva se piden los archivos al servidor, nunca a la copia del navegador */
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(BASE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mipanel-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;          // el puente (Google) va siempre directo, nunca se guarda acá
  // primero lo guardado (no gasta datos); si hay internet, se refresca por detrás para la próxima vez
  e.respondWith(caches.open(V).then(c => c.match(r.mode === 'navigate' ? './index.html' : r, { ignoreSearch: true }).then(hit => {
    const red = fetch(r.mode === 'navigate' ? new Request('./index.html', { cache: 'no-cache' }) : new Request(r, { cache: 'no-cache' })).then(res => { if (res && res.ok) c.put(r.mode === 'navigate' ? './index.html' : r, res.clone()); return res; }).catch(() => hit);
    return hit || red;
  })));
});
