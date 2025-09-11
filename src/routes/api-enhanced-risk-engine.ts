// Enhanced Risk Engine API Routes
// Comprehensive API for TI-enhanced risk management services

import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { EnhancedRiskEngine } from '../services/risk-management/enhanced-risk-engine';
import { RiskValidationService } from '../services/risk-management/risk-validation-service';

const apiEnhancedRiskEngineRoutes = new Hono();

// Apply authentication middleware to all routes
apiEnhancedRiskEngineRoutes.use('*', requireAuth);

// Initialize services with DB binding
const initializeRiskEngine = (c: any) => {
  const db = c.env?.DB;
  if (!db) {
    throw new Error('Database binding not available');
  }
  return new EnhancedRiskEngine(db);
};

const initializeValidationService = (c: any) => {
  const db = c.env?.DB;
  if (!db) {
    throw new Error('Database binding not available');
  }
  return new RiskValidationService(db);
};

// ========================================
// RISK LIFECYCLE MANAGEMENT
// ========================================

// Auto-detect risks from various sources
apiEnhancedRiskEngineRoutes.post('/detect-risks', requirePermission('risk:manage'), async (c) => {
  try {
    const riskEngine = initializeRiskEngine(c);
    const userEmail = getCookie(c, 'user_email') || '';
    
    const detectedRisks = await riskEngine.detectRisks();
    
    console.log(`Risk detection initiated by ${userEmail}:`, {
      risks_detected: detectedRisks.length,
      detection_timestamp: new Date().toISOString()
    });
    
    return c.json({
      success: true,
      message: `Detected ${detectedRisks.length} new risks`,
      data: {
        detected_risks: detectedRisks,
        detection_summary: {
          total_detected: detectedRisks.length,
          by_category: detectedRisks.reduce((acc: any, risk) => {
            acc[risk.category] = (acc[risk.category] || 0) + 1;
            return acc;
          }, {}),
          ti_enhanced_count: detectedRisks.filter(r => r.ti_enriched).length
        }
      }
    });
  } catch (error) {
    console.error('Risk detection failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to detect risks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Validate a specific risk
apiEnhancedRiskEngineRoutes.post('/risks/:riskId/validate', requirePermission('risk:validate'), async (c) => {
  try {
    const riskEngine = initializeRiskEngine(c);
    const riskId = parseInt(c.req.param('riskId'));
    const { validation_notes } = await c.req.json();
    const userEmail = getCookie(c, 'user_email') || '';
    const validatorId = 1; // This would come from user authentication
    
    await riskEngine.validateRisk(riskId, validatorId, validation_notes);
    
    console.log(`Risk validated by ${userEmail}:`, {
      risk_id: riskId,
      validator_id: validatorId,
      validation_notes: validation_notes?.substring(0, 100)
    });
    
    return c.json({
      success: true,
      message: `Risk ${riskId} validated successfully`,
      data: { risk_id: riskId, validator_id: validatorId }
    });
  } catch (error) {
    console.error('Risk validation failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to validate risk',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Activate a validated risk
apiEnhancedRiskEngineRoutes.post('/risks/:riskId/activate', requirePermission('risk:manage'), async (c) => {
  try {
    const riskEngine = initializeRiskEngine(c);
    const riskId = parseInt(c.req.param('riskId'));
    const userEmail = getCookie(c, 'user_email') || '';
    
    await riskEngine.activateRisk(riskId);
    
    console.log(`Risk activated by ${userEmail}:`, { risk_id: riskId });
    
    return c.json({
      success: true,
      message: `Risk ${riskId} activated successfully`,
      data: { risk_id: riskId, status: 'active' }
    });
  } catch (error) {
    console.error('Risk activation failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to activate risk',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Retire a risk
apiEnhancedRiskEngineRoutes.post('/risks/:riskId/retire', requirePermission('risk:manage'), async (c) => {
  try {
    const riskEngine = initializeRiskEngine(c);
    const riskId = parseInt(c.req.param('riskId'));
    const { reason } = await c.req.json();
    const userEmail = getCookie(c, 'user_email') || '';
    
    if (!reason) {
      return c.json({ 
        success: false, 
        error: 'Retirement reason is required' 
      }, 400);
    }
    
    await riskEngine.retireRisk(riskId, reason);
    
    console.log(`Risk retired by ${userEmail}:`, { 
      risk_id: riskId, 
      retirement_reason: reason 
    });
    
    return c.json({
      success: true,
      message: `Risk ${riskId} retired successfully`,
      data: { risk_id: riskId, status: 'retired', reason }
    });
  } catch (error) {
    console.error('Risk retirement failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retire risk',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ========================================
// TI-ENHANCED RISK ANALYSIS
// ========================================

// Enrich risk with TI data
apiEnhancedRiskEngineRoutes.post('/risks/:riskId/enrich', requirePermission('risk:manage'), async (c) => {
  try {
    const riskEngine = initializeRiskEngine(c);
    const riskId = parseInt(c.req.param('riskId'));
    const userEmail = getCookie(c, 'user_email') || '';
    
    await riskEngine.enrichRiskWithTI(riskId);
    
    console.log(`Risk TI enrichment by ${userEmail}:`, { risk_id: riskId });
    
    return c.json({
      success: true,
      message: `Risk ${riskId} enriched with TI data`,
      data: { risk_id: riskId, ti_enriched: true }
    });
  } catch (error) {
    console.error('Risk TI enrichment failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to enrich risk with TI data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Calculate TI-enhanced score for indicators
apiEnhancedRiskEngineRoutes.post('/calculate-ti-score', requirePermission('risk:view'), async (c) => {
  try {
    const riskEngine = initializeRiskEngine(c);
    const { indicators } = await c.req.json();
    
    if (!Array.isArray(indicators)) {
      return c.json({ 
        success: false, 
        error: 'Indicators must be an array' 
      }, 400);
    }
    
    const tiScore = await riskEngine.calculateTIEnhancedScore(indicators);
    
    return c.json({
      success: true,
      data: {
        ti_enhanced_score: tiScore,
        indicators_processed: indicators.length,
        score_factors: {
          severity_contribution: 'varies by indicator',
          epss_contribution: 'up to 30 points',
          cvss_contribution: 'up to 20 points',
          exploit_bonus: 'up to 30 points'
        }
      }
    });
  } catch (error) {
    console.error('TI score calculation failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to calculate TI-enhanced score',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Find related TI indicators for a risk
apiEnhancedRiskEngineRoutes.get('/risks/:riskId/related-indicators', requirePermission('risk:view'), async (c) => {
  try {
    const riskEngine = initializeRiskEngine(c);
    const riskId = parseInt(c.req.param('riskId'));
    
    const relatedIndicators = await riskEngine.findRelatedIndicators(riskId);
    
    return c.json({
      success: true,
      data: {
        risk_id: riskId,
        related_indicators: relatedIndicators,
        indicators_found: relatedIndicators.length,
        high_severity_count: relatedIndicators.filter(i => 
          ['critical', 'high'].includes(i.severity)
        ).length
      }
    });
  } catch (error) {
    console.error('Finding related indicators failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to find related indicators',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ========================================
// SERVICE RISK ASSESSMENT
// ========================================

// Assess risk for a specific service
apiEnhancedRiskEngineRoutes.post('/services/:serviceId/assess', requirePermission('risk:manage'), async (c) => {
  try {
    const riskEngine = initializeRiskEngine(c);
    const serviceId = parseInt(c.req.param('serviceId'));
    const userEmail = getCookie(c, 'user_email') || '';
    
    const assessment = await riskEngine.assessServiceRisk(serviceId);
    
    console.log(`Service risk assessment by ${userEmail}:`, {
      service_id: serviceId,
      overall_score: assessment.overall_risk_score,
      ti_enhanced: assessment.ti_enhanced
    });
    
    return c.json({
      success: true,
      message: `Service ${serviceId} risk assessment completed`,
      data: assessment
    });
  } catch (error) {
    console.error('Service risk assessment failed:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to assess service risk',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Bulk service assessment
apiEnhancedRiskEngineRoutes.post('/services/bulk-assess', requirePermission('risk:manage'), async (c) => {
  try {
    const riskEngine = initializeRiskEngine(c);
    const userEmail = getCookie(c, 'user_email') || '';
    
    await riskEngine.bulkServiceAssessment();
    
    console.log(`Bulk service assessment initiated by ${userEmail}`);\n    \n    return c.json({\n      success: true,\n      message: 'Bulk service assessment completed successfully'\n    });\n  } catch (error) {\n    console.error('Bulk service assessment failed:', error);\n    return c.json({ \n      success: false, \n      error: 'Failed to perform bulk service assessment',\n      details: error instanceof Error ? error.message : 'Unknown error'\n    }, 500);\n  }\n});\n\n// Generate risk matrix\napiEnhancedRiskEngineRoutes.get('/risk-matrix', requirePermission('risk:view'), async (c) => {\n  try {\n    const riskEngine = initializeRiskEngine(c);\n    \n    const riskMatrix = await riskEngine.generateRiskMatrix();\n    \n    return c.json({\n      success: true,\n      data: riskMatrix\n    });\n  } catch (error) {\n    console.error('Risk matrix generation failed:', error);\n    return c.json({ \n      success: false, \n      error: 'Failed to generate risk matrix',\n      details: error instanceof Error ? error.message : 'Unknown error'\n    }, 500);\n  }\n});\n\n// ========================================\n// RISK VALIDATION WORKFLOWS\n// ========================================\n\n// Submit risk for validation\napiEnhancedRiskEngineRoutes.post('/validation/submit/:riskId', requirePermission('risk:validate'), async (c) => {\n  try {\n    const validationService = initializeValidationService(c);\n    const riskId = parseInt(c.req.param('riskId'));\n    const userEmail = getCookie(c, 'user_email') || '';\n    \n    const validation = await validationService.submitForValidation(riskId);\n    \n    console.log(`Validation submitted by ${userEmail}:`, {\n      risk_id: riskId,\n      validation_id: validation.id,\n      validator_id: validation.validator_id\n    });\n    \n    return c.json({\n      success: true,\n      message: `Risk ${riskId} submitted for validation`,\n      data: validation\n    });\n  } catch (error) {\n    console.error('Validation submission failed:', error);\n    return c.json({ \n      success: false, \n      error: 'Failed to submit risk for validation',\n      details: error instanceof Error ? error.message : 'Unknown error'\n    }, 500);\n  }\n});\n\n// Process validation decision\napiEnhancedRiskEngineRoutes.post('/validation/decision', requirePermission('risk:validate'), async (c) => {\n  try {\n    const validationService = initializeValidationService(c);\n    const validationData = await c.req.json();\n    const userEmail = getCookie(c, 'user_email') || '';\n    \n    // Validate required fields\n    const requiredFields = ['risk_id', 'validation_status', 'validation_notes'];\n    for (const field of requiredFields) {\n      if (!validationData[field]) {\n        return c.json({ \n          success: false, \n          error: `Missing required field: ${field}` \n        }, 400);\n      }\n    }\n    \n    validationData.validator_id = 1; // This would come from user auth\n    \n    const result = await validationService.validateRisk(validationData);\n    \n    console.log(`Validation decision by ${userEmail}:`, {\n      risk_id: validationData.risk_id,\n      decision: validationData.validation_status,\n      validator_id: validationData.validator_id\n    });\n    \n    return c.json({\n      success: true,\n      message: `Validation decision recorded: ${validationData.validation_status}`,\n      data: result\n    });\n  } catch (error) {\n    console.error('Validation decision failed:', error);\n    return c.json({ \n      success: false, \n      error: 'Failed to process validation decision',\n      details: error instanceof Error ? error.message : 'Unknown error'\n    }, 500);\n  }\n});\n\n// Get validation queue\napiEnhancedRiskEngineRoutes.get('/validation/queue', requirePermission('risk:validate'), async (c) => {\n  try {\n    const validationService = initializeValidationService(c);\n    const validatorId = c.req.query('validator_id') ? \n      parseInt(c.req.query('validator_id')!) : undefined;\n    \n    const queue = await validationService.getValidationQueue(validatorId);\n    \n    return c.json({\n      success: true,\n      data: {\n        validation_queue: queue,\n        queue_size: queue.length,\n        validator_id: validatorId || 'all'\n      }\n    });\n  } catch (error) {\n    console.error('Getting validation queue failed:', error);\n    return c.json({ \n      success: false, \n      error: 'Failed to get validation queue',\n      details: error instanceof Error ? error.message : 'Unknown error'\n    }, 500);\n  }\n});\n\n// Escalate validation\napiEnhancedRiskEngineRoutes.post('/validation/escalate/:riskId', requirePermission('risk:validate'), async (c) => {\n  try {\n    const validationService = initializeValidationService(c);\n    const riskId = parseInt(c.req.param('riskId'));\n    const { reason } = await c.req.json();\n    const userEmail = getCookie(c, 'user_email') || '';\n    \n    if (!reason) {\n      return c.json({ \n        success: false, \n        error: 'Escalation reason is required' \n      }, 400);\n    }\n    \n    await validationService.escalateValidation(riskId, reason);\n    \n    console.log(`Validation escalated by ${userEmail}:`, {\n      risk_id: riskId,\n      escalation_reason: reason\n    });\n    \n    return c.json({\n      success: true,\n      message: `Risk ${riskId} validation escalated`,\n      data: { risk_id: riskId, escalation_reason: reason }\n    });\n  } catch (error) {\n    console.error('Validation escalation failed:', error);\n    return c.json({ \n      success: false, \n      error: 'Failed to escalate validation',\n      details: error instanceof Error ? error.message : 'Unknown error'\n    }, 500);\n  }\n});\n\n// Get validation metrics\napiEnhancedRiskEngineRoutes.get('/validation/metrics', requirePermission('risk:view'), async (c) => {\n  try {\n    const validationService = initializeValidationService(c);\n    \n    const metrics = await validationService.getValidationMetrics();\n    \n    return c.json({\n      success: true,\n      data: metrics,\n      timestamp: new Date().toISOString()\n    });\n  } catch (error) {\n    console.error('Getting validation metrics failed:', error);\n    return c.json({ \n      success: false, \n      error: 'Failed to get validation metrics',\n      details: error instanceof Error ? error.message : 'Unknown error'\n    }, 500);\n  }\n});\n\n// Check for validations needing escalation\napiEnhancedRiskEngineRoutes.post('/validation/check-escalation', requirePermission('risk:validate'), async (c) => {\n  try {\n    const validationService = initializeValidationService(c);\n    const userEmail = getCookie(c, 'user_email') || '';\n    \n    await validationService.checkEscalationNeeds();\n    \n    console.log(`Escalation check initiated by ${userEmail}`);\n    \n    return c.json({\n      success: true,\n      message: 'Escalation check completed successfully'\n    });\n  } catch (error) {\n    console.error('Escalation check failed:', error);\n    return c.json({ \n      success: false, \n      error: 'Failed to check escalation needs',\n      details: error instanceof Error ? error.message : 'Unknown error'\n    }, 500);\n  }\n});\n\n// ========================================\n// ENGINE STATUS AND HEALTH\n// ========================================\n\n// Get enhanced risk engine status\napiEnhancedRiskEngineRoutes.get('/status', requirePermission('risk:view'), async (c) => {\n  try {\n    const { DB } = c.env as { DB: D1Database };\n    \n    // Get various engine statistics\n    const riskStats = await DB.prepare(`\n      SELECT \n        COUNT(*) as total_risks,\n        SUM(CASE WHEN ti_enriched = TRUE THEN 1 ELSE 0 END) as ti_enriched_risks,\n        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_risks,\n        SUM(CASE WHEN risk_lifecycle_stage = 'detected' THEN 1 ELSE 0 END) as detected_risks,\n        SUM(CASE WHEN validation_status = 'pending' THEN 1 ELSE 0 END) as pending_validation\n      FROM risks\n    `).first();\n    \n    const recentActivity = await DB.prepare(`\n      SELECT COUNT(*) as recent_detections\n      FROM risks \n      WHERE created_at > datetime('now', '-24 hours')\n    `).first();\n    \n    const validationStats = await DB.prepare(`\n      SELECT \n        COUNT(*) as total_validations,\n        AVG(confidence_score) as avg_confidence,\n        SUM(CASE WHEN validation_status = 'approved' THEN 1 ELSE 0 END) as approved_count\n      FROM risk_validations\n      WHERE created_at > datetime('now', '-7 days')\n    `).first();\n    \n    return c.json({\n      success: true,\n      data: {\n        engine_status: 'operational',\n        risk_statistics: {\n          total_risks: riskStats?.total_risks || 0,\n          ti_enriched_risks: riskStats?.ti_enriched_risks || 0,\n          active_risks: riskStats?.active_risks || 0,\n          detected_risks: riskStats?.detected_risks || 0,\n          pending_validation: riskStats?.pending_validation || 0,\n          recent_detections_24h: recentActivity?.recent_detections || 0\n        },\n        validation_statistics: {\n          total_validations_7d: validationStats?.total_validations || 0,\n          average_confidence: Math.round((validationStats?.avg_confidence || 0) * 100) / 100,\n          approval_rate: validationStats?.total_validations ? \n            Math.round(((validationStats?.approved_count || 0) / validationStats.total_validations) * 100) / 100 : 0\n        },\n        last_updated: new Date().toISOString()\n      }\n    });\n  } catch (error) {\n    console.error('Getting engine status failed:', error);\n    return c.json({ \n      success: false, \n      error: 'Failed to get engine status',\n      details: error instanceof Error ? error.message : 'Unknown error'\n    }, 500);\n  }\n});\n\n// Get performance metrics\napiEnhancedRiskEngineRoutes.get('/performance', requirePermission('risk:view'), async (c) => {\n  try {\n    const { DB } = c.env as { DB: D1Database };\n    const days = parseInt(c.req.query('days') || '7');\n    \n    const performanceData = await DB.prepare(`\n      SELECT \n        DATE(created_at) as date,\n        COUNT(*) as risks_created,\n        SUM(CASE WHEN ti_enriched = TRUE THEN 1 ELSE 0 END) as ti_enriched_count,\n        AVG(risk_score) as avg_risk_score\n      FROM risks\n      WHERE created_at > datetime('now', '-${days} days')\n      GROUP BY DATE(created_at)\n      ORDER BY date DESC\n    `).all();\n    \n    const validationPerformance = await DB.prepare(`\n      SELECT \n        DATE(created_at) as date,\n        COUNT(*) as validations_started,\n        SUM(CASE WHEN validation_status = 'approved' THEN 1 ELSE 0 END) as validations_approved,\n        AVG(\n          CASE WHEN validation_timestamp IS NOT NULL THEN\n            (julianday(validation_timestamp) - julianday(created_at)) * 24\n          END\n        ) as avg_validation_hours\n      FROM risk_validations\n      WHERE created_at > datetime('now', '-${days} days')\n      GROUP BY DATE(created_at)\n      ORDER BY date DESC\n    `).all();\n    \n    return c.json({\n      success: true,\n      data: {\n        performance_period: `${days} days`,\n        risk_creation_trends: performanceData.results || [],\n        validation_performance: validationPerformance.results || [],\n        summary: {\n          total_risks_period: (performanceData.results || []).reduce((sum: number, day: any) => sum + (day.risks_created || 0), 0),\n          total_validations_period: (validationPerformance.results || []).reduce((sum: number, day: any) => sum + (day.validations_started || 0), 0),\n          avg_validation_time_hours: validationPerformance.results?.length ? \n            (validationPerformance.results.reduce((sum: number, day: any) => sum + (day.avg_validation_hours || 0), 0) / validationPerformance.results.length) : 0\n        }\n      }\n    });\n  } catch (error) {\n    console.error('Getting performance metrics failed:', error);\n    return c.json({ \n      success: false, \n      error: 'Failed to get performance metrics',\n      details: error instanceof Error ? error.message : 'Unknown error'\n    }, 500);\n  }\n});\n\nexport { apiEnhancedRiskEngineRoutes };