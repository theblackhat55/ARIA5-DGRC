import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { cleanLayout } from '../templates/layout-clean.ts';
import { html } from 'hono/html';

// Types for evidence collection
interface ComplianceEvidence {
  id: number;
  framework: string;
  requirement: string;
  evidence_type: string;
  description: string;
  collection_method: string;
  confidence_score: number;
  status: 'draft' | 'collected' | 'verified' | 'approved';
  collected_at?: string;
  expires_at?: string;
  file_path?: string;
  metadata?: any;
  created_at: string;
}

interface AuditPackage {
  id: number;
  title: string;
  description: string;
  scope: string;
  frameworks: string[];
  status: 'draft' | 'in_progress' | 'ready' | 'submitted';
  evidence_count: number;
  completion_percentage: number;
  created_at: string;
  due_date?: string;
  audit_date?: string;
}

interface PredictiveInsight {
  id: number;
  type: 'risk_forecast' | 'compliance_gap' | 'control_effectiveness' | 'threat_prediction';
  title: string;
  description: string;
  confidence: number;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  time_horizon: string; // e.g., "30 days", "3 months"
  recommendations: string[];
  created_at: string;
  expires_at?: string;
}

const app = new Hono();

// Main AI Insights Page with Tab Navigation
app.get('/ai-insights', async (c) => {
  const tab = c.req.query('tab') || 'evidence';
  
  // Check authentication
  const sessionToken = getCookie(c, 'aria_session');
  if (!sessionToken) {
    return c.redirect('/login');
  }

  let user;
  try {
    const userResult = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(1).first();
    user = userResult || { username: 'Test User', role: 'user' };
  } catch (error) {
    console.error('Database error:', error);
    user = { username: 'Test User', role: 'user' };
  }

  const content = renderAIInsightsPage(tab);

  return c.html(
    cleanLayout({
      title: 'AI Insights Platform',
      content,
      user
    })
  );
});

// Evidence Collection API endpoint
app.post('/api/evidence/collect', async (c) => {
  try {
    const { framework, requirements } = await c.req.json();
    
    // Simulate evidence collection with AI analysis
    const evidence = await collectComplianceEvidence(framework, requirements, c.env.DB);
    
    return c.json({
      success: true,
      evidence,
      message: `Successfully collected evidence for ${evidence.length} requirements`
    });
  } catch (error) {
    console.error('Evidence collection error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to collect evidence' 
    }, 500);
  }
});

// Audit Package Generation API
app.post('/api/audit/generate-package', async (c) => {
  try {
    const { title, scope, frameworks } = await c.req.json();
    
    const auditPackage = await generateAuditPackage(title, scope, frameworks, c.env.DB);
    
    return c.json({
      success: true,
      package: auditPackage,
      message: 'Audit package generated successfully'
    });
  } catch (error) {
    console.error('Audit package generation error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to generate audit package' 
    }, 500);
  }
});

// Predictive Analytics API
app.get('/api/analytics/predictions', async (c) => {
  try {
    const predictions = await getPredictiveInsights(c.env.DB);
    
    return c.json({
      success: true,
      predictions
    });
  } catch (error) {
    console.error('Predictive analytics error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch predictions' 
    }, 500);
  }
});

// Mobile Analytics Dashboard API
app.get('/api/mobile/dashboard-data', async (c) => {
  try {
    const dashboardData = await getMobileDashboardData(c.env.DB);
    
    return c.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Mobile dashboard error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    }, 500);
  }
});

// Render the main AI Insights page
function renderAIInsightsPage(activeTab: string) {
  return html`
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <!-- Header Section -->
      <div class="bg-white shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center">
                <i class="fas fa-robot text-purple-600 mr-3"></i>
                AI-Native Intelligence Platform
              </h1>
              <p class="mt-2 text-gray-600">Advanced AI-powered evidence collection, executive intelligence, and predictive analytics</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <i class="fas fa-check-circle mr-1"></i>
                Phase 4-8 Active
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex space-x-8 overflow-x-auto">
            <a href="/ai-insights?tab=evidence" 
               class="tab-link whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'evidence' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
              <i class="fas fa-folder-plus mr-2"></i>
              Evidence Collection
            </a>
            <a href="/ai-insights?tab=audit-packages" 
               class="tab-link whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'audit-packages' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
              <i class="fas fa-clipboard-list mr-2"></i>
              Audit Packages
            </a>
            <a href="/ai-insights?tab=predictive" 
               class="tab-link whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'predictive' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
              <i class="fas fa-chart-area mr-2"></i>
              Predictive Analytics
            </a>
            <a href="/ai-insights?tab=mobile" 
               class="tab-link whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'mobile' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
              <i class="fas fa-mobile-alt mr-2"></i>
              Mobile Analytics
            </a>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        ${activeTab === 'evidence' ? renderEvidenceCollectionTab() : ''}
        ${activeTab === 'audit-packages' ? renderAuditPackagesTab() : ''}
        ${activeTab === 'predictive' ? renderPredictiveAnalyticsTab() : ''}
        ${activeTab === 'mobile' ? renderMobileAnalyticsTab() : ''}
      </div>
    </div>

    <script>
      // AI Insights JavaScript functionality
      class AIInsightsPlatform {
        constructor() {
          this.initializeFeatures();
        }

        initializeFeatures() {
          console.log('🤖 Initializing AI Insights Platform');
          
          // Bind evidence collection form
          const evidenceForm = document.getElementById('evidence-collection-form');
          if (evidenceForm) {
            evidenceForm.addEventListener('submit', (e) => this.handleEvidenceCollection(e));
          }
          
          // Bind audit package form
          const auditForm = document.getElementById('audit-package-form');
          if (auditForm) {
            auditForm.addEventListener('submit', (e) => this.handleAuditPackageGeneration(e));
          }
          
          // Load predictive analytics if on that tab
          if (window.location.href.includes('tab=predictive')) {
            this.loadPredictiveAnalytics();
          }
          
          // Load mobile dashboard if on that tab
          if (window.location.href.includes('tab=mobile')) {
            this.loadMobileDashboard();
          }
        }

        async handleEvidenceCollection(e) {
          e.preventDefault();
          const formData = new FormData(e.target);
          const framework = formData.get('framework');
          const requirements = formData.get('requirements').split('\\n').filter(r => r.trim());
          
          try {
            const response = await fetch('/api/evidence/collect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ framework, requirements })
            });
            
            const result = await response.json();
            
            if (result.success) {
              this.showSuccessMessage(\`Evidence collected: \${result.evidence.length} items\`);
              this.refreshEvidenceList();
            } else {
              this.showErrorMessage(result.error || 'Failed to collect evidence');
            }
          } catch (error) {
            console.error('Evidence collection error:', error);
            this.showErrorMessage('Network error occurred');
          }
        }

        async handleAuditPackageGeneration(e) {
          e.preventDefault();
          const formData = new FormData(e.target);
          
          try {
            const response = await fetch('/api/audit/generate-package', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: formData.get('title'),
                scope: formData.get('scope'),
                frameworks: formData.get('frameworks').split(',').map(f => f.trim())
              })
            });
            
            const result = await response.json();
            
            if (result.success) {
              this.showSuccessMessage('Audit package generated successfully');
              this.refreshAuditPackages();
            } else {
              this.showErrorMessage(result.error || 'Failed to generate audit package');
            }
          } catch (error) {
            console.error('Audit package generation error:', error);
            this.showErrorMessage('Network error occurred');
          }
        }

        async loadPredictiveAnalytics() {
          try {
            const response = await fetch('/api/analytics/predictions');
            const result = await response.json();
            
            if (result.success) {
              this.renderPredictions(result.predictions);
            }
          } catch (error) {
            console.error('Failed to load predictions:', error);
          }
        }

        async loadMobileDashboard() {
          try {
            const response = await fetch('/api/mobile/dashboard-data');
            const result = await response.json();
            
            if (result.success) {
              this.renderMobileDashboard(result.data);
            }
          } catch (error) {
            console.error('Failed to load mobile dashboard:', error);
          }
        }

        showSuccessMessage(message) {
          const alert = document.createElement('div');
          alert.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          alert.innerHTML = \`<i class="fas fa-check-circle mr-2"></i>\${message}\`;
          document.body.appendChild(alert);
          setTimeout(() => alert.remove(), 5000);
        }

        showErrorMessage(message) {
          const alert = document.createElement('div');
          alert.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          alert.innerHTML = \`<i class="fas fa-exclamation-circle mr-2"></i>\${message}\`;
          document.body.appendChild(alert);
          setTimeout(() => alert.remove(), 5000);
        }

        refreshEvidenceList() {
          // Refresh evidence list via HTMX or reload
          console.log('Refreshing evidence list...');
        }

        refreshAuditPackages() {
          // Refresh audit packages list
          console.log('Refreshing audit packages...');
        }

        renderPredictions(predictions) {
          // Render predictions in the UI
          console.log('Rendering predictions:', predictions);
        }

        renderMobileDashboard(data) {
          // Render mobile dashboard
          console.log('Rendering mobile dashboard:', data);
        }
      }

      // Initialize AI Insights Platform
      document.addEventListener('DOMContentLoaded', () => {
        window.aiInsights = new AIInsightsPlatform();
      });
    </script>
  `;
}

function renderEvidenceCollectionTab() {
  return html`
    <div class="space-y-8">
      <!-- Evidence Collection Form -->
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-robot text-blue-500 mr-3"></i>
              AI Evidence Collection Engine
            </h2>
            <p class="text-gray-600 mt-1">Automated compliance evidence gathering with AI analysis</p>
          </div>
          <div class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            <i class="fas fa-lightning-bolt mr-1"></i>
            Phase 4 Active
          </div>
        </div>

        <form id="evidence-collection-form" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="framework" class="block text-sm font-medium text-gray-700 mb-2">
                Compliance Framework
              </label>
              <select id="framework" name="framework" required
                      class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select Framework</option>
                <option value="ISO27001">ISO 27001</option>
                <option value="SOC2">SOC 2 Type II</option>
                <option value="NIST">NIST Cybersecurity Framework</option>
                <option value="GDPR">GDPR</option>
                <option value="HIPAA">HIPAA</option>
                <option value="PCI-DSS">PCI DSS</option>
                <option value="Custom">Custom Framework</option>
              </select>
            </div>
            
            <div>
              <label for="collection-method" class="block text-sm font-medium text-gray-700 mb-2">
                Collection Method
              </label>
              <select id="collection-method" name="method"
                      class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="automated">Automated Scanning</option>
                <option value="api-integration">API Integration</option>
                <option value="document-analysis">Document Analysis</option>
                <option value="hybrid">Hybrid Approach</option>
              </select>
            </div>
          </div>

          <div>
            <label for="requirements" class="block text-sm font-medium text-gray-700 mb-2">
              Specific Requirements (one per line)
            </label>
            <textarea id="requirements" name="requirements" rows="6" placeholder="Enter compliance requirements to collect evidence for..." 
                      class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
          </div>

          <div class="flex items-center justify-between pt-4">
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input type="checkbox" name="ai-enhancement" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700">Enable AI Enhancement</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" name="auto-verify" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700">Auto-verify Evidence</span>
              </label>
            </div>
            
            <button type="submit" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
              <i class="fas fa-search"></i>
              <span>Collect Evidence</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Evidence Collection Results -->
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <i class="fas fa-folder-open text-green-500 mr-3"></i>
          Recent Evidence Collection
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${renderEvidenceCards()}
        </div>
      </div>

      <!-- Collection Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-lg font-medium">Evidence Collected</h4>
              <p class="text-3xl font-bold mt-2">1,247</p>
              <p class="text-blue-200 text-sm mt-1">+12% this week</p>
            </div>
            <i class="fas fa-folder-plus text-4xl opacity-60"></i>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-lg font-medium">Verified Items</h4>
              <p class="text-3xl font-bold mt-2">1,089</p>
              <p class="text-green-200 text-sm mt-1">87% accuracy</p>
            </div>
            <i class="fas fa-check-circle text-4xl opacity-60"></i>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-lg font-medium">AI Confidence</h4>
              <p class="text-3xl font-bold mt-2">94.2%</p>
              <p class="text-purple-200 text-sm mt-1">High reliability</p>
            </div>
            <i class="fas fa-brain text-4xl opacity-60"></i>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-lg font-medium">Time Saved</h4>
              <p class="text-3xl font-bold mt-2">340h</p>
              <p class="text-orange-200 text-sm mt-1">This month</p>
            </div>
            <i class="fas fa-clock text-4xl opacity-60"></i>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAuditPackagesTab() {
  return html`
    <div class="space-y-8">
      <!-- Audit Package Generation Form -->
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-clipboard-list text-green-500 mr-3"></i>
              AI Audit Package Generator
            </h2>
            <p class="text-gray-600 mt-1">Generate comprehensive audit packages with AI-powered evidence compilation</p>
          </div>
        </div>

        <form id="audit-package-form" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="package-title" class="block text-sm font-medium text-gray-700 mb-2">Package Title</label>
              <input type="text" id="package-title" name="title" required placeholder="e.g., Q4 2024 SOC 2 Audit"
                     class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent">
            </div>
            <div>
              <label for="audit-scope" class="block text-sm font-medium text-gray-700 mb-2">Audit Scope</label>
              <input type="text" id="audit-scope" name="scope" required placeholder="e.g., Full Organization Audit"
                     class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent">
            </div>
          </div>

          <div>
            <label for="frameworks" class="block text-sm font-medium text-gray-700 mb-2">
              Frameworks (comma-separated)
            </label>
            <input type="text" id="frameworks" name="frameworks" placeholder="e.g., SOC 2, ISO 27001, NIST CSF"
                   class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent">
          </div>

          <button type="submit" 
                  class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
            <i class="fas fa-magic"></i>
            <span>Generate Audit Package</span>
          </button>
        </form>
      </div>

      <!-- Audit Packages List -->
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">Generated Audit Packages</h3>
        <div class="space-y-4">
          ${renderAuditPackagesList()}
        </div>
      </div>
    </div>
  `;
}

function renderPredictiveAnalyticsTab() {
  return html`
    <div class="space-y-8">
      <!-- Predictive Analytics Dashboard -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <h3 class="text-lg font-medium mb-4">Risk Forecast</h3>
          <div class="text-3xl font-bold mb-2">High Risk</div>
          <p class="text-red-200 text-sm">87% probability of security incident in next 30 days</p>
          <div class="mt-4">
            <div class="bg-red-400 rounded-full h-2">
              <div class="bg-white rounded-full h-2" style="width: 87%"></div>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <h3 class="text-lg font-medium mb-4">Compliance Gap</h3>
          <div class="text-3xl font-bold mb-2">15 Gaps</div>
          <p class="text-yellow-200 text-sm">Predicted compliance gaps by next audit</p>
          <div class="mt-4">
            <div class="bg-yellow-400 rounded-full h-2">
              <div class="bg-white rounded-full h-2" style="width: 65%"></div>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h3 class="text-lg font-medium mb-4">Control Effectiveness</h3>
          <div class="text-3xl font-bold mb-2">92%</div>
          <p class="text-blue-200 text-sm">Predicted control effectiveness score</p>
          <div class="mt-4">
            <div class="bg-blue-400 rounded-full h-2">
              <div class="bg-white rounded-full h-2" style="width: 92%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Machine Learning Insights -->
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <i class="fas fa-brain text-purple-500 mr-3"></i>
          AI-Powered Predictions
        </h3>
        
        <div class="space-y-6" id="predictions-container">
          <!-- Predictions will be loaded dynamically -->
          <div class="animate-pulse">
            <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderMobileAnalyticsTab() {
  return html`
    <div class="space-y-8">
      <!-- Mobile Dashboard Preview -->
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-mobile-alt text-teal-500 mr-3"></i>
              Mobile Analytics Dashboard
            </h2>
            <p class="text-gray-600 mt-1">Responsive, touch-optimized risk management interface</p>
          </div>
        </div>

        <!-- Mobile Mockup -->
        <div class="flex justify-center">
          <div class="w-80 bg-gray-900 rounded-3xl p-2 shadow-2xl">
            <div class="bg-white rounded-2xl overflow-hidden">
              <!-- Mobile Header -->
              <div class="bg-gradient-to-r from-teal-500 to-blue-500 p-4 text-white">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold">ARIA5 Mobile</h3>
                  <i class="fas fa-bell"></i>
                </div>
              </div>
              
              <!-- Mobile Content -->
              <div class="p-4 space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-red-100 p-3 rounded-lg text-center">
                    <div class="text-2xl font-bold text-red-600">12</div>
                    <div class="text-xs text-red-600">Critical Risks</div>
                  </div>
                  <div class="bg-green-100 p-3 rounded-lg text-center">
                    <div class="text-2xl font-bold text-green-600">89%</div>
                    <div class="text-xs text-green-600">Compliance</div>
                  </div>
                </div>
                
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-sm font-medium text-gray-700 mb-2">Recent Alerts</div>
                  <div class="space-y-2">
                    <div class="flex items-center text-xs">
                      <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span>High risk detected</span>
                    </div>
                    <div class="flex items-center text-xs">
                      <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Compliance gap identified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div class="text-center">
            <i class="fas fa-touch text-teal-500 text-3xl mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Touch-Optimized</h3>
            <p class="text-gray-600 text-sm">Intuitive gestures and touch interactions for mobile risk management</p>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div class="text-center">
            <i class="fas fa-wifi text-teal-500 text-3xl mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Offline Capable</h3>
            <p class="text-gray-600 text-sm">Works offline with data synchronization when connected</p>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div class="text-center">
            <i class="fas fa-bell text-teal-500 text-3xl mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Push Notifications</h3>
            <p class="text-gray-600 text-sm">Real-time alerts for critical risks and compliance issues</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEvidenceCards() {
  const sampleEvidence = [
    {
      id: 1,
      framework: 'SOC 2',
      requirement: 'Access Control Reviews',
      evidence_type: 'System Report',
      confidence_score: 94,
      status: 'verified',
      collected_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      framework: 'ISO 27001',
      requirement: 'Risk Assessment Documentation',
      evidence_type: 'Policy Document',
      confidence_score: 87,
      status: 'collected',
      collected_at: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      framework: 'NIST CSF',
      requirement: 'Incident Response Plan',
      evidence_type: 'Process Documentation',
      confidence_score: 91,
      status: 'approved',
      collected_at: '2024-01-15T08:45:00Z'
    }
  ];

  return sampleEvidence.map(evidence => html`
    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm font-medium text-gray-900">${evidence.framework}</div>
        <div class="px-2 py-1 text-xs font-medium rounded-full ${evidence.status === 'verified' ? 'bg-green-100 text-green-800' : evidence.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}">
          ${evidence.status}
        </div>
      </div>
      <div class="text-sm text-gray-700 mb-2">${evidence.requirement}</div>
      <div class="text-xs text-gray-500 mb-2">${evidence.evidence_type}</div>
      <div class="flex items-center justify-between">
        <div class="flex items-center text-xs text-gray-500">
          <i class="fas fa-brain mr-1"></i>
          ${evidence.confidence_score}% confidence
        </div>
        <div class="text-xs text-gray-400">
          ${new Date(evidence.collected_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  `).join('');
}

function renderAuditPackagesList() {
  const samplePackages = [
    {
      id: 1,
      title: 'Q4 2024 SOC 2 Type II Audit',
      scope: 'Full Organization Security',
      frameworks: ['SOC 2', 'ISO 27001'],
      status: 'ready',
      evidence_count: 45,
      completion_percentage: 100,
      created_at: '2024-01-15T10:00:00Z',
      due_date: '2024-01-30T23:59:59Z'
    },
    {
      id: 2,
      title: 'GDPR Compliance Assessment',
      scope: 'Data Protection & Privacy',
      frameworks: ['GDPR'],
      status: 'in_progress',
      evidence_count: 28,
      completion_percentage: 75,
      created_at: '2024-01-14T15:30:00Z',
      due_date: '2024-01-25T23:59:59Z'
    }
  ];

  return samplePackages.map(pkg => html`
    <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="text-lg font-semibold text-gray-900">${pkg.title}</h4>
          <p class="text-sm text-gray-600">${pkg.scope}</p>
        </div>
        <div class="px-3 py-1 text-sm font-medium rounded-full ${pkg.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
          ${pkg.status}
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div class="text-sm text-gray-500">Evidence Items</div>
          <div class="text-xl font-semibold text-gray-900">${pkg.evidence_count}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">Completion</div>
          <div class="text-xl font-semibold text-gray-900">${pkg.completion_percentage}%</div>
        </div>
      </div>
      
      <div class="mb-4">
        <div class="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>${pkg.completion_percentage}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full" style="width: ${pkg.completion_percentage}%"></div>
        </div>
      </div>
      
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Frameworks: ${pkg.frameworks.join(', ')}
        </div>
        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  `).join('');
}

// Utility functions for backend services
async function collectComplianceEvidence(framework: string, requirements: string[], db: any): Promise<ComplianceEvidence[]> {
  // Simulate AI evidence collection
  return requirements.map((req, index) => ({
    id: Date.now() + index,
    framework,
    requirement: req,
    evidence_type: 'Automated Collection',
    description: `AI-collected evidence for: ${req}`,
    collection_method: 'automated',
    confidence_score: Math.floor(Math.random() * 20) + 80, // 80-100%
    status: 'collected' as const,
    collected_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    metadata: { ai_generated: true },
    created_at: new Date().toISOString()
  }));
}

async function generateAuditPackage(title: string, scope: string, frameworks: string[], db: any): Promise<AuditPackage> {
  return {
    id: Date.now(),
    title,
    description: `AI-generated audit package for ${frameworks.join(', ')}`,
    scope,
    frameworks,
    status: 'draft' as const,
    evidence_count: Math.floor(Math.random() * 50) + 20,
    completion_percentage: 0,
    created_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}

async function getPredictiveInsights(db: any): Promise<PredictiveInsight[]> {
  return [
    {
      id: 1,
      type: 'risk_forecast',
      title: 'Elevated Cybersecurity Risk Predicted',
      description: 'ML models predict 87% probability of security incident in next 30 days based on current threat patterns',
      confidence: 87,
      impact_level: 'high',
      time_horizon: '30 days',
      recommendations: [
        'Increase security monitoring frequency',
        'Review access controls immediately',
        'Conduct phishing awareness training'
      ],
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      type: 'compliance_gap',
      title: 'Compliance Gaps Forecast',
      description: 'Predictive analysis identifies 15 potential compliance gaps for next audit cycle',
      confidence: 92,
      impact_level: 'medium',
      time_horizon: '3 months',
      recommendations: [
        'Address documentation gaps in access management',
        'Update incident response procedures',
        'Enhance security awareness program'
      ],
      created_at: new Date().toISOString()
    }
  ];
}

async function getMobileDashboardData(db: any) {
  return {
    summary: {
      critical_risks: 12,
      compliance_score: 89,
      active_incidents: 3,
      evidence_collected: 247
    },
    recent_alerts: [
      { type: 'critical', message: 'High-risk vulnerability detected', timestamp: new Date().toISOString() },
      { type: 'warning', message: 'Compliance gap identified', timestamp: new Date().toISOString() }
    ],
    mobile_features: {
      offline_capable: true,
      push_notifications: true,
      touch_optimized: true
    }
  };
}

export default app;