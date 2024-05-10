const OAIFREE_CACHE_NAME = 'oaifree-new-cache';
const OAIFREE_CDN_HOSTNAMES = [
    'cdn1.oaifree.com',
    'cdn2.oaifree.com',
    'cdn3.oaifree.com',
    'cdn4.oaifree.com',
    'cdn5.oaifree.com',
    'cdn6.oaifree.com',
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(OAIFREE_CACHE_NAME).then(cache => {
            return cache.addAll([
                '/js/sweetalert2/bulma.min.css',
                '/js/sweetalert2/sweetalert2.all.min.js',
                '/images/chatgpt-icon-48x48.png',
                '/images/chatgpt-icon-72x72.png',
                '/images/chatgpt-icon-96x96.png',
                '/images/chatgpt-icon-144x144.png',
                '/images/chatgpt-icon-192x192.png',
                '/images/chatgpt-icon-512x512.png',
                '/ulp/react-components/1.81.3/css/main.cdn.min.css',
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    if (!OAIFREE_CDN_HOSTNAMES.includes(new URL(event.request.url).hostname)) {
        return;
    }

    event.respondWith(
        caches.match(event.request.url).then(response => {
            if (response) {
                return response;
            }

            return fetch(event.request).then(response => {
                const responseToCache = response.clone();
                caches.open(OAIFREE_CACHE_NAME).then(cache => {
                    cache.put(event.request.url, responseToCache);
                });

                return response;
            });
        })
    );
});
