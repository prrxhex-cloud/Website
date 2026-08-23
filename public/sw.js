/**
 * PRRX ULTRA-LOW LATENCY & LOW-BANDWIDTH SERVICE WORKER (v3)
 *
 * Implements Cache-First for static JS/CSS/Images/Fonts and
 * Stale-While-Revalidate for APIs with 2.5s network timeout.
 * Works seamlessly on 3G, 4G, 5G, metered data plans, and offline.
 */

const CACHE_NAME = 'prrx-hex-v3-ultra-opt';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.jpeg'
];

// Install Event - Precache Critical Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Purge Stale Version Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Optimized Cache-First & Stale-While-Revalidate Matrix
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. STATIC ASSETS (JS Chunks, CSS, Images, Fonts, Icons) -> CACHE-FIRST (0.0ms, 0 Bytes mobile data)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network and cache
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // If offline and image, return cached logo or empty
          if (request.destination === 'image') {
            return caches.match('./logo.jpeg');
          }
          return new Response('', { status: 408, statusText: 'Offline' });
        });
      })
    );
    return;
  }

  // 2. HTML NAVIGATION / DYNAMIC ROUTES -> Stale-While-Revalidate with 2.5s network timeout
  event.respondWith(
    new Promise((resolve) => {
      let isResolved = false;
      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          caches.match(request).then((cached) => {
            if (cached) {
              isResolved = true;
              resolve(cached);
            }
          });
        }
      }, 2500); // 2.5s network timeout for slow 3G

      fetch(request)
        .then((networkResponse) => {
          clearTimeout(timeoutId);
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          if (!isResolved) {
            isResolved = true;
            resolve(networkResponse);
          }
        })
        .catch(() => {
          clearTimeout(timeoutId);
          caches.match(request).then((cached) => {
            if (cached) {
              resolve(cached);
            } else {
              caches.match('./index.html').then((fallbackHtml) => {
                resolve(fallbackHtml || new Response('Offline', { status: 503 }));
              });
            }
          });
        });
    })
  );
});
