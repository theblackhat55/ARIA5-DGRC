/**
 * ARIA5.1 Phase 4: Advanced Automation - Evidence Collection Dashboard Routes
 * Target: 60%+ compliance evidence automation monitoring and management
 * 
 * Comprehensive dashboard interface with real-time monitoring, automation metrics,
 * and evidence collection management with HTMX-powered interactivity.
 */

import { Hono } from 'hono';
import { html } from 'hono/html';

type Bindings = {
  DB: D1Database;
};

const phase4EvidenceDashboard = new Hono<{ Bindings: Bindings }>();

/**
 * Phase 4 Evidence Collection Main Dashboard
 * GET /dashboard/phase4/evidence
 */
phase4EvidenceDashboard.get('/', async (c) => {
  try {
    const { env } = c;
    
    // Get system overview metrics
    const overviewQuery = `
      SELECT 
        COUNT(DISTINCT es.id) as total_sources,
        COUNT(CASE WHEN es.is_active = 1 THEN 1 END) as active_sources,
        COUNT(CASE WHEN es.collection_status = 'success' THEN 1 END) as healthy_sources,
        COUNT(DISTINCT ecj.id) as total_jobs,
        COUNT(CASE WHEN ecj.status = 'active' THEN 1 END) as active_jobs,
        COUNT(DISTINCT ea.id) as total_artifacts
      FROM evidence_sources es
      CROSS JOIN evidence_collection_jobs ecj
      CROSS JOIN evidence_artifacts ea
      WHERE ea.created_at >= datetime('now', '-24 hours')
    `;
    
    const overview = await env.DB.prepare(overviewQuery).first() || {};
    
    // Get automation metrics
    const metricsQuery = `
      SELECT 
        framework_name,
        automation_percentage,
        evidence_quality_average,
        validation_success_rate,
        target_automation_percentage
      FROM evidence_automation_metrics
      WHERE metric_date = date('now')
      ORDER BY automation_percentage DESC
    `;
    
    const metrics = await env.DB.prepare(metricsQuery).all();
    const automationData = metrics.results || [];
    
    // Calculate overall automation rate
    const overallAutomation = automationData.length > 0 
      ? automationData.reduce((sum: number, m: any) => sum + m.automation_percentage, 0) / automationData.length
      : 0;

    return c.html(html`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Phase 4: Evidence Collection Automation - ARIA5.1</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@1.9.10/dist/htmx.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .metric-card { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
          }
          .metric-card:hover { 
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          }
          .automation-progress {
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          }
          .tab-content { display: none; }
          .tab-content.active { display: block; }
          .source-status-success { color: #10b981; }
          .source-status-error { color: #ef4444; }
          .source-status-idle { color: #6b7280; }
          .automation-badge-high { background: #10b981; }
          .automation-badge-medium { background: #f59e0b; }
          .automation-badge-low { background: #ef4444; }
        </style>
      </head>
      <body class="bg-gray-50 min-h-screen">
        
        <!-- Navigation Header -->
        <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <div class="flex items-center space-x-4">
                <a href="/dashboard" class="text-gray-500 hover:text-gray-700">
                  <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                </a>
                <div class="h-6 w-px bg-gray-300"></div>
                <h1 class="text-xl font-semibold text-gray-900">
                  <i class="fas fa-robot text-blue-600 mr-2"></i>
                  Phase 4: Evidence Collection Automation
                </h1>
              </div>
              <div class="flex items-center space-x-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${overallAutomation >= 60 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                  <i class="fas fa-chart-line mr-1"></i>
                  ${overallAutomation.toFixed(1)}% Automated
                </span>
                <button 
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  hx-post="/api/v2/evidence/collect"
                  hx-target="#collection-results"
                  hx-indicator="#loading-indicator">
                  <i class="fas fa-play mr-2"></i>
                  Start Collection
                </button>
              </div>
            </div>
          </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          <!-- System Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <!-- Total Evidence Sources -->
            <div class="metric-card rounded-xl p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-100 text-sm font-medium">Evidence Sources</p>
                  <p class="text-3xl font-bold">${overview.total_sources || 0}</p>
                  <p class="text-blue-100 text-sm">${overview.active_sources || 0} active</p>
                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-3">
                  <i class="fas fa-database text-2xl"></i>
                </div>
              </div>
            </div>

            <!-- Collection Jobs -->
            <div class="metric-card rounded-xl p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-100 text-sm font-medium">Collection Jobs</p>
                  <p class="text-3xl font-bold">${overview.total_jobs || 0}</p>
                  <p class="text-blue-100 text-sm">${overview.active_jobs || 0} running</p>
                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-3">
                  <i class="fas fa-cogs text-2xl"></i>
                </div>
              </div>
            </div>

            <!-- Evidence Artifacts -->
            <div class="metric-card rounded-xl p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-100 text-sm font-medium">Artifacts (24h)</p>
                  <p class="text-3xl font-bold">${overview.total_artifacts || 0}</p>
                  <p class="text-blue-100 text-sm">Evidence collected</p>
                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-3">
                  <i class="fas fa-file-alt text-2xl"></i>
                </div>
              </div>
            </div>

            <!-- Automation Target Progress -->
            <div class="bg-white rounded-xl p-6 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="text-gray-600 text-sm font-medium">Automation Target</p>
                  <p class="text-3xl font-bold text-gray-900">${overallAutomation.toFixed(1)}%</p>
                  <p class="text-gray-500 text-sm">Target: 60%+</p>
                </div>
                <div class="text-right">
                  <div class="w-16 h-16 rounded-full flex items-center justify-center ${overallAutomation >= 60 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}">
                    <i class="fas ${overallAutomation >= 60 ? 'fa-check' : 'fa-clock'} text-2xl"></i>
                  </div>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="automation-progress h-2 rounded-full" style="width: ${Math.min(overallAutomation, 100)}%"></div>
              </div>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8 px-6" role="tablist">
                <button onclick="showTab('overview')" 
                        class="tab-btn py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600" 
                        data-tab="overview">
                  <i class="fas fa-chart-pie mr-2"></i>Overview
                </button>
                <button onclick="showTab('sources')" 
                        class="tab-btn py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                        data-tab="sources">
                  <i class="fas fa-server mr-2"></i>Evidence Sources
                </button>
                <button onclick="showTab('collections')" 
                        class="tab-btn py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                        data-tab="collections">
                  <i class="fas fa-play-circle mr-2"></i>Collection Jobs
                </button>
                <button onclick="showTab('artifacts')" 
                        class="tab-btn py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                        data-tab="artifacts">
                  <i class="fas fa-file-archive mr-2"></i>Evidence Artifacts
                </button>
                <button onclick="showTab('metrics')" 
                        class="tab-btn py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                        data-tab="metrics">
                  <i class="fas fa-analytics mr-2"></i>Automation Metrics
                </button>
              </nav>
            </div>

            <!-- Tab Contents -->
            
            <!-- Overview Tab -->
            <div id="overview" class="tab-content active p-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <!-- Automation Progress Chart -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-chart-bar text-blue-600 mr-2"></i>
                    Framework Automation Progress
                  </h3>
                  <div class="space-y-4">
                    ${automationData.map((framework: any) => html`
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <div class="flex items-center justify-between mb-1">
                            <span class="text-sm font-medium text-gray-700">${framework.framework_name}</span>
                            <span class="text-sm font-bold text-gray-900">${framework.automation_percentage.toFixed(1)}%</span>
                          </div>
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="h-2 rounded-full ${framework.automation_percentage >= 60 ? 'bg-green-500' : framework.automation_percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}" 
                                 style="width: ${framework.automation_percentage}%"></div>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Collection Activity -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-activity text-green-600 mr-2"></i>
                    Recent Collection Activity
                  </h3>
                  <div 
                    hx-get="/dashboard/phase4/evidence/activity" 
                    hx-trigger="load, every 30s"
                    hx-indicator="#activity-loading">
                    <div id="activity-loading" class="htmx-indicator text-center py-4">
                      <i class="fas fa-spinner fa-spin text-gray-400"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  class="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-left transition-colors"
                  hx-post="/api/v2/evidence/collect"
                  hx-target="#collection-results">
                  <i class="fas fa-play text-xl mb-2"></i>
                  <div class="font-semibold">Start Evidence Collection</div>
                  <div class="text-blue-100 text-sm">Run comprehensive collection cycle</div>
                </button>
                
                <button 
                  class="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-left transition-colors"
                  hx-get="/api/v2/evidence/metrics/dashboard"
                  hx-target="#metrics-results">
                  <i class="fas fa-chart-line text-xl mb-2"></i>
                  <div class="font-semibold">Generate Report</div>
                  <div class="text-green-100 text-sm">Create automation metrics report</div>
                </button>
                
                <button 
                  class="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-left transition-colors"
                  hx-get="/api/v2/evidence/health"
                  hx-target="#health-results">
                  <i class="fas fa-heartbeat text-xl mb-2"></i>
                  <div class="font-semibold">System Health</div>
                  <div class="text-purple-100 text-sm">Check system status and health</div>
                </button>
              </div>
              
              <!-- Results Area -->
              <div id="collection-results" class="mt-6"></div>
              <div id="metrics-results" class="mt-6"></div>
              <div id="health-results" class="mt-6"></div>
            </div>

            <!-- Evidence Sources Tab -->
            <div id="sources" class="tab-content p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-900">Evidence Sources Management</h2>
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  <i class="fas fa-plus mr-2"></i>Add Source
                </button>
              </div>
              
              <div 
                hx-get="/dashboard/phase4/evidence/sources-table"
                hx-trigger="load"
                hx-indicator="#sources-loading">
                <div id="sources-loading" class="htmx-indicator text-center py-8">
                  <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
                  <p class="text-gray-500 mt-2">Loading evidence sources...</p>
                </div>
              </div>
            </div>

            <!-- Collection Jobs Tab -->
            <div id="collections" class="tab-content p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-900">Evidence Collection Jobs</h2>
                <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                  <i class="fas fa-plus mr-2"></i>Create Job
                </button>
              </div>
              
              <div 
                hx-get="/dashboard/phase4/evidence/jobs-table"
                hx-trigger="load"
                hx-indicator="#jobs-loading">
                <div id="jobs-loading" class="htmx-indicator text-center py-8">
                  <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
                  <p class="text-gray-500 mt-2">Loading collection jobs...</p>
                </div>
              </div>
            </div>

            <!-- Evidence Artifacts Tab -->
            <div id="artifacts" class="tab-content p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-900">Evidence Artifacts Repository</h2>
                <div class="flex space-x-2">
                  <select class="border border-gray-300 rounded-lg px-3 py-2">
                    <option value="">All Types</option>
                    <option value="log_file">Log Files</option>
                    <option value="config_export">Configurations</option>
                    <option value="screenshot">Screenshots</option>
                    <option value="report">Reports</option>
                  </select>
                  <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    <i class="fas fa-search mr-2"></i>Filter
                  </button>
                </div>
              </div>
              
              <div 
                hx-get="/dashboard/phase4/evidence/artifacts-table"
                hx-trigger="load"
                hx-indicator="#artifacts-loading">
                <div id="artifacts-loading" class="htmx-indicator text-center py-8">
                  <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
                  <p class="text-gray-500 mt-2">Loading evidence artifacts...</p>
                </div>
              </div>
            </div>

            <!-- Automation Metrics Tab -->
            <div id="metrics" class="tab-content p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-900">Automation Metrics & Analytics</h2>
                <div class="flex space-x-2">
                  <select class="border border-gray-300 rounded-lg px-3 py-2">
                    <option value="">All Frameworks</option>
                    <option value="NIST-800-53">NIST 800-53</option>
                    <option value="SOC2">SOC 2</option>
                    <option value="ISO-27001">ISO 27001</option>
                    <option value="PCI-DSS">PCI DSS</option>
                  </select>
                  <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                    <i class="fas fa-download mr-2"></i>Export Report
                  </button>
                </div>
              </div>
              
              <div 
                hx-get="/dashboard/phase4/evidence/metrics-charts"
                hx-trigger="load"
                hx-indicator="#metrics-loading">
                <div id="metrics-loading" class="htmx-indicator text-center py-8">
                  <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
                  <p class="text-gray-500 mt-2">Loading automation metrics...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div id="loading-indicator" class="htmx-indicator fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
            <i class="fas fa-spinner fa-spin text-blue-600 text-xl"></i>
            <span class="text-gray-700 font-medium">Processing evidence collection...</span>
          </div>
        </div>

        <!-- JavaScript -->
        <script>
          // Tab switching functionality
          function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => {
              tab.classList.remove('active');
            });
            
            // Remove active class from all tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
              btn.classList.remove('border-blue-500', 'text-blue-600');
              btn.classList.add('border-transparent', 'text-gray-500');
            });
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to selected tab button
            const activeBtn = document.querySelector(\`[data-tab="\${tabName}"]\`);
            activeBtn.classList.remove('border-transparent', 'text-gray-500');
            activeBtn.classList.add('border-blue-500', 'text-blue-600');
          }

          // Auto-refresh functionality
          setInterval(() => {
            // Auto-refresh active tab content every 60 seconds
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab && activeTab.id === 'overview') {
              // Refresh activity feed
              htmx.trigger('#activity-loading', 'load');
            }
          }, 60000);

          // Initialize tooltips and other interactive elements
          document.addEventListener('DOMContentLoaded', function() {
            console.log('Phase 4 Evidence Collection Dashboard loaded');
            
            // Set up HTMX event listeners for better UX
            document.body.addEventListener('htmx:beforeRequest', function(evt) {
              console.log('HTMX request starting:', evt.detail);
            });
            
            document.body.addEventListener('htmx:afterRequest', function(evt) {
              console.log('HTMX request completed:', evt.detail);
            });
          });
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Phase 4 evidence dashboard error:', error);
    return c.html(html`
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div class="text-center">
            <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
            <p class="text-gray-600 mb-4">Unable to load Phase 4 evidence collection dashboard.</p>
            <button onclick="window.location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              <i class="fas fa-redo mr-2"></i>Retry
            </button>
          </div>
        </div>
      </div>
    `);
  }
});

/**
 * Evidence Sources Table Component
 * GET /dashboard/phase4/evidence/sources-table
 */
phase4EvidenceDashboard.get('/sources-table', async (c) => {
  try {
    const { env } = c;
    
    const sourcesQuery = `
      SELECT 
        es.*,
        COUNT(eeh.id) as recent_executions,
        AVG(eeh.confidence_score) as avg_confidence
      FROM evidence_sources es
      LEFT JOIN evidence_execution_history eeh ON es.id = eeh.source_id 
        AND eeh.started_at >= datetime('now', '-7 days')
      GROUP BY es.id
      ORDER BY es.is_active DESC, es.success_rate DESC
    `;
    
    const result = await env.DB.prepare(sourcesQuery).all();
    const sources = result.results || [];

    return c.html(html`
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Automation</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Collection</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${sources.map((source: any) => {
              const statusIcon = source.collection_status === 'success' ? 'fa-check-circle text-green-500' :
                                source.collection_status === 'error' ? 'fa-times-circle text-red-500' :
                                'fa-clock text-gray-400';
              
              const automationBadge = source.automation_level === 'fully_automated' ? 'bg-green-100 text-green-800' :
                                    source.automation_level === 'semi_automated' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800';
              
              return html`
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <i class="fas fa-database text-blue-600"></i>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${source.source_name}</div>
                        <div class="text-sm text-gray-500">${source.source_type}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="capitalize text-sm text-gray-900">${source.source_type}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${automationBadge}">
                      ${source.automation_level.replace('_', ' ')}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <i class="fas ${statusIcon} mr-2"></i>
                      <span class="text-sm capitalize">${source.collection_status}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(source.success_rate * 100).toFixed(1)}%
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${source.last_collection_at ? new Date(source.last_collection_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-3">Configure</button>
                    <button class="text-green-600 hover:text-green-900 mr-3">Test</button>
                    <button class="text-red-600 hover:text-red-900">Disable</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        ${sources.length === 0 ? html`
          <div class="text-center py-8">
            <i class="fas fa-database text-gray-400 text-4xl mb-4"></i>
            <p class="text-gray-500">No evidence sources configured</p>
          </div>
        ` : ''}
      </div>
    `);

  } catch (error) {
    return c.html(html`
      <div class="text-center py-8">
        <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
        <p class="text-red-600">Error loading evidence sources</p>
      </div>
    `);
  }
});

/**
 * Recent Activity Component
 * GET /dashboard/phase4/evidence/activity
 */
phase4EvidenceDashboard.get('/activity', async (c) => {
  try {
    const { env } = c;
    
    const activityQuery = `
      SELECT 
        eeh.*,
        es.source_name,
        ecj.job_name,
        ecj.control_reference
      FROM evidence_execution_history eeh
      LEFT JOIN evidence_sources es ON eeh.source_id = es.id
      LEFT JOIN evidence_collection_jobs ecj ON eeh.job_id = ecj.id
      WHERE eeh.started_at >= datetime('now', '-24 hours')
      ORDER BY eeh.started_at DESC
      LIMIT 10
    `;
    
    const result = await env.DB.prepare(activityQuery).all();
    const activities = result.results || [];

    return c.html(html`
      <div class="space-y-3">
        ${activities.map((activity: any) => {
          const statusColor = activity.execution_status === 'completed' ? 'text-green-600' :
                            activity.execution_status === 'failed' ? 'text-red-600' :
                            'text-yellow-600';
          
          const statusIcon = activity.execution_status === 'completed' ? 'fa-check-circle' :
                           activity.execution_status === 'failed' ? 'fa-times-circle' :
                           'fa-clock';
          
          return html`
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div class="flex items-center space-x-3">
                <i class="fas ${statusIcon} ${statusColor}"></i>
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    ${activity.job_name || activity.source_name}
                  </div>
                  <div class="text-xs text-gray-500">
                    ${activity.control_reference ? `Control: ${activity.control_reference}` : 'Evidence Collection'}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium ${statusColor} capitalize">
                  ${activity.execution_status}
                </div>
                <div class="text-xs text-gray-500">
                  ${new Date(activity.started_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          `;
        }).join('')}
        
        ${activities.length === 0 ? html`
          <div class="text-center py-6">
            <i class="fas fa-clock text-gray-400 text-2xl mb-2"></i>
            <p class="text-gray-500">No recent collection activity</p>
          </div>
        ` : ''}
      </div>
    `);

  } catch (error) {
    return c.html(html`
      <div class="text-center py-4 text-red-600">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        Error loading activity feed
      </div>
    `);
  }
});

export { phase4EvidenceDashboard };