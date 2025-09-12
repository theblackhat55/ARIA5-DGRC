/**
 * ARIA5 Risk Validation API Routes
 * Human-in-the-loop validation workflow management
 */

import { Hono } from 'hono';
import { html } from 'hono/html';

type Bindings = {
  DB: D1Database;
};

const validationApi = new Hono<{ Bindings: Bindings }>();

// ================================================================
// VALIDATION QUEUE API
// ================================================================

/**
 * GET /api/validation/queue
 * Get validation queue for current user
 */
validationApi.get('/queue', async (c) => {
  try {
    const { env } = c;
    
    // Parse query parameters
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const status = c.req.query('status') || 'pending';
    const priority = c.req.query('priority');
    
    let query = `
      SELECT 
        rv.id,
        rv.risk_id,
        rv.validation_type,
        rv.validation_status as status,
        'Medium' as priority,
        rv.validator_id as assigned_to,
        rv.confidence_score,
        rv.validation_notes,
        rv.created_at,
        rv.validation_timestamp as updated_at,
        NULL as due_date,
        r.title as risk_title,
        r.description as risk_description,
        r.severity as risk_severity,
        r.likelihood as risk_likelihood,
        bs.name as service_name
      FROM risk_validations rv
      LEFT JOIN risks r ON rv.risk_id = r.id
      LEFT JOIN business_services bs ON r.service_id = bs.id
      WHERE rv.validation_status = ?
    `;
    
    const params = [status];
    
    // Priority filtering not available in current schema
    // if (priority) {
    //   query += ` AND rv.priority = ?`;
    //   params.push(priority);
    // }
    
    query += ` ORDER BY rv.created_at ASC
      LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const validations = await env.DB.prepare(query).bind(...params).all();
    
    // Get total count for pagination
    const countResult = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM risk_validations WHERE validation_status = ?
    `).bind(status).first();

    // Get queue statistics
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(CASE WHEN validation_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN validation_status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN validation_status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN validation_status = 'rejected' THEN 1 END) as rejected,
        0 as critical_pending,
        AVG(CASE WHEN validation_status = 'completed' THEN confidence_score END) as avg_confidence
      FROM risk_validations
    `).first();

    return c.json({
      success: true,
      data: validations.results || [],
      pagination: {
        limit,
        offset,
        total: countResult?.total || 0,
        has_more: (offset + limit) < (countResult?.total || 0)
      },
      queue_stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching validation queue:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch validation queue',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /api/validation/assign
 * Assign risk to validator
 */
validationApi.post('/assign', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    
    const { validation_id, assigned_to, notes } = body;
    
    if (!validation_id || !assigned_to) {
      return c.json({
        success: false,
        error: 'validation_id and assigned_to are required'
      }, 400);
    }

    // Check if validation exists and is in pending status
    const validation = await env.DB.prepare(`
      SELECT id, validation_status as status, risk_id FROM risk_validations WHERE id = ?
    `).bind(validation_id).first();

    if (!validation) {
      return c.json({
        success: false,
        error: 'Validation not found'
      }, 404);
    }

    if (validation.status !== 'pending') {
      return c.json({
        success: false,
        error: 'Validation is not in pending status'
      }, 400);
    }

    // Assign validation
    const result = await env.DB.prepare(`
      UPDATE risk_validations 
      SET validator_id = ?, 
          validation_status = 'in_progress',
          validation_notes = ?,
          validation_timestamp = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(assigned_to, notes || null, validation_id).run();

    if (result.success) {
      return c.json({
        success: true,
        data: {
          validation_id,
          assigned_to,
          status: 'in_progress',
          assigned_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Failed to assign validation');
    }
  } catch (error) {
    console.error('Error assigning validation:', error);
    return c.json({
      success: false,
      error: 'Failed to assign validation',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /api/validation/complete
 * Complete risk validation
 */
validationApi.post('/complete', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    
    const { 
      validation_id, 
      decision, // 'approved', 'rejected', 'needs_review'
      confidence_score,
      validation_notes,
      recommended_actions,
      risk_adjustments
    } = body;
    
    if (!validation_id || !decision) {
      return c.json({
        success: false,
        error: 'validation_id and decision are required'
      }, 400);
    }

    if (!['approved', 'rejected', 'needs_review'].includes(decision)) {
      return c.json({
        success: false,
        error: 'decision must be approved, rejected, or needs_review'
      }, 400);
    }

    // Check if validation exists and is assigned
    const validation = await env.DB.prepare(`
      SELECT id, validation_status as status, risk_id, validator_id as assigned_to FROM risk_validations WHERE id = ?
    `).bind(validation_id).first();

    if (!validation) {
      return c.json({
        success: false,
        error: 'Validation not found'
      }, 404);
    }

    if (validation.status !== 'in_progress') {
      return c.json({
        success: false,
        error: 'Validation is not in progress'
      }, 400);
    }

    // Update validation with completion details
    const validationResult = await env.DB.prepare(`
      UPDATE risk_validations 
      SET validation_status = 'completed',
          confidence_score = ?,
          validation_notes = ?,
          validation_timestamp = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      confidence_score || null, 
      validation_notes || null,
      validation_id
    ).run();

    // If approved and risk adjustments provided, update the risk
    if (decision === 'approved' && risk_adjustments && validationResult.success) {
      const { severity, likelihood, impact_score, mitigation_status } = risk_adjustments;
      
      if (severity || likelihood || impact_score || mitigation_status) {
        await env.DB.prepare(`
          UPDATE risks 
          SET severity = COALESCE(?, severity),
              likelihood = COALESCE(?, likelihood),
              impact_score = COALESCE(?, impact_score),
              mitigation_status = COALESCE(?, mitigation_status),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(severity, likelihood, impact_score, mitigation_status, validation.risk_id).run();
      }
    }

    if (validationResult.success) {
      return c.json({
        success: true,
        data: {
          validation_id,
          decision,
          confidence_score,
          completed_at: new Date().toISOString(),
          risk_updated: decision === 'approved' && !!risk_adjustments
        },
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Failed to complete validation');
    }
  } catch (error) {
    console.error('Error completing validation:', error);
    return c.json({
      success: false,
      error: 'Failed to complete validation',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /api/validation/metrics
 * Validation workflow efficiency metrics
 */
validationApi.get('/metrics', async (c) => {
  try {
    const { env } = c;
    
    // Parse time range (default to last 30 days)
    const days = parseInt(c.req.query('days') || '30');
    const timeRange = c.req.query('range') || 'days'; // days, weeks, months
    
    // Overall validation metrics
    const overallMetrics = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_validations,
        COUNT(CASE WHEN validation_status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN validation_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN validation_status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN validation_status = 'rejected' THEN 1 END) as rejected,
        AVG(CASE WHEN validation_status = 'completed' THEN confidence_score END) as avg_confidence,
        COUNT(CASE WHEN validation_status = 'completed' THEN 1 END) as approved,
        0 as needs_review
      FROM risk_validations
      WHERE created_at >= datetime('now', '-${days} days')
    `).first();

    // Validation turnaround times
    const turnaroundMetrics = await env.DB.prepare(`
      SELECT 
        AVG(
          CASE WHEN validation_timestamp IS NOT NULL 
          THEN (julianday(validation_timestamp) - julianday(created_at)) * 24 
          END
        ) as avg_hours_to_complete,
        MIN(
          CASE WHEN validation_timestamp IS NOT NULL 
          THEN (julianday(validation_timestamp) - julianday(created_at)) * 24 
          END
        ) as min_hours_to_complete,
        MAX(
          CASE WHEN validation_timestamp IS NOT NULL 
          THEN (julianday(validation_timestamp) - julianday(created_at)) * 24 
          END
        ) as max_hours_to_complete
      FROM risk_validations
      WHERE created_at >= datetime('now', '-${days} days')
        AND validation_status = 'completed'
    `).first();

    // Validation type breakdown (since priority not available)
    const priorityBreakdown = await env.DB.prepare(`
      SELECT 
        validation_type as priority,
        COUNT(*) as count,
        COUNT(CASE WHEN validation_status = 'completed' THEN 1 END) as completed,
        AVG(CASE WHEN validation_status = 'completed' THEN confidence_score END) as avg_confidence,
        AVG(
          CASE WHEN validation_timestamp IS NOT NULL 
          THEN (julianday(validation_timestamp) - julianday(created_at)) * 24 
          END
        ) as avg_completion_hours
      FROM risk_validations
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY validation_type
      ORDER BY count DESC
    `).all();

    // Validator performance
    const validatorPerformance = await env.DB.prepare(`
      SELECT 
        validator_id as validator,
        COUNT(*) as assigned,
        COUNT(CASE WHEN validation_status = 'completed' THEN 1 END) as completed,
        AVG(CASE WHEN validation_status = 'completed' THEN confidence_score END) as avg_confidence,
        COUNT(CASE WHEN validation_status = 'completed' THEN 1 END) as approved,
        COUNT(CASE WHEN validation_status = 'rejected' THEN 1 END) as rejected
      FROM risk_validations
      WHERE created_at >= datetime('now', '-${days} days')
        AND validator_id IS NOT NULL
      GROUP BY validator_id
      ORDER BY completed DESC
    `).all();

    // Daily validation activity
    const dailyActivity = await env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as created,
        COUNT(CASE WHEN validation_status = 'completed' THEN 1 END) as completed
      FROM risk_validations
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all();

    // Calculate completion rate and efficiency
    const completionRate = overallMetrics?.completed && overallMetrics?.total_validations 
      ? ((overallMetrics.completed / overallMetrics.total_validations) * 100).toFixed(2)
      : 0;

    const approvalRate = overallMetrics?.approved && overallMetrics?.completed
      ? ((overallMetrics.approved / overallMetrics.completed) * 100).toFixed(2) 
      : 0;

    return c.json({
      success: true,
      data: {
        summary: {
          ...overallMetrics,
          completion_rate: parseFloat(completionRate),
          approval_rate: parseFloat(approvalRate)
        },
        turnaround_times: turnaroundMetrics,
        priority_breakdown: priorityBreakdown.results || [],
        validator_performance: validatorPerformance.results || [],
        daily_activity: dailyActivity.results || []
      },
      period: {
        days,
        range: timeRange,
        start_date: new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString(),
        end_date: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching validation metrics:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch validation metrics',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /api/validation/:id
 * Get specific validation details
 */
validationApi.get('/:id', async (c) => {
  try {
    const { env } = c;
    const validationId = c.req.param('id');

    const validation = await env.DB.prepare(`
      SELECT 
        rv.*,
        r.title as risk_title,
        r.description as risk_description,
        r.severity as risk_severity,
        r.likelihood as risk_likelihood,
        r.impact_score as risk_impact_score,
        bs.name as service_name,
        bs.business_function
      FROM risk_validations rv
      LEFT JOIN risks r ON rv.risk_id = r.id
      LEFT JOIN business_services bs ON r.service_id = bs.id
      WHERE rv.id = ?
    `).bind(validationId).first();

    if (!validation) {
      return c.json({
        success: false,
        error: 'Validation not found'
      }, 404);
    }

    // Get validation history/audit trail
    const auditTrail = await env.DB.prepare(`
      SELECT 
        action,
        details,
        user_id,
        created_at
      FROM audit_logs
      WHERE entity_type = 'risk_validation' 
        AND entity_id = ?
      ORDER BY created_at DESC
    `).bind(validationId).all();

    return c.json({
      success: true,
      data: {
        ...validation,
        audit_trail: auditTrail.results || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching validation details:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch validation details',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /api/validation/batch-assign
 * Batch assign multiple validations to users
 */
validationApi.post('/batch-assign', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    
    const { validation_ids = [], assigned_to, notes } = body;
    
    if (!Array.isArray(validation_ids) || validation_ids.length === 0 || !assigned_to) {
      return c.json({
        success: false,
        error: 'validation_ids array and assigned_to are required'
      }, 400);
    }

    const results = [];
    
    for (const validation_id of validation_ids) {
      try {
        const result = await env.DB.prepare(`
          UPDATE risk_validations 
          SET validator_id = ?, 
              validation_status = 'in_progress',
              validation_notes = ?,
              validation_timestamp = CURRENT_TIMESTAMP
          WHERE id = ? AND validation_status = 'pending'
        `).bind(assigned_to, notes || null, validation_id).run();
        
        results.push({
          validation_id,
          success: result.success && result.changes > 0,
          changes: result.changes
        });
      } catch (error) {
        results.push({
          validation_id,
          success: false,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return c.json({
      success: true,
      summary: {
        total: results.length,
        successful,
        failed,
        assigned_to
      },
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error batch assigning validations:', error);
    return c.json({
      success: false,
      error: 'Failed to batch assign validations',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export { validationApi };