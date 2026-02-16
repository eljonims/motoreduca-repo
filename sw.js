const CACHE_NAME = 'motoreduca-v1';
// Lista de archivos que queremos que funcionen offline
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './motor.js',
  './curso_bio.json'
];

// 1. INSTALACIÓN: Guarda los archivos en el "archivador" del navegador
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. ACTIVACIÓN: Limpia versiones viejas si las hubiera
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 3. INTERCEPCIÓN: Si no hay internet, entrega los archivos guardados
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
