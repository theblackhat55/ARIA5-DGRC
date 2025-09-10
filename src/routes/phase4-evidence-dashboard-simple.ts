/**
 * ARIA5.1 Phase 4: Evidence Collection Dashboard - Simple Working Version
 * Simplified dashboard with authentication and demo data
 */

import { Hono } from 'hono';
import { html } from 'hono/html';
import { cleanLayout } from '../templates/layout-clean';
import { authMiddleware } from '../middleware/auth-middleware';

type Bindings = {
  DB: D1Database;
};

const phase4EvidenceDashboard = new Hono<{ Bindings: Bindings }>();

// Apply authentication middleware
phase4EvidenceDashboard.use('*', authMiddleware);

/**
 * Phase 4 Evidence Collection Main Dashboard
 */
phase4EvidenceDashboard.get('/', async (c) => {
  try {
    const user = c.get('user');
    
    // Demo automation metrics
    const automationData = [
      {
        framework: 'SOC 2 Type II',
        automation: 68.5,
        quality: 94.2,
        validation: 96.8,
        target: 80.0
      },
      {
        framework: 'ISO 27001',
        automation: 72.3,
        quality: 91.7,
        validation: 98.1,
        target: 85.0
      },
      {
        framework: 'PCI DSS',
        automation: 84.1,
        quality: 97.3,
        validation: 99.2,
        target: 90.0
      }
    ];
    
    const overallAutomation = 74.9;
    const target = 80.0;

    return c.html(
      cleanLayout({
        title: 'Phase 4: Evidence Collection Automation - ARIA5.1',
        user: user,
        content: html`
          <div class="min-h-screen bg-gray-50">
            <!-- Phase 4 Header -->
            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                  <div class="flex items-center">
                    <div class="flex items-center space-x-3">
                      <i class="fas fa-robot text-3xl text-white"></i>
                      <div>
                        <h1 class="text-2xl font-bold text-white">Evidence Auto-Collection</h1>
                        <p class="text-sm text-purple-100">Phase 4 - Automated Compliance Evidence Collection</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="text-right">
                      <div class="text-sm text-purple-100">Automation Target</div>
                      <div class="text-xl font-bold text-white">${target}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Key Metrics -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <i class="fas fa-percentage text-2xl text-purple-600"></i>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Overall Automation</p>
                      <p class="text-2xl font-semibold text-gray-900">${overallAutomation}%</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <i class="fas fa-database text-2xl text-green-600"></i>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Evidence Sources</p>
                      <p class="text-2xl font-semibold text-gray-900">12</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <i class="fas fa-clock text-2xl text-blue-600"></i>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Active Jobs</p>
                      <p class="text-2xl font-semibold text-gray-900">8</p>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <i class="fas fa-file-check text-2xl text-orange-600"></i>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Artifacts Collected</p>
                      <p class="text-2xl font-semibold text-gray-900">1,247</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Framework Automation Status -->
              <div class="bg-white rounded-lg shadow mb-8">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-medium text-gray-900">
                    <i class="fas fa-chart-bar mr-2 text-purple-600"></i>
                    Framework Automation Status
                  </h3>
                </div>
                <div class="p-6">
                  <div class="space-y-6">
                    ${automationData.map(framework => html`
                      <div>
                        <div class="flex justify-between items-center mb-2">
                          <span class="text-sm font-medium text-gray-900">${framework.framework}</span>
                          <span class="text-sm text-gray-500">${framework.automation}% / ${framework.target}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3">
                          <div class="h-3 rounded-full ${framework.automation >= framework.target ? 'bg-green-500' : 'bg-blue-500'}" 
                               style="width: ${(framework.automation / framework.target) * 100}%"></div>
                        </div>
                        <div class="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Quality: ${framework.quality}%</span>
                          <span>Validation: ${framework.validation}%</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Evidence Collection Activity -->
              <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-medium text-gray-900">
                    <i class="fas fa-activity mr-2 text-purple-600"></i>
                    Recent Collection Activity
                  </h3>
                </div>
                <div class="p-6">
                  <div class="space-y-4">
                    <div class="flex items-center p-3 bg-green-50 rounded-lg">
                      <i class="fas fa-check-circle text-green-500 mr-3"></i>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Azure AD Access Logs Collected</p>
                        <p class="text-xs text-gray-500">2 minutes ago • 156 records processed</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center p-3 bg-green-50 rounded-lg">
                      <i class="fas fa-check-circle text-green-500 mr-3"></i>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Firewall Configuration Backup</p>
                        <p class="text-xs text-gray-500">5 minutes ago • Configuration validated</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                      <i class="fas fa-clock text-blue-500 mr-3"></i>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Security Scan Results Collection</p>
                        <p class="text-xs text-gray-500">In progress • Estimated completion: 3 minutes</p>
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
    console.error('Phase 4 dashboard error:', error);
    return c.html(
      cleanLayout({
        title: 'Error - Phase 4 Dashboard',
        user: c.get('user'),
        content: html`
          <div class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="text-center">
              <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h1>
              <p class="text-gray-600">Unable to load Phase 4 evidence collection dashboard.</p>
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

export { phase4EvidenceDashboard };