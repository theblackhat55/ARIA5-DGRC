/**
 * ARIA5 Compliance and Services API Routes
 * Comprehensive compliance management and business services endpoints
 */

import { Hono } from 'hono';
import { html } from 'hono/html';

type Bindings = {
  DB: D1Database;
};

const complianceServicesApi = new Hono<{ Bindings: Bindings }>();

// ================================================================
// COMPLIANCE API
// ================================================================

/**
 * GET /api/compliance
 * Get compliance overview and status
 */
complianceServicesApi.get('/', async (c) => {
  try {
    const { env } = c;
    
    // Overall compliance metrics
    const complianceOverview = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_frameworks,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_frameworks,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as in_progress_frameworks,
        0 as high_compliance,
        0 as low_compliance,
        0 as avg_compliance_score
      FROM compliance_frameworks
    `).first();

    // Control effectiveness metrics (no controls table exists yet)
    const controlMetrics = {
      total_controls: 0,
      implemented: 0,
      planned: 0,
      not_implemented: 0,
      effective_controls: 0
    };

    // Recent compliance activities
    const recentActivities = await env.DB.prepare(`
      SELECT 
        cf.name as framework_name,
        0 as compliance_score,
        cf.created_at as last_assessment_date,
        cf.updated_at as next_assessment_date,
        CASE WHEN cf.is_active = 1 THEN 'active' ELSE 'inactive' END as status,
        0 as control_count
      FROM compliance_frameworks cf
      ORDER BY cf.created_at DESC
      LIMIT 10
    `).all();

    return c.json({
      success: true,
      data: {
        overview: complianceOverview,
        controls: controlMetrics,
        recent_activities: recentActivities.results || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching compliance overview:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch compliance overview',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /api/compliance/frameworks
 * List all compliance frameworks
 */
complianceServicesApi.get('/frameworks', async (c) => {
  try {
    const { env } = c;
    
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');
    const status = c.req.query('status');
    
    let query = `
      SELECT 
        cf.*,
        0 as control_count,
        0 as implemented_controls
      FROM compliance_frameworks cf
    `;
    
    const params = [];
    
    if (status) {
      query += ` WHERE cf.is_active = ?`;
      params.push(status === 'active' ? 1 : 0);
    }
    
    query += ` 
      ORDER BY cf.name ASC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const frameworks = await env.DB.prepare(query).bind(...params).all();
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM compliance_frameworks`;
    if (status) {
      countQuery += ` WHERE is_active = ?`;
    }
    
    const countResult = await env.DB.prepare(countQuery).bind(...(status ? [status === 'active' ? 1 : 0] : [])).first();

    return c.json({
      success: true,
      data: frameworks.results || [],
      pagination: {
        limit,
        offset,
        total: countResult?.total || 0,
        has_more: (offset + limit) < (countResult?.total || 0)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching compliance frameworks:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch compliance frameworks',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /api/compliance/frameworks/:id/controls
 * Get controls for a specific framework
 */
complianceServicesApi.get('/frameworks/:id/controls', async (c) => {
  try {
    const { env } = c;
    const frameworkId = c.req.param('id');
    
    const controls = await env.DB.prepare(`
      SELECT 
        c.*,
        cf.name as framework_name
      FROM controls c
      LEFT JOIN compliance_frameworks cf ON c.framework_id = cf.id
      WHERE c.framework_id = ?
      ORDER BY c.control_id ASC
    `).bind(frameworkId).all();

    // Get framework details
    const framework = await env.DB.prepare(`
      SELECT name, description, compliance_score, status FROM compliance_frameworks WHERE id = ?
    `).bind(frameworkId).first();

    if (!framework) {
      return c.json({
        success: false,
        error: 'Compliance framework not found'
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        framework,
        controls: controls.results || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching framework controls:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch framework controls',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /api/compliance/assessment
 * Create or update compliance assessment
 */
complianceServicesApi.post('/assessment', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    
    const { 
      framework_id, 
      assessment_type = 'internal',
      assessment_date = new Date().toISOString(),
      assessor,
      findings = [],
      overall_score,
      notes 
    } = body;
    
    if (!framework_id) {
      return c.json({
        success: false,
        error: 'framework_id is required'
      }, 400);
    }

    // Update framework assessment details
    const result = await env.DB.prepare(`
      UPDATE compliance_frameworks 
      SET last_assessment_date = ?,
          compliance_score = ?,
          assessor = ?,
          assessment_notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(assessment_date, overall_score, assessor, notes, framework_id).run();

    // Insert assessment findings if provided
    if (findings.length > 0) {
      for (const finding of findings) {
        await env.DB.prepare(`
          INSERT INTO assessment_findings (framework_id, control_id, finding_type, severity, description, created_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          framework_id,
          finding.control_id,
          finding.type || 'gap',
          finding.severity || 'Medium',
          finding.description
        ).run();
      }
    }

    if (result.success) {
      return c.json({
        success: true,
        data: {
          framework_id,
          assessment_date,
          overall_score,
          findings_count: findings.length,
          assessor
        },
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Failed to update framework assessment');
    }
  } catch (error) {
    console.error('Error creating compliance assessment:', error);
    return c.json({
      success: false,
      error: 'Failed to create compliance assessment',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /api/compliance/gaps
 * Get compliance gaps and recommendations
 */
complianceServicesApi.get('/gaps', async (c) => {
  try {
    const { env } = c;
    
    const severity = c.req.query('severity');
    
    // Get compliance gaps from controls not implemented
    let query = `
      SELECT 
        c.id,
        c.control_id,
        c.title,
        c.description,
        c.status,
        c.risk_rating,
        cf.name as framework_name,
        cf.compliance_score as framework_score
      FROM controls c
      LEFT JOIN compliance_frameworks cf ON c.framework_id = cf.id
      WHERE c.status != 'Implemented'
    `;
    
    const params = [];
    
    if (severity) {
      query += ` AND c.risk_rating = ?`;
      params.push(severity);
    }
    
    query += ` ORDER BY 
      CASE c.risk_rating 
        WHEN 'Critical' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Medium' THEN 3 
        WHEN 'Low' THEN 4 
        ELSE 5 
      END,
      cf.priority DESC,
      c.control_id ASC
    `;

    const gaps = await env.DB.prepare(query).bind(...params).all();

    // Get gap statistics
    const gapStats = await env.DB.prepare(`
      SELECT 
        c.status,
        c.risk_rating,
        COUNT(*) as count
      FROM controls c
      WHERE c.status != 'Implemented'
      GROUP BY c.status, c.risk_rating
      ORDER BY 
        CASE c.risk_rating 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
          ELSE 5 
        END
    `).all();

    return c.json({
      success: true,
      data: {
        gaps: gaps.results || [],
        statistics: gapStats.results || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching compliance gaps:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch compliance gaps',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ================================================================
// SERVICES API
// ================================================================

/**
 * GET /api/services
 * List all business services
 */
complianceServicesApi.get('/services', async (c) => {
  try {
    const { env } = c;
    
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');
    const criticality = c.req.query('criticality');
    const status = c.req.query('status');
    
    let query = `
      SELECT 
        bs.*,
        COUNT(DISTINCT r.id) as risk_count,
        COUNT(DISTINCT sa.id) as asset_count,
        AVG(r.impact_score) as avg_risk_impact
      FROM business_services bs
      LEFT JOIN risks r ON r.service_id = bs.id
      LEFT JOIN service_assets sa ON sa.service_id = bs.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (criticality) {
      query += ` AND bs.criticality_level = ?`;
      params.push(criticality);
    }
    
    if (status) {
      query += ` AND bs.operational_status = ?`;
      params.push(status);
    }
    
    query += `
      GROUP BY bs.id
      ORDER BY 
        CASE bs.criticality_level 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
          ELSE 5 
        END,
        bs.name ASC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const services = await env.DB.prepare(query).bind(...params).all();
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM business_services WHERE 1=1`;
    const countParams = [];
    
    if (criticality) {
      countQuery += ` AND criticality_level = ?`;
      countParams.push(criticality);
    }
    
    if (status) {
      countQuery += ` AND operational_status = ?`;
      countParams.push(status);
    }
    
    const countResult = await env.DB.prepare(countQuery).bind(...countParams).first();

    return c.json({
      success: true,
      data: services.results || [],
      pagination: {
        limit,
        offset,
        total: countResult?.total || 0,
        has_more: (offset + limit) < (countResult?.total || 0)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch services',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /api/services/:id
 * Get detailed service information
 */
complianceServicesApi.get('/services/:id', async (c) => {
  try {
    const { env } = c;
    const serviceId = c.req.param('id');
    
    // Get service details
    const service = await env.DB.prepare(`
      SELECT * FROM business_services WHERE id = ?
    `).bind(serviceId).first();

    if (!service) {
      return c.json({
        success: false,
        error: 'Service not found'
      }, 404);
    }

    // Get associated risks
    const risks = await env.DB.prepare(`
      SELECT id, title, severity, likelihood, impact_score, status, created_at
      FROM risks 
      WHERE service_id = ?
      ORDER BY impact_score DESC, created_at DESC
    `).bind(serviceId).all();

    // Get associated assets
    const assets = await env.DB.prepare(`
      SELECT sa.*, a.name as asset_name, a.type as asset_type
      FROM service_assets sa
      LEFT JOIN assets a ON sa.asset_id = a.id
      WHERE sa.service_id = ?
    `).bind(serviceId).all();

    // Get service dependencies
    const dependencies = await env.DB.prepare(`
      SELECT 
        sd.*,
        bs.name as dependent_service_name
      FROM service_dependencies sd
      LEFT JOIN business_services bs ON sd.dependent_service_id = bs.id
      WHERE sd.service_id = ?
    `).bind(serviceId).all();

    return c.json({
      success: true,
      data: {
        service,
        risks: risks.results || [],
        assets: assets.results || [],
        dependencies: dependencies.results || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching service details:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch service details',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /api/services
 * Create new business service
 */
complianceServicesApi.post('/services', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    
    const {
      name,
      description,
      business_owner,
      technical_owner,
      service_type = 'Application',
      confidentiality_impact = 1,
      integrity_impact = 1,
      availability_impact = 1,
      criticality_level = 'Medium',
      business_function,
      revenue_impact = 0,
      regulatory_requirements
    } = body;
    
    if (!name) {
      return c.json({
        success: false,
        error: 'Service name is required'
      }, 400);
    }

    const result = await env.DB.prepare(`
      INSERT INTO business_services (
        name, description, business_owner, technical_owner, service_type,
        confidentiality_impact, integrity_impact, availability_impact,
        criticality_level, business_function, revenue_impact, regulatory_requirements,
        operational_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      name, description, business_owner, technical_owner, service_type,
      confidentiality_impact, integrity_impact, availability_impact,
      criticality_level, business_function, revenue_impact, regulatory_requirements
    ).run();

    if (result.success) {
      return c.json({
        success: true,
        data: {
          id: result.meta.last_row_id,
          name,
          description,
          criticality_level,
          service_type,
          created_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Failed to create service');
    }
  } catch (error) {
    console.error('Error creating service:', error);
    return c.json({
      success: false,
      error: 'Failed to create service',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * PUT /api/services/:id
 * Update business service
 */
complianceServicesApi.put('/services/:id', async (c) => {
  try {
    const { env } = c;
    const serviceId = c.req.param('id');
    const body = await c.req.json();
    
    const {
      name,
      description,
      business_owner,
      technical_owner,
      service_type,
      confidentiality_impact,
      integrity_impact,
      availability_impact,
      criticality_level,
      business_function,
      revenue_impact,
      regulatory_requirements,
      operational_status
    } = body;

    const result = await env.DB.prepare(`
      UPDATE business_services 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          business_owner = COALESCE(?, business_owner),
          technical_owner = COALESCE(?, technical_owner),
          service_type = COALESCE(?, service_type),
          confidentiality_impact = COALESCE(?, confidentiality_impact),
          integrity_impact = COALESCE(?, integrity_impact),
          availability_impact = COALESCE(?, availability_impact),
          criticality_level = COALESCE(?, criticality_level),
          business_function = COALESCE(?, business_function),
          revenue_impact = COALESCE(?, revenue_impact),
          regulatory_requirements = COALESCE(?, regulatory_requirements),
          operational_status = COALESCE(?, operational_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name, description, business_owner, technical_owner, service_type,
      confidentiality_impact, integrity_impact, availability_impact,
      criticality_level, business_function, revenue_impact,
      regulatory_requirements, operational_status, serviceId
    ).run();

    if (result.success && result.changes > 0) {
      return c.json({
        success: true,
        data: {
          id: serviceId,
          updated_fields: Object.keys(body),
          updated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return c.json({
        success: false,
        error: 'Service not found or no changes made'
      }, 404);
    }
  } catch (error) {
    console.error('Error updating service:', error);
    return c.json({
      success: false,
      error: 'Failed to update service',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /api/services/stats
 * Get service statistics and metrics
 */
complianceServicesApi.get('/services/stats', async (c) => {
  try {
    const { env } = c;
    
    // Overall service statistics
    const serviceStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN criticality_level = 'Critical' THEN 1 END) as critical_services,
        COUNT(CASE WHEN criticality_level = 'High' THEN 1 END) as high_criticality,
        COUNT(CASE WHEN operational_status = 'Active' THEN 1 END) as active_services,
        COUNT(CASE WHEN operational_status = 'Inactive' THEN 1 END) as inactive_services,
        AVG(revenue_impact) as avg_revenue_impact,
        SUM(revenue_impact) as total_revenue_impact
      FROM business_services
    `).first();

    // Service type distribution
    const serviceTypes = await env.DB.prepare(`
      SELECT 
        service_type,
        COUNT(*) as count,
        AVG(current_risk_score) as avg_risk_score
      FROM business_services
      GROUP BY service_type
      ORDER BY count DESC
    `).all();

    // Criticality distribution
    const criticalityDist = await env.DB.prepare(`
      SELECT 
        criticality_level,
        COUNT(*) as count,
        AVG(current_risk_score) as avg_risk_score,
        SUM(revenue_impact) as total_revenue_impact
      FROM business_services
      GROUP BY criticality_level
      ORDER BY 
        CASE criticality_level 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
          ELSE 5 
        END
    `).all();

    return c.json({
      success: true,
      data: {
        overview: serviceStats,
        service_types: serviceTypes.results || [],
        criticality_distribution: criticalityDist.results || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching service statistics:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch service statistics',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export { complianceServicesApi };