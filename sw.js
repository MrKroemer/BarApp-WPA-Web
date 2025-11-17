const CACHE_NAME = 'stitch-bar-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Ignore favicon requests to prevent errors
  if (event.request.url.includes('favicon.ico')) {
    event.respondWith(new Response('', { status: 204 }));
    return;
  }
  
  // Let other requests pass through
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Offline', { status: 503 });
  }));
});