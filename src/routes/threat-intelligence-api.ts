/**
 * ARIA5 Threat Intelligence API Routes
 * Comprehensive threat intelligence management and correlation endpoints
 */

import { Hono } from 'hono';
import { html } from 'hono/html';

type Bindings = {
  DB: D1Database;
};

const threatIntelligenceApi = new Hono<{ Bindings: Bindings }>();

// ================================================================
// THREAT INTELLIGENCE SOURCES API
// ================================================================

/**
 * GET /api/threat-intelligence/sources
 * List all threat intelligence sources with status
 */
threatIntelligenceApi.get('/sources', async (c) => {
  try {
    const { env } = c;
    
    const sources = await env.DB.prepare(`
      SELECT 
        id,
        name,
        type as source_type,
        url,
        status,
        last_updated as last_sync,
        created_at,
        (SELECT COUNT(*) FROM ti_indicators WHERE source_id = ti_sources.id) as indicator_count
      FROM ti_sources
      ORDER BY name ASC
    `).all();

    return c.json({
      success: true,
      data: sources.results || [],
      total: sources.results?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching TI sources:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch threat intelligence sources',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /api/threat-intelligence/sources
 * Add new threat intelligence source
 */
threatIntelligenceApi.post('/sources', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    
    const { name, type, url, api_key_required } = body;
    
    if (!name || !type) {
      return c.json({
        success: false,
        error: 'Name and type are required'
      }, 400);
    }

    const result = await env.DB.prepare(`
      INSERT INTO ti_sources (name, type, url, api_key_required, status, created_at)
      VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
    `).bind(name, type, url || null, api_key_required || false).run();

    if (result.success) {
      return c.json({
        success: true,
        data: {
          id: result.meta.last_row_id,
          name,
          type,
          url,
          status: 'active'
        },
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Failed to insert source');
    }
  } catch (error) {
    console.error('Error creating TI source:', error);
    return c.json({
      success: false,
      error: 'Failed to create threat intelligence source',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * PUT /api/threat-intelligence/sources/:id
 * Update threat intelligence source configuration
 */
threatIntelligenceApi.put('/sources/:id', async (c) => {
  try {
    const { env } = c;
    const sourceId = c.req.param('id');
    const body = await c.req.json();
    
    const { name, type, url, api_key_required, status } = body;

    const result = await env.DB.prepare(`
      UPDATE ti_sources 
      SET name = ?, type = ?, url = ?, api_key_required = ?, status = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name, type, url, api_key_required, status || 'active', sourceId).run();

    if (result.success) {
      return c.json({
        success: true,
        data: { id: sourceId, name, type, url, status },
        timestamp: new Date().toISOString()
      });
    } else {
      return c.json({
        success: false,
        error: 'Source not found or update failed'
      }, 404);
    }
  } catch (error) {
    console.error('Error updating TI source:', error);
    return c.json({
      success: false,
      error: 'Failed to update threat intelligence source',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * DELETE /api/threat-intelligence/sources/:id
 * Remove threat intelligence source
 */
threatIntelligenceApi.delete('/sources/:id', async (c) => {
  try {
    const { env } = c;
    const sourceId = c.req.param('id');

    // Check if source exists and has indicators
    const sourceCheck = await env.DB.prepare(`
      SELECT id, name, 
        (SELECT COUNT(*) FROM ti_indicators WHERE source_id = ?) as indicator_count
      FROM ti_sources WHERE id = ?
    `).bind(sourceId, sourceId).first();

    if (!sourceCheck) {
      return c.json({
        success: false,
        error: 'Threat intelligence source not found'
      }, 404);
    }

    // If source has indicators, just mark as inactive instead of deleting
    if (sourceCheck.indicator_count > 0) {
      await env.DB.prepare(`
        UPDATE ti_sources SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(sourceId).run();
      
      return c.json({
        success: true,
        message: `Source deactivated (${sourceCheck.indicator_count} indicators preserved)`,
        timestamp: new Date().toISOString()
      });
    } else {
      // Safe to delete if no indicators
      await env.DB.prepare(`DELETE FROM ti_sources WHERE id = ?`).bind(sourceId).run();
      
      return c.json({
        success: true,
        message: 'Source deleted successfully',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error deleting TI source:', error);
    return c.json({
      success: false,
      error: 'Failed to delete threat intelligence source',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ================================================================
// THREAT INTELLIGENCE INDICATORS API
// ================================================================

/**
 * GET /api/threat-intelligence/indicators
 * List threat indicators with filtering
 */
threatIntelligenceApi.get('/indicators', async (c) => {
  try {
    const { env } = c;
    
    // Parse query parameters
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');
    const type = c.req.query('type');
    const sourceId = c.req.query('source_id');
    const severity = c.req.query('severity');
    
    let query = `
      SELECT 
        ti.id,
        ti.indicator_type,
        ti.identifier,
        ti.severity,
        ti.cvss_score as confidence,
        ti.description,
        ti.first_seen,
        ti.last_updated as last_seen,
        ti.created_at,
        ts.name as source_name,
        0 as risk_mappings
      FROM ti_indicators ti
      LEFT JOIN ti_sources ts ON ti.source_id = ts.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (type) {
      query += ` AND ti.indicator_type = ?`;
      params.push(type);
    }
    
    if (sourceId) {
      query += ` AND ti.source_id = ?`;
      params.push(sourceId);
    }
    
    if (severity) {
      query += ` AND ti.severity = ?`;
      params.push(severity);
    }
    
    query += ` ORDER BY ti.last_seen DESC, ti.confidence DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const indicators = await env.DB.prepare(query).bind(...params).all();
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM ti_indicators ti WHERE 1=1`;
    const countParams = [];
    
    if (type) {
      countQuery += ` AND indicator_type = ?`;
      countParams.push(type);
    }
    
    if (sourceId) {
      countQuery += ` AND source_id = ?`;
      countParams.push(sourceId);
    }
    
    if (severity) {
      countQuery += ` AND severity = ?`;
      countParams.push(severity);
    }
    
    const totalResult = await env.DB.prepare(countQuery).bind(...countParams).first();

    return c.json({
      success: true,
      data: indicators.results || [],
      pagination: {
        limit,
        offset,
        total: totalResult?.total || 0,
        has_more: (offset + limit) < (totalResult?.total || 0)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching TI indicators:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch threat intelligence indicators',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /api/threat-intelligence/indicators/:id
 * Get specific indicator details
 */
threatIntelligenceApi.get('/indicators/:id', async (c) => {
  try {
    const { env } = c;
    const indicatorId = c.req.param('id');

    const indicator = await env.DB.prepare(`
      SELECT 
        ti.*,
        ts.name as source_name,
        ts.source_type
      FROM ti_indicators ti
      LEFT JOIN ti_sources ts ON ti.source_id = ts.id
      WHERE ti.id = ?
    `).bind(indicatorId).first();

    if (!indicator) {
      return c.json({
        success: false,
        error: 'Threat intelligence indicator not found'
      }, 404);
    }

    // Get associated risk mappings
    const riskMappings = await env.DB.prepare(`
      SELECT 
        rtm.*,
        r.title as risk_title,
        r.severity as risk_severity,
        r.status as risk_status
      FROM risk_ti_mappings rtm
      LEFT JOIN risks r ON rtm.risk_id = r.id
      WHERE rtm.indicator_id = ?
    `).bind(indicatorId).all();

    return c.json({
      success: true,
      data: {
        ...indicator,
        risk_mappings: riskMappings.results || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching TI indicator:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch threat intelligence indicator',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /api/threat-intelligence/indicators/search
 * Advanced indicator search with multiple criteria
 */
threatIntelligenceApi.post('/indicators/search', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    
    const { 
      indicators = [], 
      types = [], 
      severities = [], 
      confidence_min = 0,
      date_range = {},
      limit = 100,
      offset = 0
    } = body;

    let query = `
      SELECT 
        ti.*,
        ts.name as source_name
      FROM ti_indicators ti
      LEFT JOIN ti_sources ts ON ti.source_id = ts.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (indicators.length > 0) {
      const placeholders = indicators.map(() => '?').join(',');
      query += ` AND ti.identifier IN (${placeholders})`;
      params.push(...indicators);
    }
    
    if (types.length > 0) {
      const placeholders = types.map(() => '?').join(',');
      query += ` AND ti.indicator_type IN (${placeholders})`;
      params.push(...types);
    }
    
    if (severities.length > 0) {
      const placeholders = severities.map(() => '?').join(',');
      query += ` AND ti.severity IN (${placeholders})`;
      params.push(...severities);
    }
    
    if (confidence_min > 0) {
      query += ` AND ti.confidence >= ?`;
      params.push(confidence_min);
    }
    
    if (date_range.start) {
      query += ` AND ti.last_seen >= ?`;
      params.push(date_range.start);
    }
    
    if (date_range.end) {
      query += ` AND ti.last_seen <= ?`;
      params.push(date_range.end);
    }
    
    query += ` ORDER BY ti.confidence DESC, ti.last_seen DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const results = await env.DB.prepare(query).bind(...params).all();

    return c.json({
      success: true,
      data: results.results || [],
      search_criteria: {
        indicators: indicators.length,
        types: types.length,
        severities: severities.length,
        confidence_min,
        date_range
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching TI indicators:', error);
    return c.json({
      success: false,
      error: 'Failed to search threat intelligence indicators',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /api/threat-intelligence/indicators/bulk-update
 * Bulk indicator updates
 */
threatIntelligenceApi.post('/indicators/bulk-update', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    
    const { updates = [] } = body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return c.json({
        success: false,
        error: 'Updates array is required and must not be empty'
      }, 400);
    }

    const results = [];
    
    for (const update of updates) {
      try {
        const { id, severity, confidence, description } = update;
        
        if (!id) continue;
        
        const result = await env.DB.prepare(`
          UPDATE ti_indicators 
          SET severity = COALESCE(?, severity),
              confidence = COALESCE(?, confidence),
              description = COALESCE(?, description),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(severity, confidence, description, id).run();
        
        results.push({
          id,
          success: result.success,
          changes: result.changes
        });
      } catch (error) {
        results.push({
          id: update.id,
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
        failed
      },
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error bulk updating TI indicators:', error);
    return c.json({
      success: false,
      error: 'Failed to bulk update threat intelligence indicators',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ================================================================
// THREAT INTELLIGENCE STATISTICS API
// ================================================================

/**
 * GET /api/threat-intelligence/stats
 * Get comprehensive threat intelligence statistics
 */
threatIntelligenceApi.get('/stats', async (c) => {
  try {
    const { env } = c;

    // Overall statistics
    const overallStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_indicators,
        COUNT(DISTINCT source_id) as active_sources,
        COUNT(DISTINCT indicator_type) as indicator_types,
        AVG(confidence) as avg_confidence,
        COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical_indicators,
        COUNT(CASE WHEN severity = 'High' THEN 1 END) as high_indicators,
        COUNT(CASE WHEN last_seen >= datetime('now', '-7 days') THEN 1 END) as recent_indicators
      FROM ti_indicators
    `).first();

    // Indicator type breakdown
    const typeBreakdown = await env.DB.prepare(`
      SELECT 
        indicator_type,
        COUNT(*) as count,
        AVG(confidence) as avg_confidence
      FROM ti_indicators
      GROUP BY indicator_type
      ORDER BY count DESC
    `).all();

    // Severity distribution
    const severityDistribution = await env.DB.prepare(`
      SELECT 
        severity,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ti_indicators), 2) as percentage
      FROM ti_indicators
      GROUP BY severity
      ORDER BY 
        CASE severity 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
          ELSE 5 
        END
    `).all();

    // Recent activity (last 7 days)
    const recentActivity = await env.DB.prepare(`
      SELECT 
        DATE(last_seen) as date,
        COUNT(*) as new_indicators,
        COUNT(DISTINCT source_id) as active_sources
      FROM ti_indicators
      WHERE last_seen >= datetime('now', '-7 days')
      GROUP BY DATE(last_seen)
      ORDER BY date DESC
    `).all();

    return c.json({
      success: true,
      data: {
        overview: overallStats,
        type_breakdown: typeBreakdown.results || [],
        severity_distribution: severityDistribution.results || [],
        recent_activity: recentActivity.results || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching TI stats:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch threat intelligence statistics',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export { threatIntelligenceApi };