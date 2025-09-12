/**
 * Phase 1 Dynamic Risk Intelligence - Simple Version
 * No database dependencies for immediate access
 */

import { Hono } from 'hono';
import { html } from 'hono/html';
import { cleanLayout } from '../templates/layout-clean';

export function createPhase1SimpleRoutes() {
  const routes = new Hono();

  // Main Phase 1 Dashboard - Simple version without DB calls
  routes.get('/', async (c) => {
    const user = { username: 'Dynamic Risk User', role: 'admin' };

    return c.html(
      cleanLayout({
        title: 'Dynamic Risk Intelligence - Phase 1',
        user: user,
        content: html`
          <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <!-- Header -->
            <div class="bg-white shadow-lg border-b border-gray-200">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex items-center justify-between">
                  <div>
                    <h1 class="text-3xl font-bold text-gray-900 flex items-center">
                      <i class="fas fa-shield-alt text-blue-600 mr-4"></i>
                      Dynamic Risk Intelligence
                    </h1>
                    <p class="mt-2 text-gray-600">Phase 1: Service-Centric Risk Management & Asset Correlation</p>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                      <i class="fas fa-check-circle mr-1"></i>
                      Phase 1 Active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-medium">Active Risks</h3>
                      <p class="text-3xl font-bold mt-2">47</p>
                      <p class="text-red-200 text-sm mt-1">↑ 8% this week</p>
                    </div>
                    <i class="fas fa-exclamation-triangle text-4xl opacity-60"></i>
                  </div>
                </div>
                
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-medium">Services Monitored</h3>
                      <p class="text-3xl font-bold mt-2">124</p>
                      <p class="text-blue-200 text-sm mt-1">Across 8 business units</p>
                    </div>
                    <i class="fas fa-server text-4xl opacity-60"></i>
                  </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-medium">Risk Correlation</h3>
                      <p class="text-3xl font-bold mt-2">92%</p>
                      <p class="text-green-200 text-sm mt-1">Accuracy rating</p>
                    </div>
                    <i class="fas fa-link text-4xl opacity-60"></i>
                  </div>
                </div>
                
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-medium">Auto-Discovery</h3>
                      <p class="text-3xl font-bold mt-2">156</p>
                      <p class="text-purple-200 text-sm mt-1">Assets discovered</p>
                    </div>
                    <i class="fas fa-search text-4xl opacity-60"></i>
                  </div>
                </div>
              </div>

              <!-- Main Features -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Service-Risk Correlation -->
                <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                  <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <i class="fas fa-project-diagram text-blue-500 mr-3"></i>
                    Service-Risk Correlation
                  </h2>
                  
                  <div class="space-y-4">
                    <div class="border border-gray-200 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-3">
                        <h3 class="font-semibold text-gray-900">Customer Portal</h3>
                        <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">High Risk</span>
                      </div>
                      <div class="text-sm text-gray-600 mb-3">
                        <p><strong>CIA Rating:</strong> Critical/High/High</p>
                        <p><strong>Dependencies:</strong> Auth Service, Payment Gateway, User Database</p>
                      </div>
                      <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-exclamation-triangle text-red-500 mr-1"></i>
                        3 active risks affecting availability
                      </div>
                    </div>

                    <div class="border border-gray-200 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-3">
                        <h3 class="font-semibold text-gray-900">Internal API Gateway</h3>
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Medium Risk</span>
                      </div>
                      <div class="text-sm text-gray-600 mb-3">
                        <p><strong>CIA Rating:</strong> High/Critical/Medium</p>
                        <p><strong>Dependencies:</strong> Load Balancer, Backend Services</p>
                      </div>
                      <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-shield-alt text-yellow-500 mr-1"></i>
                        2 risks related to data integrity
                      </div>
                    </div>

                    <div class="border border-gray-200 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-3">
                        <h3 class="font-semibold text-gray-900">Backup Systems</h3>
                        <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Low Risk</span>
                      </div>
                      <div class="text-sm text-gray-600 mb-3">
                        <p><strong>CIA Rating:</strong> Medium/High/Critical</p>
                        <p><strong>Dependencies:</strong> Storage Network, Offsite Backup</p>
                      </div>
                      <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-check-circle text-green-500 mr-1"></i>
                        All controls functioning normally
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Risk Discovery Engine -->
                <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                  <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <i class="fas fa-search text-purple-500 mr-3"></i>
                    Dynamic Risk Discovery
                  </h2>
                  
                  <div class="space-y-6">
                    <!-- Discovery Status -->
                    <div class="bg-blue-50 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-3">
                        <h3 class="font-semibold text-blue-900">Discovery Engine Status</h3>
                        <div class="flex items-center">
                          <div class="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span class="text-green-600 text-sm font-medium">Active</span>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p class="text-blue-700">Last Scan:</p>
                          <p class="font-medium">15 minutes ago</p>
                        </div>
                        <div>
                          <p class="text-blue-700">Assets Found:</p>
                          <p class="font-medium">12 new this hour</p>
                        </div>
                      </div>
                    </div>

                    <!-- Recent Discoveries -->
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-3">Recent Risk Discoveries</h4>
                      <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div class="flex items-center">
                            <i class="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                            <div>
                              <p class="font-medium text-red-900">Unpatched SQL Server</p>
                              <p class="text-red-700 text-sm">Critical vulnerability detected</p>
                            </div>
                          </div>
                          <span class="text-red-600 text-xs">2 min ago</span>
                        </div>

                        <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div class="flex items-center">
                            <i class="fas fa-shield-alt text-yellow-500 mr-3"></i>
                            <div>
                              <p class="font-medium text-yellow-900">Expired SSL Certificate</p>
                              <p class="text-yellow-700 text-sm">Authentication service affected</p>
                            </div>
                          </div>
                          <span class="text-yellow-600 text-xs">8 min ago</span>
                        </div>

                        <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div class="flex items-center">
                            <i class="fas fa-network-wired text-blue-500 mr-3"></i>
                            <div>
                              <p class="font-medium text-blue-900">New Network Segment</p>
                              <p class="text-blue-700 text-sm">Requires security assessment</p>
                            </div>
                          </div>
                          <span class="text-blue-600 text-xs">12 min ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Items -->
              <div class="mt-8 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <i class="fas fa-tasks text-green-500 mr-3"></i>
                  Recommended Actions
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div class="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 class="font-semibold text-red-900 mb-3">Immediate Actions</h3>
                    <ul class="space-y-2 text-sm text-red-800">
                      <li class="flex items-start">
                        <i class="fas fa-chevron-right text-red-500 mr-2 mt-0.5 text-xs"></i>
                        <span>Patch SQL Server vulnerability (CVE-2024-001)</span>
                      </li>
                      <li class="flex items-start">
                        <i class="fas fa-chevron-right text-red-500 mr-2 mt-0.5 text-xs"></i>
                        <span>Review customer portal security controls</span>
                      </li>
                      <li class="flex items-start">
                        <i class="fas fa-chevron-right text-red-500 mr-2 mt-0.5 text-xs"></i>
                        <span>Update incident response procedures</span>
                      </li>
                    </ul>
                  </div>

                  <div class="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
                    <h3 class="font-semibold text-yellow-900 mb-3">Short-term (This Week)</h3>
                    <ul class="space-y-2 text-sm text-yellow-800">
                      <li class="flex items-start">
                        <i class="fas fa-chevron-right text-yellow-500 mr-2 mt-0.5 text-xs"></i>
                        <span>Conduct dependency mapping for critical services</span>
                      </li>
                      <li class="flex items-start">
                        <i class="fas fa-chevron-right text-yellow-500 mr-2 mt-0.5 text-xs"></i>
                        <span>Implement automated asset discovery</span>
                      </li>
                      <li class="flex items-start">
                        <i class="fas fa-chevron-right text-yellow-500 mr-2 mt-0.5 text-xs"></i>
                        <span>Review and update CIA ratings</span>
                      </li>
                    </ul>
                  </div>

                  <div class="border border-green-200 rounded-lg p-6 bg-green-50">
                    <h3 class="font-semibold text-green-900 mb-3">Long-term (This Month)</h3>
                    <ul class="space-y-2 text-sm text-green-800">
                      <li class="flex items-start">
                        <i class="fas fa-chevron-right text-green-500 mr-2 mt-0.5 text-xs"></i>
                        <span>Develop service resilience framework</span>
                      </li>
                      <li class="flex items-start">
                        <i class="fas fa-chevron-right text-green-500 mr-2 mt-0.5 text-xs"></i>
                        <span>Establish cross-service risk correlation metrics</span>
                      </li>
                      <li class="flex items-start">
                        <i class="fas fa-chevron-right text-green-500 mr-2 mt-0.5 text-xs"></i>
                        <span>Create automated risk escalation workflows</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      })
    );
  });

  return routes;
}

export default { createPhase1SimpleRoutes };