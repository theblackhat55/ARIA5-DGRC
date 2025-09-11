/**
 * Dynamic Risk Analysis Dashboard Component
 * Displays real-time cybersecurity and operational risk analysis
 */

export function createDynamicRiskDashboard() {
  return `
    <div class="space-y-6">
      <!-- Dashboard Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dynamic Risk Analysis</h1>
          <p class="text-gray-600">Real-time cybersecurity and operational risk intelligence</p>
        </div>
        
        <!-- Refresh Controls -->
        <div class="flex space-x-3">
          <select id="timeframe-selector" class="border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <option value="1h">Last Hour</option>
            <option value="24h" selected>Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          
          <button id="refresh-dashboard" 
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <i class="fas fa-sync-alt"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Risk Pipeline Overview -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-yellow-800">Detected</p>
              <p id="detected-count" class="text-2xl font-bold text-yellow-900">-</p>
            </div>
            <i class="fas fa-exclamation-triangle text-yellow-400 text-xl"></i>
          </div>
        </div>
        
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-800">Draft</p>
              <p id="draft-count" class="text-2xl font-bold text-blue-900">-</p>
            </div>
            <i class="fas fa-edit text-blue-400 text-xl"></i>
          </div>
        </div>
        
        <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-800">Validated</p>
              <p id="validated-count" class="text-2xl font-bold text-green-900">-</p>
            </div>
            <i class="fas fa-check-circle text-green-400 text-xl"></i>
          </div>
        </div>
        
        <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-red-800">Active</p>
              <p id="active-count" class="text-2xl font-bold text-red-900">-</p>
            </div>
            <i class="fas fa-fire text-red-400 text-xl"></i>
          </div>
        </div>
        
        <div class="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-800">Retired</p>
              <p id="retired-count" class="text-2xl font-bold text-gray-900">-</p>
            </div>
            <i class="fas fa-archive text-gray-400 text-xl"></i>
          </div>
        </div>
      </div>

      <!-- Risk Category Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Cybersecurity Risks -->
        <div class="bg-white p-6 rounded-lg shadow border">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-shield-alt text-red-500 mr-2"></i>
              Cybersecurity Risks
            </h2>
            <span id="security-risk-count" class="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">0</span>
          </div>
          
          <div id="security-risks-list" class="space-y-3">
            <!-- Dynamic content populated via JavaScript -->
          </div>
          
          <!-- Security Risk Actions -->
          <div class="mt-4 flex space-x-2">
            <button id="trigger-cve-analysis" 
                    class="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700">
              <i class="fas fa-bug mr-1"></i>
              Test CVE Trigger
            </button>
            <button id="trigger-incident-analysis" 
                    class="flex-1 bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700">
              <i class="fas fa-exclamation-circle mr-1"></i>
              Test Incident
            </button>
          </div>
        </div>

        <!-- Operational Risks -->
        <div class="bg-white p-6 rounded-lg shadow border">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-cogs text-blue-500 mr-2"></i>
              Operational Risks
            </h2>
            <span id="operational-risk-count" class="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">0</span>
          </div>
          
          <div id="operational-risks-list" class="space-y-3">
            <!-- Dynamic content populated via JavaScript -->
          </div>
          
          <!-- Operational Risk Actions -->
          <div class="mt-4 flex space-x-2">
            <button id="trigger-service-incident" 
                    class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
              <i class="fas fa-server mr-1"></i>
              Test Service Issue
            </button>
            <button id="trigger-change-risk" 
                    class="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700">
              <i class="fas fa-exchange-alt mr-1"></i>
              Test Change Risk
            </button>
          </div>
        </div>
      </div>

      <!-- Placeholder Risk Types -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Compliance Risks (Placeholder) -->
        <div class="bg-white p-6 rounded-lg shadow border opacity-60">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-clipboard-check text-green-500 mr-2"></i>
              Compliance Risks
            </h2>
            <span class="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">Coming Soon</span>
          </div>
          
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-construction text-4xl mb-2"></i>
            <p class="text-sm">Implementation pending</p>
          </div>
        </div>

        <!-- Financial Risks (Placeholder) -->
        <div class="bg-white p-6 rounded-lg shadow border opacity-60">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-dollar-sign text-yellow-500 mr-2"></i>
              Financial Risks
            </h2>
            <span class="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">Coming Soon</span>
          </div>
          
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-construction text-4xl mb-2"></i>
            <p class="text-sm">Implementation pending</p>
          </div>
        </div>

        <!-- Strategic Risks (Placeholder) -->
        <div class="bg-white p-6 rounded-lg shadow border opacity-60">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-chess text-purple-500 mr-2"></i>
              Strategic Risks
            </h2>
            <span class="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">Coming Soon</span>
          </div>
          
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-construction text-4xl mb-2"></i>
            <p class="text-sm">Implementation pending</p>
          </div>
        </div>
      </div>

      <!-- Recent Risk Correlations -->
      <div class="bg-white p-6 rounded-lg shadow border">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          <i class="fas fa-project-diagram text-indigo-500 mr-2"></i>
          Recent Risk Correlations
        </h2>
        
        <div id="risk-correlations" class="space-y-3">
          <!-- Dynamic content populated via JavaScript -->
        </div>
      </div>

      <!-- Risk Analysis Actions -->
      <div class="bg-white p-6 rounded-lg shadow border">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          <i class="fas fa-tools text-gray-500 mr-2"></i>
          Risk Analysis Tools
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button id="bulk-risk-analysis" 
                  class="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 flex flex-col items-center">
            <i class="fas fa-layer-group text-xl mb-2"></i>
            <span class="text-sm">Bulk Analysis</span>
          </button>
          
          <button id="correlation-analysis" 
                  class="bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 flex flex-col items-center">
            <i class="fas fa-sitemap text-xl mb-2"></i>
            <span class="text-sm">Correlation Analysis</span>
          </button>
          
          <button id="export-analysis" 
                  class="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 flex flex-col items-center">
            <i class="fas fa-download text-xl mb-2"></i>
            <span class="text-sm">Export Data</span>
          </button>
          
          <button id="schedule-analysis" 
                  class="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex flex-col items-center">
            <i class="fas fa-clock text-xl mb-2"></i>
            <span class="text-sm">Schedule Analysis</span>
          </button>
        </div>
      </div>
    </div>

    <!-- JavaScript for Dynamic Risk Dashboard -->
    <script>
      class DynamicRiskDashboard {
        constructor() {
          this.currentTimeframe = '24h';
          this.refreshInterval = null;
          this.initializeEventListeners();
          this.loadDashboardData();
          this.startAutoRefresh();
        }

        initializeEventListeners() {
          // Refresh controls
          document.getElementById('refresh-dashboard').addEventListener('click', () => {
            this.loadDashboardData();
          });

          document.getElementById('timeframe-selector').addEventListener('change', (e) => {
            this.currentTimeframe = e.target.value;
            this.loadDashboardData();
          });

          // Test trigger buttons
          document.getElementById('trigger-cve-analysis').addEventListener('click', () => {
            this.triggerTestCVE();
          });

          document.getElementById('trigger-incident-analysis').addEventListener('click', () => {
            this.triggerTestIncident();
          });

          document.getElementById('trigger-service-incident').addEventListener('click', () => {
            this.triggerServiceIncident();
          });

          document.getElementById('trigger-change-risk').addEventListener('click', () => {
            this.triggerChangeRisk();
          });
        }

        async loadDashboardData() {
          try {
            const response = await fetch(\`/api/dynamic-risk-analysis/dashboard?timeframe=\${this.currentTimeframe}\`);
            const data = await response.json();

            this.updatePipelineStats(data.pipeline_statistics);
            this.updateRiskCategories(data.recent_risks_by_category || []);

          } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load dashboard data');
          }
        }

        updatePipelineStats(stats) {
          document.getElementById('detected-count').textContent = stats.detected || 0;
          document.getElementById('draft-count').textContent = stats.draft || 0;
          document.getElementById('validated-count').textContent = stats.validated || 0;
          document.getElementById('active-count').textContent = stats.active || 0;
          document.getElementById('retired-count').textContent = stats.retired || 0;
        }

        updateRiskCategories(riskData) {
          const securityRisks = riskData.filter(risk => risk.category === 'security');
          const operationalRisks = riskData.filter(risk => risk.category === 'operational');

          document.getElementById('security-risk-count').textContent = securityRisks.length;
          document.getElementById('operational-risk-count').textContent = operationalRisks.length;

          // Update risk lists
          this.updateRiskList('security-risks-list', securityRisks);
          this.updateRiskList('operational-risks-list', operationalRisks);
        }

        updateRiskList(elementId, risks) {
          const container = document.getElementById(elementId);
          
          if (risks.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No recent risks detected</p>';
            return;
          }

          container.innerHTML = risks.map(risk => \`
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div class="flex-1">
                <p class="font-medium text-sm text-gray-900">\${risk.dynamic_state || 'Unknown'}</p>
                <p class="text-xs text-gray-600">Confidence: \${(risk.confidence_score * 100).toFixed(0)}%</p>
              </div>
              <div class="text-right">
                <span class="text-sm font-medium text-gray-900">\${risk.count}</span>
                <p class="text-xs text-gray-500">risks</p>
              </div>
            </div>
          \`).join('');
        }

        async triggerTestCVE() {
          try {
            const response = await fetch('/api/dynamic-risk-analysis/security/cve-trigger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cve_id: 'CVE-2024-TEST',
                cvss_score: 8.5,
                kev_status: true,
                affected_assets: [{ service_id: 1 }]
              })
            });

            const result = await response.json();
            if (result.success) {
              this.showSuccess('Test CVE analysis triggered successfully');
              setTimeout(() => this.loadDashboardData(), 1000);
            } else {
              this.showError('Failed to trigger CVE analysis');
            }
          } catch (error) {
            this.showError('Failed to trigger CVE analysis');
          }
        }

        async triggerTestIncident() {
          try {
            const response = await fetch('/api/dynamic-risk-analysis/security/incident-trigger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                incident_id: 'INC-TEST-' + Date.now(),
                severity_score: 85,
                incident_type: 'defender_incident',
                affected_assets: [{ service_id: 1 }]
              })
            });

            const result = await response.json();
            if (result.success) {
              this.showSuccess('Test security incident triggered successfully');
              setTimeout(() => this.loadDashboardData(), 1000);
            } else {
              this.showError('Failed to trigger security incident');
            }
          } catch (error) {
            this.showError('Failed to trigger security incident');
          }
        }

        async triggerServiceIncident() {
          try {
            const response = await fetch('/api/dynamic-risk-analysis/operational/service-incident', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                service_id: 1,
                incident_type: 'servicenow_incidents',
                incident_id: 'SVC-TEST-' + Date.now(),
                recurrence_count: 2,
                business_impact_hours: 2
              })
            });

            const result = await response.json();
            if (result.success) {
              this.showSuccess('Test service incident triggered successfully');
              setTimeout(() => this.loadDashboardData(), 1000);
            } else {
              this.showError('Failed to trigger service incident');
            }
          } catch (error) {
            this.showError('Failed to trigger service incident');
          }
        }

        async triggerChangeRisk() {
          try {
            // This would trigger change management risk analysis
            this.showInfo('Change risk analysis - Implementation pending');
          } catch (error) {
            this.showError('Failed to trigger change risk analysis');
          }
        }

        startAutoRefresh() {
          // Refresh every 30 seconds
          this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
          }, 30000);
        }

        showSuccess(message) {
          // Implementation for success notifications
          console.log('Success:', message);
        }

        showError(message) {
          // Implementation for error notifications
          console.error('Error:', message);
        }

        showInfo(message) {
          // Implementation for info notifications
          console.log('Info:', message);
        }
      }

      // Initialize the dashboard when DOM is ready
      document.addEventListener('DOMContentLoaded', () => {
        new DynamicRiskDashboard();
      });
    </script>
  `;
}