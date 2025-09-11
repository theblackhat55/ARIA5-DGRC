/**
 * Dynamic Risk Analysis Dashboard Routes
 * UI components and pages for cybersecurity and operational dynamic risk analysis
 */

import { Hono } from 'hono';
import { html } from 'hono/html';
import { cleanLayout } from '../templates/layout-clean';
import { requireAuth } from './auth-routes';

const dynamicRiskDashboardRoutes = new Hono();

// Apply authentication to all routes
dynamicRiskDashboardRoutes.use('*', requireAuth);

/**
 * Main Dynamic Risk Analysis Dashboard
 */
dynamicRiskDashboardRoutes.get('/dashboard', async (c) => {
  const user = c.get('user');
  
  const content = html`
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between py-6">
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <i class="fas fa-chart-line text-white text-lg"></i>
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-gray-900">Dynamic Risk Analysis</h1>
                  <p class="text-sm text-gray-500">Real-time risk detection and correlation</p>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Risk Analysis Status -->
              <div class="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-green-800">Analysis Engine Active</span>
              </div>
              
              <!-- Time Range Selector -->
              <select id="timeframe-selector" class="rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="1h">Last Hour</option>
                <option value="24h" selected>Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
              
              <button onclick="refreshDashboard()" 
                      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
                <i class="fas fa-sync-alt"></i>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Key Metrics Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Pipeline Statistics -->
          <div id="pipeline-stats-cards" class="contents">
            <!-- Cards will be populated by JavaScript -->
          </div>
        </div>

        <!-- Risk Analysis Tabs -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div class="border-b border-gray-200">
            <nav class="flex space-x-8 px-6" aria-label="Risk Analysis Tabs">
              <button class="risk-tab-btn active border-b-2 border-blue-500 py-4 text-sm font-medium text-blue-600" data-tab="cybersecurity">
                <i class="fas fa-shield-virus mr-2"></i>
                Cybersecurity Risks
              </button>
              <button class="risk-tab-btn border-b-2 border-transparent py-4 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="operational">
                <i class="fas fa-cogs mr-2"></i>
                Operational Risks
              </button>
              <button class="risk-tab-btn border-b-2 border-transparent py-4 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="compliance">
                <i class="fas fa-clipboard-check mr-2"></i>
                Compliance Risks
                <span class="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Placeholder</span>
              </button>
              <button class="risk-tab-btn border-b-2 border-transparent py-4 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="financial">
                <i class="fas fa-dollar-sign mr-2"></i>
                Financial Risks
                <span class="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Placeholder</span>
              </button>
              <button class="risk-tab-btn border-b-2 border-transparent py-4 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="strategic">
                <i class="fas fa-chess-knight mr-2"></i>
                Strategic Risks
                <span class="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Placeholder</span>
              </button>
            </nav>
          </div>
          
          <!-- Tab Content -->
          <div class="p-6">
            <!-- Cybersecurity Tab -->
            <div id="cybersecurity-tab" class="risk-tab-content">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Recent Security Incidents -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Security Risk Triggers</h3>
                    <button onclick="openSecurityTriggerModal()" 
                            class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <i class="fas fa-plus mr-1"></i>
                      New Trigger
                    </button>
                  </div>
                  <div id="security-triggers-list" class="space-y-3">
                    <!-- Security triggers will be loaded here -->
                  </div>
                </div>
                
                <!-- CVE Analysis -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">CVE Risk Analysis</h3>
                    <button onclick="openCVETriggerModal()" 
                            class="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <i class="fas fa-bug mr-1"></i>
                      Analyze CVE
                    </button>
                  </div>
                  <div id="cve-analysis-list" class="space-y-3">
                    <!-- CVE analysis will be loaded here -->
                  </div>
                </div>
              </div>
              
              <!-- Security Risk Timeline -->
              <div class="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Security Risk Timeline</h3>
                <div id="security-timeline" class="space-y-3">
                  <!-- Timeline will be populated by JavaScript -->
                </div>
              </div>
            </div>
            
            <!-- Operational Tab -->
            <div id="operational-tab" class="risk-tab-content hidden">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Service Health Monitoring -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Service Health Alerts</h3>
                    <button onclick="openServiceHealthModal()" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <i class="fas fa-heartbeat mr-1"></i>
                      Health Check
                    </button>
                  </div>
                  <div id="service-health-list" class="space-y-3">
                    <!-- Service health alerts will be loaded here -->
                  </div>
                </div>
                
                <!-- Change Management Risks -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Change Management</h3>
                    <button onclick="openChangeRiskModal()" 
                            class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <i class="fas fa-code-branch mr-1"></i>
                      Track Change
                    </button>
                  </div>
                  <div id="change-risk-list" class="space-y-3">
                    <!-- Change risks will be loaded here -->
                  </div>
                </div>
              </div>
              
              <!-- Service Dependency Map -->
              <div class="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Service Risk Dependencies</h3>
                <div id="service-dependency-map" class="min-h-64 flex items-center justify-center text-gray-500">
                  <div class="text-center">
                    <i class="fas fa-project-diagram text-4xl mb-4"></i>
                    <p>Service dependency visualization will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Placeholder Tabs -->
            <div id="compliance-tab" class="risk-tab-content hidden">
              <div class="text-center py-12">
                <i class="fas fa-clipboard-check text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Compliance Risk Analysis</h3>
                <p class="text-gray-600 mb-4">Real-time compliance monitoring and risk assessment - Coming Soon</p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <div class="flex items-start space-x-3">
                    <i class="fas fa-info-circle text-blue-500 mt-1"></i>
                    <div class="text-left">
                      <p class="text-sm text-blue-700 font-medium">Planned Features:</p>
                      <ul class="text-sm text-blue-600 mt-2 space-y-1">
                        <li>• MFA coverage analysis</li>
                        <li>• Audit finding correlation</li>
                        <li>• Regulatory change monitoring</li>
                        <li>• Evidence staleness alerts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="financial-tab" class="risk-tab-content hidden">
              <div class="text-center py-12">
                <i class="fas fa-dollar-sign text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Financial Risk Analysis</h3>
                <p class="text-gray-600 mb-4">Market volatility and financial risk correlation - Coming Soon</p>
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                  <div class="flex items-start space-x-3">
                    <i class="fas fa-info-circle text-green-500 mt-1"></i>
                    <div class="text-left">
                      <p class="text-sm text-green-700 font-medium">Planned Features:</p>
                      <ul class="text-sm text-green-600 mt-2 space-y-1">
                        <li>• Market volatility monitoring</li>
                        <li>• Credit risk assessment</li>
                        <li>• Currency risk analysis</li>
                        <li>• Economic indicator correlation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="strategic-tab" class="risk-tab-content hidden">
              <div class="text-center py-12">
                <i class="fas fa-chess-knight text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Strategic Risk Analysis</h3>
                <p class="text-gray-600 mb-4">Business intelligence and strategic threat monitoring - Coming Soon</p>
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
                  <div class="flex items-start space-x-3">
                    <i class="fas fa-info-circle text-purple-500 mt-1"></i>
                    <div class="text-left">
                      <p class="text-sm text-purple-700 font-medium">Planned Features:</p>
                      <ul class="text-sm text-purple-600 mt-2 space-y-1">
                        <li>• Geopolitical risk monitoring</li>
                        <li>• Vendor/supply chain analysis</li>
                        <li>• News sentiment analysis</li>
                        <li>• ESG risk assessment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Risk Correlation Analysis -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Risk Correlation Analysis</h2>
          </div>
          <div class="p-6">
            <div id="correlation-analysis" class="min-h-64 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <i class="fas fa-network-wired text-4xl mb-4"></i>
                <p>Select a risk above to view correlation analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div id="modal-container"></div>

    <style>
      .risk-tab-btn.active {
        color: rgb(37, 99, 235);
        border-bottom-color: rgb(37, 99, 235);
      }
      
      .risk-item {
        transition: all 0.2s ease-in-out;
      }
      
      .risk-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .severity-critical { border-left: 4px solid #dc2626; }
      .severity-high { border-left: 4px solid #ea580c; }
      .severity-medium { border-left: 4px solid #ca8a04; }
      .severity-low { border-left: 4px solid #16a34a; }
    </style>

    <script>
      // Global variables
      let currentTimeframe = '24h';
      let currentTab = 'cybersecurity';
      let dashboardData = null;

      // Initialize dashboard
      document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Dynamic Risk Analysis Dashboard initializing...');
        
        // Setup tab switching
        setupTabSwitching();
        
        // Setup timeframe selector
        setupTimeframeSelector();
        
        // Load initial dashboard data
        refreshDashboard();
        
        // Setup auto-refresh (every 5 minutes)
        setInterval(refreshDashboard, 5 * 60 * 1000);
      });

      // Tab switching functionality
      function setupTabSwitching() {
        document.querySelectorAll('.risk-tab-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
          });
        });
      }

      function switchTab(tabName) {
        currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.risk-tab-btn').forEach(btn => {
          btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
          btn.classList.add('border-transparent', 'text-gray-500');
        });
        
        document.querySelector(\`[data-tab="\${tabName}"]\`).classList.add('active', 'border-blue-500', 'text-blue-600');
        document.querySelector(\`[data-tab="\${tabName}"]\`).classList.remove('border-transparent', 'text-gray-500');
        
        // Show/hide tab content
        document.querySelectorAll('.risk-tab-content').forEach(content => {
          content.classList.add('hidden');
        });
        
        document.getElementById(\`\${tabName}-tab\`).classList.remove('hidden');
        
        // Load tab-specific data
        loadTabData(tabName);
      }

      // Timeframe selector setup
      function setupTimeframeSelector() {
        document.getElementById('timeframe-selector').addEventListener('change', function() {
          currentTimeframe = this.value;
          refreshDashboard();
        });
      }

      // Main dashboard refresh function
      async function refreshDashboard() {
        console.log(\`🔄 Refreshing dashboard data (timeframe: \${currentTimeframe})...\`);
        
        try {
          // Show loading state
          showLoadingState();
          
          const response = await fetch(\`/api/dynamic-risk-analysis/dashboard?timeframe=\${currentTimeframe}\`, {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(\`Dashboard API failed: \${response.status}\`);
          }
          
          dashboardData = await response.json();
          console.log('📊 Dashboard data loaded:', dashboardData);
          
          // Update UI components
          updatePipelineStatsCards();
          loadTabData(currentTab);
          
        } catch (error) {
          console.error('❌ Dashboard refresh failed:', error);
          showErrorState(error.message);
        }
      }

      // Update pipeline statistics cards
      function updatePipelineStatsCards() {
        const container = document.getElementById('pipeline-stats-cards');
        const stats = dashboardData.pipeline_statistics;
        
        container.innerHTML = \`
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-exclamation-triangle text-red-600"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Active Risks</p>
                <p class="text-2xl font-semibold text-gray-900">\${stats.active}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-clock text-yellow-600"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Pending Review</p>
                <p class="text-2xl font-semibold text-gray-900">\${stats.draft}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-search text-blue-600"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Detected</p>
                <p class="text-2xl font-semibold text-gray-900">\${stats.detected}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-chart-line text-green-600"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Managed</p>
                <p class="text-2xl font-semibold text-gray-900">\${stats.total}</p>
              </div>
            </div>
          </div>
        \`;
      }

      // Load tab-specific data
      function loadTabData(tabName) {
        switch (tabName) {
          case 'cybersecurity':
            loadSecurityRisks();
            break;
          case 'operational':
            loadOperationalRisks();
            break;
          case 'compliance':
          case 'financial':
          case 'strategic':
            // Placeholder tabs - no data to load yet
            break;
        }
      }

      // Load security risks
      function loadSecurityRisks() {
        // Filter security risks from dashboard data
        const securityRisks = dashboardData.recent_risks_by_category.filter(risk => 
          risk.category === 'security' || risk.category === 'cybersecurity'
        );
        
        // Update security triggers list
        const triggersContainer = document.getElementById('security-triggers-list');
        triggersContainer.innerHTML = securityRisks.length > 0 ? 
          securityRisks.map(risk => createRiskCard(risk, 'security')).join('') :
          '<p class="text-gray-500 text-sm">No recent security triggers</p>';
        
        // Update security timeline
        updateSecurityTimeline();
      }

      // Load operational risks  
      function loadOperationalRisks() {
        const operationalRisks = dashboardData.recent_risks_by_category.filter(risk => 
          risk.category === 'operational'
        );
        
        const healthContainer = document.getElementById('service-health-list');
        healthContainer.innerHTML = operationalRisks.length > 0 ?
          operationalRisks.map(risk => createRiskCard(risk, 'operational')).join('') :
          '<p class="text-gray-500 text-sm">No recent service health alerts</p>';
      }

      // Create risk card HTML
      function createRiskCard(risk, type) {
        const severityClass = getSeverityClass(risk.confidence_score);
        const icon = type === 'security' ? 'fas fa-shield-virus' : 'fas fa-cogs';
        
        return \`
          <div class="risk-item \${severityClass} bg-white rounded-lg p-4 cursor-pointer hover:shadow-md"
               onclick="viewRiskCorrelation(\${risk.id || 'unknown'})">
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 mt-1">
                  <i class="\${icon} text-gray-600"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">\${risk.dynamic_state || 'Unknown State'}</p>
                  <p class="text-xs text-gray-500 mt-1">Confidence: \${(risk.confidence_score * 100).toFixed(0)}%</p>
                  <p class="text-xs text-gray-400 mt-1">\${formatTimeAgo(risk.created_at)}</p>
                </div>
              </div>
              <div class="flex-shrink-0">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  \${risk.count} risks
                </span>
              </div>
            </div>
          </div>
        \`;
      }

      // Utility functions
      function getSeverityClass(confidence) {
        if (confidence >= 0.9) return 'severity-critical';
        if (confidence >= 0.7) return 'severity-high';  
        if (confidence >= 0.5) return 'severity-medium';
        return 'severity-low';
      }

      function formatTimeAgo(dateString) {
        if (!dateString) return 'Unknown time';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) return 'Just now';
        if (hours < 24) return \`\${hours}h ago\`;
        return \`\${Math.floor(hours / 24)}d ago\`;
      }

      function updateSecurityTimeline() {
        const timeline = document.getElementById('security-timeline');
        timeline.innerHTML = \`
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-clock text-2xl mb-2"></i>
            <p>Security timeline visualization - Coming soon</p>
          </div>
        \`;
      }

      function showLoadingState() {
        // Add loading indicators to key components
        const containers = ['pipeline-stats-cards', 'security-triggers-list', 'service-health-list'];
        containers.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
          }
        });
      }

      function showErrorState(error) {
        const container = document.getElementById('pipeline-stats-cards');
        container.innerHTML = \`
          <div class="col-span-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center space-x-3">
              <i class="fas fa-exclamation-triangle text-red-500"></i>
              <div>
                <p class="font-medium text-red-800">Dashboard Load Error</p>
                <p class="text-sm text-red-600">\${error}</p>
              </div>
            </div>
          </div>
        \`;
      }

      // Modal functions (placeholders)
      function openSecurityTriggerModal() {
        alert('Security Trigger Modal - Implementation pending');
      }

      function openCVETriggerModal() {
        alert('CVE Analysis Modal - Implementation pending'); 
      }

      function openServiceHealthModal() {
        alert('Service Health Modal - Implementation pending');
      }

      function openChangeRiskModal() {
        alert('Change Risk Modal - Implementation pending');
      }

      function viewRiskCorrelation(riskId) {
        console.log(\`Viewing correlation for risk \${riskId}\`);
        alert(\`Risk Correlation Analysis for Risk \${riskId} - Implementation pending\`);
      }
    </script>
  `;
  
  return c.html(cleanLayout('Dynamic Risk Analysis', user, content));
});

/**
 * Real-time Risk Processing Page
 */
dynamicRiskDashboardRoutes.get('/processing', async (c) => {
  const user = c.get('user');
  
  const content = html`
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Processing Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Real-time Risk Processing</h1>
              <p class="text-gray-600 mt-1">Monitor and trigger dynamic risk analysis workflows</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-green-800">Processing Active</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Trigger Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          <!-- Security Incident Trigger -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-shield-virus text-red-600"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Security Incident</h3>
                <p class="text-sm text-gray-500">Process security alerts and incidents</p>
              </div>
            </div>
            <button onclick="triggerSecurityIncident()" 
                    class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium">
              Trigger Analysis
            </button>
          </div>

          <!-- CVE Analysis Trigger -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-bug text-orange-600"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">CVE Analysis</h3>
                <p class="text-sm text-gray-500">Analyze vulnerability impact</p>
              </div>
            </div>
            <button onclick="triggerCVEAnalysis()" 
                    class="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium">
              Analyze CVE
            </button>
          </div>

          <!-- Operational Alert Trigger -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-cogs text-blue-600"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Service Alert</h3>
                <p class="text-sm text-gray-500">Process operational incidents</p>
              </div>
            </div>
            <button onclick="triggerOperationalAlert()" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              Process Alert
            </button>
          </div>
        </div>

        <!-- Processing Log -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Processing Log</h2>
              <button onclick="clearProcessingLog()" 
                      class="text-sm text-gray-500 hover:text-gray-700">Clear Log</button>
            </div>
          </div>
          <div class="p-6">
            <div id="processing-log" class="space-y-3 max-h-96 overflow-y-auto">
              <div class="text-center text-gray-500 py-8">
                <i class="fas fa-list text-2xl mb-2"></i>
                <p>Processing events will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      // Processing functions
      async function triggerSecurityIncident() {
        const sampleIncident = {
          incident_id: 'SEC-' + Date.now(),
          incident_type: 'defender_incident',
          severity_score: 85,
          affected_assets: [
            { service_id: 1, asset_name: 'DC-PRIMARY-01' },
            { service_id: 2, asset_name: 'SQL-PROD-CLUSTER' }
          ],
          confidence: 0.9,
          indicators: ['malicious_ip', 'suspicious_process']
        };

        await processRiskTrigger('/api/dynamic-risk-analysis/security/incident-trigger', sampleIncident, 'Security Incident');
      }

      async function triggerCVEAnalysis() {
        const sampleCVE = {
          cve_id: 'CVE-2023-23397',
          cvss_score: 9.8,
          kev_status: true,
          exploitation_status: 'active',
          affected_assets: [
            { service_id: 3, asset_name: 'EXCHANGE-HYBRID-01' }
          ]
        };

        await processRiskTrigger('/api/dynamic-risk-analysis/security/cve-trigger', sampleCVE, 'CVE Analysis');
      }

      async function triggerOperationalAlert() {
        const sampleAlert = {
          service_id: 4,
          incident_type: 'capacity_exhaustion',
          alert_type: 'capacity_warning',
          impact_scope: 'service',
          estimated_impact_hours: 2,
          recurrence_count: 1
        };

        await processRiskTrigger('/api/dynamic-risk-analysis/operational/health-alert', sampleAlert, 'Operational Alert');
      }

      async function processRiskTrigger(endpoint, data, triggerType) {
        addLogEntry(\`🔄 Processing \${triggerType}...\`, 'info');
        
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
          });

          const result = await response.json();
          
          if (response.ok) {
            addLogEntry(\`✅ \${triggerType} processed successfully: \${result.result.action}\`, 'success');
            if (result.result.risk_id) {
              addLogEntry(\`📊 Risk ID \${result.result.risk_id} created\`, 'success');
            }
          } else {
            addLogEntry(\`❌ \${triggerType} processing failed: \${result.error}\`, 'error');
          }
        } catch (error) {
          addLogEntry(\`❌ \${triggerType} request failed: \${error.message}\`, 'error');
        }
      }

      function addLogEntry(message, type) {
        const logContainer = document.getElementById('processing-log');
        const timestamp = new Date().toLocaleTimeString();
        
        const entry = document.createElement('div');
        entry.className = \`flex items-start space-x-3 p-3 rounded-lg \${getLogEntryClass(type)}\`;
        entry.innerHTML = \`
          <div class="text-xs text-gray-400 mt-0.5">\${timestamp}</div>
          <div class="flex-1 text-sm font-mono">\${message}</div>
        \`;
        
        // Clear placeholder if first entry
        const placeholder = logContainer.querySelector('.text-center');
        if (placeholder) {
          logContainer.innerHTML = '';
        }
        
        logContainer.insertBefore(entry, logContainer.firstChild);
        
        // Keep only last 20 entries
        while (logContainer.children.length > 20) {
          logContainer.removeChild(logContainer.lastChild);
        }
      }

      function getLogEntryClass(type) {
        switch (type) {
          case 'success': return 'bg-green-50 border border-green-200';
          case 'error': return 'bg-red-50 border border-red-200';
          case 'info': return 'bg-blue-50 border border-blue-200';
          default: return 'bg-gray-50 border border-gray-200';
        }
      }

      function clearProcessingLog() {
        document.getElementById('processing-log').innerHTML = \`
          <div class="text-center text-gray-500 py-8">
            <i class="fas fa-list text-2xl mb-2"></i>
            <p>Processing events will appear here</p>
          </div>
        \`;
      }
    </script>
  `;
  
  return c.html(cleanLayout('Risk Processing', user, content));
});

export default dynamicRiskDashboardRoutes;