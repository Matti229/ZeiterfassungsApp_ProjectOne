const cacheName = 'zeiterfassung-v1';
const filesToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './auth.js',
  './login.html',
  './register.html',
  './manifest.json',
  './icons/start.png',
  './icons/pause.png',
  './icons/stop.png',
  './icons/logout.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
