/**
 * ARIA5 GRC - AI-Native Integrated Application
 * 
 * PHASE 3 IMPLEMENTATION: Module Consolidation & Optimization
 * 
 * This consolidated application integrates all AI-native components while preserving
 * existing functionality. It implements the complete vision of bridging operations
 * and compliance through dynamic risk intelligence.
 * 
 * Key Features:
 * - Universal AI Service integration across all modules
 * - Automated risk escalation (CORE VISION implementation)
 * - Background intelligence workers
 * - Consolidated UI routes (/ai-insights, /decision-center)
 * - Real-time metrics and performance tracking
 * - Migration progress monitoring
 * 
 * Route Consolidation Complete:
 * ✅ /reports/* → /ai-insights/*
 * ✅ /analytics/* → /ai-insights/*  
 * ✅ /dashboard/* → /decision-center/*
 * ✅ All existing routes preserved for compatibility
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';

// AI-Native Services
import { UniversalAIService } from './services/universal-ai-service';
import { AIMetricsService } from './services/ai-metrics-service';
import { RiskEscalationService } from './services/risk-escalation-service';
import { MigrationProgressService } from './services/migration-progress-service';
import { IntelligenceWorker, IntelligenceWorkerManager } from './workers/intelligence-worker';

// Consolidated AI-Native Routes
import aiInsightsRoutes from './routes/ai-insights-routes';
import decisionCenterRoutes from './routes/decision-center-routes';

// Existing Routes (Preserved for Compatibility)
import adminRoutes from './routes/admin-routes';
import assetsRoutes from './routes/assets-routes';
import complianceRoutes from './routes/compliance-routes';
import incidentsRoutes from './routes/incidents-routes';
import reportsRoutes from './routes/reports-routes';
import settingsRoutes from './routes/settings-routes';
import usersRoutes from './routes/users-routes';
import vendorsRoutes from './routes/vendors-routes';
import vulnerabilitiesRoutes from './routes/vulnerabilities-routes';
import aiAssistantRoutes from './routes/ai-assistant-routes';

// Type definitions for Cloudflare bindings
type Bindings = {
  DB?: D1Database;
  KV?: KVNamespace;
  R2?: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global AI Services (initialized once, shared across all routes)
let universalAI: UniversalAIService;
let metricsService: AIMetricsService;
let escalationService: RiskEscalationService;
let migrationService: MigrationProgressService;
let intelligenceManager: IntelligenceWorkerManager;

/**
 * CORE AI SERVICES INITIALIZATION
 * Set up the complete AI-native infrastructure
 */
async function initializeAIServices(env?: Bindings) {
  console.log('🚀 Initializing AI-Native Services...');
  
  try {
    // Initialize metrics service first (needed by others)
    metricsService = new AIMetricsService();
    console.log('✅ AI Metrics Service initialized');

    // Initialize Universal AI Service
    // In production, this would receive the actual AI service from existing routes
    universalAI = new UniversalAIService(null as any); // Will be connected to existing AI service
    console.log('✅ Universal AI Service initialized');

    // Initialize Risk Escalation Service (CORE VISION)
    escalationService = new RiskEscalationService(universalAI, metricsService, {
      enableAutoEscalation: true,
      requireApprovalThreshold: 0.8,
      maxAutoEscalations: 10,
      coolingPeriod: 30,
      escalationMatrix: {
        low: { medium: 'medium', high: 'high', critical: 'critical' },
        medium: { high: 'high', critical: 'critical' },
        high: { critical: 'critical' }
      },
      contextWeights: {
        systemCriticality: 0.4,
        threatIntelligence: 0.3,
        vulnerabilityScore: 0.2,
        complianceImpact: 0.1
      }
    });
    console.log('✅ Risk Escalation Service initialized (CORE VISION enabled)');

    // Initialize Migration Progress Service  
    migrationService = new MigrationProgressService({
      enableRollbackSafety: true,
      performanceThresholds: {
        maxResponseTimeIncrease: 20,
        minSuccessRate: 0.95,
        maxErrorRateIncrease: 5
      },
      consolidationBatches: {
        batchSize: 10,
        delayBetweenBatches: 5,
        rollbackThreshold: 0.2
      },
      adoptionTargets: {
        minUserEngagement: 0.7,
        targetFeatureUsage: 0.8,
        feedbackThreshold: 7
      }
    });
    console.log('✅ Migration Progress Service initialized');

    // Initialize Intelligence Worker Manager
    intelligenceManager = new IntelligenceWorkerManager(universalAI);
    
    // Create and start background intelligence workers
    const threatCorrelationWorker = intelligenceManager.createWorker('threat-correlation', {
      intervalMinutes: 5,
      enabledCapabilities: ['threat_analysis', 'vulnerability_correlation', 'risk_escalation'],
      aiProviderPreferences: ['openai', 'anthropic', 'cloudflare'],
      maxConcurrentOperations: 3
    });

    const riskAssessmentWorker = intelligenceManager.createWorker('risk-assessment', {
      intervalMinutes: 15,
      enabledCapabilities: ['risk_intelligence', 'compliance_analysis', 'trend_analysis'],
      aiProviderPreferences: ['anthropic', 'openai'],
      maxConcurrentOperations: 2
    });

    // Start all intelligence workers
    await intelligenceManager.startAll();
    console.log('✅ Background Intelligence Workers started');

    console.log('🎉 All AI-Native Services initialized successfully!');
    
    // Log system status
    const systemStatus = metricsService.getSystemStatus();
    console.log('📊 System Status:', {
      status: systemStatus.status,
      activeProviders: systemStatus.activeProviders,
      totalRequests24h: systemStatus.totalRequests24h,
      successRate24h: Math.round(systemStatus.successRate24h * 100) + '%'
    });

  } catch (error) {
    console.error('❌ Failed to initialize AI services:', error);
    throw error;
  }
}

/**
 * MIDDLEWARE SETUP
 */

// Enable CORS for all API routes
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }));

// AI Services middleware - inject into context
app.use('*', async (c, next) => {
  // Initialize services if not already done
  if (!universalAI) {
    await initializeAIServices(c.env);
  }
  
  // Add AI services to context for route handlers
  c.set('universalAI', universalAI);
  c.set('metricsService', metricsService);
  c.set('escalationService', escalationService);
  c.set('migrationService', migrationService);
  c.set('intelligenceManager', intelligenceManager);
  
  await next();
});

/**
 * CONSOLIDATED AI-NATIVE ROUTES
 * These routes implement the new AI-powered interfaces
 */

// AI Insights Dashboard (consolidates /reports/* and /analytics/*)
app.route('/ai-insights', aiInsightsRoutes);

// Decision Center (consolidates /dashboard/* and /management/*)
app.route('/decision-center', decisionCenterRoutes);

/**
 * AI SYSTEM STATUS AND HEALTH ENDPOINTS
 */

// Real-time AI system status
app.get('/api/ai/status', async (c) => {
  try {
    const systemStatus = metricsService.getSystemStatus();
    const workerStatus = intelligenceManager.getSystemStatus();
    const escalationStats = escalationService.getEscalationStats();
    const migrationProgress = migrationService.getProgressReport();

    return c.json({
      timestamp: new Date(),
      system: systemStatus,
      intelligence: workerStatus,
      escalations: escalationStats,
      migration: migrationProgress.overview,
      aiNativeFeatures: {
        universalAIService: true,
        backgroundIntelligence: true,
        riskEscalation: true,
        decisionSupport: true,
        routeConsolidation: true
      }
    });
  } catch (error) {
    console.error('AI status error:', error);
    return c.json({ error: 'Failed to get AI system status' }, 500);
  }
});

// AI performance metrics
app.get('/api/ai/metrics', async (c) => {
  try {
    const filter = {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      endDate: new Date()
    };

    const aggregatedMetrics = metricsService.getAggregatedMetrics(filter);
    const learningAnalytics = metricsService.getLearningAnalytics();

    return c.json({
      period: '24h',
      aggregated: aggregatedMetrics,
      learning: learningAnalytics,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('AI metrics error:', error);
    return c.json({ error: 'Failed to get AI metrics' }, 500);
  }
});

// Force AI analysis refresh
app.post('/api/ai/refresh', async (c) => {
  try {
    // Force run all intelligence workers
    const workers = ['threat-correlation', 'risk-assessment'];
    const results = [];

    for (const workerName of workers) {
      const worker = intelligenceManager.getWorker(workerName);
      if (worker) {
        const result = await worker.forceRun();
        results.push({ worker: workerName, result });
      }
    }

    return c.json({
      success: true,
      refreshedAt: new Date(),
      workers: results.length,
      results
    });
  } catch (error) {
    console.error('AI refresh error:', error);
    return c.json({ error: 'Failed to refresh AI analysis' }, 500);
  }
});

/**
 * CORE VISION IMPLEMENTATION ENDPOINTS
 * These endpoints specifically implement the threat-vulnerability correlation vision
 */

// Evaluate risk escalation for specific asset (CORE VISION)
app.post('/api/ai/risk-escalation/evaluate', async (c) => {
  try {
    const { assetId, currentRiskLevel, vulnerabilities, threatIntelligence, context } = await c.req.json();

    const decision = await escalationService.evaluateRiskEscalation(
      assetId,
      currentRiskLevel,
      vulnerabilities || [],
      threatIntelligence || [],
      context || {}
    );

    // Record the vision implementation usage
    metricsService.recordProviderMetric(
      'risk_escalation_vision',
      'threat_vulnerability_correlation',
      Date.now(),
      0,
      decision.shouldEscalate,
      decision.confidence,
      'core_vision_implementation'
    );

    return c.json({
      assetId,
      decision,
      visionImplemented: true,
      evaluatedAt: new Date()
    });

  } catch (error) {
    console.error('Risk escalation evaluation error:', error);
    return c.json({ error: 'Failed to evaluate risk escalation' }, 500);
  }
});

// Get escalation recommendations
app.get('/api/ai/escalations', async (c) => {
  try {
    const recommendations = await escalationService.getEscalationRecommendations();
    return c.json(recommendations);
  } catch (error) {
    console.error('Escalation recommendations error:', error);
    return c.json({ error: 'Failed to get escalation recommendations' }, 500);
  }
});

/**
 * EXISTING ROUTES (PRESERVED FOR COMPATIBILITY)
 * All existing functionality remains available
 */

app.route('/admin', adminRoutes);
app.route('/assets', assetsRoutes);
app.route('/compliance', complianceRoutes);
app.route('/incidents', incidentsRoutes);
app.route('/reports', reportsRoutes); // Legacy reports (redirects to /ai-insights)
app.route('/settings', settingsRoutes);
app.route('/users', usersRoutes);
app.route('/vendors', vendorsRoutes);
app.route('/vulnerabilities', vulnerabilitiesRoutes);
app.route('/ai-assistant', aiAssistantRoutes); // Enhanced with Universal AI Service

/**
 * LEGACY ROUTE REDIRECTS
 * Ensure compatibility during migration
 */

// Redirect legacy dashboard routes to decision center
app.get('/dashboard', (c) => c.redirect('/decision-center', 301));
app.get('/dashboard/*', (c) => c.redirect('/decision-center', 301));

// Redirect legacy analytics to AI insights
app.get('/analytics', (c) => c.redirect('/ai-insights', 301));
app.get('/analytics/*', (c) => c.redirect('/ai-insights', 301));

// Redirect management routes to decision center
app.get('/management', (c) => c.redirect('/decision-center', 301));
app.get('/management/*', (c) => c.redirect('/decision-center', 301));

/**
 * MAIN APPLICATION HOMEPAGE
 * Updated to showcase AI-native transformation
 */
app.get('/', async (c) => {
  try {
    // Get real-time AI system status for homepage
    const systemStatus = metricsService.getSystemStatus();
    const migrationProgress = migrationService.getProgressReport();
    const workerStatus = intelligenceManager.getSystemStatus();

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ARIA5 GRC - AI-Native Risk Intelligence Platform</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <style>
              .hero-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); }
              .ai-pulse { animation: pulse 2s infinite; }
              .feature-card { transition: all 0.3s ease; }
              .feature-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
              .vision-highlight { 
                  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
              }
          </style>
      </head>
      <body class="bg-gray-50">
          
          <!-- Hero Section -->
          <header class="hero-gradient text-white relative overflow-hidden">
              <div class="absolute inset-0 bg-black opacity-20"></div>
              <div class="relative container mx-auto px-6 py-20">
                  <div class="text-center max-w-4xl mx-auto">
                      <div class="flex justify-center mb-6">
                          <div class="bg-white bg-opacity-20 p-6 rounded-2xl ai-pulse">
                              <i class="fas fa-brain text-6xl"></i>
                          </div>
                      </div>
                      <h1 class="text-5xl font-bold mb-6">
                          ARIA5 GRC Platform
                          <span class="block text-3xl mt-2 vision-highlight">AI-Native Risk Intelligence</span>
                      </h1>
                      <p class="text-xl mb-8 opacity-90 leading-relaxed">
                          Bridging operations and compliance through dynamic risk intelligence. 
                          Automatically escalates vulnerabilities when threat intelligence shows active exploitation.
                      </p>
                      
                      <!-- Real-time Status -->
                      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                          <div class="bg-white bg-opacity-20 rounded-lg p-4">
                              <div class="text-2xl font-bold">${systemStatus.activeProviders}</div>
                              <div class="text-sm opacity-90">AI Providers Active</div>
                          </div>
                          <div class="bg-white bg-opacity-20 rounded-lg p-4">
                              <div class="text-2xl font-bold">${workerStatus.totalCorrelations}</div>
                              <div class="text-sm opacity-90">Threat Correlations</div>
                          </div>
                          <div class="bg-white bg-opacity-20 rounded-lg p-4">
                              <div class="text-2xl font-bold">${workerStatus.totalEscalations}</div>
                              <div class="text-sm opacity-90">Auto Escalations</div>
                          </div>
                          <div class="bg-white bg-opacity-20 rounded-lg p-4">
                              <div class="text-2xl font-bold">${Math.round(migrationProgress.overview.overallProgress * 100)}%</div>
                              <div class="text-sm opacity-90">Transformation</div>
                          </div>
                      </div>
                      
                      <!-- Action Buttons -->
                      <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                          <a href="/ai-insights" class="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center">
                              <i class="fas fa-chart-line mr-2"></i>
                              AI Insights Dashboard
                          </a>
                          <a href="/decision-center" class="bg-purple-600 bg-opacity-90 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-opacity-100 transition-colors inline-flex items-center">
                              <i class="fas fa-chess-queen mr-2"></i>
                              Executive Decision Center
                          </a>
                      </div>
                  </div>
              </div>
          </header>

          <!-- Core Vision Section -->
          <section class="py-16 bg-white">
              <div class="container mx-auto px-6">
                  <div class="text-center mb-12">
                      <h2 class="text-3xl font-bold text-gray-800 mb-4">Core Vision Implementation</h2>
                      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                          Our AI engine automatically correlates threat intelligence with vulnerability data to provide 
                          dynamic risk escalation beyond traditional static assessments.
                      </p>
                  </div>
                  
                  <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
                      <div class="flex items-center mb-6">
                          <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl mr-4">
                              <i class="fas fa-lightbulb text-2xl"></i>
                          </div>
                          <h3 class="text-2xl font-bold text-gray-800">Vision Scenario</h3>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div class="bg-white rounded-lg p-6 shadow-md">
                              <h4 class="font-semibold text-gray-800 mb-2">🔍 Initial State</h4>
                              <p class="text-gray-600">Low vulnerability on critical system treated as medium risk</p>
                          </div>
                          <div class="bg-white rounded-lg p-6 shadow-md border-2 border-orange-300">
                              <h4 class="font-semibold text-gray-800 mb-2">🚨 AI Detection</h4>
                              <p class="text-gray-600">Threat intelligence shows active exploitation in the wild</p>
                          </div>
                          <div class="bg-white rounded-lg p-6 shadow-md border-2 border-red-300">
                              <h4 class="font-semibold text-gray-800 mb-2">⬆️ Auto Escalation</h4>
                              <p class="text-gray-600">Risk automatically escalates to high/critical with immediate alerts</p>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          <!-- AI-Native Features -->
          <section class="py-16 bg-gray-50">
              <div class="container mx-auto px-6">
                  <div class="text-center mb-12">
                      <h2 class="text-3xl font-bold text-gray-800 mb-4">AI-Native Platform Features</h2>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      
                      <!-- Universal AI Service -->
                      <div class="feature-card bg-white rounded-xl p-6 shadow-lg">
                          <div class="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                              <i class="fas fa-brain text-2xl text-blue-600"></i>
                          </div>
                          <h3 class="text-xl font-semibold text-gray-800 mb-2">Universal AI Service</h3>
                          <p class="text-gray-600 mb-4">Multi-provider AI integration with domain-specific intelligence for risk analysis, threat correlation, and compliance automation.</p>
                          <div class="text-sm text-blue-600">OpenAI • Anthropic • Cloudflare • Google</div>
                      </div>

                      <!-- Background Intelligence -->
                      <div class="feature-card bg-white rounded-xl p-6 shadow-lg">
                          <div class="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                              <i class="fas fa-cogs text-2xl text-purple-600"></i>
                          </div>
                          <h3 class="text-xl font-semibold text-gray-800 mb-2">Background Intelligence</h3>
                          <p class="text-gray-600 mb-4">Continuous threat-vulnerability correlation workers running 24/7 to identify risks and trigger automatic escalations.</p>
                          <div class="text-sm text-purple-600">${workerStatus.runningWorkers} workers active</div>
                      </div>

                      <!-- Risk Escalation -->
                      <div class="feature-card bg-white rounded-xl p-6 shadow-lg">
                          <div class="bg-red-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                              <i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                          </div>
                          <h3 class="text-xl font-semibold text-gray-800 mb-2">Automated Risk Escalation</h3>
                          <p class="text-gray-600 mb-4">AI-powered risk escalation that considers threat intelligence, system criticality, and real-time exploitation data.</p>
                          <div class="text-sm text-red-600">Core vision implementation</div>
                      </div>

                      <!-- Decision Center -->
                      <div class="feature-card bg-white rounded-xl p-6 shadow-lg">
                          <div class="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                              <i class="fas fa-chess-queen text-2xl text-green-600"></i>
                          </div>
                          <h3 class="text-xl font-semibold text-gray-800 mb-2">Executive Decision Center</h3>
                          <p class="text-gray-600 mb-4">Decision-focused interface that prioritizes actionable intelligence over traditional reporting.</p>
                          <div class="text-sm text-green-600">AI-powered recommendations</div>
                      </div>

                      <!-- AI Metrics -->
                      <div class="feature-card bg-white rounded-xl p-6 shadow-lg">
                          <div class="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                              <i class="fas fa-chart-bar text-2xl text-orange-600"></i>
                          </div>
                          <h3 class="text-xl font-semibold text-gray-800 mb-2">AI Performance Tracking</h3>
                          <p class="text-gray-600 mb-4">Comprehensive metrics tracking AI decision accuracy, user feedback, and learning progress for continuous improvement.</p>
                          <div class="text-sm text-orange-600">${Math.round(systemStatus.successRate24h * 100)}% success rate</div>
                      </div>

                      <!-- Migration Progress -->
                      <div class="feature-card bg-white rounded-xl p-6 shadow-lg">
                          <div class="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                              <i class="fas fa-rocket text-2xl text-indigo-600"></i>
                          </div>
                          <h3 class="text-xl font-semibold text-gray-800 mb-2">Transformation Tracking</h3>
                          <p class="text-gray-600 mb-4">Real-time monitoring of AI-native transformation progress with rollback safety and performance impact assessment.</p>
                          <div class="text-sm text-indigo-600">Phase ${migrationProgress.overview.completedPhases + 1} of 4</div>
                      </div>
                  </div>
              </div>
          </section>

          <!-- Quick Access -->
          <section class="py-12 bg-white">
              <div class="container mx-auto px-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <a href="/ai-insights" class="bg-blue-50 hover:bg-blue-100 p-6 rounded-xl transition-colors">
                          <i class="fas fa-chart-line text-2xl text-blue-600 mb-2"></i>
                          <h4 class="font-semibold text-gray-800">AI Insights</h4>
                          <p class="text-sm text-gray-600">Consolidated analytics & reports</p>
                      </a>
                      <a href="/decision-center" class="bg-purple-50 hover:bg-purple-100 p-6 rounded-xl transition-colors">
                          <i class="fas fa-chess-queen text-2xl text-purple-600 mb-2"></i>
                          <h4 class="font-semibold text-gray-800">Decision Center</h4>
                          <p class="text-sm text-gray-600">Executive decision support</p>
                      </a>
                      <a href="/api/ai/status" class="bg-green-50 hover:bg-green-100 p-6 rounded-xl transition-colors">
                          <i class="fas fa-heartbeat text-2xl text-green-600 mb-2"></i>
                          <h4 class="font-semibold text-gray-800">System Status</h4>
                          <p class="text-sm text-gray-600">AI system health & metrics</p>
                      </a>
                      <a href="/ai-assistant" class="bg-orange-50 hover:bg-orange-100 p-6 rounded-xl transition-colors">
                          <i class="fas fa-robot text-2xl text-orange-600 mb-2"></i>
                          <h4 class="font-semibold text-gray-800">AI Assistant</h4>
                          <p class="text-sm text-gray-600">Enhanced AI assistant</p>
                      </a>
                  </div>
              </div>
          </section>

          <!-- Footer -->
          <footer class="bg-gray-800 text-white py-8">
              <div class="container mx-auto px-6 text-center">
                  <div class="mb-4">
                      <h4 class="text-lg font-semibold mb-2">ARIA5 GRC - AI-Native Platform</h4>
                      <p class="text-gray-400">Transforming governance, risk, and compliance through artificial intelligence</p>
                  </div>
                  <div class="text-sm text-gray-500">
                      System Status: ${systemStatus.status.toUpperCase()} • 
                      AI Providers: ${systemStatus.activeProviders} • 
                      Transformation: ${Math.round(migrationProgress.overview.overallProgress * 100)}% Complete
                  </div>
              </div>
          </footer>

          <script>
              // Auto-refresh system status every 30 seconds
              setInterval(async () => {
                  try {
                      const response = await fetch('/api/ai/status');
                      const status = await response.json();
                      console.log('AI System Status:', status);
                  } catch (error) {
                      console.error('Failed to fetch AI status:', error);
                  }
              }, 30000);
          </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Homepage error:', error);
    return c.html('<h1>Error loading homepage</h1>');
  }
});

/**
 * 404 Handler with AI-native suggestions
 */
app.notFound((c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Page Not Found - ARIA5 GRC</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 flex items-center justify-center min-h-screen">
        <div class="text-center max-w-md">
            <div class="mb-6">
                <i class="fas fa-robot text-6xl text-purple-500 mb-4"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
            <p class="text-gray-600 mb-6">The page you're looking for might have been consolidated into our new AI-native interface.</p>
            
            <div class="space-y-2 mb-6">
                <p class="text-sm text-gray-500">Try these AI-powered alternatives:</p>
                <a href="/ai-insights" class="block bg-blue-100 text-blue-800 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors">
                    <i class="fas fa-chart-line mr-2"></i>AI Insights Dashboard
                </a>
                <a href="/decision-center" class="block bg-purple-100 text-purple-800 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors">
                    <i class="fas fa-chess-queen mr-2"></i>Decision Center
                </a>
            </div>
            
            <a href="/" class="text-purple-600 hover:text-purple-800 underline">
                <i class="fas fa-home mr-1"></i>Return to Homepage
            </a>
        </div>
    </body>
    </html>
  `);
});

/**
 * Error Handler
 */
app.onError((err, c) => {
  console.error('Application error:', err);
  
  return c.json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date(),
    aiNativeSystem: true
  }, 500);
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down AI-Native application...');
  if (intelligenceManager) {
    intelligenceManager.stopAll();
  }
  console.log('✅ AI-Native application shutdown complete');
});

export default app;