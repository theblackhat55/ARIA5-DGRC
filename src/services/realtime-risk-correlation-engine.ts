/**
 * Real-time Risk Correlation Engine
 * Processes cybersecurity and operational risks for dynamic analysis
 * Focuses on asset-service-threat correlation and impact cascading
 */

import EnhancedDynamicRiskManager from './enhanced-dynamic-risk-manager';
import { DynamicRiskManager } from './dynamic-risk-manager';

export interface CorrelationRule {
  id: string;
  name: string;
  category: 'security' | 'operational' | 'cross_category';
  conditions: CorrelationCondition[];
  actions: CorrelationAction[];
  priority: number;
  enabled: boolean;
}

export interface CorrelationCondition {
  type: 'asset_match' | 'service_match' | 'timeframe' | 'severity_threshold' | 'indicator_overlap';
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range' | 'overlaps';
  value: any;
  weight?: number;
}

export interface CorrelationAction {
  type: 'merge_risks' | 'escalate_severity' | 'create_meta_risk' | 'trigger_workflow' | 'send_alert';
  parameters: any;
}

export interface CorrelationResult {
  correlation_id: string;
  primary_risk_id: number;
  correlated_risk_ids: number[];
  correlation_strength: number;
  correlation_type: 'asset_based' | 'service_based' | 'threat_based' | 'temporal' | 'multi_factor';
  actions_taken: string[];
  metadata: any;
  created_at: string;
}

export interface AssetRiskProfile {
  asset_id: number;
  asset_name: string;
  service_ids: number[];
  risk_count: number;
  avg_risk_score: number;
  critical_risks: number;
  last_incident_date?: string;
  vulnerability_count: number;
  threat_exposure_score: number;
}

export interface ServiceRiskProfile {
  service_id: number;
  service_name: string;
  asset_count: number;
  dependent_services: number[];
  risk_count: number;
  operational_incidents: number;
  security_incidents: number;
  business_criticality: number;
  cascade_risk_score: number;
}

export class RealtimeRiskCorrelationEngine {
  private db: D1Database;
  private enhancedRiskManager: EnhancedDynamicRiskManager;
  private dynamicRiskManager: DynamicRiskManager;
  
  // Correlation configuration
  private correlationRules: Map<string, CorrelationRule> = new Map();
  private processingEnabled: boolean = true;
  private correlationWindowHours: number = 48;
  private minimumCorrelationStrength: number = 0.5;

  constructor(db: D1Database, aiBinding?: any) {
    this.db = db;
    this.enhancedRiskManager = new EnhancedDynamicRiskManager(db, aiBinding);
    this.dynamicRiskManager = new DynamicRiskManager(db);
    
    this.initializeCorrelationRules();
  }

  /**
   * Main correlation processing entry point
   */
  async processRiskForCorrelation(riskId: number): Promise<CorrelationResult[]> {
    try {
      console.log(`🔗 Processing risk ${riskId} for correlation analysis`);

      if (!this.processingEnabled) {
        return [];
      }

      // Get risk details
      const risk = await this.getRiskDetails(riskId);
      if (!risk) {
        throw new Error(`Risk ${riskId} not found`);
      }

      // Find potential correlations
      const correlations = await this.findCorrelations(risk);
      
      // Process correlation actions
      const results: CorrelationResult[] = [];
      for (const correlation of correlations) {
        if (correlation.correlation_strength >= this.minimumCorrelationStrength) {
          const result = await this.executeCorrelationActions(correlation);
          results.push(result);
        }
      }

      console.log(`✅ Processed ${results.length} correlations for risk ${riskId}`);
      return results;

    } catch (error) {
      console.error(`❌ Correlation processing failed for risk ${riskId}:`, error);
      return [];
    }
  }

  /**
   * Cybersecurity Risk Correlation Processing
   */
  async correlateCybersecurityRisks(riskId: number): Promise<CorrelationResult[]> {
    const risk = await this.getRiskDetails(riskId);
    if (!risk || risk.category !== 'security' && risk.category !== 'cybersecurity') {
      return [];
    }

    const correlations: any[] = [];

    // 1. Asset-based correlation
    if (risk.service_id) {
      const assetCorrelations = await this.findAssetBasedCorrelations(risk);
      correlations.push(...assetCorrelations);
    }

    // 2. Threat intelligence correlation  
    const tiCorrelations = await this.findThreatIntelligenceCorrelations(risk);
    correlations.push(...tiCorrelations);

    // 3. Vulnerability correlation
    const vulnCorrelations = await this.findVulnerabilityCorrelations(risk);
    correlations.push(...vulnCorrelations);

    // 4. Attack pattern correlation
    const attackPatternCorrelations = await this.findAttackPatternCorrelations(risk);
    correlations.push(...attackPatternCorrelations);

    return this.processCorrelations(riskId, correlations);
  }

  /**
   * Operational Risk Correlation Processing
   */
  async correlateOperationalRisks(riskId: number): Promise<CorrelationResult[]> {
    const risk = await this.getRiskDetails(riskId);
    if (!risk || risk.category !== 'operational') {
      return [];
    }

    const correlations: any[] = [];

    // 1. Service dependency correlation
    if (risk.service_id) {
      const serviceCorrelations = await this.findServiceDependencyCorrelations(risk);
      correlations.push(...serviceCorrelations);
    }

    // 2. Change management correlation
    const changeCorrelations = await this.findChangeManagementCorrelations(risk);
    correlations.push(...changeCorrelations);

    // 3. Performance degradation correlation
    const performanceCorrelations = await this.findPerformanceCorrelations(risk);
    correlations.push(...performanceCorrelations);

    // 4. Capacity and resource correlation
    const capacityCorrelations = await this.findCapacityCorrelations(risk);
    correlations.push(...capacityCorrelations);

    return this.processCorrelations(riskId, correlations);
  }

  /**
   * Cross-Category Risk Correlation (Security + Operational)
   */
  async correlateCrossCategoryRisks(riskId: number): Promise<CorrelationResult[]> {
    const risk = await this.getRiskDetails(riskId);
    if (!risk) {
      return [];
    }

    const correlations: any[] = [];

    // 1. Security incident → Operational impact correlation
    if (risk.category === 'security' || risk.category === 'cybersecurity') {
      const operationalImpacts = await this.findSecurityToOperationalCorrelations(risk);
      correlations.push(...operationalImpacts);
    }

    // 2. Operational failure → Security vulnerability correlation
    if (risk.category === 'operational') {
      const securityExposures = await this.findOperationalToSecurityCorrelations(risk);
      correlations.push(...securityExposures);
    }

    // 3. Service-centric correlation (both categories affecting same service)
    const serviceCentricCorrelations = await this.findServiceCentricCorrelations(risk);
    correlations.push(...serviceCentricCorrelations);

    return this.processCorrelations(riskId, correlations);
  }

  /**
   * Generate Asset Risk Profile
   */
  async generateAssetRiskProfile(assetId: number): Promise<AssetRiskProfile | null> {
    try {
      // Get asset basic info
      const asset = await this.db.prepare(`
        SELECT id, name FROM assets WHERE id = ?
      `).bind(assetId).first();

      if (!asset) {
        return null;
      }

      // Get associated services
      const services = await this.db.prepare(`
        SELECT DISTINCT service_id FROM asset_service_mappings WHERE asset_id = ?
      `).bind(assetId).all();

      const serviceIds = services.results?.map((s: any) => s.service_id) || [];

      // Get risk statistics
      const riskStats = await this.db.prepare(`
        SELECT 
          COUNT(*) as risk_count,
          AVG(risk_score_composite) as avg_risk_score,
          COUNT(CASE WHEN risk_score_composite >= 80 THEN 1 END) as critical_risks,
          MAX(created_at) as last_incident_date
        FROM risks 
        WHERE service_id IN (${serviceIds.map(() => '?').join(',') || 'NULL'})
          AND status = 'active'
      `).bind(...serviceIds).first();

      // Get vulnerability count
      const vulnCount = await this.db.prepare(`
        SELECT COUNT(*) as vuln_count
        FROM vulnerabilities v
        JOIN asset_vulnerability_mappings avm ON v.id = avm.vulnerability_id
        WHERE avm.asset_id = ? AND v.is_active = TRUE
      `).bind(assetId).first();

      // Calculate threat exposure score
      const threatExposure = await this.calculateAssetThreatExposure(assetId, serviceIds);

      return {
        asset_id: assetId,
        asset_name: asset.name,
        service_ids: serviceIds,
        risk_count: riskStats?.risk_count || 0,
        avg_risk_score: riskStats?.avg_risk_score || 0,
        critical_risks: riskStats?.critical_risks || 0,
        last_incident_date: riskStats?.last_incident_date,
        vulnerability_count: vulnCount?.vuln_count || 0,
        threat_exposure_score: threatExposure
      };

    } catch (error) {
      console.error(`Failed to generate asset risk profile for ${assetId}:`, error);
      return null;
    }
  }

  /**
   * Generate Service Risk Profile
   */
  async generateServiceRiskProfile(serviceId: number): Promise<ServiceRiskProfile | null> {
    try {
      // Get service basic info
      const service = await this.db.prepare(`
        SELECT id, name, business_criticality FROM services WHERE id = ?
      `).bind(serviceId).first();

      if (!service) {
        return null;
      }

      // Get asset count
      const assetCount = await this.db.prepare(`
        SELECT COUNT(DISTINCT asset_id) as count
        FROM asset_service_mappings WHERE service_id = ?
      `).bind(serviceId).first();

      // Get dependent services
      const dependencies = await this.db.prepare(`
        SELECT DISTINCT dependency_service_id
        FROM service_dependencies WHERE service_id = ?
      `).bind(serviceId).all();

      const dependentServices = dependencies.results?.map((d: any) => d.dependency_service_id) || [];

      // Get risk statistics by category
      const riskStats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_risks,
          COUNT(CASE WHEN category IN ('security', 'cybersecurity') THEN 1 END) as security_incidents,
          COUNT(CASE WHEN category = 'operational' THEN 1 END) as operational_incidents
        FROM risks 
        WHERE service_id = ? AND status = 'active'
      `).bind(serviceId).first();

      // Calculate cascade risk score
      const cascadeRiskScore = await this.calculateServiceCascadeRisk(serviceId, dependentServices);

      return {
        service_id: serviceId,
        service_name: service.name,
        asset_count: assetCount?.count || 0,
        dependent_services: dependentServices,
        risk_count: riskStats?.total_risks || 0,
        operational_incidents: riskStats?.operational_incidents || 0,
        security_incidents: riskStats?.security_incidents || 0,
        business_criticality: service.business_criticality || 0,
        cascade_risk_score: cascadeRiskScore
      };

    } catch (error) {
      console.error(`Failed to generate service risk profile for ${serviceId}:`, error);
      return null;
    }
  }

  /**
   * Get Real-time Correlation Statistics
   */
  async getCorrelationStatistics(timeframeHours: number = 24): Promise<any> {
    try {
      const stats = await this.db.prepare(`
        SELECT 
          correlation_type,
          COUNT(*) as correlation_count,
          AVG(correlation_strength) as avg_strength,
          COUNT(CASE WHEN correlation_strength >= 0.8 THEN 1 END) as high_confidence_correlations
        FROM risk_correlations
        WHERE created_at >= datetime('now', '-${timeframeHours} hours')
        GROUP BY correlation_type
      `).all();

      const recentActivity = await this.db.prepare(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as correlations_created
        FROM risk_correlations
        WHERE created_at >= datetime('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `).all();

      return {
        correlation_summary: stats.results || [],
        recent_activity: recentActivity.results || [],
        timeframe_hours: timeframeHours,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Failed to get correlation statistics:', error);
      return {
        correlation_summary: [],
        recent_activity: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Private helper methods

  private async getRiskDetails(riskId: number): Promise<any> {
    return await this.db.prepare(`
      SELECT r.*, s.name as service_name, s.business_criticality
      FROM risks r
      LEFT JOIN services s ON r.service_id = s.id
      WHERE r.id = ?
    `).bind(riskId).first();
  }

  private async findCorrelations(risk: any): Promise<any[]> {
    const correlations: any[] = [];

    // Apply correlation rules
    for (const rule of this.correlationRules.values()) {
      if (!rule.enabled) continue;

      const matchResult = await this.evaluateCorrelationRule(risk, rule);
      if (matchResult.matches) {
        correlations.push({
          rule_id: rule.id,
          rule_name: rule.name,
          correlation_strength: matchResult.strength,
          matched_conditions: matchResult.conditions,
          actions: rule.actions
        });
      }
    }

    return correlations;
  }

  private async evaluateCorrelationRule(risk: any, rule: CorrelationRule): Promise<{
    matches: boolean;
    strength: number;
    conditions: string[];
  }> {
    // Simplified rule evaluation - can be enhanced with complex logic
    let totalWeight = 0;
    let matchedWeight = 0;
    const matchedConditions: string[] = [];

    for (const condition of rule.conditions) {
      const weight = condition.weight || 1;
      totalWeight += weight;

      const matches = await this.evaluateCondition(risk, condition);
      if (matches) {
        matchedWeight += weight;
        matchedConditions.push(`${condition.field} ${condition.operator} ${condition.value}`);
      }
    }

    const strength = totalWeight > 0 ? matchedWeight / totalWeight : 0;
    
    return {
      matches: strength >= 0.5, // Require at least 50% of conditions to match
      strength,
      conditions: matchedConditions
    };
  }

  private async evaluateCondition(risk: any, condition: CorrelationCondition): Promise<boolean> {
    // Basic condition evaluation - can be extended
    switch (condition.type) {
      case 'asset_match':
        return risk.service_id === condition.value;
      case 'service_match':
        return risk.service_id === condition.value;
      case 'severity_threshold':
        return risk.risk_score_composite >= condition.value;
      case 'timeframe':
        const riskDate = new Date(risk.created_at);
        const cutoff = new Date(Date.now() - condition.value * 60 * 60 * 1000); // hours to ms
        return riskDate >= cutoff;
      default:
        return false;
    }
  }

  private async findAssetBasedCorrelations(risk: any): Promise<any[]> {
    // Find risks affecting the same assets/services
    const correlatedRisks = await this.db.prepare(`
      SELECT id, title, risk_score_composite, created_at
      FROM risks
      WHERE service_id = ? 
        AND id != ?
        AND created_at >= datetime('now', '-${this.correlationWindowHours} hours')
        AND status = 'active'
      ORDER BY risk_score_composite DESC
      LIMIT 10
    `).bind(risk.service_id, risk.id).all();

    return (correlatedRisks.results || []).map(r => ({
      type: 'asset_based',
      target_risk_id: r.id,
      strength: this.calculateAssetCorrelationStrength(risk, r),
      metadata: { shared_service: risk.service_id }
    }));
  }

  private async findThreatIntelligenceCorrelations(risk: any): Promise<any[]> {
    // Find risks with overlapping threat intelligence indicators
    if (!risk.threat_intel_sources) return [];

    try {
      const tiSources = JSON.parse(risk.threat_intel_sources);
      const indicators = tiSources.map((s: any) => s.indicator_value).filter(Boolean);

      if (indicators.length === 0) return [];

      const correlatedRisks = await this.db.prepare(`
        SELECT id, title, threat_intel_sources, created_at
        FROM risks
        WHERE id != ? 
          AND threat_intel_sources IS NOT NULL
          AND created_at >= datetime('now', '-${this.correlationWindowHours} hours')
          AND status = 'active'
      `).bind(risk.id).all();

      const correlations: any[] = [];
      for (const r of correlatedRisks.results || []) {
        const overlapStrength = this.calculateThreatIntelligenceOverlap(tiSources, JSON.parse(r.threat_intel_sources));
        if (overlapStrength >= 0.3) {
          correlations.push({
            type: 'threat_based',
            target_risk_id: r.id,
            strength: overlapStrength,
            metadata: { shared_indicators: indicators }
          });
        }
      }

      return correlations;
    } catch (error) {
      console.warn('Failed to process threat intelligence correlations:', error);
      return [];
    }
  }

  private async findVulnerabilityCorrelations(risk: any): Promise<any[]> {
    // Find risks related to the same vulnerabilities or CVEs
    const correlations: any[] = [];
    
    // This would be implemented based on CVE and vulnerability data
    // For now, return empty array as placeholder
    
    return correlations;
  }

  private async findAttackPatternCorrelations(risk: any): Promise<any[]> {
    // Find risks with similar attack patterns or MITRE ATT&CK techniques
    const correlations: any[] = [];
    
    // This would analyze MITRE techniques and attack patterns
    // For now, return empty array as placeholder
    
    return correlations;
  }

  private async findServiceDependencyCorrelations(risk: any): Promise<any[]> {
    // Find risks in dependent services
    const dependencies = await this.db.prepare(`
      SELECT dependency_service_id, dependency_type
      FROM service_dependencies 
      WHERE service_id = ?
    `).bind(risk.service_id).all();

    const correlations: any[] = [];
    for (const dep of dependencies.results || []) {
      const dependentRisks = await this.db.prepare(`
        SELECT id, title, risk_score_composite
        FROM risks
        WHERE service_id = ?
          AND id != ?
          AND created_at >= datetime('now', '-${this.correlationWindowHours} hours')
          AND status = 'active'
      `).bind(dep.dependency_service_id, risk.id).all();

      for (const r of dependentRisks.results || []) {
        correlations.push({
          type: 'service_based',
          target_risk_id: r.id,
          strength: this.calculateServiceCorrelationStrength(risk, r),
          metadata: { 
            dependency_type: dep.dependency_type,
            dependent_service: dep.dependency_service_id 
          }
        });
      }
    }

    return correlations;
  }

  private async findChangeManagementCorrelations(risk: any): Promise<any[]> {
    // Correlate with recent changes that might have caused operational issues
    return [];
  }

  private async findPerformanceCorrelations(risk: any): Promise<any[]> {
    // Correlate with performance degradation patterns
    return [];
  }

  private async findCapacityCorrelations(risk: any): Promise<any[]> {
    // Correlate with capacity and resource utilization issues
    return [];
  }

  private async findSecurityToOperationalCorrelations(risk: any): Promise<any[]> {
    // Find operational impacts of security incidents
    return [];
  }

  private async findOperationalToSecurityCorrelations(risk: any): Promise<any[]> {
    // Find security vulnerabilities exposed by operational failures
    return [];
  }

  private async findServiceCentricCorrelations(risk: any): Promise<any[]> {
    // Find all risks affecting the same service regardless of category
    const serviceCentricRisks = await this.db.prepare(`
      SELECT id, title, category, risk_score_composite
      FROM risks
      WHERE service_id = ?
        AND id != ?
        AND category != ?
        AND created_at >= datetime('now', '-${this.correlationWindowHours} hours')
        AND status = 'active'
    `).bind(risk.service_id, risk.id, risk.category).all();

    return (serviceCentricRisks.results || []).map(r => ({
      type: 'multi_factor',
      target_risk_id: r.id,
      strength: 0.8, // High correlation for same service, different categories
      metadata: { 
        cross_category: true,
        categories: [risk.category, r.category]
      }
    }));
  }

  private async processCorrelations(riskId: number, correlations: any[]): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    for (const correlation of correlations) {
      if (correlation.strength >= this.minimumCorrelationStrength) {
        const result = await this.executeCorrelationActions(correlation);
        results.push(result);
      }
    }

    return results;
  }

  private async executeCorrelationActions(correlation: any): Promise<CorrelationResult> {
    // Execute correlation actions and return result
    const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const result: CorrelationResult = {
      correlation_id: correlationId,
      primary_risk_id: correlation.primary_risk_id || 0,
      correlated_risk_ids: [correlation.target_risk_id],
      correlation_strength: correlation.strength,
      correlation_type: correlation.type,
      actions_taken: [],
      metadata: correlation.metadata,
      created_at: new Date().toISOString()
    };

    // Store correlation result
    await this.storeCorrelationResult(result);

    return result;
  }

  private async storeCorrelationResult(result: CorrelationResult): Promise<void> {
    await this.db.prepare(`
      INSERT INTO risk_correlations (
        correlation_id, primary_risk_id, correlated_risk_ids, 
        correlation_strength, correlation_type, actions_taken,
        metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      result.correlation_id,
      result.primary_risk_id,
      JSON.stringify(result.correlated_risk_ids),
      result.correlation_strength,
      result.correlation_type,
      JSON.stringify(result.actions_taken),
      JSON.stringify(result.metadata),
      result.created_at
    ).run();
  }

  private calculateAssetCorrelationStrength(risk1: any, risk2: any): number {
    // Calculate correlation strength between risks on same asset
    let strength = 0.5; // Base strength for same asset

    // Boost if both are high severity
    if (risk1.risk_score_composite >= 80 && risk2.risk_score_composite >= 80) {
      strength += 0.2;
    }

    // Boost if temporal proximity
    const timeDiff = Math.abs(new Date(risk1.created_at).getTime() - new Date(risk2.created_at).getTime());
    if (timeDiff < 24 * 60 * 60 * 1000) { // Within 24 hours
      strength += 0.2;
    }

    return Math.min(strength, 1.0);
  }

  private calculateServiceCorrelationStrength(risk1: any, risk2: any): number {
    // Calculate correlation strength between risks on related services
    let strength = 0.4; // Base strength for service dependency

    // Consider business criticality
    if (risk1.business_criticality >= 4 && risk2.business_criticality >= 4) {
      strength += 0.3;
    }

    return Math.min(strength, 1.0);
  }

  private calculateThreatIntelligenceOverlap(sources1: any[], sources2: any[]): number {
    const indicators1 = new Set(sources1.map(s => s.indicator_value).filter(Boolean));
    const indicators2 = new Set(sources2.map(s => s.indicator_value).filter(Boolean));
    
    const intersection = new Set([...indicators1].filter(x => indicators2.has(x)));
    const union = new Set([...indicators1, ...indicators2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private async calculateAssetThreatExposure(assetId: number, serviceIds: number[]): Promise<number> {
    // Calculate threat exposure score based on vulnerabilities and threat intelligence
    let exposureScore = 0;

    // Factor in vulnerability count and severity
    const vulnScore = await this.db.prepare(`
      SELECT 
        COUNT(*) as vuln_count,
        AVG(cvss_score) as avg_cvss
      FROM vulnerabilities v
      JOIN asset_vulnerability_mappings avm ON v.id = avm.vulnerability_id
      WHERE avm.asset_id = ? AND v.is_active = TRUE
    `).bind(assetId).first();

    if (vulnScore?.vuln_count > 0) {
      exposureScore += Math.min(vulnScore.vuln_count * 5, 50); // Up to 50 points for vulnerabilities
      exposureScore += (vulnScore.avg_cvss || 0) * 5; // Up to 50 points for CVSS
    }

    return Math.min(exposureScore, 100);
  }

  private async calculateServiceCascadeRisk(serviceId: number, dependentServices: number[]): Promise<number> {
    // Calculate risk of cascading failures through service dependencies
    let cascadeRisk = 0;

    // Base risk from current service
    const serviceRisk = await this.db.prepare(`
      SELECT AVG(risk_score_composite) as avg_risk
      FROM risks
      WHERE service_id = ? AND status = 'active'
    `).bind(serviceId).first();

    cascadeRisk += (serviceRisk?.avg_risk || 0) * 0.5;

    // Risk amplification from dependencies
    if (dependentServices.length > 0) {
      const dependencyRisk = await this.db.prepare(`
        SELECT AVG(risk_score_composite) as avg_risk
        FROM risks
        WHERE service_id IN (${dependentServices.map(() => '?').join(',')}) 
          AND status = 'active'
      `).bind(...dependentServices).first();

      cascadeRisk += (dependencyRisk?.avg_risk || 0) * 0.3 * Math.min(dependentServices.length / 10, 1);
    }

    return Math.min(cascadeRisk, 100);
  }

  private initializeCorrelationRules(): void {
    // Initialize default correlation rules
    this.correlationRules.set('asset_security_clustering', {
      id: 'asset_security_clustering',
      name: 'Asset Security Risk Clustering',
      category: 'security',
      conditions: [
        { type: 'asset_match', field: 'service_id', operator: 'equals', value: null, weight: 2 },
        { type: 'timeframe', field: 'created_at', operator: 'in_range', value: 24, weight: 1 },
        { type: 'severity_threshold', field: 'risk_score_composite', operator: 'greater_than', value: 70, weight: 1.5 }
      ],
      actions: [
        { type: 'escalate_severity', parameters: { escalation_factor: 1.2 } },
        { type: 'send_alert', parameters: { alert_type: 'asset_under_attack' } }
      ],
      priority: 1,
      enabled: true
    });

    this.correlationRules.set('service_operational_cascade', {
      id: 'service_operational_cascade',
      name: 'Service Operational Risk Cascade',
      category: 'operational',
      conditions: [
        { type: 'service_match', field: 'service_id', operator: 'equals', value: null, weight: 2 },
        { type: 'timeframe', field: 'created_at', operator: 'in_range', value: 12, weight: 1 }
      ],
      actions: [
        { type: 'create_meta_risk', parameters: { title: 'Service Degradation Cascade' } }
      ],
      priority: 2,
      enabled: true
    });
  }
}

export default RealtimeRiskCorrelationEngine;