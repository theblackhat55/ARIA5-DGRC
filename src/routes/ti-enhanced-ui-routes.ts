// TI-Enhanced UI Routes
// Route handlers for advanced TI dashboard and workbench interfaces

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { generateTIEnhancedDashboard, generateRiskAnalysisWorkbench } from '../templates/ti-enhanced-dashboard';

const tiEnhancedUIRoutes = new Hono();

// Apply authentication middleware to all routes
tiEnhancedUIRoutes.use('*', requireAuth);

// TI-Enhanced Dashboard
tiEnhancedUIRoutes.get('/dashboard', requirePermission('threat_intel:view'), async (c) => {
  try {
    const dashboardHtml = generateTIEnhancedDashboard();
    return c.html(dashboardHtml);
  } catch (error) {
    console.error('Error rendering TI-enhanced dashboard:', error);
    return c.text('Error loading dashboard', 500);
  }
});

// Risk Analysis Workbench
tiEnhancedUIRoutes.get('/workbench', requirePermission('risk:validate'), async (c) => {
  try {
    const workbenchHtml = generateRiskAnalysisWorkbench();
    return c.html(workbenchHtml);
  } catch (error) {
    console.error('Error rendering risk analysis workbench:', error);
    return c.text('Error loading workbench', 500);
  }
});

// Risk Details Page
tiEnhancedUIRoutes.get('/risk-details/:riskId', requirePermission('risk:view'), async (c) => {
  try {
    const riskId = c.req.param('riskId');
    const { DB } = c.env as { DB: D1Database };
    
    // Get risk details with TI mappings
    const risk = await DB.prepare(`
      SELECT r.*, 
             GROUP_CONCAT(ts.name) as ti_source_names,
             COUNT(rtm.id) as ti_mapping_count
      FROM risks r
      LEFT JOIN risk_ti_mappings rtm ON r.id = rtm.risk_id
      LEFT JOIN ti_indicators ti ON rtm.ti_indicator_id = ti.id
      LEFT JOIN ti_sources ts ON ti.source_id = ts.id
      WHERE r.id = ?
      GROUP BY r.id
    `).bind(riskId).first();
    
    if (!risk) {
      return c.text('Risk not found', 404);
    }
    
    // Get TI mappings details
    const mappings = await DB.prepare(`
      SELECT rtm.*, ti.identifier, ti.title as ti_title, ti.severity, 
             ts.name as source_name, ti.cvss_score, ti.epss_score
      FROM risk_ti_mappings rtm
      JOIN ti_indicators ti ON rtm.ti_indicator_id = ti.id
      JOIN ti_sources ts ON ti.source_id = ts.id
      WHERE rtm.risk_id = ?
      ORDER BY rtm.relevance_score DESC
    `).bind(riskId).all();
    
    const riskDetailsHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Risk Details - ${risk.title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
      </head>
      <body class="bg-gray-50">
          <div class="max-w-4xl mx-auto py-8 px-4">
              <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div class="flex items-center justify-between mb-6">
                      <div>
                          <h1 class="text-2xl font-bold text-gray-900">${risk.title}</h1>
                          <p class="text-gray-600 mt-1">Risk ID: ${risk.id}</p>
                      </div>
                      <div class="flex space-x-3">
                          <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getLifecycleColor(risk.risk_lifecycle_stage)}">
                              ${risk.risk_lifecycle_stage}
                          </span>
                          <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getCategoryColor(risk.category)}">
                              ${risk.category}
                          </span>
                      </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div class="text-center p-4 bg-gray-50 rounded-lg">
                          <div class="text-2xl font-bold ${this.getRiskScoreColor(risk.risk_score)}">${risk.risk_score}</div>
                          <div class="text-sm text-gray-600">Risk Score</div>
                      </div>
                      <div class="text-center p-4 bg-gray-50 rounded-lg">
                          <div class="text-2xl font-bold text-blue-600">${risk.ti_mapping_count || 0}</div>
                          <div class="text-sm text-gray-600">TI Mappings</div>
                      </div>
                      <div class="text-center p-4 bg-gray-50 rounded-lg">
                          <div class="text-2xl font-bold ${risk.ti_enriched ? 'text-green-600' : 'text-gray-400'}">
                              ${risk.ti_enriched ? 'Yes' : 'No'}
                          </div>
                          <div class="text-sm text-gray-600">TI Enhanced</div>
                      </div>
                  </div>
                  
                  <div class="space-y-4">
                      <div>
                          <h3 class="font-medium text-gray-900 mb-2">Description</h3>
                          <p class="text-gray-700">${risk.description}</p>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4">
                          <div>
                              <h4 class="font-medium text-gray-900 mb-1">Likelihood</h4>
                              <span class="text-gray-700 capitalize">${risk.likelihood}</span>
                          </div>
                          <div>
                              <h4 class="font-medium text-gray-900 mb-1">Impact</h4>
                              <span class="text-gray-700 capitalize">${risk.impact}</span>
                          </div>
                      </div>
                      
                      ${risk.ti_enriched && (risk.epss_score || risk.cvss_score) ? `
                      <div class="grid grid-cols-2 gap-4 pt-4 border-t">
                          ${risk.epss_score ? `
                          <div>
                              <h4 class="font-medium text-gray-900 mb-1">EPSS Score</h4>
                              <span class="text-orange-600 font-medium">${(risk.epss_score * 100).toFixed(2)}%</span>
                          </div>
                          ` : ''}
                          ${risk.cvss_score ? `
                          <div>
                              <h4 class="font-medium text-gray-900 mb-1">CVSS Score</h4>
                              <span class="text-red-600 font-medium">${risk.cvss_score}</span>
                          </div>
                          ` : ''}
                      </div>
                      ` : ''}
                  </div>
              </div>
              
              ${mappings.results && mappings.results.length > 0 ? `
              <div class="bg-white rounded-xl shadow-sm p-6">
                  <h2 class="text-lg font-semibold text-gray-900 mb-4">Threat Intelligence Mappings</h2>
                  <div class="space-y-4">
                      ${mappings.results.map(mapping => `
                          <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div class="flex-1">
                                  <div class="font-medium text-gray-900">${mapping.identifier}</div>
                                  <div class="text-sm text-gray-600">${mapping.ti_title || 'No title available'}</div>
                                  <div class="text-xs text-gray-500 mt-1">
                                      Source: ${mapping.source_name} • Severity: ${mapping.severity}
                                      ${mapping.cvss_score ? ` • CVSS: ${mapping.cvss_score}` : ''}
                                      ${mapping.epss_score ? ` • EPSS: ${(mapping.epss_score * 100).toFixed(1)}%` : ''}
                                  </div>
                              </div>
                              <div class="ml-4 text-right">
                                  <div class="text-sm font-medium text-blue-600">${(mapping.relevance_score * 100).toFixed(0)}% relevance</div>
                                  <div class="text-xs text-gray-500">${mapping.mapping_reason}</div>
                              </div>
                          </div>
                      `).join('')}
                  </div>
              </div>
              ` : ''}
              
              <div class="mt-6 flex justify-center">
                  <button onclick="window.close()" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      Close
                  </button>
              </div>
          </div>
      </body>
      </html>
    `;
    
    return c.html(riskDetailsHtml);
  } catch (error) {
    console.error('Error rendering risk details:', error);
    return c.text('Error loading risk details', 500);
  }
});

// TI Indicator Details Page
tiEnhancedUIRoutes.get('/ti-indicator/:indicatorId', requirePermission('threat_intel:view'), async (c) => {
  try {
    const indicatorId = c.req.param('indicatorId');
    const { DB } = c.env as { DB: D1Database };
    
    // Get indicator details
    const indicator = await DB.prepare(`
      SELECT ti.*, ts.name as source_name, ts.type as source_type, ts.url as source_url,
             COUNT(rtm.id) as risk_mapping_count
      FROM ti_indicators ti
      JOIN ti_sources ts ON ti.source_id = ts.id
      LEFT JOIN risk_ti_mappings rtm ON ti.id = rtm.ti_indicator_id
      WHERE ti.id = ?
      GROUP BY ti.id
    `).bind(indicatorId).first();
    
    if (!indicator) {
      return c.text('TI Indicator not found', 404);
    }
    
    // Get related risks
    const relatedRisks = await DB.prepare(`
      SELECT r.id, r.title, r.category, r.risk_score, r.status, r.risk_lifecycle_stage,
             rtm.relevance_score, rtm.mapping_reason
      FROM risks r
      JOIN risk_ti_mappings rtm ON r.id = rtm.risk_id
      WHERE rtm.ti_indicator_id = ?
      ORDER BY rtm.relevance_score DESC
    `).bind(indicatorId).all();
    
    const indicatorDetailsHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>TI Indicator - ${indicator.identifier}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
      </head>
      <body class="bg-gray-50">
          <div class="max-w-4xl mx-auto py-8 px-4">
              <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div class="flex items-center justify-between mb-6">
                      <div>
                          <h1 class="text-2xl font-bold text-gray-900">${indicator.identifier}</h1>
                          <p class="text-gray-600 mt-1">${indicator.source_name} • ${indicator.indicator_type}</p>
                      </div>
                      <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getSeverityColor(indicator.severity)}">
                          ${indicator.severity}
                      </span>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      ${indicator.cvss_score ? `
                      <div class="text-center p-4 bg-red-50 rounded-lg">
                          <div class="text-2xl font-bold text-red-600">${indicator.cvss_score}</div>
                          <div class="text-sm text-gray-600">CVSS Score</div>
                      </div>
                      ` : ''}
                      ${indicator.epss_score ? `
                      <div class="text-center p-4 bg-orange-50 rounded-lg">
                          <div class="text-2xl font-bold text-orange-600">${(indicator.epss_score * 100).toFixed(1)}%</div>
                          <div class="text-sm text-gray-600">EPSS Score</div>
                      </div>
                      ` : ''}
                      <div class="text-center p-4 bg-blue-50 rounded-lg">
                          <div class="text-2xl font-bold text-blue-600">${indicator.risk_mapping_count}</div>
                          <div class="text-sm text-gray-600">Risk Mappings</div>
                      </div>
                      <div class="text-center p-4 bg-green-50 rounded-lg">
                          <div class="text-2xl font-bold ${indicator.exploit_available ? 'text-red-600' : 'text-green-600'}">
                              ${indicator.exploit_available ? 'Yes' : 'No'}
                          </div>
                          <div class="text-sm text-gray-600">Exploit Available</div>
                      </div>
                  </div>
                  
                  <div class="space-y-4">
                      ${indicator.title ? `
                      <div>
                          <h3 class="font-medium text-gray-900 mb-2">Title</h3>
                          <p class="text-gray-700">${indicator.title}</p>
                      </div>
                      ` : ''}
                      
                      ${indicator.description ? `
                      <div>
                          <h3 class="font-medium text-gray-900 mb-2">Description</h3>
                          <p class="text-gray-700">${indicator.description}</p>
                      </div>
                      ` : ''}
                      
                      <div class="grid grid-cols-2 gap-4">
                          <div>
                              <h4 class="font-medium text-gray-900 mb-1">First Seen</h4>
                              <span class="text-gray-700">${dayjs(indicator.first_seen).format('YYYY-MM-DD HH:mm')}</span>
                          </div>
                          <div>
                              <h4 class="font-medium text-gray-900 mb-1">Last Updated</h4>
                              <span class="text-gray-700">${dayjs(indicator.last_updated).format('YYYY-MM-DD HH:mm')}</span>
                          </div>
                      </div>
                      
                      ${indicator.affected_products ? `
                      <div>
                          <h4 class="font-medium text-gray-900 mb-2">Affected Products</h4>
                          <div class="flex flex-wrap gap-2">
                              ${JSON.parse(indicator.affected_products || '[]').map(product => 
                                  `<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">${product}</span>`
                              ).join('')}
                          </div>
                      </div>
                      ` : ''}
                      
                      ${indicator.mitigation_details ? `
                      <div>
                          <h4 class="font-medium text-gray-900 mb-2">Mitigation</h4>
                          <p class="text-gray-700">${indicator.mitigation_details}</p>
                      </div>
                      ` : ''}
                  </div>
              </div>
              
              ${relatedRisks.results && relatedRisks.results.length > 0 ? `
              <div class="bg-white rounded-xl shadow-sm p-6">
                  <h2 class="text-lg font-semibold text-gray-900 mb-4">Related Risks</h2>
                  <div class="space-y-3">
                      ${relatedRisks.results.map(risk => `
                          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div class="flex-1">
                                  <div class="font-medium text-gray-900">${risk.title}</div>
                                  <div class="text-sm text-gray-600">${risk.category} • Risk Score: ${risk.risk_score}</div>
                              </div>
                              <div class="ml-4 text-right">
                                  <div class="text-sm font-medium text-blue-600">${(risk.relevance_score * 100).toFixed(0)}% relevance</div>
                                  <div class="text-xs text-gray-500">${risk.risk_lifecycle_stage}</div>
                              </div>
                          </div>
                      `).join('')}
                  </div>
              </div>
              ` : ''}
              
              <div class="mt-6 flex justify-center">
                  <button onclick="window.close()" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      Close
                  </button>
              </div>
          </div>
      </body>
      </html>
    `;
    
    return c.html(indicatorDetailsHtml);
  } catch (error) {
    console.error('Error rendering TI indicator details:', error);
    return c.text('Error loading TI indicator details', 500);
  }
});

// Service Details Page
tiEnhancedUIRoutes.get('/service-details/:serviceId', requirePermission('service:view'), async (c) => {
  try {
    const serviceId = c.req.param('serviceId');
    const { DB } = c.env as { DB: D1Database };
    
    // Get service details
    const service = await DB.prepare(`
      SELECT * FROM services WHERE id = ?
    `).bind(serviceId).first();
    
    if (!service) {
      return c.text('Service not found', 404);
    }
    
    // Get recent risk assessments
    const assessments = await DB.prepare(`
      SELECT * FROM service_risk_assessments 
      WHERE service_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(serviceId).all();
    
    // Get related risks
    const relatedRisks = await DB.prepare(`
      SELECT r.* FROM risks r
      WHERE r.description LIKE ? OR r.title LIKE ?
      ORDER BY r.risk_score DESC
      LIMIT 10
    `).bind(`%${service.name}%`, `%${service.name}%`).all();
    
    const serviceDetailsHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Service Details - ${service.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
      </head>
      <body class="bg-gray-50">
          <div class="max-w-4xl mx-auto py-8 px-4">
              <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div class="flex items-center justify-between mb-6">
                      <div>
                          <h1 class="text-2xl font-bold text-gray-900">${service.name}</h1>
                          <p class="text-gray-600 mt-1">Service ID: ${service.id} • ${service.service_category || 'Uncategorized'}</p>
                      </div>
                      <span class="px-3 py-1 rounded-full text-sm font-medium ${service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                          ${service.status}
                      </span>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div class="text-center p-4 bg-blue-50 rounded-lg">
                          <div class="text-2xl font-bold text-blue-600">${service.criticality_score || 0}</div>
                          <div class="text-sm text-gray-600">CIA Score</div>
                      </div>
                      <div class="text-center p-4 bg-orange-50 rounded-lg">
                          <div class="text-2xl font-bold text-orange-600">${service.risk_score || 0}</div>
                          <div class="text-sm text-gray-600">Risk Score</div>
                      </div>
                      <div class="text-center p-4 bg-green-50 rounded-lg">
                          <div class="text-2xl font-bold text-green-600">${service.ti_risk_score || 0}</div>
                          <div class="text-sm text-gray-600">TI Risk Score</div>
                      </div>
                      <div class="text-center p-4 bg-purple-50 rounded-lg">
                          <div class="text-2xl font-bold text-purple-600">${assessments.results ? assessments.results.length : 0}</div>
                          <div class="text-sm text-gray-600">Assessments</div>
                      </div>
                  </div>
                  
                  <div class="space-y-4">
                      ${service.description ? `
                      <div>
                          <h3 class="font-medium text-gray-900 mb-2">Description</h3>
                          <p class="text-gray-700">${service.description}</p>
                      </div>
                      ` : ''}
                      
                      <div class="grid grid-cols-2 gap-4">
                          ${service.business_department ? `
                          <div>
                              <h4 class="font-medium text-gray-900 mb-1">Department</h4>
                              <span class="text-gray-700">${service.business_department}</span>
                          </div>
                          ` : ''}
                          ${service.service_owner ? `
                          <div>
                              <h4 class="font-medium text-gray-900 mb-1">Owner</h4>
                              <span class="text-gray-700">${service.service_owner}</span>
                          </div>
                          ` : ''}
                      </div>
                      
                      ${service.ti_monitoring_enabled ? `
                      <div class="p-4 bg-blue-50 rounded-lg">
                          <div class="flex items-center">
                              <i class="fas fa-shield-alt text-blue-600 mr-2"></i>
                              <span class="font-medium text-blue-900">TI Monitoring Enabled</span>
                          </div>
                          ${service.last_ti_scan ? `
                          <div class="text-sm text-blue-700 mt-1">Last TI scan: ${dayjs(service.last_ti_scan).fromNow()}</div>
                          ` : ''}
                      </div>
                      ` : ''}
                  </div>
              </div>
              
              ${assessments.results && assessments.results.length > 0 ? `
              <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Risk Assessments</h2>
                  <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                          <thead class="bg-gray-50">
                              <tr>
                                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Score</th>
                                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cybersecurity</th>
                                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operational</th>
                                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TI Enhanced</th>
                              </tr>
                          </thead>
                          <tbody class="bg-white divide-y divide-gray-200">
                              ${assessments.results.map(assessment => `
                                  <tr>
                                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          ${dayjs(assessment.assessment_date).format('YYYY-MM-DD')}
                                      </td>
                                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          ${Math.round(assessment.overall_risk_score)}
                                      </td>
                                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          ${Math.round(assessment.cybersecurity_score || 0)}
                                      </td>
                                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          ${Math.round(assessment.operational_score || 0)}
                                      </td>
                                      <td class="px-6 py-4 whitespace-nowrap">
                                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assessment.ti_enhanced ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                              ${assessment.ti_enhanced ? 'Yes' : 'No'}
                                          </span>
                                      </td>
                                  </tr>
                              `).join('')}
                          </tbody>
                      </table>
                  </div>
              </div>
              ` : ''}
              
              ${relatedRisks.results && relatedRisks.results.length > 0 ? `
              <div class="bg-white rounded-xl shadow-sm p-6">
                  <h2 class="text-lg font-semibold text-gray-900 mb-4">Related Risks</h2>
                  <div class="space-y-3">
                      ${relatedRisks.results.map(risk => `
                          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div class="flex-1">
                                  <div class="font-medium text-gray-900">${risk.title}</div>
                                  <div class="text-sm text-gray-600">${risk.category} • ${risk.risk_lifecycle_stage}</div>
                              </div>
                              <div class="ml-4 text-right">
                                  <div class="text-sm font-medium ${this.getRiskScoreColor(risk.risk_score)}">${risk.risk_score}</div>
                                  <div class="text-xs text-gray-500">${risk.status}</div>
                              </div>
                          </div>
                      `).join('')}
                  </div>
              </div>
              ` : ''}
              
              <div class="mt-6 flex justify-center">
                  <button onclick="window.close()" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      Close
                  </button>
              </div>
          </div>
      </body>
      </html>
    `;
    
    return c.html(serviceDetailsHtml);
  } catch (error) {
    console.error('Error rendering service details:', error);
    return c.text('Error loading service details', 500);
  }
});

export { tiEnhancedUIRoutes };