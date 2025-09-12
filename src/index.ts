// ARIA5.1 - Clean HTMX + Hono Application (Rebuilt from scratch)
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { html } from 'hono/html';
import { serveStatic } from 'hono/cloudflare-workers';
import { getCookie } from 'hono/cookie';

// Import clean route handlers
import { createAuthRoutes } from './routes/auth-routes';
import { createCleanDashboardRoutes } from './routes/dashboard-routes-clean';
import { createRiskRoutesARIA5 } from './routes/risk-routes-aria5';
import { createComplianceRoutes } from './routes/compliance-routes';
import { createOperationsRoutes } from './routes/operations-fixed';
import { createIntelligenceRoutes } from './routes/intelligence-routes';
import { createAdminRoutesARIA5 } from './routes/admin-routes-aria5';
import { createAPIRoutes } from './routes/api-routes';
import { createAIAssistantRoutes } from './routes/ai-assistant-routes';
import { createApiKeyRoutes } from './routes/api-key-routes';
import { createPolicyManagementRoutes } from './routes/policy-management-routes';
import { enhancedRiskRoutes } from './routes/enhanced-risk-routes';
import { createRiskControlRoutes } from './routes/risk-control-routes';
import { enhancedRiskEngineApi } from './routes/enhanced-risk-engine-api';
import { createPhase1DashboardRoutes } from './routes/phase1-dashboard-routes';
import { createPhase2DashboardRoutes } from './routes/phase2-dashboard-routes';
import { createPhase3DashboardRoutes } from './routes/phase3-dashboard-routes';
import { phase4EvidenceDashboard } from './routes/phase4-evidence-dashboard-routes';
import { phase5ExecutiveDashboard } from './routes/phase5-executive-dashboard';
import dynamicRiskDashboardRoutes from './routes/dynamic-risk-dashboard-routes';

// Import new API routes to fix 404 errors
import { threatIntelligenceApi } from './routes/threat-intelligence-api';
import { validationApi } from './routes/validation-api';
import { complianceServicesApi } from './routes/compliance-services-api';
import { dynamicRiskAnalysisRoutes } from './routes/dynamic-risk-analysis-routes';

// Import security middleware
import { authMiddleware, requireRole, requireAdmin, csrfMiddleware } from './middleware/auth-middleware';

// Advanced Analytics & Enterprise Scale Routes
import { mlAnalyticsRoutes } from './routes/ml-analytics';
import { threatIntelRoutes } from './routes/threat-intelligence';
import { incidentResponseRoutes } from './routes/incident-response';
import { apiAnalyticsRoutes } from './routes/api-analytics';
import { apiThreatIntelRoutes } from './routes/api-threat-intelligence';
import { apiIncidentResponseRoutes } from './routes/api-incident-response';

// Import clean templates
import { cleanLayout } from './templates/layout-clean';

// AI-NATIVE ENHANCEMENT: Add new AI-powered routes (NON-BREAKING)
import aiInsightsRoutes from './routes/ai-insights-simple';
import decisionCenterRoutes from './routes/decision-center-simple';

// AI-NATIVE COMPREHENSIVE UI: New comprehensive AI Insights routes
import aiInsightsUIRoutes from './routes/ai-insights-routes';

// AI-NATIVE PHASE 4-8: Advanced AI Services (NEW)
import evidenceCollectionRoutes from './routes/evidence-collection-routes';
import executiveIntelligenceRoutes from './routes/executive-intelligence-routes';
import advancedAnalyticsRoutes from './routes/advanced-analytics-routes';
import enterpriseScaleRoutes from './routes/enterprise-scale-routes';
import integrationPlatformRoutes from './routes/integration-platform-routes';

import { loginPage } from './templates/auth/login';
import { landingPage } from './templates/landing';

const app = new Hono();

// Security middleware (applied to all routes)
app.use('*', logger());
app.use('*', cors({
  origin: ['https://dynamic-risk-intelligence.pages.dev', 'https://*.dynamic-risk-intelligence.pages.dev', 'https://7405e4a5.dynamic-risk-intelligence.pages.dev'],
  credentials: true
}));
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/"],
    connectSrc: ["'self'"]
  },
  crossOriginEmbedderPolicy: false
}));

// CSRF protection for state-changing operations
app.use('/auth/logout', csrfMiddleware);
app.use('/admin/*', csrfMiddleware);
app.use('/api/users/*', csrfMiddleware);
app.use('/api/keys/*', csrfMiddleware);

// Mount new API routes to fix 404 errors
app.route('/api/threat-intelligence', threatIntelligenceApi);
app.route('/api/validation', validationApi);
app.route('/api/compliance', complianceServicesApi);
app.route('/api/services', complianceServicesApi);

// Serve static files
app.get('/static/*', serveStatic({ root: './' }));
app.get('/htmx/*', serveStatic({ root: './' }));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    version: '5.1.0-clean',
    mode: 'Clean HTMX',
    timestamp: new Date().toISOString()
  });
});

// Landing page route (public) - EMERGENCY: Bypass auth for testing
app.get('/', async (c) => {
  // EMERGENCY: Always redirect to risk management for testing
  return c.redirect('/risk');
});

// Home route alias (for backward compatibility)
app.get('/home', async (c) => {
  return c.redirect('/');
});

// Login page (public)
app.get('/login', (c) => {
  const token = getCookie(c, 'aria_token');
  
  // If already authenticated, redirect to dashboard
  if (token) {
    return c.redirect('/dashboard');
  }
  
  return c.html(loginPage());
});

// Simple login page for debugging authentication issues
app.get('/simple-login.html', async (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARIA5.1 - Simple Login</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
  <script src="https://unpkg.com/htmx.org@1.9.12"></script>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-6">
          <i class="fas fa-shield-alt text-3xl text-white"></i>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">ARIA5.1 Platform</h2>
        <p class="mt-2 text-center text-sm text-gray-600">Service Intelligence & Asset Management</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8">
        <div id="login-messages"></div>
        
        <form hx-post="/auth/login" hx-target="#login-messages" hx-swap="innerHTML" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-user mr-2"></i>Username
            </label>
            <input id="username" name="username" type="text" required 
                   class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:z-10 sm:text-sm"
                   placeholder="Enter your username" value="">
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-lock mr-2"></i>Password
            </label>
            <input id="password" name="password" type="password" required 
                   class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:z-10 sm:text-sm"
                   placeholder="Enter your password">
          </div>

          <div>
            <button type="submit" 
                    class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <i class="fas fa-sign-in-alt text-indigo-300 group-hover:text-indigo-200"></i>
              </span>
              Sign In
            </button>
          </div>
        </form>

        <div class="mt-8 border-t border-gray-200 pt-6">
          <h3 class="text-sm font-medium text-gray-700 mb-4">
            <i class="fas fa-users mr-2"></i>Demo Accounts
          </h3>
          <div class="space-y-3 text-sm">
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="flex justify-between items-center">
                <div>
                  <strong class="text-gray-900">Admin User</strong>
                  <div class="text-gray-600">Full system access</div>
                </div>
                <button onclick="fillCredentials('admin', 'demo123')"
                        class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition">
                  Use
                </button>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="flex justify-between items-center">
                <div>
                  <strong class="text-gray-900">Security Manager</strong>
                  <div class="text-gray-600">Risk & service management</div>
                </div>
                <button onclick="fillCredentials('avi_security', 'demo123')"
                        class="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition">
                  Use
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center text-sm text-gray-600">
        <p>
          <a href="/health" class="text-indigo-600 hover:text-indigo-500">System Health</a> |
          <a href="/operations" class="text-indigo-600 hover:text-indigo-500">Operations Center</a>
        </p>
      </div>
    </div>
  </div>

  <script>
    function fillCredentials(username, password) {
      document.getElementById('username').value = username;
      document.getElementById('password').value = password;
    }

    document.body.addEventListener('htmx:afterRequest', function(evt) {
      if (evt.detail.xhr.status === 200 && evt.detail.requestConfig.path === '/auth/login') {
        const redirectUrl = evt.detail.xhr.getResponseHeader('HX-Redirect');
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      }
    });

    document.body.addEventListener('loginSuccess', function() {
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    });
  </script>
</body>
</html>
  `);
});

// Test page to verify dropdowns work
app.get('/test', (c) => {
  const testUser = { username: 'test', role: 'admin', firstName: 'Test' };
  
  return c.html(
    cleanLayout({
      title: 'Dropdown Test',
      user: testUser,
      content: html`
        <div class="min-h-screen bg-gray-50 py-12">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-white rounded-xl shadow-lg p-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-6">Dropdown Functionality Test</h1>
              
              <div class="space-y-4">
                <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h2 class="text-lg font-semibold text-green-800 mb-2">✅ Test Instructions</h2>
                  <ul class="text-green-700 space-y-1">
                    <li>1. Click on navigation dropdown buttons (Overview, Risk, Compliance, Admin, Notifications)</li>
                    <li>2. Verify dropdowns open and close properly</li>
                    <li>3. Check that only one dropdown opens at a time</li>
                    <li>4. Confirm clicking outside closes dropdowns</li>
                    <li>5. Test all navigation links work (Operations, Intelligence should now work!)</li>
                    <li>6. Test dropdown functionality in modals/other pages</li>
                  </ul>
                </div>
                
                <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h2 class="text-lg font-semibold text-purple-800 mb-2">🔄 HTMX Dropdown Test</h2>
                  <p class="text-purple-700 mb-4">Test dropdowns in HTMX-loaded content:</p>
                  <button hx-get="/test/modal" 
                          hx-target="#modal-test" 
                          hx-swap="innerHTML"
                          class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    Load HTMX Modal with Dropdown
                  </button>
                  <div id="modal-test" class="mt-4 p-4 bg-white border border-purple-200 rounded-lg"></div>
                </div>
                
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h2 class="text-lg font-semibold text-blue-800 mb-2">🔍 Console Check</h2>
                  <p class="text-blue-700">Open browser DevTools → Console and look for:</p>
                  <ul class="text-blue-700 mt-2 space-y-1">
                    <li>• "✅ ARIA5 dropdowns initialized"</li>
                    <li>• "🎯 Dropdown opened/closed" messages when clicking</li>
                    <li>• No JavaScript errors or warnings</li>
                  </ul>
                </div>
                
                <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h2 class="text-lg font-semibold text-purple-800 mb-2">🚀 Navigation Test</h2>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <a href="/dashboard" class="bg-blue-500 text-white px-4 py-2 rounded text-center hover:bg-blue-600">Dashboard</a>
                    <a href="/risk" class="bg-red-500 text-white px-4 py-2 rounded text-center hover:bg-red-600">Risk Register</a>
                    <a href="/compliance" class="bg-green-500 text-white px-4 py-2 rounded text-center hover:bg-green-600">Compliance</a>
                    <a href="/admin" class="bg-purple-500 text-white px-4 py-2 rounded text-center hover:bg-purple-600">Admin</a>
                    <a href="/reports" class="bg-indigo-500 text-white px-4 py-2 rounded text-center hover:bg-indigo-600">Reports</a>
                    <a href="/operations" class="bg-orange-500 text-white px-4 py-2 rounded text-center hover:bg-orange-600">Operations</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    })
  );
});

// Test modal endpoint for HTMX dropdown testing
app.get('/test/modal', (c) => {
  return c.html(html`
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-lg font-semibold text-blue-800 mb-4">HTMX-Loaded Content with Dropdown</h3>
      <p class="text-blue-700 mb-4">This content was loaded via HTMX. Test the dropdown below:</p>
      
      <!-- Test dropdown in HTMX content -->
      <div class="relative" data-dropdown>
        <button data-dropdown-button class="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium transition-colors">
          <i class="fas fa-cog mr-1"></i>
          <span>HTMX Test Dropdown</span>
          <i class="fas fa-chevron-down text-xs"></i>
        </button>
        <div data-dropdown-menu class="dropdown-menu absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div class="py-2">
            <a href="#" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
              <i class="fas fa-check w-5 text-green-500 mr-3"></i>
              <div>
                <div class="font-medium">Option 1</div>
                <div class="text-xs text-gray-500">This dropdown works in HTMX content</div>
              </div>
            </a>
            <a href="#" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
              <i class="fas fa-star w-5 text-yellow-500 mr-3"></i>
              <div>
                <div class="font-medium">Option 2</div>
                <div class="text-xs text-gray-500">Dropdowns re-initialize after HTMX swaps</div>
              </div>
            </a>
          </div>
        </div>
      </div>
      
      <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded">
        <p class="text-green-700 text-sm">
          ✅ <strong>Success!</strong> If this dropdown works, then HTMX dropdown re-initialization is working correctly.
        </p>
      </div>
    </div>
  `);
});

// Mount route groups with authentication
const authRoutes = createAuthRoutes();
const dashboardRoutes = createCleanDashboardRoutes();
const riskRoutes = createRiskRoutesARIA5();
const complianceRoutes = createComplianceRoutes();
const operationsRoutes = createOperationsRoutes();
const intelligenceRoutes = createIntelligenceRoutes();
const adminRoutes = createAdminRoutesARIA5();
const apiRoutes = createAPIRoutes();
const aiRoutes = createAIAssistantRoutes();
const apiKeyRoutes = createApiKeyRoutes();
const policyRoutes = createPolicyManagementRoutes();

// Public routes (no authentication required)
app.route('/auth', authRoutes);

// Protected routes (require authentication)
app.use('/dashboard/*', authMiddleware);
app.route('/dashboard', dashboardRoutes);

app.use('/risk/*', authMiddleware);
app.route('/risk', riskRoutes);
app.route('/risk', enhancedRiskRoutes);

// Risk-Control Mapping Routes
app.use('/risk-controls/*', authMiddleware);
const riskControlRoutes = createRiskControlRoutes();
app.route('/risk-controls', riskControlRoutes);

app.use('/compliance/*', authMiddleware);
app.route('/compliance', complianceRoutes);

app.use('/operations/*', authMiddleware);
app.route('/operations', operationsRoutes);

// Direct asset and document routes (protected)
app.get('/assets', authMiddleware, async (c) => {
  return c.redirect('/operations/assets');
});

app.get('/documents', authMiddleware, async (c) => {
  return c.redirect('/operations/documents');
});

// Intelligence routes (require authentication)
app.use('/intelligence/*', authMiddleware);
app.route('/intelligence', intelligenceRoutes);

// Reports route - redirect to AI insights (AI-native enhancement)
app.get('/reports', authMiddleware, async (c) => {
  return c.redirect('/ai-insights');
});

// Admin routes (require admin role)
app.use('/admin/*', authMiddleware);
app.use('/admin/*', requireAdmin);
app.route('/admin', adminRoutes);

// API routes (require authentication)
app.use('/api/*', authMiddleware);
app.route('/api', apiRoutes);

// Enhanced Risk Engine API routes (require authentication)
app.use('/api/enhanced-risk-engine/*', authMiddleware);
app.route('/api/enhanced-risk-engine', enhancedRiskEngineApi);

// Phase Dashboard routes (require authentication)
app.use('/phase1/*', authMiddleware);
const phase1Routes = createPhase1DashboardRoutes();
app.route('/phase1', phase1Routes);

app.use('/phase2/*', authMiddleware);
const phase2Routes = createPhase2DashboardRoutes();
app.route('/phase2', phase2Routes);

app.use('/phase3/*', authMiddleware);
const phase3Routes = createPhase3DashboardRoutes();
app.route('/phase3', phase3Routes);

app.use('/phase4/*', authMiddleware);
app.route('/phase4', phase4EvidenceDashboard);

app.use('/phase5/*', authMiddleware);
app.route('/phase5', phase5ExecutiveDashboard);

// Mount dynamic risk analysis route to fix 404
app.use('/dynamic-risk-analysis/*', authMiddleware);
app.route('/dynamic-risk-analysis', dynamicRiskAnalysisRoutes);

// Dynamic Risk Analysis routes (require authentication) - Fixed
app.use('/dynamic-risk-analysis/*', authMiddleware);
app.route('/dynamic-risk-analysis', dynamicRiskAnalysisRoutes);

// API Key management routes (require authentication)
app.use('/api/keys/*', authMiddleware);
app.route('/api/keys', apiKeyRoutes);

// AI Assistant routes (require authentication)
app.use('/ai/*', authMiddleware);
app.route('/ai', aiRoutes);

// Policy Management routes (require authentication)
app.use('/policies/*', authMiddleware);
app.route('/policies', policyRoutes);

// Advanced Analytics & Enterprise Scale Routes (protected)
app.use('/analytics/*', authMiddleware);
app.route('/analytics', mlAnalyticsRoutes);

app.use('/threat-intel/*', authMiddleware);
app.route('/threat-intel', threatIntelRoutes);

app.use('/incident-response/*', authMiddleware);
app.route('/incident-response', incidentResponseRoutes);

// Advanced Analytics & Enterprise Scale API Routes (protected)
app.use('/api/analytics/*', authMiddleware);
app.route('/api/analytics', apiAnalyticsRoutes);

app.use('/api/threat-intel/*', authMiddleware);
app.route('/api/threat-intel', apiThreatIntelRoutes);

app.use('/api/incident-response/*', authMiddleware);
app.route('/api/incident-response', apiIncidentResponseRoutes);

// Clean 404 handler - NO full page layout to prevent injection
app.notFound((c) => {
  // Check if this is an HTMX request
  const htmxRequest = c.req.header('HX-Request');
  
  if (htmxRequest) {
    // Return simple error for HTMX requests
    return c.html('<div class="text-gray-500 text-center p-4">Content not available</div>', 404);
  }
  
  // Full page 404 for regular requests
  return c.html(
    cleanLayout({
      title: '404 - Page Not Found',
      content: html`
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <h1 class="text-6xl font-bold text-gray-200">404</h1>
            <p class="text-xl text-gray-600 mt-4">Page not found</p>
            <a href="/dashboard" class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Go to Dashboard
            </a>
          </div>
        </div>
      `
    }),
    404
  );
});

// AI-NATIVE ENHANCEMENT: Add new AI-powered routes (NON-BREAKING ADDITION)
app.use('/ai-insights/*', authMiddleware);
app.route('/ai-insights', aiInsightsUIRoutes); // Use comprehensive UI routes

app.use('/decision-center/*', authMiddleware);
app.route('/decision-center', decisionCenterRoutes);

// AI-NATIVE PHASE 4-8: Advanced AI Services (NEW)
// Phase 4: Evidence Collection & Learning System
app.use('/api/evidence/*', authMiddleware);
app.route('/api/evidence', evidenceCollectionRoutes);

// Phase 5: Executive Intelligence & Reporting  
app.use('/api/executive/*', authMiddleware);
app.route('/api/executive', executiveIntelligenceRoutes);

// Phase 6: Advanced Analytics & Mobile Platform
app.use('/api/analytics/*', authMiddleware);
app.route('/api/analytics', advancedAnalyticsRoutes);

// Phase 7: Enterprise Scale & Multi-tenancy
app.use('/api/enterprise/*', authMiddleware);
app.route('/api/enterprise', enterpriseScaleRoutes);

// Phase 8: Integration Platform & Partner Ecosystem
app.use('/api/integrations/*', authMiddleware);
app.route('/api/integrations', integrationPlatformRoutes);

// Legacy route redirects for AI-native consolidation (NON-BREAKING)
app.get('/analytics', authMiddleware, async (c) => {
  return c.redirect('/ai-insights');
});

// AI-NATIVE PHASE 4-8: Route redirects for new capabilities
app.get('/evidence-collection', authMiddleware, async (c) => {
  return c.redirect('/ai-insights?tab=evidence');
});

app.get('/executive-intelligence', authMiddleware, async (c) => {
  return c.redirect('/decision-center?view=executive');
});

app.get('/enterprise-scale', authMiddleware, async (c) => {
  return c.redirect('/admin/enterprise');
});

app.get('/integrations', authMiddleware, async (c) => {
  return c.redirect('/operations/integrations');
});

// Missing general routes (to fix 404 errors)
app.get('/predictions', authMiddleware, async (c) => {
  return c.redirect('/phase2/');
});

app.get('/telemetry', authMiddleware, async (c) => {
  return c.redirect('/operations/intelligence-settings');
});

app.get('/evidence', authMiddleware, async (c) => {
  return c.redirect('/phase4/');
});

app.get('/ai-analytics', authMiddleware, async (c) => {
  return c.redirect('/intelligence/behavioral-analytics');
});

// Dynamic Risk Engine alias routes
app.get('/dynamic-risk', authMiddleware, async (c) => {
  return c.redirect('/dynamic-risk-analysis');
});

app.get('/risk-engine', authMiddleware, async (c) => {
  return c.redirect('/dynamic-risk-analysis');
});

// Clean error handler
app.onError((err, c) => {
  console.error(`Error: ${err}`);
  
  // Check if this is an HTMX request
  const htmxRequest = c.req.header('HX-Request');
  
  if (htmxRequest) {
    // Return simple error for HTMX requests
    return c.html('<div class="text-red-500 text-center p-4">Server error. Please try again.</div>', 500);
  }
  
  // Full page error for regular requests
  return c.html(
    cleanLayout({
      title: 'Error',
      content: html`
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <h1 class="text-4xl font-bold text-red-600">Error</h1>
            <p class="text-gray-600 mt-4">Something went wrong. Please try again.</p>
            <a href="/dashboard" class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Go to Dashboard
            </a>
          </div>
        </div>
      `
    }),
    500
  );
});

export default app;