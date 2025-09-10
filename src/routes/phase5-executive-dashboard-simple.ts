/**
 * ARIA5.1 Phase 5: Executive Intelligence Dashboard - Simple Working Version  
 * Executive dashboard with authentication and demo financial data
 */

import { Hono } from 'hono';
import { html } from 'hono/html';
import { cleanLayout } from '../templates/layout-clean';
import { authMiddleware } from '../middleware/auth-middleware';

type Bindings = {
  DB: D1Database;
};

const phase5ExecutiveDashboard = new Hono<{ Bindings: Bindings }>();

// Apply authentication middleware
phase5ExecutiveDashboard.use('*', authMiddleware);

/**
 * Phase 5 Executive Intelligence Main Dashboard
 */
phase5ExecutiveDashboard.get('/', async (c) => {
  try {
    const user = c.get('user');
    
    // Demo executive KPIs
    const executiveKPIs = {
      totalServices: 8,
      criticalServices: 2,
      highRiskServices: 3,
      avgRiskScore: 65.4,
      financialExposure: 2450000,
      riskAppetiteStatus: 'Within Tolerance'
    };
    
    // Demo service financial impact data
    const serviceImpacts = [
      {
        name: 'Customer Payment Processing',
        criticality: 'Critical',
        riskScore: 85.2,
        financialExposure: 850000,
        status: 'Attention Required'
      },
      {
        name: 'Customer Data Platform',
        criticality: 'Critical', 
        riskScore: 78.9,
        financialExposure: 720000,
        status: 'Attention Required'
      },
      {
        name: 'Internal ERP System',
        criticality: 'High',
        riskScore: 62.1,
        financialExposure: 340000,
        status: 'Monitored'
      },
      {
        name: 'Marketing Analytics',
        criticality: 'Medium',
        riskScore: 45.6,
        financialExposure: 180000,
        status: 'Acceptable'
      }
    ];

    return c.html(
      cleanLayout({
        title: 'Phase 5: Executive Intelligence - ARIA5.1',
        user: user,
        content: html`
          <div class="min-h-screen bg-gray-50">
            <!-- Executive Header -->
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                  <div class="flex items-center">
                    <div class="flex items-center space-x-3">
                      <i class="fas fa-chart-line text-3xl text-white"></i>
                      <div>
                        <h1 class="text-2xl font-bold text-white">Executive Intelligence</h1>
                        <p class="text-sm text-indigo-100">Phase 5 - Service-Level Business Impact Analysis</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="text-right">
                      <div class="text-sm text-indigo-100">Risk Appetite</div>
                      <div class="text-xl font-bold text-white">${executiveKPIs.riskAppetiteStatus}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Executive KPI Dashboard -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <i class="fas fa-server text-2xl text-blue-600"></i>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Total Services</p>
                      <p class="text-2xl font-semibold text-gray-900">${executiveKPIs.totalServices}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Critical Services</p>
                      <p class="text-2xl font-semibold text-red-600">${executiveKPIs.criticalServices}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <i class="fas fa-dollar-sign text-2xl text-green-600"></i>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Financial Exposure</p>
                      <p class="text-2xl font-semibold text-gray-900">$${(executiveKPIs.financialExposure / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <i class="fas fa-chart-bar text-2xl text-orange-600"></i>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Avg Risk Score</p>
                      <p class="text-2xl font-semibold text-gray-900">${executiveKPIs.avgRiskScore}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Service Risk Heatmap -->
              <div class="bg-white rounded-lg shadow mb-8">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-medium text-gray-900">
                    <i class="fas fa-fire mr-2 text-red-600"></i>
                    Service Risk & Financial Impact Analysis
                  </h3>
                </div>
                <div class="p-6">
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criticality</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financial Exposure</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        ${serviceImpacts.map(service => html`
                          <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex items-center">
                                <div class="flex-shrink-0 h-3 w-3">
                                  <div class="h-3 w-3 rounded-full ${service.criticality === 'Critical' ? 'bg-red-500' : service.criticality === 'High' ? 'bg-orange-500' : 'bg-yellow-500'}"></div>
                                </div>
                                <div class="ml-4">
                                  <div class="text-sm font-medium text-gray-900">${service.name}</div>
                                </div>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.criticality === 'Critical' ? 'bg-red-100 text-red-800' : service.criticality === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}">
                                ${service.criticality}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div class="flex items-center">
                                <div class="flex-1">
                                  <div class="w-full bg-gray-200 rounded-full h-2 mr-2">
                                    <div class="h-2 rounded-full ${service.riskScore >= 80 ? 'bg-red-500' : service.riskScore >= 60 ? 'bg-orange-500' : 'bg-green-500'}" 
                                         style="width: ${service.riskScore}%"></div>
                                  </div>
                                </div>
                                <span class="text-xs text-gray-500 ml-2">${service.riskScore}</span>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              $${(service.financialExposure / 1000).toLocaleString()}K
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.status === 'Attention Required' ? 'bg-red-100 text-red-800' : service.status === 'Monitored' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                                ${service.status}
                              </span>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Strategic Recommendations -->
              <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-medium text-gray-900">
                    <i class="fas fa-lightbulb mr-2 text-yellow-600"></i>
                    AI-Powered Strategic Recommendations
                  </h3>
                </div>
                <div class="p-6">
                  <div class="space-y-4">
                    <div class="border-l-4 border-red-500 pl-4 bg-red-50 p-4 rounded">
                      <div class="flex justify-between items-start">
                        <div>
                          <h4 class="font-semibold text-red-800">High Priority: Customer Payment Processing</h4>
                          <p class="text-sm text-red-700 mt-1">
                            Risk score of 85.2 exceeds acceptable threshold. Immediate attention required for payment security controls.
                          </p>
                          <p class="text-xs text-red-600 mt-2">
                            <strong>ROI Impact:</strong> Addressing this risk could prevent up to $850K in potential losses.
                          </p>
                        </div>
                        <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Critical</span>
                      </div>
                    </div>
                    
                    <div class="border-l-4 border-orange-500 pl-4 bg-orange-50 p-4 rounded">
                      <div class="flex justify-between items-start">
                        <div>
                          <h4 class="font-semibold text-orange-800">Medium Priority: Data Platform Optimization</h4>
                          <p class="text-sm text-orange-700 mt-1">
                            Customer data platform shows elevated risk. Consider additional encryption and access controls.
                          </p>
                          <p class="text-xs text-orange-600 mt-2">
                            <strong>ROI Impact:</strong> Investment of $50K in controls could reduce $720K exposure by 40%.
                          </p>
                        </div>
                        <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">High</span>
                      </div>
                    </div>
                    
                    <div class="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded">
                      <div class="flex justify-between items-start">
                        <div>
                          <h4 class="font-semibold text-green-800">Positive Trend: Overall Risk Reduction</h4>
                          <p class="text-sm text-green-700 mt-1">
                            Average risk score has decreased by 12% over the last quarter due to implemented controls.
                          </p>
                          <p class="text-xs text-green-600 mt-2">
                            <strong>ROI Achievement:</strong> Current initiatives have reduced total exposure by $400K.
                          </p>
                        </div>
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Success</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      })
    );

  } catch (error) {
    console.error('Phase 5 dashboard error:', error);
    return c.html(
      cleanLayout({
        title: 'Error - Phase 5 Dashboard',
        user: c.get('user'),
        content: html`
          <div class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="text-center">
              <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h1>
              <p class="text-gray-600">Unable to load Phase 5 executive intelligence dashboard.</p>
              <button onclick="window.location.reload()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                Retry
              </button>
            </div>
          </div>
        `
      })
    );
  }
});

export { phase5ExecutiveDashboard };