/**
 * Phase 1 Dynamic Risk Intelligence API Routes
 * 
 * RESTful API endpoints for the Phase 1 implementation.
 * Provides access to all core functionality with real database integration.
 */

import { Hono } from 'hono';
import { Phase1Orchestrator } from '../services/phase1-orchestrator';
import { DynamicRiskDiscoveryEngine } from '../services/dynamic-risk-discovery';
import { ServiceCentricRiskScoringEngine } from '../services/service-centric-risk-scoring';
import { RealTimeRiskUpdatesProcessor } from '../services/real-time-risk-updates';
import { RiskApprovalWorkflowEngine } from '../services/risk-approval-workflow';

type Bindings = {
  DB: D1Database;
}

const api = new Hono<{ Bindings: Bindings }>();

// Initialize services middleware
api.use('*', async (c, next) => {
  // Attach service instances to context for use in routes
  c.set('orchestrator', new Phase1Orchestrator(c.env.DB));
  c.set('discoveryEngine', new DynamicRiskDiscoveryEngine(c.env.DB));
  c.set('scoringEngine', new ServiceCentricRiskScoringEngine(c.env.DB));
  c.set('updatesProcessor', new RealTimeRiskUpdatesProcessor(c.env.DB));
  c.set('workflowEngine', new RiskApprovalWorkflowEngine(c.env.DB));
  await next();
});

// =============================================================================
// SYSTEM MANAGEMENT & ORCHESTRATION
// =============================================================================

// Get comprehensive Phase 1 dashboard
api.get('/dashboard', async (c) => {
  try {
    const orchestrator = c.get('orchestrator') as Phase1Orchestrator;
    const dashboard = await orchestrator.getPhase1Dashboard();
    
    return c.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting dashboard:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Start Phase 1 orchestrator
api.post('/system/start', async (c) => {
  try {
    const orchestrator = c.get('orchestrator') as Phase1Orchestrator;
    await orchestrator.start();
    
    return c.json({
      success: true,
      message: 'Phase 1 orchestrator started successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting orchestrator:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Get system health status
api.get('/system/health', async (c) => {
  try {
    const orchestrator = c.get('orchestrator') as Phase1Orchestrator;
    const health = await orchestrator.performHealthCheck();
    
    return c.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking health:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Manual execution trigger
api.post('/system/execute', async (c) => {
  try {
    const orchestrator = c.get('orchestrator') as Phase1Orchestrator;
    const execution = await orchestrator.triggerManualExecution();
    
    return c.json({
      success: true,
      data: execution,
      message: 'Manual execution completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error executing manual cycle:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// =============================================================================
// DYNAMIC RISK DISCOVERY
// =============================================================================

// Trigger comprehensive risk discovery
api.post('/discovery/discover', async (c) => {
  try {
    const discoveryEngine = c.get('discoveryEngine') as DynamicRiskDiscoveryEngine;
    const results = await discoveryEngine.discoverRisks();
    
    return c.json({
      success: true,
      data: results,
      message: `Discovered ${results.total_risks_generated} new risks`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in risk discovery:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Discover risks for specific asset
api.post('/discovery/asset/:assetId', async (c) => {
  try {
    const assetId = parseInt(c.req.param('assetId'));
    const discoveryEngine = c.get('discoveryEngine') as DynamicRiskDiscoveryEngine;
    
    const results = await discoveryEngine.discoverRisksForAsset(assetId);
    
    return c.json({
      success: true,
      data: results,
      message: `Asset-specific discovery completed for asset ${assetId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in asset-specific discovery:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Get discovery engine status and metrics
api.get('/discovery/status', async (c) => {
  try {
    const discoveryEngine = c.get('discoveryEngine') as DynamicRiskDiscoveryEngine;
    const status = await discoveryEngine.getDiscoveryStatus();
    
    return c.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting discovery status:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// =============================================================================
// SERVICE-CENTRIC RISK SCORING
// =============================================================================

// Get comprehensive service risk dashboard
api.get('/scoring/dashboard', async (c) => {
  try {
    const scoringEngine = c.get('scoringEngine') as ServiceCentricRiskScoringEngine;
    const dashboard = await scoringEngine.getServiceRiskDashboard();
    
    return c.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting scoring dashboard:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Calculate risk score for specific service
api.get('/scoring/service/:serviceId', async (c) => {
  try {
    const serviceId = parseInt(c.req.param('serviceId'));
    const scoringEngine = c.get('scoringEngine') as ServiceCentricRiskScoringEngine;
    
    const profile = await scoringEngine.calculateServiceRiskScore(serviceId);
    
    return c.json({
      success: true,
      data: profile,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculating service risk score:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Get risk cascading analysis
api.get('/scoring/cascading', async (c) => {
  try {
    const scoringEngine = c.get('scoringEngine') as ServiceCentricRiskScoringEngine;
    const cascading = await scoringEngine.getRiskCascadingAnalysis();
    
    return c.json({
      success: true,
      data: cascading,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting cascading analysis:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Recalculate all service risk scores
api.post('/scoring/recalculate', async (c) => {
  try {
    const scoringEngine = c.get('scoringEngine') as ServiceCentricRiskScoringEngine;
    await scoringEngine.recalculateAllServiceRiskScores();
    
    return c.json({
      success: true,
      message: 'All service risk scores recalculated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error recalculating scores:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// =============================================================================
// REAL-TIME RISK UPDATES
// =============================================================================

// Process pending risk update events
api.post('/updates/process', async (c) => {
  try {
    const updatesProcessor = c.get('updatesProcessor') as RealTimeRiskUpdatesProcessor;
    const metrics = await updatesProcessor.processUpdates();
    
    return c.json({
      success: true,
      data: metrics,
      message: 'Risk update processing completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing updates:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Queue a new risk update event
api.post('/updates/queue', async (c) => {
  try {
    const body = await c.req.json();
    const updatesProcessor = c.get('updatesProcessor') as RealTimeRiskUpdatesProcessor;
    
    const eventId = await updatesProcessor.queueRiskUpdateEvent({
      type: body.type,
      source: body.source || 'manual',
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      change_type: body.change_type,
      priority: body.priority || 'medium',
      data: body.data || {}
    });
    
    return c.json({
      success: true,
      data: { event_id: eventId },
      message: 'Risk update event queued successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error queuing update event:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 400);
  }
});

// Get processing metrics
api.get('/updates/metrics', async (c) => {
  try {
    const updatesProcessor = c.get('updatesProcessor') as RealTimeRiskUpdatesProcessor;
    const metrics = await updatesProcessor.getProcessingMetrics();
    
    return c.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting processing metrics:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Get recent risk change notifications
api.get('/updates/notifications', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const updatesProcessor = c.get('updatesProcessor') as RealTimeRiskUpdatesProcessor;
    const notifications = await updatesProcessor.getRecentNotifications(limit);
    
    return c.json({
      success: true,
      data: notifications,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// =============================================================================
// RISK APPROVAL WORKFLOW
// =============================================================================

// Process pending risk approvals
api.post('/workflow/process', async (c) => {
  try {
    const workflowEngine = c.get('workflowEngine') as RiskApprovalWorkflowEngine;
    const results = await workflowEngine.processPendingRisks();
    
    return c.json({
      success: true,
      data: results,
      message: 'Pending risks processed through approval workflow',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing workflow:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Get pending review requests
api.get('/workflow/reviews', async (c) => {
  try {
    const assignedTo = c.req.query('assigned_to');
    const priority = c.req.query('priority');
    const workflowEngine = c.get('workflowEngine') as RiskApprovalWorkflowEngine;
    
    const reviews = await workflowEngine.getPendingReviews(assignedTo, priority);
    
    return c.json({
      success: true,
      data: reviews,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting pending reviews:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Submit a review decision
api.post('/workflow/reviews/:reviewId/decision', async (c) => {
  try {
    const reviewId = c.req.param('reviewId');
    const body = await c.req.json();
    const workflowEngine = c.get('workflowEngine') as RiskApprovalWorkflowEngine;
    
    await workflowEngine.submitReviewDecision(
      reviewId,
      body.decision,
      body.reviewer_notes || '',
      body.reviewed_by || 'unknown',
      body.modification_details
    );
    
    return c.json({
      success: true,
      message: `Review decision submitted: ${body.decision}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error submitting review decision:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 400);
  }
});

// Process overdue reviews
api.post('/workflow/escalate', async (c) => {
  try {
    const workflowEngine = c.get('workflowEngine') as RiskApprovalWorkflowEngine;
    const results = await workflowEngine.processOverdueReviews();
    
    return c.json({
      success: true,
      data: results,
      message: 'Overdue reviews processed and escalated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing overdue reviews:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Get workflow metrics
api.get('/workflow/metrics', async (c) => {
  try {
    const workflowEngine = c.get('workflowEngine') as RiskApprovalWorkflowEngine;
    const metrics = await workflowEngine.getWorkflowMetrics();
    
    return c.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting workflow metrics:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// =============================================================================
// DATA ACCESS ENDPOINTS
// =============================================================================

// Get all business services
api.get('/services', async (c) => {
  try {
    const services = await c.env.DB.prepare(`
      SELECT * FROM business_services 
      ORDER BY criticality_level DESC, name ASC
    `).all();
    
    return c.json({
      success: true,
      data: services.results,
      count: services.results?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting services:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Get dynamic risks with filtering
api.get('/risks', async (c) => {
  try {
    const status = c.req.query('status');
    const source = c.req.query('source');
    const limit = parseInt(c.req.query('limit') || '100');
    
    let query = `
      SELECT dr.*, bs.name as service_name, a.name as asset_name
      FROM dynamic_risks dr
      LEFT JOIN business_services bs ON dr.service_id = bs.id
      LEFT JOIN assets a ON dr.asset_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (status) {
      query += ` AND dr.status = ?`;
      params.push(status);
    }
    
    if (source) {
      query += ` AND dr.source_system = ?`;
      params.push(source);
    }
    
    query += ` ORDER BY dr.created_at DESC LIMIT ?`;
    params.push(limit);
    
    const risks = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: risks.results,
      count: risks.results?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting risks:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Get assets
api.get('/assets', async (c) => {
  try {
    const assets = await c.env.DB.prepare(`
      SELECT * FROM assets 
      ORDER BY criticality_level DESC, name ASC
    `).all();
    
    return c.json({
      success: true,
      data: assets.results,
      count: assets.results?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting assets:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

export default api;