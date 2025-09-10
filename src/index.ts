import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import phase1Api from './routes/phase1-api'
import enhancedRiskEngineApi from './routes/enhanced-risk-engine-api'

type Bindings = {
  DB: D1Database;
  AI?: any; // Cloudflare AI binding for enhanced features
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// Mount Phase 1 API routes
app.route('/api', phase1Api)

// Mount Enhanced Risk Engine API routes
app.route('/api/enhanced-risk-engine', enhancedRiskEngineApi)
app.route('/api/v2/risk-engine', enhancedRiskEngineApi) // Alternative path

// Default route - Dynamic Risk Intelligence Platform Dashboard
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
        <title>Enhanced Risk Engine - ARIA5.1 Platform</title>
        
        <!-- Progressive Web App Meta Tags -->
        <meta name="application-name" content="Enhanced Risk Engine">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="Risk Engine">
        <meta name="description" content="AI-native risk intelligence with explainable scoring and service indices">
        <meta name="format-detection" content="telephone=no">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="msapplication-TileColor" content="#3b82f6">
        <meta name="msapplication-tap-highlight" content="no">
        <meta name="theme-color" content="#3b82f6">
        
        <!-- PWA Manifest -->
        <link rel="manifest" href="/manifest.json">
        
        <!-- Apple Touch Icons -->
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180' fill='%233b82f6'><circle cx='90' cy='90' r='80' fill='%23ffffff'/><path d='M90 20C54.183 20 25 49.183 25 85s29.183 65 65 65 65-29.183 65-65S125.817 20 90 20zm26 78H64c-3.314 0-6-2.686-6-6s2.686-6 6-6h52c3.314 0 6 2.686 6 6s-2.686 6-6 6zm0-26H64c-3.314 0-6-2.686-6-6s2.686-6 6-6h52c3.314 0 6 2.686 6 6s-2.686 6-6 6z'/></svg>">
        
        <!-- Essential CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <link href="/static/styles.css" rel="stylesheet">
        
        <!-- Mobile Enhanced Styles -->
        <link href="/static/mobile-enhanced-styles.css" rel="stylesheet">
        
        <!-- Preload Critical Resources -->
        <link rel="preload" href="/static/enhanced-risk-dashboard.js" as="script">
        <link rel="preload" href="/static/enhanced-risk-dashboard-mobile.js" as="script">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  'risk-low': '#10B981',
                  'risk-medium': '#F59E0B', 
                  'risk-high': '#EF4444',
                  'risk-critical': '#DC2626'
                }
              }
            }
          }
        </script>
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- Navigation Header -->
        <nav class="bg-white shadow-lg border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <i class="fas fa-shield-alt text-2xl text-blue-600 mr-3"></i>
                        <h1 class="text-xl font-bold text-gray-900">Dynamic Risk Intelligence Platform</h1>
                        <span class="ml-3 px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Phase 1</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div id="system-health" class="flex items-center">
                            <div class="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                            <span class="text-sm text-gray-600">Loading...</span>
                        </div>
                        <button id="manual-execute" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                            <i class="fas fa-play mr-1"></i> Execute Cycle
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Dashboard -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Loading State -->
            <div id="loading" class="text-center py-12">
                <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Phase 1 Dashboard...
                </div>
            </div>

            <!-- Dashboard Content -->
            <div id="dashboard" class="hidden">
                <!-- Key Metrics Overview -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-search text-2xl text-blue-600"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Discovery Automation</dt>
                                        <dd class="text-lg font-medium text-gray-900" id="discovery-rate">--%</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-clock text-2xl text-green-600"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Update Latency</dt>
                                        <dd class="text-lg font-medium text-gray-900" id="update-latency">-- min</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-check-circle text-2xl text-purple-600"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Approval Efficiency</dt>
                                        <dd class="text-lg font-medium text-gray-900" id="approval-efficiency">--%</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-service text-2xl text-red-600"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Services Monitored</dt>
                                        <dd class="text-lg font-medium text-gray-900" id="services-count">--</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Service Risk Overview -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <!-- Service Risk Distribution -->
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="px-4 py-5 sm:p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">
                                <i class="fas fa-chart-pie mr-2"></i>
                                Service Risk Distribution
                            </h3>
                            <canvas id="risk-distribution-chart" width="400" height="300"></canvas>
                        </div>
                    </div>

                    <!-- Risk Trend -->
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="px-4 py-5 sm:p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">
                                <i class="fas fa-chart-line mr-2"></i>
                                Risk Trend Analysis
                            </h3>
                            <canvas id="risk-trend-chart" width="400" height="300"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Services Table -->
                <div class="bg-white shadow overflow-hidden sm:rounded-md mb-8">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            <i class="fas fa-server mr-2"></i>
                            Business Services Risk Assessment
                        </h3>
                        <p class="mt-1 max-w-2xl text-sm text-gray-500">
                            Real-time service-centric risk scoring with CIA triad analysis
                        </p>
                    </div>
                    <ul id="services-list" class="divide-y divide-gray-200">
                        <!-- Services will be populated here -->
                    </ul>
                </div>

                <!-- Component Status -->
                <div class="bg-white shadow overflow-hidden sm:rounded-md">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            <i class="fas fa-cogs mr-2"></i>
                            Component Health Status
                        </h3>
                    </div>
                    <div id="component-status" class="p-6">
                        <!-- Component status will be populated here -->
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div id="error" class="hidden text-center py-12">
                <div class="bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-red-400"></i>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">
                                Unable to load dashboard
                            </h3>
                            <p class="mt-2 text-sm text-red-700" id="error-message">
                                Please check the system status and try again.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <!-- Enhanced Risk Dashboard Integration -->
        <script src="/static/enhanced-risk-dashboard.js"></script>
        
        <!-- Mobile Enhanced Risk Dashboard Integration -->
        <script src="/static/enhanced-risk-dashboard-mobile.js"></script>
        
        <!-- PWA Service Worker Registration -->
        <script>
          console.log('Enhanced Risk Dashboard loaded - native integration active');
          
          // Register Service Worker for PWA functionality
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                  console.log('SW registered: ', registration);
                  
                  // Check for updates
                  registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Show update available notification
                        if (confirm('New version available. Update now?')) {
                          newWorker.postMessage({ action: 'skipWaiting' });
                          window.location.reload();
                        }
                      }
                    });
                  });
                })
                .catch((registrationError) => {
                  console.log('SW registration failed: ', registrationError);
                });
            });
          }
          
          // Initialize mobile-specific features after DOM load
          document.addEventListener('DOMContentLoaded', () => {
            // Detect if mobile device
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                            (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
            
            if (isMobile && typeof MobileEnhancedRiskDashboard !== 'undefined') {
              console.log('Initializing Mobile Enhanced Risk Dashboard');
              window.mobileRiskDashboard = new MobileEnhancedRiskDashboard();
            }
            
            // Add mobile-specific viewport handling
            if (isMobile) {
              const viewport = document.querySelector('meta[name="viewport"]');
              if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
              }
              
              // Prevent zoom on input focus (iOS Safari)
              document.addEventListener('touchstart', {}, true);
              
              // Add mobile class to body
              document.body.classList.add('mobile-device');
            }
          });
        </script>
    </body>
    </html>
  `)
})

export default app