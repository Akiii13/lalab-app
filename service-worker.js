self.addEventListener('install', function (e) {
  self.skipWaiting();
  console.log('Service Worker: Installed');
});
self.addEventListener('activate', function (e) {
  e.waitUntil(clients.claim());
  console.log('Service Worker: Activated');
});
self.addEventListener('fetch', function (e) {
  e.respondWith(fetch(e.request));
});