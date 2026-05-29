if ("serviceWorker" in navigator) { 
    window.addEventListener("load", function () { 
        navigator.serviceWorker 
        .register("/serviceworker.js") 
        .then((res) => console.log("PWA Service Worker registered successfully!")) 
        .catch((err) => console.log("PWA Service Worker registration failed:", err)); 
    }); 
}

const CACHE_NAME = 'tgr-db-cache-v1';
const ASSETS = [
    '/',
    '/static/css/style.css',
    '/static/js/reviews.js',
    '/static/images/favicon.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker Activated');
});

// Fetch handler
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});