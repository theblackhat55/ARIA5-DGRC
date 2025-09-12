/**
 * Phase 3 - Advanced Integration & Automation Dashboard Routes
 * Integrated into ARIA5.1 Platform Architecture
 */

import { Hono } from 'hono';
import { html } from 'hono/html';
import { cleanLayout } from '../templates/layout-clean';
import { authMiddleware, requireRole } from '../middleware/auth-middleware';

type Bindings = {
  DB: D1Database;
}

export function createPhase3DashboardRoutes() {
  const routes = new Hono<{ Bindings: Bindings }>();

  // Main Phase 3 Advanced Integration & Automation Dashboard
  routes.get('/', async (c) => {
    try {
      // Get user from mount-level auth middleware
      const user = c.get('user') || { username: 'Demo User', role: 'admin', id: 1 };

      return c.html(
        cleanLayout({
          title: 'Phase 3 Advanced Integration - ARIA5.1',
          user: user,
          content: html`
            <div class="min-h-screen bg-gray-50">
              <!-- Phase 3 Header -->
              <div class="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-6">
                    <div class="flex items-center">
                      <div class="flex items-center space-x-3">
                        <i class="fas fa-network-wired text-3xl text-white"></i>
                        <div>
                          <h1 class="text-2xl font-bold text-white">Advanced Integration & Automation</h1>
                          <p class="text-sm text-emerald-100">Phase 3 - Enterprise Integration Hub</p>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-4">
                      <div id="phase3-system-status" class="flex items-center">
                        <div class="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                        <span class="text-sm text-white">Loading...</span>
                      </div>
                      <button id="execute-full-integration-btn" class="bg-white bg-opacity-20 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-30 disabled:opacity-50 transition-all">
                        <i class="fas fa-play mr-2"></i> Execute Full Integration
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navigation Tabs -->
              <div class="bg-white shadow-sm">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <nav class="flex space-x-8" aria-label="Tabs">
                    <a href="#overview" class="phase3-tab border-emerald-500 text-emerald-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm active" data-tab="overview">
                      Integration Overview
                    </a>
                    <a href="#enterprise" class="phase3-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="enterprise">
                      Enterprise Hub
                    </a>
                    <a href="#ai-engine" class="phase3-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="ai-engine">
                      Advanced AI Engine
                    </a>
                    <a href="#mobile" class="phase3-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="mobile">
                      Mobile Platform
                    </a>
                    <a href="#orchestration" class="phase3-tab border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="orchestration">
                      System Orchestration
                    </a>
                  </nav>
                </div>
              </div>

              <!-- Main Content Area -->
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <!-- Loading State -->
                <div id="phase3-loading-state" class="text-center py-12">
                  <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-emerald-600 bg-emerald-100">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Phase 3 Advanced Integration...
                  </div>
                </div>

                <!-- Tab Content Containers -->
                
                <!-- Overview Tab -->
                <div id="tab-overview" class="tab-content">
                  <!-- Integration Performance Dashboard -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-emerald-500">
                      <div class="p-5">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <i class="fas fa-plug text-2xl text-emerald-600"></i>
                          </div>
                          <div class="ml-5 w-0 flex-1">
                            <dl>
                              <dt class="text-sm font-medium text-gray-500 truncate">Active Integrations</dt>
                              <dd class="text-lg font-medium text-gray-900" id="metric-active-integrations">--</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-blue-500">
                      <div class="p-5">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <i class="fas fa-robot text-2xl text-blue-600"></i>
                          </div>
                          <div class="ml-5 w-0 flex-1">
                            <dl>
                              <dt class="text-sm font-medium text-gray-500 truncate">AI Model Accuracy</dt>
                              <dd class="text-lg font-medium text-gray-900" id="metric-ai-accuracy">--%</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-purple-500">
                      <div class="p-5">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <i class="fas fa-mobile-alt text-2xl text-purple-600"></i>
                          </div>
                          <div class="ml-5 w-0 flex-1">
                            <dl>
                              <dt class="text-sm font-medium text-gray-500 truncate">Mobile Sessions</dt>
                              <dd class="text-lg font-medium text-gray-900" id="metric-mobile-sessions">--</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-orange-500">
                      <div class="p-5">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <i class="fas fa-cogs text-2xl text-orange-600"></i>
                          </div>
                          <div class="ml-5 w-0 flex-1">
                            <dl>
                              <dt class="text-sm font-medium text-gray-500 truncate">System Efficiency</dt>
                              <dd class="text-lg font-medium text-gray-900" id="metric-system-efficiency">--%</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Integration Status Dashboard -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-chart-pie mr-2 text-emerald-500"></i>
                          Integration Health Map
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="integration-health-map" class="space-y-4">
                          <!-- Integration health visualization will be loaded here -->
                        </div>
                      </div>
                    </div>

                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-bolt mr-2 text-blue-500"></i>
                          Real-time Event Stream
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="event-stream-content" class="space-y-4">
                          <!-- Real-time events will be loaded here -->
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Threat Attribution & Supply Chain Overview -->
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-user-secret mr-2 text-red-500"></i>
                          Threat Actor Attribution
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="threat-attribution-content" class="space-y-4">
                          <!-- Threat attribution data will be loaded here -->
                        </div>
                      </div>
                    </div>

                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-link mr-2 text-yellow-500"></i>
                          Supply Chain Risk
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="supply-chain-content" class="space-y-4">
                          <!-- Supply chain risk data will be loaded here -->
                        </div>
                      </div>
                    </div>

                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-chart-line mr-2 text-purple-500"></i>
                          Executive Intelligence
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="executive-intelligence-content" class="space-y-4">
                          <!-- Executive intelligence will be loaded here -->
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Real-time Integration Activity -->
                  <div class="bg-white shadow-lg rounded-lg">
                    <div class="px-6 py-4 border-b border-gray-200">
                      <h3 class="text-lg font-medium text-gray-900">
                        <i class="fas fa-stream mr-2 text-emerald-500"></i>
                        Real-time Integration Activity
                      </h3>
                    </div>
                    <div class="p-6">
                      <div class="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm space-y-1 max-h-64 overflow-y-auto" id="integration-activity-feed">
                        <!-- Live integration activity will be shown here -->
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Enterprise Hub Tab -->
                <div id="tab-enterprise" class="tab-content hidden">
                  <div class="space-y-8">
                    <!-- Microsoft Defender Integration -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                          <h3 class="text-lg font-medium text-gray-900">
                            <i class="fab fa-microsoft mr-2 text-blue-500"></i>
                            Microsoft Defender Integration
                          </h3>
                          <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 rounded-full" id="defender-status-indicator"></div>
                            <span class="text-sm text-gray-600" id="defender-status-text">Loading...</span>
                          </div>
                        </div>
                      </div>
                      <div class="p-6">
                        <div id="defender-integration-content">
                          <!-- Microsoft Defender integration content -->
                        </div>
                      </div>
                    </div>

                    <!-- ServiceNow Integration -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                          <h3 class="text-lg font-medium text-gray-900">
                            <i class="fas fa-ticket-alt mr-2 text-red-500"></i>
                            ServiceNow Integration
                          </h3>
                          <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 rounded-full" id="servicenow-status-indicator"></div>
                            <span class="text-sm text-gray-600" id="servicenow-status-text">Loading...</span>
                          </div>
                        </div>
                      </div>
                      <div class="p-6">
                        <div id="servicenow-integration-content">
                          <!-- ServiceNow integration content -->
                        </div>
                      </div>
                    </div>

                    <!-- SIEM Integration -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                          <h3 class="text-lg font-medium text-gray-900">
                            <i class="fas fa-shield-alt mr-2 text-purple-500"></i>
                            SIEM Platform Integration
                          </h3>
                          <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 rounded-full" id="siem-status-indicator"></div>
                            <span class="text-sm text-gray-600" id="siem-status-text">Loading...</span>
                          </div>
                        </div>
                      </div>
                      <div class="p-6">
                        <div id="siem-integration-content">
                          <!-- SIEM integration content -->
                        </div>
                      </div>
                    </div>

                    <!-- Multi-Source Event Correlation -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-project-diagram mr-2 text-green-500"></i>
                          Multi-Source Event Correlation
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="correlation-engine-content">
                          <!-- Event correlation content -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Advanced AI Engine Tab -->
                <div id="tab-ai-engine" class="tab-content hidden">
                  <div class="space-y-8">
                    <!-- Threat Actor Attribution -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-user-ninja mr-2 text-red-600"></i>
                          Advanced Threat Actor Attribution
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="threat-actor-attribution-content">
                          <!-- Threat actor attribution content -->
                        </div>
                      </div>
                    </div>

                    <!-- Supply Chain Risk Modeling -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-industry mr-2 text-yellow-600"></i>
                          Supply Chain Risk Modeling
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="supply-chain-modeling-content">
                          <!-- Supply chain modeling content -->
                        </div>
                      </div>
                    </div>

                    <!-- Regulatory Change Prediction -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-gavel mr-2 text-blue-600"></i>
                          Regulatory Change Prediction
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="regulatory-prediction-content">
                          <!-- Regulatory prediction content -->
                        </div>
                      </div>
                    </div>

                    <!-- Executive Intelligence Generation -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-chart-pie mr-2 text-purple-600"></i>
                          Executive Intelligence Generation
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="executive-intelligence-generation-content">
                          <!-- Executive intelligence generation content -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mobile Platform Tab -->
                <div id="tab-mobile" class="tab-content hidden">
                  <div class="space-y-8">
                    <!-- Mobile App Analytics -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-mobile-alt mr-2 text-blue-600"></i>
                          Mobile Platform Analytics
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="mobile-analytics-content">
                          <!-- Mobile analytics content -->
                        </div>
                      </div>
                    </div>

                    <!-- Push Notification System -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-bell mr-2 text-yellow-600"></i>
                          Push Notification System
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="push-notification-content">
                          <!-- Push notification content -->
                        </div>
                      </div>
                    </div>

                    <!-- Offline Data Synchronization -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-sync mr-2 text-green-600"></i>
                          Offline Data Synchronization
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="data-sync-content">
                          <!-- Data synchronization content -->
                        </div>
                      </div>
                    </div>

                    <!-- API Documentation & Testing -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-code mr-2 text-purple-600"></i>
                          API Documentation & Testing
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="api-documentation-content">
                          <!-- API documentation content -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- System Orchestration Tab -->
                <div id="tab-orchestration" class="tab-content hidden">
                  <div class="space-y-8">
                    <!-- Phase 3 System Health -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-heartbeat mr-2 text-red-500"></i>
                          Phase 3 System Health Monitor
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="system-health-content">
                          <!-- System health monitoring content -->
                        </div>
                      </div>
                    </div>

                    <!-- Performance Metrics -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-tachometer-alt mr-2 text-blue-500"></i>
                          Performance Metrics & Analytics
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="performance-metrics-content">
                          <!-- Performance metrics content -->
                        </div>
                      </div>
                    </div>

                    <!-- Integration Summary -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-clipboard-list mr-2 text-green-500"></i>
                          Comprehensive Integration Summary
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="integration-summary-content">
                          <!-- Integration summary content -->
                        </div>
                      </div>
                    </div>

                    <!-- Automated Orchestration Controls -->
                    <div class="bg-white shadow-lg rounded-lg">
                      <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">
                          <i class="fas fa-play-circle mr-2 text-purple-500"></i>
                          Automated Orchestration Controls
                        </h3>
                      </div>
                      <div class="p-6">
                        <div id="orchestration-controls-content">
                          <!-- Orchestration controls content -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Phase 3 Dashboard JavaScript -->
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script src="/static/js/phase3-dashboard.js"></script>
          `
        })
      );

    } catch (error) {
      console.error('Error loading Phase 3 dashboard:', error);
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
                    <h3 class="text-sm font-medium text-red-800">Phase 3 Dashboard Error</h3>
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

  // Phase 3 API status endpoint for dashboard
  routes.get('/api/status', requireRole(['admin', 'integration_manager', 'security_analyst']), async (c) => {
    try {
      // Get Phase 3 system health
      const response = await fetch('/api/phase3/orchestration/system-status');
      const statusData = await response.json();
      
      return c.json({
        success: true,
        phase3_status: 'integrated',
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

  // Integration health endpoint
  routes.get('/api/integration-health', requireRole(['admin', 'integration_manager']), async (c) => {
    try {
      const response = await fetch('/api/phase3/integrations/status');
      const integrationData = await response.json();
      
      return c.json({
        success: true,
        integration_health: integrationData.data,
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

  // AI engine performance endpoint
  routes.get('/api/ai-performance', requireRole(['admin', 'ai_analyst']), async (c) => {
    try {
      const response = await fetch('/api/phase3/ai/model-performance');
      const aiData = await response.json();
      
      return c.json({
        success: true,
        ai_performance: aiData.data,
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

  // Mobile platform analytics endpoint
  routes.get('/api/mobile-analytics', requireRole(['admin', 'mobile_manager']), async (c) => {
    try {
      const response = await fetch('/api/phase3/mobile/analytics');
      const mobileData = await response.json();
      
      return c.json({
        success: true,
        mobile_analytics: mobileData.data,
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