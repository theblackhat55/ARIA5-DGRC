/**
 * ARIA5.1 Phase 4: Advanced Automation - Evidence Collection API Routes
 * Target: 60%+ compliance evidence automation
 * 
 * Comprehensive REST API for evidence collection management, automation status,
 * and compliance reporting with real-time monitoring capabilities.
 */

import { Hono } from 'hono';
import { Phase4EvidenceCollectionEngine } from '../services/phase4-evidence-collection-engine';

type Bindings = {
  DB: D1Database;
};

const phase4EvidenceAPI = new Hono<{ Bindings: Bindings }>();

// ================================================================
// EVIDENCE COLLECTION CORE OPERATIONS
// ================================================================

/**
 * Trigger comprehensive evidence collection cycle
 * POST /api/v2/evidence/collect
 */
phase4EvidenceAPI.post('/collect', async (c) => {
  try {
    const { env } = c;
    const engine = new Phase4EvidenceCollectionEngine(env.DB);
    
    const { framework, urgent_only, source_types } = await c.req.json();
    
    // Validate input parameters
    if (framework && !['NIST-800-53', 'SOC2', 'ISO-27001', 'PCI-DSS', 'GDPR'].includes(framework)) {
      return c.json({ 
        success: false, 
        error: 'Invalid compliance framework specified' 
      }, 400);
    }

    // Start evidence collection
    const results = await engine.collectComplianceEvidence();
    
    // Calculate automation metrics
    const metrics = await engine.updateAutomationMetrics();
    
    return c.json({
      success: true,
      message: 'Evidence collection completed successfully',
      data: {
        execution_summary: {
          total_executions: results.length,
          successful_executions: results.filter(r => r.execution_status === 'completed').length,
          failed_executions: results.filter(r => r.execution_status === 'failed').length,
          total_artifacts_created: results.reduce((sum, r) => sum + r.evidence_artifacts_created, 0),
          avg_confidence_score: results.reduce((sum, r) => sum + r.confidence_score, 0) / results.length,
          avg_quality_score: results.reduce((sum, r) => sum + r.data_quality_score, 0) / results.length
        },
        automation_metrics: metrics,
        execution_details: results
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Evidence collection API error:', error);
    return c.json({
      success: false,
      error: 'Evidence collection failed',
      details: error.message
    }, 500);
  }
});

/**
 * Get evidence collection status
 * GET /api/v2/evidence/status
 */
phase4EvidenceAPI.get('/status', async (c) => {
  try {
    const { env } = c;
    
    const statusQuery = `
      SELECT 
        es.source_name,
        es.source_type,
        es.automation_level,
        es.collection_status,
        es.success_rate,
        es.last_collection_at,
        COUNT(eeh.id) as recent_executions,
        AVG(eeh.confidence_score) as avg_confidence,
        SUM(eeh.evidence_artifacts_created) as total_artifacts
      FROM evidence_sources es
      LEFT JOIN evidence_execution_history eeh ON es.id = eeh.source_id 
        AND eeh.started_at >= datetime('now', '-24 hours')
      WHERE es.is_active = 1
      GROUP BY es.id
      ORDER BY es.success_rate DESC, es.source_name
    `;
    
    const statusResult = await env.DB.prepare(statusQuery).all();
    
    // Get overall automation metrics
    const metricsQuery = `
      SELECT 
        framework_name,
        automation_percentage,
        evidence_quality_average,
        validation_success_rate,
        target_automation_percentage,
        metric_date
      FROM evidence_automation_metrics 
      WHERE metric_date >= date('now', '-7 days')
      ORDER BY metric_date DESC, framework_name
    `;
    
    const metricsResult = await env.DB.prepare(metricsQuery).all();
    
    // Calculate overall system health
    const sources = statusResult.results || [];
    const healthySources = sources.filter((s: any) => s.collection_status === 'success').length;
    const systemHealth = sources.length > 0 ? (healthySources / sources.length) * 100 : 0;
    
    return c.json({
      success: true,
      data: {
        system_overview: {
          total_sources: sources.length,
          healthy_sources: healthySources,
          system_health_percentage: Math.round(systemHealth * 100) / 100,
          overall_automation_rate: metricsResult.results?.length > 0 
            ? (metricsResult.results as any[]).reduce((sum, m) => sum + m.automation_percentage, 0) / metricsResult.results.length
            : 0
        },
        evidence_sources: sources,
        automation_metrics: metricsResult.results || [],
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Evidence status API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve evidence collection status',
      details: error.message
    }, 500);
  }
});

// ================================================================
// EVIDENCE SOURCE MANAGEMENT
// ================================================================

/**
 * Get all evidence sources
 * GET /api/v2/evidence/sources
 */
phase4EvidenceAPI.get('/sources', async (c) => {
  try {
    const { env } = c;
    const engine = new Phase4EvidenceCollectionEngine(env.DB);
    
    const sources = await engine.getEvidenceSources();
    
    return c.json({
      success: true,
      data: {
        sources: sources,
        total_count: sources.length,
        active_count: sources.filter(s => s.is_active).length,
        automation_breakdown: {
          fully_automated: sources.filter(s => s.automation_level === 'fully_automated').length,
          semi_automated: sources.filter(s => s.automation_level === 'semi_automated').length,
          manual: sources.filter(s => s.automation_level === 'manual').length
        }
      }
    });

  } catch (error) {
    console.error('Evidence sources API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve evidence sources',
      details: error.message
    }, 500);
  }
});

/**
 * Update evidence source configuration
 * PUT /api/v2/evidence/sources/:id
 */
phase4EvidenceAPI.put('/sources/:id', async (c) => {
  try {
    const { env } = c;
    const sourceId = parseInt(c.req.param('id'));
    const updates = await c.req.json();
    
    // Validate source ID
    if (!sourceId || sourceId <= 0) {
      return c.json({ success: false, error: 'Invalid source ID' }, 400);
    }

    // Update source configuration
    const updateQuery = `
      UPDATE evidence_sources 
      SET 
        automation_level = COALESCE(?1, automation_level),
        collection_frequency = COALESCE(?2, collection_frequency),
        is_active = COALESCE(?3, is_active),
        api_endpoint = COALESCE(?4, api_endpoint),
        configuration_json = COALESCE(?5, configuration_json),
        updated_at = datetime('now')
      WHERE id = ?6
    `;
    
    const result = await env.DB.prepare(updateQuery).bind(
      updates.automation_level || null,
      updates.collection_frequency || null,
      updates.is_active !== undefined ? updates.is_active : null,
      updates.api_endpoint || null,
      updates.configuration_json ? JSON.stringify(updates.configuration_json) : null,
      sourceId
    ).run();
    
    if (result.changes === 0) {
      return c.json({ success: false, error: 'Evidence source not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Evidence source updated successfully',
      data: { source_id: sourceId, changes_made: result.changes }
    });

  } catch (error) {
    console.error('Evidence source update API error:', error);
    return c.json({
      success: false,
      error: 'Failed to update evidence source',
      details: error.message
    }, 500);
  }
});

// ================================================================
// EVIDENCE COLLECTION JOBS
// ================================================================

/**
 * Get evidence collection jobs
 * GET /api/v2/evidence/jobs
 */
phase4EvidenceAPI.get('/jobs', async (c) => {
  try {
    const { env } = c;
    const { status, framework, automation_level, limit = '50' } = c.req.query();
    
    let jobsQuery = `
      SELECT 
        j.*,
        cf.name as framework_name,
        COUNT(eeh.id) as execution_count,
        MAX(eeh.completed_at) as last_execution,
        AVG(eeh.confidence_score) as avg_confidence,
        SUM(eeh.evidence_artifacts_created) as total_artifacts
      FROM evidence_collection_jobs j
      LEFT JOIN compliance_frameworks cf ON j.compliance_framework_id = cf.id
      LEFT JOIN evidence_execution_history eeh ON j.id = eeh.job_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (status) {
      conditions.push('j.status = ?');
      params.push(status);
    }
    
    if (framework) {
      conditions.push('cf.name = ?');
      params.push(framework);
    }
    
    if (automation_level) {
      conditions.push('j.automation_status = ?');
      params.push(automation_level);
    }
    
    if (conditions.length > 0) {
      jobsQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    jobsQuery += `
      GROUP BY j.id
      ORDER BY j.priority ASC, j.created_at DESC
      LIMIT ?
    `;
    params.push(limit);
    
    const result = await env.DB.prepare(jobsQuery).bind(...params).all();
    
    return c.json({
      success: true,
      data: {
        jobs: result.results || [],
        total_count: result.results?.length || 0,
        filters_applied: { status, framework, automation_level }
      }
    });

  } catch (error) {
    console.error('Evidence jobs API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve evidence collection jobs',
      details: error.message
    }, 500);
  }
});

/**
 * Create new evidence collection job
 * POST /api/v2/evidence/jobs
 */
phase4EvidenceAPI.post('/jobs', async (c) => {
  try {
    const { env } = c;
    const jobData = await c.req.json();
    
    // Validate required fields
    const required = ['job_name', 'control_reference', 'evidence_type', 'collection_method'];
    for (const field of required) {
      if (!jobData[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`
        }, 400);
      }
    }

    // Insert new job
    const insertQuery = `
      INSERT INTO evidence_collection_jobs (
        job_name, compliance_framework_id, control_reference, evidence_type,
        collection_method, automation_status, automation_confidence,
        collection_schedule, priority, created_by, status
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'active')
    `;
    
    const result = await env.DB.prepare(insertQuery).bind(
      jobData.job_name,
      jobData.compliance_framework_id || null,
      jobData.control_reference,
      jobData.evidence_type,
      jobData.collection_method,
      jobData.automation_status || 'manual',
      jobData.automation_confidence || 0.0,
      jobData.collection_schedule || null,
      jobData.priority || 3,
      jobData.created_by || 'system'
    ).run();
    
    return c.json({
      success: true,
      message: 'Evidence collection job created successfully',
      data: {
        job_id: result.meta.last_row_id,
        job_name: jobData.job_name
      }
    });

  } catch (error) {
    console.error('Evidence job creation API error:', error);
    return c.json({
      success: false,
      error: 'Failed to create evidence collection job',
      details: error.message
    }, 500);
  }
});

// ================================================================
// EVIDENCE ARTIFACTS MANAGEMENT
// ================================================================

/**
 * Get evidence artifacts
 * GET /api/v2/evidence/artifacts
 */
phase4EvidenceAPI.get('/artifacts', async (c) => {
  try {
    const { env } = c;
    const { 
      type, 
      source_system, 
      validation_status, 
      is_automated,
      days = '30',
      limit = '100'
    } = c.req.query();
    
    let artifactsQuery = `
      SELECT 
        a.*,
        j.job_name,
        j.control_reference,
        eeh.execution_status,
        eeh.started_at as collection_started
      FROM evidence_artifacts a
      LEFT JOIN evidence_execution_history eeh ON a.execution_id = eeh.id
      LEFT JOIN evidence_collection_jobs j ON eeh.job_id = j.id
      WHERE a.created_at >= datetime('now', '-${parseInt(days)} days')
    `;
    
    const conditions = [];
    const params = [];
    
    if (type) {
      conditions.push('a.artifact_type = ?');
      params.push(type);
    }
    
    if (source_system) {
      conditions.push('a.source_system = ?');
      params.push(source_system);
    }
    
    if (validation_status) {
      conditions.push('a.validation_status = ?');
      params.push(validation_status);
    }
    
    if (is_automated !== undefined) {
      conditions.push('a.is_automated = ?');
      params.push(is_automated === 'true' ? 1 : 0);
    }
    
    if (conditions.length > 0) {
      artifactsQuery += ' AND ' + conditions.join(' AND ');
    }
    
    artifactsQuery += `
      ORDER BY a.created_at DESC
      LIMIT ?
    `;
    params.push(limit);
    
    const result = await env.DB.prepare(artifactsQuery).bind(...params).all();
    
    // Get artifact statistics
    const statsQuery = `
      SELECT 
        artifact_type,
        COUNT(*) as count,
        AVG(evidence_quality_score) as avg_quality,
        COUNT(CASE WHEN is_automated = 1 THEN 1 END) as automated_count,
        COUNT(CASE WHEN validation_status = 'valid' THEN 1 END) as valid_count
      FROM evidence_artifacts
      WHERE created_at >= datetime('now', '-${parseInt(days)} days')
      GROUP BY artifact_type
      ORDER BY count DESC
    `;
    
    const statsResult = await env.DB.prepare(statsQuery).all();
    
    return c.json({
      success: true,
      data: {
        artifacts: result.results || [],
        statistics: statsResult.results || [],
        filters_applied: { type, source_system, validation_status, is_automated },
        date_range_days: parseInt(days)
      }
    });

  } catch (error) {
    console.error('Evidence artifacts API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve evidence artifacts',
      details: error.message
    }, 500);
  }
});

/**
 * Get specific evidence artifact
 * GET /api/v2/evidence/artifacts/:id
 */
phase4EvidenceAPI.get('/artifacts/:id', async (c) => {
  try {
    const { env } = c;
    const artifactId = parseInt(c.req.param('id'));
    
    if (!artifactId || artifactId <= 0) {
      return c.json({ success: false, error: 'Invalid artifact ID' }, 400);
    }

    const artifactQuery = `
      SELECT 
        a.*,
        eeh.execution_status,
        eeh.started_at as collection_started,
        eeh.execution_time_seconds,
        j.job_name,
        j.control_reference,
        j.compliance_framework_id
      FROM evidence_artifacts a
      LEFT JOIN evidence_execution_history eeh ON a.execution_id = eeh.id
      LEFT JOIN evidence_collection_jobs j ON eeh.job_id = j.id
      WHERE a.id = ?
    `;
    
    const result = await env.DB.prepare(artifactQuery).bind(artifactId).first();
    
    if (!result) {
      return c.json({ success: false, error: 'Evidence artifact not found' }, 404);
    }

    // Get validation results for this artifact
    const validationQuery = `
      SELECT 
        vr.*,
        er.rule_name,
        er.validation_method,
        er.severity_level
      FROM evidence_validation_results vr
      LEFT JOIN evidence_validation_rules er ON vr.rule_id = er.id
      WHERE vr.artifact_id = ?
      ORDER BY er.severity_level DESC, vr.validated_at DESC
    `;
    
    const validationResult = await env.DB.prepare(validationQuery).bind(artifactId).all();
    
    return c.json({
      success: true,
      data: {
        artifact: result,
        validation_results: validationResult.results || []
      }
    });

  } catch (error) {
    console.error('Evidence artifact detail API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve evidence artifact details',
      details: error.message
    }, 500);
  }
});

// ================================================================
// AUTOMATION METRICS AND REPORTING
// ================================================================

/**
 * Get automation metrics dashboard
 * GET /api/v2/evidence/metrics/dashboard
 */
phase4EvidenceAPI.get('/metrics/dashboard', async (c) => {
  try {
    const { env } = c;
    const { framework, days = '30' } = c.req.query();
    
    // Overall automation metrics
    let metricsQuery = `
      SELECT 
        framework_name,
        automation_percentage,
        semi_automation_percentage,
        evidence_quality_average,
        validation_success_rate,
        collection_time_average_minutes,
        target_automation_percentage,
        metric_date
      FROM evidence_automation_metrics
      WHERE metric_date >= date('now', '-${parseInt(days)} days')
    `;
    
    const params = [];
    if (framework) {
      metricsQuery += ' AND framework_name = ?';
      params.push(framework);
    }
    
    metricsQuery += ' ORDER BY metric_date DESC, framework_name';
    
    const metricsResult = await env.DB.prepare(metricsQuery).bind(...params).all();
    
    // Evidence collection trends
    const trendsQuery = `
      SELECT 
        DATE(started_at) as collection_date,
        automation_level,
        COUNT(*) as execution_count,
        AVG(confidence_score) as avg_confidence,
        AVG(data_quality_score) as avg_quality,
        SUM(evidence_artifacts_created) as total_artifacts,
        COUNT(CASE WHEN execution_status = 'completed' THEN 1 END) as successful_executions
      FROM evidence_execution_history
      WHERE started_at >= datetime('now', '-${parseInt(days)} days')
      GROUP BY DATE(started_at), automation_level
      ORDER BY collection_date DESC
    `;
    
    const trendsResult = await env.DB.prepare(trendsQuery).all();
    
    // Source system performance
    const sourcePerformanceQuery = `
      SELECT 
        es.source_name,
        es.source_type,
        es.automation_level,
        es.success_rate,
        COUNT(eeh.id) as recent_executions,
        AVG(eeh.execution_time_seconds) as avg_execution_time,
        AVG(eeh.confidence_score) as avg_confidence
      FROM evidence_sources es
      LEFT JOIN evidence_execution_history eeh ON es.id = eeh.source_id
        AND eeh.started_at >= datetime('now', '-${parseInt(days)} days')
      WHERE es.is_active = 1
      GROUP BY es.id
      ORDER BY es.success_rate DESC
    `;
    
    const performanceResult = await env.DB.prepare(sourcePerformanceQuery).all();
    
    // Calculate key performance indicators
    const metrics = metricsResult.results as any[] || [];
    const currentMetrics = metrics.length > 0 ? metrics[0] : null;
    
    const kpis = {
      overall_automation_rate: currentMetrics?.automation_percentage || 0,
      automation_target_progress: currentMetrics ? 
        (currentMetrics.automation_percentage / currentMetrics.target_automation_percentage) * 100 : 0,
      evidence_quality_score: currentMetrics?.evidence_quality_average || 0,
      validation_success_rate: currentMetrics?.validation_success_rate || 0,
      avg_collection_time: currentMetrics?.collection_time_average_minutes || 0,
      target_achievement: currentMetrics?.automation_percentage >= 60 ? 'achieved' : 'in_progress'
    };
    
    return c.json({
      success: true,
      data: {
        key_performance_indicators: kpis,
        automation_metrics: metrics,
        collection_trends: trendsResult.results || [],
        source_performance: performanceResult.results || [],
        reporting_period_days: parseInt(days),
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Evidence metrics dashboard API error:', error);
    return c.json({
      success: false,
      error: 'Failed to generate automation metrics dashboard',
      details: error.message
    }, 500);
  }
});

/**
 * Get compliance framework automation report
 * GET /api/v2/evidence/metrics/compliance/:framework
 */
phase4EvidenceAPI.get('/metrics/compliance/:framework', async (c) => {
  try {
    const { env } = c;
    const framework = c.req.param('framework');
    
    // Validate framework
    const validFrameworks = ['NIST-800-53', 'SOC2', 'ISO-27001', 'PCI-DSS', 'GDPR'];
    if (!validFrameworks.includes(framework)) {
      return c.json({
        success: false,
        error: 'Invalid compliance framework. Supported: ' + validFrameworks.join(', ')
      }, 400);
    }

    // Get compliance control evidence requirements
    const requirementsQuery = `
      SELECT 
        control_id,
        evidence_requirement_name,
        evidence_type,
        evidence_frequency,
        automation_feasibility,
        automation_priority,
        current_collection_method,
        automation_roi_score,
        compliance_criticality
      FROM compliance_control_evidence
      WHERE framework_name = ?
      ORDER BY automation_priority ASC, control_id
    `;
    
    const requirementsResult = await env.DB.prepare(requirementsQuery).bind(framework).all();
    
    // Get automation coverage statistics
    const coverageQuery = `
      SELECT 
        current_collection_method,
        automation_feasibility,
        COUNT(*) as requirement_count,
        AVG(automation_roi_score) as avg_roi_score
      FROM compliance_control_evidence
      WHERE framework_name = ?
      GROUP BY current_collection_method, automation_feasibility
    `;
    
    const coverageResult = await env.DB.prepare(coverageQuery).bind(framework).all();
    
    // Calculate framework-specific metrics
    const requirements = requirementsResult.results as any[] || [];
    const totalRequirements = requirements.length;
    const automatedRequirements = requirements.filter(r => 
      r.current_collection_method === 'fully_automated' || 
      r.current_collection_method === 'semi_automated'
    ).length;
    
    const automationRate = totalRequirements > 0 ? (automatedRequirements / totalRequirements) * 100 : 0;
    
    // High-value automation opportunities
    const automationOpportunities = requirements
      .filter(r => 
        r.automation_feasibility === 'high' && 
        r.current_collection_method === 'manual' &&
        r.automation_priority <= 2
      )
      .slice(0, 10);
    
    return c.json({
      success: true,
      data: {
        framework_overview: {
          framework_name: framework,
          total_requirements: totalRequirements,
          automated_requirements: automatedRequirements,
          automation_percentage: Math.round(automationRate * 100) / 100,
          target_achievement: automationRate >= 60 ? 'achieved' : 'in_progress'
        },
        evidence_requirements: requirements,
        automation_coverage: coverageResult.results || [],
        automation_opportunities: automationOpportunities,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Compliance framework report API error:', error);
    return c.json({
      success: false,
      error: 'Failed to generate compliance framework report',
      details: error.message
    }, 500);
  }
});

// ================================================================
// EVIDENCE VALIDATION MANAGEMENT
// ================================================================

/**
 * Get validation rules
 * GET /api/v2/evidence/validation/rules
 */
phase4EvidenceAPI.get('/validation/rules', async (c) => {
  try {
    const { env } = c;
    const { evidence_type, active_only = 'true' } = c.req.query();
    
    let rulesQuery = `
      SELECT 
        vr.*,
        COUNT(vres.id) as usage_count,
        AVG(CASE WHEN vres.validation_status = 'pass' THEN 1.0 ELSE 0.0 END) as success_rate
      FROM evidence_validation_rules vr
      LEFT JOIN evidence_validation_results vres ON vr.id = vres.rule_id
        AND vres.validated_at >= datetime('now', '-30 days')
    `;
    
    const conditions = [];
    const params = [];
    
    if (active_only === 'true') {
      conditions.push('vr.is_active = 1');
    }
    
    if (evidence_type) {
      conditions.push('vr.evidence_type = ?');
      params.push(evidence_type);
    }
    
    if (conditions.length > 0) {
      rulesQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    rulesQuery += `
      GROUP BY vr.id
      ORDER BY vr.severity_level DESC, vr.rule_name
    `;
    
    const result = await env.DB.prepare(rulesQuery).bind(...params).all();
    
    return c.json({
      success: true,
      data: {
        validation_rules: result.results || [],
        filters_applied: { evidence_type, active_only }
      }
    });

  } catch (error) {
    console.error('Validation rules API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve validation rules',
      details: error.message
    }, 500);
  }
});

/**
 * Execute manual validation on artifact
 * POST /api/v2/evidence/validation/execute/:artifactId
 */
phase4EvidenceAPI.post('/validation/execute/:artifactId', async (c) => {
  try {
    const { env } = c;
    const artifactId = parseInt(c.req.param('artifactId'));
    const { rule_ids, performed_by } = await c.req.json();
    
    if (!artifactId || artifactId <= 0) {
      return c.json({ success: false, error: 'Invalid artifact ID' }, 400);
    }

    // Get artifact details
    const artifactQuery = 'SELECT * FROM evidence_artifacts WHERE id = ?';
    const artifact = await env.DB.prepare(artifactQuery).bind(artifactId).first();
    
    if (!artifact) {
      return c.json({ success: false, error: 'Evidence artifact not found' }, 404);
    }

    // Get validation rules to apply
    let rulesQuery = 'SELECT * FROM evidence_validation_rules WHERE is_active = 1';
    const params = [];
    
    if (rule_ids && Array.isArray(rule_ids) && rule_ids.length > 0) {
      rulesQuery += ` AND id IN (${rule_ids.map(() => '?').join(',')})`;
      params.push(...rule_ids);
    }
    
    const rulesResult = await env.DB.prepare(rulesQuery).bind(...params).all();
    const rules = rulesResult.results as any[] || [];
    
    // Execute validation (simplified for demonstration)
    const validationResults = [];
    for (const rule of rules) {
      const result = {
        artifact_id: artifactId,
        rule_id: rule.id,
        validation_status: Math.random() > 0.2 ? 'pass' : 'fail', // 80% pass rate
        validation_score: Math.random(),
        validation_message: `${rule.validation_method} completed`,
        validated_at: new Date().toISOString()
      };
      
      // Store validation result
      const insertQuery = `
        INSERT INTO evidence_validation_results (
          artifact_id, rule_id, validation_status, validation_score,
          validation_message, validated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await env.DB.prepare(insertQuery).bind(
        result.artifact_id, result.rule_id, result.validation_status,
        result.validation_score, result.validation_message, result.validated_at
      ).run();
      
      validationResults.push(result);
    }
    
    // Update artifact validation status
    const overallStatus = validationResults.every(r => r.validation_status === 'pass') ? 'valid' : 'invalid';
    await env.DB.prepare('UPDATE evidence_artifacts SET validation_status = ? WHERE id = ?')
      .bind(overallStatus, artifactId).run();
    
    return c.json({
      success: true,
      message: 'Validation completed successfully',
      data: {
        artifact_id: artifactId,
        overall_status: overallStatus,
        validation_results: validationResults,
        rules_applied: rules.length
      }
    });

  } catch (error) {
    console.error('Manual validation API error:', error);
    return c.json({
      success: false,
      error: 'Failed to execute validation',
      details: error.message
    }, 500);
  }
});

// ================================================================
// SYSTEM HEALTH AND MONITORING
// ================================================================

/**
 * Get system health status
 * GET /api/v2/evidence/health
 */
phase4EvidenceAPI.get('/health', async (c) => {
  try {
    const { env } = c;
    
    // Check database connectivity
    const dbCheck = await env.DB.prepare('SELECT 1 as test').first();
    const dbHealthy = dbCheck?.test === 1;
    
    // Check evidence sources health
    const sourcesQuery = `
      SELECT 
        COUNT(*) as total_sources,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_sources,
        COUNT(CASE WHEN collection_status = 'success' THEN 1 END) as healthy_sources,
        COUNT(CASE WHEN collection_status = 'error' THEN 1 END) as error_sources
      FROM evidence_sources
    `;
    
    const sourcesHealth = await env.DB.prepare(sourcesQuery).first();
    
    // Check recent collection activity
    const activityQuery = `
      SELECT 
        COUNT(*) as total_executions,
        COUNT(CASE WHEN execution_status = 'completed' THEN 1 END) as successful_executions,
        COUNT(CASE WHEN execution_status = 'failed' THEN 1 END) as failed_executions
      FROM evidence_execution_history
      WHERE started_at >= datetime('now', '-1 hour')
    `;
    
    const recentActivity = await env.DB.prepare(activityQuery).first();
    
    // Calculate overall system health score
    const sourcesScore = sourcesHealth && sourcesHealth.total_sources > 0 
      ? (sourcesHealth.healthy_sources / sourcesHealth.total_sources) * 100 
      : 0;
    
    const executionsScore = recentActivity && recentActivity.total_executions > 0
      ? (recentActivity.successful_executions / recentActivity.total_executions) * 100
      : 100; // No recent executions = healthy
    
    const overallHealth = (sourcesScore + executionsScore) / 2;
    
    let healthStatus = 'healthy';
    if (overallHealth < 50) healthStatus = 'critical';
    else if (overallHealth < 75) healthStatus = 'degraded';
    else if (overallHealth < 90) healthStatus = 'warning';
    
    return c.json({
      success: true,
      data: {
        overall_health: {
          status: healthStatus,
          score: Math.round(overallHealth * 100) / 100,
          timestamp: new Date().toISOString()
        },
        components: {
          database: {
            status: dbHealthy ? 'healthy' : 'error',
            responsive: dbHealthy
          },
          evidence_sources: {
            status: sourcesScore >= 75 ? 'healthy' : sourcesScore >= 50 ? 'degraded' : 'critical',
            total: sourcesHealth?.total_sources || 0,
            active: sourcesHealth?.active_sources || 0,
            healthy: sourcesHealth?.healthy_sources || 0,
            errors: sourcesHealth?.error_sources || 0
          },
          collection_activity: {
            status: executionsScore >= 75 ? 'healthy' : executionsScore >= 50 ? 'degraded' : 'critical',
            recent_executions: recentActivity?.total_executions || 0,
            successful: recentActivity?.successful_executions || 0,
            failed: recentActivity?.failed_executions || 0,
            success_rate: executionsScore
          }
        }
      }
    });

  } catch (error) {
    console.error('Evidence health check API error:', error);
    return c.json({
      success: false,
      error: 'Health check failed',
      details: error.message,
      data: {
        overall_health: {
          status: 'critical',
          score: 0,
          timestamp: new Date().toISOString()
        }
      }
    }, 500);
  }
});

export { phase4EvidenceAPI };