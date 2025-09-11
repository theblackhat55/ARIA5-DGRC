/**
 * Enhanced Risk Dashboard Components
 * Native integration components for ARIA5.1 with Enhanced Risk Engine
 * Provides backward compatibility while enabling advanced visualization
 */

class EnhancedRiskDashboard {
    constructor() {
        this.isEnhancedAvailable = false;
        this.serviceIndicesChart = null;
        this.riskTrendChart = null;
        this.realTimeEnabled = false;
        this.updateInterval = null;
        this.performanceMetrics = new Map();
    }

    /**
     * Initialize the enhanced dashboard with progressive enhancement
     */
    async initialize() {
        console.log('[Enhanced-Dashboard] Initializing Enhanced Risk Dashboard');
        
        try {
            // Check if enhanced features are available
            this.isEnhancedAvailable = await this.checkEnhancedAvailability();
            
            if (this.isEnhancedAvailable) {
                console.log('[Enhanced-Dashboard] Enhanced features detected, initializing advanced components');
                await this.initializeEnhancedComponents();
                this.showEnhancedIndicator();
            } else {
                console.log('[Enhanced-Dashboard] Enhanced features not available, using legacy mode');
            }
            
            // Always load basic dashboard (backward compatibility)
            await this.initializeLegacyComponents();
            
            // Setup real-time updates if enhanced
            if (this.isEnhancedAvailable) {
                this.enableRealTimeUpdates();
            }
            
            console.log('[Enhanced-Dashboard] Dashboard initialization complete');
            
        } catch (error) {
            console.error('[Enhanced-Dashboard] Initialization failed, falling back to legacy mode:', error);
            this.isEnhancedAvailable = false;
            await this.initializeLegacyComponents();
        }
    }

    /**
     * Check if enhanced risk engine APIs are available
     */
    async checkEnhancedAvailability() {
        try {
            const response = await fetch('/api/enhanced-risk-engine/status');
            if (response.ok) {
                const status = await response.json();
                return status.status === 'healthy' && status.enhanced_engine?.enhanced_tables_exist;
            }
            return false;
        } catch (error) {
            console.warn('[Enhanced-Dashboard] Enhanced API check failed:', error);
            return false;
        }
    }

    /**
     * Initialize enhanced dashboard components
     */
    async initializeEnhancedComponents() {
        // Initialize service indices visualization
        await this.initializeServiceIndicesDashboard();
        
        // Initialize explainable scoring components
        await this.initializeExplainableScoring();
        
        // Initialize AI analysis components
        await this.initializeAIAnalysisComponents();
        
        // Initialize performance monitoring
        await this.initializePerformanceMonitoring();
        
        // Add enhanced controls
        this.addEnhancedControls();
    }

    /**
     * Initialize Service Indices Dashboard (SVI/SEI/BCI/ERI)
     */
    async initializeServiceIndicesDashboard() {
        try {
            console.log('[Enhanced-Dashboard] Loading Service Indices Dashboard');
            
            // Create enhanced services container if it doesn't exist
            let container = document.getElementById('enhanced-services-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'enhanced-services-container';
                container.className = 'mb-8';
                
                // Insert after existing services table
                const servicesTable = document.querySelector('#services-list')?.parentElement;
                if (servicesTable) {
                    servicesTable.parentNode.insertBefore(container, servicesTable.nextSibling);
                }
            }
            
            // Add section header
            container.innerHTML = `
                <div class="bg-white shadow overflow-hidden sm:rounded-md mb-8">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            <i class="fas fa-chart-line mr-2"></i>
                            Enhanced Service Risk Intelligence
                            <span class="ml-2 px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                                Enhanced Engine Active
                            </span>
                        </h3>
                        <p class="mt-1 max-w-2xl text-sm text-gray-500">
                            AI-native service indices with explainable scoring (SVI/SEI/BCI/ERI)
                        </p>
                    </div>
                    <div id="service-indices-grid" class="p-6">
                        <div class="text-center py-4">
                            <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-blue-600">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading Service Indices...
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Load service indices data
            const services = await this.fetchServicesWithIndices();
            this.renderServiceIndicesGrid(services);
            
        } catch (error) {
            console.error('[Enhanced-Dashboard] Service indices initialization failed:', error);
        }
    }

    /**
     * Fetch services with enhanced indices
     */
    async fetchServicesWithIndices() {
        try {
            // Get active services
            const servicesResponse = await fetch('/api/services?status=active&limit=20');
            const servicesData = await servicesResponse.json();
            
            if (!servicesData.data || !servicesData.data.services) {
                throw new Error('No services data received');
            }
            
            // Get enhanced indices for all services
            const serviceIds = servicesData.data.services.map(s => s.id).join(',');
            const indicesResponse = await fetch(`/api/enhanced-risk-engine/service-indices/bulk?service_ids=${serviceIds}`);
            const indicesData = await indicesResponse.json();
            
            // Combine services with their indices
            const servicesWithIndices = servicesData.data.services.map(service => {
                const indicesResult = indicesData.results?.find(r => r.service_id === service.id);
                return {
                    ...service,
                    indices: indicesResult?.indices || null,
                    indices_status: indicesResult?.status || 'not_computed'
                };
            });
            
            return servicesWithIndices;
            
        } catch (error) {
            console.error('[Enhanced-Dashboard] Failed to fetch services with indices:', error);
            return [];
        }
    }

    /**
     * Render Service Indices Grid
     */
    renderServiceIndicesGrid(services) {
        const container = document.getElementById('service-indices-grid');
        if (!container) return;
        
        if (services.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
                    <p class="text-gray-500">No services with computed indices found</p>
                </div>
            `;
            return;
        }
        
        const gridHtml = services.map(service => this.renderServiceIndicesCard(service)).join('');
        
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                ${gridHtml}
            </div>
        `;
        
        // Add event listeners for interactive elements
        this.attachServiceCardEventListeners();
    }

    /**
     * Render individual service indices card
     */
    renderServiceIndicesCard(service) {
        const indices = service.indices;
        const hasIndices = indices && service.indices_status === 'computed';
        
        if (!hasIndices) {
            return `
                <div class="service-indices-card bg-white shadow rounded-lg p-6 border-l-4 border-gray-300">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-lg font-medium text-gray-900">${this.escapeHtml(service.name)}</h4>
                        <span class="text-sm text-gray-500">No Enhanced Data</span>
                    </div>
                    <p class="text-sm text-gray-600">Enhanced indices not available for this service.</p>
                    <button onclick="enhancedDashboard.computeServiceIndices(${service.id})" 
                            class="mt-3 text-blue-600 text-sm hover:underline">
                        Compute Indices
                    </button>
                </div>
            `;
        }
        
        const compositeScore = indices.composite;
        const riskLevel = this.determineRiskLevel(compositeScore);
        const borderColor = this.getRiskBorderColor(riskLevel);
        const scoreColor = this.getRiskScoreColor(riskLevel);
        
        return `
            <div class="service-indices-card bg-white shadow rounded-lg p-6 border-l-4 ${borderColor}" 
                 data-service-id="${service.id}">
                
                <!-- Header -->
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-lg font-medium text-gray-900">${this.escapeHtml(service.name)}</h4>
                    <div class="text-right">
                        <div class="text-2xl font-bold ${scoreColor}">${compositeScore.toFixed(1)}</div>
                        <div class="text-xs text-gray-500 uppercase">${riskLevel} Risk</div>
                    </div>
                </div>
                
                <!-- Service Indices Grid -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="index-metric">
                        <div class="flex items-center justify-between">
                            <div class="text-xs text-gray-500 uppercase font-medium">SVI</div>
                            <div class="text-lg font-semibold text-red-600">${indices.svi.toFixed(1)}</div>
                        </div>
                        <div class="text-xs text-gray-400">Vulnerability Index</div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div class="bg-red-600 h-1.5 rounded-full" style="width: ${indices.svi}%"></div>
                        </div>
                    </div>
                    
                    <div class="index-metric">
                        <div class="flex items-center justify-between">
                            <div class="text-xs text-gray-500 uppercase font-medium">SEI</div>
                            <div class="text-lg font-semibold text-orange-600">${indices.sei.toFixed(1)}</div>
                        </div>
                        <div class="text-xs text-gray-400">Security Events</div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div class="bg-orange-600 h-1.5 rounded-full" style="width: ${indices.sei}%"></div>
                        </div>
                    </div>
                    
                    <div class="index-metric">
                        <div class="flex items-center justify-between">
                            <div class="text-xs text-gray-500 uppercase font-medium">BCI</div>
                            <div class="text-lg font-semibold text-blue-600">${indices.bci.toFixed(1)}</div>
                        </div>
                        <div class="text-xs text-gray-400">Business Context</div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${indices.bci}%"></div>
                        </div>
                    </div>
                    
                    <div class="index-metric">
                        <div class="flex items-center justify-between">
                            <div class="text-xs text-gray-500 uppercase font-medium">ERI</div>
                            <div class="text-lg font-semibold text-purple-600">${indices.eri.toFixed(1)}</div>
                        </div>
                        <div class="text-xs text-gray-400">External Risk</div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div class="bg-purple-600 h-1.5 rounded-full" style="width: ${indices.eri}%"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div class="text-xs text-gray-500">
                        Enhanced Engine: <span class="text-green-600 font-medium">Active</span>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="enhancedDashboard.showScoringExplanation(${service.id})" 
                                class="text-blue-600 text-xs hover:underline">
                            Explain Score
                        </button>
                        <button onclick="enhancedDashboard.showServiceDetails(${service.id})" 
                                class="text-blue-600 text-xs hover:underline">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize explainable scoring components
     */
    async initializeExplainableScoring() {
        // Create explainable scoring modal container
        if (!document.getElementById('scoring-explanation-modal')) {
            const modalHtml = `
                <div id="scoring-explanation-modal" class="hidden fixed inset-0 z-50 overflow-y-auto">
                    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                             onclick="enhancedDashboard.closeScoringExplanation()"></div>
                        
                        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="flex items-start">
                                    <div class="flex-shrink-0">
                                        <i class="fas fa-chart-line text-blue-600 text-2xl"></i>
                                    </div>
                                    <div class="ml-3 w-full">
                                        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                                            Risk Score Explanation
                                        </h3>
                                        <div id="scoring-explanation-content">
                                            <!-- Content will be loaded here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" 
                                        onclick="enhancedDashboard.closeScoringExplanation()"
                                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
    }

    /**
     * Initialize AI analysis components
     */
    async initializeAIAnalysisComponents() {
        // Add AI analysis indicator to existing risk items
        const riskItems = document.querySelectorAll('#services-list li, .risk-item');
        
        riskItems.forEach(item => {
            const serviceId = item.dataset.serviceId || item.dataset.riskId;
            if (serviceId) {
                this.addAIAnalysisIndicator(item, serviceId);
            }
        });
    }

    /**
     * Initialize performance monitoring display
     */
    async initializePerformanceMonitoring() {
        try {
            const response = await fetch('/api/enhanced-risk-engine/performance/metrics?timeframe=1h');
            if (response.ok) {
                const metrics = await response.json();
                this.displayPerformanceMetrics(metrics);
            }
        } catch (error) {
            console.warn('[Enhanced-Dashboard] Performance metrics not available:', error);
        }
    }

    /**
     * Show scoring explanation modal
     */
    async showScoringExplanation(serviceId) {
        try {
            const modal = document.getElementById('scoring-explanation-modal');
            const content = document.getElementById('scoring-explanation-content');
            
            if (!modal || !content) return;
            
            // Show loading state
            content.innerHTML = `
                <div class="text-center py-8">
                    <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-blue-600">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading scoring explanation...
                    </div>
                </div>
            `;
            
            modal.classList.remove('hidden');
            
            // Fetch service information with enhanced data
            const response = await fetch(`/api/services/${serviceId}?enhanced=true`);
            const serviceData = await response.json();
            
            // Calculate a sample risk score to get explanation
            const sampleRisk = {
                title: `Sample Risk Analysis for ${serviceData.name}`,
                category: 'security',
                service_id: serviceId,
                confidence_score: 0.8
            };
            
            const scoringResponse = await fetch('/api/enhanced-risk-engine/scoring/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sampleRisk)
            });
            
            const scoringData = await scoringResponse.json();
            
            // Render explanation
            this.renderScoringExplanation(serviceData, scoringData, content);
            
        } catch (error) {
            console.error('[Enhanced-Dashboard] Failed to show scoring explanation:', error);
            
            const content = document.getElementById('scoring-explanation-content');
            if (content) {
                content.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-md p-4">
                        <div class="flex">
                            <i class="fas fa-exclamation-triangle text-red-400"></i>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">
                                    Failed to load scoring explanation
                                </h3>
                                <p class="mt-2 text-sm text-red-700">
                                    ${error.message || 'An unknown error occurred'}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    }

    /**
     * Render scoring explanation content
     */
    renderScoringExplanation(serviceData, scoringData, container) {
        const explanation = scoringData.explanation;
        const factors = scoringData.factors;
        const serviceIndices = scoringData.service_indices;
        const controlsDiscount = scoringData.controls_discount;
        
        const explanationHtml = `
            <div class="space-y-6">
                <!-- Service Overview -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="text-sm font-medium text-gray-900 mb-2">Service: ${this.escapeHtml(serviceData.name)}</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-500">Final Score:</span>
                            <span class="font-semibold ml-2 ${this.getRiskScoreColor(this.determineRiskLevel(scoringData.risk_score_composite))}">${scoringData.final_score.toFixed(3)}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Risk Level:</span>
                            <span class="font-semibold ml-2">${scoringData.risk_level.toUpperCase()}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Composite (0-100):</span>
                            <span class="font-semibold ml-2">${scoringData.risk_score_composite}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Computation Time:</span>
                            <span class="font-semibold ml-2">${scoringData.computation_metadata.computation_time_ms}ms</span>
                        </div>
                    </div>
                </div>
                
                <!-- Service Indices Breakdown -->
                <div>
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Service Indices Contribution</h4>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        ${this.renderIndexContribution('SVI', serviceIndices.svi, 'Vulnerability exposure and patching status', 'text-red-600')}
                        ${this.renderIndexContribution('SEI', serviceIndices.sei, 'Security events and incident activity', 'text-orange-600')}
                        ${this.renderIndexContribution('BCI', serviceIndices.bci, 'Business criticality and impact potential', 'text-blue-600')}
                        ${this.renderIndexContribution('ERI', serviceIndices.eri, 'External threat landscape and geopolitical factors', 'text-purple-600')}
                    </div>
                </div>
                
                <!-- Top Contributing Factors -->
                <div>
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Top Risk Factors</h4>
                    <div class="space-y-2">
                        ${explanation.top_factors.map(factor => `
                            <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                                <div>
                                    <div class="text-sm font-medium">${factor.factor}</div>
                                    <div class="text-xs text-gray-600">${factor.reason}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm font-semibold">${factor.value.toFixed(1)}</div>
                                    <div class="text-xs text-gray-500">Contribution</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Controls Applied -->
                ${explanation.controls_applied.length > 0 ? `
                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-3">Security Controls Applied</h4>
                        <div class="bg-green-50 rounded-lg p-3">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-shield-alt text-green-600 mr-2"></i>
                                <span class="text-sm font-medium text-green-800">Risk Reduction Applied</span>
                            </div>
                            <div class="text-xs text-green-700">
                                ${explanation.controls_applied.join(' • ')}
                            </div>
                            <div class="mt-2 text-xs text-green-600">
                                Total Risk Reduction: ${controlsDiscount.total_discount.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Raw Factors -->
                <div>
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Detailed Factor Analysis</h4>
                    <div class="grid grid-cols-2 gap-4 text-xs">
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Likelihood (0-100):</span>
                                <span class="font-medium">${factors.likelihood_0_100.toFixed(1)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Impact (0-100):</span>
                                <span class="font-medium">${factors.impact_0_100.toFixed(1)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Confidence:</span>
                                <span class="font-medium">${(factors.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Freshness:</span>
                                <span class="font-medium">${(factors.freshness * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Evidence Quality:</span>
                                <span class="font-medium">${(factors.evidence_quality * 100).toFixed(1)}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>MITRE Complexity:</span>
                                <span class="font-medium">${(factors.mitre_complexity * 100).toFixed(1)}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Threat Actor:</span>
                                <span class="font-medium">${(factors.threat_actor * 100).toFixed(1)}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Asset Criticality:</span>
                                <span class="font-medium">${(factors.asset_criticality * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = explanationHtml;
    }

    /**
     * Render index contribution component
     */
    renderIndexContribution(name, value, description, colorClass) {
        return `
            <div class="text-center p-3 border border-gray-200 rounded-lg">
                <div class="text-xl font-bold ${colorClass}">${value.toFixed(1)}</div>
                <div class="text-xs font-medium text-gray-900">${name}</div>
                <div class="text-xs text-gray-500 mt-1">${description}</div>
                <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div class="${colorClass.replace('text-', 'bg-')} h-1.5 rounded-full" style="width: ${value}%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Close scoring explanation modal
     */
    closeScoringExplanation() {
        const modal = document.getElementById('scoring-explanation-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Compute service indices on demand
     */
    async computeServiceIndices(serviceId) {
        try {
            const response = await fetch(`/api/enhanced-risk-engine/service-indices/${serviceId}`);
            if (response.ok) {
                // Refresh the dashboard
                await this.initializeServiceIndicesDashboard();
            } else {
                console.error('Failed to compute service indices');
            }
        } catch (error) {
            console.error('Error computing service indices:', error);
        }
    }

    /**
     * Show service details
     */
    async showServiceDetails(serviceId) {
        // Navigate to service detail page or show detailed modal
        window.location.href = `/services/${serviceId}?enhanced=true`;
    }

    /**
     * Enable real-time updates
     */
    enableRealTimeUpdates() {
        if (this.realTimeEnabled) return;
        
        this.realTimeEnabled = true;
        
        // Update service indices every 5 minutes
        this.updateInterval = setInterval(async () => {
            try {
                await this.refreshServiceIndices();
            } catch (error) {
                console.warn('[Enhanced-Dashboard] Real-time update failed:', error);
            }
        }, 5 * 60 * 1000); // 5 minutes
        
        console.log('[Enhanced-Dashboard] Real-time updates enabled');
    }

    /**
     * Refresh service indices without full reload
     */
    async refreshServiceIndices() {
        const cards = document.querySelectorAll('.service-indices-card[data-service-id]');
        
        for (const card of cards) {
            const serviceId = card.dataset.serviceId;
            if (serviceId) {
                try {
                    const response = await fetch(`/api/enhanced-risk-engine/service-indices/${serviceId}`);
                    if (response.ok) {
                        const data = await response.json();
                        this.updateServiceCard(card, data.indices);
                    }
                } catch (error) {
                    console.warn(`Failed to refresh indices for service ${serviceId}:`, error);
                }
            }
        }
    }

    /**
     * Update individual service card with new data
     */
    updateServiceCard(cardElement, newIndices) {
        // Update composite score
        const scoreElement = cardElement.querySelector('.text-2xl.font-bold');
        if (scoreElement && newIndices) {
            scoreElement.textContent = newIndices.composite.toFixed(1);
        }
        
        // Update individual indices
        const indices = ['svi', 'sei', 'bci', 'eri'];
        indices.forEach(indexName => {
            const valueElement = cardElement.querySelector(`.text-lg.font-semibold.text-${this.getIndexColor(indexName)}-600`);
            const progressBar = cardElement.querySelector(`.bg-${this.getIndexColor(indexName)}-600.h-1\\.5`);
            
            if (valueElement && newIndices) {
                valueElement.textContent = newIndices[indexName].toFixed(1);
            }
            
            if (progressBar && newIndices) {
                progressBar.style.width = `${newIndices[indexName]}%`;
            }
        });
    }

    // Utility methods

    /**
     * Initialize legacy components (backward compatibility)
     */
    async initializeLegacyComponents() {
        // Existing ARIA5.1 dashboard initialization
        // This ensures the dashboard works even without enhanced features
        console.log('[Enhanced-Dashboard] Initializing legacy components for backward compatibility');
    }

    /**
     * Show enhanced indicator
     */
    showEnhancedIndicator() {
        const header = document.querySelector('nav h1');
        if (header && !header.querySelector('.enhanced-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'enhanced-indicator ml-3 px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full';
            indicator.textContent = 'Enhanced Engine';
            header.appendChild(indicator);
        }
    }

    /**
     * Add enhanced controls to the interface
     */
    addEnhancedControls() {
        const controlsContainer = document.querySelector('.flex.items-center.space-x-4');
        if (controlsContainer && !controlsContainer.querySelector('.enhanced-controls')) {
            const enhancedControls = document.createElement('div');
            enhancedControls.className = 'enhanced-controls flex items-center space-x-2';
            enhancedControls.innerHTML = `
                <button id="toggle-real-time" class="text-sm text-blue-600 hover:underline">
                    <i class="fas fa-sync-alt mr-1"></i>
                    Real-time: ${this.realTimeEnabled ? 'ON' : 'OFF'}
                </button>
                <button id="enhanced-settings" class="text-sm text-blue-600 hover:underline">
                    <i class="fas fa-cog mr-1"></i>
                    Settings
                </button>
            `;
            
            controlsContainer.appendChild(enhancedControls);
            
            // Add event listeners
            document.getElementById('toggle-real-time')?.addEventListener('click', () => {
                this.toggleRealTimeUpdates();
            });
        }
    }

    /**
     * Toggle real-time updates
     */
    toggleRealTimeUpdates() {
        if (this.realTimeEnabled) {
            clearInterval(this.updateInterval);
            this.realTimeEnabled = false;
        } else {
            this.enableRealTimeUpdates();
        }
        
        const button = document.getElementById('toggle-real-time');
        if (button) {
            button.innerHTML = `
                <i class="fas fa-sync-alt mr-1"></i>
                Real-time: ${this.realTimeEnabled ? 'ON' : 'OFF'}
            `;
        }
    }

    /**
     * Add AI analysis indicator to risk items
     */
    addAIAnalysisIndicator(element, itemId) {
        if (!element.querySelector('.ai-analysis-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'ai-analysis-indicator ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded';
            indicator.innerHTML = '<i class="fas fa-brain mr-1"></i>AI Enhanced';
            
            // Find appropriate place to insert
            const titleElement = element.querySelector('h3, .text-lg, .font-medium');
            if (titleElement) {
                titleElement.parentNode.insertBefore(indicator, titleElement.nextSibling);
            }
        }
    }

    /**
     * Display performance metrics
     */
    displayPerformanceMetrics(metrics) {
        // Add performance info to the system health section
        const healthSection = document.getElementById('system-health');
        if (healthSection && metrics.summary_metrics) {
            const avgTime = metrics.summary_metrics.avg_computation_time;
            healthSection.innerHTML = `
                <div class="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                <span class="text-sm text-gray-600">
                    Enhanced Engine: ${avgTime ? avgTime.toFixed(0) + 'ms avg' : 'Ready'}
                </span>
            `;
        }
    }

    /**
     * Attach event listeners to service cards
     */
    attachServiceCardEventListeners() {
        // Already handled via onclick attributes in HTML, but could be enhanced here
    }

    // Utility helper methods

    determineRiskLevel(score) {
        if (score >= 85) return 'critical';
        if (score >= 65) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    getRiskBorderColor(level) {
        const colors = {
            critical: 'border-red-500',
            high: 'border-orange-500',
            medium: 'border-yellow-500',
            low: 'border-green-500'
        };
        return colors[level] || 'border-gray-300';
    }

    getRiskScoreColor(level) {
        const colors = {
            critical: 'text-red-600',
            high: 'text-orange-600',
            medium: 'text-yellow-600',
            low: 'text-green-600'
        };
        return colors[level] || 'text-gray-600';
    }

    getIndexColor(indexName) {
        const colors = {
            svi: 'red',
            sei: 'orange',
            bci: 'blue',
            eri: 'purple'
        };
        return colors[indexName] || 'gray';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global instance
window.enhancedDashboard = new EnhancedRiskDashboard();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedDashboard.initialize();
});