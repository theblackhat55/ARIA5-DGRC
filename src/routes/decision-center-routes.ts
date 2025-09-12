/**
 * Decision Center Consolidated Routes
 * 
 * PHASE 2 IMPLEMENTATION: Decision-Focused Interface
 * 
 * Consolidates dashboard routes into a unified decision-making interface
 * that emphasizes actionable intelligence over traditional reporting.
 * 
 * Route Consolidation:
 * - /dashboard/* → /decision-center/*
 * - /management/* → /decision-center/*
 * - /executive/* → /decision-center/*
 * 
 * Key Features:
 * - Executive decision support
 * - Real-time action recommendations
 * - AI-powered scenario analysis
 * - Automated decision workflows
 */

import { Hono } from 'hono';
import { UniversalAIService } from '../services/universal-ai-service';
import { AIMetricsService } from '../services/ai-metrics-service';
import { RiskEscalationService } from '../services/risk-escalation-service';
import { MigrationProgressService } from '../services/migration-progress-service';

const app = new Hono();

// Initialize services
const universalAI = new UniversalAIService(null as any);
const metricsService = new AIMetricsService();
const escalationService = new RiskEscalationService(universalAI, metricsService, {
  enableAutoEscalation: true,
  requireApprovalThreshold: 0.8,
  maxAutoEscalations: 10,
  coolingPeriod: 30,
  escalationMatrix: {},
  contextWeights: {}
});

const migrationService = new MigrationProgressService({
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

/**
 * MAIN DECISION CENTER DASHBOARD
 * Executive-focused decision support interface
 */
app.get('/decision-center', async (c) => {
  try {
    const startTime = Date.now();

    // Get executive decision intelligence
    const decisionIntelligence = await generateDecisionIntelligence();
    
    // Get pending decisions requiring attention
    const pendingDecisions = await getPendingDecisions();
    
    // Get AI-powered scenario analysis
    const scenarioAnalysis = await getScenarioAnalysis();
    
    // Get migration progress for transformation tracking
    const migrationProgress = migrationService.getProgressReport();
    
    // Get system performance metrics
    const systemMetrics = metricsService.getSystemStatus();

    // Record metrics
    metricsService.recordProviderMetric(
      'decision_center',
      'executive_dashboard',
      Date.now() - startTime,
      0,
      true,
      0.92,
      'executive_decision_support'
    );

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Decision Center - ARIA5 GRC</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
              .executive-gradient { background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%); }
              .decision-card { transition: all 0.3s ease; }
              .decision-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.15); }
              .priority-badge { animation: pulse 1.5s infinite; }
              .ai-thinking { 
                  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
                  background-size: 400% 400%;
                  animation: aiThinking 4s ease infinite;
              }
              @keyframes aiThinking {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
              }
              .decision-flow { position: relative; }
              .decision-flow::before {
                  content: '';
                  position: absolute;
                  left: 15px;
                  top: 0;
                  bottom: 0;
                  width: 2px;
                  background: linear-gradient(to bottom, #3b82f6, #8b5cf6, #ec4899);
              }
          </style>
      </head>
      <body class="bg-gray-50 font-sans">
          
          <!-- Executive Header -->
          <header class="executive-gradient text-white shadow-2xl">
              <div class="container mx-auto px-6 py-6">
                  <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-6">
                          <div class="bg-white bg-opacity-20 p-4 rounded-xl">
                              <i class="fas fa-chess-queen text-3xl"></i>
                          </div>
                          <div>
                              <h1 class="text-3xl font-bold">Executive Decision Center</h1>
                              <p class="text-lg opacity-90">AI-Powered Strategic Intelligence & Decision Support</p>
                              <div class="flex items-center mt-2 space-x-4 text-sm">
                                  <span><i class="fas fa-clock mr-1"></i>Last Updated: ${new Date().toLocaleTimeString()}</span>
                                  <span><i class="fas fa-shield-check mr-1"></i>AI Confidence: ${Math.round(decisionIntelligence.overallConfidence * 100)}%</span>
                              </div>
                          </div>
                      </div>
                      <div class="text-right">
                          <div class="bg-white bg-opacity-20 rounded-xl p-4">
                              <div class="text-sm opacity-90">Transformation Progress</div>
                              <div class="text-2xl font-bold">${Math.round(migrationProgress.overview.overallProgress * 100)}%</div>
                              <div class="text-xs opacity-75">Phase ${migrationProgress.overview.completedPhases + 1} of 4</div>
                          </div>
                      </div>
                  </div>
              </div>
          </header>

          <!-- Critical Alerts Banner -->
          ${decisionIntelligence.criticalAlerts.length > 0 ? `
              <div class="bg-red-600 text-white">
                  <div class="container mx-auto px-6 py-3">
                      <div class="flex items-center justify-between">
                          <div class="flex items-center">
                              <i class="fas fa-exclamation-triangle text-xl mr-3 priority-badge"></i>
                              <span class="font-semibold">Critical Decision Required: ${decisionIntelligence.criticalAlerts[0].title}</span>
                          </div>
                          <button onclick="viewCriticalAlert()" class="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                              Review Now
                          </button>
                      </div>
                  </div>
              </div>
          ` : ''}

          <!-- Main Executive Dashboard -->
          <main class="container mx-auto px-6 py-8">
              
              <!-- Executive Summary Cards -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  
                  <!-- Pending Decisions -->
                  <div class="decision-card bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                      <div class="flex items-center justify-between mb-3">
                          <h3 class="text-lg font-semibold text-gray-800">Pending Decisions</h3>
                          <i class="fas fa-gavel text-2xl text-red-500"></i>
                      </div>
                      <div class="text-3xl font-bold text-red-500 mb-2">${pendingDecisions.length}</div>
                      <div class="text-sm text-gray-600">
                          ${pendingDecisions.filter(d => d.urgency === 'critical').length} Critical
                      </div>
                      <div class="mt-3">
                          <div class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                              Avg Response Time: ${decisionIntelligence.avgDecisionTime}
                          </div>
                      </div>
                  </div>

                  <!-- Risk Score -->
                  <div class="decision-card bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                      <div class="flex items-center justify-between mb-3">
                          <h3 class="text-lg font-semibold text-gray-800">Risk Exposure</h3>
                          <i class="fas fa-shield-alt text-2xl text-orange-500"></i>
                      </div>
                      <div class="text-3xl font-bold text-orange-500 mb-2">${decisionIntelligence.riskScore}</div>
                      <div class="text-sm text-gray-600">
                          ${decisionIntelligence.riskTrend === 'increasing' ? '📈' : decisionIntelligence.riskTrend === 'decreasing' ? '📉' : '➡️'} 
                          ${decisionIntelligence.riskTrend}
                      </div>
                      <div class="mt-3">
                          <div class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                              AI Prediction: ${decisionIntelligence.riskPrediction}
                          </div>
                      </div>
                  </div>

                  <!-- Decision Velocity -->
                  <div class="decision-card bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                      <div class="flex items-center justify-between mb-3">
                          <h3 class="text-lg font-semibold text-gray-800">Decision Velocity</h3>
                          <i class="fas fa-tachometer-alt text-2xl text-blue-500"></i>
                      </div>
                      <div class="text-3xl font-bold text-blue-500 mb-2">${decisionIntelligence.decisionVelocity}</div>
                      <div class="text-sm text-gray-600">decisions/day</div>
                      <div class="mt-3">
                          <div class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              Target: ${decisionIntelligence.velocityTarget}/day
                          </div>
                      </div>
                  </div>

                  <!-- AI Confidence -->
                  <div class="decision-card bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                      <div class="flex items-center justify-between mb-3">
                          <h3 class="text-lg font-semibold text-gray-800">AI Confidence</h3>
                          <i class="fas fa-brain text-2xl text-green-500"></i>
                      </div>
                      <div class="text-3xl font-bold text-green-500 mb-2">${Math.round(decisionIntelligence.overallConfidence * 100)}%</div>
                      <div class="text-sm text-gray-600">${systemMetrics.activeProviders} AI providers</div>
                      <div class="mt-3">
                          <div class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                              Status: ${systemMetrics.status.toUpperCase()}
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Decision Pipeline -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  
                  <!-- Priority Decisions -->
                  <div class="bg-white rounded-xl shadow-lg p-6">
                      <div class="flex items-center justify-between mb-6">
                          <h3 class="text-xl font-semibold text-gray-800">
                              <i class="fas fa-fire mr-2 text-red-500"></i>
                              Priority Decisions
                          </h3>
                          <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              ${pendingDecisions.filter(d => d.urgency === 'critical').length} Critical
                          </span>
                      </div>
                      <div class="decision-flow space-y-4">
                          ${pendingDecisions.slice(0, 5).map((decision, index) => `
                              <div class="relative pl-8 pb-4">
                                  <div class="absolute left-0 top-2 w-6 h-6 rounded-full ${
                                    decision.urgency === 'critical' ? 'bg-red-500' : 
                                    decision.urgency === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                                  } flex items-center justify-center">
                                      <span class="text-white text-xs font-bold">${index + 1}</span>
                                  </div>
                                  <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                                       onclick="reviewDecision('${decision.id}')">
                                      <div class="flex items-start justify-between">
                                          <div class="flex-1">
                                              <h4 class="font-semibold text-gray-800 mb-1">${decision.title}</h4>
                                              <p class="text-sm text-gray-600 mb-2">${decision.description}</p>
                                              <div class="flex items-center space-x-3 text-xs text-gray-500">
                                                  <span><i class="fas fa-clock mr-1"></i>${decision.timeToDecision}</span>
                                                  <span><i class="fas fa-chart-line mr-1"></i>Impact: ${decision.businessImpact}</span>
                                                  <span><i class="fas fa-brain mr-1"></i>AI: ${Math.round(decision.aiConfidence * 100)}%</span>
                                              </div>
                                          </div>
                                          <div class="ml-4">
                                              <span class="inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                decision.urgency === 'critical' ? 'bg-red-100 text-red-800' : 
                                                decision.urgency === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                                              }">
                                                  ${decision.urgency.toUpperCase()}
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          `).join('')}
                      </div>
                      <div class="mt-6 text-center">
                          <button onclick="viewAllDecisions()" 
                                  class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                              View All Decisions
                          </button>
                      </div>
                  </div>

                  <!-- AI Scenario Analysis -->
                  <div class="bg-white rounded-xl shadow-lg p-6">
                      <div class="flex items-center justify-between mb-6">
                          <h3 class="text-xl font-semibold text-gray-800">
                              <i class="fas fa-crystal-ball mr-2 text-purple-500"></i>
                              AI Scenario Analysis
                          </h3>
                          <div class="ai-thinking px-3 py-1 rounded-full">
                              <span class="text-white text-xs font-medium">AI Analyzing</span>
                          </div>
                      </div>
                      <div class="space-y-4">
                          ${scenarioAnalysis.map(scenario => `
                              <div class="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                  <div class="flex items-start justify-between mb-2">
                                      <h4 class="font-semibold text-gray-800">${scenario.title}</h4>
                                      <span class="text-sm font-medium ${
                                        scenario.probability > 0.7 ? 'text-red-600' : 
                                        scenario.probability > 0.4 ? 'text-orange-600' : 'text-green-600'
                                      }">
                                          ${Math.round(scenario.probability * 100)}% likely
                                      </span>
                                  </div>
                                  <p class="text-sm text-gray-600 mb-3">${scenario.description}</p>
                                  <div class="flex items-center justify-between">
                                      <div class="text-xs text-gray-500">
                                          <i class="fas fa-clock mr-1"></i>Timeframe: ${scenario.timeframe}
                                      </div>
                                      <button onclick="exploreScenario('${scenario.id}')" 
                                              class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                          Explore Impact →
                                      </button>
                                  </div>
                              </div>
                          `).join('')}
                      </div>
                  </div>
              </div>

              <!-- Transformation Dashboard -->
              <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <div class="flex items-center justify-between mb-6">
                      <h3 class="text-xl font-semibold text-gray-800">
                          <i class="fas fa-rocket mr-2 text-indigo-500"></i>
                          AI-Native Transformation Progress
                      </h3>
                      <div class="text-right">
                          <div class="text-sm text-gray-600">Overall Progress</div>
                          <div class="text-2xl font-bold text-indigo-600">${Math.round(migrationProgress.overview.overallProgress * 100)}%</div>
                      </div>
                  </div>
                  
                  <!-- Progress Phases -->
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div class="text-center">
                          <div class="w-16 h-16 mx-auto rounded-full ${migrationProgress.overview.completedPhases >= 1 ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center mb-2">
                              <i class="fas fa-brain text-white text-xl"></i>
                          </div>
                          <h4 class="font-medium text-sm">Phase 1: AI Foundation</h4>
                          <p class="text-xs text-gray-600">Intelligence Engine</p>
                      </div>
                      <div class="text-center">
                          <div class="w-16 h-16 mx-auto rounded-full ${migrationProgress.overview.completedPhases >= 2 ? 'bg-green-500' : migrationProgress.overview.completedPhases >= 1 ? 'bg-blue-500' : 'bg-gray-300'} flex items-center justify-center mb-2">
                              <i class="fas fa-layer-group text-white text-xl"></i>
                          </div>
                          <h4 class="font-medium text-sm">Phase 2: UI Consolidation</h4>
                          <p class="text-xs text-gray-600">Decision Interface</p>
                      </div>
                      <div class="text-center">
                          <div class="w-16 h-16 mx-auto rounded-full ${migrationProgress.overview.completedPhases >= 3 ? 'bg-green-500' : migrationProgress.overview.completedPhases >= 2 ? 'bg-blue-500' : 'bg-gray-300'} flex items-center justify-center mb-2">
                              <i class="fas fa-cubes text-white text-xl"></i>
                          </div>
                          <h4 class="font-medium text-sm">Phase 3: Module Consolidation</h4>
                          <p class="text-xs text-gray-600">Architecture Optimization</p>
                      </div>
                      <div class="text-center">
                          <div class="w-16 h-16 mx-auto rounded-full ${migrationProgress.overview.completedPhases >= 4 ? 'bg-green-500' : migrationProgress.overview.completedPhases >= 3 ? 'bg-blue-500' : 'bg-gray-300'} flex items-center justify-center mb-2">
                              <i class="fas fa-magic text-white text-xl"></i>
                          </div>
                          <h4 class="font-medium text-sm">Phase 4: Advanced Intelligence</h4>
                          <p class="text-xs text-gray-600">Predictive Analytics</p>
                      </div>
                  </div>

                  <!-- Current Phase Details -->
                  <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                      <div class="flex items-center justify-between">
                          <div>
                              <h4 class="font-semibold text-indigo-800">
                                  Current: ${migrationProgress.overview.currentPhase || 'Phase 2 - UI Consolidation'}
                              </h4>
                              <p class="text-sm text-indigo-600">
                                  Routes Consolidated: ${migrationProgress.routeConsolidation.consolidatedRoutes}/${migrationProgress.routeConsolidation.totalRoutes}
                              </p>
                          </div>
                          <div class="text-right">
                              <div class="text-sm text-indigo-600">Est. Completion</div>
                              <div class="font-semibold text-indigo-800">
                                  ${migrationProgress.overview.estimatedCompletion ? 
                                    new Date(migrationProgress.overview.estimatedCompletion).toLocaleDateString() : 
                                    'Calculating...'}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

          </main>

          <!-- Decision Modal (Hidden by default) -->
          <div id="decisionModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
              <div class="flex items-center justify-center min-h-screen p-4">
                  <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
                      <div class="p-6">
                          <div class="flex items-center justify-between mb-4">
                              <h3 class="text-xl font-semibold">Decision Review</h3>
                              <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                                  <i class="fas fa-times text-xl"></i>
                              </button>
                          </div>
                          <div id="decisionContent">
                              <!-- Decision content loaded here -->
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- JavaScript -->
          <script>
              // Decision interaction functions
              function reviewDecision(decisionId) {
                  // In production, this would load decision details
                  const content = \`
                      <div class="space-y-4">
                          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                              <h4 class="font-semibold text-yellow-800">Critical Security Decision Required</h4>
                              <p class="text-yellow-700 mt-1">CVE-2024-1234 vulnerability detected on production web servers with active exploitation in the wild.</p>
                          </div>
                          
                          <div class="grid grid-cols-2 gap-4">
                              <div class="bg-gray-50 p-4 rounded-lg">
                                  <h5 class="font-semibold mb-2">AI Recommendation</h5>
                                  <p class="text-sm text-gray-600">Immediate emergency patching with 30-minute maintenance window.</p>
                                  <div class="mt-2 text-xs text-green-600">95% confidence</div>
                              </div>
                              <div class="bg-gray-50 p-4 rounded-lg">
                                  <h5 class="font-semibold mb-2">Business Impact</h5>
                                  <p class="text-sm text-gray-600">30 minutes downtime vs. potential data breach risk.</p>
                                  <div class="mt-2 text-xs text-orange-600">High urgency</div>
                              </div>
                          </div>
                          
                          <div class="flex space-x-3 pt-4 border-t">
                              <button onclick="approveDecision('\${decisionId}')" 
                                      class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium">
                                  Approve & Execute
                              </button>
                              <button onclick="requestMoreInfo('\${decisionId}')" 
                                      class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
                                  Request Analysis
                              </button>
                              <button onclick="deferDecision('\${decisionId}')" 
                                      class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium">
                                  Defer
                              </button>
                          </div>
                      </div>
                  \`;
                  
                  document.getElementById('decisionContent').innerHTML = content;
                  document.getElementById('decisionModal').classList.remove('hidden');
              }

              function closeModal() {
                  document.getElementById('decisionModal').classList.add('hidden');
              }

              function approveDecision(decisionId) {
                  fetch(\`/decision-center/decisions/\${decisionId}/approve\`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                  }).then(response => {
                      if (response.ok) {
                          closeModal();
                          location.reload();
                      }
                  });
              }

              function requestMoreInfo(decisionId) {
                  // Request additional AI analysis
                  alert('Requesting detailed AI analysis...');
                  closeModal();
              }

              function deferDecision(decisionId) {
                  // Defer decision
                  closeModal();
              }

              function viewCriticalAlert() {
                  alert('Critical alert details...');
              }

              function viewAllDecisions() {
                  window.location.href = '/decision-center/decisions';
              }

              function exploreScenario(scenarioId) {
                  window.location.href = \`/decision-center/scenarios/\${scenarioId}\`;
              }

              // Auto-refresh every 30 seconds
              setInterval(() => {
                  if (!document.getElementById('decisionModal').classList.contains('hidden')) {
                      return; // Don't refresh if modal is open
                  }
                  location.reload();
              }, 30000);
          </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Decision Center error:', error);
    return c.json({ error: 'Failed to generate decision center dashboard' }, 500);
  }
});

/**
 * Decision approval endpoint
 */
app.post('/decision-center/decisions/:id/approve', async (c) => {
  const decisionId = c.req.param('id');
  
  try {
    // Record decision approval metrics
    metricsService.recordUserFeedback(
      'decision_center',
      'decision_approval',
      { decisionId },
      'accepted',
      9,
      'Executive approved AI recommendation',
      'executive_decision_making'
    );

    // In production, this would:
    // 1. Execute the approved decision
    // 2. Log audit trail
    // 3. Update risk assessments
    // 4. Notify relevant teams
    // 5. Schedule follow-up monitoring

    return c.json({
      success: true,
      decisionId,
      status: 'approved',
      executionScheduled: true,
      approvedAt: new Date()
    });

  } catch (error) {
    console.error('Decision approval error:', error);
    return c.json({ error: 'Failed to approve decision' }, 500);
  }
});

/**
 * All decisions list endpoint
 */
app.get('/decision-center/decisions', async (c) => {
  try {
    const decisions = await getPendingDecisions();
    const completedDecisions = await getCompletedDecisions();
    
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>All Decisions - Decision Center</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-50">
          <div class="container mx-auto px-6 py-8">
              <div class="mb-6">
                  <a href="/decision-center" class="text-blue-600 hover:text-blue-800">
                      <i class="fas fa-arrow-left mr-2"></i>Back to Decision Center
                  </a>
                  <h1 class="text-3xl font-bold text-gray-800 mt-4">All Decisions</h1>
              </div>

              <!-- Pending Decisions -->
              <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h2 class="text-xl font-semibold text-gray-800 mb-4">Pending Decisions (${decisions.length})</h2>
                  <div class="space-y-3">
                      ${decisions.map(decision => `
                          <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div class="flex-1">
                                  <h3 class="font-medium text-gray-800">${decision.title}</h3>
                                  <p class="text-sm text-gray-600">${decision.description}</p>
                                  <div class="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                      <span>${decision.urgency.toUpperCase()}</span>
                                      <span>${decision.timeToDecision}</span>
                                      <span>AI: ${Math.round(decision.aiConfidence * 100)}%</span>
                                  </div>
                              </div>
                              <button onclick="reviewDecision('${decision.id}')" 
                                      class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ml-4">
                                  Review
                              </button>
                          </div>
                      `).join('')}
                  </div>
              </div>

              <!-- Completed Decisions -->
              <div class="bg-white rounded-xl shadow-lg p-6">
                  <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Decisions (${completedDecisions.length})</h2>
                  <div class="space-y-3">
                      ${completedDecisions.map(decision => `
                          <div class="flex items-center justify-between p-4 border rounded-lg">
                              <div class="flex-1">
                                  <h3 class="font-medium text-gray-800">${decision.title}</h3>
                                  <p class="text-sm text-gray-600">${decision.outcome}</p>
                                  <div class="text-xs text-gray-500 mt-1">${decision.completedAt}</div>
                              </div>
                              <span class="px-3 py-1 rounded-full text-xs font-medium ${
                                decision.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }">
                                  ${decision.status.toUpperCase()}
                              </span>
                          </div>
                      `).join('')}
                  </div>
              </div>
          </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Decisions list error:', error);
    return c.json({ error: 'Failed to load decisions' }, 500);
  }
});

// Helper functions for generating decision center content

async function generateDecisionIntelligence() {
  return {
    overallConfidence: 0.87,
    avgDecisionTime: '4.2 hrs',
    riskScore: 7.3,
    riskTrend: 'increasing',
    riskPrediction: 'Peak in 48hrs',
    decisionVelocity: 12,
    velocityTarget: 15,
    criticalAlerts: [
      {
        id: 'alert-001',
        title: 'Production vulnerability requires immediate patching',
        urgency: 'critical',
        aiConfidence: 0.95
      }
    ]
  };
}

async function getPendingDecisions() {
  return [
    {
      id: 'dec-001',
      title: 'Emergency Patch Deployment - CVE-2024-1234',
      description: 'Critical vulnerability in production web servers requires immediate patching with 30-minute maintenance window.',
      urgency: 'critical',
      timeToDecision: '15 minutes',
      businessImpact: 'High',
      aiConfidence: 0.95
    },
    {
      id: 'dec-002', 
      title: 'Budget Approval for Advanced Threat Detection',
      description: 'Proposed $50K investment in AI-powered threat detection system to reduce false positives by 40%.',
      urgency: 'high',
      timeToDecision: '2 days',
      businessImpact: 'Medium',
      aiConfidence: 0.82
    },
    {
      id: 'dec-003',
      title: 'Vendor Risk Assessment - CloudSecure Inc.',
      description: 'New cloud security vendor evaluation required before Q2 contract renewal deadline.',
      urgency: 'medium',
      timeToDecision: '1 week',
      businessImpact: 'Low',
      aiConfidence: 0.74
    }
  ];
}

async function getCompletedDecisions() {
  return [
    {
      id: 'comp-001',
      title: 'Multi-Factor Authentication Rollout',
      outcome: 'Approved and deployed across all systems, 99% adoption rate achieved',
      status: 'approved',
      completedAt: '2 days ago'
    },
    {
      id: 'comp-002',
      title: 'Legacy System Decommission',
      outcome: 'Deferred pending security audit completion',
      status: 'deferred',
      completedAt: '1 week ago'
    }
  ];
}

async function getScenarioAnalysis() {
  return [
    {
      id: 'scenario-001',
      title: 'Ransomware Attack Scenario',
      description: 'Based on current vulnerabilities and threat patterns, potential for targeted ransomware attack via CVE-2024-1234 exploitation.',
      probability: 0.75,
      timeframe: '7-14 days'
    },
    {
      id: 'scenario-002',
      title: 'Compliance Audit Impact',
      description: 'Upcoming SOC2 audit may identify current vulnerability management gaps, requiring immediate remediation.',
      probability: 0.65,
      timeframe: '30 days'
    },
    {
      id: 'scenario-003',
      title: 'Supply Chain Disruption',
      description: 'Critical vendor security incident could impact service availability and require emergency contingency activation.',
      probability: 0.35,
      timeframe: '90 days'
    }
  ];
}

export default app;