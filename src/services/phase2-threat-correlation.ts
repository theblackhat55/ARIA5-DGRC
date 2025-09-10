/**
 * Phase 2 - Real-Time Threat Correlation System
 * 
 * Advanced threat correlation engine that builds on ARIA5.1's threat intelligence:
 * - Cross-platform threat correlation
 * - Real-time attack pattern recognition
 * - Automated incident response triggers
 * - Threat actor attribution
 * - Campaign tracking and analysis
 */

// AI integration via Cloudflare Workers AI
import { EnhancedThreatIntelligenceService } from './enhanced-threat-intelligence';

export interface ThreatCorrelationEvent {
  event_id: string;
  source_platform: string;
  event_type: 'ioc_detection' | 'behavioral_anomaly' | 'security_alert' | 'vulnerability' | 'incident';
  timestamp: string;
  raw_data: any;
  normalized_data: {
    threat_indicators: string[];
    severity: number;
    confidence: number;
    affected_assets: string[];
  };
}

export interface CorrelationResult {
  correlation_id: string;
  event_cluster: ThreatCorrelationEvent[];
  attack_pattern: {
    pattern_name: string;
    confidence: number;
    tactics: string[];
    techniques: string[];
    indicators: string[];
  };
  threat_actor: {
    attributed_group: string | null;
    confidence: number;
    historical_patterns: string[];
  };
  campaign_analysis: {
    campaign_id: string | null;
    campaign_confidence: number;
    related_incidents: string[];
    timeline: string;
  };
  risk_assessment: {
    overall_severity: number;
    business_impact: number;
    urgency_level: 'critical' | 'high' | 'medium' | 'low';
    affected_services: string[];
  };
  recommended_actions: {
    immediate: string[];
    tactical: string[];
    strategic: string[];
  };
}

export interface AttackPattern {
  pattern_id: string;
  pattern_name: string;
  mitre_tactics: string[];
  mitre_techniques: string[];
  typical_indicators: string[];
  detection_signatures: string[];
  confidence_threshold: number;
}

export interface ThreatActor {
  actor_id: string;
  actor_name: string;
  aliases: string[];
  typical_ttps: string[];
  target_industries: string[];
  geographical_focus: string[];
  attribution_indicators: string[];
}

export class Phase2ThreatCorrelation {
  private db: D1Database;
  private env: any;
  private threatIntel: EnhancedThreatIntelligenceService;
  private correlationWindow: number = 3600000; // 1 hour correlation window
  private confidenceThreshold: number = 0.7;

  constructor(db: D1Database, env: any) {
    this.db = db;
    this.env = env;
    this.threatIntel = new EnhancedThreatIntelligenceService(db);
  }

  /**
   * Process real-time security events for correlation
   */
  async processSecurityEvent(event: ThreatCorrelationEvent): Promise<{
    success: boolean;
    correlation_results: CorrelationResult[];
    immediate_response_required: boolean;
    error?: string;
  }> {
    try {
      console.log(`🔗 Processing security event for correlation: ${event.event_id}`);

      // Store the event
      await this.storeSecurityEvent(event);

      // Find related events within correlation window
      const relatedEvents = await this.findRelatedEvents(event);

      // Perform correlation analysis
      const correlationResults = await this.correlateEvents([event, ...relatedEvents]);

      // Check if immediate response is required
      const immediateResponse = correlationResults.some(
        result => result.risk_assessment.urgency_level === 'critical'
      );

      // Trigger automated responses if needed
      if (immediateResponse) {
        await this.triggerAutomatedResponse(correlationResults);
      }

      // Update threat intelligence feeds
      await this.updateThreatIntelligence(correlationResults);

      return {
        success: true,
        correlation_results: correlationResults,
        immediate_response_required: immediateResponse
      };

    } catch (error) {
      console.error('❌ Error processing security event:', error);
      return {
        success: false,
        correlation_results: [],
        immediate_response_required: false,
        error: error.message
      };
    }
  }

  /**
   * Perform advanced threat correlation on a cluster of events
   */
  private async correlateEvents(events: ThreatCorrelationEvent[]): Promise<CorrelationResult[]> {
    console.log(`🧠 Correlating ${events.length} security events...`);

    const correlationResults: CorrelationResult[] = [];

    try {
      // Group events by potential correlation patterns
      const eventClusters = await this.clusterEvents(events);

      for (const cluster of eventClusters) {
        // Analyze each cluster for attack patterns
        const attackPattern = await this.identifyAttackPattern(cluster);
        
        // Perform threat actor attribution
        const threatActor = await this.attributeThreatActor(cluster, attackPattern);
        
        // Analyze campaign associations
        const campaignAnalysis = await this.analyzeCampaignAssociation(cluster);
        
        // Assess risk and business impact
        const riskAssessment = await this.assessCorrelatedRisk(cluster);
        
        // Generate actionable recommendations
        const recommendations = await this.generateCorrelationRecommendations(
          cluster, attackPattern, threatActor, riskAssessment
        );

        const correlationResult: CorrelationResult = {
          correlation_id: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_cluster: cluster,
          attack_pattern: attackPattern,
          threat_actor: threatActor,
          campaign_analysis: campaignAnalysis,
          risk_assessment: riskAssessment,
          recommended_actions: recommendations
        };

        correlationResults.push(correlationResult);

        // Store correlation result
        await this.storeCorrelationResult(correlationResult);
      }

      return correlationResults;

    } catch (error) {
      console.error('❌ Error in event correlation:', error);
      return [];
    }
  }

  /**
   * Identify attack patterns using AI and MITRE ATT&CK framework
   */
  private async identifyAttackPattern(events: ThreatCorrelationEvent[]): Promise<{
    pattern_name: string;
    confidence: number;
    tactics: string[];
    techniques: string[];
    indicators: string[];
  }> {
    try {
      // Extract indicators and behaviors from events
      const indicators = events.flatMap(e => e.normalized_data.threat_indicators);
      const eventTypes = events.map(e => e.event_type);
      const timespan = this.calculateTimespan(events);

      // Use AI for pattern recognition
      const aiAnalysis = await this.generateAIResponse(`
        You are a cybersecurity threat pattern analyst. Analyze the following correlated security events and identify the attack pattern using the MITRE ATT&CK framework.

        Events: ${events.length} correlated events
        Event Types: ${eventTypes.join(', ')}
        Threat Indicators: ${indicators.slice(0, 10).join(', ')}
        Time Span: ${timespan} minutes
        
        Identify the most likely attack pattern and map to MITRE ATT&CK tactics and techniques.
        
        Required JSON response format:
        {
          "pattern_name": "Lateral Movement via Remote Services",
          "confidence": 0.85,
          "tactics": ["Initial Access", "Lateral Movement", "Persistence"],
          "techniques": ["T1078", "T1021", "T1053"],
          "indicators": ["unusual_login_patterns", "privileged_account_usage", "scheduled_task_creation"]
        }
      `, { temperature: 0.1, model_preference: 'reasoning' });

      if (!aiAnalysis.success) {
        throw new Error('Attack pattern analysis failed');
      }

      return JSON.parse(aiAnalysis.response);

    } catch (error) {
      console.error('❌ Error identifying attack pattern:', error);
      return {
        pattern_name: 'Unknown Pattern',
        confidence: 0,
        tactics: [],
        techniques: [],
        indicators: []
      };
    }
  }

  /**
   * Perform threat actor attribution using behavioral analysis
   */
  private async attributeThreatActor(
    events: ThreatCorrelationEvent[], 
    attackPattern: any
  ): Promise<{
    attributed_group: string | null;
    confidence: number;
    historical_patterns: string[];
  }> {
    try {
      // Get historical threat actor data
      const knownActors = await this.getKnownThreatActors();
      
      // Extract TTPs and behavioral indicators
      const ttps = attackPattern.techniques;
      const indicators = events.flatMap(e => e.normalized_data.threat_indicators);

      // Use AI for threat actor attribution
      const aiAnalysis = await this.generateAIResponse(`
        You are a threat intelligence analyst specializing in threat actor attribution. Analyze the attack patterns and behaviors to identify potential threat actors.

        Attack Pattern: ${attackPattern.pattern_name}
        MITRE Techniques: ${ttps.join(', ')}
        Indicators: ${indicators.slice(0, 15).join(', ')}
        Known Threat Actors: ${JSON.stringify(knownActors.slice(0, 5))}
        
        Determine the most likely threat actor attribution based on TTPs and behavioral patterns.
        
        Required JSON response format:
        {
          "attributed_group": "APT29" or null,
          "confidence": 0.72,
          "historical_patterns": ["previous_campaign_similarity", "ttp_overlap", "infrastructure_reuse"]
        }
      `, { temperature: 0.1, model_preference: 'reasoning' });

      if (!aiAnalysis.success) {
        throw new Error('Threat actor attribution failed');
      }

      return JSON.parse(aiAnalysis.response);

    } catch (error) {
      console.error('❌ Error in threat actor attribution:', error);
      return {
        attributed_group: null,
        confidence: 0,
        historical_patterns: []
      };
    }
  }

  /**
   * Analyze campaign associations and track ongoing operations
   */
  private async analyzeCampaignAssociation(events: ThreatCorrelationEvent[]): Promise<{
    campaign_id: string | null;
    campaign_confidence: number;
    related_incidents: string[];
    timeline: string;
  }> {
    try {
      // Look for existing campaigns with similar patterns
      const existingCampaigns = await this.db.prepare(`
        SELECT campaign_id, campaign_name, indicators, timeline
        FROM threat_campaigns
        WHERE status = 'active'
        ORDER BY created_at DESC
        LIMIT 10
      `).all();

      const indicators = events.flatMap(e => e.normalized_data.threat_indicators);
      const timeline = this.calculateEventTimeline(events);

      // Use AI to identify campaign associations
      const aiAnalysis = await this.generateAIResponse(`
        You are a threat campaign analyst. Analyze security events to determine if they belong to an existing campaign or represent a new campaign.

        Current Events Timeline: ${timeline}
        Event Indicators: ${indicators.join(', ')}
        Existing Campaigns: ${JSON.stringify(existingCampaigns.results || [])}
        
        Determine campaign association and tracking information.
        
        Required JSON response format:
        {
          "campaign_id": "CAMP_2025_001" or null,
          "campaign_confidence": 0.68,
          "related_incidents": ["INC_001", "INC_002"],
          "timeline": "2025-09-01 to ongoing"
        }
      `, { temperature: 0.1, model_preference: 'reasoning' });

      if (!aiAnalysis.success) {
        throw new Error('Campaign analysis failed');
      }

      return JSON.parse(aiAnalysis.response);

    } catch (error) {
      console.error('❌ Error in campaign analysis:', error);
      return {
        campaign_id: null,
        campaign_confidence: 0,
        related_incidents: [],
        timeline: ''
      };
    }
  }

  /**
   * Assess correlated risk and business impact
   */
  private async assessCorrelatedRisk(events: ThreatCorrelationEvent[]): Promise<{
    overall_severity: number;
    business_impact: number;
    urgency_level: 'critical' | 'high' | 'medium' | 'low';
    affected_services: string[];
  }> {
    try {
      // Calculate aggregated severity
      const maxSeverity = Math.max(...events.map(e => e.normalized_data.severity));
      const avgConfidence = events.reduce((sum, e) => sum + e.normalized_data.confidence, 0) / events.length;
      
      // Get affected services
      const affectedServices = [...new Set(events.flatMap(e => e.normalized_data.affected_assets))];
      
      // Get service criticality data
      const serviceData = await this.getServiceCriticalityData(affectedServices);
      
      // Calculate business impact
      const businessImpact = this.calculateBusinessImpact(affectedServices, serviceData, maxSeverity);
      
      // Determine urgency level
      const urgencyLevel = this.determineUrgencyLevel(maxSeverity, businessImpact, avgConfidence);

      return {
        overall_severity: maxSeverity,
        business_impact: businessImpact,
        urgency_level: urgencyLevel,
        affected_services: affectedServices
      };

    } catch (error) {
      console.error('❌ Error assessing correlated risk:', error);
      return {
        overall_severity: 0,
        business_impact: 0,
        urgency_level: 'low',
        affected_services: []
      };
    }
  }

  /**
   * Find related events within correlation window
   */
  private async findRelatedEvents(event: ThreatCorrelationEvent): Promise<ThreatCorrelationEvent[]> {
    const windowStart = new Date(Date.now() - this.correlationWindow).toISOString();
    
    const relatedEvents = await this.db.prepare(`
      SELECT * FROM security_events
      WHERE timestamp > ?
        AND event_id != ?
        AND (
          source_platform = ? OR
          JSON_EXTRACT(normalized_data, '$.threat_indicators') LIKE '%' || ? || '%'
        )
      ORDER BY timestamp DESC
      LIMIT 50
    `).bind(
      windowStart,
      event.event_id,
      event.source_platform,
      event.normalized_data.threat_indicators[0] || ''
    ).all();

    return (relatedEvents.results || []).map(r => ({
      event_id: r.event_id,
      source_platform: r.source_platform,
      event_type: r.event_type,
      timestamp: r.timestamp,
      raw_data: JSON.parse(r.raw_data),
      normalized_data: JSON.parse(r.normalized_data)
    }));
  }

  /**
   * Cluster events by correlation patterns
   */
  private async clusterEvents(events: ThreatCorrelationEvent[]): Promise<ThreatCorrelationEvent[][]> {
    // Simple clustering based on time proximity and indicator similarity
    const clusters: ThreatCorrelationEvent[][] = [];
    const processed = new Set();

    for (const event of events) {
      if (processed.has(event.event_id)) continue;

      const cluster = [event];
      processed.add(event.event_id);

      // Find events with similar indicators or close timing
      for (const otherEvent of events) {
        if (processed.has(otherEvent.event_id)) continue;

        const timeDiff = Math.abs(
          new Date(event.timestamp).getTime() - new Date(otherEvent.timestamp).getTime()
        );
        
        const indicatorOverlap = this.calculateIndicatorOverlap(
          event.normalized_data.threat_indicators,
          otherEvent.normalized_data.threat_indicators
        );

        // Group if within 30 minutes and has indicator overlap > 50%
        if (timeDiff < 1800000 && indicatorOverlap > 0.5) {
          cluster.push(otherEvent);
          processed.add(otherEvent.event_id);
        }
      }

      if (cluster.length > 0) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  // Helper methods...

  private calculateTimespan(events: ThreatCorrelationEvent[]): number {
    if (events.length <= 1) return 0;
    
    const timestamps = events.map(e => new Date(e.timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    
    return Math.round((maxTime - minTime) / 60000); // Return minutes
  }

  private calculateEventTimeline(events: ThreatCorrelationEvent[]): string {
    if (events.length === 0) return '';
    
    const timestamps = events.map(e => new Date(e.timestamp));
    const minTime = new Date(Math.min(...timestamps.map(t => t.getTime())));
    const maxTime = new Date(Math.max(...timestamps.map(t => t.getTime())));
    
    return `${minTime.toISOString().split('T')[0]} to ${maxTime.toISOString().split('T')[0]}`;
  }

  private calculateIndicatorOverlap(indicators1: string[], indicators2: string[]): number {
    const set1 = new Set(indicators1);
    const set2 = new Set(indicators2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    return intersection.size / Math.max(set1.size, set2.size);
  }

  private async getKnownThreatActors(): Promise<any[]> {
    const actors = await this.db.prepare(`
      SELECT actor_name, ttps, attribution_indicators
      FROM threat_actors
      WHERE status = 'active'
      ORDER BY last_seen DESC
      LIMIT 20
    `).all();

    return actors.results || [];
  }

  private async getServiceCriticalityData(services: string[]): Promise<any[]> {
    if (services.length === 0) return [];
    
    const placeholders = services.map(() => '?').join(',');
    const serviceData = await this.db.prepare(`
      SELECT service_id, name, criticality_score, business_impact
      FROM services
      WHERE service_id IN (${placeholders})
    `).bind(...services).all();

    return serviceData.results || [];
  }

  private calculateBusinessImpact(services: string[], serviceData: any[], severity: number): number {
    if (serviceData.length === 0) return severity * 0.5;
    
    const avgCriticality = serviceData.reduce((sum, s) => sum + (s.criticality_score || 5), 0) / serviceData.length;
    return Math.min(10, (severity * avgCriticality) / 10);
  }

  private determineUrgencyLevel(severity: number, businessImpact: number, confidence: number): 'critical' | 'high' | 'medium' | 'low' {
    const combinedScore = (severity * 0.4 + businessImpact * 0.4 + confidence * 10 * 0.2);
    
    if (combinedScore >= 8.5) return 'critical';
    if (combinedScore >= 7.0) return 'high';
    if (combinedScore >= 5.0) return 'medium';
    return 'low';
  }

  private async generateCorrelationRecommendations(
    events: ThreatCorrelationEvent[],
    attackPattern: any,
    threatActor: any,
    riskAssessment: any
  ): Promise<{ immediate: string[]; tactical: string[]; strategic: string[]; }> {
    
    const immediate = [];
    const tactical = [];
    const strategic = [];

    // Generate recommendations based on urgency and attack pattern
    if (riskAssessment.urgency_level === 'critical') {
      immediate.push('Activate incident response team');
      immediate.push('Isolate affected systems');
      immediate.push('Preserve forensic evidence');
    }

    if (attackPattern.confidence > 0.7) {
      tactical.push(`Implement countermeasures for ${attackPattern.pattern_name}`);
      tactical.push(`Monitor for additional ${attackPattern.tactics.join(', ')} activities`);
    }

    if (threatActor.attributed_group) {
      strategic.push(`Enhance defenses against ${threatActor.attributed_group} TTPs`);
      strategic.push('Review threat intelligence feeds for this actor');
    }

    return { immediate, tactical, strategic };
  }

  private async storeSecurityEvent(event: ThreatCorrelationEvent): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT OR REPLACE INTO security_events
        (event_id, source_platform, event_type, timestamp, raw_data, normalized_data)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        event.event_id,
        event.source_platform,
        event.event_type,
        event.timestamp,
        JSON.stringify(event.raw_data),
        JSON.stringify(event.normalized_data)
      ).run();
    } catch (error) {
      console.error('Error storing security event:', error);
    }
  }

  private async storeCorrelationResult(result: CorrelationResult): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT OR REPLACE INTO threat_correlations
        (correlation_id, event_count, attack_pattern, threat_actor, risk_level, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        result.correlation_id,
        result.event_cluster.length,
        JSON.stringify(result.attack_pattern),
        JSON.stringify(result.threat_actor),
        result.risk_assessment.urgency_level,
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('Error storing correlation result:', error);
    }
  }

  private async triggerAutomatedResponse(results: CorrelationResult[]): Promise<void> {
    // Trigger automated incident response for critical threats
    console.log('🚨 Triggering automated response for critical threats...');
    
    for (const result of results) {
      if (result.risk_assessment.urgency_level === 'critical') {
        // Create incident record
        await this.db.prepare(`
          INSERT INTO incidents
          (incident_id, correlation_id, severity, status, created_at)
          VALUES (?, ?, ?, 'active', ?)
        `).bind(
          `INC_${Date.now()}`,
          result.correlation_id,
          result.risk_assessment.overall_severity,
          new Date().toISOString()
        ).run();

        console.log(`✅ Created incident for correlation ${result.correlation_id}`);
      }
    }
  }

  private async updateThreatIntelligence(results: CorrelationResult[]): Promise<void> {
    // Update threat intelligence with new indicators and patterns
    for (const result of results) {
      if (result.attack_pattern.confidence > this.confidenceThreshold) {
        // Store new attack pattern
        await this.db.prepare(`
          INSERT OR REPLACE INTO attack_patterns
          (pattern_name, mitre_tactics, mitre_techniques, confidence, last_seen)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          result.attack_pattern.pattern_name,
          JSON.stringify(result.attack_pattern.tactics),
          JSON.stringify(result.attack_pattern.techniques),
          result.attack_pattern.confidence,
          new Date().toISOString()
        ).run();
      }
    }
  }

  /**
   * Helper method to generate AI responses using Cloudflare Workers AI
   */
  private async generateAIResponse(prompt: string, options?: any): Promise<{success: boolean; response: string; error?: string}> {
    try {
      if (!this.env.AI) {
        throw new Error('AI service not available');
      }

      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: 'You are a cybersecurity threat analysis AI. Provide accurate threat intelligence in valid JSON format.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2048,
        temperature: options?.temperature || 0.1
      });

      if (!response || !response.response) {
        throw new Error('Empty AI response');
      }

      return {
        success: true,
        response: response.response
      };

    } catch (error) {
      console.error('AI generation error:', error);
      return {
        success: false,
        response: '',
        error: error.message
      };
    }
  }
}