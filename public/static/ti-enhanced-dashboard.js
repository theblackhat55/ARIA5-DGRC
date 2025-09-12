// TI-Enhanced Dashboard JavaScript
// Handles real-time updates, TI feed management, and risk validation

class TIEnhancedDashboard {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
        this.wsConnection = null;
        this.init();
    }

    async init() {
        console.log('Initializing TI-Enhanced Dashboard...');
        
        // Load initial data
        await this.loadDashboardData();
        
        // Setup auto-refresh
        this.startAutoRefresh();
        
        // Initialize charts
        this.initializeCharts();
        
        // Setup WebSocket if available
        this.setupWebSocket();
        
        console.log('TI-Enhanced Dashboard initialized');
    }

    async loadDashboardData() {
        try {
            // Load key metrics
            await this.loadKeyMetrics();
            
            // Load TI-enhanced risks
            await this.loadTIEnhancedRisks();
            
            // Load TI feed status
            await this.loadTIFeedStatus();
            
            // Load validation queue
            await this.loadValidationQueue();
            
            // Load recent indicators
            await this.loadRecentIndicators();
            
            // Load service risk data
            await this.loadServiceRiskData();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showToast('Error loading dashboard data', 'error');
        }
    }

    async loadKeyMetrics() {
        try {
            const response = await axios.get('/api/enhanced-risk/status');
            if (response.data.success) {
                const stats = response.data.data.risk_statistics;
                
                document.getElementById('criticalAlerts').textContent = stats.detected_risks || 0;
                document.getElementById('tiEnhancedRisks').textContent = stats.ti_enriched_risks || 0;
                document.getElementById('pendingValidation').textContent = stats.pending_validation || 0;
                document.getElementById('activeRisks').textContent = stats.active_risks || 0;
            }
        } catch (error) {
            console.error('Error loading key metrics:', error);
        }
    }

    async loadTIEnhancedRisks() {
        try {
            const response = await axios.get('/api/threat-intelligence/dynamic-risks?limit=10');
            if (response.data.success) {
                const risks = response.data.data;
                this.renderRiskCards(risks);
            }
        } catch (error) {
            console.error('Error loading TI-enhanced risks:', error);
        }
    }

    renderRiskCards(risks) {
        const container = document.getElementById('tiEnhancedRiskCards');
        container.innerHTML = '';

        risks.forEach(risk => {
            const confidenceColor = this.getConfidenceColor(risk.confidence_score || 0);
            const severityIcon = this.getSeverityIcon(risk.severity || 'medium');
            
            const card = document.createElement('div');
            card.className = 'risk-card bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border-l-4 border-l-red-500 hover:shadow-md transition-all';
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <i class="${severityIcon} text-red-500 mr-2"></i>
                            <h4 class="font-medium text-gray-900 truncate">${risk.title}</h4>
                            ${risk.ti_enriched ? '<span class="ti-indicator ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">TI</span>' : ''}
                        </div>
                        <p class="text-sm text-gray-600 mb-3 line-clamp-2">${risk.description}</p>
                        <div class="flex items-center space-x-4 text-sm">
                            <span class="text-gray-500">Risk Score: <span class="font-medium">${risk.risk_score || 0}</span></span>
                            <span class="text-gray-500">Stage: <span class="font-medium capitalize">${risk.risk_lifecycle_stage || 'unknown'}</span></span>
                            ${risk.epss_score ? `<span class="text-gray-500">EPSS: <span class="font-medium">${(risk.epss_score * 100).toFixed(1)}%</span></span>` : ''}
                        </div>
                    </div>
                    <div class="ml-4 flex flex-col items-end space-y-2">
                        <div class="confidence-badge px-2 py-1 rounded ${confidenceColor}">
                            ${((risk.confidence_score || 0) * 100).toFixed(0)}% confidence
                        </div>
                        <div class="flex space-x-1">
                            <button onclick="validateRiskFromCard(${risk.id})" class="text-green-600 hover:text-green-800 text-sm">
                                <i class="fas fa-check-circle"></i>
                            </button>
                            <button onclick="viewRiskDetails(${risk.id})" class="text-blue-600 hover:text-blue-800 text-sm">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        if (risks.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No TI-enhanced risks found</p>';
        }
    }

    async loadTIFeedStatus() {
        try {
            const response = await axios.get('/api/threat-intelligence/sources');
            if (response.data.success) {
                const sources = response.data.data;
                this.renderTIFeedStatus(sources);
                this.updateTIStatusBanner(sources);
            }
        } catch (error) {
            console.error('Error loading TI feed status:', error);
        }
    }

    renderTIFeedStatus(sources) {
        const container = document.getElementById('tiFeedStatus');
        container.innerHTML = '';

        sources.forEach(source => {
            const statusColor = source.status === 'active' ? 'text-green-600' : 
                               source.status === 'error' ? 'text-red-600' : 'text-gray-600';
            const statusIcon = source.status === 'active' ? 'fa-check-circle' : 
                              source.status === 'error' ? 'fa-exclamation-triangle' : 'fa-pause-circle';

            const feedItem = document.createElement('div');
            feedItem.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
            feedItem.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${statusIcon} ${statusColor} mr-3"></i>
                    <div>
                        <div class="font-medium text-gray-900">${source.name}</div>
                        <div class="text-sm text-gray-500">${source.type.toUpperCase()}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm ${statusColor} font-medium capitalize">${source.status}</div>
                    ${source.last_updated ? `<div class="text-xs text-gray-500">${dayjs(source.last_updated).fromNow()}</div>` : ''}
                </div>
            `;
            container.appendChild(feedItem);
        });
    }

    updateTIStatusBanner(sources) {
        const activeSources = sources.filter(s => s.status === 'active').length;
        const totalSources = sources.length;
        const errorSources = sources.filter(s => s.status === 'error').length;

        const statusText = document.getElementById('tiStatusText');
        const lastUpdate = document.getElementById('tiLastUpdate');
        const sourcesStatus = document.getElementById('tiSourcesStatus');

        if (errorSources > 0) {
            statusText.textContent = `${errorSources} TI source(s) experiencing issues`;
            statusText.className = 'opacity-90 text-yellow-200';
        } else {
            statusText.textContent = `All TI sources operational (${activeSources}/${totalSources} active)`;
            statusText.className = 'opacity-90';
        }

        lastUpdate.textContent = `Last updated: ${dayjs().format('HH:mm:ss')}`;
        
        sourcesStatus.innerHTML = sources.map(source => {
            const color = source.status === 'active' ? 'bg-green-400' : 
                         source.status === 'error' ? 'bg-red-400' : 'bg-gray-400';
            return `<span class="w-3 h-3 rounded-full ${color}" title="${source.name}"></span>`;
        }).join('');
    }

    async loadValidationQueue() {
        try {
            const response = await axios.get('/api/enhanced-risk/validation/queue');
            if (response.data.success) {
                const queue = response.data.data.validation_queue;
                this.renderValidationQueue(queue);
            }
        } catch (error) {
            console.error('Error loading validation queue:', error);
        }
    }

    renderValidationQueue(queue) {
        const container = document.getElementById('validationQueue');
        container.innerHTML = '';

        queue.slice(0, 5).forEach(item => {
            const urgencyColor = item.confidence_score > 0.8 ? 'border-l-green-400' : 
                                item.confidence_score > 0.6 ? 'border-l-yellow-400' : 'border-l-red-400';
            
            const queueItem = document.createElement('div');
            queueItem.className = `p-3 bg-gray-50 rounded-lg border-l-4 ${urgencyColor} cursor-pointer hover:bg-gray-100 transition-colors`;
            queueItem.onclick = () => openValidationModal(item.id, item);
            queueItem.innerHTML = `
                <div class="font-medium text-gray-900 text-sm mb-1 truncate">${item.title}</div>
                <div class="text-xs text-gray-600 mb-2">${item.category} • Risk Score: ${item.risk_score}</div>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">${dayjs(item.validation_created_at).fromNow()}</span>
                    <span class="text-xs font-medium">${(item.confidence_score * 100).toFixed(0)}%</span>
                </div>
            `;
            container.appendChild(queueItem);
        });

        if (queue.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4 text-sm">No pending validations</p>';
        }
    }

    async loadRecentIndicators() {
        try {
            const response = await axios.get('/api/threat-intelligence/indicators?limit=10');
            if (response.data.success) {
                const indicators = response.data.data;
                this.renderRecentIndicators(indicators);
            }
        } catch (error) {
            console.error('Error loading recent indicators:', error);
        }
    }

    renderRecentIndicators(indicators) {
        const container = document.getElementById('recentIndicators');
        container.innerHTML = '';

        indicators.slice(0, 8).forEach(indicator => {
            const severityColor = this.getSeverityColor(indicator.severity);
            
            const indicatorItem = document.createElement('div');
            indicatorItem.className = 'flex items-center justify-between p-2 bg-gray-50 rounded text-sm hover:bg-gray-100 transition-colors cursor-pointer';
            indicatorItem.onclick = () => viewIndicatorDetails(indicator.id);
            indicatorItem.innerHTML = `
                <div class="flex items-center flex-1 min-w-0">
                    <span class="w-2 h-2 rounded-full ${severityColor} mr-2 flex-shrink-0"></span>
                    <div class="truncate">
                        <div class="font-medium text-gray-900 truncate">${indicator.identifier}</div>
                        <div class="text-gray-600 text-xs">${indicator.source_name}</div>
                    </div>
                </div>
                <div class="text-xs text-gray-500">${dayjs(indicator.created_at).fromNow()}</div>
            `;
            container.appendChild(indicatorItem);
        });

        if (indicators.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4 text-sm">No recent indicators</p>';
        }
    }

    async loadServiceRiskData() {
        try {
            const response = await axios.get('/api/threat-intelligence/service-risk-analysis');
            if (response.data.success) {
                const services = response.data.data.high_risk_services;
                this.renderServiceHeatMap(services);
            }
        } catch (error) {
            console.error('Error loading service risk data:', error);
        }
    }

    renderServiceHeatMap(services) {
        const container = document.getElementById('serviceHeatMap');
        container.innerHTML = '';

        services.slice(0, 16).forEach(service => {
            const riskLevel = service.aggregate_risk_score > 70 ? 'high' : 
                             service.aggregate_risk_score > 40 ? 'medium' : 'low';
            const bgColor = riskLevel === 'high' ? 'bg-red-500' : 
                           riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
            
            const serviceBlock = document.createElement('div');
            serviceBlock.className = `${bgColor} text-white p-3 rounded-lg text-center cursor-pointer hover:opacity-80 transition-opacity`;
            serviceBlock.title = `${service.service_name}\nRisk Score: ${service.aggregate_risk_score}\nCIA Score: ${service.cia_score}`;
            serviceBlock.onclick = () => viewServiceDetails(service.service_id);
            serviceBlock.innerHTML = `
                <div class="font-medium text-sm truncate">${service.service_name}</div>
                <div class="text-xs opacity-90">${service.aggregate_risk_score}</div>
            `;
            container.appendChild(serviceBlock);
        });

        // Fill remaining slots with empty blocks
        for (let i = services.length; i < 16; i++) {
            const emptyBlock = document.createElement('div');
            emptyBlock.className = 'bg-gray-200 p-3 rounded-lg text-center';
            emptyBlock.innerHTML = '<div class="text-gray-400 text-sm">N/A</div>';
            container.appendChild(emptyBlock);
        }
    }

    initializeCharts() {
        this.initCorrelationChart();
        this.initTITrendChart();
        this.initSeverityChart();
    }

    initCorrelationChart() {
        const ctx = document.getElementById('correlationChart').getContext('2d');
        this.charts.correlation = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Risk Correlations',
                    data: [], // Will be populated with real data
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Risk-TI Indicator Correlations'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'TI Confidence Score'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Risk Score'
                        }
                    }
                }
            }
        });
    }

    initTITrendChart() {
        const ctx = document.getElementById('tiTrendChart').getContext('2d');
        this.charts.tiTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Critical Indicators',
                    data: [],
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }, {
                    label: 'High Indicators',
                    data: [],
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'TI Indicators Trend (Last 7 Days)'
                    }
                }
            }
        });
    }

    initSeverityChart() {
        const ctx = document.getElementById('severityChart').getContext('2d');
        this.charts.severity = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Critical', 'High', 'Medium', 'Low'],
                datasets: [{
                    data: [0, 0, 0, 0], // Will be populated with real data
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Risk Severity Distribution'
                    }
                }
            }
        });
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 30000); // Refresh every 30 seconds
    }

    setupWebSocket() {
        // WebSocket implementation would go here for real-time updates
        // This is a placeholder for future enhancement
        console.log('WebSocket setup placeholder');
    }

    getConfidenceColor(score) {
        if (score >= 0.8) return 'bg-green-100 text-green-800';
        if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }

    getSeverityIcon(severity) {
        switch (severity) {
            case 'critical': return 'fas fa-exclamation-triangle';
            case 'high': return 'fas fa-exclamation-circle';
            case 'medium': return 'fas fa-info-circle';
            case 'low': return 'fas fa-check-circle';
            default: return 'fas fa-question-circle';
        }
    }

    getSeverityColor(severity) {
        switch (severity) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const messageElement = document.getElementById('toastMessage');
        
        messageElement.textContent = message;
        toast.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-600' : 
            type === 'success' ? 'bg-green-600' : 'bg-blue-600'
        } text-white`;
        
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 5000);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (this.wsConnection) {
            this.wsConnection.close();
        }
        Object.values(this.charts).forEach(chart => chart.destroy());
    }
}

// Global functions for UI interactions
async function refreshTIFeeds() {
    try {
        dashboard.showToast('Refreshing TI feeds...', 'info');
        const response = await axios.post('/api/threat-intelligence/ingestion/full');
        if (response.data.success) {
            dashboard.showToast('TI feed refresh initiated', 'success');
            setTimeout(() => dashboard.loadDashboardData(), 2000);
        }
    } catch (error) {
        console.error('Error refreshing TI feeds:', error);
        dashboard.showToast('Failed to refresh TI feeds', 'error');
    }
}

async function triggerTIIngestion() {
    try {
        dashboard.showToast('Starting TI ingestion...', 'info');
        const response = await axios.post('/api/threat-intelligence/ingestion/full');
        if (response.data.success) {
            dashboard.showToast('TI ingestion started successfully', 'success');
            setTimeout(() => dashboard.loadTIFeedStatus(), 3000);
        }
    } catch (error) {
        console.error('Error triggering TI ingestion:', error);
        dashboard.showToast('Failed to start TI ingestion', 'error');
    }
}

async function refreshRisks() {
    await dashboard.loadTIEnhancedRisks();
    dashboard.showToast('Risks refreshed', 'success');
}

function openValidationModal(riskId, riskData) {
    const modal = document.getElementById('validationModal');
    const content = document.getElementById('validationContent');
    
    content.innerHTML = `
        <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-2">${riskData.title}</h4>
            <p class="text-sm text-gray-600 mb-4">${riskData.description}</p>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>Risk Score: <span class="font-medium">${riskData.risk_score}</span></div>
                <div>Category: <span class="font-medium">${riskData.category}</span></div>
                <div>Confidence: <span class="font-medium">${(riskData.confidence_score * 100).toFixed(0)}%</span></div>
                <div>TI Enhanced: <span class="font-medium">${riskData.ti_enriched ? 'Yes' : 'No'}</span></div>
            </div>
        </div>
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Validation Decision</label>
            <select id="validationDecision" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
                <option value="needs_info">Needs More Information</option>
            </select>
        </div>
        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Validation Notes</label>
            <textarea id="validationNotes" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter your validation notes..."></textarea>
        </div>
        <div class="flex justify-end space-x-3">
            <button onclick="closeValidationModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
            <button onclick="submitValidation(${riskId})" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Submit Validation</button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeValidationModal() {
    document.getElementById('validationModal').classList.add('hidden');
}

async function submitValidation(riskId) {
    const decision = document.getElementById('validationDecision').value;
    const notes = document.getElementById('validationNotes').value;
    
    try {
        const response = await axios.post('/api/enhanced-risk/validation/decision', {
            risk_id: riskId,
            validation_status: decision,
            validation_notes: notes
        });
        
        if (response.data.success) {
            dashboard.showToast('Validation submitted successfully', 'success');
            closeValidationModal();
            setTimeout(() => {
                dashboard.loadValidationQueue();
                dashboard.loadTIEnhancedRisks();
            }, 1000);
        }
    } catch (error) {
        console.error('Error submitting validation:', error);
        dashboard.showToast('Failed to submit validation', 'error');
    }
}

async function validateRiskFromCard(riskId) {
    try {
        const response = await axios.post(`/api/enhanced-risk/risks/${riskId}/validate`, {
            validation_notes: 'Quick validation from dashboard'
        });
        
        if (response.data.success) {
            dashboard.showToast('Risk validated successfully', 'success');
            setTimeout(() => dashboard.loadTIEnhancedRisks(), 1000);
        }
    } catch (error) {
        console.error('Error validating risk:', error);
        dashboard.showToast('Failed to validate risk', 'error');
    }
}

function viewRiskDetails(riskId) {
    window.open(`/risk-details/${riskId}`, '_blank');
}

function viewIndicatorDetails(indicatorId) {
    window.open(`/ti-indicator/${indicatorId}`, '_blank');
}

function viewServiceDetails(serviceId) {
    window.open(`/service-details/${serviceId}`, '_blank');
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new TIEnhancedDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.destroy();
    }
});