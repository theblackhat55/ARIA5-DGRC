/**
 * Enhanced Dynamic Risk Analysis Dashboard Template
 * Provides comprehensive real-time risk management interface with multiple trigger categories
 */

import { html } from 'hono/html';

export function createDynamicRiskDashboard() {
  return html`
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between py-6">
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <i class="fas fa-chart-network text-white text-lg"></i>
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-gray-900">Enhanced Dynamic Risk Analysis</h1>
                  <p class="text-sm text-gray-500">Multi-category real-time risk detection & correlation</p>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Risk Analysis Status -->
              <div class="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-green-800">Enhanced Engine Active</span>
              </div>
              
              <!-- Time Range Selector -->
              <select id="timeframe-selector" class="rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="1h">Last Hour</option>
                <option value="24h" selected>Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
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
        
        <!-- Enhanced Key Metrics Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div id="enhanced-stats-cards" class="contents">
            <!-- Enhanced statistics cards will be populated by JavaScript -->
          </div>
        </div>

        <!-- Enhanced Risk Analysis Tabs -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div class="border-b border-gray-200">
            <nav class="flex space-x-6 px-6 overflow-x-auto" aria-label="Enhanced Risk Analysis Tabs">
              <button class="enhanced-risk-tab-btn active border-b-2 border-blue-500 py-4 px-2 text-sm font-medium text-blue-600 whitespace-nowrap" data-tab="security">
                <i class="fas fa-shield-virus mr-2"></i>
                Security Triggers
              </button>
              <button class="enhanced-risk-tab-btn border-b-2 border-transparent py-4 px-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap" data-tab="operational">
                <i class="fas fa-cogs mr-2"></i>
                Operational Risks
              </button>
              <button class="enhanced-risk-tab-btn border-b-2 border-transparent py-4 px-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap" data-tab="compliance">
                <i class="fas fa-clipboard-check mr-2"></i>
                Compliance Risks
              </button>
              <button class="enhanced-risk-tab-btn border-b-2 border-transparent py-4 px-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap" data-tab="strategic">
                <i class="fas fa-chess-knight mr-2"></i>
                Strategic Intelligence
              </button>
              <button class="enhanced-risk-tab-btn border-b-2 border-transparent py-4 px-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap" data-tab="threat-intel">
                <i class="fas fa-brain mr-2"></i>
                Threat Intelligence
              </button>
            </nav>
          </div>
          
          <!-- Enhanced Tab Content -->
          <div class="p-6">
            <!-- Security Tab -->
            <div id="security-tab" class="enhanced-risk-tab-content">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Security Risk Triggers -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Security Risk Triggers</h3>
                    <button onclick="testSecurityTrigger()" 
                            class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <i class="fas fa-plus mr-1"></i>
                      Test Trigger
                    </button>
                  </div>
                  <div id="security-triggers-list" class="space-y-3">
                    <!-- Security triggers will be loaded here -->
                  </div>
                </div>
                
                <!-- Security Risk Summary -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Security Risk Summary</h3>
                    <span class="text-xs text-gray-500">Real-time correlation</span>
                  </div>
                  <div id="security-summary" class="space-y-3">
                    <!-- Security summary will be loaded here -->
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Operational Tab -->
            <div id="operational-tab" class="enhanced-risk-tab-content hidden">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Operational Risk Triggers -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Operational Risk Triggers</h3>
                    <button onclick="testOperationalTrigger()" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <i class="fas fa-cogs mr-1"></i>
                      Test Trigger
                    </button>
                  </div>
                  <div id="operational-triggers-list" class="space-y-3">
                    <!-- Operational triggers will be loaded here -->
                  </div>
                </div>
                
                <!-- Service Risk Analysis -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Service Risk Analysis</h3>
                    <span class="text-xs text-gray-500">CIA scoring integration</span>
                  </div>
                  <div id="service-risk-analysis" class="space-y-3">
                    <!-- Service analysis will be loaded here -->
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Compliance Tab -->
            <div id="compliance-tab" class="enhanced-risk-tab-content hidden">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Compliance Risk Triggers</h3>
                    <button onclick="testComplianceTrigger()" 
                            class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <i class="fas fa-clipboard-check mr-1"></i>
                      Test Trigger
                    </button>
                  </div>
                  <div id="compliance-triggers-list" class="space-y-3">
                    <!-- Compliance triggers will be loaded here -->
                  </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Compliance Risk Summary</h3>
                  <div id="compliance-summary" class="space-y-3">
                    <!-- Compliance summary will be loaded here -->
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Strategic Tab -->
            <div id="strategic-tab" class="enhanced-risk-tab-content hidden">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Strategic Risk Triggers</h3>
                    <button onclick="testStrategicTrigger()" 
                            class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <i class="fas fa-chess-knight mr-1"></i>
                      Test Trigger
                    </button>
                  </div>
                  <div id="strategic-triggers-list" class="space-y-3">
                    <!-- Strategic triggers will be loaded here -->
                  </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Strategic Intelligence</h3>
                  <div id="strategic-summary" class="space-y-3">
                    <!-- Strategic summary will be loaded here -->
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Threat Intelligence Tab -->
            <div id="threat-intel-tab" class="enhanced-risk-tab-content hidden">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Threat Intelligence Feeds</h3>
                    <button onclick="refreshThreatIntelligence()" 
                            class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      <i class="fas fa-brain mr-1"></i>
                      Refresh
                    </button>
                  </div>
                  <div id="threat-intel-feeds" class="space-y-3">
                    <!-- Threat intelligence feeds will be loaded here -->
                  </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Risk Correlation Engine</h3>
                  <div id="correlation-engine" class="space-y-3">
                    <!-- Correlation analysis will be loaded here -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Risk Correlation Analysis -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Enhanced Risk Correlation Analysis</h2>
              <button onclick="viewCorrelationMatrix()" 
                      class="text-sm text-blue-600 hover:text-blue-800">
                View Correlation Matrix
              </button>
            </div>
          </div>
          <div class="p-6">
            <div id="enhanced-correlation-analysis" class="min-h-64">
              <!-- Enhanced correlation analysis will be displayed here -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Modals -->
    <div id="enhanced-modal-container"></div>

    <style>
      .enhanced-risk-tab-btn.active {
        color: rgb(37, 99, 235);
        border-bottom-color: rgb(37, 99, 235);
      }
      
      .enhanced-risk-item {
        transition: all 0.2s ease-in-out;
      }
      
      .enhanced-risk-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .severity-critical { border-left: 4px solid #dc2626; }
      .severity-high { border-left: 4px solid #ea580c; }
      .severity-medium { border-left: 4px solid #ca8a04; }
      .severity-low { border-left: 4px solid #16a34a; }
      .severity-info { border-left: 4px solid #3b82f6; }
    </style>

    <script>
      // Enhanced Global Variables
      let currentTimeframe = '24h';
      let currentTab = 'security';
      let enhancedDashboardData = null;

      // Initialize Enhanced Dashboard
      document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Enhanced Dynamic Risk Analysis Dashboard initializing...');
        
        // Setup enhanced tab switching
        setupEnhancedTabSwitching();
        
        // Setup timeframe selector
        setupTimeframeSelector();
        
        // Load initial dashboard data
        refreshDashboard();
        
        // Setup auto-refresh (every 5 minutes)
        setInterval(refreshDashboard, 5 * 60 * 1000);
      });

      // Enhanced Tab Switching
      function setupEnhancedTabSwitching() {
        document.querySelectorAll('.enhanced-risk-tab-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
          });
        });
      }

      function switchTab(tabName) {
        currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.enhanced-risk-tab-btn').forEach(btn => {
          btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
          btn.classList.add('border-transparent', 'text-gray-500');
        });
        
        document.querySelector(\`[data-tab="\${tabName}"]\`).classList.add('active', 'border-blue-500', 'text-blue-600');
        document.querySelector(\`[data-tab="\${tabName}"]\`).classList.remove('border-transparent', 'text-gray-500');
        
        // Show/hide tab content
        document.querySelectorAll('.enhanced-risk-tab-content').forEach(content => {
          content.classList.add('hidden');
        });
        
        document.getElementById(\`\${tabName}-tab\`).classList.remove('hidden');
        
        // Load tab-specific data
        loadEnhancedTabData(tabName);
      }

      // Timeframe Selector Setup
      function setupTimeframeSelector() {
        document.getElementById('timeframe-selector').addEventListener('change', function() {
          currentTimeframe = this.value;
          refreshDashboard();
        });
      }

      // Enhanced Dashboard Refresh
      async function refreshDashboard() {
        console.log(\`🔄 Refreshing enhanced dashboard data (timeframe: \${currentTimeframe})...\`);
        
        try {
          // Show loading state
          showEnhancedLoadingState();
          
          // Call the correct API endpoints we implemented in threat-intelligence routes
          const [summaryResponse, serviceAnalysisResponse] = await Promise.all([
            fetch(\`/api/threat-intelligence/enhanced-risk-summary?timeframe=\${currentTimeframe}\`, {
              credentials: 'include'
            }),
            fetch(\`/api/threat-intelligence/service-risk-analysis?timeframe=\${currentTimeframe}\`, {
              credentials: 'include'
            })
          ]);
          
          if (!summaryResponse.ok) {
            throw new Error(\`Enhanced risk summary API failed: \${summaryResponse.status}\`);
          }
          
          if (!serviceAnalysisResponse.ok) {
            throw new Error(\`Service risk analysis API failed: \${serviceAnalysisResponse.status}\`);
          }
          
          const summaryData = await summaryResponse.json();
          const serviceData = await serviceAnalysisResponse.json();
          
          enhancedDashboardData = {
            summary: summaryData.data,
            service_analysis: serviceData.data,
            timestamp: new Date().toISOString()
          };
          
          console.log('📊 Enhanced dashboard data loaded:', enhancedDashboardData);
          
          // Update UI components
          updateEnhancedStatsCards();
          loadEnhancedTabData(currentTab);
          
        } catch (error) {
          console.error('❌ Enhanced dashboard refresh failed:', error);
          showEnhancedErrorState(error.message);
        }
      }

      // Update Enhanced Statistics Cards
      function updateEnhancedStatsCards() {
        const container = document.getElementById('enhanced-stats-cards');
        const summary = enhancedDashboardData.summary;
        
        container.innerHTML = \`
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-shield-virus text-red-600"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Security Triggers</p>
                <p class="text-2xl font-semibold text-gray-900">\${summary.security_triggers || 0}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-cogs text-blue-600"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Operational</p>
                <p class="text-2xl font-semibold text-gray-900">\${summary.operational_triggers || 0}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-clipboard-check text-purple-600"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Compliance</p>
                <p class="text-2xl font-semibold text-gray-900">\${summary.compliance_triggers || 0}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-chess-knight text-green-600"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Strategic</p>
                <p class="text-2xl font-semibold text-gray-900">\${summary.strategic_triggers || 0}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-brain text-indigo-600"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Correlations</p>
                <p class="text-2xl font-semibold text-gray-900">\${summary.total_correlations || 0}</p>
              </div>
            </div>
          </div>
        \`;
      }

      // Load Enhanced Tab Data
      function loadEnhancedTabData(tabName) {
        switch (tabName) {
          case 'security':
            loadSecurityTriggers();
            break;
          case 'operational':
            loadOperationalTriggers();
            break;
          case 'compliance':
            loadComplianceTriggers();
            break;
          case 'strategic':
            loadStrategicTriggers();
            break;
          case 'threat-intel':
            loadThreatIntelligence();
            break;
        }
      }

      // Load Security Triggers
      function loadSecurityTriggers() {
        const triggersContainer = document.getElementById('security-triggers-list');
        const summaryContainer = document.getElementById('security-summary');
        
        if (enhancedDashboardData && enhancedDashboardData.summary.security_risks) {
          const securityRisks = enhancedDashboardData.summary.security_risks;
          triggersContainer.innerHTML = securityRisks.length > 0 ?
            securityRisks.map(risk => createEnhancedRiskCard(risk, 'security')).join('') :
            '<p class="text-gray-500 text-sm">No recent security triggers</p>';
        } else {
          triggersContainer.innerHTML = '<p class="text-gray-500 text-sm">Loading security triggers...</p>';
        }
        
        // Load security summary
        summaryContainer.innerHTML = \`
          <div class="text-center py-4">
            <div class="text-sm text-gray-600">Security risk correlation active</div>
            <div class="text-xs text-gray-400 mt-1">Real-time monitoring enabled</div>
          </div>
        \`;
      }

      // Load Other Tab Types
      function loadOperationalTriggers() {
        const container = document.getElementById('operational-triggers-list');
        container.innerHTML = '<p class="text-gray-500 text-sm">Loading operational triggers...</p>';
        
        const analysisContainer = document.getElementById('service-risk-analysis');
        if (enhancedDashboardData && enhancedDashboardData.service_analysis) {
          const services = enhancedDashboardData.service_analysis.high_risk_services || [];
          analysisContainer.innerHTML = services.length > 0 ?
            services.map(service => createServiceRiskCard(service)).join('') :
            '<p class="text-gray-500 text-sm">No high-risk services detected</p>';
        }
      }

      function loadComplianceTriggers() {
        document.getElementById('compliance-triggers-list').innerHTML = '<p class="text-gray-500 text-sm">Loading compliance triggers...</p>';
        document.getElementById('compliance-summary').innerHTML = '<p class="text-gray-500 text-sm">Compliance analysis ready</p>';
      }

      function loadStrategicTriggers() {
        document.getElementById('strategic-triggers-list').innerHTML = '<p class="text-gray-500 text-sm">Loading strategic triggers...</p>';
        document.getElementById('strategic-summary').innerHTML = '<p class="text-gray-500 text-sm">Strategic intelligence monitoring</p>';
      }

      function loadThreatIntelligence() {
        document.getElementById('threat-intel-feeds').innerHTML = '<p class="text-gray-500 text-sm">Loading threat intelligence feeds...</p>';
        document.getElementById('correlation-engine').innerHTML = '<p class="text-gray-500 text-sm">Correlation engine active</p>';
      }

      // Create Enhanced Risk Card
      function createEnhancedRiskCard(risk, type) {
        const severityClass = getEnhancedSeverityClass(risk.confidence_score || risk.severity || 0.5);
        const iconClass = getIconClass(type);
        
        return \`
          <div class="enhanced-risk-item \${severityClass} bg-white rounded-lg p-4 cursor-pointer hover:shadow-md"
               onclick="viewEnhancedRiskDetails('\${risk.id || 'unknown'}', '\${type}')">
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 mt-1">
                  <i class="\${iconClass} text-gray-600"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">\${risk.title || risk.risk_name || 'Unknown Risk'}</p>
                  <p class="text-xs text-gray-500 mt-1">Confidence: \${((risk.confidence_score || risk.severity || 0.5) * 100).toFixed(0)}%</p>
                  <p class="text-xs text-gray-400 mt-1">\${formatTimeAgo(risk.created_at || risk.timestamp)}</p>
                </div>
              </div>
              <div class="flex-shrink-0">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  \${type}
                </span>
              </div>
            </div>
          </div>
        \`;
      }

      // Create Service Risk Card
      function createServiceRiskCard(service) {
        return \`
          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">\${service.service_name || 'Unknown Service'}</p>
                <p class="text-xs text-gray-500">Risk Score: \${(service.aggregate_risk_score || 0).toFixed(1)}</p>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-400">CIA: \${(service.cia_score || 0).toFixed(1)}</div>
                <div class="text-xs text-gray-400">Status: \${service.service_status || 'Unknown'}</div>
              </div>
            </div>
          </div>
        \`;
      }

      // Utility Functions
      function getEnhancedSeverityClass(score) {
        if (score >= 0.9) return 'severity-critical';
        if (score >= 0.7) return 'severity-high';
        if (score >= 0.5) return 'severity-medium';
        if (score >= 0.3) return 'severity-low';
        return 'severity-info';
      }

      function getIconClass(type) {
        const icons = {
          security: 'fas fa-shield-virus',
          operational: 'fas fa-cogs',
          compliance: 'fas fa-clipboard-check',
          strategic: 'fas fa-chess-knight',
          'threat-intel': 'fas fa-brain'
        };
        return icons[type] || 'fas fa-exclamation-triangle';
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

      // Enhanced Loading and Error States
      function showEnhancedLoadingState() {
        const containers = ['enhanced-stats-cards', 'security-triggers-list', 'operational-triggers-list'];
        containers.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-spinner fa-spin"></i> Loading enhanced data...</div>';
          }
        });
      }

      function showEnhancedErrorState(error) {
        const container = document.getElementById('enhanced-stats-cards');
        container.innerHTML = \`
          <div class="col-span-5 bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center space-x-3">
              <i class="fas fa-exclamation-triangle text-red-500"></i>
              <div>
                <p class="font-medium text-red-800">Enhanced Dashboard Load Error</p>
                <p class="text-sm text-red-600">\${error}</p>
                <p class="text-xs text-red-500 mt-1">Using enhanced threat intelligence API endpoints</p>
              </div>
            </div>
          </div>
        \`;
      }

      // Enhanced Test Functions
      async function testSecurityTrigger() {
        console.log('🔴 Testing security trigger...');
        
        const sampleData = {
          incident_id: 'SEC-TEST-' + Date.now(),
          incident_type: 'defender_alert',
          severity_score: 85,
          affected_assets: [
            { service_id: 1, asset_name: 'TEST-SERVER-01' }
          ],
          confidence: 0.9,
          indicators: ['test_trigger']
        };
        
        try {
          const response = await fetch('/api/threat-intelligence/dynamic-risks/security-trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(sampleData)
          });
          
          const result = await response.json();
          if (response.ok) {
            alert(\`✅ Security trigger processed: \${result.message}\`);
            refreshDashboard();
          } else {
            alert(\`❌ Security trigger failed: \${result.error}\`);
          }
        } catch (error) {
          alert(\`❌ Request failed: \${error.message}\`);
        }
      }

      async function testOperationalTrigger() {
        console.log('🔵 Testing operational trigger...');
        
        const sampleData = {
          service_id: 2,
          incident_type: 'capacity_warning',
          alert_type: 'performance_degradation',
          impact_scope: 'service',
          estimated_impact_hours: 1,
          recurrence_count: 1
        };
        
        try {
          const response = await fetch('/api/threat-intelligence/dynamic-risks/operational-trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(sampleData)
          });
          
          const result = await response.json();
          if (response.ok) {
            alert(\`✅ Operational trigger processed: \${result.message}\`);
            refreshDashboard();
          } else {
            alert(\`❌ Operational trigger failed: \${result.error}\`);
          }
        } catch (error) {
          alert(\`❌ Request failed: \${error.message}\`);
        }
      }

      async function testComplianceTrigger() {
        alert('🟣 Compliance trigger test - Implementation ready via /api/threat-intelligence/dynamic-risks/compliance-trigger');
      }

      async function testStrategicTrigger() {
        alert('🟢 Strategic trigger test - Implementation ready via /api/threat-intelligence/dynamic-risks/strategic-trigger');
      }

      function refreshThreatIntelligence() {
        alert('🧠 Threat intelligence refresh - Enhanced correlation engine active');
      }

      function viewEnhancedRiskDetails(riskId, type) {
        console.log(\`Viewing enhanced risk details: \${riskId} (\${type})\`);
        alert(\`Enhanced Risk Analysis for \${type.toUpperCase()} Risk ID: \${riskId}\\n\\nCorrelation engine and detailed analysis available.\`);
      }

      function viewCorrelationMatrix() {
        const container = document.getElementById('enhanced-correlation-analysis');
        container.innerHTML = \`
          <div class="text-center py-8">
            <i class="fas fa-network-wired text-4xl text-blue-500 mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Enhanced Risk Correlation Matrix</h3>
            <p class="text-gray-600 mb-4">Multi-dimensional risk relationship analysis</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="text-sm font-medium text-blue-800">Security ↔ Operational</div>
                <div class="text-xs text-blue-600">Active correlations detected</div>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg">
                <div class="text-sm font-medium text-purple-800">Compliance ↔ Strategic</div>
                <div class="text-xs text-purple-600">Monitoring relationships</div>
              </div>
              <div class="bg-indigo-50 p-4 rounded-lg">
                <div class="text-sm font-medium text-indigo-800">Threat Intel ↔ All</div>
                <div class="text-xs text-indigo-600">Enhanced correlation engine</div>
              </div>
            </div>
          </div>
        \`;
      }
    </script>
  `;
}