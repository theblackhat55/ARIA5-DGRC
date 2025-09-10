/**
 * Phase 2 - Unified AI Orchestration Dashboard JavaScript
 * Integrated with ARIA5.1 Platform
 */

// Global state for Phase 2
window.Phase2Dashboard = {
  currentTab: 'overview',
  charts: {},
  data: {
    systemStatus: null,
    analytics: {},
    correlations: [],
    compliance: {},
    orchestration: {}
  },
  refreshInterval: null,
  activityFeed: []
};

// Initialize Phase 2 dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Phase 2 AI Orchestration Dashboard Initializing...');
  
  // Hide loading state once initialized
  const loadingState = document.getElementById('phase2-loading-state');
  if (loadingState) {
    setTimeout(() => {
      loadingState.style.display = 'none';
    }, 1000);
  }
  
  // Setup tab navigation
  setupPhase2TabNavigation();
  
  // Load initial dashboard data
  loadPhase2DashboardData();
  
  // Setup event listeners
  setupPhase2EventListeners();
  
  // Start auto-refresh and activity feed
  startPhase2AutoRefresh();
  startPhase2ActivityFeed();
});

/**
 * Tab Navigation System for Phase 2
 */
function setupPhase2TabNavigation() {
  const tabs = document.querySelectorAll('.phase2-tab');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetTab = this.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => {
        t.classList.remove('border-purple-500', 'text-purple-600');
        t.classList.add('border-transparent', 'text-gray-500');
        t.classList.remove('active');
      });
      
      this.classList.remove('border-transparent', 'text-gray-500');
      this.classList.add('border-purple-500', 'text-purple-600', 'active');
      
      // Update content visibility
      contents.forEach(content => {
        content.classList.add('hidden');
      });
      
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) {
        targetContent.classList.remove('hidden');
        window.Phase2Dashboard.currentTab = targetTab;
        
        // Load tab-specific data
        loadPhase2TabContent(targetTab);
      }
    });
  });
  
  // Show initial tab
  document.querySelector('.tab-content').classList.remove('hidden');
}

/**
 * Event Listeners Setup for Phase 2
 */
function setupPhase2EventListeners() {
  // Execute Full Analysis Button
  const executeFullAnalysisBtn = document.getElementById('execute-full-analysis-btn');
  if (executeFullAnalysisBtn) {
    executeFullAnalysisBtn.addEventListener('click', executePhase2FullAnalysis);
  }
}

/**
 * Load Phase 2 Dashboard Data
 */
async function loadPhase2DashboardData() {
  try {
    console.log('📊 Loading Phase 2 dashboard data...');
    
    // Load system status
    await loadPhase2SystemStatus();
    
    // Load AI performance metrics
    await loadPhase2Metrics();
    
    // Load AI insights
    await loadPhase2AIInsights();
    
    // Load automated actions
    await loadPhase2AutomatedActions();
    
  } catch (error) {
    console.error('❌ Error loading Phase 2 dashboard data:', error);
    showPhase2ErrorAlert('Failed to load dashboard data: ' + error.message);
  }
}

/**
 * Load Phase 2 System Status
 */
async function loadPhase2SystemStatus() {
  try {
    const response = await fetch('/api/phase2/orchestration/system-status');
    const result = await response.json();
    
    window.Phase2Dashboard.data.systemStatus = result.data;
    
    // Update system health indicator
    const statusElement = document.getElementById('phase2-system-status');
    if (statusElement && result.success) {
      const health = result.data;
      const isHealthy = health.overall_health >= 80;
      
      statusElement.innerHTML = `
        <div class="w-3 h-3 rounded-full ${isHealthy ? 'bg-green-400' : 'bg-yellow-400'} mr-2"></div>
        <span class="text-sm text-white">
          ${isHealthy ? 'AI Systems Healthy' : 'Systems Degraded'} (${Math.round(health.overall_health)}%)
        </span>
      `;
    }
    
  } catch (error) {
    console.error('❌ Error loading Phase 2 system status:', error);
  }
}

/**
 * Load Phase 2 Performance Metrics
 */
async function loadPhase2Metrics() {
  try {
    const [analyticsResponse, performanceResponse] = await Promise.all([
      fetch('/api/phase2/analytics/dashboard'),
      fetch('/api/phase2/orchestration/performance-metrics')
    ]);
    
    const analyticsResult = await analyticsResponse.json();
    const performanceResult = await performanceResponse.json();
    
    if (analyticsResult.success) {
      const analytics = analyticsResult.data.analytics;
      
      // Update metric displays
      updatePhase2Element('metric-ai-performance', `${Math.round(analytics.performance_metrics?.prediction_accuracy * 100 || 0)}%`);
      updatePhase2Element('metric-prediction-accuracy', `${Math.round(analytics.performance_metrics?.forecast_reliability * 100 || 0)}%`);
      updatePhase2Element('metric-threat-correlations', analytics.risk_predictions?.length || 0);
      updatePhase2Element('metric-compliance-score', `${Math.round(analytics.performance_metrics?.coverage_percentage || 0)}%`);
    }
    
  } catch (error) {
    console.error('❌ Error loading Phase 2 metrics:', error);
  }
}

/**
 * Load AI-Generated Insights
 */
async function loadPhase2AIInsights() {
  try {
    const response = await fetch('/api/phase2/analytics/dashboard');
    const result = await response.json();
    
    const insightsContainer = document.getElementById('ai-insights-content');
    if (!insightsContainer) return;
    
    if (result.success && result.data.analytics.recommendations) {
      const recommendations = result.data.analytics.recommendations;
      
      insightsContainer.innerHTML = `
        <div class="space-y-4">
          <div class="bg-red-50 border-l-4 border-red-400 p-4">
            <div class="flex items-center">
              <i class="fas fa-exclamation-circle text-red-400 mr-3"></i>
              <div>
                <p class="text-sm font-medium text-red-800">Immediate Actions Required</p>
                <div class="mt-2 text-sm text-red-700">
                  ${recommendations.immediate_actions.slice(0, 3).map(action => 
                    `<div class="flex items-center mt-1"><i class="fas fa-arrow-right text-xs mr-2"></i>${action}</div>`
                  ).join('')}
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div class="flex items-center">
              <i class="fas fa-lightbulb text-blue-400 mr-3"></i>
              <div>
                <p class="text-sm font-medium text-blue-800">Strategic Initiatives</p>
                <div class="mt-2 text-sm text-blue-700">
                  ${recommendations.strategic_initiatives.slice(0, 3).map(initiative => 
                    `<div class="flex items-center mt-1"><i class="fas fa-arrow-right text-xs mr-2"></i>${initiative}</div>`
                  ).join('')}
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-green-50 border-l-4 border-green-400 p-4">
            <div class="flex items-center">
              <i class="fas fa-dollar-sign text-green-400 mr-3"></i>
              <div>
                <p class="text-sm font-medium text-green-800">Investment Priorities</p>
                <div class="mt-2 text-sm text-green-700">
                  ${recommendations.investment_priorities.slice(0, 3).map(priority => 
                    `<div class="flex items-center mt-1"><i class="fas fa-arrow-right text-xs mr-2"></i>${priority}</div>`
                  ).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      insightsContainer.innerHTML = `
        <div class="text-center text-gray-500">
          <i class="fas fa-brain text-3xl text-gray-300 mb-3"></i>
          <p>Loading AI insights...</p>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('❌ Error loading AI insights:', error);
  }
}

/**
 * Load Automated Actions
 */
async function loadPhase2AutomatedActions() {
  try {
    const actionsContainer = document.getElementById('automated-actions-content');
    if (!actionsContainer) return;
    
    // Simulate automated actions data
    const automatedActions = [
      { action: 'Risk threshold exceeded - Alert sent', time: '2 min ago', type: 'alert' },
      { action: 'Evidence collection completed for SOC2', time: '15 min ago', type: 'compliance' },
      { action: 'Threat correlation detected and mitigated', time: '23 min ago', type: 'security' },
      { action: 'Predictive model updated with new data', time: '1 hour ago', type: 'analytics' }
    ];
    
    actionsContainer.innerHTML = automatedActions.map(action => `
      <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
        <div class="flex-shrink-0">
          <i class="fas fa-${getActionIcon(action.type)} text-${getActionColor(action.type)}-500"></i>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">${action.action}</p>
          <p class="text-xs text-gray-500">${action.time}</p>
        </div>
        <div class="flex-shrink-0">
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getActionColor(action.type)}-100 text-${getActionColor(action.type)}-800">
            ${action.type}
          </span>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('❌ Error loading automated actions:', error);
  }
}

/**
 * Execute Phase 2 Full Analysis
 */
async function executePhase2FullAnalysis() {
  const btn = document.getElementById('execute-full-analysis-btn');
  if (!btn) return;
  
  try {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Executing...';
    
    const response = await fetch('/api/phase2/orchestration/execute-full-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        priority: 'high',
        target_scope: 'all'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showPhase2SuccessAlert('Full Phase 2 analysis executed successfully!');
      addPhase2ActivityFeedItem('Full AI analysis completed successfully', 'success');
      
      // Refresh data after execution
      setTimeout(() => {
        loadPhase2DashboardData();
      }, 2000);
    } else {
      throw new Error(result.error || 'Execution failed');
    }
    
  } catch (error) {
    console.error('❌ Error executing Phase 2 full analysis:', error);
    showPhase2ErrorAlert('Failed to execute full analysis: ' + error.message);
    addPhase2ActivityFeedItem('Full AI analysis failed: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play mr-2"></i> Execute Full Analysis';
  }
}

/**
 * Load Tab-Specific Content
 */
function loadPhase2TabContent(tabName) {
  console.log(`📋 Loading Phase 2 content for tab: ${tabName}`);
  
  switch (tabName) {
    case 'predictive':
      loadPhase2PredictiveContent();
      break;
    case 'correlation':
      loadPhase2CorrelationContent();
      break;
    case 'compliance':
      loadPhase2ComplianceContent();
      break;
    case 'orchestration':
      loadPhase2OrchestrationContent();
      break;
  }
}

/**
 * Load Predictive Analytics Tab Content
 */
async function loadPhase2PredictiveContent() {
  const content = document.getElementById('predictive-content');
  if (!content) return;
  
  try {
    const response = await fetch('/api/phase2/analytics/risk-predictions');
    const result = await response.json();
    
    if (result.success && result.data.predictions) {
      const predictions = result.data.predictions;
      
      content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 class="text-lg font-medium text-purple-900 mb-4">Risk Trend Predictions</h4>
            <div class="space-y-4">
              ${predictions.slice(0, 3).map(prediction => `
                <div class="bg-white p-4 rounded border">
                  <div class="flex justify-between items-start mb-2">
                    <h5 class="font-medium text-gray-900">${prediction.service_name}</h5>
                    <span class="text-sm font-semibold ${getTrendColor(prediction.trend_direction)}">
                      ${prediction.trend_direction}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    Current Risk: ${prediction.current_risk_score?.toFixed(1) || 'N/A'}
                  </div>
                  <div class="mt-2">
                    ${prediction.recommended_actions?.slice(0, 2).map(action => `
                      <div class="text-xs text-gray-500 flex items-center">
                        <i class="fas fa-arrow-right mr-1"></i> ${action.action}
                      </div>
                    `).join('') || ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 class="text-lg font-medium text-blue-900 mb-4">Model Performance</h4>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-blue-700">Prediction Accuracy:</span>
                <span class="font-medium text-blue-900">${(result.data.model_performance?.accuracy * 100)?.toFixed(1) || 0}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">Coverage:</span>
                <span class="font-medium text-blue-900">${(result.data.model_performance?.prediction_coverage * 100)?.toFixed(1) || 0}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">Last Training:</span>
                <span class="font-medium text-blue-900">${formatTimestamp(result.data.model_performance?.last_training)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      content.innerHTML = '<div class="text-center text-gray-500">No predictive data available</div>';
    }
    
  } catch (error) {
    console.error('❌ Error loading predictive content:', error);
    content.innerHTML = '<div class="text-center text-red-500">Error loading predictive analytics</div>';
  }
}

/**
 * Load Threat Correlation Tab Content
 */
async function loadPhase2CorrelationContent() {
  const content = document.getElementById('correlation-content');
  if (!content) return;
  
  try {
    const [threatsResponse, incidentsResponse] = await Promise.all([
      fetch('/api/phase2/correlation/active-threats'),
      fetch('/api/phase2/correlation/incidents')
    ]);
    
    const threatsResult = await threatsResponse.json();
    const incidentsResult = await incidentsResponse.json();
    
    content.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
          <h4 class="text-lg font-medium text-red-900 mb-4">Active Threat Correlations</h4>
          <div class="space-y-3">
            ${threatsResult.success && threatsResult.data.active_threats?.length > 0 ? 
              threatsResult.data.active_threats.slice(0, 5).map(threat => `
                <div class="bg-white p-3 rounded border-l-4 border-red-500">
                  <div class="text-sm font-medium text-gray-900">${JSON.parse(threat.attack_pattern || '{}').pattern_name || 'Unknown Pattern'}</div>
                  <div class="text-xs text-gray-500">Risk Level: ${threat.risk_level}</div>
                  <div class="text-xs text-gray-500">${formatTimestamp(threat.created_at)}</div>
                </div>
              `).join('') : 
              '<div class="text-center text-gray-500">No active correlations detected</div>'
            }
          </div>
        </div>
        
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h4 class="text-lg font-medium text-orange-900 mb-4">Security Incidents</h4>
          <div class="space-y-3">
            ${incidentsResult.success && incidentsResult.data.incidents?.length > 0 ? 
              incidentsResult.data.incidents.slice(0, 5).map(incident => `
                <div class="bg-white p-3 rounded border-l-4 border-orange-500">
                  <div class="text-sm font-medium text-gray-900">${incident.incident_id}</div>
                  <div class="text-xs text-gray-500">Severity: ${incident.severity} | Status: ${incident.status}</div>
                  <div class="text-xs text-gray-500">${formatTimestamp(incident.created_at)}</div>
                </div>
              `).join('') : 
              '<div class="text-center text-gray-500">No recent incidents</div>'
            }
          </div>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('❌ Error loading correlation content:', error);
    content.innerHTML = '<div class="text-center text-red-500">Error loading threat correlation data</div>';
  }
}

/**
 * Load Compliance Intelligence Tab Content
 */
async function loadPhase2ComplianceContent() {
  const content = document.getElementById('compliance-content');
  if (!content) return;
  
  try {
    const [gapResponse, monitoringResponse] = await Promise.all([
      fetch('/api/phase2/compliance/gap-analysis'),
      fetch('/api/phase2/compliance/monitoring')
    ]);
    
    const gapResult = await gapResponse.json();
    const monitoringResult = await monitoringResponse.json();
    
    content.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 class="text-lg font-medium text-green-900 mb-4">Compliance Gap Analysis</h4>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-green-700">Overall Compliance Score:</span>
              <span class="font-medium text-green-900">${(gapResult.data?.overall_compliance_score || 0).toFixed(1)}%</span>
            </div>
            <div class="space-y-2">
              ${gapResult.success && gapResult.data?.priority_recommendations?.slice(0, 3).map(rec => `
                <div class="text-sm text-green-700 flex items-start">
                  <i class="fas fa-arrow-right mt-1 mr-2 text-xs"></i>
                  <span>${rec}</span>
                </div>
              `).join('') || '<div class="text-center text-gray-500">No recommendations available</div>'}
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 class="text-lg font-medium text-yellow-900 mb-4">Compliance Monitoring</h4>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-yellow-700">Active Monitors:</span>
              <span class="font-medium text-yellow-900">${monitoringResult.data?.monitoring_status?.active_monitors || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-yellow-700">Alerts Generated:</span>
              <span class="font-medium text-yellow-900">${monitoringResult.data?.monitoring_status?.alerts_generated || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-yellow-700">Compliance Drift:</span>
              <span class="font-medium ${monitoringResult.data?.monitoring_status?.compliance_drift_detected ? 'text-red-600' : 'text-green-600'}">
                ${monitoringResult.data?.monitoring_status?.compliance_drift_detected ? 'Detected' : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('❌ Error loading compliance content:', error);
    content.innerHTML = '<div class="text-center text-red-500">Error loading compliance intelligence</div>';
  }
}

/**
 * Load System Orchestration Tab Content
 */
async function loadPhase2OrchestrationContent() {
  const content = document.getElementById('orchestration-content');
  if (!content) return;
  
  try {
    const response = await fetch('/api/phase2/orchestration/performance-metrics');
    const result = await response.json();
    
    if (result.success) {
      const metrics = result.data;
      
      content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 class="text-lg font-medium text-blue-900 mb-4">System Performance</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-blue-700">Total Executions:</span>
                <span class="font-medium text-blue-900">${metrics.total_executions || 0}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">Avg Duration:</span>
                <span class="font-medium text-blue-900">${(metrics.avg_duration_ms || 0).toFixed(0)}ms</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">Success Rate:</span>
                <span class="font-medium text-blue-900">${(metrics.avg_success_rate || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 class="text-lg font-medium text-purple-900 mb-4">Efficiency Metrics</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-purple-700">System Efficiency:</span>
                <span class="font-medium text-purple-900">${(metrics.system_efficiency || 0).toFixed(1)}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-purple-700">24h Executions:</span>
                <span class="font-medium text-purple-900">${metrics.executions_24h || 0}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h4 class="text-lg font-medium text-indigo-900 mb-4">Trend Analysis</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-indigo-700">Performance:</span>
                <span class="font-medium text-indigo-900">${metrics.trend_analysis?.performance_trend || 'stable'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-indigo-700">Reliability:</span>
                <span class="font-medium text-indigo-900">${metrics.trend_analysis?.reliability_trend || 'stable'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-indigo-700">Usage:</span>
                <span class="font-medium text-indigo-900">${metrics.trend_analysis?.usage_trend || 'stable'}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      content.innerHTML = '<div class="text-center text-gray-500">No orchestration metrics available</div>';
    }
    
  } catch (error) {
    console.error('❌ Error loading orchestration content:', error);
    content.innerHTML = '<div class="text-center text-red-500">Error loading orchestration metrics</div>';
  }
}

/**
 * Start Phase 2 Auto Refresh System
 */
function startPhase2AutoRefresh() {
  window.Phase2Dashboard.refreshInterval = setInterval(() => {
    loadPhase2SystemStatus();
    loadPhase2Metrics();
    
    // Only refresh current tab to avoid disrupting user work
    if (window.Phase2Dashboard.currentTab === 'overview') {
      loadPhase2AIInsights();
      loadPhase2AutomatedActions();
    }
  }, 45000); // 45 seconds
}

/**
 * Start Phase 2 Activity Feed
 */
function startPhase2ActivityFeed() {
  const feedElement = document.getElementById('ai-activity-feed');
  if (!feedElement) return;
  
  // Initialize with some activity
  addPhase2ActivityFeedItem('Phase 2 AI Orchestration System initialized', 'info');
  addPhase2ActivityFeedItem('Predictive analytics engine online', 'success');
  addPhase2ActivityFeedItem('Threat correlation monitoring active', 'info');
  
  // Simulate periodic activity
  setInterval(() => {
    const activities = [
      { text: 'Risk prediction model updated', type: 'info' },
      { text: 'Compliance evidence collected automatically', type: 'success' },
      { text: 'Threat correlation detected and analyzed', type: 'warning' },
      { text: 'AI recommendation generated', type: 'info' },
      { text: 'Performance metrics refreshed', type: 'info' }
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    addPhase2ActivityFeedItem(randomActivity.text, randomActivity.type);
  }, 30000); // Every 30 seconds
}

/**
 * Add item to Phase 2 activity feed
 */
function addPhase2ActivityFeedItem(message, type = 'info') {
  const feedElement = document.getElementById('ai-activity-feed');
  if (!feedElement) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const color = getActivityColor(type);
  
  const activityItem = `[${timestamp}] ${getActivityIcon(type)} ${message}`;
  
  // Add to beginning of feed
  window.Phase2Dashboard.activityFeed.unshift(activityItem);
  
  // Keep only last 20 items
  if (window.Phase2Dashboard.activityFeed.length > 20) {
    window.Phase2Dashboard.activityFeed.pop();
  }
  
  // Update display
  feedElement.innerHTML = window.Phase2Dashboard.activityFeed
    .map(item => `<div class="text-green-400">${item}</div>`)
    .join('');
}

/**
 * Utility Functions for Phase 2
 */
function updatePhase2Element(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function showPhase2SuccessAlert(message) {
  console.log('✅ Phase 2 Success:', message);
  addPhase2ActivityFeedItem(message, 'success');
}

function showPhase2ErrorAlert(message) {
  console.error('❌ Phase 2 Error:', message);
  addPhase2ActivityFeedItem('ERROR: ' + message, 'error');
}

function getActionIcon(type) {
  const icons = {
    alert: 'exclamation-triangle',
    compliance: 'clipboard-check',
    security: 'shield-alt',
    analytics: 'chart-line'
  };
  return icons[type] || 'info-circle';
}

function getActionColor(type) {
  const colors = {
    alert: 'red',
    compliance: 'green',
    security: 'blue',
    analytics: 'purple'
  };
  return colors[type] || 'gray';
}

function getTrendColor(direction) {
  const colors = {
    increasing: 'text-red-600',
    decreasing: 'text-green-600',
    stable: 'text-gray-600'
  };
  return colors[direction] || 'text-gray-600';
}

function getActivityColor(type) {
  const colors = {
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    info: 'text-blue-400'
  };
  return colors[type] || 'text-green-400';
}

function getActivityIcon(type) {
  const icons = {
    success: 'AI-SUCCESS',
    warning: 'AI-WARNING',
    error: 'AI-ERROR',
    info: 'AI-INFO'
  };
  return icons[type] || 'AI-INFO';
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.Phase2Dashboard.refreshInterval) {
    clearInterval(window.Phase2Dashboard.refreshInterval);
  }
});

console.log('✅ Phase 2 AI Orchestration Dashboard JavaScript loaded successfully');