const CACHE_NAME = 'motoreduca-v1';
// Lista de archivos que queremos que funcionen offline
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './motor.js',
  './curso_bio.json',
  './manifest.json',
  './icono-192.png',
  './icono-512.png'
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
  // Si lo que pedimos es el archivo JSON del curso...
  if (event.request.url.includes('.json')) {
    event.respondWith(
      // 1. Intentamos ir a la red primero
      fetch(event.request)
        .then((response) => {
          // Si hay internet, guardamos una copia fresca y la devolvemos
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // 2. Si falla la red (offline), buscamos en la caché
          return caches.match(event.request);
        })
    );
  } else {
    // Para el resto (CSS, JS, Imágenes), seguimos con la caché primero
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
