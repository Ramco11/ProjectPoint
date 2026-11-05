const CACHE_NAME = "aquaflow-phase2-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./customer.html",
    "./delivery.html",
    "./payments.html",
    "./routes.html",
    "./reports.html",
    "./settings.html",

    "./style.css",

    "./app.js",
    "./customer.js",
    "./deliveries.js",
    "./payments.js",
    "./routes.js",
    "./reports.js",
    "./settings.js",

    "./manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches
            .keys()
            .then(cacheNames =>
                Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const copy = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, copy);
                });

                return response;
            })
            .catch(async () => {
                const cached = await caches.match(event.request);

                if (cached) return cached;

                if (event.request.mode === "navigate") {
                    return caches.match("./index.html");
                }

                return new Response(
                    "AquaFlow is offline and this resource is unavailable.",
                    {
                        status: 503,
                        headers: {
                            "Content-Type": "text/plain"
                        }
                    }
                );
            })
    );
});