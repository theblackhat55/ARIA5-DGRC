/**
 * Phase 1 Dynamic Risk Intelligence Dashboard JavaScript
 * Integrated with ARIA5.1 Platform
 */

// Global state and constants
window.Phase1Dashboard = {
  currentTab: 'overview',
  charts: {},
  data: {
    services: [],
    metrics: {},
    systemHealth: null
  },
  refreshInterval: null
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Phase 1 Dashboard Initializing...');
  
  // Hide loading state once initialized
  const loadingState = document.getElementById('loading-state');
  if (loadingState) {
    setTimeout(() => {
      loadingState.style.display = 'none';
    }, 1000);
  }
  
  // Setup tab navigation
  setupTabNavigation();
  
  // Load initial data
  loadDashboardData();
  
  // Setup event listeners
  setupEventListeners();
  
  // Start auto-refresh
  startAutoRefresh();
});

/**
 * Tab Navigation System
 */
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.phase1-tab');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetTab = this.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => {
        t.classList.remove('border-blue-500', 'text-blue-600');
        t.classList.add('border-transparent', 'text-gray-500');
        t.classList.remove('active');
      });
      
      this.classList.remove('border-transparent', 'text-gray-500');
      this.classList.add('border-blue-500', 'text-blue-600', 'active');
      
      // Update content visibility
      contents.forEach(content => {
        content.classList.add('hidden');
      });
      
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) {
        targetContent.classList.remove('hidden');
        window.Phase1Dashboard.currentTab = targetTab;
        
        // Load tab-specific data
        loadTabContent(targetTab);
      }
    });
  });
  
  // Show initial tab
  document.querySelector('.tab-content').classList.remove('hidden');
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
  // Execute Cycle Button
  const executeCycleBtn = document.getElementById('execute-cycle-btn');
  if (executeCycleBtn) {
    executeCycleBtn.addEventListener('click', executeDynamicRiskCycle);
  }
}

/**
 * Load Dashboard Data
 */
async function loadDashboardData() {
  try {
    console.log('📊 Loading Phase 1 dashboard data...');
    
    // Load system health
    await loadSystemHealth();
    
    // Load metrics
    await loadMetrics();
    
    // Load services data
    await loadServicesRiskData();
    
    // Initialize charts
    initializeCharts();
    
  } catch (error) {
    console.error('❌ Error loading dashboard data:', error);
    showErrorAlert('Failed to load dashboard data: ' + error.message);
  }
}

/**
 * System Health Status
 */
async function loadSystemHealth() {
  try {
    const response = await fetch('/api/dynamic-risk/system/health');
    const result = await response.json();
    
    window.Phase1Dashboard.data.systemHealth = result.data;
    
    // Update health indicator
    const healthStatus = document.getElementById('system-health-status');
    if (healthStatus && result.success) {
      const health = result.data;
      const isHealthy = health.overall_health_score >= 0.8;
      
      healthStatus.innerHTML = `
        <div class="w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-yellow-500'} mr-2"></div>
        <span class="text-sm ${isHealthy ? 'text-green-600' : 'text-yellow-600'}">
          ${isHealthy ? 'System Healthy' : 'System Degraded'} (${Math.round(health.overall_health_score * 100)}%)
        </span>
      `;
    }
    
  } catch (error) {
    console.error('❌ Error loading system health:', error);
  }
}

/**
 * Load Key Metrics
 */
async function loadMetrics() {
  try {
    const response = await fetch('/api/dynamic-risk/system/metrics');
    const result = await response.json();
    
    if (result.success) {
      const metrics = result.data;
      window.Phase1Dashboard.data.metrics = metrics;
      
      // Update metric displays
      updateElement('metric-discovery', `${metrics.automation_rate || 0}%`);
      updateElement('metric-latency', `${metrics.avg_processing_time || 0} min`);
      updateElement('metric-approval', `${metrics.approval_efficiency || 0}%`);
      updateElement('metric-services', metrics.total_services || 0);
    }
    
  } catch (error) {
    console.error('❌ Error loading metrics:', error);
  }
}

/**
 * Load Services Risk Data
 */
async function loadServicesRiskData() {
  try {
    const response = await fetch('/api/dynamic-risk/services/risk-assessment');
    const result = await response.json();
    
    if (result.success && result.data) {
      window.Phase1Dashboard.data.services = result.data;
      updateServicesTable();
    }
    
  } catch (error) {
    console.error('❌ Error loading services risk data:', error);
  }
}

/**
 * Update Services Risk Table
 */
function updateServicesTable() {
  const tbody = document.getElementById('services-risk-table');
  if (!tbody) return;
  
  const services = window.Phase1Dashboard.data.services;
  
  if (!services || services.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-8 text-center text-gray-500">
          <i class="fas fa-server text-3xl text-gray-300 mb-2"></i>
          <div>No services found. Execute a risk discovery cycle to populate services.</div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = services.map(service => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-${getRiskColor(service.risk_score)}-100 rounded-lg flex items-center justify-center mr-3">
            <i class="fas fa-server text-${getRiskColor(service.risk_score)}-600"></i>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-900">${service.name}</div>
            <div class="text-sm text-gray-500">${service.description || 'No description'}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getRiskColor(service.risk_score)}-100 text-${getRiskColor(service.risk_score)}-800">
            ${service.risk_score ? service.risk_score.toFixed(1) : 'N/A'}
          </span>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div class="space-y-1">
          <div class="text-xs">C: ${service.confidentiality || 0}/10</div>
          <div class="text-xs">I: ${service.integrity || 0}/10</div>
          <div class="text-xs">A: ${service.availability || 0}/10</div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center text-sm ${service.trend === 'up' ? 'text-red-600' : service.trend === 'down' ? 'text-green-600' : 'text-gray-500'}">
          <i class="fas fa-arrow-${service.trend === 'up' ? 'up' : service.trend === 'down' ? 'down' : 'right'} mr-1"></i>
          ${service.trend || 'stable'}
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${service.asset_count || 0} assets
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onclick="viewServiceDetails('${service.id}')" class="text-blue-600 hover:text-blue-900 mr-2">
          View
        </button>
        <button onclick="analyzeServiceRisk('${service.id}')" class="text-purple-600 hover:text-purple-900">
          Analyze
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Initialize Charts
 */
function initializeCharts() {
  try {
    initializeRiskDistributionChart();
    initializeRiskTrendChart();
  } catch (error) {
    console.error('❌ Error initializing charts:', error);
  }
}

/**
 * Risk Distribution Chart
 */
function initializeRiskDistributionChart() {
  const canvas = document.getElementById('risk-distribution-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Sample data - will be replaced with real data
  const data = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [12, 23, 45, 67],
      backgroundColor: [
        'rgb(239, 68, 68)',   // red-500
        'rgb(245, 158, 11)',  // amber-500
        'rgb(59, 130, 246)',  // blue-500
        'rgb(34, 197, 94)'    // green-500
      ],
      borderColor: [
        'rgb(220, 38, 38)',   // red-600
        'rgb(217, 119, 6)',   // amber-600
        'rgb(37, 99, 235)',   // blue-600
        'rgb(22, 163, 74)'    // green-600
      ],
      borderWidth: 1
    }]
  };
  
  window.Phase1Dashboard.charts.riskDistribution = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        }
      }
    }
  });
}

/**
 * Risk Trend Chart
 */
function initializeRiskTrendChart() {
  const canvas = document.getElementById('risk-trend-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Sample data - will be replaced with real data
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Risk Score',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };
  
  window.Phase1Dashboard.charts.riskTrend = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Execute Dynamic Risk Cycle
 */
async function executeDynamicRiskCycle() {
  const btn = document.getElementById('execute-cycle-btn');
  if (!btn) return;
  
  try {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Executing...';
    
    const response = await fetch('/api/dynamic-risk/orchestrator/execute-cycle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: 'full',
        priority: 'high'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showSuccessAlert('Dynamic risk cycle executed successfully!');
      // Refresh data after execution
      setTimeout(() => {
        loadDashboardData();
      }, 2000);
    } else {
      throw new Error(result.error || 'Execution failed');
    }
    
  } catch (error) {
    console.error('❌ Error executing cycle:', error);
    showErrorAlert('Failed to execute risk cycle: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play mr-2"></i> Execute Cycle';
  }
}

/**
 * Load Tab Content
 */
function loadTabContent(tabName) {
  console.log(`📋 Loading content for tab: ${tabName}`);
  
  switch (tabName) {
    case 'discovery':
      loadDiscoveryContent();
      break;
    case 'services':
      loadServicesContent();
      break;
    case 'workflow':
      loadWorkflowContent();
      break;
    case 'analytics':
      loadAnalyticsContent();
      break;
  }
}

/**
 * Load Discovery Tab Content
 */
function loadDiscoveryContent() {
  const content = document.getElementById('discovery-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center mb-3">
          <i class="fas fa-search text-blue-600 mr-2"></i>
          <h4 class="text-lg font-medium text-blue-900">Discovery Engine Status</h4>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-blue-700">Automation Rate:</span>
            <span class="font-medium text-blue-900">90%+</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Last Discovery:</span>
            <span class="font-medium text-blue-900">2 hours ago</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Next Scheduled:</span>
            <span class="font-medium text-blue-900">In 4 hours</span>
          </div>
        </div>
      </div>
      
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center mb-3">
          <i class="fas fa-chart-line text-green-600 mr-2"></i>
          <h4 class="text-lg font-medium text-green-900">Discovery Metrics</h4>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-green-700">Risks Discovered Today:</span>
            <span class="font-medium text-green-900">23</span>
          </div>
          <div class="flex justify-between">
            <span class="text-green-700">ML Confidence:</span>
            <span class="font-medium text-green-900">94.2%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-green-700">Processing Time:</span>
            <span class="font-medium text-green-900">< 15 min</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Load Services Tab Content
 */
function loadServicesContent() {
  const content = document.getElementById('services-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="space-y-6">
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 class="text-lg font-medium text-purple-900 mb-3">Service-Centric Risk Scoring</h4>
        <p class="text-sm text-purple-700 mb-4">
          CIA triad-based risk scoring with cascading impact analysis across business services.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-900">156</div>
            <div class="text-sm text-purple-600">Services Monitored</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-900">23</div>
            <div class="text-sm text-purple-600">Critical Services</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-900">7.2</div>
            <div class="text-sm text-purple-600">Avg Risk Score</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Load Workflow Tab Content
 */
function loadWorkflowContent() {
  const content = document.getElementById('workflow-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="space-y-6">
      <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 class="text-lg font-medium text-indigo-900 mb-3">ML-Powered Risk Approval</h4>
        <p class="text-sm text-indigo-700 mb-4">
          Automated risk approval workflow with machine learning confidence scoring.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-900">89%</div>
            <div class="text-sm text-indigo-600">Auto-Approval Rate</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-900">12</div>
            <div class="text-sm text-indigo-600">Pending Review</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-900">2.3 min</div>
            <div class="text-sm text-indigo-600">Avg Processing</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Load Analytics Tab Content
 */
function loadAnalyticsContent() {
  const content = document.getElementById('analytics-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="space-y-6">
      <div class="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <h4 class="text-lg font-medium text-teal-900 mb-3">Performance Analytics</h4>
        <p class="text-sm text-teal-700 mb-4">
          Real-time performance metrics and trend analysis for Phase 1 operations.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-teal-900">94.2%</div>
            <div class="text-sm text-teal-600">System Efficiency</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-teal-900">12.7s</div>
            <div class="text-sm text-teal-600">Avg Response Time</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-teal-900">1,247</div>
            <div class="text-sm text-teal-600">Events/Hour</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-teal-900">99.7%</div>
            <div class="text-sm text-teal-600">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Auto Refresh System
 */
function startAutoRefresh() {
  window.Phase1Dashboard.refreshInterval = setInterval(() => {
    loadSystemHealth();
    loadMetrics();
    
    // Only refresh services on overview tab to avoid disrupting user work
    if (window.Phase1Dashboard.currentTab === 'overview') {
      loadServicesRiskData();
    }
  }, 30000); // 30 seconds
}

/**
 * Utility Functions
 */
function getRiskColor(score) {
  if (score >= 8) return 'red';
  if (score >= 6) return 'orange';
  if (score >= 4) return 'yellow';
  return 'green';
}

function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function showSuccessAlert(message) {
  console.log('✅ Success:', message);
  // Could implement toast notifications here
}

function showErrorAlert(message) {
  console.error('❌ Error:', message);
  // Could implement toast notifications here
}

// Service interaction functions (called from buttons)
window.viewServiceDetails = function(serviceId) {
  console.log('📋 Viewing service details:', serviceId);
  // Could open modal or navigate to service details
};

window.analyzeServiceRisk = function(serviceId) {
  console.log('🔍 Analyzing service risk:', serviceId);
  // Could trigger risk analysis workflow
};

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.Phase1Dashboard.refreshInterval) {
    clearInterval(window.Phase1Dashboard.refreshInterval);
  }
});

console.log('✅ Phase 1 Dashboard JavaScript loaded successfully');