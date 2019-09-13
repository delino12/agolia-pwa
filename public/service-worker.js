var filesToCache = [
    '/',
    'css/bootstrap.min.css',
    'css/style.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Oswald:200,300,400,500,600,700',
    'js/jquery.min.js',
    'js/popper.min.js',
    'js/bootstrap.min.js'
];

var staticCacheName = `sebastianfx-cache-v1`;

self.addEventListener('install', event => {
    console.log('Ready to install service worker and cache static assets');
    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('Saving static assets... Completed!');
            return cache.addAll(filesToCache);
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