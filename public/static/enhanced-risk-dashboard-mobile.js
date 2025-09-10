/**
 * Enhanced Risk Dashboard - Mobile Optimized Components
 * Mobile-first implementation with touch-friendly controls and responsive design
 * Optimized for Enhanced Risk Engine features on mobile devices
 */

class MobileEnhancedRiskDashboard {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchStartY = null;
        this.touchStartX = null;
        this.swipeThreshold = 50;
        this.currentCard = 0;
        this.serviceCards = [];
        this.isModalOpen = false;
        this.modalSwipeData = null;
    }

    /**
     * Detect if running on mobile device
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth < 768;
    }

    /**
     * Initialize mobile-optimized Enhanced Risk Dashboard
     */
    async initialize() {
        console.log('[Mobile-Enhanced] Initializing Mobile Enhanced Risk Dashboard');
        
        try {
            // Check if enhanced features are available
            const isEnhancedAvailable = await this.checkEnhancedAvailability();
            
            if (isEnhancedAvailable) {
                console.log('[Mobile-Enhanced] Enhanced features available, initializing mobile components');
                await this.initializeMobileComponents();
                this.setupTouchGestures();
                this.setupMobileNavigation();
            } else {
                console.log('[Mobile-Enhanced] Enhanced features not available, mobile fallback mode');
                this.showMobileFallback();
            }
            
        } catch (error) {
            console.error('[Mobile-Enhanced] Mobile initialization failed:', error);
            this.showMobileFallback();
        }
    }

    /**
     * Check enhanced API availability (same as desktop)
     */
    async checkEnhancedAvailability() {
        try {
            const response = await fetch('/api/enhanced-risk-engine/health');
            return response.ok;
        } catch (error) {
            console.warn('[Mobile-Enhanced] Enhanced API check failed:', error);
            return false;
        }
    }

    /**
     * Initialize mobile-specific components
     */
    async initializeMobileComponents() {
        // Create mobile-optimized container
        await this.createMobileContainer();
        
        // Initialize mobile service indices
        await this.initializeMobileServiceIndices();
        
        // Initialize mobile scoring interface
        await this.initializeMobileScoring();
        
        // Initialize mobile AI assistant integration
        await this.initializeMobileAIIntegration();
        
        // Setup mobile performance monitoring
        this.setupMobilePerformanceMonitoring();
    }

    /**
     * Create mobile-optimized container with navigation
     */
    async createMobileContainer() {
        let container = document.getElementById('mobile-enhanced-container');
        if (container) {
            container.remove();
        }
        
        container = document.createElement('div');
        container.id = 'mobile-enhanced-container';
        container.className = 'mobile-enhanced-dashboard';
        
        container.innerHTML = `
            <!-- Mobile Header -->
            <div class="mobile-enhanced-header bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg mb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-bold">Enhanced Risk Engine</h2>
                        <p class="text-blue-100 text-sm">AI-Native Risk Intelligence</p>
                    </div>
                    <div class="text-right">
                        <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse mb-1"></div>
                        <div class="text-xs text-blue-100">Live</div>
                    </div>
                </div>
                
                <!-- Mobile Tab Navigation -->
                <div class="mobile-tab-nav flex mt-4 bg-blue-800 rounded-lg p-1">
                    <button onclick="mobileEnhancedDashboard.switchTab('overview')" 
                            class="mobile-tab active flex-1 text-center py-2 px-3 text-sm font-medium rounded transition-colors"
                            data-tab="overview">
                        <i class="fas fa-tachometer-alt mr-1"></i>Overview
                    </button>
                    <button onclick="mobileEnhancedDashboard.switchTab('indices')" 
                            class="mobile-tab flex-1 text-center py-2 px-3 text-sm font-medium rounded transition-colors"
                            data-tab="indices">
                        <i class="fas fa-chart-line mr-1"></i>Indices
                    </button>
                    <button onclick="mobileEnhancedDashboard.switchTab('scoring')" 
                            class="mobile-tab flex-1 text-center py-2 px-3 text-sm font-medium rounded transition-colors"
                            data-tab="scoring">
                        <i class="fas fa-calculator mr-1"></i>Scoring
                    </button>
                </div>
            </div>

            <!-- Mobile Content Tabs -->
            <div class="mobile-tab-content">
                <!-- Overview Tab -->
                <div id="mobile-tab-overview" class="mobile-tab-pane active">
                    <div class="space-y-4">
                        <div id="mobile-risk-summary" class="bg-white rounded-lg shadow p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="font-semibold text-gray-900">Risk Summary</h3>
                                <i class="fas fa-sync-alt text-blue-500 cursor-pointer" 
                                   onclick="mobileEnhancedDashboard.refreshSummary()"></i>
                            </div>
                            <div id="mobile-summary-content">Loading...</div>
                        </div>
                        
                        <div id="mobile-alerts-card" class="bg-white rounded-lg shadow p-4">
                            <h3 class="font-semibold text-gray-900 mb-3">Active Alerts</h3>
                            <div id="mobile-alerts-content">Loading...</div>
                        </div>
                    </div>
                </div>

                <!-- Service Indices Tab -->
                <div id="mobile-tab-indices" class="mobile-tab-pane hidden">
                    <div class="space-y-4">
                        <div class="mobile-search-bar bg-white rounded-lg shadow p-3">
                            <div class="flex items-center">
                                <i class="fas fa-search text-gray-400 mr-2"></i>
                                <input type="text" 
                                       placeholder="Search services..." 
                                       class="flex-1 border-none outline-none text-sm"
                                       onkeyup="mobileEnhancedDashboard.filterServices(this.value)">
                            </div>
                        </div>
                        
                        <div id="mobile-services-container" class="space-y-3">
                            <div class="text-center py-4 text-gray-500">
                                <i class="fas fa-spinner fa-spin mb-2"></i>
                                <p class="text-sm">Loading service indices...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Scoring Tab -->
                <div id="mobile-tab-scoring" class="mobile-tab-pane hidden">
                    <div class="space-y-4">
                        <div id="mobile-scoring-calculator" class="bg-white rounded-lg shadow p-4">
                            <h3 class="font-semibold text-gray-900 mb-3">Risk Score Calculator</h3>
                            <div id="mobile-calculator-content">Loading...</div>
                        </div>
                        
                        <div id="mobile-scoring-history" class="bg-white rounded-lg shadow p-4">
                            <h3 class="font-semibold text-gray-900 mb-3">Recent Calculations</h3>
                            <div id="mobile-history-content">No recent calculations</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mobile Quick Actions -->
            <div class="mobile-quick-actions fixed bottom-20 right-4 z-40">
                <div class="flex flex-col space-y-2">
                    <button onclick="mobileEnhancedDashboard.showQuickAnalysis()" 
                            class="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center">
                        <i class="fas fa-bolt"></i>
                    </button>
                    <button onclick="mobileEnhancedDashboard.showSettings()" 
                            class="w-10 h-10 bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        `;

        // Insert container into the page
        const mainContent = document.querySelector('#main-content') || document.body;
        if (document.getElementById('enhanced-services-container')) {
            document.getElementById('enhanced-services-container').parentNode.insertBefore(container, 
                document.getElementById('enhanced-services-container').nextSibling);
        } else {
            mainContent.appendChild(container);
        }
    }

    /**
     * Initialize mobile service indices with swipe navigation
     */
    async initializeMobileServiceIndices() {
        try {
            const services = await this.fetchServicesWithIndices();
            this.serviceCards = services;
            this.renderMobileServiceCards(services);
        } catch (error) {
            console.error('[Mobile-Enhanced] Service indices initialization failed:', error);
            this.showServicesError();
        }
    }

    /**
     * Fetch services with enhanced indices (mobile optimized)
     */
    async fetchServicesWithIndices() {
        try {
            const response = await fetch('/api/services?status=active&limit=10&mobile=true');
            const data = await response.json();
            
            if (!data.services) {
                return [];
            }

            // Get indices for mobile (simplified payload)
            const serviceIds = data.services.map(s => s.id).slice(0, 10); // Limit for mobile
            const indicesPromises = serviceIds.map(async (id) => {
                try {
                    const response = await fetch(`/api/enhanced-risk-engine/service-indices/${id}?mobile=true`);
                    return response.ok ? await response.json() : null;
                } catch (e) {
                    return null;
                }
            });

            const indicesResults = await Promise.all(indicesPromises);
            
            return data.services.map((service, index) => ({
                ...service,
                indices: indicesResults[index]?.indices || null,
                indices_status: indicesResults[index]?.status || 'not_computed'
            }));

        } catch (error) {
            console.error('[Mobile-Enhanced] Failed to fetch services:', error);
            return [];
        }
    }

    /**
     * Render mobile-optimized service cards
     */
    renderMobileServiceCards(services) {
        const container = document.getElementById('mobile-services-container');
        if (!container) return;

        if (services.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
                    <p class="text-gray-500 text-sm">No enhanced services found</p>
                    <button onclick="mobileEnhancedDashboard.refreshServices()" 
                            class="mt-2 text-blue-600 text-sm underline">
                        Refresh Services
                    </button>
                </div>
            `;
            return;
        }

        const cardsHtml = services.map((service, index) => this.renderMobileServiceCard(service, index)).join('');
        
        container.innerHTML = `
            <div class="mobile-service-cards">
                ${cardsHtml}
            </div>
            
            <!-- Mobile Card Navigation Dots -->
            ${services.length > 1 ? `
                <div class="flex justify-center mt-4 space-x-2">
                    ${services.map((_, index) => `
                        <button onclick="mobileEnhancedDashboard.showCard(${index})" 
                                class="card-dot w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}" 
                                data-index="${index}"></button>
                    `).join('')}
                </div>
            ` : ''}
        `;

        this.setupCardSwipeNavigation();
    }

    /**
     * Render individual mobile service card (compact)
     */
    renderMobileServiceCard(service, index) {
        const indices = service.indices;
        const hasIndices = indices && service.indices_status === 'computed';
        
        if (!hasIndices) {
            return `
                <div class="mobile-service-card bg-white rounded-lg shadow p-4 mb-3 ${index > 0 ? 'hidden' : ''}" 
                     data-card-index="${index}">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="font-semibold text-gray-900 truncate">${this.escapeHtml(service.name)}</h4>
                        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">No Data</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">Enhanced indices not computed for this service.</p>
                    <button onclick="mobileEnhancedDashboard.computeIndices(${service.id})" 
                            class="w-full bg-blue-600 text-white py-2 rounded font-medium text-sm">
                        Compute Enhanced Indices
                    </button>
                </div>
            `;
        }

        const compositeScore = indices.composite;
        const riskLevel = this.determineRiskLevel(compositeScore);
        const riskColor = this.getRiskMobileColor(riskLevel);
        
        return `
            <div class="mobile-service-card bg-white rounded-lg shadow p-4 mb-3 ${index > 0 ? 'hidden' : ''}" 
                 data-card-index="${index}"
                 data-service-id="${service.id}">
                
                <!-- Mobile Card Header -->
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-900 truncate flex-1">${this.escapeHtml(service.name)}</h4>
                    <div class="text-right ml-2">
                        <div class="text-xl font-bold ${riskColor}">${compositeScore.toFixed(1)}</div>
                        <div class="text-xs text-gray-500 uppercase">${riskLevel}</div>
                    </div>
                </div>
                
                <!-- Mobile Indices Grid (2x2 compact) -->
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div class="mobile-index-item bg-red-50 p-2 rounded">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold text-red-700">SVI</span>
                            <span class="text-sm font-bold text-red-600">${indices.svi.toFixed(1)}</span>
                        </div>
                        <div class="w-full bg-red-200 rounded-full h-1 mt-1">
                            <div class="bg-red-600 h-1 rounded-full" style="width: ${indices.svi}%"></div>
                        </div>
                    </div>
                    
                    <div class="mobile-index-item bg-orange-50 p-2 rounded">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold text-orange-700">SEI</span>
                            <span class="text-sm font-bold text-orange-600">${indices.sei.toFixed(1)}</span>
                        </div>
                        <div class="w-full bg-orange-200 rounded-full h-1 mt-1">
                            <div class="bg-orange-600 h-1 rounded-full" style="width: ${indices.sei}%"></div>
                        </div>
                    </div>
                    
                    <div class="mobile-index-item bg-blue-50 p-2 rounded">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold text-blue-700">BCI</span>
                            <span class="text-sm font-bold text-blue-600">${indices.bci.toFixed(1)}</span>
                        </div>
                        <div class="w-full bg-blue-200 rounded-full h-1 mt-1">
                            <div class="bg-blue-600 h-1 rounded-full" style="width: ${indices.bci}%"></div>
                        </div>
                    </div>
                    
                    <div class="mobile-index-item bg-purple-50 p-2 rounded">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold text-purple-700">ERI</span>
                            <span class="text-sm font-bold text-purple-600">${indices.eri.toFixed(1)}</span>
                        </div>
                        <div class="w-full bg-purple-200 rounded-full h-1 mt-1">
                            <div class="bg-purple-600 h-1 rounded-full" style="width: ${indices.eri}%"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Mobile Action Buttons -->
                <div class="flex space-x-2">
                    <button onclick="mobileEnhancedDashboard.showExplanation(${service.id})" 
                            class="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium">
                        <i class="fas fa-info-circle mr-1"></i>Explain
                    </button>
                    <button onclick="mobileEnhancedDashboard.showDetails(${service.id})" 
                            class="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm font-medium">
                        <i class="fas fa-eye mr-1"></i>Details
                    </button>
                </div>
                
                <!-- Swipe Indicator (only show for multiple cards) -->
                ${this.serviceCards.length > 1 ? `
                    <div class="text-center mt-2 text-xs text-gray-400">
                        <i class="fas fa-arrows-alt-h"></i> Swipe for more services
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Initialize mobile risk scoring interface
     */
    async initializeMobileScoring() {
        const container = document.getElementById('mobile-calculator-content');
        if (!container) return;
        
        container.innerHTML = `
            <!-- Mobile Scoring Calculator -->
            <div class="space-y-4">
                <!-- Quick Score Input -->
                <div class="bg-gray-50 p-3 rounded">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Quick Risk Assessment</label>
                    <select onchange="mobileEnhancedDashboard.calculateQuickScore(this.value)" 
                            class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <option value="">Select risk scenario...</option>
                        <option value="low">Low Risk Service</option>
                        <option value="medium">Medium Risk Service</option>
                        <option value="high">High Risk Service</option>
                        <option value="critical">Critical Risk Service</option>
                    </select>
                </div>
                
                <!-- Manual Indices Input -->
                <div class="bg-gray-50 p-3 rounded">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Manual Calculation</label>
                    <div class="grid grid-cols-2 gap-2 mb-3">
                        <div>
                            <label class="text-xs text-gray-600">SVI (0-100)</label>
                            <input type="number" min="0" max="100" 
                                   class="w-full border border-gray-300 rounded px-2 py-1 text-sm" 
                                   id="mobile-svi-input" placeholder="0">
                        </div>
                        <div>
                            <label class="text-xs text-gray-600">SEI (0-100)</label>
                            <input type="number" min="0" max="100" 
                                   class="w-full border border-gray-300 rounded px-2 py-1 text-sm" 
                                   id="mobile-sei-input" placeholder="0">
                        </div>
                        <div>
                            <label class="text-xs text-gray-600">BCI (0-100)</label>
                            <input type="number" min="0" max="100" 
                                   class="w-full border border-gray-300 rounded px-2 py-1 text-sm" 
                                   id="mobile-bci-input" placeholder="0">
                        </div>
                        <div>
                            <label class="text-xs text-gray-600">ERI (0-100)</label>
                            <input type="number" min="0" max="100" 
                                   class="w-full border border-gray-300 rounded px-2 py-1 text-sm" 
                                   id="mobile-eri-input" placeholder="0">
                        </div>
                    </div>
                    <button onclick="mobileEnhancedDashboard.calculateManualScore()" 
                            class="w-full bg-blue-600 text-white py-2 rounded font-medium text-sm">
                        Calculate Risk Score
                    </button>
                </div>
                
                <!-- Score Result -->
                <div id="mobile-score-result" class="hidden bg-white border border-gray-200 p-3 rounded">
                    <!-- Score result will be displayed here -->
                </div>
            </div>
        `;
    }

    /**
     * Initialize mobile AI integration
     */
    async initializeMobileAIIntegration() {
        // Enhanced integration with the existing AI assistant chatbot
        if (typeof window.ARIA5 !== 'undefined') {
            console.log('[Mobile-Enhanced] Integrating with ARIA5 AI assistant');
            
            // Add enhanced risk engine prompts to the chatbot
            this.addEnhancedRiskPrompts();
        }
    }

    /**
     * Add enhanced risk engine prompts to AI assistant
     */
    addEnhancedRiskPrompts() {
        // Get existing quick actions container
        const quickActions = document.getElementById('quick-actions');
        if (quickActions) {
            const enhancedActions = document.createElement('div');
            enhancedActions.className = 'flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 mt-2 border-t border-gray-200 pt-2';
            enhancedActions.innerHTML = `
                <button class="quick-action-btn flex-shrink-0" data-prompt="Explain my service risk indices (SVI/SEI/BCI/ERI)">
                    <i class="fas fa-chart-bar text-indigo-500"></i>
                    <span class="hidden sm:inline">Service Indices</span>
                    <span class="sm:hidden">Indices</span>
                </button>
                <button class="quick-action-btn flex-shrink-0" data-prompt="Calculate enhanced risk score for my critical services">
                    <i class="fas fa-calculator text-green-500"></i>
                    <span class="hidden sm:inline">Enhanced Scoring</span>
                    <span class="sm:hidden">Score</span>
                </button>
                <button class="quick-action-btn flex-shrink-0" data-prompt="Show me the explainable AI risk analysis">
                    <i class="fas fa-brain text-purple-500"></i>
                    <span class="hidden sm:inline">AI Analysis</span>
                    <span class="sm:hidden">AI</span>
                </button>
            `;
            
            quickActions.appendChild(enhancedActions);
        }
    }

    /**
     * Setup touch gestures for mobile navigation
     */
    setupTouchGestures() {
        const container = document.getElementById('mobile-services-container');
        if (!container) return;

        container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        container.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = this.touchStartX - touchEndX;
            const deltaY = this.touchStartY - touchEndY;
            
            // Only handle horizontal swipes (avoid conflict with vertical scrolling)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
                if (deltaX > 0) {
                    this.nextCard();
                } else {
                    this.prevCard();
                }
            }

            this.touchStartX = null;
            this.touchStartY = null;
        });
    }

    /**
     * Setup card swipe navigation
     */
    setupCardSwipeNavigation() {
        // Add smooth transition CSS
        const style = document.createElement('style');
        style.textContent = `
            .mobile-service-card {
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
            .mobile-service-card.sliding-out {
                transform: translateX(-100%);
                opacity: 0;
            }
            .mobile-service-card.sliding-in {
                transform: translateX(100%);
                opacity: 0;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup mobile navigation between tabs
     */
    setupMobileNavigation() {
        // Add CSS for mobile tabs
        const style = document.createElement('style');
        style.textContent = `
            .mobile-enhanced-dashboard {
                padding: 1rem;
                max-width: 100%;
                overflow-x: hidden;
            }
            
            .mobile-tab {
                color: rgba(255, 255, 255, 0.7);
                background: transparent;
                border: none;
                cursor: pointer;
            }
            
            .mobile-tab.active {
                color: white;
                background: rgba(255, 255, 255, 0.2);
            }
            
            .mobile-tab-pane {
                display: none;
                animation: fadeIn 0.3s ease;
            }
            
            .mobile-tab-pane.active {
                display: block;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .mobile-quick-actions button {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            }
            
            .mobile-quick-actions button:active {
                transform: scale(0.95);
            }
            
            .card-dot {
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .card-dot:hover {
                transform: scale(1.2);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup mobile performance monitoring
     */
    setupMobilePerformanceMonitoring() {
        // Monitor mobile-specific metrics
        this.performanceMetrics = {
            loadTime: performance.now(),
            touchResponsiveness: [],
            cardSwitchTimes: [],
            apiResponseTimes: []
        };

        // Monitor touch response times
        document.addEventListener('touchstart', () => {
            this.lastTouchStart = performance.now();
        });

        document.addEventListener('touchend', () => {
            if (this.lastTouchStart) {
                const responseTime = performance.now() - this.lastTouchStart;
                this.performanceMetrics.touchResponsiveness.push(responseTime);
                
                // Keep only last 10 measurements
                if (this.performanceMetrics.touchResponsiveness.length > 10) {
                    this.performanceMetrics.touchResponsiveness.shift();
                }
            }
        });
    }

    // Mobile Interaction Methods

    /**
     * Switch between mobile tabs
     */
    switchTab(tabName) {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.mobile-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.mobile-tab-pane').forEach(pane => {
            pane.classList.remove('active');
            pane.style.display = 'none';
        });

        // Activate selected tab and pane
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedPane = document.getElementById(`mobile-tab-${tabName}`);
        
        if (selectedTab && selectedPane) {
            selectedTab.classList.add('active');
            selectedPane.classList.add('active');
            selectedPane.style.display = 'block';
        }

        // Load tab content if needed
        this.loadTabContent(tabName);
    }

    /**
     * Load content for specific tab
     */
    async loadTabContent(tabName) {
        switch (tabName) {
            case 'overview':
                await this.loadMobileOverview();
                break;
            case 'indices':
                // Already loaded in initialization
                break;
            case 'scoring':
                // Already loaded in initialization
                break;
        }
    }

    /**
     * Load mobile overview content
     */
    async loadMobileOverview() {
        const summaryContainer = document.getElementById('mobile-summary-content');
        const alertsContainer = document.getElementById('mobile-alerts-content');
        
        if (summaryContainer) {
            try {
                const response = await fetch('/api/enhanced-risk-engine/mobile-summary');
                if (response.ok) {
                    const data = await response.json();
                    summaryContainer.innerHTML = this.renderMobileSummary(data);
                } else {
                    summaryContainer.innerHTML = this.renderFallbackSummary();
                }
            } catch (error) {
                summaryContainer.innerHTML = this.renderFallbackSummary();
            }
        }

        if (alertsContainer) {
            try {
                const response = await fetch('/api/alerts?mobile=true&limit=5');
                if (response.ok) {
                    const data = await response.json();
                    alertsContainer.innerHTML = this.renderMobileAlerts(data.alerts || []);
                } else {
                    alertsContainer.innerHTML = '<p class="text-sm text-gray-500">No active alerts</p>';
                }
            } catch (error) {
                alertsContainer.innerHTML = '<p class="text-sm text-gray-500">Unable to load alerts</p>';
            }
        }
    }

    /**
     * Navigate to next service card
     */
    nextCard() {
        if (this.currentCard < this.serviceCards.length - 1) {
            this.showCard(this.currentCard + 1);
        }
    }

    /**
     * Navigate to previous service card
     */
    prevCard() {
        if (this.currentCard > 0) {
            this.showCard(this.currentCard - 1);
        }
    }

    /**
     * Show specific service card
     */
    showCard(index) {
        if (index < 0 || index >= this.serviceCards.length) return;

        const startTime = performance.now();
        
        // Hide current card
        const currentCard = document.querySelector(`[data-card-index="${this.currentCard}"]`);
        if (currentCard) {
            currentCard.classList.add('hidden');
        }

        // Show new card
        const newCard = document.querySelector(`[data-card-index="${index}"]`);
        if (newCard) {
            newCard.classList.remove('hidden');
        }

        // Update dots
        document.querySelectorAll('.card-dot').forEach((dot, dotIndex) => {
            dot.classList.toggle('bg-blue-600', dotIndex === index);
            dot.classList.toggle('bg-gray-300', dotIndex !== index);
        });

        this.currentCard = index;
        
        // Track performance
        const switchTime = performance.now() - startTime;
        this.performanceMetrics.cardSwitchTimes.push(switchTime);
    }

    // Mobile Utility Methods

    /**
     * Show mobile explanation modal
     */
    async showExplanation(serviceId) {
        this.showMobileModal('scoring-explanation', `
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-3">Risk Score Explanation</h3>
                <div class="space-y-3">
                    <div class="bg-gray-50 p-3 rounded">
                        <div class="text-sm font-medium text-gray-900 mb-1">0-100 Normalized Scoring</div>
                        <div class="text-xs text-gray-600">All indices use consistent 0-100 scale for accurate comparison and mathematical operations.</div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between py-1 border-b border-gray-100">
                            <span class="text-sm text-red-700 font-medium">SVI - Service Vulnerability Index</span>
                            <span class="text-xs text-gray-500">Vulnerability Assessment</span>
                        </div>
                        <div class="flex items-center justify-between py-1 border-b border-gray-100">
                            <span class="text-sm text-orange-700 font-medium">SEI - Security Event Index</span>
                            <span class="text-xs text-gray-500">Security Incident History</span>
                        </div>
                        <div class="flex items-center justify-between py-1 border-b border-gray-100">
                            <span class="text-sm text-blue-700 font-medium">BCI - Business Context Index</span>
                            <span class="text-xs text-gray-500">Business Impact Weight</span>
                        </div>
                        <div class="flex items-center justify-between py-1">
                            <span class="text-sm text-purple-700 font-medium">ERI - External Risk Index</span>
                            <span class="text-xs text-gray-500">External Threat Landscape</span>
                        </div>
                    </div>
                </div>
                <button onclick="mobileEnhancedDashboard.closeMobileModal()" 
                        class="w-full mt-4 bg-blue-600 text-white py-2 rounded font-medium">
                    Close
                </button>
            </div>
        `);
    }

    /**
     * Show service details in mobile modal
     */
    async showDetails(serviceId) {
        try {
            const response = await fetch(`/api/services/${serviceId}?mobile=true`);
            if (!response.ok) throw new Error('Failed to fetch service details');
            
            const service = await response.json();
            
            this.showMobileModal('service-details', `
                <div class="p-4">
                    <h3 class="text-lg font-semibold mb-3">${this.escapeHtml(service.name)}</h3>
                    <div class="space-y-3">
                        <div class="bg-gray-50 p-3 rounded">
                            <div class="text-sm font-medium text-gray-900 mb-1">Service Information</div>
                            <div class="text-xs text-gray-600 space-y-1">
                                <div>Status: <span class="font-medium">${service.status}</span></div>
                                <div>Type: <span class="font-medium">${service.type || 'Not specified'}</span></div>
                                <div>Last Updated: <span class="font-medium">${new Date(service.updated_at).toLocaleString()}</span></div>
                            </div>
                        </div>
                        <div class="bg-blue-50 p-3 rounded">
                            <div class="text-sm font-medium text-blue-900 mb-1">Enhanced Risk Engine</div>
                            <div class="text-xs text-blue-700">Service is monitored by the Enhanced Risk Engine with real-time indices calculation.</div>
                        </div>
                    </div>
                    <button onclick="mobileEnhancedDashboard.closeMobileModal()" 
                            class="w-full mt-4 bg-blue-600 text-white py-2 rounded font-medium">
                        Close
                    </button>
                </div>
            `);
        } catch (error) {
            this.showMobileModal('error', `
                <div class="p-4 text-center">
                    <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
                    <p class="text-gray-600 mb-4">Unable to load service details</p>
                    <button onclick="mobileEnhancedDashboard.closeMobileModal()" 
                            class="bg-gray-600 text-white py-2 px-4 rounded font-medium">
                        Close
                    </button>
                </div>
            `);
        }
    }

    /**
     * Calculate quick risk score
     */
    calculateQuickScore(scenario) {
        if (!scenario) return;
        
        const scenarios = {
            low: { svi: 15, sei: 10, bci: 25, eri: 20 },
            medium: { svi: 45, sei: 40, bci: 50, eri: 35 },
            high: { svi: 75, sei: 70, bci: 80, eri: 65 },
            critical: { svi: 90, sei: 85, bci: 95, eri: 88 }
        };
        
        const indices = scenarios[scenario];
        if (!indices) return;
        
        const composite = (indices.svi * 0.3 + indices.sei * 0.25 + indices.bci * 0.25 + indices.eri * 0.2);
        
        this.displayMobileScoreResult({
            scenario: scenario.charAt(0).toUpperCase() + scenario.slice(1),
            indices,
            composite,
            explanation: `Quick assessment for ${scenario} risk scenario using standard weightings.`
        });
    }

    /**
     * Calculate manual risk score from inputs
     */
    calculateManualScore() {
        const svi = parseFloat(document.getElementById('mobile-svi-input')?.value || 0);
        const sei = parseFloat(document.getElementById('mobile-sei-input')?.value || 0);
        const bci = parseFloat(document.getElementById('mobile-bci-input')?.value || 0);
        const eri = parseFloat(document.getElementById('mobile-eri-input')?.value || 0);
        
        if (svi === 0 && sei === 0 && bci === 0 && eri === 0) {
            alert('Please enter at least one index value');
            return;
        }
        
        const composite = (svi * 0.3 + sei * 0.25 + bci * 0.25 + eri * 0.2);
        
        this.displayMobileScoreResult({
            scenario: 'Manual Calculation',
            indices: { svi, sei, bci, eri },
            composite,
            explanation: 'Manual calculation using Enhanced Risk Engine weightings (SVI: 30%, SEI: 25%, BCI: 25%, ERI: 20%)'
        });
    }

    /**
     * Display score result in mobile interface
     */
    displayMobileScoreResult(result) {
        const container = document.getElementById('mobile-score-result');
        if (!container) return;
        
        const riskLevel = this.determineRiskLevel(result.composite);
        const riskColor = this.getRiskMobileColor(riskLevel);
        
        container.innerHTML = `
            <div class="text-center mb-3">
                <div class="text-2xl font-bold ${riskColor} mb-1">${result.composite.toFixed(1)}</div>
                <div class="text-sm text-gray-600">${result.scenario}</div>
            </div>
            
            <div class="grid grid-cols-4 gap-1 mb-3">
                <div class="text-center">
                    <div class="text-xs text-red-600 font-medium">SVI</div>
                    <div class="text-sm font-semibold">${result.indices.svi}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-orange-600 font-medium">SEI</div>
                    <div class="text-sm font-semibold">${result.indices.sei}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-blue-600 font-medium">BCI</div>
                    <div class="text-sm font-semibold">${result.indices.bci}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-purple-600 font-medium">ERI</div>
                    <div class="text-sm font-semibold">${result.indices.eri}</div>
                </div>
            </div>
            
            <div class="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                ${result.explanation}
            </div>
            
            <div class="flex space-x-2 mt-3">
                <button onclick="mobileEnhancedDashboard.saveCalculation(${JSON.stringify(result).replace(/"/g, '&quot;')})" 
                        class="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium">
                    Save Result
                </button>
                <button onclick="mobileEnhancedDashboard.shareResult(${JSON.stringify(result).replace(/"/g, '&quot;')})" 
                        class="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium">
                    Share
                </button>
            </div>
        `;
        
        container.classList.remove('hidden');
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Add to calculation history
        this.addToCalculationHistory(result);
    }

    // Utility Methods

    /**
     * Show mobile modal with content
     */
    showMobileModal(type, content) {
        // Remove existing modal
        const existingModal = document.getElementById('mobile-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create new modal
        const modal = document.createElement('div');
        modal.id = 'mobile-modal';
        modal.className = 'fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white w-full sm:w-96 sm:rounded-lg max-h-90vh overflow-y-auto">
                ${content}
            </div>
        `;

        document.body.appendChild(modal);
        this.isModalOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeMobileModal();
            }
        });
    }

    /**
     * Close mobile modal
     */
    closeMobileModal() {
        const modal = document.getElementById('mobile-modal');
        if (modal) {
            modal.remove();
        }
        this.isModalOpen = false;
        document.body.style.overflow = '';
    }

    /**
     * Determine risk level from score
     */
    determineRiskLevel(score) {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    /**
     * Get mobile-optimized risk color classes
     */
    getRiskMobileColor(level) {
        const colors = {
            low: 'text-green-600',
            medium: 'text-yellow-600',
            high: 'text-orange-600',
            critical: 'text-red-600'
        };
        return colors[level] || 'text-gray-600';
    }

    /**
     * Escape HTML for security
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show mobile fallback when enhanced features not available
     */
    showMobileFallback() {
        const container = document.createElement('div');
        container.className = 'mobile-fallback bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4';
        container.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-3"></i>
                <div>
                    <h3 class="font-semibold text-yellow-800">Enhanced Risk Engine Unavailable</h3>
                    <p class="text-sm text-yellow-700 mt-1">
                        The Enhanced Risk Engine features are not available. Using standard risk intelligence.
                    </p>
                    <button onclick="mobileEnhancedDashboard.checkAvailability()" 
                            class="mt-2 text-yellow-800 text-sm underline">
                        Check Again
                    </button>
                </div>
            </div>
        `;
        
        const mainContent = document.querySelector('#main-content') || document.body;
        mainContent.appendChild(container);
    }

    /**
     * Check enhanced availability again
     */
    async checkAvailability() {
        const fallback = document.querySelector('.mobile-fallback');
        if (fallback) {
            fallback.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-spinner fa-spin text-blue-600 mr-2"></i>
                    <span class="text-sm text-gray-600">Checking Enhanced Risk Engine...</span>
                </div>
            `;
        }
        
        setTimeout(async () => {
            const isAvailable = await this.checkEnhancedAvailability();
            if (isAvailable) {
                if (fallback) fallback.remove();
                await this.initialize();
            } else {
                if (fallback) {
                    fallback.innerHTML = `
                        <div class="text-center">
                            <i class="fas fa-times text-red-600 mb-2"></i>
                            <p class="text-sm text-red-700">Enhanced Risk Engine still unavailable</p>
                        </div>
                    `;
                }
            }
        }, 1000);
    }

    // Additional mobile methods can be added here...
}

// Initialize mobile enhanced dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if on mobile or specifically requested
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth < 768;
    
    if (isMobile || window.location.search.includes('mobile=true')) {
        console.log('[Mobile-Enhanced] Initializing Mobile Enhanced Risk Dashboard');
        window.mobileEnhancedDashboard = new MobileEnhancedRiskDashboard();
        window.mobileEnhancedDashboard.initialize();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileEnhancedRiskDashboard;
}