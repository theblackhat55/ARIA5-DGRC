/**
 * Enhanced Risk Engine API Routes
 * Native integration endpoints for ARIA5.1 platform
 * Provides backward compatibility while enabling advanced capabilities
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import EnhancedRiskScoringOptimizer from '../lib/enhanced-risk-scoring-optimizer';
import EnhancedDynamicRiskManager from '../services/enhanced-dynamic-risk-manager';
import AIAnalysisService from '../services/ai-analysis-service';
import TenantPolicyManager from '../lib/tenant-policy-manager';

type Bindings = {
  DB: D1Database;
  AI?: any; // Cloudflare AI binding
}

export const enhancedRiskEngineApi = new Hono<{ Bindings: Bindings }>();

// Enable CORS
enhancedRiskEngineApi.use('/*', cors());

/**
 * Enhanced Risk Engine Status & Health Check
 */
enhancedRiskEngineApi.get('/status', async (c) => {
  try {
    const db = c.env.DB;
    
    // Check database connectivity
    const dbCheck = await db.prepare('SELECT 1 as test').first();
    
    // Check enhanced tables exist
    const tablesCheck = await db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN (
        'service_indices', 'ai_analysis', 'tenant_policies'
      )
    `).all();
    
    // Check feature flags
    const featureFlagCheck = await db.prepare(`
      SELECT key, value FROM system_config 
      WHERE key LIKE 'enhanced_%' OR key = 'tenant_risk_policy'
    `).all();
    
    return c.json({
      status: 'healthy',
      version: '2.0',
      enhanced_engine: {
        database_connectivity: !!dbCheck,
        enhanced_tables_exist: tablesCheck.results?.length === 3,
        feature_flags_configured: featureFlagCheck.results?.length > 0
      },
      capabilities: [
        'service_indices_computation',
        'ai_native_analysis', 
        'explainable_scoring',
        'tenant_configurable_policies',
        'backward_compatibility'
      ],
      api_endpoints: {
        service_indices: '/api/enhanced-risk-engine/service-indices/*',
        risk_scoring: '/api/enhanced-risk-engine/scoring/*',
        ai_analysis: '/api/enhanced-risk-engine/ai-analysis/*',
        tenant_policy: '/api/enhanced-risk-engine/tenant-policy/*'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Service Indices Computation API
 */
enhancedRiskEngineApi.get('/service-indices/:serviceId', async (c) => {
  try {
    const serviceId = parseInt(c.req.param('serviceId'));
    if (isNaN(serviceId)) {
      return c.json({ error: 'Invalid service ID' }, 400);
    }
    
    const optimizer = new EnhancedRiskScoringOptimizer(c.env.DB);
    const indices = await optimizer.computeServiceIndices(serviceId);
    
    return c.json({
      service_id: serviceId,
      indices,
      computation_metadata: {
        version: '2.0',
        computed_at: new Date().toISOString(),
        cache_duration_minutes: 15
      }
    });
    
  } catch (error) {
    console.error('[Enhanced-API] Service indices computation failed:', error);
    return c.json({
      error: 'Service indices computation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Bulk Service Indices for Dashboard
 */
enhancedRiskEngineApi.get('/service-indices/bulk', async (c) => {
  try {
    const serviceIds = c.req.query('service_ids')?.split(',').map(id => parseInt(id)) || [];
    const limit = parseInt(c.req.query('limit') || '20');
    
    if (serviceIds.length === 0) {
      // Get all active services if none specified
      const services = await c.env.DB.prepare(`
        SELECT id FROM services WHERE status = 'active' LIMIT ?
      `).bind(limit).all();
      
      serviceIds.push(...(services.results || []).map((s: any) => s.id));
    }
    
    const optimizer = new EnhancedRiskScoringOptimizer(c.env.DB);
    const results: any[] = [];
    
    for (const serviceId of serviceIds.slice(0, limit)) {
      try {
        const indices = await optimizer.computeServiceIndices(serviceId);
        results.push({
          service_id: serviceId,
          indices,
          status: 'computed'
        });
      } catch (error) {
        results.push({
          service_id: serviceId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return c.json({
      results,
      total_requested: serviceIds.length,
      total_computed: results.filter(r => r.status === 'computed').length,
      computed_at: new Date().toISOString()
    });
    
  } catch (error) {
    return c.json({
      error: 'Bulk service indices computation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Enhanced Risk Scoring API
 */
enhancedRiskEngineApi.post('/scoring/calculate', async (c) => {
  try {
    const riskData = await c.req.json();
    
    // Validate required fields
    if (!riskData.title || !riskData.category) {
      return c.json({
        error: 'Missing required fields',
        required: ['title', 'category']
      }, 400);
    }
    
    const optimizer = new EnhancedRiskScoringOptimizer(c.env.DB);
    const result = await optimizer.calculateEnhancedRiskScore(
      riskData,
      riskData.service_id
    );
    
    return c.json({
      ...result,
      api_version: 'v2.0',
      request_data: {
        service_id: riskData.service_id,
        category: riskData.category,
        title: riskData.title
      }
    });
    
  } catch (error) {
    console.error('[Enhanced-API] Risk scoring calculation failed:', error);
    return c.json({
      error: 'Risk scoring calculation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Enhanced Risk Creation with Multiple Triggers
 */
enhancedRiskEngineApi.post('/risks/create', async (c) => {
  try {
    const requestData = await c.req.json();
    const { trigger_type, trigger_data } = requestData;
    
    if (!trigger_type || !trigger_data) {
      return c.json({
        error: 'Missing trigger information',
        required: ['trigger_type', 'trigger_data']
      }, 400);
    }
    
    const manager = new EnhancedDynamicRiskManager(c.env.DB, c.env.AI);
    
    // Process different trigger types
    let enhancedTrigger;
    switch (trigger_type) {
      case 'security':
        enhancedTrigger = await manager.processSecurityTrigger(trigger_data);
        break;
      case 'operational':
        enhancedTrigger = await manager.processOperationalTrigger(trigger_data);
        break;
      case 'compliance':
        enhancedTrigger = await manager.processComplianceTrigger(trigger_data);
        break;
      case 'strategic':
        enhancedTrigger = await manager.processStrategicTrigger(trigger_data);
        break;
      default:
        return c.json({
          error: 'Invalid trigger type',
          supported_types: ['security', 'operational', 'compliance', 'strategic']
        }, 400);
    }
    
    const result = await manager.createDynamicRiskFromTrigger(enhancedTrigger);
    
    return c.json({
      ...result,
      trigger_type,
      enhanced_processing: true,
      api_version: 'v2.0'
    });
    
  } catch (error) {
    console.error('[Enhanced-API] Enhanced risk creation failed:', error);
    return c.json({
      error: 'Enhanced risk creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * AI Analysis Service Integration
 */
enhancedRiskEngineApi.post('/ai-analysis/analyze-risk', async (c) => {
  try {
    const analysisRequest = await c.req.json();
    
    if (!analysisRequest.risk_id) {
      return c.json({
        error: 'Missing risk_id for analysis'
      }, 400);
    }
    
    const aiService = new AIAnalysisService(c.env.DB, c.env.AI);
    const result = await aiService.analyzeRisk(analysisRequest);
    
    return c.json({
      analysis_result: result,
      api_version: 'v2.0',
      analyzed_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Enhanced-API] AI analysis failed:', error);
    return c.json({
      error: 'AI analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * AI Analysis History and Status
 */
enhancedRiskEngineApi.get('/ai-analysis/risk/:riskId', async (c) => {
  try {
    const riskId = parseInt(c.req.param('riskId'));
    
    const analysis = await c.env.DB.prepare(`
      SELECT 
        id, risk_id, analysis_status, ai_output, confidence_score,
        governance_flags, created_at, updated_at
      FROM ai_analysis 
      WHERE risk_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).bind(riskId).all();
    
    return c.json({
      risk_id: riskId,
      analysis_history: analysis.results || [],
      total_analyses: analysis.results?.length || 0
    });
    
  } catch (error) {
    return c.json({
      error: 'Failed to retrieve AI analysis history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Tenant Policy Management
 */
enhancedRiskEngineApi.get('/tenant-policy', async (c) => {
  try {
    const policyManager = new TenantPolicyManager(c.env.DB);
    const currentPolicy = await policyManager.getCurrentPolicy();
    
    return c.json({
      policy: currentPolicy,
      api_version: 'v2.0'
    });
    
  } catch (error) {
    return c.json({
      error: 'Failed to retrieve tenant policy',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

enhancedRiskEngineApi.put('/tenant-policy', async (c) => {
  try {
    const newPolicy = await c.req.json();
    
    const policyManager = new TenantPolicyManager(c.env.DB);
    const result = await policyManager.updatePolicy(newPolicy);
    
    return c.json({
      update_result: result,
      api_version: 'v2.0'
    });
    
  } catch (error) {
    return c.json({
      error: 'Failed to update tenant policy',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Performance and Monitoring
 */
enhancedRiskEngineApi.get('/performance/metrics', async (c) => {
  try {
    const timeframe = c.req.query('timeframe') || '24h';
    const hoursBack = timeframe === '1h' ? 1 : timeframe === '24h' ? 24 : 168; // 1h, 24h, 1w
    
    const metrics = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_calculations,
        AVG(computation_time_ms) as avg_computation_time,
        MIN(computation_time_ms) as min_computation_time,
        MAX(computation_time_ms) as max_computation_time,
        AVG(CASE WHEN final_score >= 0.8 THEN 1.0 ELSE 0.0 END) * 100 as high_risk_percentage,
        COUNT(DISTINCT service_id) as services_analyzed
      FROM risk_score_history
      WHERE created_at >= datetime('now', '-${hoursBack} hours')
    `).first();
    
    const recentScores = await c.env.DB.prepare(`
      SELECT 
        risk_id, service_id, final_score, risk_level, computation_time_ms,
        created_at
      FROM risk_score_history
      WHERE created_at >= datetime('now', '-${hoursBack} hours')
      ORDER BY created_at DESC
      LIMIT 10
    `).all();
    
    return c.json({
      timeframe,
      summary_metrics: metrics,
      recent_calculations: recentScores.results || [],
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    return c.json({
      error: 'Failed to retrieve performance metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Backward Compatibility Bridge
 * Enhances existing risk data with new capabilities when requested
 */
enhancedRiskEngineApi.post('/compatibility/enhance-existing-risk', async (c) => {
  try {
    const { risk_id } = await c.req.json();
    
    if (!risk_id) {
      return c.json({ error: 'Missing risk_id' }, 400);
    }
    
    // Get existing risk
    const existingRisk = await c.env.DB.prepare(`
      SELECT * FROM risks WHERE id = ?
    `).bind(risk_id).first();
    
    if (!existingRisk) {
      return c.json({ error: 'Risk not found' }, 404);
    }
    
    // Calculate enhanced scoring for existing risk
    const optimizer = new EnhancedRiskScoringOptimizer(c.env.DB);
    const enhancedResult = await optimizer.calculateEnhancedRiskScore(
      {
        likelihood: existingRisk.likelihood,
        impact: existingRisk.impact,
        confidence_score: existingRisk.confidence_score,
        category: existingRisk.category,
        title: existingRisk.title,
        description: existingRisk.description
      },
      existingRisk.service_id
    );
    
    // Update risk with enhanced data (non-destructive)
    await c.env.DB.prepare(`
      UPDATE risks SET
        risk_score_composite = ?,
        likelihood_0_100 = ?,
        impact_0_100 = ?,
        service_indices_json = ?,
        controls_discount = ?,
        score_explanation = ?,
        enhanced_migration_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      enhancedResult.risk_score_composite,
      enhancedResult.factors.likelihood_0_100,
      enhancedResult.factors.impact_0_100,
      JSON.stringify(enhancedResult.service_indices),
      enhancedResult.controls_discount.total_discount,
      JSON.stringify(enhancedResult.explanation),
      risk_id
    ).run();
    
    return c.json({
      risk_id,
      enhanced: true,
      original_score: existingRisk.final_score,
      enhanced_score: enhancedResult.final_score,
      service_indices: enhancedResult.service_indices,
      explanation: enhancedResult.explanation,
      migration_completed: true
    });
    
  } catch (error) {
    console.error('[Enhanced-API] Risk enhancement failed:', error);
    return c.json({
      error: 'Failed to enhance existing risk',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Feature Flag Control
 */
enhancedRiskEngineApi.get('/feature-flags', async (c) => {
  try {
    const flags = await c.env.DB.prepare(`
      SELECT key, value, updated_at
      FROM system_config 
      WHERE key LIKE 'enhanced_%' 
         OR key LIKE 'feature_flag_%'
         OR key = 'tenant_risk_policy'
    `).all();
    
    const formattedFlags = (flags.results || []).reduce((acc: any, flag: any) => {
      acc[flag.key] = {
        value: flag.value,
        updated_at: flag.updated_at
      };
      return acc;
    }, {});
    
    return c.json({
      feature_flags: formattedFlags,
      enhanced_engine_status: formattedFlags['enhanced_risk_engine_enabled']?.value === 'true' ? 'enabled' : 'disabled'
    });
    
  } catch (error) {
    return c.json({
      error: 'Failed to retrieve feature flags',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

enhancedRiskEngineApi.put('/feature-flags/:flagName', async (c) => {
  try {
    const flagName = c.req.param('flagName');
    const { value } = await c.req.json();
    
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO system_config (key, value, updated_at)
      VALUES (?, ?, ?)
    `).bind(flagName, value, new Date().toISOString()).run();
    
    return c.json({
      flag_name: flagName,
      new_value: value,
      updated_at: new Date().toISOString()
    });
    
  } catch (error) {
    return c.json({
      error: 'Failed to update feature flag',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default enhancedRiskEngineApi;