const CACHE_VERSION = 'v1.0.2'
const CACHE_NAME = `yifan-fengshen-${CACHE_VERSION}`

// Static resources to cache
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - Request interception
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API requests: Network first
  if (url.pathname.startsWith('/api/') || url.hostname.includes('openrouter.ai')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Images: Stale while revalidate
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Static resources: Cache first
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'font') {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML: Network first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  // Default: Network first
  event.respondWith(networkFirst(request))
})

// Caching strategies

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    // Only cache GET requests with http/https protocol (Cache API doesn't support POST, chrome-extension, etc.)
    const url = new URL(request.url)
    if (response.ok && request.method === 'GET' && url.protocol.startsWith('http')) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Fetch failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const response = await fetch(request)
    // Only cache GET requests with http/https protocol (Cache API doesn't support POST, chrome-extension, etc.)
    const url = new URL(request.url)
    if (response.ok && request.method === 'GET' && url.protocol.startsWith('http')) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    return new Response('Network Error', { status: 503 })
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then((response) => {
    // Only cache GET requests with http/https protocol (Cache API doesn't support POST, chrome-extension, etc.)
    const url = new URL(request.url)
    if (response.ok && request.method === 'GET' && url.protocol.startsWith('http')) {
      cache.put(request, response.clone())
    }
    return response
  })

  return cached || fetchPromise
}
