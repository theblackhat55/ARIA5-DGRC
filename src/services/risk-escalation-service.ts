/**
 * Automated Risk Escalation Service
 * 
 * CORE VISION IMPLEMENTATION:
 * "low vulnerability on critical system treated as medium risk should 
 * automatically escalate to high/critical when threat intelligence shows active exploitation"
 * 
 * This service provides automatic risk escalation based on dynamic threat intelligence,
 * vulnerability correlation, and contextual risk factors.
 */

import { UniversalAIService } from './universal-ai-service';
import { AIMetricsService } from './ai-metrics-service';
import type { 
  RiskEscalation, 
  EscalationRule, 
  RiskContext, 
  ThreatCorrelation,
  EscalationTrigger,
  EscalationDecision,
  AutomationSettings,
  EscalationAuditLog
} from '../types/ai-types';

export interface EscalationConfiguration {
  enableAutoEscalation: boolean;
  requireApprovalThreshold: number; // 0-1 confidence threshold for auto-approval
  maxAutoEscalations: number; // Max auto escalations per day
  coolingPeriod: number; // Minutes between escalations for same asset
  escalationMatrix: Record<string, Record<string, string>>; // from->to mapping
  contextWeights: Record<string, number>; // Weight different context factors
}

export interface EscalationStats {
  totalEscalations: number;
  autoEscalations: number;
  manualEscalations: number;
  successfulEscalations: number;
  falsePositives: number;
  avgDecisionTime: number;
  topTriggers: Array<{ trigger: string; count: number }>;
}

/**
 * Automated Risk Escalation Service
 * Implements AI-driven risk escalation based on real-time threat intelligence
 */
export class RiskEscalationService {
  private universalAI: UniversalAIService;
  private metrics: AIMetricsService;
  private config: EscalationConfiguration;
  private escalationHistory: RiskEscalation[] = [];
  private auditLog: EscalationAuditLog[] = [];
  private readonly maxHistorySize = 5000;

  constructor(
    universalAI: UniversalAIService, 
    metrics: AIMetricsService,
    config: EscalationConfiguration
  ) {
    this.universalAI = universalAI;
    this.metrics = metrics;
    this.config = config;
  }

  /**
   * CORE VISION IMPLEMENTATION
   * Evaluate and execute automatic risk escalation
   */
  async evaluateRiskEscalation(
    assetId: string,
    currentRiskLevel: string,
    vulnerabilities: any[],
    threatIntelligence: any[],
    systemContext: RiskContext
  ): Promise<EscalationDecision> {
    const startTime = Date.now();
    
    try {
      // Check if escalation is enabled and within limits
      if (!this.config.enableAutoEscalation) {
        return this.createDecision('disabled', 'Auto-escalation is disabled', 0);
      }

      // Check cooling period
      if (this.isInCoolingPeriod(assetId)) {
        return this.createDecision('cooling_period', 'Asset is in cooling period', 0);
      }

      // Check daily escalation limits
      if (this.hasDailyLimitExceeded()) {
        return this.createDecision('limit_exceeded', 'Daily escalation limit reached', 0);
      }

      // CORE LOGIC: AI-powered risk assessment with threat correlation
      const escalationAssessment = await this.performAIAssessment(
        assetId,
        currentRiskLevel,
        vulnerabilities,
        threatIntelligence,
        systemContext
      );

      // Make escalation decision
      const decision = await this.makeEscalationDecision(escalationAssessment);

      // Execute escalation if approved
      if (decision.shouldEscalate && decision.autoApproved) {
        await this.executeEscalation(decision.escalation!);
      }

      // Record metrics
      this.recordEscalationMetrics(decision, Date.now() - startTime);

      return decision;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logError('Risk escalation evaluation failed', errorMsg, assetId);
      return this.createDecision('error', errorMsg, 0);
    }
  }

  /**
   * CORE AI ASSESSMENT
   * Perform comprehensive AI-powered risk assessment
   */
  private async performAIAssessment(
    assetId: string,
    currentRiskLevel: string,
    vulnerabilities: any[],
    threatIntelligence: any[],
    context: RiskContext
  ): Promise<{
    shouldEscalate: boolean;
    recommendedLevel: string;
    confidence: number;
    reasoning: string;
    triggers: EscalationTrigger[];
    evidence: any[];
  }> {
    console.log(`🔍 Performing AI risk assessment for asset ${assetId}`);

    // Build comprehensive assessment prompt
    const assessmentPrompt = this.buildRiskAssessmentPrompt(
      assetId,
      currentRiskLevel,
      vulnerabilities,
      threatIntelligence,
      context
    );

    // Get AI recommendation
    const aiResponse = await this.universalAI.riskIntelligence({
      systemId: assetId,
      systemName: context.assetName || assetId,
      criticality: context.systemCriticality,
      currentRiskLevel,
      vulnerabilities,
      lastAssessment: new Date(),
      context: {
        industry: context.industry || 'technology',
        compliance: context.complianceRequirements || [],
        dataClassification: context.dataClassification || 'internal'
      }
    });

    // Correlate threats with vulnerabilities
    const correlations = await this.universalAI.threatCorrelation(
      threatIntelligence,
      vulnerabilities
    );

    // Analyze escalation triggers
    const triggers = await this.analyzeEscalationTriggers(
      currentRiskLevel,
      vulnerabilities,
      threatIntelligence,
      correlations,
      context
    );

    // Calculate final assessment
    const assessment = this.calculateFinalAssessment(
      aiResponse,
      correlations,
      triggers,
      context
    );

    return assessment;
  }

  /**
   * VISION SCENARIO ANALYSIS
   * Analyze specific escalation triggers based on threat-vulnerability correlation
   */
  private async analyzeEscalationTriggers(
    currentRiskLevel: string,
    vulnerabilities: any[],
    threats: any[],
    correlations: ThreatCorrelation[],
    context: RiskContext
  ): Promise<EscalationTrigger[]> {
    const triggers: EscalationTrigger[] = [];

    // VISION TRIGGER 1: Critical system + Low/Medium vuln + Active exploitation
    if (context.systemCriticality === 'critical' && 
        ['low', 'medium'].includes(currentRiskLevel)) {
      
      const activeExploitation = correlations.some(c => 
        c.activeExploitation && c.confidence > 0.8
      );

      if (activeExploitation) {
        triggers.push({
          id: `trigger-critical-exploitation-${Date.now()}`,
          type: 'critical_system_active_exploitation',
          description: 'Active exploitation detected on critical system',
          confidence: Math.max(...correlations.filter(c => c.activeExploitation).map(c => c.confidence)),
          severity: 'critical',
          recommendedAction: 'immediate_escalation',
          evidence: correlations.filter(c => c.activeExploitation),
          visionScenario: true // Mark as implementing core vision
        });
      }
    }

    // TRIGGER 2: Trending threat activity
    const trendingThreats = correlations.filter(c => c.trendingUp && c.confidence > 0.7);
    if (trendingThreats.length > 0) {
      triggers.push({
        id: `trigger-trending-threats-${Date.now()}`,
        type: 'trending_threat_activity',
        description: `${trendingThreats.length} trending threats detected`,
        confidence: this.calculateAverageConfidence(trendingThreats),
        severity: this.determineTrendSeverity(trendingThreats),
        recommendedAction: 'escalation_review',
        evidence: trendingThreats
      });
    }

    // TRIGGER 3: High-confidence threat-vuln correlation
    const highConfidenceCorrelations = correlations.filter(c => c.confidence > 0.9);
    if (highConfidenceCorrelations.length > 0) {
      triggers.push({
        id: `trigger-high-confidence-${Date.now()}`,
        type: 'high_confidence_correlation',
        description: 'High-confidence threat-vulnerability correlations found',
        confidence: Math.max(...highConfidenceCorrelations.map(c => c.confidence)),
        severity: this.determineCorrelationSeverity(highConfidenceCorrelations),
        recommendedAction: 'auto_escalation',
        evidence: highConfidenceCorrelations
      });
    }

    // TRIGGER 4: Multiple vulnerability exploitation
    const exploitedVulns = vulnerabilities.filter(v => 
      threats.some(t => t.cveId === v.cveId && t.indicators.includes('active_exploitation'))
    );
    
    if (exploitedVulns.length > 1) {
      triggers.push({
        id: `trigger-multiple-exploits-${Date.now()}`,
        type: 'multiple_vulnerability_exploitation',
        description: `${exploitedVulns.length} vulnerabilities under active exploitation`,
        confidence: 0.95,
        severity: 'high',
        recommendedAction: 'immediate_escalation',
        evidence: exploitedVulns
      });
    }

    // TRIGGER 5: Context-based escalation (compliance, industry-specific)
    if (context.complianceRequirements && context.complianceRequirements.includes('PCI-DSS')) {
      const paymentVulns = vulnerabilities.filter(v => 
        v.affectedSystems.some((s: string) => s.includes('payment') || s.includes('card'))
      );
      
      if (paymentVulns.length > 0) {
        triggers.push({
          id: `trigger-compliance-payment-${Date.now()}`,
          type: 'compliance_sensitive_system',
          description: 'Vulnerabilities detected in PCI-DSS sensitive systems',
          confidence: 0.9,
          severity: 'high',
          recommendedAction: 'compliance_escalation',
          evidence: paymentVulns
        });
      }
    }

    return triggers;
  }

  /**
   * Calculate final assessment based on all inputs
   */
  private calculateFinalAssessment(
    aiResponse: any,
    correlations: ThreatCorrelation[],
    triggers: EscalationTrigger[],
    context: RiskContext
  ): {
    shouldEscalate: boolean;
    recommendedLevel: string;
    confidence: number;
    reasoning: string;
    triggers: EscalationTrigger[];
    evidence: any[];
  } {
    // Vision scenario check: Critical system with active exploitation
    const visionTrigger = triggers.find(t => t.visionScenario);
    if (visionTrigger) {
      return {
        shouldEscalate: true,
        recommendedLevel: 'critical',
        confidence: visionTrigger.confidence,
        reasoning: `VISION IMPLEMENTATION: ${visionTrigger.description}. This implements the core vision of automatic escalation when threat intelligence shows active exploitation on critical systems.`,
        triggers,
        evidence: [...correlations, ...triggers.map(t => t.evidence).flat()]
      };
    }

    // Calculate weighted confidence score
    const triggerWeights = {
      critical_system_active_exploitation: 0.9,
      high_confidence_correlation: 0.8,
      multiple_vulnerability_exploitation: 0.8,
      trending_threat_activity: 0.6,
      compliance_sensitive_system: 0.7
    };

    let weightedConfidence = 0;
    let totalWeight = 0;

    triggers.forEach(trigger => {
      const weight = triggerWeights[trigger.type as keyof typeof triggerWeights] || 0.5;
      weightedConfidence += trigger.confidence * weight;
      totalWeight += weight;
    });

    const finalConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 0;
    
    // Determine if escalation is needed
    const shouldEscalate = finalConfidence > 0.7 && triggers.length > 0;
    
    // Determine recommended level
    const highSeverityTriggers = triggers.filter(t => t.severity === 'critical' || t.severity === 'high');
    const recommendedLevel = highSeverityTriggers.length > 0 ? 
      (triggers.some(t => t.severity === 'critical') ? 'critical' : 'high') : 
      'medium';

    // Build reasoning
    const reasoning = this.buildEscalationReasoning(triggers, correlations, finalConfidence);

    return {
      shouldEscalate,
      recommendedLevel,
      confidence: finalConfidence,
      reasoning,
      triggers,
      evidence: [...correlations, ...triggers.map(t => t.evidence).flat()]
    };
  }

  /**
   * Make final escalation decision
   */
  private async makeEscalationDecision(assessment: any): Promise<EscalationDecision> {
    if (!assessment.shouldEscalate) {
      return this.createDecision('no_escalation', 'No escalation needed based on assessment', assessment.confidence);
    }

    // Create escalation object
    const escalation: RiskEscalation = {
      id: `escalation-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      assetId: assessment.assetId || 'unknown',
      fromRiskLevel: assessment.currentRiskLevel || 'unknown',
      toRiskLevel: assessment.recommendedLevel,
      confidence: assessment.confidence,
      reasoning: assessment.reasoning,
      triggers: assessment.triggers,
      evidence: assessment.evidence,
      timestamp: new Date(),
      status: 'pending',
      autoApproved: assessment.confidence >= this.config.requireApprovalThreshold,
      approvedBy: assessment.confidence >= this.config.requireApprovalThreshold ? 'ai_system' : null,
      executedAt: null
    };

    const decision: EscalationDecision = {
      shouldEscalate: true,
      escalation,
      autoApproved: escalation.autoApproved,
      reasoning: assessment.reasoning,
      confidence: assessment.confidence,
      requiresApproval: !escalation.autoApproved
    };

    return decision;
  }

  /**
   * Execute approved escalation
   */
  private async executeEscalation(escalation: RiskEscalation): Promise<void> {
    try {
      console.log(`🚨 Executing risk escalation: ${escalation.id}`);
      console.log(`   Asset: ${escalation.assetId}`);
      console.log(`   Risk: ${escalation.fromRiskLevel} → ${escalation.toRiskLevel}`);
      console.log(`   Confidence: ${(escalation.confidence * 100).toFixed(1)}%`);
      console.log(`   Reasoning: ${escalation.reasoning}`);

      // Update escalation status
      escalation.status = 'executed';
      escalation.executedAt = new Date();

      // Store in history
      this.escalationHistory.push(escalation);
      
      // Trim history if needed
      if (this.escalationHistory.length > this.maxHistorySize) {
        this.escalationHistory = this.escalationHistory.slice(-this.maxHistorySize);
      }

      // Log audit trail
      this.logAuditEvent('escalation_executed', escalation);

      // Here you would integrate with your risk management system to actually update the risk levels
      // await this.updateAssetRiskLevel(escalation.assetId, escalation.toRiskLevel);
      // await this.notifyStakeholders(escalation);
      // await this.updateComplianceDashboards(escalation);

      console.log(`✅ Risk escalation executed successfully: ${escalation.id}`);

    } catch (error) {
      escalation.status = 'failed';
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logError('Escalation execution failed', errorMsg, escalation.id);
      throw error;
    }
  }

  /**
   * Get escalation recommendations for manual review
   */
  async getEscalationRecommendations(
    filters?: {
      assetIds?: string[];
      riskLevels?: string[];
      minConfidence?: number;
      timeframe?: { start: Date; end: Date };
    }
  ): Promise<{
    recommendations: RiskEscalation[];
    stats: EscalationStats;
    insights: string[];
  }> {
    const recommendations = this.escalationHistory.filter(escalation => {
      if (!filters) return true;
      
      if (filters.assetIds && !filters.assetIds.includes(escalation.assetId)) return false;
      if (filters.riskLevels && !filters.riskLevels.includes(escalation.toRiskLevel)) return false;
      if (filters.minConfidence && escalation.confidence < filters.minConfidence) return false;
      if (filters.timeframe) {
        if (escalation.timestamp < filters.timeframe.start) return false;
        if (escalation.timestamp > filters.timeframe.end) return false;
      }
      
      return true;
    });

    const stats = this.calculateEscalationStats();
    const insights = this.generateEscalationInsights(recommendations);

    return { recommendations, stats, insights };
  }

  /**
   * Update escalation configuration
   */
  updateConfiguration(newConfig: Partial<EscalationConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    this.logAuditEvent('configuration_updated', newConfig);
  }

  /**
   * Get escalation statistics
   */
  getEscalationStats(): EscalationStats {
    return this.calculateEscalationStats();
  }

  // Helper methods

  private buildRiskAssessmentPrompt(
    assetId: string,
    currentRiskLevel: string,
    vulnerabilities: any[],
    threatIntelligence: any[],
    context: RiskContext
  ): string {
    return `
      Analyze the following risk scenario for asset "${assetId}":
      
      Current Risk Level: ${currentRiskLevel}
      System Criticality: ${context.systemCriticality}
      Industry: ${context.industry}
      Compliance Requirements: ${context.complianceRequirements?.join(', ') || 'None'}
      
      Vulnerabilities (${vulnerabilities.length}):
      ${vulnerabilities.map(v => `- ${v.title} (${v.severity}, CVSS: ${v.cvssScore})`).join('\n')}
      
      Threat Intelligence (${threatIntelligence.length}):
      ${threatIntelligence.map(t => `- ${t.name} (${t.severity})`).join('\n')}
      
      CRITICAL VISION SCENARIO TO EVALUATE:
      "Should a low vulnerability on critical system automatically escalate to high/critical 
      when threat intelligence shows active exploitation?"
      
      Provide comprehensive risk assessment including:
      1. Escalation recommendation (yes/no)
      2. Recommended risk level (low/medium/high/critical)
      3. Confidence score (0-1)
      4. Detailed reasoning
      5. Evidence supporting the decision
    `;
  }

  private createDecision(
    type: string, 
    reason: string, 
    confidence: number
  ): EscalationDecision {
    return {
      shouldEscalate: false,
      escalation: null,
      autoApproved: false,
      reasoning: reason,
      confidence,
      requiresApproval: false
    };
  }

  private isInCoolingPeriod(assetId: string): boolean {
    const coolingPeriodMs = this.config.coolingPeriod * 60 * 1000;
    const cutoff = new Date(Date.now() - coolingPeriodMs);
    
    return this.escalationHistory.some(e => 
      e.assetId === assetId && 
      e.timestamp > cutoff &&
      e.status === 'executed'
    );
  }

  private hasDailyLimitExceeded(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEscalations = this.escalationHistory.filter(e => 
      e.timestamp >= today && 
      e.status === 'executed' &&
      e.autoApproved
    );
    
    return todayEscalations.length >= this.config.maxAutoEscalations;
  }

  private calculateAverageConfidence(items: Array<{ confidence: number }>): number {
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.confidence, 0) / items.length;
  }

  private determineTrendSeverity(trends: ThreatCorrelation[]): string {
    const maxConfidence = Math.max(...trends.map(t => t.confidence));
    if (maxConfidence > 0.9) return 'high';
    if (maxConfidence > 0.7) return 'medium';
    return 'low';
  }

  private determineCorrelationSeverity(correlations: ThreatCorrelation[]): string {
    const hasActiveExploitation = correlations.some(c => c.activeExploitation);
    const avgConfidence = this.calculateAverageConfidence(correlations);
    
    if (hasActiveExploitation && avgConfidence > 0.9) return 'critical';
    if (hasActiveExploitation || avgConfidence > 0.8) return 'high';
    return 'medium';
  }

  private buildEscalationReasoning(
    triggers: EscalationTrigger[], 
    correlations: ThreatCorrelation[], 
    confidence: number
  ): string {
    const triggerDescriptions = triggers.map(t => `• ${t.description}`).join('\n');
    const correlationCount = correlations.length;
    
    return `Risk escalation recommended based on AI analysis (${(confidence * 100).toFixed(1)}% confidence):

${triggerDescriptions}

Threat-Vulnerability Correlations Found: ${correlationCount}
Active Exploitations Detected: ${correlations.filter(c => c.activeExploitation).length}

This assessment implements dynamic risk intelligence that automatically identifies 
when threat activity escalates vulnerability risk levels beyond static assessments.`;
  }

  private recordEscalationMetrics(decision: EscalationDecision, duration: number): void {
    this.metrics.recordProviderMetric(
      'risk_escalation_ai',
      'escalation_evaluation',
      duration,
      0, // No token usage for this operation
      decision.shouldEscalate,
      decision.confidence,
      'risk_management'
    );

    if (decision.shouldEscalate && decision.autoApproved) {
      this.metrics.recordDecisionAccuracy(
        'risk_escalation_ai',
        'auto_escalation',
        decision.escalation?.toRiskLevel,
        null, // Actual outcome determined later
        decision.confidence,
        'automated_risk_escalation'
      );
    }
  }

  private calculateEscalationStats(): EscalationStats {
    const total = this.escalationHistory.length;
    const auto = this.escalationHistory.filter(e => e.autoApproved).length;
    const manual = total - auto;
    const successful = this.escalationHistory.filter(e => e.status === 'executed').length;
    const failed = this.escalationHistory.filter(e => e.status === 'failed').length;

    const durations = this.escalationHistory
      .filter(e => e.executedAt)
      .map(e => (e.executedAt!.getTime() - e.timestamp.getTime()) / 1000);
    
    const avgDecisionTime = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    // Calculate top triggers
    const triggerCounts: Record<string, number> = {};
    this.escalationHistory.forEach(e => {
      e.triggers?.forEach(trigger => {
        triggerCounts[trigger.type] = (triggerCounts[trigger.type] || 0) + 1;
      });
    });

    const topTriggers = Object.entries(triggerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }));

    return {
      totalEscalations: total,
      autoEscalations: auto,
      manualEscalations: manual,
      successfulEscalations: successful,
      falsePositives: failed,
      avgDecisionTime,
      topTriggers
    };
  }

  private generateEscalationInsights(escalations: RiskEscalation[]): string[] {
    const insights: string[] = [];
    
    if (escalations.length === 0) {
      insights.push('No escalations found for the specified criteria');
      return insights;
    }

    // Vision implementation insights
    const visionEscalations = escalations.filter(e => 
      e.triggers?.some(t => t.visionScenario)
    );
    
    if (visionEscalations.length > 0) {
      insights.push(`${visionEscalations.length} escalations implemented the core vision of critical system + active exploitation = automatic escalation`);
    }

    // Confidence analysis
    const avgConfidence = escalations.reduce((sum, e) => sum + e.confidence, 0) / escalations.length;
    insights.push(`Average escalation confidence: ${(avgConfidence * 100).toFixed(1)}%`);

    // Auto-approval rate
    const autoApprovalRate = escalations.filter(e => e.autoApproved).length / escalations.length;
    insights.push(`Auto-approval rate: ${(autoApprovalRate * 100).toFixed(1)}%`);

    // Most common triggers
    const allTriggers = escalations.flatMap(e => e.triggers || []);
    const triggerTypes = allTriggers.map(t => t.type);
    const mostCommonTrigger = triggerTypes.reduce((a, b, _, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    );
    insights.push(`Most common trigger: ${mostCommonTrigger}`);

    return insights;
  }

  private logAuditEvent(event: string, data: any): void {
    const auditEntry: EscalationAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      event,
      data,
      user: 'ai_system'
    };
    
    this.auditLog.push(auditEntry);
    
    // Maintain audit log size
    if (this.auditLog.length > this.maxHistorySize) {
      this.auditLog = this.auditLog.slice(-this.maxHistorySize);
    }
  }

  private logError(context: string, error: string, assetId?: string): void {
    console.error(`❌ ${context}:`, error, assetId ? `[Asset: ${assetId}]` : '');
    this.logAuditEvent('error', { context, error, assetId });
  }
}