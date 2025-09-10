/**
 * Dynamic Risk Discovery Engine
 * 
 * Vision-aligned auto-generation of risks from operational sources
 * Target: 90%+ dynamic risk coverage (auto-generated vs manual entry)
 */

export interface DynamicRisk {
  id?: number;
  source_system: 'manual' | 'defender' | 'servicenow' | 'jira' | 'threat_intel' | 'asset_monitor';
  source_id?: string;
  source_url?: string;
  confidence_score: number; // 0.0 - 1.0 ML confidence
  auto_generated: boolean;
  approval_status: 'pending' | 'auto_approved' | 'manually_approved' | 'rejected' | 'under_review';
  title: string;
  description: string;
  category: string;
  severity_level: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number; // 1-100
  impact: number; // 1-100
  service_id?: number;
  asset_id?: number;
  status: 'active' | 'closed' | 'on_hold' | 'transferred';
  assigned_to?: string;
}

export interface RiskGenerationResult {
  risks_generated: number;
  auto_approved: number;
  pending_review: number;
  confidence_scores: number[];
  processing_time_ms: number;
  source_breakdown: Record<string, number>;
}

export class DynamicRiskDiscoveryEngine {
  constructor(
    private db: D1Database,
    private env: any
  ) {}

  /**
   * Main risk discovery orchestration - runs every 15 minutes
   * Coordinates all automated risk generation sources
   */
  async discoverRisks(): Promise<RiskGenerationResult> {
    const startTime = Date.now();
    const results: DynamicRisk[] = [];
    const sourceBreakdown: Record<string, number> = {};

    try {
      console.log('🔍 Starting dynamic risk discovery cycle...');

      // 1. Microsoft Defender Integration (Security Incidents → Risks)
      const defenderRisks = await this.discoverDefenderRisks();
      results.push(...defenderRisks);
      sourceBreakdown['defender'] = defenderRisks.length;

      // 2. ServiceNow Integration (ITSM Tickets → Risks) 
      const servicenowRisks = await this.discoverServiceNowRisks();
      results.push(...servicenowRisks);
      sourceBreakdown['servicenow'] = servicenowRisks.length;

      // 3. Jira Integration (Project Issues → Risks)
      const jiraRisks = await this.discoverJiraRisks();
      results.push(...jiraRisks);
      sourceBreakdown['jira'] = jiraRisks.length;

      // 4. Threat Intelligence (IOCs → High-confidence Risks)
      const threatIntelRisks = await this.discoverThreatIntelRisks();
      results.push(...threatIntelRisks);
      sourceBreakdown['threat_intel'] = threatIntelRisks.length;

      // 5. Asset Monitoring (Telemetry → Risk Candidates)
      const assetRisks = await this.discoverAssetRisks();
      results.push(...assetRisks);
      sourceBreakdown['asset_monitor'] = assetRisks.length;

      // 6. Process and store discovered risks
      const processingResult = await this.processDiscoveredRisks(results);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Risk discovery completed in ${processingTime}ms - Generated ${results.length} risks`);

      return {
        risks_generated: results.length,
        auto_approved: processingResult.auto_approved,
        pending_review: processingResult.pending_review,
        confidence_scores: results.map(r => r.confidence_score),
        processing_time_ms: processingTime,
        source_breakdown: sourceBreakdown
      };

    } catch (error) {
      console.error('❌ Dynamic risk discovery failed:', error);
      throw error;
    }
  }

  /**
   * Microsoft Defender Integration - Security incidents become pending risks
   * High-severity security events automatically generate high-confidence risks
   */
  private async discoverDefenderRisks(): Promise<DynamicRisk[]> {
    const risks: DynamicRisk[] = [];

    try {
      // Check if Defender integration is active
      const integration = await this.db.prepare(`
        SELECT * FROM integration_sources 
        WHERE source_name = 'microsoft_defender' AND is_active = TRUE
      `).first();

      if (!integration) {
        console.log('ℹ️ Microsoft Defender integration not active, skipping...');
        return risks;
      }

      // Simulate Defender API integration (replace with real API calls in production)
      const mockDefenderIncidents = await this.getMockDefenderIncidents();

      for (const incident of mockDefenderIncidents) {
        const risk = await this.convertDefenderIncidentToRisk(incident);
        if (risk) {
          risks.push(risk);
        }
      }

      console.log(`🛡️ Defender: Generated ${risks.length} risks from security incidents`);
      return risks;

    } catch (error) {
      console.error('❌ Defender risk discovery failed:', error);
      return risks;
    }
  }

  /**
   * ServiceNow Integration - ITSM tickets become operational risks
   * Change requests, incidents, and problems generate risk candidates
   */
  private async discoverServiceNowRisks(): Promise<DynamicRisk[]> {
    const risks: DynamicRisk[] = [];

    try {
      const integration = await this.db.prepare(`
        SELECT * FROM integration_sources 
        WHERE source_name = 'servicenow' AND is_active = TRUE
      `).first();

      if (!integration) {
        console.log('ℹ️ ServiceNow integration not active, skipping...');
        return risks;
      }

      // Simulate ServiceNow API integration
      const mockServiceNowTickets = await this.getMockServiceNowTickets();

      for (const ticket of mockServiceNowTickets) {
        const risk = await this.convertServiceNowTicketToRisk(ticket);
        if (risk) {
          risks.push(risk);
        }
      }

      console.log(`🎫 ServiceNow: Generated ${risks.length} risks from ITSM tickets`);
      return risks;

    } catch (error) {
      console.error('❌ ServiceNow risk discovery failed:', error);
      return risks;
    }
  }

  /**
   * Jira Integration - Project issues become risk candidates
   * Security-related issues and high-priority bugs generate risks
   */
  private async discoverJiraRisks(): Promise<DynamicRisk[]> {
    const risks: DynamicRisk[] = [];

    try {
      const integration = await this.db.prepare(`
        SELECT * FROM integration_sources 
        WHERE source_name = 'jira' AND is_active = TRUE
      `).first();

      if (!integration) {
        console.log('ℹ️ Jira integration not active, skipping...');
        return risks;
      }

      // Simulate Jira API integration
      const mockJiraIssues = await this.getMockJiraIssues();

      for (const issue of mockJiraIssues) {
        const risk = await this.convertJiraIssueToRisk(issue);
        if (risk) {
          risks.push(risk);
        }
      }

      console.log(`🎯 Jira: Generated ${risks.length} risks from project issues`);
      return risks;

    } catch (error) {
      console.error('❌ Jira risk discovery failed:', error);
      return risks;
    }
  }

  /**
   * Threat Intelligence Integration - IOCs become high-confidence risks
   * High-confidence threat indicators automatically generate security risks
   */
  private async discoverThreatIntelRisks(): Promise<DynamicRisk[]> {
    const risks: DynamicRisk[] = [];

    try {
      const integration = await this.db.prepare(`
        SELECT * FROM integration_sources 
        WHERE source_name = 'threat_intel' AND is_active = TRUE
      `).first();

      if (!integration) {
        console.log('ℹ️ Threat Intelligence integration not active, skipping...');
        return risks;
      }

      // Simulate threat intelligence feed processing
      const mockThreatIndicators = await this.getMockThreatIndicators();

      for (const indicator of mockThreatIndicators) {
        if (indicator.confidence >= 0.8) { // High-confidence threshold
          const risk = await this.convertThreatIndicatorToRisk(indicator);
          if (risk) {
            risks.push(risk);
          }
        }
      }

      console.log(`🕵️ Threat Intel: Generated ${risks.length} risks from IOCs`);
      return risks;

    } catch (error) {
      console.error('❌ Threat Intelligence risk discovery failed:', error);
      return risks;
    }
  }

  /**
   * Asset Monitoring Integration - Telemetry data creates risk candidates
   * Asset health degradation and anomalies generate operational risks
   */
  private async discoverAssetRisks(): Promise<DynamicRisk[]> {
    const risks: DynamicRisk[] = [];

    try {
      // Asset monitoring is always active for telemetry-based risk generation
      const assets = await this.db.prepare(`
        SELECT * FROM assets 
        WHERE status = 'Active' 
        ORDER BY criticality DESC
        LIMIT 50
      `).all();

      for (const asset of assets.results || []) {
        // Simulate asset health monitoring
        const healthMetrics = await this.getAssetHealthMetrics(asset.id);
        
        if (this.shouldGenerateAssetRisk(healthMetrics)) {
          const risk = await this.convertAssetMetricsToRisk(asset, healthMetrics);
          if (risk) {
            risks.push(risk);
          }
        }
      }

      console.log(`📊 Asset Monitor: Generated ${risks.length} risks from telemetry`);
      return risks;

    } catch (error) {
      console.error('❌ Asset risk discovery failed:', error);
      return risks;
    }
  }

  /**
   * Process discovered risks - Apply approval workflow based on confidence
   */
  private async processDiscoveredRisks(risks: DynamicRisk[]): Promise<{auto_approved: number, pending_review: number}> {
    let autoApproved = 0;
    let pendingReview = 0;

    for (const risk of risks) {
      try {
        // Apply approval logic based on confidence score
        if (risk.confidence_score >= 0.8 && risk.source_system === 'defender') {
          // High confidence security risks - auto approve
          risk.approval_status = 'auto_approved';
          risk.status = 'active';
          autoApproved++;
        } else if (risk.confidence_score >= 0.6) {
          // Medium confidence - queue for review
          risk.approval_status = 'pending';
          pendingReview++;
        } else if (risk.confidence_score < 0.4) {
          // Low confidence - auto reject
          risk.approval_status = 'rejected';
          continue; // Don't store low-confidence risks
        } else {
          // Medium-low confidence - queue for review
          risk.approval_status = 'under_review';
          pendingReview++;
        }

        // Store the risk in database
        await this.storeDynamicRisk(risk);

      } catch (error) {
        console.error('❌ Failed to process risk:', risk.title, error);
      }
    }

    return { auto_approved: autoApproved, pending_review: pendingReview };
  }

  /**
   * Store discovered risk in database with full audit trail
   */
  private async storeDynamicRisk(risk: DynamicRisk): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO dynamic_risks (
        source_system, source_id, source_url, confidence_score, auto_generated,
        approval_status, title, description, category, severity_level,
        probability, impact, service_id, asset_id, status, assigned_to
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      risk.source_system,
      risk.source_id || null,
      risk.source_url || null,
      risk.confidence_score,
      risk.auto_generated,
      risk.approval_status,
      risk.title,
      risk.description,
      risk.category,
      risk.severity_level,
      risk.probability,
      risk.impact,
      risk.service_id || null,
      risk.asset_id || null,
      risk.status,
      risk.assigned_to || null
    ).run();

    return result.meta?.last_row_id as number;
  }

  // Mock data generators for demonstration (replace with real API integrations)
  
  private async getMockDefenderIncidents(): Promise<any[]> {
    return [
      {
        id: 'DEF-2024-001',
        title: 'Suspicious Login Activity Detected',
        description: 'Multiple failed login attempts from unusual geographic locations detected on customer portal',
        severity: 'High',
        confidence: 0.85,
        affected_resource: 'Customer Portal',
        url: 'https://security.microsoft.com/incidents/DEF-2024-001'
      },
      {
        id: 'DEF-2024-002', 
        title: 'Potential Data Exfiltration Attempt',
        description: 'Unusual data access patterns detected in payment processing system',
        severity: 'Critical',
        confidence: 0.92,
        affected_resource: 'Payment Processing',
        url: 'https://security.microsoft.com/incidents/DEF-2024-002'
      }
    ];
  }

  private async getMockServiceNowTickets(): Promise<any[]> {
    return [
      {
        number: 'INC0012345',
        title: 'Database Performance Degradation',
        description: 'Customer portal database showing 50% performance decrease over past 24 hours',
        priority: 'High',
        category: 'Database',
        confidence: 0.7,
        url: 'https://company.service-now.com/incident.do?sys_id=12345'
      }
    ];
  }

  private async getMockJiraIssues(): Promise<any[]> {
    return [
      {
        key: 'SEC-456',
        summary: 'Outdated SSL Certificates on API Gateway',
        description: 'SSL certificates expiring within 30 days, potential service disruption',
        priority: 'Medium',
        confidence: 0.6,
        url: 'https://company.atlassian.net/browse/SEC-456'
      }
    ];
  }

  private async getMockThreatIndicators(): Promise<any[]> {
    return [
      {
        ioc: '192.168.1.100',
        type: 'ip_address',
        threat_type: 'Command and Control',
        confidence: 0.88,
        first_seen: '2024-01-15',
        source: 'CISA KEV'
      }
    ];
  }

  // Conversion methods to transform external data into risk objects

  private async convertDefenderIncidentToRisk(incident: any): Promise<DynamicRisk | null> {
    // Find related service based on affected resource
    const service = await this.findServiceByName(incident.affected_resource);
    
    return {
      source_system: 'defender',
      source_id: incident.id,
      source_url: incident.url,
      confidence_score: incident.confidence,
      auto_generated: true,
      approval_status: 'pending',
      title: incident.title,
      description: incident.description,
      category: 'Security',
      severity_level: incident.severity as any,
      probability: this.severityToProbability(incident.severity),
      impact: service ? service.criticality * 20 : 60, // Scale based on service criticality
      service_id: service?.id,
      status: 'active'
    };
  }

  private async convertServiceNowTicketToRisk(ticket: any): Promise<DynamicRisk | null> {
    const service = await this.findServiceByCategory(ticket.category);
    
    return {
      source_system: 'servicenow',
      source_id: ticket.number,
      source_url: ticket.url,
      confidence_score: ticket.confidence,
      auto_generated: true,
      approval_status: 'pending',
      title: ticket.title,
      description: ticket.description,
      category: 'Operational',
      severity_level: ticket.priority as any,
      probability: this.priorityToProbability(ticket.priority),
      impact: service ? service.criticality * 15 : 50,
      service_id: service?.id,
      status: 'active'
    };
  }

  private async convertJiraIssueToRisk(issue: any): Promise<DynamicRisk | null> {
    return {
      source_system: 'jira',
      source_id: issue.key,
      source_url: issue.url,
      confidence_score: issue.confidence,
      auto_generated: true,
      approval_status: 'pending',
      title: issue.summary,
      description: issue.description,
      category: 'Technical',
      severity_level: issue.priority as any,
      probability: this.priorityToProbability(issue.priority),
      impact: 40, // Default technical impact
      status: 'active'
    };
  }

  private async convertThreatIndicatorToRisk(indicator: any): Promise<DynamicRisk | null> {
    return {
      source_system: 'threat_intel',
      source_id: indicator.ioc,
      confidence_score: indicator.confidence,
      auto_generated: true,
      approval_status: 'pending',
      title: `Threat Indicator Detected: ${indicator.threat_type}`,
      description: `High-confidence threat indicator (${indicator.ioc}) detected from ${indicator.source}. Threat type: ${indicator.threat_type}`,
      category: 'Threat Intelligence',
      severity_level: 'High',
      probability: Math.round(indicator.confidence * 80), // Convert confidence to probability
      impact: 70, // High impact for threat intelligence
      status: 'active'
    };
  }

  private async convertAssetMetricsToRisk(asset: any, metrics: any): Promise<DynamicRisk | null> {
    return {
      source_system: 'asset_monitor',
      source_id: `asset_${asset.id}`,
      confidence_score: metrics.confidence,
      auto_generated: true,
      approval_status: 'pending',
      title: `Asset Health Degradation: ${asset.name}`,
      description: `Asset monitoring detected performance degradation. ${metrics.reason}`,
      category: 'Operational',
      severity_level: metrics.severity,
      probability: metrics.probability,
      impact: metrics.impact,
      asset_id: asset.id,
      status: 'active'
    };
  }

  // Utility methods for service lookup and scoring

  private async findServiceByName(resourceName: string): Promise<any> {
    if (!resourceName) return null;
    
    const result = await this.db.prepare(`
      SELECT id, name, criticality_level FROM business_services 
      WHERE LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)
      LIMIT 1
    `).bind(`%${resourceName}%`, `%${resourceName}%`).first();

    return result ? {
      id: result.id,
      name: result.name,
      criticality: this.criticalityToNumber(result.criticality_level)
    } : null;
  }

  private async findServiceByCategory(category: string): Promise<any> {
    // Simple category mapping - enhance based on actual service categorization
    const categoryMap: Record<string, string> = {
      'Database': 'Data Analytics',
      'Web': 'Customer Portal',
      'API': 'API Gateway',
      'Network': 'API Gateway'
    };

    const serviceName = categoryMap[category];
    return serviceName ? await this.findServiceByName(serviceName) : null;
  }

  private criticalityToNumber(level: string): number {
    const map: Record<string, number> = {
      'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4
    };
    return map[level] || 2;
  }

  private severityToProbability(severity: string): number {
    const map: Record<string, number> = {
      'Low': 30, 'Medium': 50, 'High': 70, 'Critical': 85
    };
    return map[severity] || 50;
  }

  private priorityToProbability(priority: string): number {
    return this.severityToProbability(priority);
  }

  private async getAssetHealthMetrics(assetId: number): Promise<any> {
    // Simulate asset health monitoring
    const healthScore = Math.random();
    
    return {
      confidence: healthScore < 0.3 ? 0.8 : 0.4, // High confidence if unhealthy
      severity: healthScore < 0.2 ? 'High' : 'Medium',
      probability: Math.round((1 - healthScore) * 80),
      impact: 50,
      reason: healthScore < 0.3 ? 'Performance degradation detected' : 'Minor operational variance'
    };
  }

  private shouldGenerateAssetRisk(metrics: any): boolean {
    return metrics.confidence >= 0.5; // Only generate risks for significant health issues
  }
}