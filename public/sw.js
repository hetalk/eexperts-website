/*
 * Service Worker for Offline Functionality
 * Last Updated: 2025-09-16 08:56:10 IST
 *
 * Features:
 * - Cache strategy for static assets
 * - Offline page fallback
 * - Background sync for forms
 * - Performance optimization
 * - Cache management
 */

const CACHE_NAME = 'ritesource-eexperts-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/about/',
  '/services/',
  '/resources/',
  '/contact/',
  '/offline.html',
  '/favicon.svg',
  '/manifest.json',
  // Add critical CSS/JS files when they're generated
];

// Assets to cache on request
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com\//,
  /^https:\/\/fonts\.gstatic\.com\//,
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  /\.(?:js|css)$/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache dynamic assets
            const shouldCache = DYNAMIC_CACHE_PATTERNS.some(pattern =>
              pattern.test(event.request.url)
            );

            if (shouldCache) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // If network fails, show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }

            // For other requests, return a generic offline response
            return new Response('Offline', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get stored form data from IndexedDB or localStorage
    const formData = await getStoredFormData();

    if (formData.length > 0) {
      for (const data of formData) {
        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            body: data.formData
          });

          if (response.ok) {
            await removeStoredFormData(data.id);
            console.log('Background sync: Form submitted successfully');
          }
        } catch (error) {
          console.error('Background sync: Form submission failed', error);
        }
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Helper functions for background sync
async function getStoredFormData() {
  // In a real implementation, use IndexedDB
  // For now, return empty array
  return [];
}

async function removeStoredFormData(id) {
  // In a real implementation, remove from IndexedDB
  console.log('Removing stored form data:', id);
}

// Push notification event
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body || 'New message from Ritesource & eExperts',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'notification',
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/favicon.svg'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Ritesource & eExperts', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message event for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(event.data.payload);
        })
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(
      // Sync critical content in background
      syncCriticalContent()
    );
  }
});

async function syncCriticalContent() {
  try {
    // Pre-cache critical resources
    const cache = await caches.open(CACHE_NAME);
    const criticalUrls = [
      '/api/contact',
      '/services/healthcare-qa',
      // Add other critical URLs
    ];

    await cache.addAll(criticalUrls);
    console.log('Critical content synced');
  } catch (error) {
    console.error('Critical content sync failed:', error);
  }
}

// Cache size management
async function cleanupCache() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();

  // Remove oldest entries if cache is too large
  if (requests.length > 100) {
    const oldestRequests = requests.slice(0, requests.length - 100);
    await Promise.all(
      oldestRequests.map(request => cache.delete(request))
    );
  }
}

// Run cleanup periodically
setInterval(cleanupCache, 60000); // Every minute