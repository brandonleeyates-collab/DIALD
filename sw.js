
DIALD-sw-updated.txt

100%
const CACHE_NAME = "diald-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Only handle same-origin app-shell requests; let TMDB/Spotify/Last.fm/CDN requests pass through to the network normally.
  if (url.origin !== self.location.origin) return;

  // Network-first: always try to get the latest app shell when online, so a
  // new deploy shows up the very next time the app is opened instead of being
  // stuck behind whatever was cached the first time it ever loaded. Only
  // falls back to the cached copy when the network request fails (i.e.
  // actually offline), which is the only situation the cache is really for.
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
Displaying DIALD-sw-updated.txt.
