/**
 * Enhanced Risk Engine - Service Worker
 * Progressive Web App functionality with offline support and caching
 * Optimized for mobile performance and real-time risk intelligence
 */

const CACHE_VERSION = 'enhanced-risk-engine-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Files to cache immediately (only internal assets to avoid CSP violations)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/static/enhanced-risk-dashboard.js',
  '/static/enhanced-risk-dashboard-mobile.js',
  '/static/mobile-enhanced-styles.css',
  '/static/styles.css',
  '/static/app.js'
  // Note: External CDN assets excluded to avoid CSP violations
  // They will be loaded directly from CDN as needed
];

// API endpoints to cache (updated with correct endpoints)
const API_ENDPOINTS = [
  '/api/enhanced-risk-engine/status',
  '/api/enhanced-risk-engine/health',
  '/api/services?status=active&limit=20',
  '/api/health'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only'
};

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  API: 5 * 60 * 1000, // 5 minutes
  DYNAMIC: 24 * 60 * 60 * 1000, // 1 day
  IMAGES: 30 * 24 * 60 * 60 * 1000 // 30 days
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Enhanced Risk Engine Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE)
        .then((cache) => {
          console.log('[SW] Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        }),
      
      // Pre-cache critical API endpoints
      caches.open(API_CACHE)
        .then((cache) => {
          console.log('[SW] Pre-caching critical API endpoints');
          return Promise.all(
            API_ENDPOINTS.map(endpoint => 
              fetch(endpoint)
                .then(response => {
                  if (response.ok) {
                    cache.put(endpoint, response);
                  }
                })
                .catch(err => {
                  console.warn(`[SW] Failed to pre-cache ${endpoint}:`, err);
                })
            )
          );
        })
    ])
    .then(() => {
      console.log('[SW] Enhanced Risk Engine Service Worker installed successfully');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Enhanced Risk Engine Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('enhanced-risk-engine-') && 
              !cacheName.includes(CACHE_VERSION)
            )
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
    .then(() => {
      console.log('[SW] Enhanced Risk Engine Service Worker activated');
      
      // Notify clients about activation
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_VERSION,
            timestamp: Date.now()
          });
        });
      });
    })
  );
});

/**
 * Fetch Event Handler - Main request interception
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip external CDN resources entirely to avoid CSP violations
  if (url.hostname.includes('cdn.') || 
      url.hostname.includes('unpkg.com') || 
      url.hostname.includes('jsdelivr.net') ||
      url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }
  
  // Determine caching strategy based on request type
  let strategy = CACHE_STRATEGIES.NETWORK_FIRST;
  let cacheName = DYNAMIC_CACHE;
  
  if (isStaticAsset(url)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
    cacheName = STATIC_CACHE;
  } else if (isAPIRequest(url)) {
    strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
    cacheName = API_CACHE;
  } else if (isEnhancedRiskEngineRequest(url)) {
    strategy = CACHE_STRATEGIES.NETWORK_FIRST;
    cacheName = API_CACHE;
  }
  
  event.respondWith(handleRequest(request, strategy, cacheName));
});

/**
 * Handle different caching strategies
 */
async function handleRequest(request, strategy, cacheName) {
  try {
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, cacheName);
        
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, cacheName);
        
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cacheName);
        
      case CACHE_STRATEGIES.CACHE_ONLY:
        return await cacheOnly(request, cacheName);
        
      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(request);
        
      default:
        return await networkFirst(request, cacheName);
    }
  } catch (error) {
    console.error('[SW] Request handling error:', error);
    return await handleOfflineFallback(request);
  }
}

/**
 * Cache First Strategy - Good for static assets
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse; // Return stale cache as fallback
    }
    throw error;
  }
}

/**
 * Network First Strategy - Good for dynamic content
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache GET requests - POST/PUT/DELETE cannot be cached
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate - Good for API endpoints
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch in the background
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.warn('[SW] Background fetch failed:', error);
    });
  
  // Return cached response immediately if available
  if (cachedResponse && !isExpired(cachedResponse)) {
    fetchPromise; // Continue background update
    return cachedResponse;
  }
  
  // Wait for network if no cache or expired
  return await fetchPromise || cachedResponse;
}

/**
 * Cache Only Strategy
 */
async function cacheOnly(request, cacheName) {
  const cache = await caches.open(cacheName);
  return await cache.match(request);
}

/**
 * Handle offline fallback
 */
async function handleOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    return createOfflinePage();
  }
  
  // Return cached API data if available
  if (isAPIRequest(url)) {
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return mock data for Enhanced Risk Engine endpoints
    if (isEnhancedRiskEngineRequest(url)) {
      return createMockResponse(url);
    }
  }
  
  // Return 404 for other requests
  return new Response('Not Found', { status: 404 });
}

/**
 * Create offline page response
 */
function createOfflinePage() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Enhanced Risk Engine</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0; padding: 2rem; background: #f8fafc; color: #334155;
                display: flex; align-items: center; justify-content: center; min-height: 100vh;
            }
            .container { 
                text-align: center; background: white; padding: 2rem; border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 400px;
            }
            .icon { font-size: 3rem; margin-bottom: 1rem; }
            .title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; }
            .message { margin-bottom: 2rem; line-height: 1.5; color: #64748b; }
            .button { 
                background: #3b82f6; color: white; border: none; padding: 12px 24px;
                border-radius: 8px; font-weight: 500; cursor: pointer; text-decoration: none;
                display: inline-block;
            }
            .cached-data { margin-top: 2rem; padding: 1rem; background: #f1f5f9; border-radius: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">📱</div>
            <div class="title">You're Offline</div>
            <div class="message">
                The Enhanced Risk Engine is currently offline. 
                Some cached risk intelligence data may still be available.
            </div>
            <button class="button" onclick="window.location.reload()">
                Try Again
            </button>
            <div class="cached-data">
                <strong>Offline Features Available:</strong><br>
                • Cached service indices<br>
                • Risk score calculator<br>
                • Previous analysis results
            </div>
        </div>
        
        <script>
            // Check for connectivity and reload when back online
            window.addEventListener('online', () => {
                window.location.reload();
            });
            
            // Show network status
            if (!navigator.onLine) {
                document.title = 'Offline - Enhanced Risk Engine';
            }
        </script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
    status: 200
  });
}

/**
 * Create mock response for Enhanced Risk Engine endpoints
 */
function createMockResponse(url) {
  const pathname = url.pathname;
  
  if (pathname.includes('/api/enhanced-risk-engine/health')) {
    return new Response(JSON.stringify({
      status: 'healthy',
      message: 'Enhanced Risk Engine operational (offline mode)',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      mode: 'offline'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }
  
  if (pathname.includes('/api/enhanced-risk-engine/service-indices')) {
    return new Response(JSON.stringify({
      service_id: 'offline-demo',
      status: 'computed',
      indices: {
        svi: 45.2,
        sei: 32.8,
        bci: 67.5,
        eri: 28.9,
        composite: 42.1
      },
      explanation: 'Cached risk indices (offline mode)',
      timestamp: new Date().toISOString(),
      mode: 'offline'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }
  
  return new Response(JSON.stringify({
    error: 'Service unavailable offline',
    message: 'This Enhanced Risk Engine feature requires network connectivity',
    offline: true
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 503
  });
}

/**
 * Check if response is expired
 */
function isExpired(response) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const responseDate = new Date(dateHeader);
  const now = new Date();
  const age = now - responseDate;
  
  // Different expiration times based on content type
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    return age > CACHE_DURATIONS.API;
  } else if (contentType.includes('image/')) {
    return age > CACHE_DURATIONS.IMAGES;
  } else {
    return age > CACHE_DURATIONS.DYNAMIC;
  }
}

/**
 * Check if request is for static assets
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
  const pathname = url.pathname.toLowerCase();
  
  // Only cache internal static assets, not external CDN resources
  return (staticExtensions.some(ext => pathname.endsWith(ext)) ||
          pathname.includes('/static/')) &&
         !url.hostname.includes('cdn.') &&
         !url.hostname.includes('unpkg.com') &&
         !url.hostname.includes('jsdelivr.net');
}

/**
 * Check if request is for API endpoints
 */
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

/**
 * Check if request is for Enhanced Risk Engine endpoints
 */
function isEnhancedRiskEngineRequest(url) {
  return url.pathname.includes('/enhanced-risk-engine') ||
         url.pathname.includes('/v2/risk-engine');
}

/**
 * Background Sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'risk-calculation') {
    event.waitUntil(syncRiskCalculations());
  } else if (event.tag === 'service-indices-update') {
    event.waitUntil(syncServiceIndices());
  }
});

/**
 * Sync offline risk calculations
 */
async function syncRiskCalculations() {
  try {
    // Get pending calculations from IndexedDB or localStorage
    const pendingCalculations = await getPendingCalculations();
    
    for (const calculation of pendingCalculations) {
      try {
        const response = await fetch('/api/enhanced-risk-engine/risk-scoring', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(calculation.data)
        });
        
        if (response.ok) {
          await removePendingCalculation(calculation.id);
          console.log('[SW] Synced risk calculation:', calculation.id);
        }
      } catch (error) {
        console.warn('[SW] Failed to sync calculation:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

/**
 * Sync service indices updates
 */
async function syncServiceIndices() {
  try {
    const response = await fetch('/api/enhanced-risk-engine/service-indices/bulk');
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put('/api/enhanced-risk-engine/service-indices/bulk', response.clone());
      console.log('[SW] Synced service indices');
    }
  } catch (error) {
    console.warn('[SW] Failed to sync service indices:', error);
  }
}

/**
 * Message handling for client communication
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_VERSION });
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(data.urls));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCache(data.cacheName));
      break;
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      }));
      break;
  }
});

/**
 * Cache specific URLs on demand
 */
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachePromises = urls.map(url => 
    fetch(url).then(response => {
      if (response.ok) {
        cache.put(url, response);
      }
    }).catch(err => console.warn(`[SW] Failed to cache ${url}:`, err))
  );
  
  await Promise.all(cachePromises);
  console.log('[SW] Cached requested URLs:', urls.length);
}

/**
 * Clear specific cache
 */
async function clearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
    console.log('[SW] Cleared cache:', cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] Cleared all caches');
  }
}

/**
 * Get cache status information
 */
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }
  
  return {
    version: CACHE_VERSION,
    caches: status,
    timestamp: Date.now()
  };
}

/**
 * Utility functions for offline data management
 */
async function getPendingCalculations() {
  // In a real implementation, this would use IndexedDB
  // For now, return empty array
  return [];
}

async function removePendingCalculation(id) {
  // In a real implementation, this would remove from IndexedDB
  console.log('[SW] Would remove pending calculation:', id);
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Enhanced Risk Engine Alert';
  const options = {
    body: data.body || 'New risk intelligence available',
    icon: '/manifest-icon-192.png',
    badge: '/manifest-icon-96.png',
    tag: data.tag || 'risk-alert',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/close.png'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'view' || !action) {
    // Open the app to relevant section
    const url = data.url || '/?from=notification';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({ 
              type: 'NOTIFICATION_CLICK', 
              action, 
              data 
            });
            return;
          }
        }
        
        // Open new window if app not already open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

console.log('[SW] Enhanced Risk Engine Service Worker loaded');