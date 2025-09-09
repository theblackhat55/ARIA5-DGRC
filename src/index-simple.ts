// ARIA5.1 - SIMPLIFIED VERSION FOR PHASE 1 DEMO
// Uses simplified authentication to enable immediate UI access
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { html } from 'hono/html';
import { serveStatic } from 'hono/cloudflare-workers';
import { getCookie } from 'hono/cookie';

// Import SIMPLIFIED auth components
import { createSimpleAuthRoutes } from './routes/simple-auth-routes';
import { simpleAuthMiddleware } from './middleware/simple-auth-middleware';

// Import ALL route handlers (Phase 1 enhanced)
import { createCleanDashboardRoutes } from './routes/dashboard-routes-clean';
import { createRiskRoutesARIA5 } from './routes/risk-routes-aria5';
import { createAIAssistantRoutes } from './routes/ai-assistant-routes';
import { createEnhancedComplianceRoutes } from './routes/enhanced-compliance-routes';
import { createOperationsRoutes } from './routes/operations-fixed';
import { createIntelligenceRoutes } from './routes/intelligence-routes';
import { createAdminRoutesARIA5 } from './routes/admin-routes-aria5';
import { createRiskControlRoutes } from './routes/risk-control-routes';
import { createSystemHealthRoutes } from './routes/system-health-routes';
import conversationalAssistantRoutes from './routes/conversational-assistant';
import { apiThreatIntelRoutes } from './routes/api-threat-intelligence';
import { tiGrcRoutes } from './routes/api-ti-grc-integration';
import complianceAutomationApi from './routes/compliance-automation-api';

// Import templates
import { cleanLayout } from './templates/layout-clean';
import { loginPage } from './templates/auth/login';
import { landingPage } from './templates/landing';

// Import Phase 1 Demo components
import { renderPhase1Demo } from './templates/phase1-demo';

const app = new Hono();

// Basic middleware
app.use('*', logger());

// CORS for development
app.use('*', cors({
  origin: '*',
  credentials: true,
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Basic security headers
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
    connectSrc: ["'self'"],
    objectSrc: ["'none'"]
  }
}));

// Serve static files
app.use('/static/*', serveStatic({ 
  root: './',
  onNotFound: (path, c) => {
    console.log(`Static file not found: ${path}`);
  }
}));

// Health check (public)
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    version: '5.1.0-simple',
    mode: 'Phase 1 Demo Ready',
    auth: 'Simplified',
    timestamp: new Date().toISOString()
  });
});

// PUBLIC ROUTES (No authentication required)

// Landing page
app.get('/', async (c) => {
  const token = getCookie(c, 'auth-token');
  
  // If authenticated, redirect to dashboard
  if (token) {
    return c.redirect('/dashboard');
  }
  
  // Show landing page for unauthenticated users
  return c.html(landingPage());
});

// Login page
app.get('/login', (c) => {
  const token = getCookie(c, 'auth-token');
  
  // If already authenticated, redirect to dashboard
  if (token) {
    return c.redirect('/dashboard');
  }
  
  return c.html(loginPage());
});

// Phase 1 Demo Route (Public access to show features)
app.get('/phase1-demo', async (c) => {
  return c.html(await renderPhase1Demo(c));
});

// Demo page (public access to show features)
app.get('/demo', async (c) => {
  return c.html(
    cleanLayout({
      title: 'ARIA5 Phase 1 Demo',
      user: null,
      content: html`
        <div class="min-h-screen bg-gray-50 py-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Demo Notice -->
            <div class="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-check-circle text-green-500 text-2xl"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-lg font-medium text-green-800">🚀 Foundation Enhancement - READY</h3>
                  <div class="mt-2 text-sm text-green-700">
                    <p><strong>✅ Service-Centric Architecture:</strong> Dynamic risk cascading across service dependencies</p>
                    <p><strong>✅ CIA Triad Scoring:</strong> Confidentiality, Integrity, Availability assessment</p>
                    <p><strong>✅ Risk Approval Workflow:</strong> Pending → Active risk approval process</p>
                    <p><strong>✅ Admin Integrations UI:</strong> Microsoft Defender, ServiceNow, Jira integration management</p>
                    <p><strong>✅ Simplified Auth:</strong> Ready for immediate testing (admin/demo123)</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Phase 1 Features Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center mb-4">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-sitemap text-blue-600"></i>
                  </div>
                  <h3 class="ml-3 text-lg font-medium text-gray-900">Service Dependencies</h3>
                </div>
                <p class="text-sm text-gray-600">Map and analyze risk cascading through service architecture with dynamic impact assessment.</p>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center mb-4">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-shield-alt text-green-600"></i>
                  </div>
                  <h3 class="ml-3 text-lg font-medium text-gray-900">CIA Triad Scoring</h3>
                </div>
                <p class="text-sm text-gray-600">Enhanced risk assessment using Confidentiality, Integrity, and Availability metrics.</p>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center mb-4">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-check-double text-purple-600"></i>
                  </div>
                  <h3 class="ml-3 text-lg font-medium text-gray-900">Approval Workflow</h3>
                </div>
                <p class="text-sm text-gray-600">Structured risk approval process with pending to active state transitions.</p>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center mb-4">
                  <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-cogs text-red-600"></i>
                  </div>
                  <h3 class="ml-3 text-lg font-medium text-gray-900">External Integrations</h3>
                </div>
                <p class="text-sm text-gray-600">Manage Microsoft Defender, ServiceNow, and Jira integrations from admin panel.</p>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center mb-4">
                  <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-robot text-yellow-600"></i>
                  </div>
                  <h3 class="ml-3 text-lg font-medium text-gray-900">AI-Enhanced Analysis</h3>
                </div>
                <p class="text-sm text-gray-600">Cloudflare Workers AI provides intelligent risk assessment and criticality analysis.</p>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center mb-4">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-database text-indigo-600"></i>
                  </div>
                  <h3 class="ml-3 text-lg font-medium text-gray-900">Enhanced Data Model</h3>
                </div>
                <p class="text-sm text-gray-600">Service-centric database schema with comprehensive risk relationship mapping.</p>
              </div>
            </div>

            <!-- Login CTA -->
            <div class="bg-white rounded-lg shadow p-8 text-center">
              <h3 class="text-2xl font-medium text-gray-900 mb-4">Ready to Explore Platform Enhancements?</h3>
              <p class="text-gray-600 mb-4">Login to access the enhanced risk management platform</p>
              <p class="text-sm text-gray-500 mb-6"><strong>Demo Credentials:</strong> admin / demo123</p>
              <a href="/login" 
                 class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center">
                <i class="fas fa-sign-in-alt mr-2"></i>
                Login to Platform
              </a>
            </div>
          </div>
        </div>
      `
    })
  );
});

// AUTHENTICATION ROUTES (Simplified)
app.route('/auth', createSimpleAuthRoutes());

// PROTECTED ROUTES (Require simplified authentication)

// Apply simple authentication middleware to all protected routes
app.use('/dashboard', simpleAuthMiddleware);
app.use('/risk', simpleAuthMiddleware);
app.use('/compliance', simpleAuthMiddleware);
app.use('/operations', simpleAuthMiddleware);
app.use('/admin', simpleAuthMiddleware);
app.use('/ai', simpleAuthMiddleware);
app.use('/intelligence', simpleAuthMiddleware);
app.use('/risk-controls', simpleAuthMiddleware);
app.use('/reports', simpleAuthMiddleware);
app.use('/documents', simpleAuthMiddleware);

// Dashboard (requires simplified auth)
app.route('/dashboard', createCleanDashboardRoutes());

// Risk Management (requires auth, Phase 1 enhanced)
app.route('/risk', createRiskRoutesARIA5());

// Enhanced Compliance Management with AI (requires auth)
app.route('/compliance', createEnhancedComplianceRoutes());

// Operations Management (requires auth)
app.route('/operations', createOperationsRoutes());

// Admin Management (requires auth - Phase 1 enhanced with integrations)
app.route('/admin', createAdminRoutesARIA5());

// AI Assistant (requires auth)
app.route('/ai', createAIAssistantRoutes());

// Intelligence routes (requires auth)
app.route('/intelligence', createIntelligenceRoutes());

// Risk Controls (requires auth)
app.route('/risk-controls', createRiskControlRoutes());

// Conversational AI Assistant API routes
app.route('/api/assistant', conversationalAssistantRoutes);

// Reports route - redirect to intelligence reports
app.get('/reports', (c) => {
  return c.redirect('/intelligence/reports');
});

// Documents route - redirect to operations documents  
app.get('/documents', (c) => {
  return c.redirect('/operations/documents');
});

// System Health API 
app.route('/api/system-health', createSystemHealthRoutes());

// Threat Intelligence API 
app.route('/api/threat-intelligence', apiThreatIntelRoutes);

// TI-GRC Integration API (Phase 1 Enhanced Features)
app.route('/api/ti-grc', tiGrcRoutes);

// AI Threat Analysis API (Phase 2 Enhanced Features)
import { aiThreatAnalysisRoutes } from './routes/api-ai-threat-analysis';
app.route('/api/ai-threat', aiThreatAnalysisRoutes);

// Risk Data Consistency API - Unified data layer
import apiRiskConsistencyRoutes from './routes/api-risk-consistency';
app.route('/api/risk-consistency', apiRiskConsistencyRoutes);

// Advanced Compliance Automation API 
app.route('/api/compliance-automation', complianceAutomationApi);

// DEBUG ENDPOINTS (for testing Phase 1 features)

// Debug endpoint for dashboard metrics (public for testing)
app.get('/debug/dashboard-stats', async (c) => {
  try {
    const risksResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN (probability * impact) >= 20 THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN (probability * impact) >= 12 AND (probability * impact) < 20 THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN (probability * impact) >= 6 AND (probability * impact) < 12 THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN (probability * impact) < 6 THEN 1 ELSE 0 END) as low
      FROM risks 
      WHERE status = 'active'
    `).first();

    const servicesResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_services,
        AVG(cia_score) as avg_cia_score,
        AVG(aggregate_risk_score) as avg_risk_score
      FROM services
    `).first();

    return c.json({
      timestamp: new Date().toISOString(),
      debug: 'Phase 1 Dashboard Stats',
      risks: {
        total: Number(risksResult?.total) || 0,
        critical: Number(risksResult?.critical) || 0,
        high: Number(risksResult?.high) || 0,
        medium: Number(risksResult?.medium) || 0,
        low: Number(risksResult?.low) || 0
      },
      services: {
        total: Number(servicesResult?.total_services) || 0,
        avg_cia_score: Number(servicesResult?.avg_cia_score) || 0,
        avg_risk_score: Number(servicesResult?.avg_risk_score) || 0
      },
      phase1_features: {
        service_centric_architecture: true,
        cia_triad_scoring: true,
        risk_cascading: true,
        approval_workflow: true,
        admin_integrations: true
      }
    });
  } catch (error) {
    return c.json({
      error: 'Failed to fetch Phase 1 debug stats',
      message: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Debug endpoint for service risk cascading
app.get('/debug/service-risks', async (c) => {
  try {
    const serviceRisks = await c.env.DB.prepare(`
      SELECT 
        s.id, s.name, s.criticality_level,
        s.confidentiality_score, s.integrity_score, s.availability_score, s.cia_score,
        s.aggregate_risk_score, s.risk_trend,
        COUNT(sr.risk_id) as associated_risks
      FROM services s
      LEFT JOIN service_risks sr ON s.id = sr.service_id
      GROUP BY s.id, s.name, s.criticality_level, s.confidentiality_score, s.integrity_score, s.availability_score, s.cia_score, s.aggregate_risk_score, s.risk_trend
      ORDER BY s.cia_score DESC, s.aggregate_risk_score DESC
    `).all();

    return c.json({
      success: true,
      debug: 'Phase 1 Service Risk Cascading',
      services: serviceRisks.results || []
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// Debug endpoint for pending risks (approval workflow)
app.get('/debug/pending-risks', async (c) => {
  try {
    const pendingRisks = await c.env.DB.prepare(`
      SELECT 
        id, title, category, description,
        probability, impact, risk_score,
        status, created_at, updated_at
      FROM risks 
      WHERE status = 'pending'
      ORDER BY risk_score DESC, created_at DESC
    `).all();

    return c.json({
      success: true,
      debug: 'Phase 1 Approval Workflow - Pending Risks',
      pending_risks: pendingRisks.results || []
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  const notFoundHtml = cleanLayout({
    title: '404 - Page Not Found',
    user: null,
    content: html`
      <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full text-center">
          <div class="mb-8">
            <i class="fas fa-exclamation-triangle text-6xl text-gray-400"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p class="text-xl text-gray-600 mb-8">Page not found</p>
          <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
            Return Home
          </a>
        </div>
      </div>
    `
  });
  
  return c.html(notFoundHtml, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error('Application error:', err);
  
  const errorHtml = cleanLayout({
    title: 'Error - ARIA5',
    user: null,
    content: html`
      <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full text-center">
          <div class="mb-8">
            <i class="fas fa-times-circle text-6xl text-red-400"></i>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Error</h1>
          <p class="text-xl text-gray-600 mb-8">Something went wrong</p>
          <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
            Return Home
          </a>
        </div>
      </div>
    `
  });
  
  return c.html(errorHtml, 500);
});

export default app;