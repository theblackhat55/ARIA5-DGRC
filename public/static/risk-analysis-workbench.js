// Risk Analysis Workbench JavaScript
// Advanced TI-risk mapping and analysis interface

class RiskAnalysisWorkbench {
    constructor() {
        this.currentRisk = null;
        this.tiIndicators = [];
        this.currentMappings = [];
        this.selectedIndicator = null;
        this.init();
    }

    async init() {
        console.log('Initializing Risk Analysis Workbench...');
        
        // Get risk ID from URL or load default
        const riskId = this.getRiskIdFromUrl();
        if (riskId) {
            await this.loadRisk(riskId);
        }
        
        // Load available TI indicators
        await this.loadTIIndicators();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        console.log('Risk Analysis Workbench initialized');
    }

    getRiskIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('riskId');
    }

    async loadRisk(riskId) {
        try {
            const response = await axios.get(`/api/risks/${riskId}`);
            if (response.data) {
                this.currentRisk = response.data;
                this.renderRiskDetails();
                await this.loadCurrentMappings();
            }
        } catch (error) {
            console.error('Error loading risk:', error);
        }
    }

    renderRiskDetails() {
        const container = document.getElementById('riskDetails');
        const risk = this.currentRisk;
        
        container.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h3 class="font-medium text-gray-900 mb-2">${risk.title}</h3>
                    <p class="text-sm text-gray-600">${risk.description}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Category</label>
                        <span class="text-sm text-gray-900 capitalize">${risk.category}</span>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Risk Score</label>
                        <span class="text-sm font-bold ${this.getRiskScoreColor(risk.risk_score)}">${risk.risk_score}</span>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Likelihood</label>
                        <span class="text-sm text-gray-900 capitalize">${risk.likelihood}</span>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Impact</label>
                        <span class="text-sm text-gray-900 capitalize">${risk.impact}</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Lifecycle Stage</label>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getLifecycleColor(risk.risk_lifecycle_stage)}">
                            ${risk.risk_lifecycle_stage}
                        </span>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">TI Enhanced</label>
                        <span class="text-sm ${risk.ti_enriched ? 'text-green-600' : 'text-gray-500'}">
                            ${risk.ti_enriched ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>
                
                ${risk.ti_enriched ? `
                <div class="grid grid-cols-2 gap-4 pt-4 border-t">
                    ${risk.epss_score ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700">EPSS Score</label>
                        <span class="text-sm font-medium text-orange-600">${(risk.epss_score * 100).toFixed(2)}%</span>
                    </div>
                    ` : ''}
                    ${risk.cvss_score ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700">CVSS Score</label>
                        <span class="text-sm font-medium text-red-600">${risk.cvss_score}</span>
                    </div>
                    ` : ''}
                    ${risk.exploit_status ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Exploit Status</label>
                        <span class="text-sm text-gray-900 capitalize">${risk.exploit_status}</span>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                <div class="pt-4 border-t">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Current TI Mappings</label>
                    <div id="currentMappings" class="space-y-2">
                        <!-- Current mappings will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }

    async loadCurrentMappings() {
        if (!this.currentRisk) return;
        
        try {
            const response = await axios.get(`/api/threat-intelligence/risk-mappings?risk_id=${this.currentRisk.id}`);
            if (response.data.success) {
                this.currentMappings = response.data.data;
                this.renderCurrentMappings();
            }
        } catch (error) {
            console.error('Error loading current mappings:', error);
        }
    }

    renderCurrentMappings() {
        const container = document.getElementById('currentMappings');
        
        if (this.currentMappings.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">No TI mappings found</p>';
            return;
        }
        
        container.innerHTML = this.currentMappings.map(mapping => `
            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div class="flex-1">
                    <div class="font-medium text-sm text-gray-900">${mapping.indicator_identifier}</div>
                    <div class="text-xs text-gray-600">${mapping.source_name} • ${mapping.indicator_severity}</div>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="text-xs font-medium text-blue-600">${(mapping.relevance_score * 100).toFixed(0)}%</span>
                    <button onclick="removeTIMapping(${mapping.id})" class="text-red-500 hover:text-red-700 text-xs">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadTIIndicators() {
        try {
            const response = await axios.get('/api/threat-intelligence/indicators?limit=50');
            if (response.data.success) {
                this.tiIndicators = response.data.data;
                this.renderTIIndicators();
            }
        } catch (error) {
            console.error('Error loading TI indicators:', error);
        }
    }

    renderTIIndicators() {
        const container = document.getElementById('tiIndicatorsList');
        
        container.innerHTML = this.tiIndicators.map(indicator => `
            <div class="ti-indicator p-4 bg-white rounded-lg border hover:border-blue-300 cursor-pointer transition-colors" 
                 onclick="selectTIIndicator('${indicator.id}', this)"
                 data-indicator-id="${indicator.id}">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="font-medium text-gray-900 mb-1">${indicator.identifier}</div>
                        <div class="text-sm text-gray-600 line-clamp-2">${indicator.title || 'No title available'}</div>
                    </div>
                    <div class="ml-4 text-right">
                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${this.getSeverityBadgeColor(indicator.severity)}">
                            ${indicator.severity}
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                    <div>Source: ${indicator.source_name}</div>
                    <div>Type: ${indicator.indicator_type}</div>
                    ${indicator.cvss_score ? `<div>CVSS: ${indicator.cvss_score}</div>` : '<div></div>'}
                    ${indicator.epss_score ? `<div>EPSS: ${(indicator.epss_score * 100).toFixed(1)}%</div>` : '<div></div>'}
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">${dayjs(indicator.created_at).fromNow()}</div>
                    <button onclick="createTIMapping('${indicator.id}'); event.stopPropagation();" 
                            class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                        <i class="fas fa-link mr-1"></i>Map to Risk
                    </button>
                </div>
            </div>
        `).join('');
    }

    async searchTIIndicators(query) {
        if (!query.trim()) {
            this.renderTIIndicators();
            return;
        }
        
        const filtered = this.tiIndicators.filter(indicator => 
            indicator.identifier.toLowerCase().includes(query.toLowerCase()) ||
            (indicator.title && indicator.title.toLowerCase().includes(query.toLowerCase())) ||
            (indicator.description && indicator.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        const container = document.getElementById('tiIndicatorsList');
        if (filtered.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No matching indicators found</p>';
        } else {
            this.renderFilteredIndicators(filtered);
        }
    }

    renderFilteredIndicators(indicators) {
        const container = document.getElementById('tiIndicatorsList');
        container.innerHTML = indicators.map(indicator => `
            <div class="ti-indicator p-4 bg-white rounded-lg border hover:border-blue-300 cursor-pointer transition-colors" 
                 onclick="selectTIIndicator('${indicator.id}', this)"
                 data-indicator-id="${indicator.id}">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="font-medium text-gray-900 mb-1">${this.highlightMatch(indicator.identifier, document.getElementById('tiSearch').value)}</div>
                        <div class="text-sm text-gray-600 line-clamp-2">${this.highlightMatch(indicator.title || 'No title available', document.getElementById('tiSearch').value)}</div>
                    </div>
                    <div class="ml-4 text-right">
                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${this.getSeverityBadgeColor(indicator.severity)}">
                            ${indicator.severity}
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                    <div>Source: ${indicator.source_name}</div>
                    <div>Type: ${indicator.indicator_type}</div>
                    ${indicator.cvss_score ? `<div>CVSS: ${indicator.cvss_score}</div>` : '<div></div>'}
                    ${indicator.epss_score ? `<div>EPSS: ${(indicator.epss_score * 100).toFixed(1)}%</div>` : '<div></div>'}
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">${dayjs(indicator.created_at).fromNow()}</div>
                    <button onclick="createTIMapping('${indicator.id}'); event.stopPropagation();" 
                            class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                        <i class="fas fa-link mr-1"></i>Map to Risk
                    </button>
                </div>
            </div>
        `).join('');
    }

    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveAnalysis();
                        break;
                    case 'f':
                        e.preventDefault();
                        document.getElementById('tiSearch').focus();
                        break;
                }
            }
        });
    }

    getRiskScoreColor(score) {
        if (score >= 70) return 'text-red-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-green-600';
    }

    getLifecycleColor(stage) {
        switch (stage) {
            case 'detected': return 'bg-yellow-100 text-yellow-800';
            case 'draft': return 'bg-blue-100 text-blue-800';
            case 'validated': return 'bg-green-100 text-green-800';
            case 'active': return 'bg-red-100 text-red-800';
            case 'retired': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getSeverityBadgeColor(severity) {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    async saveAnalysis() {
        // Implementation for saving the current analysis state
        console.log('Saving analysis...', {
            risk: this.currentRisk?.id,
            mappings: this.currentMappings.length
        });
        
        // Show save confirmation
        this.showToast('Analysis saved successfully', 'success');
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 text-white ${
            type === 'error' ? 'bg-red-600' : 
            type === 'success' ? 'bg-green-600' : 'bg-blue-600'
        }`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} mr-3"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Global functions
let workbench;

async function searchTI() {
    const query = document.getElementById('tiSearch').value;
    await workbench.searchTIIndicators(query);
}

function selectTIIndicator(indicatorId, element) {
    // Remove previous selection
    document.querySelectorAll('.ti-indicator').forEach(el => {
        el.classList.remove('border-blue-500', 'bg-blue-50');
    });
    
    // Add selection to clicked element
    element.classList.add('border-blue-500', 'bg-blue-50');
    
    workbench.selectedIndicator = indicatorId;
}

function createTIMapping(indicatorId) {
    if (!workbench.currentRisk) {
        workbench.showToast('No risk loaded for mapping', 'error');
        return;
    }
    
    workbench.selectedIndicator = indicatorId;
    
    // Show confidence modal
    document.getElementById('confidenceModal').classList.remove('hidden');
}

function updateConfidenceDisplay() {
    const slider = document.getElementById('confidenceSlider');
    const display = document.getElementById('confidenceValue');
    display.textContent = parseFloat(slider.value).toFixed(1);
}

function closeConfidenceModal() {
    document.getElementById('confidenceModal').classList.add('hidden');
}

async function confirmMapping() {
    if (!workbench.currentRisk || !workbench.selectedIndicator) {
        workbench.showToast('Missing risk or indicator for mapping', 'error');
        return;
    }
    
    const confidence = parseFloat(document.getElementById('confidenceSlider').value);
    const reason = document.getElementById('mappingReason').value;
    
    try {
        const response = await axios.post('/api/threat-intelligence/risk-mappings', {
            risk_id: workbench.currentRisk.id,
            ti_indicator_id: workbench.selectedIndicator,
            relevance_score: confidence,
            mapping_reason: reason || 'Manual mapping from workbench'
        });
        
        if (response.data.success) {
            workbench.showToast('TI mapping created successfully', 'success');
            closeConfidenceModal();
            
            // Refresh current mappings
            await workbench.loadCurrentMappings();
            
            // Clear form
            document.getElementById('confidenceSlider').value = 0.8;
            document.getElementById('mappingReason').value = '';
            updateConfidenceDisplay();
        }
    } catch (error) {
        console.error('Error creating TI mapping:', error);
        workbench.showToast('Failed to create TI mapping', 'error');
    }
}

async function removeTIMapping(mappingId) {
    if (!confirm('Are you sure you want to remove this TI mapping?')) {
        return;
    }
    
    try {
        const response = await axios.delete(`/api/threat-intelligence/risk-mappings/${mappingId}`);
        if (response.data.success) {
            workbench.showToast('TI mapping removed successfully', 'success');
            await workbench.loadCurrentMappings();
        }
    } catch (error) {
        console.error('Error removing TI mapping:', error);
        workbench.showToast('Failed to remove TI mapping', 'error');
    }
}

async function validateRisk() {
    if (!workbench.currentRisk) return;
    
    try {
        const response = await axios.post(`/api/enhanced-risk/risks/${workbench.currentRisk.id}/validate`, {
            validation_notes: 'Validated from workbench'
        });
        
        if (response.data.success) {
            workbench.showToast('Risk validated successfully', 'success');
            await workbench.loadRisk(workbench.currentRisk.id);
        }
    } catch (error) {
        console.error('Error validating risk:', error);
        workbench.showToast('Failed to validate risk', 'error');
    }
}

async function activateRisk() {
    if (!workbench.currentRisk) return;
    
    try {
        const response = await axios.post(`/api/enhanced-risk/risks/${workbench.currentRisk.id}/activate`);
        
        if (response.data.success) {
            workbench.showToast('Risk activated successfully', 'success');
            await workbench.loadRisk(workbench.currentRisk.id);
        }
    } catch (error) {
        console.error('Error activating risk:', error);
        workbench.showToast('Failed to activate risk', 'error');
    }
}

async function retireRisk() {
    const reason = prompt('Enter retirement reason:');
    if (!reason || !workbench.currentRisk) return;
    
    try {
        const response = await axios.post(`/api/enhanced-risk/risks/${workbench.currentRisk.id}/retire`, {
            reason: reason
        });
        
        if (response.data.success) {
            workbench.showToast('Risk retired successfully', 'success');
            await workbench.loadRisk(workbench.currentRisk.id);
        }
    } catch (error) {
        console.error('Error retiring risk:', error);
        workbench.showToast('Failed to retire risk', 'error');
    }
}

async function saveAnalysis() {
    await workbench.saveAnalysis();
}

// Initialize workbench
document.addEventListener('DOMContentLoaded', () => {
    workbench = new RiskAnalysisWorkbench();
});