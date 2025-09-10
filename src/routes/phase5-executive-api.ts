/**
 * ARIA5.1 Phase 5: Executive Intelligence - API Routes
 * Service-Level Business Impact and Executive Dashboard APIs
 * 
 * Comprehensive REST API for executive intelligence, financial impact modeling,
 * and C-level business impact reporting with real-time analytics.
 */

import { Hono } from 'hono';
import { Phase5ExecutiveIntelligence } from '../services/phase5-executive-intelligence';

type Bindings = {
  DB: D1Database;
};

const phase5ExecutiveAPI = new Hono<{ Bindings: Bindings }>();

// ================================================================
// EXECUTIVE BUSINESS IMPACT REPORTS
// ================================================================

/**
 * Generate comprehensive business impact report for executives
 * POST /api/v2/executive/business-impact-report
 */
phase5ExecutiveAPI.post('/business-impact-report', async (c) => {
  try {
    const { env } = c;
    const executive = new Phase5ExecutiveIntelligence(env.DB);
    
    const { reporting_period, include_forecasts, executive_summary_only } = await c.req.json().catch(() => ({}));
    
    // Generate comprehensive business impact report
    const report = await executive.generateBusinessImpactReport();
    
    // Calculate additional executive metrics
    const kpis = await executive.generateExecutiveKPIs();
    const riskAppetite = await executive.getRiskAppetiteStatus();
    const criticalServices = await executive.getServicesRequiringAttention();
    
    // Enhanced report with executive context
    const executiveReport = {
      ...report,
      executive_kpis: kpis,
      risk_appetite_status: riskAppetite,
      services_requiring_attention: criticalServices,
      generated_at: new Date().toISOString(),
      reporting_metadata: {
        report_type: 'comprehensive_business_impact',
        reporting_period: reporting_period || 'current',
        include_forecasts: include_forecasts || true,
        executive_summary_only: executive_summary_only || false
      }
    };
    
    return c.json({
      success: true,
      message: 'Executive business impact report generated successfully',
      data: executiveReport
    });

  } catch (error) {
    console.error('Executive business impact report API error:', error);
    return c.json({
      success: false,
      error: 'Failed to generate executive business impact report',
      details: error.message
    }, 500);
  }
});

/**
 * Get executive dashboard KPIs
 * GET /api/v2/executive/kpis
 */
phase5ExecutiveAPI.get('/kpis', async (c) => {
  try {
    const { env } = c;
    const executive = new Phase5ExecutiveIntelligence(env.DB);
    
    const { dashboard_type = 'ceo' } = c.req.query();
    
    // Get executive KPIs
    const kpis = await executive.generateExecutiveKPIs();
    
    // Get dashboard configuration
    const dashboardConfig = await executive.getExecutiveDashboardConfig(dashboard_type);
    
    // Get risk appetite status
    const riskAppetite = await executive.getRiskAppetiteStatus();
    
    return c.json({
      success: true,
      data: {
        kpis: kpis,
        dashboard_config: dashboardConfig,
        risk_appetite: riskAppetite,
        last_updated: new Date().toISOString(),
        dashboard_type: dashboard_type
      }
    });

  } catch (error) {
    console.error('Executive KPIs API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve executive KPIs',
      details: error.message
    }, 500);
  }
});

// ================================================================
// SERVICE FINANCIAL IMPACT MANAGEMENT
// ================================================================

/**
 * Get service financial profiles
 * GET /api/v2/executive/service-financial-profiles
 */
phase5ExecutiveAPI.get('/service-financial-profiles', async (c) => {
  try {
    const { env } = c;
    const { service_id, include_risk_data = 'true' } = c.req.query();
    
    let query = `
      SELECT 
        sfp.*,
        s.name as service_name,
        s.criticality_level,
        s.service_status
      FROM service_financial_profiles sfp
      JOIN services s ON sfp.service_id = s.id
    `;
    
    const params = [];
    if (service_id) {
      query += ' WHERE sfp.service_id = ?';
      params.push(service_id);
    }
    
    query += ' ORDER BY sfp.annual_revenue_impact DESC';
    
    const result = await env.DB.prepare(query).bind(...params).all();
    const profiles = result.results || [];
    
    // Include current risk data if requested
    if (include_risk_data === 'true' && profiles.length > 0) {
      const executive = new Phase5ExecutiveIntelligence(env.DB);
      const serviceRisks = await executive.aggregateServiceRisks();
      
      // Merge risk data with financial profiles
      profiles.forEach((profile: any) => {
        const riskData = serviceRisks.find(r => r.service_id === profile.service_id);
        if (riskData) {
          profile.current_risk_score = riskData.total_risk_score;
          profile.financial_impact_estimate = riskData.financial_impact_estimate;
          profile.risk_trend = riskData.trend_indicator;
        }
      });
    }
    
    return c.json({
      success: true,
      data: {
        profiles: profiles,
        total_count: profiles.length,
        total_revenue_at_risk: profiles.reduce((sum: number, p: any) => sum + (p.annual_revenue_impact || 0), 0)
      }
    });

  } catch (error) {
    console.error('Service financial profiles API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve service financial profiles',
      details: error.message
    }, 500);
  }
});

/**
 * Update service financial profile
 * PUT /api/v2/executive/service-financial-profiles/:serviceId
 */
phase5ExecutiveAPI.put('/service-financial-profiles/:serviceId', async (c) => {
  try {
    const { env } = c;
    const serviceId = parseInt(c.req.param('serviceId'));
    const profileData = await c.req.json();
    
    if (!serviceId || serviceId <= 0) {
      return c.json({ success: false, error: 'Invalid service ID' }, 400);
    }

    const executive = new Phase5ExecutiveIntelligence(env.DB);
    const success = await executive.updateServiceFinancialProfile(serviceId, profileData);
    
    if (success) {
      return c.json({
        success: true,
        message: 'Service financial profile updated successfully',
        data: { service_id: serviceId }
      });
    } else {
      return c.json({
        success: false,
        error: 'Failed to update service financial profile'
      }, 500);
    }

  } catch (error) {
    console.error('Service financial profile update API error:', error);
    return c.json({
      success: false,
      error: 'Failed to update service financial profile',
      details: error.message
    }, 500);
  }
});

// ================================================================
// RISK APPETITE AND TOLERANCE MANAGEMENT
// ================================================================

/**
 * Get risk appetite status
 * GET /api/v2/executive/risk-appetite
 */
phase5ExecutiveAPI.get('/risk-appetite', async (c) => {
  try {
    const { env } = c;
    const executive = new Phase5ExecutiveIntelligence(env.DB);
    
    const riskAppetite = await executive.getRiskAppetiteStatus();
    
    // Calculate overall risk appetite utilization
    const overallUtilization = riskAppetite.length > 0 
      ? riskAppetite.reduce((sum, r) => sum + r.utilization_percentage, 0) / riskAppetite.length
      : 0;
    
    const breaches = riskAppetite.filter(r => r.status === 'exceeds_tolerance');
    const warnings = riskAppetite.filter(r => r.status === 'approaching_limit');
    
    return c.json({
      success: true,
      data: {
        risk_appetite_frameworks: riskAppetite,
        overall_utilization: Math.round(overallUtilization * 100) / 100,
        total_frameworks: riskAppetite.length,
        breaches_count: breaches.length,
        warnings_count: warnings.length,
        status_summary: {
          breaches: breaches,
          warnings: warnings,
          within_tolerance: riskAppetite.filter(r => r.status === 'within_tolerance')
        }
      }
    });

  } catch (error) {
    console.error('Risk appetite API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve risk appetite status',
      details: error.message
    }, 500);
  }
});

// ================================================================
// EXECUTIVE DECISION SUPPORT
// ================================================================

/**
 * Get executive decisions requiring approval
 * GET /api/v2/executive/decisions
 */
phase5ExecutiveAPI.get('/decisions', async (c) => {
  try {
    const { env } = c;
    const { status = 'pending', decision_type, limit = '20' } = c.req.query();
    
    let query = `
      SELECT 
        id, decision_id, decision_type, decision_title, 
        decision_description, financial_implications,
        recommended_action, risk_reduction_potential,
        implementation_timeframe, approval_status,
        created_by, created_at
      FROM executive_decision_support
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND approval_status = ?';
      params.push(status);
    }
    
    if (decision_type) {
      query += ' AND decision_type = ?';
      params.push(decision_type);
    }
    
    query += ` ORDER BY 
      CASE approval_status 
        WHEN 'pending' THEN 1 
        WHEN 'approved' THEN 2 
        ELSE 3 
      END,
      financial_implications DESC, 
      created_at DESC
      LIMIT ?`;
    params.push(limit);
    
    const result = await env.DB.prepare(query).bind(...params).all();
    const decisions = result.results || [];
    
    // Calculate decision statistics
    const stats = {
      total_decisions: decisions.length,
      total_financial_impact: decisions.reduce((sum: number, d: any) => sum + (d.financial_implications || 0), 0),
      avg_risk_reduction: decisions.reduce((sum: number, d: any) => sum + (d.risk_reduction_potential || 0), 0) / Math.max(decisions.length, 1),
      by_type: {} as Record<string, number>,
      by_timeframe: {} as Record<string, number>
    };
    
    decisions.forEach((decision: any) => {
      stats.by_type[decision.decision_type] = (stats.by_type[decision.decision_type] || 0) + 1;
      stats.by_timeframe[decision.implementation_timeframe] = (stats.by_timeframe[decision.implementation_timeframe] || 0) + 1;
    });
    
    return c.json({
      success: true,
      data: {
        decisions: decisions,
        statistics: stats,
        filters_applied: { status, decision_type, limit }
      }
    });

  } catch (error) {
    console.error('Executive decisions API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve executive decisions',
      details: error.message
    }, 500);
  }
});

/**
 * Create executive decision
 * POST /api/v2/executive/decisions
 */
phase5ExecutiveAPI.post('/decisions', async (c) => {
  try {
    const { env } = c;
    const decisionData = await c.req.json();
    
    // Validate required fields
    const required = ['decision_type', 'decision_title', 'recommended_action'];
    for (const field of required) {
      if (!decisionData[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`
        }, 400);
      }
    }

    const executive = new Phase5ExecutiveIntelligence(env.DB);
    const decisionId = await executive.createExecutiveDecision(decisionData);
    
    return c.json({
      success: true,
      message: 'Executive decision created successfully',
      data: {
        decision_id: decisionId,
        status: 'pending_approval'
      }
    });

  } catch (error) {
    console.error('Executive decision creation API error:', error);
    return c.json({
      success: false,
      error: 'Failed to create executive decision',
      details: error.message
    }, 500);
  }
});

/**
 * Approve/reject executive decision
 * PUT /api/v2/executive/decisions/:decisionId/approve
 */
phase5ExecutiveAPI.put('/decisions/:decisionId/approve', async (c) => {
  try {
    const { env } = c;
    const decisionId = c.req.param('decisionId');
    const { approval_status, approval_comments, approved_by } = await c.req.json();
    
    if (!['approved', 'rejected', 'deferred'].includes(approval_status)) {
      return c.json({
        success: false,
        error: 'Invalid approval status. Must be: approved, rejected, or deferred'
      }, 400);
    }

    const updateQuery = `
      UPDATE executive_decision_support 
      SET 
        approval_status = ?1,
        approved_by = ?2,
        approval_date = datetime('now'),
        updated_at = datetime('now')
      WHERE decision_id = ?3
    `;
    
    const result = await env.DB.prepare(updateQuery).bind(
      approval_status,
      approved_by || 'executive',
      decisionId
    ).run();
    
    if (result.changes === 0) {
      return c.json({ success: false, error: 'Executive decision not found' }, 404);
    }

    return c.json({
      success: true,
      message: `Executive decision ${approval_status} successfully`,
      data: {
        decision_id: decisionId,
        new_status: approval_status,
        approved_by: approved_by
      }
    });

  } catch (error) {
    console.error('Executive decision approval API error:', error);
    return c.json({
      success: false,
      error: 'Failed to update executive decision status',
      details: error.message
    }, 500);
  }
});

// ================================================================
// BUSINESS IMPACT INCIDENT TRACKING
// ================================================================

/**
 * Record business impact incident
 * POST /api/v2/executive/incidents
 */
phase5ExecutiveAPI.post('/incidents', async (c) => {
  try {
    const { env } = c;
    const incidentData = await c.req.json();
    
    // Validate required fields
    const required = ['incident_id', 'service_id', 'incident_title', 'severity_level'];
    for (const field of required) {
      if (!incidentData[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`
        }, 400);
      }
    }

    const executive = new Phase5ExecutiveIntelligence(env.DB);
    const success = await executive.recordBusinessImpactIncident(incidentData);
    
    if (success) {
      return c.json({
        success: true,
        message: 'Business impact incident recorded successfully',
        data: {
          incident_id: incidentData.incident_id,
          service_id: incidentData.service_id
        }
      });
    } else {
      return c.json({
        success: false,
        error: 'Failed to record business impact incident'
      }, 500);
    }

  } catch (error) {
    console.error('Business impact incident API error:', error);
    return c.json({
      success: false,
      error: 'Failed to record business impact incident',
      details: error.message
    }, 500);
  }
});

/**
 * Get business impact incidents
 * GET /api/v2/executive/incidents
 */
phase5ExecutiveAPI.get('/incidents', async (c) => {
  try {
    const { env } = c;
    const { 
      service_id, 
      severity_level, 
      days = '30',
      limit = '50'
    } = c.req.query();
    
    let query = `
      SELECT 
        bii.*,
        s.name as service_name,
        s.criticality_level
      FROM business_impact_incidents bii
      JOIN services s ON bii.service_id = s.id
      WHERE bii.incident_start_time >= datetime('now', '-${parseInt(days)} days')
    `;
    
    const params = [];
    
    if (service_id) {
      query += ' AND bii.service_id = ?';
      params.push(service_id);
    }
    
    if (severity_level) {
      query += ' AND bii.severity_level = ?';
      params.push(severity_level);
    }
    
    query += `
      ORDER BY bii.incident_start_time DESC
      LIMIT ?
    `;
    params.push(limit);
    
    const result = await env.DB.prepare(query).bind(...params).all();
    const incidents = result.results || [];
    
    // Calculate incident statistics
    const stats = {
      total_incidents: incidents.length,
      total_financial_impact: incidents.reduce((sum: number, i: any) => sum + (i.actual_financial_impact || 0), 0),
      total_customers_affected: incidents.reduce((sum: number, i: any) => sum + (i.customers_affected || 0), 0),
      avg_duration_minutes: incidents.length > 0 
        ? incidents.reduce((sum: number, i: any) => sum + (i.duration_minutes || 0), 0) / incidents.length
        : 0,
      by_severity: {} as Record<string, number>
    };
    
    incidents.forEach((incident: any) => {
      stats.by_severity[incident.severity_level] = (stats.by_severity[incident.severity_level] || 0) + 1;
    });
    
    return c.json({
      success: true,
      data: {
        incidents: incidents,
        statistics: stats,
        reporting_period_days: parseInt(days)
      }
    });

  } catch (error) {
    console.error('Business impact incidents query API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve business impact incidents',
      details: error.message
    }, 500);
  }
});

// ================================================================
// FINANCIAL MODELING AND ROI CALCULATIONS
// ================================================================

/**
 * Calculate mitigation ROI
 * POST /api/v2/executive/calculate-roi
 */
phase5ExecutiveAPI.post('/calculate-roi', async (c) => {
  try {
    const { env } = c;
    const { mitigation_cost, risk_reduction_percent, current_risk_value } = await c.req.json();
    
    // Validate inputs
    if (typeof mitigation_cost !== 'number' || mitigation_cost <= 0) {
      return c.json({ success: false, error: 'Invalid mitigation cost' }, 400);
    }
    
    if (typeof risk_reduction_percent !== 'number' || risk_reduction_percent <= 0 || risk_reduction_percent > 100) {
      return c.json({ success: false, error: 'Invalid risk reduction percentage (must be 1-100)' }, 400);
    }
    
    if (typeof current_risk_value !== 'number' || current_risk_value <= 0) {
      return c.json({ success: false, error: 'Invalid current risk value' }, 400);
    }

    const executive = new Phase5ExecutiveIntelligence(env.DB);
    const roi = await executive.calculateMitigationROI(
      mitigation_cost,
      risk_reduction_percent,
      current_risk_value
    );
    
    const riskReduction = current_risk_value * (risk_reduction_percent / 100);
    const netBenefit = riskReduction - mitigation_cost;
    const paybackPeriod = mitigation_cost / (riskReduction / 12); // Months
    
    return c.json({
      success: true,
      data: {
        roi_percentage: roi,
        risk_reduction_value: Math.round(riskReduction),
        net_benefit: Math.round(netBenefit),
        payback_period_months: Math.round(paybackPeriod * 100) / 100,
        investment_recommendation: roi > 50 ? 'highly_recommended' : roi > 0 ? 'recommended' : 'not_recommended',
        calculation_inputs: {
          mitigation_cost,
          risk_reduction_percent,
          current_risk_value
        }
      }
    });

  } catch (error) {
    console.error('ROI calculation API error:', error);
    return c.json({
      success: false,
      error: 'Failed to calculate mitigation ROI',
      details: error.message
    }, 500);
  }
});

// ================================================================
// EXECUTIVE REPORTS
// ================================================================

/**
 * Get available executive reports
 * GET /api/v2/executive/reports
 */
phase5ExecutiveAPI.get('/reports', async (c) => {
  try {
    const { env } = c;
    const { report_type, days = '90', limit = '20' } = c.req.query();
    
    let query = `
      SELECT 
        report_id, report_type, report_title,
        reporting_period_start, reporting_period_end,
        generated_date, report_status, target_audience,
        created_by, approved_by, approval_date
      FROM executive_reports
      WHERE generated_date >= datetime('now', '-${parseInt(days)} days')
    `;
    
    const params = [];
    
    if (report_type) {
      query += ' AND report_type = ?';
      params.push(report_type);
    }
    
    query += `
      ORDER BY generated_date DESC
      LIMIT ?
    `;
    params.push(limit);
    
    const result = await env.DB.prepare(query).bind(...params).all();
    const reports = result.results || [];
    
    return c.json({
      success: true,
      data: {
        reports: reports,
        total_count: reports.length,
        available_types: ['monthly_executive', 'quarterly_board', 'incident_impact', 'annual_summary']
      }
    });

  } catch (error) {
    console.error('Executive reports API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve executive reports',
      details: error.message
    }, 500);
  }
});

// ================================================================
// SYSTEM HEALTH AND STATUS
// ================================================================

/**
 * Get executive intelligence system health
 * GET /api/v2/executive/health
 */
phase5ExecutiveAPI.get('/health', async (c) => {
  try {
    const { env } = c;
    
    // Check database connectivity
    const dbCheck = await env.DB.prepare('SELECT 1 as test').first();
    const dbHealthy = dbCheck?.test === 1;
    
    // Check recent data freshness
    const dataFreshnessQuery = `
      SELECT 
        MAX(aggregation_date) as latest_aggregation,
        COUNT(*) as services_with_recent_data
      FROM service_risk_aggregations
      WHERE aggregation_date >= date('now', '-1 day')
    `;
    
    const dataFreshness = await env.DB.prepare(dataFreshnessQuery).first();
    
    // Check executive decision backlog
    const backlogQuery = `
      SELECT COUNT(*) as pending_decisions
      FROM executive_decision_support
      WHERE approval_status = 'pending'
    `;
    
    const backlog = await env.DB.prepare(backlogQuery).first();
    
    const healthStatus = {
      status: dbHealthy ? 'healthy' : 'error',
      database_connected: dbHealthy,
      data_freshness: {
        latest_aggregation: dataFreshness?.latest_aggregation,
        services_with_recent_data: dataFreshness?.services_with_recent_data || 0,
        is_current: dataFreshness?.latest_aggregation === new Date().toISOString().split('T')[0]
      },
      executive_workflow: {
        pending_decisions: backlog?.pending_decisions || 0,
        backlog_status: (backlog?.pending_decisions || 0) > 10 ? 'high' : 'normal'
      },
      system_components: {
        risk_aggregation: 'operational',
        financial_modeling: 'operational',
        decision_support: 'operational',
        reporting: 'operational'
      },
      last_health_check: new Date().toISOString()
    };
    
    return c.json({
      success: true,
      data: healthStatus
    });

  } catch (error) {
    console.error('Executive intelligence health check API error:', error);
    return c.json({
      success: false,
      error: 'Health check failed',
      details: error.message,
      data: {
        status: 'critical',
        last_health_check: new Date().toISOString()
      }
    }, 500);
  }
});

export { phase5ExecutiveAPI };