// TI-Enhanced Dashboard Template
// Advanced UI components for threat intelligence and risk management

export function generateTIEnhancedDashboard(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TI-Enhanced Risk Dashboard - ARIA5-DGRC</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
        <link href="/static/styles.css" rel="stylesheet">
        
        <style>
          .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .risk-card { transition: all 0.3s ease; }
          .risk-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
          .ti-indicator { animation: pulse 2s infinite; }
          .validation-queue { max-height: 400px; overflow-y: auto; }
          .correlation-line { stroke-dasharray: 5,5; animation: dash 2s linear infinite; }
          @keyframes dash { to { stroke-dashoffset: -10; } }
          @keyframes pulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
          .metric-card { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-lg border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-shield-alt text-blue-600 text-2xl mr-3"></i>
                            <span class="font-bold text-xl text-gray-800">TI-Enhanced Risk Dashboard</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="refreshTIFeeds()" class="text-gray-600 hover:text-blue-600 transition-colors">
                            <i class="fas fa-sync-alt mr-2"></i>Sync TI Feeds
                        </button>
                        <div class="relative">
                            <button id="notificationBtn" class="text-gray-600 hover:text-blue-600 relative">
                                <i class="fas fa-bell text-lg"></i>
                                <span id="notificationCount" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-1 hidden">0</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Dashboard -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            <!-- TI Status Banner -->
            <div id="tiStatusBanner" class="gradient-bg rounded-lg p-6 text-white mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">Threat Intelligence Status</h2>
                        <p id="tiStatusText" class="opacity-90">Initializing TI feeds...</p>
                    </div>
                    <div class="text-right">
                        <div id="tiLastUpdate" class="text-sm opacity-75"></div>
                        <div id="tiSourcesStatus" class="mt-2 space-x-2"></div>
                    </div>
                </div>
            </div>

            <!-- Key Metrics Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="metric-card rounded-xl p-6 border">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                            <i class="fas fa-exclamation-triangle text-xl"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-600">Critical TI Alerts</p>
                            <p id="criticalAlerts" class="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card rounded-xl p-6 border">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <i class="fas fa-shield-alt text-xl"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-600">TI-Enhanced Risks</p>
                            <p id="tiEnhancedRisks" class="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card rounded-xl p-6 border">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                            <i class="fas fa-clock text-xl"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-600">Pending Validation</p>
                            <p id="pendingValidation" class="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card rounded-xl p-6 border">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <i class="fas fa-check-circle text-xl"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-600">Active Risks</p>
                            <p id="activeRisks" class="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Left Column: Risk Analysis -->
                <div class="lg:col-span-2 space-y-8">
                    
                    <!-- TI-Enhanced Risk Cards -->
                    <div class="bg-white rounded-xl p-6 shadow-sm border">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-semibold text-gray-900">
                                <i class="fas fa-bullseye text-red-500 mr-2"></i>
                                Critical TI-Enhanced Risks
                            </h3>
                            <button onclick="refreshRisks()" class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-refresh"></i>
                            </button>
                        </div>
                        <div id="tiEnhancedRiskCards" class="space-y-4">
                            <!-- Dynamic risk cards will be inserted here -->
                        </div>
                    </div>

                    <!-- Risk Correlation Matrix -->
                    <div class="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">
                            <i class="fas fa-project-diagram text-purple-500 mr-2"></i>
                            Risk Correlation Analysis
                        </h3>
                        <div class="relative">
                            <canvas id="correlationChart" width="400" height="300"></canvas>
                        </div>
                    </div>

                    <!-- Service Risk Heat Map -->
                    <div class="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">
                            <i class="fas fa-fire text-orange-500 mr-2"></i>
                            Service Risk Heat Map
                        </h3>
                        <div id="serviceHeatMap" class="grid grid-cols-4 gap-2">
                            <!-- Service risk blocks will be inserted here -->
                        </div>
                    </div>
                </div>

                <!-- Right Column: TI Feeds & Validation -->
                <div class="space-y-8">
                    
                    <!-- TI Feed Status -->
                    <div class="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">
                            <i class="fas fa-satellite-dish text-green-500 mr-2"></i>
                            Threat Intelligence Feeds
                        </h3>
                        <div id="tiFeedStatus" class="space-y-3">
                            <!-- TI feed status items will be inserted here -->
                        </div>
                        <button onclick="triggerTIIngestion()" class="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-download mr-2"></i>Trigger Ingestion
                        </button>
                    </div>

                    <!-- Validation Queue -->
                    <div class="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">
                            <i class="fas fa-tasks text-blue-500 mr-2"></i>
                            Validation Queue
                        </h3>
                        <div id="validationQueue" class="validation-queue space-y-3">
                            <!-- Validation items will be inserted here -->
                        </div>
                    </div>

                    <!-- Recent TI Indicators -->
                    <div class="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">
                            <i class="fas fa-radar text-cyan-500 mr-2"></i>
                            Recent TI Indicators
                        </h3>
                        <div id="recentIndicators" class="space-y-2">
                            <!-- Recent indicators will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- TI Analytics Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div class="bg-white rounded-xl p-6 shadow-sm border">
                    <h3 class="text-lg font-semibold text-gray-900 mb-6">TI Trend Analysis</h3>
                    <canvas id="tiTrendChart" width="400" height="200"></canvas>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-sm border">
                    <h3 class="text-lg font-semibold text-gray-900 mb-6">Risk Severity Distribution</h3>
                    <canvas id="severityChart" width="400" height="200"></canvas>
                </div>
            </div>
        </div>

        <!-- Validation Modal -->
        <div id="validationModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-xl max-w-2xl w-full p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-semibold">Risk Validation</h3>
                        <button onclick="closeValidationModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div id="validationContent">
                        <!-- Validation form will be inserted here -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Notification Toast -->
        <div id="notificationToast" class="fixed top-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg hidden z-50">
            <div class="flex items-center">
                <i class="fas fa-info-circle mr-3"></i>
                <span id="toastMessage"></span>
            </div>
        </div>

        <!-- JavaScript -->
        <script src="/static/ti-enhanced-dashboard.js"></script>
    </body>
    </html>
  `;
}

export function generateRiskAnalysisWorkbench(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Risk Analysis Workbench - TI Enhanced</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <link href="/static/styles.css" rel="stylesheet">
        
        <style>
          .workbench-layout { height: calc(100vh - 64px); }
          .split-pane { resize: horizontal; overflow: auto; }
          .ti-mapping-line { stroke: #3b82f6; stroke-width: 2; fill: none; }
          .confidence-badge { font-size: 0.75rem; }
        </style>
    </head>
    <body class="bg-gray-100">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b h-16 flex items-center px-6">
            <div class="flex items-center">
                <i class="fas fa-microscope text-blue-600 text-xl mr-3"></i>
                <h1 class="text-xl font-semibold text-gray-900">Risk Analysis Workbench</h1>
            </div>
            <div class="ml-auto flex items-center space-x-4">
                <button onclick="saveAnalysis()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <i class="fas fa-save mr-2"></i>Save Analysis
                </button>
            </div>
        </header>

        <!-- Main Workbench -->
        <div class="workbench-layout flex">
            <!-- Left Panel: Risk Details -->
            <div class="w-1/2 bg-white border-r">
                <div class="p-6 border-b">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
                    <div id="riskDetails">
                        <!-- Risk details will be loaded here -->
                    </div>
                </div>
                
                <!-- Risk Lifecycle Controls -->
                <div class="p-6 border-b">
                    <h3 class="font-medium text-gray-900 mb-4">Lifecycle Management</h3>
                    <div class="flex space-x-2">
                        <button onclick="validateRisk()" class="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
                            <i class="fas fa-check mr-1"></i>Validate
                        </button>
                        <button onclick="activateRisk()" class="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                            <i class="fas fa-play mr-1"></i>Activate
                        </button>
                        <button onclick="retireRisk()" class="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700">
                            <i class="fas fa-archive mr-1"></i>Retire
                        </button>
                    </div>
                </div>
                
                <!-- Manual TI Mapping -->
                <div class="p-6">
                    <h3 class="font-medium text-gray-900 mb-4">Manual TI Mapping</h3>
                    <div id="tiMappingControls">
                        <!-- Manual mapping controls will be inserted here -->
                    </div>
                </div>
            </div>

            <!-- Right Panel: TI Data -->
            <div class="w-1/2 bg-gray-50">
                <div class="p-6 border-b bg-white">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Threat Intelligence Data</h2>
                    <div class="flex space-x-2 mb-4">
                        <input type="text" id="tiSearch" placeholder="Search indicators..." 
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <button onclick="searchTI()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                
                <!-- TI Indicators List -->
                <div class="p-6">
                    <div id="tiIndicatorsList" class="space-y-4">
                        <!-- TI indicators will be loaded here -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Confidence Scoring Modal -->
        <div id="confidenceModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-xl max-w-lg w-full p-6">
                    <h3 class="text-xl font-semibold mb-4">Set Confidence Score</h3>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Relevance Score (0.0 - 1.0)</label>
                        <input type="range" id="confidenceSlider" min="0" max="1" step="0.1" value="0.8" 
                               class="w-full" oninput="updateConfidenceDisplay()">
                        <div class="flex justify-between text-sm text-gray-500 mt-1">
                            <span>Low</span>
                            <span id="confidenceValue">0.8</span>
                            <span>High</span>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mapping Reason</label>
                        <textarea id="mappingReason" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button onclick="closeConfidenceModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                        <button onclick="confirmMapping()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Confirm Mapping</button>
                    </div>
                </div>
            </div>
        </div>

        <script src="/static/risk-analysis-workbench.js"></script>
    </body>
    </html>
  `;
}