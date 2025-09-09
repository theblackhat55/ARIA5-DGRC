import { html } from 'hono/html';

export async function renderPhase1Demo(c: any) {
  // Get Phase 1 data from database
  const servicesData = await getServicesWithRisks(c.env.DB);
  const approvalWorkflowData = await getApprovalWorkflowStats(c.env.DB);
  const integrationData = await getIntegrationStatus(c.env.DB);

  return html`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARIA5-DGRC Phase 1: Dynamic GRC Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://unpkg.com/htmx.org@1.9.12"></script>
  <style>
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
  </style>
</head>
<body class="bg-gray-50">

  <!-- Header -->
  <div class="gradient-bg text-white py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold mb-2">🎯 ARIA5-DGRC Phase 1 Demo</h1>
          <p class="text-xl opacity-90">Dynamic GRC: Service-Centric Risk Intelligence Platform</p>
        </div>
        <div class="text-right">
          <div class="bg-white/20 rounded-lg p-4">
            <div class="text-2xl font-bold">✅ COMPLETED</div>
            <div class="text-sm opacity-90">Foundation Enhancement</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Navigation -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex space-x-8 py-4">
        <button onclick="showSection('services')" id="tab-services" class="tab-button active px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
          <i class="fas fa-server mr-2"></i>Service Risk Cascading
        </button>
        <button onclick="showSection('approval')" id="tab-approval" class="tab-button px-4 py-2 font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent">
          <i class="fas fa-clipboard-check mr-2"></i>Approval Workflow
        </button>
        <button onclick="showSection('integrations')" id="tab-integrations" class="tab-button px-4 py-2 font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent">
          <i class="fas fa-plug mr-2"></i>External Integrations
        </button>
        <button onclick="showSection('admin')" id="tab-admin" class="tab-button px-4 py-2 font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent">
          <i class="fas fa-cog mr-2"></i>Admin Interface
        </button>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 py-8">

    <!-- Service Risk Cascading Section -->
    <div id="section-services" class="section">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">🔗 Service-Centric Risk Cascading</h2>
        <p class="text-gray-600 text-lg">Dynamic risk intelligence with service dependency mapping and automated risk score calculation</p>
      </div>

      <!-- Services Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        ${servicesData.map(service => html`
          <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${getCriticalityColor(service.criticality_level)}">
                  <i class="fas ${getServiceIcon(service.name)} text-xl text-white"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">${service.name}</h3>
                  <p class="text-sm text-gray-500">${service.criticality_level.toUpperCase()} CRITICALITY</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold ${getRiskScoreColor(service.aggregate_risk_score)}">${service.aggregate_risk_score}</div>
                <div class="text-xs text-gray-500">RISK SCORE</div>
              </div>
            </div>
            
            <!-- CIA Triad -->
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="text-center">
                <div class="text-lg font-semibold text-blue-600">${service.confidentiality_score}</div>
                <div class="text-xs text-gray-500">Confidentiality</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold text-green-600">${service.integrity_score}</div>
                <div class="text-xs text-gray-500">Integrity</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-semibold text-purple-600">${service.availability_score}</div>
                <div class="text-xs text-gray-500">Availability</div>
              </div>
            </div>

            <!-- Risk Statistics -->
            <div class="border-t pt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Total Risks:</span>
                <span class="font-semibold">${service.total_risks}</span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Active Risks:</span>
                <span class="font-semibold text-red-600">${service.active_risks}</span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Pending Approval:</span>
                <span class="font-semibold text-yellow-600">${service.pending_risks}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Risk Trend:</span>
                <span class="font-semibold ${getTrendColor(service.risk_trend)}">${service.risk_trend.toUpperCase()}</span>
              </div>
            </div>
          </div>
        `)}
      </div>

      <!-- Risk Cascading Visualization -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">🔄 Risk Cascading Network</h3>
        <div class="bg-gray-50 rounded-lg p-6">
          <div class="flex items-center justify-center space-x-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2">
                <i class="fas fa-exclamation-triangle text-white text-xl"></i>
              </div>
              <div class="text-sm font-semibold">SQL Injection Risk</div>
              <div class="text-xs text-gray-500">Score: 20</div>
            </div>
            <div class="flex-1 flex items-center">
              <div class="h-0.5 bg-gradient-to-r from-red-500 to-blue-500 flex-1"></div>
              <div class="mx-2 text-sm text-gray-500">cascades to</div>
              <div class="h-0.5 bg-gradient-to-r from-blue-500 to-green-500 flex-1"></div>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                <i class="fas fa-database text-white text-xl"></i>
              </div>
              <div class="text-sm font-semibold">Customer Database</div>
              <div class="text-xs text-gray-500">Impact: High</div>
            </div>
            <div class="flex-1 flex items-center">
              <div class="h-0.5 bg-gradient-to-r from-blue-500 to-green-500 flex-1"></div>
              <div class="mx-2 text-sm text-gray-500">affects</div>
              <div class="h-0.5 bg-gradient-to-r from-green-500 to-purple-500 flex-1"></div>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <i class="fas fa-globe text-white text-xl"></i>
              </div>
              <div class="text-sm font-semibold">Web Application</div>
              <div class="text-xs text-gray-500">Dependent Service</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Approval Workflow Section -->
    <div id="section-approval" class="section hidden">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">✋ Pending → Active Approval Workflow</h2>
        <p class="text-gray-600 text-lg">Confidence-based risk approval system with audit compliance</p>
      </div>

      <!-- Workflow Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-clock text-yellow-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-gray-900">${approvalWorkflowData.pending_approval}</div>
          <div class="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-gray-900">${approvalWorkflowData.approved_active}</div>
          <div class="text-sm text-gray-600">Active Risks</div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-times-circle text-red-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-gray-900">${approvalWorkflowData.rejected}</div>
          <div class="text-sm text-gray-600">Rejected</div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-brain text-purple-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-gray-900">${approvalWorkflowData.high_confidence_pending}</div>
          <div class="text-sm text-gray-600">High Confidence</div>
        </div>
      </div>

      <!-- Approval Workflow Process -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-6">📋 Approval Process Flow</h3>
        <div class="flex items-center justify-between mb-6">
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-plus text-white text-xl"></i>
            </div>
            <div class="text-sm font-semibold">Risk Created</div>
            <div class="text-xs text-gray-500">AI/Manual/API</div>
          </div>
          <div class="flex-1 h-0.5 bg-gray-300 mx-4"></div>
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-pause text-white text-xl"></i>
            </div>
            <div class="text-sm font-semibold">Pending Status</div>
            <div class="text-xs text-gray-500">Awaiting Review</div>
          </div>
          <div class="flex-1 h-0.5 bg-gray-300 mx-4"></div>
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-user-check text-white text-xl"></i>
            </div>
            <div class="text-sm font-semibold">Approval Review</div>
            <div class="text-xs text-gray-500">Confidence Check</div>
          </div>
          <div class="flex-1 h-0.5 bg-gray-300 mx-4"></div>
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-play text-white text-xl"></i>
            </div>
            <div class="text-sm font-semibold">Active Risk</div>
            <div class="text-xs text-gray-500">Monitoring</div>
          </div>
        </div>

        <!-- Auto-Approval Rules -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 mb-2">🤖 Auto-Approval Rules</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• <strong>Confidence ≥ 95%:</strong> Automatic approval for very high confidence risks</li>
            <li>• <strong>Confidence ≥ 85% + Trusted Source:</strong> Auto-approve from AI analysis, threat intel</li>
            <li>• <strong>Impact ≤ 3 + Confidence ≥ 85%:</strong> Auto-approve low-medium impact risks</li>
            <li>• <strong>Manual Review Required:</strong> High impact risks or low confidence scores</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- External Integrations Section -->
    <div id="section-integrations" class="section hidden">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">🔌 External System Integrations</h2>
        <p class="text-gray-600 text-lg">Seamless connectivity with security, ITSM, and threat intelligence platforms</p>
      </div>

      <!-- Integration Categories -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Security Intelligence -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-shield-alt text-red-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">Security Intelligence</h3>
              <p class="text-gray-600 text-sm">Threat data and incident management</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <i class="fab fa-microsoft text-blue-600"></i>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Microsoft Defender</div>
                  <div class="text-xs text-gray-500">Endpoint Detection & Response</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Configured</span>
                <i class="fas fa-cog text-gray-400 cursor-pointer hover:text-blue-600"></i>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <i class="fas fa-crow text-red-600"></i>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">CrowdStrike Falcon</div>
                  <div class="text-xs text-gray-500">Advanced Threat Protection</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Active</span>
                <i class="fas fa-check-circle text-green-600"></i>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <i class="fas fa-bug text-orange-600"></i>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">MISP Platform</div>
                  <div class="text-xs text-gray-500">Threat Intelligence Sharing</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Active</span>
                <i class="fas fa-sync-alt text-blue-600 cursor-pointer"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- IT Service Management -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-tools text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">IT Service Management</h3>
              <p class="text-gray-600 text-sm">Incident and workflow automation</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <i class="fas fa-snowflake text-green-600"></i>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">ServiceNow</div>
                  <div class="text-xs text-gray-500">Last sync: 5 minutes ago</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Active</span>
                <div class="text-xs text-gray-500">23 incidents</div>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <i class="fab fa-jira text-blue-600"></i>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Atlassian Jira</div>
                  <div class="text-xs text-gray-500">Last sync: 2 hours ago</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Active</span>
                <div class="text-xs text-gray-500">12 issues</div>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <i class="fab fa-slack text-purple-600"></i>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Slack Notifications</div>
                  <div class="text-xs text-gray-500">Real-time alerts</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Configured</span>
                <i class="fas fa-bell text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Integration Statistics -->
      <div class="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">📊 Integration Activity Today</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">156</div>
            <div class="text-sm text-gray-600">Risks Imported</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">23</div>
            <div class="text-sm text-gray-600">Incidents Synced</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">45</div>
            <div class="text-sm text-gray-600">Alerts Sent</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600 mb-2">99.8%</div>
            <div class="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Interface Section -->
    <div id="section-admin" class="section hidden">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">⚙️ Enhanced Admin Interface</h2>
        <p class="text-gray-600 text-lg">Comprehensive administration tools for Dynamic GRC management</p>
      </div>

      <!-- Admin Dashboard Preview -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">🎛️ Admin Dashboard Enhancements</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div class="bg-indigo-50 rounded-lg p-4 text-center">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-plug text-indigo-600 text-xl"></i>
            </div>
            <div class="font-semibold text-gray-900">External Integrations</div>
            <div class="text-sm text-gray-600 mt-1">Configure security feeds</div>
            <div class="mt-2">
              <span class="text-lg font-bold text-indigo-600">6</span>
              <span class="text-xs text-gray-500 ml-1">systems</span>
            </div>
          </div>

          <div class="bg-yellow-50 rounded-lg p-4 text-center">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-clipboard-check text-yellow-600 text-xl"></i>
            </div>
            <div class="font-semibold text-gray-900">Risk Approvals</div>
            <div class="text-sm text-gray-600 mt-1">Workflow management</div>
            <div class="mt-2">
              <span class="text-lg font-bold text-yellow-600">${approvalWorkflowData.pending_approval}</span>
              <span class="text-xs text-gray-500 ml-1">pending</span>
            </div>
          </div>

          <div class="bg-red-50 rounded-lg p-4 text-center">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-project-diagram text-red-600 text-xl"></i>
            </div>
            <div class="font-semibold text-gray-900">Service Cascading</div>
            <div class="text-sm text-gray-600 mt-1">Dependency monitoring</div>
            <div class="mt-2">
              <span class="text-lg font-bold text-red-600">${servicesData.length}</span>
              <span class="text-xs text-gray-500 ml-1">services</span>
            </div>
          </div>

          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-brain text-green-600 text-xl"></i>
            </div>
            <div class="font-semibold text-gray-900">AI Analytics</div>
            <div class="text-sm text-gray-600 mt-1">Intelligence insights</div>
            <div class="mt-2">
              <span class="text-lg font-bold text-green-600">94%</span>
              <span class="text-xs text-gray-500 ml-1">accuracy</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Implementation -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">🔧 Technical Architecture</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <h4 class="font-semibold text-gray-900 mb-3">Database Enhancements</h4>
            <ul class="text-sm text-gray-600 space-y-2">
              <li class="flex items-center"><i class="fas fa-check-circle text-green-600 mr-2"></i>Service-centric risk mapping</li>
              <li class="flex items-center"><i class="fas fa-check-circle text-green-600 mr-2"></i>Approval workflow tables</li>
              <li class="flex items-center"><i class="fas fa-check-circle text-green-600 mr-2"></i>Dependency relationship tracking</li>
              <li class="flex items-center"><i class="fas fa-check-circle text-green-600 mr-2"></i>Confidence scoring integration</li>
              <li class="flex items-center"><i class="fas fa-check-circle text-green-600 mr-2"></i>Real-time risk aggregation</li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-gray-900 mb-3">Service Enhancements</h4>
            <ul class="text-sm text-gray-600 space-y-2">
              <li class="flex items-center"><i class="fas fa-check-circle text-green-600 mr-2"></i>Dynamic Risk Cascade Engine</li>
              <li class="flex items-center"><i class="fas fa-check-circle text-green-600 mr-2"></i>Enhanced AI Service Criticality</li>
              <li class="flex items-center"><i class="fas fa-check-circle text-green-600 mr-2"></i>Approval Workflow Manager</li>
              <li class="flex items-center"><i class="fas fa-check-circle text-green-600 mr-2"></i>External Integration Framework</li>
              <li class="flex items-center"><i class="fas fa-check-circle text-green-600 mr-2"></i>Real-time monitoring services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="bg-gray-900 text-white py-8 mt-12">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">🎯 Foundation Enhancement - COMPLETE</h3>
        <p class="text-gray-400">Service-Centric Risk Intelligence • Approval Workflows • External Integrations</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <div class="text-2xl font-bold text-green-400">✅ 100%</div>
          <div class="text-sm text-gray-400">Foundation Complete</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-blue-400">${servicesData.reduce((acc, s) => acc + s.total_risks, 0)}</div>
          <div class="text-sm text-gray-400">Risks Managed</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-purple-400">${servicesData.length}</div>
          <div class="text-sm text-gray-400">Services Protected</div>
        </div>
      </div>
      <div class="flex items-center justify-center space-x-6">
        <a href="/" class="text-blue-400 hover:text-blue-300">← Back to Landing</a>
        <span class="text-gray-500">|</span>
        <a href="/login" class="text-blue-400 hover:text-blue-300">Access Full Platform →</a>
      </div>
    </div>
  </div>

  <script>
    function showSection(sectionName) {
      // Hide all sections
      document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
      });
      
      // Remove active state from all tabs
      document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active', 'text-blue-600', 'border-blue-600');
        tab.classList.add('text-gray-600', 'border-transparent');
      });
      
      // Show selected section
      document.getElementById('section-' + sectionName).classList.remove('hidden');
      
      // Activate selected tab
      const activeTab = document.getElementById('tab-' + sectionName);
      activeTab.classList.add('active', 'text-blue-600', 'border-blue-600');
      activeTab.classList.remove('text-gray-600', 'border-transparent');
    }
  </script>

</body>
</html>
  `;
}

// Helper functions for the demo
async function getServicesWithRisks(db: any) {
  const result = await db.prepare(`
    SELECT s.name, s.criticality_level, s.cia_score, 
           s.confidentiality_score, s.integrity_score, s.availability_score,
           s.aggregate_risk_score, s.risk_trend, s.last_risk_update,
           COUNT(sr.risk_id) as total_risks,
           SUM(CASE WHEN r.approval_status = 'approved' THEN 1 ELSE 0 END) as active_risks,
           SUM(CASE WHEN r.approval_status = 'pending' THEN 1 ELSE 0 END) as pending_risks
    FROM services s
    LEFT JOIN service_risks sr ON s.id = sr.service_id
    LEFT JOIN risks r ON sr.risk_id = r.id
    GROUP BY s.id, s.name
    ORDER BY s.aggregate_risk_score DESC NULLS LAST
  `).all();
  
  return result.results || [];
}

async function getApprovalWorkflowStats(db: any) {
  const result = await db.prepare(`
    SELECT 
      SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pending_approval,
      SUM(CASE WHEN approval_status = 'approved' AND status = 'active' THEN 1 ELSE 0 END) as approved_active,
      SUM(CASE WHEN approval_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN approval_status = 'pending' AND confidence_score >= 0.7 THEN 1 ELSE 0 END) as high_confidence_pending
    FROM risks 
    WHERE source IN ('ai_analysis', 'external_api', 'threat_intel')
  `).first();
  
  return result || {
    pending_approval: 0,
    approved_active: 0, 
    rejected: 0,
    high_confidence_pending: 0
  };
}

async function getIntegrationStatus(db: any) {
  // Mock integration status for demo
  return {
    security_feeds: 3,
    itsm_systems: 3,
    total_configured: 6,
    last_sync: new Date().toISOString()
  };
}

// Helper functions for styling
function getCriticalityColor(criticality: string): string {
  const colors = {
    'critical': 'bg-red-500',
    'high': 'bg-orange-500', 
    'medium': 'bg-yellow-500',
    'low': 'bg-green-500'
  };
  return colors[criticality as keyof typeof colors] || 'bg-gray-500';
}

function getRiskScoreColor(score: number): string {
  if (score >= 15) return 'text-red-600';
  if (score >= 10) return 'text-orange-600';
  if (score >= 5) return 'text-yellow-600';
  return 'text-green-600';
}

function getTrendColor(trend: string): string {
  const colors = {
    'increasing': 'text-red-600',
    'stable': 'text-blue-600',
    'decreasing': 'text-green-600'
  };
  return colors[trend as keyof typeof colors] || 'text-gray-600';
}

function getServiceIcon(serviceName: string): string {
  if (serviceName.includes('Database')) return 'fa-database';
  if (serviceName.includes('Web') || serviceName.includes('Application')) return 'fa-globe';
  if (serviceName.includes('Payment')) return 'fa-credit-card';
  if (serviceName.includes('Email')) return 'fa-envelope';
  if (serviceName.includes('Analytics')) return 'fa-chart-bar';
  return 'fa-server';
}