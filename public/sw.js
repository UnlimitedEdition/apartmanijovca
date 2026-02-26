const CACHE_NAME = 'apartmani-jovca-v1'
const urlsToCache = [
  '/',
  '/gallery',
  '/prices',
  '/attractions',
  '/contact',
  '/manifest.json',
  '/robots.txt'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  // Only handle GET requests with http/https schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          const responseToCache = response.clone()
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
            })
          return response
        })
      })
      .catch(() => {
        // Return offline page or cached version
        return caches.match('/')
      })
  )
})
