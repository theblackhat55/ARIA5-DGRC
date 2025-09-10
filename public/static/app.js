/**
 * Dynamic Risk Intelligence Platform - Frontend Application
 * Phase 1 Implementation
 */

class DynamicRiskDashboard {
    constructor() {
        this.apiBase = '/api';
        this.refreshInterval = 30000; // 30 seconds
        this.charts = {};
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Dynamic Risk Intelligence Dashboard...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial dashboard data
        await this.loadDashboard();
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        console.log('✅ Dashboard initialized successfully');
    }

    setupEventListeners() {
        // Manual execution button
        document.getElementById('manual-execute').addEventListener('click', async () => {
            await this.executeManualCycle();
        });
    }

    async loadDashboard() {
        try {
            this.showLoading();
            
            // Load comprehensive dashboard data
            const response = await axios.get(`${this.apiBase}/dashboard`);
            
            if (response.data.success) {
                const dashboard = response.data.data;
                
                // Update all dashboard sections
                this.updateMetrics(dashboard.system_status.performance_metrics);
                this.updateSystemHealth(dashboard.system_status.system_health, dashboard.system_status.components);
                this.updateServiceRiskCharts(dashboard.service_risk_dashboard);
                this.updateServicesTable(dashboard.service_risk_dashboard.services);
                this.updateComponentStatus(dashboard.system_status.components);
                
                this.showDashboard();
            } else {
                throw new Error(response.data.error || 'Failed to load dashboard');
            }
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError('Failed to load dashboard data: ' + error.message);
        }
    }

    updateMetrics(performanceMetrics) {
        // Update key performance indicators
        document.getElementById('discovery-rate').textContent = 
            `${performanceMetrics.discovery_sla.toFixed(1)}%`;
        document.getElementById('update-latency').textContent = 
            `${performanceMetrics.update_latency.toFixed(1)} min`;
        document.getElementById('approval-efficiency').textContent = 
            `${performanceMetrics.approval_efficiency.toFixed(1)}%`;
    }

    updateSystemHealth(healthStatus, components) {
        const healthIndicator = document.getElementById('system-health');
        const statusDot = healthIndicator.querySelector('div');
        const statusText = healthIndicator.querySelector('span');

        // Update health indicator
        statusDot.className = 'w-3 h-3 rounded-full mr-2 ' + this.getHealthColor(healthStatus);
        statusText.textContent = this.getHealthText(healthStatus);

        // Count online components
        const onlineComponents = Object.values(components).filter(c => c.status === 'online').length;
        const totalComponents = Object.keys(components).length;
        
        if (onlineComponents < totalComponents) {
            statusText.textContent += ` (${onlineComponents}/${totalComponents} components)`;
        }
    }

    updateServiceRiskCharts(serviceData) {
        // Update services count
        document.getElementById('services-count').textContent = serviceData.summary.total_services;

        // Risk Distribution Pie Chart
        this.createRiskDistributionChart(serviceData.summary);
        
        // Risk Trend Chart (placeholder - would use historical data)
        this.createRiskTrendChart();
    }

    createRiskDistributionChart(summary) {
        const ctx = document.getElementById('risk-distribution-chart');
        
        if (this.charts.riskDistribution) {
            this.charts.riskDistribution.destroy();
        }

        this.charts.riskDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                datasets: [{
                    data: [
                        summary.high_risk_services,
                        summary.medium_risk_services,
                        summary.low_risk_services
                    ],
                    backgroundColor: [
                        '#EF4444', // Red for high
                        '#F59E0B', // Yellow for medium
                        '#10B981'  // Green for low
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createRiskTrendChart() {
        const ctx = document.getElementById('risk-trend-chart');
        
        if (this.charts.riskTrend) {
            this.charts.riskTrend.destroy();
        }

        // Generate sample trend data
        const labels = [];
        const riskData = [];
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            labels.push(date.toLocaleDateString());
            // Sample trend data - would be replaced with real historical data
            riskData.push(45 + Math.random() * 20);
        }

        this.charts.riskTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Risk Score',
                    data: riskData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Risk Score'
                        }
                    }
                }
            }
        });
    }

    updateServicesTable(services) {
        const servicesList = document.getElementById('services-list');
        servicesList.innerHTML = '';

        services.forEach(service => {
            const listItem = document.createElement('li');
            listItem.className = 'px-6 py-4';

            const riskLevel = this.getRiskLevel(service.current_score.overall);
            const riskColor = this.getRiskColor(riskLevel);
            const trendIcon = this.getTrendIcon(service.risk_trend);

            listItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-4 h-4 rounded-full ${riskColor}"></div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                                ${service.service_name}
                                <span class="ml-2 text-xs text-gray-500">(${service.dependent_assets} assets)</span>
                            </div>
                            <div class="text-sm text-gray-500">
                                C: ${service.current_score.cia.confidentiality}/10
                                I: ${service.current_score.cia.integrity}/10
                                A: ${service.current_score.cia.availability}/10
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-center">
                            <div class="text-sm font-medium text-gray-900">${service.current_score.overall}</div>
                            <div class="text-xs text-gray-500">Risk Score</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm font-medium text-gray-900">
                                ${trendIcon} ${service.risk_trend}
                            </div>
                            <div class="text-xs text-gray-500">${service.active_risks} active risks</div>
                        </div>
                        <button class="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                onclick="dashboard.viewServiceDetails(${service.service_id})">
                            View Details
                        </button>
                    </div>
                </div>
            `;

            servicesList.appendChild(listItem);
        });
    }

    updateComponentStatus(components) {
        const statusContainer = document.getElementById('component-status');
        statusContainer.innerHTML = '';

        const componentNames = {
            risk_discovery: 'Risk Discovery Engine',
            risk_scoring: 'Service Risk Scoring',
            real_time_updates: 'Real-Time Updates',
            approval_workflow: 'Approval Workflow'
        };

        Object.entries(components).forEach(([key, status]) => {
            const componentDiv = document.createElement('div');
            componentDiv.className = 'flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0';

            const statusColor = this.getComponentStatusColor(status.status);
            const statusIcon = this.getComponentStatusIcon(status.status);

            componentDiv.innerHTML = `
                <div class="flex items-center">
                    <div class="${statusColor} mr-3">
                        <i class="${statusIcon}"></i>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${componentNames[key]}</div>
                        <div class="text-xs text-gray-500">
                            Success Rate: ${status.success_rate.toFixed(1)}% | 
                            Performance: ${status.performance_score}/100
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900 capitalize">${status.status}</div>
                    <div class="text-xs text-gray-500">
                        ${status.error_count} errors
                    </div>
                </div>
            `;

            statusContainer.appendChild(componentDiv);
        });
    }

    async executeManualCycle() {
        const button = document.getElementById('manual-execute');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Executing...';
            button.disabled = true;

            const response = await axios.post(`${this.apiBase}/system/execute`);
            
            if (response.data.success) {
                // Show success notification
                this.showNotification('Manual execution completed successfully', 'success');
                
                // Reload dashboard after execution
                setTimeout(() => {
                    this.loadDashboard();
                }, 2000);
            } else {
                throw new Error(response.data.error || 'Execution failed');
            }
            
        } catch (error) {
            console.error('Manual execution failed:', error);
            this.showNotification('Manual execution failed: ' + error.message, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async viewServiceDetails(serviceId) {
        try {
            const response = await axios.get(`${this.apiBase}/scoring/service/${serviceId}`);
            
            if (response.data.success) {
                // Show service details modal (simplified for demo)
                const service = response.data.data;
                alert(`Service: ${service.service_name}\nRisk Score: ${service.current_score.overall}\nTrend: ${service.risk_trend}\nActive Risks: ${service.active_risks}`);
            }
        } catch (error) {
            console.error('Error loading service details:', error);
            this.showNotification('Failed to load service details', 'error');
        }
    }

    startAutoRefresh() {
        setInterval(() => {
            console.log('🔄 Auto-refreshing dashboard...');
            this.loadDashboard();
        }, this.refreshInterval);
    }

    // UI Helper Methods
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('error').classList.remove('hidden');
        document.getElementById('error-message').textContent = message;
    }

    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with toast library
        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    getHealthColor(status) {
        switch (status) {
            case 'healthy': return 'bg-green-400';
            case 'degraded': return 'bg-yellow-400';
            case 'critical': return 'bg-red-400';
            default: return 'bg-gray-400';
        }
    }

    getHealthText(status) {
        switch (status) {
            case 'healthy': return 'System Healthy';
            case 'degraded': return 'System Degraded';
            case 'critical': return 'System Critical';
            default: return 'Status Unknown';
        }
    }

    getRiskLevel(score) {
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    getRiskColor(level) {
        switch (level) {
            case 'high': return 'bg-red-400';
            case 'medium': return 'bg-yellow-400';
            case 'low': return 'bg-green-400';
            default: return 'bg-gray-400';
        }
    }

    getTrendIcon(trend) {
        switch (trend) {
            case 'increasing': return '📈';
            case 'decreasing': return '📉';
            case 'stable': return '➡️';
            default: return '〰️';
        }
    }

    getComponentStatusColor(status) {
        switch (status) {
            case 'online': return 'text-green-500';
            case 'offline': return 'text-gray-400';
            case 'error': return 'text-red-500';
            case 'initializing': return 'text-blue-500';
            default: return 'text-gray-400';
        }
    }

    getComponentStatusIcon(status) {
        switch (status) {
            case 'online': return 'fas fa-check-circle';
            case 'offline': return 'fas fa-times-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'initializing': return 'fas fa-spinner fa-spin';
            default: return 'fas fa-question-circle';
        }
    }
}

// Initialize dashboard when page loads
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DynamicRiskDashboard();
});

// Export for global access
window.dashboard = dashboard;