/**
 * Real-Time Risk Updates Processor
 * 
 * Provides <15 minute updates from operational changes to risk assessments.
 * Implements event-driven risk processing with intelligent batching and prioritization.
 * 
 * Key Features:
 * - Sub-15 minute processing target for all risk updates
 * - Event-driven architecture with multiple trigger sources
 * - Intelligent batching to optimize performance
 * - Priority-based processing queue
 * - Real-time notifications for critical risk changes
 * - Comprehensive audit logging
 */

import { ServiceCentricRiskScoringEngine } from './service-centric-risk-scoring';
import { DynamicRiskDiscoveryEngine } from './dynamic-risk-discovery';

export interface RiskUpdateEvent {
  id: string;
  type: 'asset_change' | 'service_change' | 'vulnerability_discovery' | 'threat_intelligence' | 'compliance_update';
  source: 'defender' | 'servicenow' | 'jira' | 'threat_intel' | 'asset_monitor' | 'manual' | 'system';
  entity_type: 'asset' | 'service' | 'risk' | 'vulnerability';
  entity_id: number;
  change_type: 'create' | 'update' | 'delete' | 'status_change';
  priority: 'critical' | 'high' | 'medium' | 'low';
  data: any; // Change payload
  timestamp: string;
  processed: boolean;
  processing_started_at?: string;
  processing_completed_at?: string;
  error?: string;
}

export interface ProcessingMetrics {
  total_events: number;
  processed_events: number;
  failed_events: number;
  average_processing_time: number; // milliseconds
  events_under_15min: number;
  sla_compliance_rate: number; // percentage
  last_processing_cycle: string;
}

export interface RiskChangeNotification {
  service_id: number;
  service_name: string;
  risk_change: {
    previous_score: number;
    current_score: number;
    change_magnitude: number;
    change_direction: 'increase' | 'decrease';
  };
  trigger_events: string[]; // Event IDs that caused this change
  affected_assets: number[];
  notification_priority: 'critical' | 'high' | 'medium' | 'low';
  created_at: string;
}

export class RealTimeRiskUpdatesProcessor {
  private db: D1Database;
  private riskScoringEngine: ServiceCentricRiskScoringEngine;
  private discoveryEngine: DynamicRiskDiscoveryEngine;
  private processingInterval: number = 60000; // 1 minute processing cycle
  private batchSize: number = 50; // Process up to 50 events per batch
  private maxProcessingTime: number = 900000; // 15 minutes max processing time
  private isProcessing: boolean = false;

  constructor(db: D1Database) {
    this.db = db;
    this.riskScoringEngine = new ServiceCentricRiskScoringEngine(db);
    this.discoveryEngine = new DynamicRiskDiscoveryEngine(db);
  }

  /**
   * Start the real-time processing engine
   */
  async startProcessing(): Promise<void> {
    console.log('Starting Real-Time Risk Updates Processor...');
    
    // Start the main processing loop
    setInterval(async () => {
      if (!this.isProcessing) {
        await this.processUpdates();
      }
    }, this.processingInterval);

    console.log(`Real-time processor started with ${this.processingInterval}ms cycle time`);
  }

  /**
   * Main processing loop - processes pending events in batches
   */
  async processUpdates(): Promise<ProcessingMetrics> {
    this.isProcessing = true;
    const startTime = Date.now();

    try {
      console.log('Starting risk update processing cycle...');

      // Get pending events prioritized by criticality and age
      const pendingEvents = await this.getPendingEvents();
      
      if (pendingEvents.length === 0) {
        console.log('No pending events to process');
        this.isProcessing = false;
        return await this.getProcessingMetrics();
      }

      console.log(`Processing ${pendingEvents.length} pending events...`);

      // Process events in batches
      const results = await this.processBatchEvents(pendingEvents);

      // Generate notifications for significant risk changes
      await this.generateRiskChangeNotifications(results.significantChanges);

      // Update metrics
      await this.updateProcessingMetrics(results);

      const processingTime = Date.now() - startTime;
      console.log(`Processing cycle completed in ${processingTime}ms`);

      this.isProcessing = false;
      return await this.getProcessingMetrics();

    } catch (error) {
      console.error('Error in processing cycle:', error);
      this.isProcessing = false;
      throw error;
    }
  }

  /**
   * Get pending events ordered by priority and age
   */
  private async getPendingEvents(): Promise<RiskUpdateEvent[]> {
    try {
      const events = await this.db.prepare(`
        SELECT * FROM risk_update_events 
        WHERE processed = false 
        ORDER BY 
          CASE priority 
            WHEN 'critical' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3 
            WHEN 'low' THEN 4 
          END,
          timestamp ASC
        LIMIT ?
      `).bind(this.batchSize).all();

      return (events.results || []).map(this.mapEventFromDB);

    } catch (error) {
      console.error('Error getting pending events:', error);
      return [];
    }
  }

  /**
   * Process a batch of events
   */
  private async processBatchEvents(events: RiskUpdateEvent[]): Promise<{
    processed: number;
    failed: number;
    significantChanges: RiskChangeNotification[];
  }> {
    let processed = 0;
    let failed = 0;
    const significantChanges: RiskChangeNotification[] = [];

    for (const event of events) {
      try {
        await this.markEventProcessingStarted(event.id);

        const changeResult = await this.processIndividualEvent(event);
        
        if (changeResult) {
          significantChanges.push(changeResult);
        }

        await this.markEventProcessed(event.id);
        processed++;

      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
        await this.markEventFailed(event.id, error.message);
        failed++;
      }
    }

    return { processed, failed, significantChanges };
  }

  /**
   * Process an individual risk update event
   */
  private async processIndividualEvent(event: RiskUpdateEvent): Promise<RiskChangeNotification | null> {
    try {
      console.log(`Processing event ${event.id} - ${event.type} for ${event.entity_type} ${event.entity_id}`);

      let affectedServices: number[] = [];
      let riskChanges: RiskChangeNotification[] = [];

      switch (event.type) {
        case 'asset_change':
          affectedServices = await this.handleAssetChange(event);
          break;

        case 'service_change':
          affectedServices = [event.entity_id];
          break;

        case 'vulnerability_discovery':
          affectedServices = await this.handleVulnerabilityDiscovery(event);
          break;

        case 'threat_intelligence':
          affectedServices = await this.handleThreatIntelligenceUpdate(event);
          break;

        case 'compliance_update':
          affectedServices = await this.handleComplianceUpdate(event);
          break;

        default:
          console.warn(`Unknown event type: ${event.type}`);
          return null;
      }

      // Recalculate risk scores for affected services
      for (const serviceId of affectedServices) {
        const changeResult = await this.recalculateServiceRisk(serviceId, event);
        if (changeResult) {
          riskChanges.push(changeResult);
        }
      }

      // Return the most significant change (highest magnitude)
      if (riskChanges.length > 0) {
        return riskChanges.sort((a, b) => b.risk_change.change_magnitude - a.risk_change.change_magnitude)[0];
      }

      return null;

    } catch (error) {
      console.error(`Error processing event ${event.id}:`, error);
      throw error;
    }
  }

  /**
   * Handle asset change events
   */
  private async handleAssetChange(event: RiskUpdateEvent): Promise<number[]> {
    try {
      // Get services affected by this asset
      const affectedServices = await this.db.prepare(`
        SELECT DISTINCT service_id 
        FROM service_asset_relationships 
        WHERE asset_id = ?
      `).bind(event.entity_id).all();

      // If asset criticality or status changed, trigger risk discovery
      if (event.change_type === 'update' && event.data.criticality_changed) {
        await this.discoveryEngine.discoverRisksForAsset(event.entity_id);
      }

      return (affectedServices.results || []).map(row => row.service_id);

    } catch (error) {
      console.error(`Error handling asset change for asset ${event.entity_id}:`, error);
      return [];
    }
  }

  /**
   * Handle vulnerability discovery events
   */
  private async handleVulnerabilityDiscovery(event: RiskUpdateEvent): Promise<number[]> {
    try {
      // Create new dynamic risk from vulnerability
      const vulnerabilityData = event.data;
      
      await this.db.prepare(`
        INSERT INTO dynamic_risks (
          asset_id, service_id, risk_type, severity_score, likelihood_score,
          business_impact_score, confidentiality_impact, integrity_impact,
          availability_impact, description, source, ml_confidence, status,
          discovered_at, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        vulnerabilityData.asset_id,
        vulnerabilityData.service_id,
        'vulnerability',
        vulnerabilityData.severity || 7,
        vulnerabilityData.likelihood || 6,
        vulnerabilityData.business_impact || 6,
        vulnerabilityData.confidentiality_impact || 7,
        vulnerabilityData.integrity_impact || 6,
        vulnerabilityData.availability_impact || 5,
        vulnerabilityData.description,
        event.source,
        vulnerabilityData.confidence || 0.85,
        'active',
        new Date().toISOString(),
        new Date().toISOString()
      ).run();

      // Get affected services
      if (vulnerabilityData.asset_id) {
        const affectedServices = await this.db.prepare(`
          SELECT DISTINCT service_id 
          FROM service_asset_relationships 
          WHERE asset_id = ?
        `).bind(vulnerabilityData.asset_id).all();

        return (affectedServices.results || []).map(row => row.service_id);
      }

      return vulnerabilityData.service_id ? [vulnerabilityData.service_id] : [];

    } catch (error) {
      console.error(`Error handling vulnerability discovery:`, error);
      return [];
    }
  }

  /**
   * Handle threat intelligence updates
   */
  private async handleThreatIntelligenceUpdate(event: RiskUpdateEvent): Promise<number[]> {
    try {
      const threatData = event.data;
      
      // Find assets/services matching threat indicators
      const matchingAssets = await this.db.prepare(`
        SELECT DISTINCT a.id, sar.service_id
        FROM assets a
        LEFT JOIN service_asset_relationships sar ON a.id = sar.asset_id
        WHERE a.asset_type IN (${threatData.affected_asset_types?.map(() => '?').join(',') || '?'})
      `).bind(...(threatData.affected_asset_types || [''])).all();

      // Update or create threat-based risks
      for (const asset of matchingAssets.results || []) {
        await this.db.prepare(`
          INSERT OR REPLACE INTO dynamic_risks (
            asset_id, service_id, risk_type, severity_score, likelihood_score,
            business_impact_score, confidentiality_impact, integrity_impact,
            availability_impact, description, source, ml_confidence, status,
            discovered_at, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          asset.id,
          asset.service_id,
          'threat',
          threatData.severity || 8,
          threatData.likelihood || 7,
          threatData.business_impact || 7,
          threatData.confidentiality_impact || 8,
          threatData.integrity_impact || 7,
          threatData.availability_impact || 6,
          `Threat intelligence: ${threatData.description}`,
          event.source,
          threatData.confidence || 0.80,
          'active',
          new Date().toISOString(),
          new Date().toISOString()
        ).run();
      }

      return [...new Set((matchingAssets.results || []).map(row => row.service_id).filter(Boolean))];

    } catch (error) {
      console.error(`Error handling threat intelligence update:`, error);
      return [];
    }
  }

  /**
   * Handle compliance update events
   */
  private async handleComplianceUpdate(event: RiskUpdateEvent): Promise<number[]> {
    try {
      const complianceData = event.data;
      
      // Get all services affected by compliance changes
      const affectedServices = await this.db.prepare(`
        SELECT id FROM business_services 
        WHERE compliance_frameworks LIKE ?
      `).bind(`%${complianceData.framework}%`).all();

      // Update compliance-related risks
      for (const service of affectedServices.results || []) {
        await this.db.prepare(`
          INSERT OR REPLACE INTO dynamic_risks (
            service_id, risk_type, severity_score, likelihood_score,
            business_impact_score, confidentiality_impact, integrity_impact,
            availability_impact, description, source, ml_confidence, status,
            discovered_at, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          service.id,
          'compliance',
          complianceData.severity || 6,
          complianceData.likelihood || 5,
          complianceData.business_impact || 8,
          complianceData.confidentiality_impact || 6,
          complianceData.integrity_impact || 7,
          complianceData.availability_impact || 5,
          `Compliance update: ${complianceData.description}`,
          event.source,
          complianceData.confidence || 0.90,
          'active',
          new Date().toISOString(),
          new Date().toISOString()
        ).run();
      }

      return (affectedServices.results || []).map(row => row.id);

    } catch (error) {
      console.error(`Error handling compliance update:`, error);
      return [];
    }
  }

  /**
   * Recalculate service risk and detect significant changes
   */
  private async recalculateServiceRisk(serviceId: number, triggerEvent: RiskUpdateEvent): Promise<RiskChangeNotification | null> {
    try {
      // Get previous risk score
      const previousScore = await this.db.prepare(`
        SELECT overall_score FROM risk_score_history 
        WHERE service_id = ? 
        ORDER BY computed_at DESC 
        LIMIT 1
      `).bind(serviceId).first();

      // Recalculate current risk score
      const currentProfile = await this.riskScoringEngine.calculateServiceRiskScore(serviceId);

      const previousScoreValue = previousScore?.overall_score || 0;
      const currentScoreValue = currentProfile.current_score.overall;
      const changeMagnitude = Math.abs(currentScoreValue - previousScoreValue);

      // Only notify for significant changes (threshold: 10 points or 20% change)
      const significanceThreshold = Math.max(10, previousScoreValue * 0.2);
      
      if (changeMagnitude >= significanceThreshold) {
        return {
          service_id: serviceId,
          service_name: currentProfile.service_name,
          risk_change: {
            previous_score: previousScoreValue,
            current_score: currentScoreValue,
            change_magnitude: changeMagnitude,
            change_direction: currentScoreValue > previousScoreValue ? 'increase' : 'decrease'
          },
          trigger_events: [triggerEvent.id],
          affected_assets: [], // Will be populated by caller if needed
          notification_priority: this.calculateNotificationPriority(changeMagnitude, currentScoreValue),
          created_at: new Date().toISOString()
        };
      }

      return null;

    } catch (error) {
      console.error(`Error recalculating service risk for service ${serviceId}:`, error);
      return null;
    }
  }

  /**
   * Calculate notification priority based on change magnitude and score
   */
  private calculateNotificationPriority(changeMagnitude: number, currentScore: number): 'critical' | 'high' | 'medium' | 'low' {
    if (currentScore >= 80 && changeMagnitude >= 20) return 'critical';
    if (currentScore >= 70 || changeMagnitude >= 15) return 'high';
    if (currentScore >= 50 || changeMagnitude >= 10) return 'medium';
    return 'low';
  }

  /**
   * Generate and store risk change notifications
   */
  private async generateRiskChangeNotifications(changes: RiskChangeNotification[]): Promise<void> {
    try {
      for (const change of changes) {
        await this.db.prepare(`
          INSERT INTO risk_change_notifications (
            service_id, service_name, previous_score, current_score,
            change_magnitude, change_direction, trigger_events,
            notification_priority, created_at, acknowledged
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, false)
        `).bind(
          change.service_id,
          change.service_name,
          change.risk_change.previous_score,
          change.risk_change.current_score,
          change.risk_change.change_magnitude,
          change.risk_change.change_direction,
          JSON.stringify(change.trigger_events),
          change.notification_priority,
          change.created_at
        ).run();

        console.log(`Generated ${change.notification_priority} priority notification for service ${change.service_name} (score change: ${change.risk_change.previous_score} → ${change.risk_change.current_score})`);
      }

    } catch (error) {
      console.error('Error generating risk change notifications:', error);
    }
  }

  /**
   * Queue a new risk update event
   */
  async queueRiskUpdateEvent(event: Omit<RiskUpdateEvent, 'id' | 'timestamp' | 'processed'>): Promise<string> {
    try {
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const timestamp = new Date().toISOString();

      await this.db.prepare(`
        INSERT INTO risk_update_events (
          id, type, source, entity_type, entity_id, change_type,
          priority, data, timestamp, processed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, false)
      `).bind(
        eventId,
        event.type,
        event.source,
        event.entity_type,
        event.entity_id,
        event.change_type,
        event.priority,
        JSON.stringify(event.data),
        timestamp
      ).run();

      console.log(`Queued risk update event ${eventId} - ${event.type} for ${event.entity_type} ${event.entity_id}`);
      return eventId;

    } catch (error) {
      console.error('Error queuing risk update event:', error);
      throw error;
    }
  }

  /**
   * Get processing metrics and SLA compliance
   */
  async getProcessingMetrics(): Promise<ProcessingMetrics> {
    try {
      const metrics = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_events,
          SUM(CASE WHEN processed = true THEN 1 ELSE 0 END) as processed_events,
          SUM(CASE WHEN error IS NOT NULL THEN 1 ELSE 0 END) as failed_events,
          AVG(
            CASE 
              WHEN processing_completed_at IS NOT NULL AND processing_started_at IS NOT NULL
              THEN (julianday(processing_completed_at) - julianday(processing_started_at)) * 86400000
            END
          ) as average_processing_time,
          SUM(
            CASE 
              WHEN processing_completed_at IS NOT NULL 
              AND (julianday(processing_completed_at) - julianday(timestamp)) * 86400000 < 900000
              THEN 1 ELSE 0 
            END
          ) as events_under_15min,
          MAX(processing_completed_at) as last_processing_cycle
        FROM risk_update_events
        WHERE timestamp >= datetime('now', '-24 hours')
      `).first();

      const totalEvents = metrics?.total_events || 0;
      const eventsUnder15Min = metrics?.events_under_15min || 0;
      const slaComplianceRate = totalEvents > 0 ? (eventsUnder15Min / totalEvents) * 100 : 100;

      return {
        total_events: totalEvents,
        processed_events: metrics?.processed_events || 0,
        failed_events: metrics?.failed_events || 0,
        average_processing_time: Math.round(metrics?.average_processing_time || 0),
        events_under_15min: eventsUnder15Min,
        sla_compliance_rate: Math.round(slaComplianceRate * 100) / 100,
        last_processing_cycle: metrics?.last_processing_cycle || new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting processing metrics:', error);
      throw error;
    }
  }

  /**
   * Helper methods for event management
   */
  private async markEventProcessingStarted(eventId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE risk_update_events 
      SET processing_started_at = ? 
      WHERE id = ?
    `).bind(new Date().toISOString(), eventId).run();
  }

  private async markEventProcessed(eventId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE risk_update_events 
      SET processed = true, processing_completed_at = ? 
      WHERE id = ?
    `).bind(new Date().toISOString(), eventId).run();
  }

  private async markEventFailed(eventId: string, error: string): Promise<void> {
    await this.db.prepare(`
      UPDATE risk_update_events 
      SET processed = true, processing_completed_at = ?, error = ? 
      WHERE id = ?
    `).bind(new Date().toISOString(), error, eventId).run();
  }

  private async updateProcessingMetrics(results: any): Promise<void> {
    // Implementation for updating processing metrics
    // This could update a separate metrics table or cache
  }

  private mapEventFromDB(row: any): RiskUpdateEvent {
    return {
      id: row.id,
      type: row.type,
      source: row.source,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      change_type: row.change_type,
      priority: row.priority,
      data: JSON.parse(row.data || '{}'),
      timestamp: row.timestamp,
      processed: row.processed,
      processing_started_at: row.processing_started_at,
      processing_completed_at: row.processing_completed_at,
      error: row.error
    };
  }

  /**
   * Get recent risk change notifications
   */
  async getRecentNotifications(limit: number = 50): Promise<RiskChangeNotification[]> {
    try {
      const notifications = await this.db.prepare(`
        SELECT * FROM risk_change_notifications 
        ORDER BY created_at DESC 
        LIMIT ?
      `).bind(limit).all();

      return (notifications.results || []).map(row => ({
        service_id: row.service_id,
        service_name: row.service_name,
        risk_change: {
          previous_score: row.previous_score,
          current_score: row.current_score,
          change_magnitude: row.change_magnitude,
          change_direction: row.change_direction
        },
        trigger_events: JSON.parse(row.trigger_events || '[]'),
        affected_assets: JSON.parse(row.affected_assets || '[]'),
        notification_priority: row.notification_priority,
        created_at: row.created_at
      }));

    } catch (error) {
      console.error('Error getting recent notifications:', error);
      return [];
    }
  }
}