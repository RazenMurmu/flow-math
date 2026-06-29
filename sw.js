const CACHE_NAME = 'flow-math-v1';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json'
];

// Install and cache assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Serve from cache first, fallback to network
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});