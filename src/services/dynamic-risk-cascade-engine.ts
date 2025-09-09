/**
 * Dynamic Risk Cascading Engine for ARIA5-DGRC
 * 
 * Implements service-centric risk intelligence with automatic cascading,
 * dependency impact propagation, and confidence-based approval workflows.
 */

export interface ServiceRiskProfile {
  service_id: number;
  name: string;
  criticality_level: 'low' | 'medium' | 'high' | 'critical';
  cia_score: number;
  aggregate_risk_score: number;
  risk_trend: 'decreasing' | 'stable' | 'increasing';
  last_risk_update: string;
  
  // Risk associations
  direct_risks: RiskAssociation[];
  cascaded_risks: RiskAssociation[];
  dependency_risks: RiskAssociation[];
  
  // Service dependencies
  dependencies: ServiceDependency[];
  dependents: ServiceDependency[];
}

export interface RiskAssociation {
  risk_id: number;
  risk_title: string;
  risk_score: number;
  weight: number;
  source: 'manual' | 'external_api' | 'ai_analysis' | 'threat_intel';
  confidence_score: number;
  status: 'pending' | 'active' | 'mitigated' | 'accepted' | 'transferred';
  approval_status: 'pending' | 'approved' | 'rejected';
  cascading_type?: 'direct' | 'dependency' | 'correlation';
}

export interface ServiceDependency {
  service_id: number;
  service_name: string;
  dependency_type: 'functional' | 'data' | 'infrastructure' | 'compliance';
  criticality: 'low' | 'medium' | 'high';
  impact_propagation_factor: number;
}

export interface RiskCascadeResult {
  service_id: number;
  risk_id: number;
  cascading_type: 'direct' | 'dependency' | 'correlation';
  original_score: number;
  cascaded_score: number;
  confidence_score: number;
  impact_chain: string[];
  recommendation: string;
  requires_approval: boolean;
}

export class DynamicRiskCascadeEngine {
  private riskCascadeThreshold: number = 0.7;
  private approvalWorkflowEnabled: boolean = true;
  private dependencyImpactEnabled: boolean = true;

  constructor(private db: D1Database) {
    this.loadSystemConfiguration();
  }

  /**
   * Calculate and update service risk scores with cascading
   */
  async calculateServiceRiskProfile(serviceId: number): Promise<ServiceRiskProfile> {
    const service = await this.getServiceData(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    // Get direct risk associations
    const directRisks = await this.getDirectRisks(serviceId);
    
    // Calculate cascaded risks from dependencies
    const cascadedRisks = await this.calculateCascadedRisks(serviceId);
    
    // Get dependency-based risks
    const dependencyRisks = await this.calculateDependencyRisks(serviceId);
    
    // Get service dependencies
    const [dependencies, dependents] = await Promise.all([
      this.getServiceDependencies(serviceId),
      this.getServiceDependents(serviceId)
    ]);

    // Calculate aggregate risk score
    const aggregateScore = this.calculateAggregateRiskScore(
      directRisks, cascadedRisks, dependencyRisks
    );

    // Determine risk trend
    const riskTrend = await this.calculateRiskTrend(serviceId, aggregateScore);

    // Update service risk metrics
    await this.updateServiceRiskMetrics(serviceId, aggregateScore, riskTrend);

    return {
      service_id: serviceId,
      name: service.name,
      criticality_level: service.criticality_level,
      cia_score: service.cia_score,
      aggregate_risk_score: aggregateScore,
      risk_trend: riskTrend,
      last_risk_update: new Date().toISOString(),
      direct_risks: directRisks,
      cascaded_risks: cascadedRisks,
      dependency_risks: dependencyRisks,
      dependencies,
      dependents
    };
  }

  /**
   * Process risk cascading across service dependencies
   */
  async processRiskCascading(riskId: number): Promise<RiskCascadeResult[]> {
    const results: RiskCascadeResult[] = [];
    
    // Get risk details
    const risk = await this.getRiskData(riskId);
    if (!risk || risk.confidence_score < this.riskCascadeThreshold) {
      return results;
    }

    // Get services directly associated with this risk
    const directServices = await this.getDirectlyAffectedServices(riskId);
    
    for (const service of directServices) {
      // Process cascading to dependent services
      const dependentServices = await this.getServiceDependents(service.service_id);
      
      for (const dependent of dependentServices) {
        const cascadeResult = await this.calculateCascadeImpact(
          risk, service, dependent
        );
        
        if (cascadeResult.cascaded_score > 0) {
          // Create or update service-risk association
          await this.createServiceRiskAssociation(
            dependent.service_id, 
            riskId, 
            cascadeResult.cascaded_score / risk.risk_score, // weight
            'dependency'
          );
          
          results.push(cascadeResult);
        }
      }
    }

    return results;
  }

  /**
   * Handle risk approval workflow
   */
  async processRiskApproval(riskId: number, approvedBy: number, approved: boolean): Promise<void> {
    const risk = await this.getRiskData(riskId);
    if (!risk) {
      throw new Error(`Risk ${riskId} not found`);
    }

    // Update approval status
    await this.db.prepare(`
      UPDATE risks 
      SET approval_status = ?, 
          approved_by = ?, 
          approved_at = datetime('now'),
          status = CASE WHEN ? THEN 'active' ELSE status END,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(approved ? 'approved' : 'rejected', approvedBy, approved, riskId).run();

    if (approved) {
      // Trigger risk cascading for newly approved risks
      await this.processRiskCascading(riskId);
      
      // Update affected services
      const affectedServices = await this.getDirectlyAffectedServices(riskId);
      for (const service of affectedServices) {
        await this.recalculateServiceRiskScore(service.service_id);
      }
    }
  }

  /**
   * Intelligent risk-to-service mapping based on AI analysis
   */
  async intelligentRiskMapping(riskId: number): Promise<{
    suggested_mappings: Array<{
      service_id: number;
      service_name: string;
      confidence: number;
      reasoning: string;
      suggested_weight: number;
    }>;
    correlation_analysis: string;
  }> {
    const risk = await this.getRiskData(riskId);
    if (!risk) {
      throw new Error(`Risk ${riskId} not found`);
    }

    const services = await this.getAllActiveServices();
    const suggestions: Array<{
      service_id: number;
      service_name: string;
      confidence: number;
      reasoning: string;
      suggested_weight: number;
    }> = [];

    // Analyze each service for risk correlation
    for (const service of services) {
      const analysis = await this.analyzeRiskServiceCorrelation(risk, service);
      
      if (analysis.confidence > 0.5) {
        suggestions.push({
          service_id: service.id,
          service_name: service.name,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          suggested_weight: analysis.suggested_weight
        });
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return {
      suggested_mappings: suggestions.slice(0, 10), // Top 10 suggestions
      correlation_analysis: this.generateCorrelationAnalysis(risk, suggestions)
    };
  }

  /**
   * Real-time risk monitoring and alerting
   */
  async monitorRiskChanges(): Promise<{
    high_priority_alerts: string[];
    risk_trend_changes: Array<{service_id: number; old_trend: string; new_trend: string}>;
    approval_pending: Array<{risk_id: number; title: string; days_pending: number}>;
    cascade_recommendations: string[];
  }> {
    const alerts: string[] = [];
    const trendChanges: Array<{service_id: number; old_trend: string; new_trend: string}> = [];
    const pendingApprovals: Array<{risk_id: number; title: string; days_pending: number}> = [];
    const recommendations: string[] = [];

    // Check for services with rapidly increasing risk scores
    const riskIncreases = await this.db.prepare(`
      SELECT s.id, s.name, s.aggregate_risk_score, s.risk_trend
      FROM services s
      WHERE s.risk_trend = 'increasing' 
        AND s.aggregate_risk_score > 15
        AND s.last_risk_update > datetime('now', '-24 hours')
    `).all();

    for (const service of (riskIncreases.results || [])) {
      alerts.push(`Critical: Service '${service.name}' shows rapidly increasing risk score (${service.aggregate_risk_score})`);
    }

    // Check for long-pending risk approvals
    const pendingRisks = await this.db.prepare(`
      SELECT id, title, 
             julianday('now') - julianday(created_at) as days_pending
      FROM risks 
      WHERE approval_status = 'pending' 
        AND status = 'pending'
      ORDER BY days_pending DESC
    `).all();

    for (const risk of (pendingRisks.results || [])) {
      if (risk.days_pending > 7) {
        alerts.push(`Urgent: Risk '${risk.title}' pending approval for ${Math.floor(risk.days_pending)} days`);
      }
      pendingApprovals.push({
        risk_id: risk.id,
        title: risk.title,
        days_pending: Math.floor(risk.days_pending)
      });
    }

    // Generate cascade recommendations
    const highConfidenceRisks = await this.db.prepare(`
      SELECT id, title, confidence_score
      FROM risks 
      WHERE confidence_score > ? 
        AND approval_status = 'approved'
        AND id NOT IN (SELECT risk_id FROM service_risks)
    `).bind(this.riskCascadeThreshold).all();

    for (const risk of (highConfidenceRisks.results || [])) {
      recommendations.push(`Consider mapping high-confidence risk '${risk.title}' to relevant services`);
    }

    return {
      high_priority_alerts: alerts,
      risk_trend_changes: trendChanges,
      approval_pending: pendingApprovals,
      cascade_recommendations: recommendations
    };
  }

  // Private helper methods

  private async loadSystemConfiguration(): Promise<void> {
    const config = await this.db.prepare(`
      SELECT key, value FROM system_config 
      WHERE key IN ('risk_cascade_threshold', 'approval_workflow_enabled', 'service_dependency_impact')
    `).all();

    for (const setting of (config.results || [])) {
      switch (setting.key) {
        case 'risk_cascade_threshold':
          this.riskCascadeThreshold = parseFloat(setting.value) || 0.7;
          break;
        case 'approval_workflow_enabled':
          this.approvalWorkflowEnabled = setting.value === 'true';
          break;
        case 'service_dependency_impact':
          this.dependencyImpactEnabled = setting.value === 'true';
          break;
      }
    }
  }

  private async getServiceData(serviceId: number) {
    return await this.db.prepare(
      "SELECT * FROM services WHERE id = ?"
    ).bind(serviceId).first();
  }

  private async getRiskData(riskId: number) {
    return await this.db.prepare(
      "SELECT * FROM risks WHERE id = ?"
    ).bind(riskId).first();
  }

  private async getDirectRisks(serviceId: number): Promise<RiskAssociation[]> {
    const result = await this.db.prepare(`
      SELECT r.id as risk_id, r.title as risk_title, r.risk_score, 
             sr.weight, r.source, r.confidence_score, r.status, r.approval_status
      FROM service_risks sr
      JOIN risks r ON sr.risk_id = r.id
      WHERE sr.service_id = ?
    `).bind(serviceId).all();

    return (result.results || []).map(row => ({
      risk_id: row.risk_id,
      risk_title: row.risk_title,
      risk_score: row.risk_score,
      weight: row.weight,
      source: row.source,
      confidence_score: row.confidence_score,
      status: row.status,
      approval_status: row.approval_status,
      cascading_type: 'direct' as const
    }));
  }

  private async calculateCascadedRisks(serviceId: number): Promise<RiskAssociation[]> {
    // Implementation for calculating risks cascaded from other services
    return [];
  }

  private async calculateDependencyRisks(serviceId: number): Promise<RiskAssociation[]> {
    if (!this.dependencyImpactEnabled) return [];

    const result = await this.db.prepare(`
      SELECT DISTINCT r.id as risk_id, r.title as risk_title, r.risk_score,
             sr.weight * sd.criticality_factor as effective_weight,
             r.source, r.confidence_score, r.status, r.approval_status
      FROM service_dependencies sd
      JOIN service_risks sr ON sd.depends_on_service_id = sr.service_id
      JOIN risks r ON sr.risk_id = r.id
      WHERE sd.service_id = ?
        AND r.approval_status = 'approved'
    `).bind(serviceId).all();

    return (result.results || []).map(row => ({
      risk_id: row.risk_id,
      risk_title: row.risk_title,
      risk_score: row.risk_score,
      weight: row.effective_weight,
      source: row.source,
      confidence_score: row.confidence_score,
      status: row.status,
      approval_status: row.approval_status,
      cascading_type: 'dependency' as const
    }));
  }

  private async getServiceDependencies(serviceId: number): Promise<ServiceDependency[]> {
    const result = await this.db.prepare(`
      SELECT s.id as service_id, s.name as service_name,
             sd.dependency_type, sd.criticality,
             CASE sd.criticality 
               WHEN 'high' THEN 0.8 
               WHEN 'medium' THEN 0.5 
               ELSE 0.2 
             END as impact_propagation_factor
      FROM service_dependencies sd
      JOIN services s ON sd.depends_on_service_id = s.id
      WHERE sd.service_id = ?
    `).bind(serviceId).all();

    return (result.results || []).map(row => ({
      service_id: row.service_id,
      service_name: row.service_name,
      dependency_type: row.dependency_type,
      criticality: row.criticality,
      impact_propagation_factor: row.impact_propagation_factor
    }));
  }

  private async getServiceDependents(serviceId: number): Promise<ServiceDependency[]> {
    const result = await this.db.prepare(`
      SELECT s.id as service_id, s.name as service_name,
             sd.dependency_type, sd.criticality,
             CASE sd.criticality 
               WHEN 'high' THEN 0.8 
               WHEN 'medium' THEN 0.5 
               ELSE 0.2 
             END as impact_propagation_factor
      FROM service_dependencies sd
      JOIN services s ON sd.service_id = s.id
      WHERE sd.depends_on_service_id = ?
    `).bind(serviceId).all();

    return (result.results || []).map(row => ({
      service_id: row.service_id,
      service_name: row.service_name,
      dependency_type: row.dependency_type,
      criticality: row.criticality,
      impact_propagation_factor: row.impact_propagation_factor
    }));
  }

  private calculateAggregateRiskScore(
    directRisks: RiskAssociation[], 
    cascadedRisks: RiskAssociation[], 
    dependencyRisks: RiskAssociation[]
  ): number {
    const allRisks = [...directRisks, ...cascadedRisks, ...dependencyRisks];
    
    if (allRisks.length === 0) return 0;

    // Weighted average of risk scores with confidence factoring
    const totalWeightedScore = allRisks.reduce((sum, risk) => {
      const effectiveScore = risk.risk_score * risk.weight * risk.confidence_score;
      return sum + effectiveScore;
    }, 0);

    const totalWeight = allRisks.reduce((sum, risk) => sum + risk.weight, 0);
    
    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  }

  private async calculateRiskTrend(serviceId: number, currentScore: number): Promise<'decreasing' | 'stable' | 'increasing'> {
    // Get historical risk scores (simplified - in production, you'd maintain a risk_score_history table)
    const historical = await this.db.prepare(`
      SELECT aggregate_risk_score 
      FROM services 
      WHERE id = ?
    `).bind(serviceId).first();

    if (!historical || historical.aggregate_risk_score === null) return 'stable';
    
    const previousScore = historical.aggregate_risk_score;
    const change = currentScore - previousScore;
    
    if (Math.abs(change) < 2) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  private async updateServiceRiskMetrics(serviceId: number, aggregateScore: number, trend: string): Promise<void> {
    await this.db.prepare(`
      UPDATE services 
      SET aggregate_risk_score = ?, 
          risk_trend = ?, 
          last_risk_update = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(aggregateScore, trend, serviceId).run();
  }

  private async getDirectlyAffectedServices(riskId: number) {
    const result = await this.db.prepare(`
      SELECT sr.service_id, s.name, sr.weight
      FROM service_risks sr
      JOIN services s ON sr.service_id = s.id
      WHERE sr.risk_id = ?
    `).bind(riskId).all();

    return result.results || [];
  }

  private async calculateCascadeImpact(risk: any, sourceService: any, targetService: any): Promise<RiskCascadeResult> {
    const baseCascadeScore = risk.risk_score * targetService.impact_propagation_factor * risk.confidence_score;
    
    return {
      service_id: targetService.service_id,
      risk_id: risk.id,
      cascading_type: 'dependency',
      original_score: risk.risk_score,
      cascaded_score: Math.round(baseCascadeScore),
      confidence_score: risk.confidence_score * 0.8, // Reduce confidence for cascaded risks
      impact_chain: [sourceService.name, targetService.service_name],
      recommendation: `Monitor ${targetService.service_name} for cascading impact from ${sourceService.name}`,
      requires_approval: baseCascadeScore > 10 // High impact cascades need approval
    };
  }

  private async createServiceRiskAssociation(serviceId: number, riskId: number, weight: number, type: string): Promise<void> {
    await this.db.prepare(`
      INSERT OR IGNORE INTO service_risks (service_id, risk_id, weight, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(serviceId, riskId, weight).run();
  }

  private async recalculateServiceRiskScore(serviceId: number): Promise<void> {
    const profile = await this.calculateServiceRiskProfile(serviceId);
    // Risk score already updated in calculateServiceRiskProfile
  }

  private async getAllActiveServices() {
    const result = await this.db.prepare(
      "SELECT * FROM services WHERE status = 'active'"
    ).all();
    return result.results || [];
  }

  private async analyzeRiskServiceCorrelation(risk: any, service: any): Promise<{
    confidence: number;
    reasoning: string;
    suggested_weight: number;
  }> {
    // Simplified correlation analysis - in production, this would use ML/AI
    let confidence = 0;
    const reasons: string[] = [];
    
    // Category matching
    if (risk.category === 'Security' && service.criticality_level === 'critical') {
      confidence += 0.3;
      reasons.push('Critical service with security risk correlation');
    }
    
    // CIA score correlation
    if (service.cia_score >= 4 && risk.impact >= 4) {
      confidence += 0.4;
      reasons.push('High CIA score aligns with high-impact risk');
    }
    
    // Name/description correlation (simplified keyword matching)
    const riskKeywords = risk.title.toLowerCase().split(' ');
    const serviceKeywords = service.name.toLowerCase().split(' ');
    const commonKeywords = riskKeywords.filter(k => serviceKeywords.includes(k));
    
    if (commonKeywords.length > 0) {
      confidence += 0.2;
      reasons.push(`Keyword correlation: ${commonKeywords.join(', ')}`);
    }
    
    const suggestedWeight = Math.min(1.0, confidence);
    
    return {
      confidence: Math.round(confidence * 100) / 100,
      reasoning: reasons.join('; '),
      suggested_weight: Math.round(suggestedWeight * 100) / 100
    };
  }

  private generateCorrelationAnalysis(risk: any, suggestions: any[]): string {
    const highConfidence = suggestions.filter(s => s.confidence > 0.7).length;
    const mediumConfidence = suggestions.filter(s => s.confidence > 0.4 && s.confidence <= 0.7).length;
    
    return `Risk '${risk.title}' shows ${highConfidence} high-confidence and ${mediumConfidence} medium-confidence service correlations. ` +
           `Automated mapping recommended for high-confidence matches.`;
  }
}