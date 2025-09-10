/**
 * Phase 1 Dynamic Risk Intelligence Dashboard Routes
 * Integrated into ARIA5.1 Platform Architecture
 */

import { Hono } from 'hono';
import { html } from 'hono/html';
import { cleanLayout } from '../templates/layout-clean';
import { authMiddleware, requireRole } from '../middleware/auth-middleware';

type Bindings = {
  DB: D1Database;
}

export function createPhase1DashboardRoutes() {
  const routes = new Hono<{ Bindings: Bindings }>();

  // Apply authentication middleware to all routes
  routes.use('*', authMiddleware);

  // Main Phase 1 Dashboard
  routes.get('/', requireRole(['admin', 'risk_manager', 'analyst']), async (c) => {
    try {
      const user = c.get('user');

      return c.html(
        cleanLayout({
          title: 'Dynamic Risk Intelligence - ARIA5.1',
          user: user,
          content: html`
            <div class="min-h-screen bg-gray-50">
              <!-- Phase 1 Header -->
              <div class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-6">
                    <div class="flex items-center">
                      <i class="fas fa-shield-alt text-3xl text-blue-600 mr-4"></i>
                      <div>
                        <h1 class="text-2xl font-bold text-gray-900">Dynamic Risk Intelligence</h1>
                        <p class="text-sm text-gray-600">Phase 1 - Service-Centric Risk Management</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-4">
                      <div id="system-health-status" class="flex items-center">
                        <div class="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                        <span class="text-sm text-gray-600">Loading...</span>
                      </div>
                      <button id="execute-cycle-btn" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        <i class="fas fa-play mr-2"></i> Execute Cycle
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navigation Tabs -->
              <div class="bg-white shadow-sm">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <nav class="flex space-x-8" aria-label="Tabs">
                    <a href="#overview" class="phase1-tab border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm active" data-tab="overview">
                      Overview Dashboard
                    </a>
                    <a href="#discovery" class="phase1-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="discovery">
                      Risk Discovery
                    </a>
                    <a href="#services" class="phase1-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="services">
                      Service Scoring
                    </a>
                    <a href="#workflow" class="phase1-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="workflow">
                      Workflow Management
                    </a>
                    <a href="#analytics" class="phase1-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="analytics">
                      Analytics
                    </a>
                  </nav>
                </div>
              </div>

              <!-- Main Content Area -->
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <!-- Loading State -->
                <div id="loading-state" class="text-center py-12">
                  <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Phase 1 Dashboard...
                  </div>
                </div>

                <!-- Tab Content Containers -->
                
                <!-- Overview Tab -->
                <div id="tab-overview" class="tab-content">
                  <!-- Key Metrics Cards -->
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
                              <dd class="text-lg font-medium text-gray-900" id="metric-discovery">--%</dd>
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
                              <dd class="text-lg font-medium text-gray-900" id="metric-latency">-- min</dd>
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
                              <dd class="text-lg font-medium text-gray-900" id="metric-approval">--%</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                      <div class="p-5">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <i class="fas fa-server text-2xl text-red-600"></i>
                          </div>
                          <div class="ml-5 w-0 flex-1">
                            <dl>
                              <dt class="text-sm font-medium text-gray-500 truncate">Services Monitored</dt>
                              <dd class="text-lg font-medium text-gray-900" id="metric-services">--</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Charts Row -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                      <div class="px-4 py-5 sm:p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">
                          <i class="fas fa-chart-pie mr-2"></i>
                          Service Risk Distribution
                        </h3>
                        <canvas id="risk-distribution-chart" width="400" height="300"></canvas>
                      </div>
                    </div>

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

                  <!-- Services Risk Table -->
                  <div class="bg-white shadow overflow-hidden sm:rounded-md">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <h3 class="text-lg leading-6 font-medium text-gray-900">
                        <i class="fas fa-server mr-2"></i>
                        Business Services Risk Assessment
                      </h3>
                      <p class="mt-1 max-w-2xl text-sm text-gray-500">
                        Real-time service-centric risk scoring with CIA triad analysis
                      </p>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIA Triad</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assets</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody id="services-risk-table" class="bg-white divide-y divide-gray-200">
                          <!-- Services will be populated here -->
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Discovery Tab -->
                <div id="tab-discovery" class="tab-content hidden">
                  <div class="bg-white shadow rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Risk Discovery Engine</h3>
                    <div id="discovery-content">
                      <p class="text-gray-600">Loading discovery engine status...</p>
                    </div>
                  </div>
                </div>

                <!-- Services Tab -->
                <div id="tab-services" class="tab-content hidden">
                  <div class="bg-white shadow rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Service-Centric Risk Scoring</h3>
                    <div id="services-content">
                      <p class="text-gray-600">Loading service scoring data...</p>
                    </div>
                  </div>
                </div>

                <!-- Workflow Tab -->
                <div id="tab-workflow" class="tab-content hidden">
                  <div class="bg-white shadow rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Risk Approval Workflow</h3>
                    <div id="workflow-content">
                      <p class="text-gray-600">Loading workflow management...</p>
                    </div>
                  </div>
                </div>

                <!-- Analytics Tab -->
                <div id="tab-analytics" class="tab-content hidden">
                  <div class="bg-white shadow rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Performance Analytics</h3>
                    <div id="analytics-content">
                      <p class="text-gray-600">Loading analytics data...</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Phase 1 Dashboard JavaScript -->
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script src="/static/js/phase1-dashboard.js"></script>
          `
        })
      );

    } catch (error) {
      console.error('Error loading Phase 1 dashboard:', error);
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
                    <h3 class="text-sm font-medium text-red-800">Dashboard Error</h3>
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

  // Phase 1 API status endpoint
  routes.get('/api/status', requireRole(['admin', 'risk_manager', 'analyst']), async (c) => {
    try {
      // Get system health from Phase 1 orchestrator
      const response = await fetch('/api/dynamic-risk/system/health');
      const healthData = await response.json();
      
      return c.json({
        success: true,
        phase1_status: 'integrated',
        system_health: healthData,
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