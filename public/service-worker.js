// NDC PWA Service Worker v1.0.0
const CACHE      = "ndc-v1";
const SHELL      = ["/", "/index.html", "/offline.html", "/manifest.json"];

// Install — cache app shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Activate — delete old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;

  // External APIs (Firebase, Sheets, fonts) → network-first
  const isExternal =
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("identitytoolkit.googleapis.com") ||
    url.hostname.includes("docs.google.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("postimg.cc");

  if (isExternal) {
    e.respondWith(networkFirst(request));
    return;
  }

  // HTML navigation → network-first with offline fallback
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => { cache(request, res.clone()); return res; })
        .catch(() => caches.match(request).then((r) => r || caches.match("/offline.html")))
    );
    return;
  }

  // Static assets → cache-first
  e.respondWith(cacheFirst(request));
});

async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache(req, res.clone());
    return res;
  } catch { return new Response("Offline", { status: 503 }); }
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) cache(req, res.clone());
    return res;
  } catch {
    return caches.match(req).then((r) => r || new Response("Offline", { status: 503 }));
  }
}

async function cache(req, res) {
  const c = await caches.open(CACHE);
  c.put(req, res);
}
