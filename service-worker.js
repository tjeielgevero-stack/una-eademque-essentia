const CACHE_NAME = "uee-app-shell-v10";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css?v=20261127-installchoice1",
  "./data.js",
  "./script.js?v=20261127-lore1",
  "./multiplayer.js",
  "./lore-book.js?v=20261127-lore1",
  "./manifest.webmanifest",
  "./app-icon.svg",
  "./offline.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith("uee-app-shell-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function cachedFallback(request) {
  const exact = await caches.match(request);
  if (exact) return exact;
  const url = new URL(request.url);
  url.search = "";
  url.hash = "";
  return (await caches.match(url.href)) || (await caches.match("./index.html")) || (await caches.match("./offline.html"));
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(new Request(request, { cache: "no-cache" }));
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put("./index.html", response.clone());
        }
        return response;
      } catch {
        return (await caches.match("./index.html")) || (await caches.match("./offline.html"));
      }
    })());
    return;
  }

  // Versioned URLs must never be answered by an older asset with a different
  // ?v= query string. Prefer the network, then use exact/offline cache fallback.
  event.respondWith((async () => {
    try {
      const response = await fetch(new Request(request, { cache: "no-cache" }));
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return cachedFallback(request);
    }
  })());
});