/**
 * Services API Routes
 * Provides service management and data retrieval endpoints
 */

import { Hono } from 'hono';

const servicesApi = new Hono();

/**
 * GET /api/services
 * Retrieve services with filtering and pagination
 */
servicesApi.get('/', async (c) => {
  try {
    const { DB } = c.env as { DB: D1Database };
    
    // Parse query parameters
    const status = c.req.query('status');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const searchTerm = c.req.query('search');
    const category = c.req.query('category');
    const department = c.req.query('department');
    
    // Build query conditions
    let conditions = ['1=1'];
    let params: any[] = [];
    
    if (status) {
      conditions.push('s.status = ?');
      params.push(status.toLowerCase());
    }
    
    if (searchTerm) {
      conditions.push('(s.name LIKE ? OR s.description LIKE ? OR s.service_id LIKE ?)');
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (category) {
      conditions.push('s.service_category = ?');
      params.push(category);
    }
    
    if (department) {
      conditions.push('s.business_department = ?');
      params.push(department);
    }
    
    const whereClause = conditions.join(' AND ');
    
    // Get total count (simplified)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM services s
      WHERE ${whereClause}
    `;
    
    const countResult = await DB.prepare(countQuery).bind(...params).first();
    const totalServices = countResult?.total || 0;
    
    // Get services data (using correct column names)
    const servicesQuery = `
      SELECT 
        s.id,
        s.name,
        s.description,
        s.criticality_level,
        s.confidentiality_score,
        s.integrity_score,
        s.availability_score,
        s.cia_score,
        s.aggregate_risk_score,
        s.risk_trend,
        s.last_risk_update,
        s.owner_id,
        s.organization_id,
        s.status,
        s.created_at,
        s.updated_at
      FROM services s
      WHERE ${whereClause}
      ORDER BY s.cia_score DESC, s.name ASC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    const result = await DB.prepare(servicesQuery).bind(...params).all();
    
    const services = (result.results || []).map((service: any) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      criticality_level: service.criticality_level,
      confidentiality_score: service.confidentiality_score || 0,
      integrity_score: service.integrity_score || 0,
      availability_score: service.availability_score || 0,
      cia_score: service.cia_score || 0,
      aggregate_risk_score: service.aggregate_risk_score || 0,
      risk_trend: service.risk_trend,
      last_risk_update: service.last_risk_update,
      owner_id: service.owner_id,
      organization_id: service.organization_id,
      status: service.status,
      created_at: service.created_at,
      updated_at: service.updated_at
    }));
    
    return c.json({
      success: true,
      data: {
        services,
        pagination: {
          total: totalServices,
          limit,
          offset,
          has_more: offset + limit < totalServices
        },
        filters_applied: {
          status,
          search: searchTerm,
          category,
          department
        }
      }
    });
    
  } catch (error) {
    console.error('Services API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve services',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /api/services/:id
 * Retrieve individual service details
 */
servicesApi.get('/:id', async (c) => {
  try {
    const { DB } = c.env as { DB: D1Database };
    const serviceId = c.req.param('id');
    
    const service = await DB.prepare(`
      SELECT 
        s.*,
        COUNT(r.id) as active_risks,
        AVG(CASE WHEN r.status = 'Active' THEN r.likelihood_score END) as avg_likelihood,
        AVG(CASE WHEN r.status = 'Active' THEN r.impact_score END) as avg_impact
      FROM services s
      LEFT JOIN risk_assessment r ON r.asset_id = s.service_id
      WHERE s.id = ?
      GROUP BY s.id
    `).bind(serviceId).first();
    
    if (!service) {
      return c.json({
        success: false,
        error: 'Service not found'
      }, 404);
    }
    
    const serviceDetails = {
      id: service.id,
      service_id: service.service_id,
      name: service.name,
      description: service.description,
      service_status: service.service_status,
      criticality_level: service.criticality,
      confidentiality_score: service.confidentiality_numeric || 0,
      integrity_score: service.integrity_numeric || 0,
      availability_score: service.availability_numeric || 0,
      cia_score: service.criticality_score || 0,
      aggregate_risk_score: service.risk_score || 0,
      business_department: service.business_department,
      service_category: service.service_category,
      active_risks: service.active_risks || 0,
      avg_likelihood: service.avg_likelihood || 0,
      avg_impact: service.avg_impact || 0,
      created_at: service.created_at,
      updated_at: service.updated_at
    };
    
    return c.json({
      success: true,
      data: serviceDetails
    });
    
  } catch (error) {
    console.error('Service details API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve service details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /api/services/categories
 * Get available service categories
 */
servicesApi.get('/categories', async (c) => {
  try {
    const { DB } = c.env as { DB: D1Database };
    
    const result = await DB.prepare(`
      SELECT DISTINCT service_category as category, COUNT(*) as count
      FROM services
      WHERE service_category IS NOT NULL AND service_category != ''
      GROUP BY service_category
      ORDER BY count DESC, service_category ASC
    `).all();
    
    const categories = (result.results || []).map((row: any) => ({
      name: row.category,
      count: row.count
    }));
    
    return c.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Service categories API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve service categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /api/services/departments
 * Get available business departments
 */
servicesApi.get('/departments', async (c) => {
  try {
    const { DB } = c.env as { DB: D1Database };
    
    const result = await DB.prepare(`
      SELECT DISTINCT business_department as department, COUNT(*) as count
      FROM services
      WHERE business_department IS NOT NULL AND business_department != ''
      GROUP BY business_department
      ORDER BY count DESC, business_department ASC
    `).all();
    
    const departments = (result.results || []).map((row: any) => ({
      name: row.department,
      count: row.count
    }));
    
    return c.json({
      success: true,
      data: departments
    });
    
  } catch (error) {
    console.error('Service departments API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve service departments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /api/services/statistics
 * Get service statistics summary
 */
servicesApi.get('/statistics', async (c) => {
  try {
    const { DB } = c.env as { DB: D1Database };
    
    const stats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN service_status = 'Active' THEN 1 END) as active_services,
        COUNT(CASE WHEN service_status = 'Inactive' THEN 1 END) as inactive_services,
        AVG(criticality_score) as avg_cia_score,
        AVG(risk_score) as avg_risk_score,
        MAX(criticality_score) as max_cia_score,
        COUNT(CASE WHEN criticality_score >= 8 THEN 1 END) as high_criticality_services
      FROM services
    `).first();
    
    const statistics = {
      total_services: stats?.total_services || 0,
      active_services: stats?.active_services || 0,
      inactive_services: stats?.inactive_services || 0,
      avg_cia_score: parseFloat((stats?.avg_cia_score || 0).toFixed(2)),
      avg_risk_score: parseFloat((stats?.avg_risk_score || 0).toFixed(2)),
      max_cia_score: stats?.max_cia_score || 0,
      high_criticality_services: stats?.high_criticality_services || 0,
      timestamp: new Date().toISOString()
    };
    
    return c.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    console.error('Service statistics API error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve service statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { servicesApi };