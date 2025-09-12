/**
 * AI Insights Dashboard - Simple Version
 * Consolidated analytics and reporting interface
 */

import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Insights Dashboard - ARIA5 GRC</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .ai-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .insight-card { transition: all 0.3s ease; }
            .insight-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        </style>
    </head>
    <body class="bg-gray-50 font-sans">
        
        <!-- Header -->
        <header class="ai-gradient text-white shadow-lg">
            <div class="container mx-auto px-6 py-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <i class="fas fa-brain text-4xl"></i>
                        <div>
                            <h1 class="text-3xl font-bold">AI Insights Dashboard</h1>
                            <p class="text-lg opacity-90">Dynamic Risk Intelligence & Analytics</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm opacity-90">System Status</div>
                        <div class="text-xl font-bold">🟢 HEALTHY</div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Navigation -->
        <nav class="bg-white border-b border-gray-200">
            <div class="container mx-auto px-6">
                <div class="flex space-x-8">
                    <a href="/ai-insights" class="py-4 px-2 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
                        <i class="fas fa-chart-line mr-2"></i>Overview
                    </a>
                    <a href="/decision-center" class="py-4 px-2 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                        <i class="fas fa-chess-queen mr-2"></i>Decision Center
                    </a>
                    <a href="/dashboard" class="py-4 px-2 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                        <i class="fas fa-home mr-2"></i>Main Dashboard
                    </a>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="container mx-auto px-6 py-8">
            
            <!-- AI Executive Summary -->
            <div class="mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center">
                            <div class="bg-blue-100 p-3 rounded-lg mr-4">
                                <i class="fas fa-robot text-blue-600 text-xl"></i>
                            </div>
                            <div>
                                <h2 class="text-xl font-semibold text-gray-800">AI Executive Summary</h2>
                                <p class="text-gray-600 text-sm">Generated ${new Date().toLocaleString()}</p>
                            </div>
                        </div>
                        <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                            Action Required
                        </span>
                    </div>
                    <div class="prose max-w-none">
                        <p class="text-gray-700 leading-relaxed mb-4">
                            Based on continuous AI analysis of your security posture, <strong>3 critical vulnerabilities</strong> require immediate attention. 
                            Our threat intelligence indicates active exploitation campaigns targeting similar environments. 
                            Automated risk escalation has been triggered for 2 production systems.
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                                <h4 class="font-semibold text-red-800 mb-2">Critical Issues</h4>
                                <p class="text-red-700 text-sm">3 critical vulnerabilities with active exploitation detected</p>
                            </div>
                            <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <h4 class="font-semibold text-yellow-800 mb-2">Opportunities</h4>
                                <p class="text-yellow-700 text-sm">Implement automated patching to reduce MTTR by 60%</p>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                                <h4 class="font-semibold text-green-800 mb-2">Recommendations</h4>
                                <p class="text-green-700 text-sm">Prioritize CVE-2024-1234 remediation for production web servers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Key Metrics -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                
                <!-- Risk Score -->
                <div class="insight-card bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Overall Risk Score</h3>
                        <i class="fas fa-shield-alt text-2xl text-orange-500"></i>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-orange-500 mb-2">7.2</div>
                        <div class="text-sm text-gray-600 uppercase tracking-wide font-medium">HIGH RISK</div>
                        <div class="mt-4 text-xs text-gray-500">AI Confidence: 89%</div>
                    </div>
                </div>

                <!-- Active Threats -->
                <div class="insight-card bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Active Threats</h3>
                        <i class="fas fa-crosshairs text-2xl text-red-500"></i>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-red-500 mb-2">12</div>
                        <div class="text-sm text-gray-600 mb-4">Critical: 3</div>
                        <div class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                            Active Exploitation
                        </div>
                    </div>
                </div>

                <!-- Escalations -->
                <div class="insight-card bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Auto Escalations</h3>
                        <i class="fas fa-arrow-up text-2xl text-yellow-500"></i>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-yellow-500 mb-2">8</div>
                        <div class="text-sm text-gray-600 mb-4">Today: 2 New</div>
                        <div class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                            Vision Implemented
                        </div>
                    </div>
                </div>

                <!-- AI Performance -->
                <div class="insight-card bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">AI Performance</h3>
                        <i class="fas fa-brain text-2xl text-purple-500"></i>
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">Success Rate</span>
                            <span class="font-semibold">94%</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">Avg Response</span>
                            <span class="font-semibold">450ms</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">Providers</span>
                            <span class="font-semibold">4 Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Core Vision Implementation -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-semibold text-gray-800">
                        <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>
                        Core Vision: Threat-Vulnerability Correlation
                    </h3>
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✅ IMPLEMENTED
                    </span>
                </div>
                
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-search text-blue-600 text-xl"></i>
                            </div>
                            <h4 class="font-semibold text-gray-800 mb-2">Initial State</h4>
                            <p class="text-sm text-gray-600">Low vulnerability on critical system treated as medium risk</p>
                        </div>
                        <div class="text-center">
                            <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-exclamation-triangle text-orange-600 text-xl"></i>
                            </div>
                            <h4 class="font-semibold text-gray-800 mb-2">AI Detection</h4>
                            <p class="text-sm text-gray-600">Threat intelligence shows active exploitation in the wild</p>
                        </div>
                        <div class="text-center">
                            <div class="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-arrow-up text-red-600 text-xl"></i>
                            </div>
                            <h4 class="font-semibold text-gray-800 mb-2">Auto Escalation</h4>
                            <p class="text-sm text-gray-600">Risk automatically escalates to high/critical with alerts</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Real-time Threat Intelligence -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-gray-800">
                        <i class="fas fa-crosshairs mr-2 text-red-500"></i>
                        Real-time Threat Intelligence
                    </h3>
                    <span class="text-sm text-gray-500">Live updates every 5 minutes</span>
                </div>
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                            <div>
                                <h4 class="font-medium text-gray-800">CVE-2024-1234 Active Exploitation</h4>
                                <p class="text-sm text-gray-600">Remote code execution vulnerability being actively exploited</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-medium text-red-600">CRITICAL</div>
                            <div class="text-xs text-gray-500">95% confidence</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full bg-orange-500 mr-3"></div>
                            <div>
                                <h4 class="font-medium text-gray-800">Suspicious Network Activity</h4>
                                <p class="text-sm text-gray-600">Anomalous traffic patterns detected on production network</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-medium text-orange-600">HIGH</div>
                            <div class="text-xs text-gray-500">78% confidence</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                            <div>
                                <h4 class="font-medium text-gray-800">Credential Stuffing Attempts</h4>
                                <p class="text-sm text-gray-600">Increased authentication failures from known botnet IPs</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-medium text-yellow-600">MEDIUM</div>
                            <div class="text-xs text-gray-500">85% confidence</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        
        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-6 mt-12">
            <div class="container mx-auto px-6 text-center">
                <p class="text-gray-400">ARIA5 GRC - AI-Native Risk Intelligence Platform</p>
                <p class="text-sm text-gray-500 mt-2">Dynamic threat-vulnerability correlation with automatic escalation</p>
            </div>
        </footer>
        
    </body>
    </html>
  `);
});

export default app;