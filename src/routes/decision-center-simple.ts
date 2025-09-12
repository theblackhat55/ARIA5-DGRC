/**
 * Decision Center Dashboard - Simple Version
 * Executive decision-making interface
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
        <title>Decision Center - ARIA5 GRC</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .decision-gradient { background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%); }
            .decision-card { transition: all 0.3s ease; }
            .decision-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        </style>
    </head>
    <body class="bg-gray-50 font-sans">
        
        <!-- Header -->
        <header class="decision-gradient text-white shadow-lg">
            <div class="container mx-auto px-6 py-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <i class="fas fa-chart-line text-4xl"></i>
                        <div>
                            <h1 class="text-3xl font-bold">Decision Center</h1>
                            <p class="text-lg opacity-90">Executive Risk & Compliance Dashboard</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm opacity-90">Risk Score</div>
                        <div class="text-xl font-bold">73/100</div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="container mx-auto px-6 py-8">
            
            <!-- Key Decisions Required -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                    Critical Decisions Required
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="decision-card bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
                        <div class="flex items-start justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">High-Risk Service Approval</h3>
                            <span class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">URGENT</span>
                        </div>
                        <p class="text-gray-600 mb-4">Payment gateway service requires executive approval for deployment to production environment.</p>
                        <div class="flex space-x-2">
                            <button class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">Review</button>
                            <button class="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300">Delegate</button>
                        </div>
                    </div>

                    <div class="decision-card bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
                        <div class="flex items-start justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">Compliance Deviation</h3>
                            <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">REVIEW</span>
                        </div>
                        <p class="text-gray-600 mb-4">SOX compliance requirements not met for Q4 financial reporting systems.</p>
                        <div class="flex space-x-2">
                            <button class="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700">Review</button>
                            <button class="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300">Delegate</button>
                        </div>
                    </div>

                    <div class="decision-card bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                        <div class="flex items-start justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">Budget Allocation</h3>
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">PENDING</span>
                        </div>
                        <p class="text-gray-600 mb-4">Security tool budget for 2025 requires final approval for $2.3M allocation.</p>
                        <div class="flex space-x-2">
                            <button class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Review</button>
                            <button class="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300">Delegate</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Executive Summary -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-chart-pie text-blue-500 mr-2"></i>
                            Risk Portfolio Overview
                        </h2>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <div class="w-4 h-4 bg-red-500 rounded"></div>
                                    <span class="font-medium">Critical Risks</span>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-red-600">12</div>
                                    <div class="text-sm text-gray-500">+2 this week</div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <div class="w-4 h-4 bg-yellow-500 rounded"></div>
                                    <span class="font-medium">High Risks</span>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-yellow-600">28</div>
                                    <div class="text-sm text-gray-500">-5 this week</div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <div class="w-4 h-4 bg-green-500 rounded"></div>
                                    <span class="font-medium">Acceptable Risks</span>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-green-600">147</div>
                                    <div class="text-sm text-gray-500">+12 this week</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">
                            <i class="fas fa-tachometer-alt text-green-500 mr-2"></i>
                            Key Metrics
                        </h3>
                        <div class="space-y-4">
                            <div class="text-center p-4 bg-green-50 rounded-lg">
                                <div class="text-3xl font-bold text-green-600">98.7%</div>
                                <div class="text-sm text-gray-600">Compliance Score</div>
                            </div>
                            <div class="text-center p-4 bg-blue-50 rounded-lg">
                                <div class="text-3xl font-bold text-blue-600">$2.1M</div>
                                <div class="text-sm text-gray-600">Risk Value at Risk</div>
                            </div>
                            <div class="text-center p-4 bg-purple-50 rounded-lg">
                                <div class="text-3xl font-bold text-purple-600">156</div>
                                <div class="text-sm text-gray-600">Active Services</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-history text-gray-500 mr-2"></i>
                    Recent Executive Decisions
                </h2>
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 border rounded-lg">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-check-circle text-green-500"></i>
                            <div>
                                <div class="font-medium">API Gateway Security Enhancement</div>
                                <div class="text-sm text-gray-500">Approved for immediate implementation</div>
                            </div>
                        </div>
                        <div class="text-sm text-gray-500">2 hours ago</div>
                    </div>
                    <div class="flex items-center justify-between p-3 border rounded-lg">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-times-circle text-red-500"></i>
                            <div>
                                <div class="font-medium">Third-party Data Processor</div>
                                <div class="text-sm text-gray-500">Contract renewal rejected due to compliance gaps</div>
                            </div>
                        </div>
                        <div class="text-sm text-gray-500">5 hours ago</div>
                    </div>
                    <div class="flex items-center justify-between p-3 border rounded-lg">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-exclamation-triangle text-yellow-500"></i>
                            <div>
                                <div class="font-medium">Cloud Infrastructure Expansion</div>
                                <div class="text-sm text-gray-500">Delegated to Security Team for risk assessment</div>
                            </div>
                        </div>
                        <div class="text-sm text-gray-500">1 day ago</div>
                    </div>
                </div>
            </div>

            <!-- Navigation Links -->
            <div class="mt-8 text-center">
                <div class="inline-flex space-x-4">
                    <a href="/ai-insights" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-brain mr-2"></i>AI Insights
                    </a>
                    <a href="/risk" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
                        <i class="fas fa-exclamation-triangle mr-2"></i>Risk Register
                    </a>
                    <a href="/compliance" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                        <i class="fas fa-shield-alt mr-2"></i>Compliance
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

export default app;