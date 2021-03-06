var filesToCache = [
    '/',
    'favicon.ico',
    'img/android-icon-48x48.png',
    'manifest.json',
    'img/favicon-32x32.png',
    'img/favicon-16x16.png',
    'img/favicon-96x96.png',
    'img/android-icon-192x192.png',
    'css/bootstrap.min.css',
    'css/select2.min.css',
    'css/style.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Oswald:200,300,400,500,600,700',
    'js/jquery.min.js',
    'js/popper.min.js',
    'js/bootstrap.min.js',
    'js/select2.min.js',
    'js/sweetalert.min.js',
    'js/numeral.js',
    'js/printme.js',
    'js/html2canvas.js',
    'js/script.js',
    'buy',
    'sell',
    'transaction',
    'completed',
    'users.json',
    'banks.json',
    'source-of-funds.json'
];

// cache name
var staticCacheName = `sebastianfx-cache-v1`;

// install cache
self.addEventListener('install', function(event) {
    console.log('Ready to install service worker and cache static assets');
    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('Saving static assets... Completed!');
            return cache.addAll(filesToCache);
        })
    );
});

// active a new service worker
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames){
            return Promise.all(
                cacheNames.filter(function(cacheName){
                    return cacheName.startsWith('yeelda-') && cacheName !== appCacheName;
                }).map(function(cacheName){
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('push', function(event) {
    console.log(event);
    event.waitUntil(
        self.registration.showNotification(title, {
            body: event.title,
            icon: event.icon,
            tag: event.tag
        })
    );
});

self.addEventListener('fetch', function(event) {
    // console.log(event);
    // Let the browser do its default thing
    // for non-GET requests.
    if (event.request.method != 'GET') return;

    // Prevent the default, and handle the request ourselves.
    event.respondWith(async function() {
        // Try to get the response from a cache.
        const cache = await caches.open(staticCacheName);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
            // If we found a match in the cache, return it, but also
            // update the entry in the cache in the background.
            event.waitUntil(cache.add(event.request));
            return cachedResponse;
        }

        // If we didn't find a match in the cache, use the network.
        return fetch(event.request);
    }());
});

self.addEventListener('message', function(event){
    if(event.data.action = 'skipWaiting'){
        self.skipWaiting();
    }
});