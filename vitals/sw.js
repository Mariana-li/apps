/* Bump CACHE whenever any file below changes, or installed copies keep the old one.
   PREFIX keeps clean-up inside this app: several apps on one github.io domain share
   one cache store, and deleting every cache but ours would wipe the neighbours. */
const CACHE = "vitals-v4";
const PREFIX = "vitals-";
const FILES = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icon-180.png", "./icon-512.png",
  "./fonts/fredoka-latin-400-normal.woff2",
  "./fonts/fredoka-latin-500-normal.woff2",
  "./fonts/fredoka-latin-600-normal.woff2",
  "./fonts/nunito-latin-400-normal.woff2",
  "./fonts/nunito-latin-600-normal.woff2",
  "./fonts/nunito-latin-700-normal.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(
      keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
