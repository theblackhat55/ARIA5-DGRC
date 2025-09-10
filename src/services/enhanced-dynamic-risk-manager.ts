/**
 * Enhanced Dynamic Risk Manager Service
 * Implements expanded creation triggers beyond TI (security, operational, compliance, strategic)
 * Unified decision thresholds and advanced deduplication/merging capabilities
 */

import EnhancedRiskScoringOptimizer from '../lib/enhanced-risk-scoring-optimizer';
import AIAnalysisService, { AIAnalysisInput } from './ai-analysis-service';

export interface EnhancedRiskCreationTrigger {
  category: 'security' | 'operational' | 'compliance' | 'strategic';
  source_type: string;
  trigger_data: any;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  auto_approve_eligible: boolean;
}

export interface SecurityTrigger {
  type: 'defender_incident' | 'kev_cve' | 'ti_corroboration' | 'multi_stage_attack' | 'data_exfil';
  incident_ids?: string[];
  cve_ids?: string[];
  indicators?: string[];
  kill_chain_coverage?: number;
  severity_score: number;
  affected_services: number[];
  confidence: number;
}

export interface OperationalTrigger {
  type: 'servicenow_incidents' | 'failed_change' | 'capacity_exhaustion' | 'sla_breach';
  incident_numbers?: string[];
  change_id?: string;
  service_id: number;
  impact_scope: string;
  recurrence_count?: number;
  business_impact_hours?: number;
}

export interface ComplianceTrigger {
  type: 'mfa_coverage_low' | 'stale_evidence' | 'audit_finding' | 'control_disabled';
  control_framework: string;
  control_ids: string[];
  service_ids: number[];
  compliance_gap_percent: number;
  regulatory_risk: boolean;
}

export interface StrategicTrigger {
  type: 'vendor_breach' | 'geo_escalation' | 'regulatory_mandate' | 'supply_chain_risk';
  vendor_name?: string;
  regions?: string[];
  regulation_name?: string;
  business_impact_estimate: number;
  timeline_days: number;
}

export interface RiskDecisionCriteria {
  auto_approve: {
    confidence_threshold: number;
    composite_score_threshold: number;
    kev_exposed_shortcut: boolean;
    bci_threshold_for_kev: number;
  };
  pending: {
    confidence_threshold_min: number;
    composite_score_threshold: number;
  };
  suppress: {
    confidence_threshold_max: number;
    composite_score_threshold_max: number;
  };
  merge: {
    similarity_threshold: number;
    evidence_overlap_threshold: number;
    time_window_hours: number;
  };
}

export interface DeduplicationResult {
  action: 'create_new' | 'merge_with_existing' | 'suppress_duplicate';
  existing_risk_id?: number;
  similarity_score?: number;
  reasoning: string;
  dedupe_key: string;
}

export class EnhancedDynamicRiskManager {
  private db: D1Database;
  private scoringOptimizer: EnhancedRiskScoringOptimizer;
  private aiAnalysisService: AIAnalysisService;
  
  // Decision criteria (loaded from tenant config)
  private decisionCriteria: RiskDecisionCriteria;
  
  // Processing controls
  private processingEnabled: boolean = true;
  private maxRisksPerServicePerDay: number = 50;
  
  constructor(db: D1Database, aiBinding?: any) {
    this.db = db;
    this.scoringOptimizer = new EnhancedRiskScoringOptimizer(db);
    this.aiAnalysisService = new AIAnalysisService(db, aiBinding);
    
    // Load tenant configuration
    this.loadDecisionCriteria();
  }

  /**
   * Enhanced risk creation with expanded triggers beyond TI
   */
  async createDynamicRiskFromTrigger(
    trigger: EnhancedRiskCreationTrigger
  ): Promise<{ risk_id?: number; action: string; reasoning: string }> {
    
    try {
      console.log('[Enhanced-Dynamic-Risk] Processing trigger', {
        category: trigger.category,
        source_type: trigger.source_type,
        confidence: trigger.confidence,
        urgency: trigger.urgency
      });

      // Step 1: Rate limiting check
      const rateLimitCheck = await this.checkRateLimit(trigger);
      if (!rateLimitCheck.allowed) {
        return {
          action: 'rate_limited',
          reasoning: rateLimitCheck.reason
        };
      }

      // Step 2: Generate risk data from trigger
      const riskData = await this.generateRiskFromTrigger(trigger);
      
      // Step 3: Calculate risk score
      const scoringResult = await this.scoringOptimizer.calculateEnhancedRiskScore(
        riskData,
        this.extractServiceId(trigger)
      );

      // Step 4: Deduplication and merging
      const dedupeResult = await this.performDeduplication(riskData, scoringResult);
      
      if (dedupeResult.action === 'merge_with_existing') {
        await this.mergeWithExistingRisk(dedupeResult.existing_risk_id!, riskData, trigger);
        return {
          risk_id: dedupeResult.existing_risk_id,
          action: 'merged',
          reasoning: dedupeResult.reasoning
        };
      }

      if (dedupeResult.action === 'suppress_duplicate') {
        return {
          action: 'suppressed',
          reasoning: dedupeResult.reasoning
        };
      }

      // Step 5: Apply unified decision criteria
      const decision = this.makeRiskDecision(scoringResult, trigger);
      
      if (decision.action === 'suppress') {
        return {
          action: 'suppressed',
          reasoning: decision.reasoning
        };
      }

      // Step 6: Create risk with appropriate state
      const riskId = await this.insertEnhancedRisk({
        ...riskData,
        ...scoringResult,
        initial_state: decision.initial_state,
        dedupe_key: dedupeResult.dedupe_key,
        trigger_category: trigger.category,
        trigger_source: trigger.source_type
      });

      // Step 7: Schedule AI analysis for appropriate risks
      if (decision.action === 'auto_approve' || decision.action === 'pending') {
        await this.scheduleAIAnalysis(riskId, riskData, scoringResult);
      }

      // Step 8: Log state transition
      await this.logStateTransition(
        riskId,
        null,
        decision.initial_state,
        decision.reasoning,
        true,
        trigger.confidence
      );

      console.log('[Enhanced-Dynamic-Risk] Risk created', {
        risk_id: riskId,
        category: trigger.category,
        decision: decision.action,
        composite_score: scoringResult.risk_score_composite,
        confidence: trigger.confidence
      });

      return {
        risk_id: riskId,
        action: decision.action,
        reasoning: decision.reasoning
      };

    } catch (error) {
      console.error('[Enhanced-Dynamic-Risk] Risk creation failed', {
        category: trigger.category,
        source_type: trigger.source_type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Process security triggers (Defender, KEV, TI corroboration, multi-stage attacks)
   */
  async processSecurityTrigger(securityData: SecurityTrigger): Promise<EnhancedRiskCreationTrigger> {
    let confidence = securityData.confidence;
    let autoApprove = false;

    // Enhanced confidence calculation based on trigger type
    switch (securityData.type) {
      case 'defender_incident':
        // High confidence for Defender High/Critical incidents
        if (securityData.severity_score >= 75) {
          confidence = Math.max(confidence, 0.85);
          autoApprove = true;
        }
        break;

      case 'kev_cve':
        // Very high confidence for KEV CVEs on exposed assets
        confidence = 0.95;
        autoApprove = true;
        break;

      case 'ti_corroboration':
        // High confidence when multiple TI feeds corroborate
        if (securityData.indicators && securityData.indicators.length >= 3) {
          confidence = Math.max(confidence, 0.80);
        }
        break;

      case 'multi_stage_attack':
        // High confidence for multi-stage kill chain coverage
        if (securityData.kill_chain_coverage && securityData.kill_chain_coverage >= 0.6) {
          confidence = Math.max(confidence, 0.85);
          autoApprove = true;
        }
        break;

      case 'data_exfil':
        // Critical confidence for verified data exfiltration
        confidence = 0.95;
        autoApprove = true;
        break;
    }

    return {
      category: 'security',
      source_type: securityData.type,
      trigger_data: securityData,
      confidence,
      urgency: securityData.severity_score >= 80 ? 'critical' : 
               securityData.severity_score >= 60 ? 'high' : 'medium',
      auto_approve_eligible: autoApprove
    };
  }

  /**
   * Process operational triggers (ServiceNow, change failures, capacity issues)
   */
  async processOperationalTrigger(operationalData: OperationalTrigger): Promise<EnhancedRiskCreationTrigger> {
    let confidence = 0.7; // Base confidence for operational triggers
    let autoApprove = false;

    switch (operationalData.type) {
      case 'servicenow_incidents':
        // Repeated P1/P2 incidents increase confidence
        if (operationalData.recurrence_count && operationalData.recurrence_count >= 2) {
          confidence = 0.8;
          if (operationalData.recurrence_count >= 3) {
            autoApprove = true;
          }
        }
        break;

      case 'failed_change':
        // Failed changes with business impact are high confidence
        if (operationalData.business_impact_hours && operationalData.business_impact_hours > 1) {
          confidence = 0.85;
          autoApprove = true;
        }
        break;

      case 'capacity_exhaustion':
        // Capacity issues affecting critical services
        confidence = 0.75;
        break;

      case 'sla_breach':
        // SLA breaches are medium confidence
        confidence = 0.6;
        break;
    }

    return {
      category: 'operational',
      source_type: operationalData.type,
      trigger_data: operationalData,
      confidence,
      urgency: operationalData.business_impact_hours && operationalData.business_impact_hours > 4 ? 'critical' : 'medium',
      auto_approve_eligible: autoApprove
    };
  }

  /**
   * Process compliance triggers (MFA gaps, stale evidence, audit findings)
   */
  async processComplianceTrigger(complianceData: ComplianceTrigger): Promise<EnhancedRiskCreationTrigger> {
    let confidence = 0.8; // Generally high confidence for compliance issues
    let autoApprove = false;

    switch (complianceData.type) {
      case 'mfa_coverage_low':
        // Low MFA coverage on critical services
        if (complianceData.compliance_gap_percent > 20) {
          confidence = 0.85;
          if (complianceData.regulatory_risk) {
            autoApprove = true;
          }
        }
        break;

      case 'audit_finding':
        // Audit findings are high confidence
        confidence = 0.9;
        autoApprove = true;
        break;

      case 'control_disabled':
        // Disabled controls on crown jewels
        confidence = 0.9;
        autoApprove = true;
        break;

      case 'stale_evidence':
        // Stale evidence beyond SLA
        confidence = 0.7;
        break;
    }

    return {
      category: 'compliance',
      source_type: complianceData.type,
      trigger_data: complianceData,
      confidence,
      urgency: complianceData.regulatory_risk ? 'high' : 'medium',
      auto_approve_eligible: autoApprove
    };
  }

  /**
   * Process strategic triggers (vendor breaches, geo escalation, regulatory changes)
   */
  async processStrategicTrigger(strategicData: StrategicTrigger): Promise<EnhancedRiskCreationTrigger> {
    let confidence = 0.6; // Base confidence for strategic risks
    let autoApprove = false;

    switch (strategicData.type) {
      case 'vendor_breach':
        // Vendor/supply-chain breach affecting dependencies
        confidence = 0.8;
        if (strategicData.business_impact_estimate > 1000000) { // $1M+ impact
          autoApprove = true;
        }
        break;

      case 'geo_escalation':
        // Geopolitical escalation increasing ERI ≥ +20
        confidence = 0.7;
        break;

      case 'regulatory_mandate':
        // New regulatory mandate increasing fines
        confidence = 0.85;
        if (strategicData.timeline_days < 90) {
          autoApprove = true;
        }
        break;

      case 'supply_chain_risk':
        // Supply chain disruption
        confidence = 0.75;
        break;
    }

    return {
      category: 'strategic',
      source_type: strategicData.type,
      trigger_data: strategicData,
      confidence,
      urgency: strategicData.business_impact_estimate > 500000 ? 'high' : 'medium',
      auto_approve_eligible: autoApprove
    };
  }

  /**
   * Unified decision thresholds for all risk categories
   */
  private makeRiskDecision(
    scoringResult: any,
    trigger: EnhancedRiskCreationTrigger
  ): { action: string; initial_state: string; reasoning: string } {
    
    const criteria = this.decisionCriteria;
    const confidence = trigger.confidence;
    const compositeScore = scoringResult.risk_score_composite;
    
    // Auto-approve criteria
    if (
      (confidence >= criteria.auto_approve.confidence_threshold && 
       compositeScore >= criteria.auto_approve.composite_score_threshold) ||
      (criteria.auto_approve.kev_exposed_shortcut && 
       this.isKEVExposedHighBCI(trigger, scoringResult))
    ) {
      return {
        action: 'auto_approve',
        initial_state: 'active',
        reasoning: `Auto-approved: confidence=${confidence.toFixed(2)}, composite=${compositeScore}, trigger=${trigger.source_type}`
      };
    }

    // Pending criteria  
    if (
      confidence >= criteria.pending.confidence_threshold_min &&
      compositeScore >= criteria.pending.composite_score_threshold
    ) {
      return {
        action: 'pending',
        initial_state: 'draft',
        reasoning: `Pending review: confidence=${confidence.toFixed(2)}, composite=${compositeScore}`
      };
    }

    // Suppress criteria
    if (
      confidence < criteria.suppress.confidence_threshold_max ||
      compositeScore < criteria.suppress.composite_score_threshold_max
    ) {
      return {
        action: 'suppress',
        initial_state: 'suppressed',
        reasoning: `Suppressed: confidence=${confidence.toFixed(2)}, composite=${compositeScore} below thresholds`
      };
    }

    // Default to pending
    return {
      action: 'pending',
      initial_state: 'draft',
      reasoning: 'Default to pending for manual review'
    };
  }

  /**
   * Advanced deduplication with configurable similarity and merge criteria
   */
  private async performDeduplication(
    riskData: any,
    scoringResult: any
  ): Promise<DeduplicationResult> {
    
    // Generate dedupe key
    const dedupeKey = this.generateDedupeKey(riskData);
    
    try {
      // Look for exact dedupe key matches (same day, same service, same category, same signal fingerprint)
      const exactMatch = await this.db.prepare(`
        SELECT id, title, description, created_at, confidence_score
        FROM risks
        WHERE dedupe_key = ? AND created_at >= datetime('now', '-24 hours')
        LIMIT 1
      `).bind(dedupeKey).first();

      if (exactMatch) {
        return {
          action: 'suppress_duplicate',
          existing_risk_id: exactMatch.id,
          similarity_score: 1.0,
          reasoning: 'Exact dedupe key match within 24 hours',
          dedupe_key: dedupeKey
        };
      }

      // Look for similar risks for potential merging
      const timeWindow = this.decisionCriteria.merge.time_window_hours;
      const similarRisks = await this.db.prepare(`
        SELECT id, title, description, category, service_id, 
               threat_intel_sources, created_at, confidence_score
        FROM risks
        WHERE service_id = ? 
          AND category = ?
          AND status IN ('active', 'pending')
          AND created_at >= datetime('now', '-${timeWindow} hours')
        ORDER BY created_at DESC
        LIMIT 10
      `).bind(riskData.service_id, riskData.category).all();

      // Check similarity with existing risks
      for (const existingRisk of (similarRisks.results || [])) {
        const similarity = await this.calculateRiskSimilarity(riskData, existingRisk);
        
        if (similarity.title_similarity >= this.decisionCriteria.merge.similarity_threshold &&
            similarity.evidence_overlap >= this.decisionCriteria.merge.evidence_overlap_threshold) {
          
          return {
            action: 'merge_with_existing',
            existing_risk_id: existingRisk.id,
            similarity_score: (similarity.title_similarity + similarity.evidence_overlap) / 2,
            reasoning: `High similarity (title: ${similarity.title_similarity.toFixed(2)}, evidence: ${similarity.evidence_overlap.toFixed(2)})`,
            dedupe_key: dedupeKey
          };
        }
      }

      // No duplicates or similar risks found
      return {
        action: 'create_new',
        reasoning: 'No duplicates found, creating new risk',
        dedupe_key: dedupeKey
      };

    } catch (error) {
      console.error('[Enhanced-Dynamic-Risk] Deduplication failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fail safe to create new risk
      return {
        action: 'create_new',
        reasoning: 'Deduplication check failed, creating new risk',
        dedupe_key: dedupeKey
      };
    }
  }

  /**
   * Generate dedupe key using tenant:service:category:signal_fingerprint:day format
   */
  private generateDedupeKey(riskData: any): string {
    const tenant = '1'; // Default tenant
    const serviceId = riskData.service_id || '0';
    const category = riskData.category || 'unknown';
    const day = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Generate signal fingerprint from key indicators
    const signalComponents = [
      riskData.title?.toLowerCase().trim(),
      riskData.threat_actors?.join(','),
      riskData.mitre_techniques?.join(','),
      riskData.indicators?.join(',')
    ].filter(Boolean);
    
    const signalFingerprint = this.hashString(signalComponents.join('|')).substring(0, 8);
    
    return `${tenant}:${serviceId}:${category}:${signalFingerprint}:${day}`;
  }

  /**
   * Calculate risk similarity for merging decisions
   */
  private async calculateRiskSimilarity(newRisk: any, existingRisk: any): Promise<{
    title_similarity: number;
    evidence_overlap: number;
  }> {
    
    // Title similarity using Jaccard similarity on words
    const titleSimilarity = this.calculateJaccardSimilarity(
      newRisk.title.toLowerCase().split(/\s+/),
      existingRisk.title.toLowerCase().split(/\s+/)
    );

    // Evidence overlap calculation
    const newEvidence = new Set([
      ...(newRisk.mitre_techniques || []),
      ...(newRisk.threat_actors || []),
      ...(newRisk.indicators || [])
    ]);
    
    const existingThreatSources = JSON.parse(existingRisk.threat_intel_sources || '[]');
    const existingEvidence = new Set(
      existingThreatSources.flatMap((source: any) => [
        source.indicator_type,
        source.indicator_value,
        ...(source.techniques || [])
      ])
    );

    const evidenceOverlap = this.calculateJaccardSimilarity(
      Array.from(newEvidence),
      Array.from(existingEvidence)
    );

    return {
      title_similarity: titleSimilarity,
      evidence_overlap: evidenceOverlap
    };
  }

  /**
   * Merge new risk data with existing risk
   */
  private async mergeWithExistingRisk(
    existingRiskId: number,
    newRiskData: any,
    trigger: EnhancedRiskCreationTrigger
  ): Promise<void> {
    
    try {
      // Get existing risk data
      const existing = await this.db.prepare(`
        SELECT * FROM risks WHERE id = ?
      `).bind(existingRiskId).first();

      if (!existing) {
        throw new Error(`Existing risk ${existingRiskId} not found for merging`);
      }

      // Merge threat intelligence sources
      const existingSources = JSON.parse(existing.threat_intel_sources || '[]');
      const newSources = newRiskData.threat_intel_sources || [];
      const mergedSources = [...existingSources, ...newSources];

      // Update risk with merged data and higher confidence
      const newConfidence = Math.max(existing.confidence_score || 0, trigger.confidence);
      
      await this.db.prepare(`
        UPDATE risks 
        SET threat_intel_sources = ?,
            confidence_score = ?,
            merged_from_risk_ids = COALESCE(merged_from_risk_ids, '[]'),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        JSON.stringify(mergedSources),
        newConfidence,
        existingRiskId
      ).run();

      console.log('[Enhanced-Dynamic-Risk] Risk merged', {
        existing_risk_id: existingRiskId,
        trigger_category: trigger.category,
        new_confidence: newConfidence
      });

    } catch (error) {
      console.error('[Enhanced-Dynamic-Risk] Risk merge failed', {
        existing_risk_id: existingRiskId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Schedule AI analysis for pending and auto-approved risks
   */
  private async scheduleAIAnalysis(
    riskId: number,
    riskData: any,
    scoringResult: any
  ): Promise<void> {
    
    try {
      const aiInput: AIAnalysisInput = {
        risk_id: riskId,
        title: riskData.title,
        description: riskData.description,
        category: riskData.category,
        service_id: riskData.service_id,
        svi: scoringResult.service_indices?.svi,
        sei: scoringResult.service_indices?.sei,
        bci: scoringResult.service_indices?.bci,
        eri: scoringResult.service_indices?.eri
      };

      // Enqueue for background processing (simplified implementation)
      // In production, this would use Cloudflare Queues
      await this.aiAnalysisService.analyzeRisk(aiInput);

      console.log('[Enhanced-Dynamic-Risk] AI analysis scheduled', {
        risk_id: riskId,
        category: riskData.category
      });

    } catch (error) {
      console.error('[Enhanced-Dynamic-Risk] AI analysis scheduling failed', {
        risk_id: riskId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Don't fail risk creation if AI analysis fails
    }
  }

  // Helper methods
  private async checkRateLimit(trigger: EnhancedRiskCreationTrigger): Promise<{
    allowed: boolean;
    reason: string;
  }> {
    
    if (!this.processingEnabled) {
      return { allowed: false, reason: 'Dynamic risk processing is disabled' };
    }

    const serviceId = this.extractServiceId(trigger);
    if (serviceId) {
      const today = new Date().toISOString().split('T')[0];
      
      const count = await this.db.prepare(`
        SELECT COUNT(*) as daily_count
        FROM risks
        WHERE service_id = ? 
          AND source_type = 'Dynamic-TI'
          AND DATE(created_at) = ?
      `).bind(serviceId, today).first();

      if (count && count.daily_count >= this.maxRisksPerServicePerDay) {
        return {
          allowed: false,
          reason: `Daily risk limit exceeded for service ${serviceId} (${count.daily_count}/${this.maxRisksPerServicePerDay})`
        };
      }
    }

    return { allowed: true, reason: 'Rate limit check passed' };
  }

  private extractServiceId(trigger: EnhancedRiskCreationTrigger): number | undefined {
    switch (trigger.category) {
      case 'security':
        const securityData = trigger.trigger_data as SecurityTrigger;
        return securityData.affected_services?.[0];
      case 'operational':
        const operationalData = trigger.trigger_data as OperationalTrigger;
        return operationalData.service_id;
      case 'compliance':
        const complianceData = trigger.trigger_data as ComplianceTrigger;
        return complianceData.service_ids?.[0];
      default:
        return undefined;
    }
  }

  private async generateRiskFromTrigger(trigger: EnhancedRiskCreationTrigger): Promise<any> {
    // Implementation would generate appropriate risk data structure based on trigger type
    // This is a simplified version
    return {
      title: `${trigger.category} Risk: ${trigger.source_type}`,
      description: `Risk generated from ${trigger.source_type} trigger`,
      category: trigger.category,
      service_id: this.extractServiceId(trigger),
      confidence_score: trigger.confidence,
      source_type: 'Dynamic-Enhanced',
      trigger_data: JSON.stringify(trigger.trigger_data)
    };
  }

  private async insertEnhancedRisk(riskData: any): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO risks (
        title, description, category, service_id, confidence_score,
        source_type, risk_score_composite, final_score, likelihood_0_100,
        impact_0_100, controls_discount, score_explanation,
        dedupe_key, dynamic_state, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      riskData.title,
      riskData.description,
      riskData.category,
      riskData.service_id,
      riskData.confidence_score,
      riskData.source_type,
      riskData.risk_score_composite,
      riskData.final_score,
      riskData.factors?.likelihood_0_100,
      riskData.factors?.impact_0_100,
      riskData.controls_discount?.total_discount,
      JSON.stringify(riskData.explanation?.top_factors || []),
      riskData.dedupe_key,
      riskData.initial_state,
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    return result.meta.last_row_id as number;
  }

  private async logStateTransition(
    riskId: number,
    fromState: string | null,
    toState: string,
    reason: string,
    automated: boolean,
    confidence: number
  ): Promise<void> {
    
    await this.db.prepare(`
      INSERT INTO dynamic_risk_states (
        risk_id, previous_state, current_state, transition_reason,
        automated, confidence_change, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      riskId,
      fromState,
      toState,
      reason,
      automated,
      confidence,
      new Date().toISOString()
    ).run();
  }

  private isKEVExposedHighBCI(trigger: EnhancedRiskCreationTrigger, scoringResult: any): boolean {
    // Check if this is a KEV CVE on exposed asset with high BCI
    if (trigger.source_type === 'kev_cve' && 
        scoringResult.service_indices?.bci >= this.decisionCriteria.auto_approve.bci_threshold_for_kev) {
      return true;
    }
    
    // Could also check for exposed assets in the trigger data
    const securityData = trigger.trigger_data as SecurityTrigger;
    return securityData?.type === 'kev_cve' && 
           scoringResult.service_indices?.bci >= 70;
  }

  private calculateJaccardSimilarity(set1: string[], set2: string[]): number {
    const s1 = new Set(set1.filter(Boolean));
    const s2 = new Set(set2.filter(Boolean));
    
    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private hashString(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async loadDecisionCriteria(): Promise<void> {
    try {
      const config = await this.db.prepare(`
        SELECT key, value FROM system_config 
        WHERE key LIKE 'auto_approve_%' 
           OR key LIKE 'pending_%' 
           OR key LIKE 'suppress_%'
           OR key LIKE 'merge_%'
      `).all();

      // Load from database or use defaults
      this.decisionCriteria = {
        auto_approve: {
          confidence_threshold: 0.85,
          composite_score_threshold: 80,
          kev_exposed_shortcut: true,
          bci_threshold_for_kev: 70
        },
        pending: {
          confidence_threshold_min: 0.50,
          composite_score_threshold: 50
        },
        suppress: {
          confidence_threshold_max: 0.50,
          composite_score_threshold_max: 40
        },
        merge: {
          similarity_threshold: 0.8,
          evidence_overlap_threshold: 0.5,
          time_window_hours: 48
        }
      };

      // Override with database values if present
      config.results?.forEach((row: any) => {
        const value = parseFloat(row.value) || 0;
        
        if (row.key.startsWith('auto_approve_threshold_')) {
          const field = row.key.replace('auto_approve_threshold_', '');
          if (field === 'composite') this.decisionCriteria.auto_approve.composite_score_threshold = value;
          if (field === 'confidence') this.decisionCriteria.auto_approve.confidence_threshold = value;
        }
        // ... similar for other criteria
      });

    } catch (error) {
      console.error('[Enhanced-Dynamic-Risk] Failed to load decision criteria, using defaults');
    }
  }
}

export default EnhancedDynamicRiskManager;