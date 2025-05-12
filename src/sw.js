const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/styles.css',
  '/bundle.js',
  '/icons/icon-192x192.png',
  '/icons/badge-72x72.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${url}: ${response.status}`);
                }
                return cache.put(url, response);
              })
              .catch(error => {
                console.error(`Failed to cache ${url}:`, error);
              });
          })
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'New Story Update', body: event.data.text() };
  }

  const options = {
    body: data.body || 'A new story has been added!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'New Story Update', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
}); 