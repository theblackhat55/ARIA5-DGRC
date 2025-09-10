/**
 * Phase 2 - Unified AI Orchestration Dashboard Routes
 * Integrated into ARIA5.1 Platform Architecture
 */

import { Hono } from 'hono';
import { html } from 'hono/html';
import { cleanLayout } from '../templates/layout-clean';
import { authMiddleware, requireRole } from '../middleware/auth-middleware';

type Bindings = {
  DB: D1Database;
}

export function createPhase2DashboardRoutes() {
  const routes = new Hono<{ Bindings: Bindings }>();

  // Apply authentication middleware to all routes
  routes.use('*', authMiddleware);

  // Main Phase 2 Unified AI Orchestration Dashboard
  routes.get('/', requireRole(['admin', 'risk_manager', 'analyst']), async (c) => {
    try {
      const user = c.get('user');

      return c.html(
        cleanLayout({
          title: 'Phase 2 AI Orchestration - ARIA5.1',
          user: user,
          content: html`
            <div class="min-h-screen bg-gray-50">
              <!-- Phase 2 Header -->
              <div class="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-6">
                    <div class="flex items-center">
                      <div class="flex items-center space-x-3">
                        <i class="fas fa-brain text-3xl text-white"></i>
                        <div>
                          <h1 class="text-2xl font-bold text-white">Unified AI Orchestration</h1>
                          <p class="text-sm text-purple-100">Phase 2 - Advanced Predictive Intelligence</p>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-4">
                      <div id="phase2-system-status" class="flex items-center">
                        <div class="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                        <span class="text-sm text-white">Loading...</span>
                      </div>
                      <button id="execute-full-analysis-btn" class="bg-white bg-opacity-20 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-30 disabled:opacity-50 transition-all">
                        <i class="fas fa-play mr-2"></i> Execute Full Analysis
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navigation Tabs -->
              <div class="bg-white shadow-sm">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <nav class="flex space-x-8" aria-label="Tabs">
                    <a href="#overview" class="phase2-tab border-purple-500 text-purple-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm active" data-tab="overview">
                      AI Overview
                    </a>
                    <a href="#predictive" class="phase2-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="predictive">
                      Predictive Analytics
                    </a>
                    <a href="#correlation" class="phase2-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="correlation">
                      Threat Correlation
                    </a>
                    <a href="#compliance" class="phase2-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="compliance">
                      Compliance Intelligence
                    </a>
                    <a href="#orchestration" class="phase2-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="orchestration">
                      System Orchestration
                    </a>
                  </nav>
                </div>
              </div>

              <!-- Main Content Area -->
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <!-- Loading State -->
                <div id="phase2-loading-state" class="text-center py-12">
                  <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-purple-600 bg-purple-100">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Phase 2 AI Orchestration...
                  </div>
                </div>

                <!-- Tab Content Containers -->
                
                <!-- Overview Tab -->
                <div id="tab-overview" class="tab-content">
                  <!-- AI Performance Dashboard -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-purple-500">
                      <div class="p-5">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <i class="fas fa-brain text-2xl text-purple-600"></i>
                          </div>
                          <div class="ml-5 w-0 flex-1">
                            <dl>
                              <dt class="text-sm font-medium text-gray-500 truncate">AI Model Performance</dt>
                              <dd class="text-lg font-medium text-gray-900" id="metric-ai-performance">--%</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-blue-500">
                      <div class="p-5">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <i class="fas fa-chart-line text-2xl text-blue-600"></i>
                          </div>
                          <div class="ml-5 w-0 flex-1">
                            <dl>
                              <dt class="text-sm font-medium text-gray-500 truncate">Prediction Accuracy</dt>
                              <dd class="text-lg font-medium text-gray-900" id="metric-prediction-accuracy">--%</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-green-500">
                      <div class="p-5">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <i class="fas fa-shield-alt text-2xl text-green-600"></i>
                          </div>
                          <div class="ml-5 w-0 flex-1">
                            <dl>
                              <dt class="text-sm font-medium text-gray-500 truncate">Threat Correlations</dt>
                              <dd class="text-lg font-medium text-gray-900" id="metric-threat-correlations">--</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-red-500">
                      <div class="p-5">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                          </div>
                          <div class="ml-5 w-0 flex-1">
                            <dl>
                              <dt class="text-sm font-medium text-gray-500 truncate">Compliance Score</dt>
                              <dd class="text-lg font-medium text-gray-900" id="metric-compliance-score">--%</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- AI Insights Dashboard -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>
                          AI-Generated Insights
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="ai-insights-content" class="space-y-4">
                          <!-- AI insights will be loaded here -->
                        </div>
                      </div>
                    </div>

                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-robot mr-2 text-blue-500"></i>
                          Automated Actions
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="automated-actions-content" class="space-y-4">
                          <!-- Automated actions will be loaded here -->
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Real-time AI Activity -->
                  <div class="bg-white shadow-lg rounded-lg">
                    <div class="px-6 py-4 border-b border-gray-200">
                      <h3 class="text-lg font-medium text-gray-900">
                        <i class="fas fa-bolt mr-2 text-purple-500"></i>
                        Real-time AI Activity
                      </h3>
                    </div>
                    <div class="p-6">
                      <div class="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm space-y-1 max-h-64 overflow-y-auto" id="ai-activity-feed">
                        <!-- Live AI activity will be shown here -->
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Predictive Analytics Tab -->
                <div id="tab-predictive" class="tab-content hidden">
                  <div class="bg-white shadow-lg rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                      <i class="fas fa-crystal-ball mr-2 text-purple-500"></i>
                      Predictive Analytics Engine
                    </h3>
                    <div id="predictive-content">
                      <!-- Predictive analytics content will be loaded here -->
                    </div>
                  </div>
                </div>

                <!-- Threat Correlation Tab -->
                <div id="tab-correlation" class="tab-content hidden">
                  <div class="bg-white shadow-lg rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                      <i class="fas fa-network-wired mr-2 text-red-500"></i>
                      Real-time Threat Correlation
                    </h3>
                    <div id="correlation-content">
                      <!-- Threat correlation content will be loaded here -->
                    </div>
                  </div>
                </div>

                <!-- Compliance Intelligence Tab -->
                <div id="tab-compliance" class="tab-content hidden">
                  <div class="bg-white shadow-lg rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                      <i class="fas fa-clipboard-check mr-2 text-green-500"></i>
                      Enhanced Compliance Intelligence
                    </h3>
                    <div id="compliance-content">
                      <!-- Compliance intelligence content will be loaded here -->
                    </div>
                  </div>
                </div>

                <!-- System Orchestration Tab -->
                <div id="tab-orchestration" class="tab-content hidden">
                  <div class="bg-white shadow-lg rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                      <i class="fas fa-cogs mr-2 text-blue-500"></i>
                      AI System Orchestration
                    </h3>
                    <div id="orchestration-content">
                      <!-- System orchestration content will be loaded here -->
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Phase 2 Dashboard JavaScript -->
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script src="/static/js/phase2-dashboard.js"></script>
          `
        })
      );

    } catch (error) {
      console.error('Error loading Phase 2 dashboard:', error);
      return c.html(
        cleanLayout({
          title: 'Error - ARIA5.1',
          user: c.get('user'),
          content: html`
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
              <div class="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
                <div class="flex">
                  <i class="fas fa-exclamation-triangle text-red-400 mr-3"></i>
                  <div>
                    <h3 class="text-sm font-medium text-red-800">Phase 2 Dashboard Error</h3>
                    <p class="mt-2 text-sm text-red-700">${error.message}</p>
                  </div>
                </div>
              </div>
            </div>
          `
        })
      );
    }
  });

  // Phase 2 API status endpoint for dashboard
  routes.get('/api/status', requireRole(['admin', 'risk_manager', 'analyst']), async (c) => {
    try {
      // Get Phase 2 system health
      const response = await fetch('/api/phase2/orchestration/system-status');
      const statusData = await response.json();
      
      return c.json({
        success: true,
        phase2_status: 'integrated',
        system_health: statusData.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, 500);
    }
  });

  return routes;
}