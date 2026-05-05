// NDC PWA Service Worker v2.0.0
// Cache version — increment this when you deploy major updates
const CACHE_VERSION = "ndc-v2";
const SHELL = ["/", "/index.html", "/offline.html", "/manifest.json"];

// ── Install: cache app shell ──────────────────────────────────
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ───────────────────────────────
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => {
            console.log("[SW] Deleting old cache:", k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategy ────────────────────────────────────────────
self.addEventListener("fetch", e => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and browser extensions
  if (request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;
  if (url.protocol === "chrome:") return;

  // Firebase / Google APIs → Network first (never cache auth tokens)
  const isFirebase =
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("identitytoolkit.googleapis.com") ||
    url.hostname.includes("securetoken.googleapis.com") ||
    url.hostname.includes("firebase.googleapis.com");

  // Google Sheets / Fonts → Network first with cache fallback
  const isExternal =
    url.hostname.includes("docs.google.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("postimg.cc");

  if (isFirebase) {
    // Pure network — never cache Firebase auth/firestore
    e.respondWith(fetch(request).catch(() =>
      new Response(JSON.stringify({ error: "offline" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    ));
    return;
  }

  if (isExternal) {
    e.respondWith(networkFirstWithCache(request));
    return;
  }

  // HTML navigation → network first, fall back to cached, then offline page
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then(res => {
          putInCache(request, res.clone());
          return res;
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match("/offline.html"))
        )
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts) → cache first
  e.respondWith(cacheFirstWithNetwork(request));
});

// ── Strategies ────────────────────────────────────────────────
async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      putInCache(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Asset unavailable offline", { status: 503 });
  }
}

async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) putInCache(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response("Unavailable offline", { status: 503 });
  }
}

async function putInCache(request, response) {
  try {
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(request, response);
  } catch {
    // Ignore cache write errors (e.g. storage quota)
  }
}

// ── Background sync (future use) ─────────────────────────────
self.addEventListener("message", e => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
