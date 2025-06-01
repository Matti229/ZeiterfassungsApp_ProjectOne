const CACHE_NAME = "zeiterfassung-v1";
const urlsToCache = [
  "/ZeiterfassungsApp_ProjectOne/",
  "/ZeiterfassungsApp_ProjectOne/index.html",
  "/ZeiterfassungsApp_ProjectOne/style.css",
  "/ZeiterfassungsApp_ProjectOne/app.js",
  "/ZeiterfassungsApp_ProjectOne/icons/start.png",
  "/ZeiterfassungsApp_ProjectOne/icons/pause.png",
  "/ZeiterfassungsApp_ProjectOne/icons/stop.png",
  "/ZeiterfassungsApp_ProjectOne/icons/logout.png",
  "/ZeiterfassungsApp_ProjectOne/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
