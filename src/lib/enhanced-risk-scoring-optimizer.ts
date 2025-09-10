/**
 * ARIA5.1 Enhanced Risk Scoring Optimizer
 * Implements AI-native, service-centric risk scoring with 0-100 normalized backbone
 * Addresses unit mismatch and provides explainable, auditable scoring
 */

export interface ServiceIndices {
  svi: number;  // Service Vulnerability Index (0-100)
  sei: number;  // Security Event Index (0-100)
  bci: number;  // Business Context Index (0-100)
  eri: number;  // External Risk Index (0-100)
  composite: number; // Weighted composite (0-100)
}

export interface NormalizedRiskFactors {
  likelihood_0_100: number;    // Normalized likelihood (0-100)
  impact_0_100: number;        // Normalized impact (0-100)
  confidence: number;          // Confidence (0-1)
  freshness: number;           // Freshness (0.1-1.0)
  evidence_quality: number;    // Evidence quality (0.1-1.0)
  mitre_complexity: number;    // MITRE complexity (0.1-1.0)
  threat_actor: number;        // Threat actor sophistication (0.1-1.0)
  asset_criticality: number;   // Asset criticality (0.2-1.0)
}

export interface ControlsDiscount {
  edr_coverage: number;        // EDR deployment coverage
  network_segmentation: number; // Network segmentation maturity
  patch_cadence: number;       // Patch management effectiveness
  backup_dr_tested: number;    // Backup/DR testing
  iam_mfa_coverage: number;    // IAM/MFA coverage
  total_discount: number;      // Applied discount percentage
}

export interface RiskScoringResult {
  final_score: number;         // Final score (0-1)
  risk_score_composite: number; // Composite score (0-100)
  risk_level: string;          // 'critical', 'high', 'medium', 'low'
  factors: NormalizedRiskFactors;
  service_indices: ServiceIndices;
  controls_discount: ControlsDiscount;
  explanation: ScoringExplanation;
  computation_metadata: ComputationMetadata;
}

export interface ScoringExplanation {
  top_factors: Array<{
    factor: string;
    contribution: number;
    reason: string;
    value: number;
  }>;
  controls_applied: string[];
  risk_drivers: string[];
  confidence_factors: string[];
}

export interface ComputationMetadata {
  scoring_version: string;
  computation_time_ms: number;
  data_freshness_hours: number;
  cache_hit: boolean;
  tenant_policy_applied: boolean;
}

export interface TenantRiskPolicy {
  scoring_weights: {
    likelihood: number;
    impact: number;
    confidence: number;
    freshness: number;
    evidence_quality: number;
    mitre_complexity: number;
    threat_actor: number;
    asset_criticality: number;
  };
  service_indices_weights: {
    svi: number;
    sei: number;
    bci: number;
    eri: number;
  };
  controls_discounts: {
    edr_coverage: number;
    network_segmentation: number;
    patch_cadence: number;
    backup_dr_tested: number;
    iam_mfa_coverage: number;
    max_reduction_per_dimension: number;
  };
  type_multipliers: {
    security: number;
    operational: number;
    compliance: number;
    strategic: number;
  };
  risk_bands: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export class EnhancedRiskScoringOptimizer {
  private db: D1Database;
  private correlationId: string;
  private tenantPolicy: TenantRiskPolicy;
  private computationStartTime: number;

  constructor(db: D1Database, tenantId: number = 1) {
    this.db = db;
    this.correlationId = this.generateCorrelationId();
    this.computationStartTime = Date.now();
    
    // Load tenant-specific policy from system_config
    this.loadTenantPolicy(tenantId);
    
    console.log('[Enhanced-Risk-Scoring] Initialized', {
      correlation_id: this.correlationId,
      tenant_id: tenantId,
      scoring_version: 'v2.0'
    });
  }

  /**
   * Calculate comprehensive risk score with normalized 0-100 backbone
   */
  async calculateEnhancedRiskScore(
    riskData: any,
    serviceId?: number
  ): Promise<RiskScoringResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Compute or retrieve service indices
      const serviceIndices = serviceId ? 
        await this.computeServiceIndices(serviceId) :
        this.getDefaultServiceIndices();

      // Step 2: Calculate normalized risk factors (0-100 backbone)
      const normalizedFactors = await this.calculateNormalizedFactors(
        riskData, 
        serviceIndices
      );

      // Step 3: Apply controls discount
      const controlsDiscount = serviceId ? 
        await this.calculateControlsDiscount(serviceId) :
        this.getDefaultControlsDiscount();

      // Step 4: Apply controls discount to likelihood and impact
      const adjustedFactors = this.applyControlsDiscount(
        normalizedFactors, 
        controlsDiscount
      );

      // Step 5: Convert to 8-factor model (maintaining backward compatibility)
      const eightFactorModel = this.convertToEightFactorModel(adjustedFactors);

      // Step 6: Calculate final score using existing 8-factor formula
      const finalScore = this.calculateFinalScore(
        eightFactorModel,
        riskData.risk_type || 'security'
      );

      // Step 7: Generate explanation and metadata
      const explanation = this.generateScoringExplanation(
        adjustedFactors,
        serviceIndices,
        controlsDiscount
      );

      const metadata: ComputationMetadata = {
        scoring_version: 'v2.0',
        computation_time_ms: Date.now() - startTime,
        data_freshness_hours: await this.getDataFreshness(serviceId),
        cache_hit: false,
        tenant_policy_applied: true
      };

      const result: RiskScoringResult = {
        final_score: finalScore,
        risk_score_composite: Math.round(finalScore * 100),
        risk_level: this.determineRiskLevel(finalScore),
        factors: adjustedFactors,
        service_indices: serviceIndices,
        controls_discount: controlsDiscount,
        explanation,
        computation_metadata: metadata
      };

      console.log('[Enhanced-Risk-Scoring] Score calculated', {
        correlation_id: this.correlationId,
        final_score: finalScore,
        risk_level: result.risk_level,
        composite_score: result.risk_score_composite,
        computation_time: metadata.computation_time_ms
      });

      return result;

    } catch (error) {
      console.error('[Enhanced-Risk-Scoring] Calculation failed', {
        correlation_id: this.correlationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Compute Service Indices (SVI/SEI/BCI/ERI) with 0-100 normalization
   */
  private async computeServiceIndices(serviceId: number): Promise<ServiceIndices> {
    try {
      // Check for recent cached indices (within 15 minutes)
      const cached = await this.getCachedServiceIndices(serviceId);
      if (cached) return cached;

      // Compute SVI (Service Vulnerability Index)
      const svi = await this.computeSVI(serviceId);
      
      // Compute SEI (Security Event Index) 
      const sei = await this.computeSEI(serviceId);
      
      // Compute BCI (Business Context Index)
      const bci = await this.computeBCI(serviceId);
      
      // Compute ERI (External Risk Index)
      const eri = await this.computeERI(serviceId);

      // Calculate composite criticality using tenant weights
      const composite = (
        this.tenantPolicy.service_indices_weights.svi * svi +
        this.tenantPolicy.service_indices_weights.sei * sei +
        this.tenantPolicy.service_indices_weights.bci * bci +
        this.tenantPolicy.service_indices_weights.eri * eri
      );

      const indices: ServiceIndices = { svi, sei, bci, eri, composite };

      // Cache the computed indices
      await this.cacheServiceIndices(serviceId, indices);

      return indices;

    } catch (error) {
      console.error('[Enhanced-Risk-Scoring] Service indices computation failed', {
        correlation_id: this.correlationId,
        service_id: serviceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return this.getDefaultServiceIndices();
    }
  }

  /**
   * Compute Service Vulnerability Index (SVI) - 0-100 normalized
   */
  private async computeSVI(serviceId: number): Promise<number> {
    const factors = this.tenantPolicy.svi_factors || {
      cvss_weighted_mean: 30,
      kev_present: 20,
      public_exploit: 10,
      patch_sla_overdue: 10,
      internet_exposed: 15,
      asset_criticality: 10,
      decay_half_life_days: 30
    };

    try {
      const vulnQuery = `
        SELECT 
          AVG(cvss_score) as avg_cvss,
          COUNT(*) as total_vulns,
          SUM(CASE WHEN kev = 1 THEN 1 ELSE 0 END) as kev_count,
          SUM(CASE WHEN public_exploit = 1 THEN 1 ELSE 0 END) as exploit_count,
          SUM(CASE WHEN patch_sla_overdue = 1 THEN 1 ELSE 0 END) as overdue_count,
          SUM(CASE WHEN internet_exposed = 1 THEN 1 ELSE 0 END) as exposed_count,
          AVG(CASE 
            WHEN asset_criticality = 'critical' THEN 100
            WHEN asset_criticality = 'high' THEN 80
            WHEN asset_criticality = 'medium' THEN 60
            WHEN asset_criticality = 'low' THEN 40
            ELSE 50
          END) as avg_criticality,
          AVG(age_days) as avg_age_days
        FROM vulnerabilities v
        WHERE v.service_id = ? AND v.status = 'open'
      `;

      const result = await this.db.prepare(vulnQuery).bind(serviceId).first();
      
      if (!result || result.total_vulns === 0) return 0;

      let svi = 0;

      // CVSS weighted mean contribution
      const cvssContribution = Math.min(factors.cvss_weighted_mean, 
        (result.avg_cvss / 10) * factors.cvss_weighted_mean);
      svi += cvssContribution;

      // KEV present bonus
      if (result.kev_count > 0) {
        svi += factors.kev_present;
      }

      // Public exploit bonus
      if (result.exploit_count > 0) {
        svi += factors.public_exploit;
      }

      // Patch SLA overdue penalty
      const overdueRatio = result.overdue_count / result.total_vulns;
      svi += overdueRatio * factors.patch_sla_overdue;

      // Internet exposure bonus
      const exposureRatio = result.exposed_count / result.total_vulns;
      svi += exposureRatio * factors.internet_exposed;

      // Asset criticality contribution
      svi += (result.avg_criticality / 100) * factors.asset_criticality;

      // Apply age-based decay
      const decayFactor = Math.pow(0.5, result.avg_age_days / factors.decay_half_life_days);
      svi *= decayFactor;

      return Math.min(100, Math.max(0, svi));

    } catch (error) {
      console.error('[Enhanced-Risk-Scoring] SVI computation failed', {
        service_id: serviceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  /**
   * Compute Security Event Index (SEI) - 0-100 normalized with EWMA
   */
  private async computeSEI(serviceId: number): Promise<number> {
    const factors = this.tenantPolicy.sei_factors || {
      high_critical_incidents: 35,
      multi_stage_correlation: 20,
      recency_boost_72h: 20,
      escalations_linked: 15,
      dwell_time_penalty: 10,
      ewma_alpha: 0.6
    };

    try {
      const eventsQuery = `
        SELECT 
          severity_norm,
          techniques,
          correlation_id,
          escalated,
          dwell_time_hours,
          event_timestamp,
          CASE 
            WHEN event_timestamp >= datetime('now', '-72 hours') THEN 1 
            ELSE 0 
          END as recent_event
        FROM security_events
        WHERE service_id = ? 
          AND status IN ('open', 'investigating')
          AND event_timestamp >= datetime('now', '-30 days')
        ORDER BY event_timestamp DESC
      `;

      const result = await this.db.prepare(eventsQuery).bind(serviceId).all();
      const events = result.results || [];
      
      if (events.length === 0) return 0;

      let sei = 0;

      // High/Critical incidents contribution
      const highCriticalEvents = events.filter(e => e.severity_norm >= 75);
      if (highCriticalEvents.length > 0) {
        sei += factors.high_critical_incidents;
      }

      // Multi-stage correlation detection
      const correlatedEvents = new Set(
        events
          .filter(e => e.correlation_id && e.techniques)
          .map(e => e.correlation_id)
      );
      if (correlatedEvents.size > 0) {
        const killChainCoverage = this.analyzeKillChainCoverage(events);
        sei += killChainCoverage * factors.multi_stage_correlation;
      }

      // Recency boost (last 72h)
      const recentEvents = events.filter(e => e.recent_event);
      if (recentEvents.length > 0) {
        sei += factors.recency_boost_72h;
      }

      // Escalations and linked incidents
      const escalatedCount = events.filter(e => e.escalated).length;
      if (escalatedCount > 0) {
        sei += (escalatedCount / events.length) * factors.escalations_linked;
      }

      // Average dwell time penalty
      const avgDwellTime = events.reduce((sum, e) => sum + (e.dwell_time_hours || 0), 0) / events.length;
      if (avgDwellTime > 24) {
        sei += factors.dwell_time_penalty;
      }

      // Apply EWMA decay for time-weighted scoring
      const ewmaAlpha = factors.ewma_alpha;
      let ewmaScore = 0;
      let weight = 1;
      
      for (let i = 0; i < Math.min(events.length, 10); i++) {
        const eventScore = events[i].severity_norm / 100;
        ewmaScore += weight * eventScore;
        weight *= (1 - ewmaAlpha);
      }
      
      sei = sei * ewmaScore;

      return Math.min(100, Math.max(0, sei));

    } catch (error) {
      console.error('[Enhanced-Risk-Scoring] SEI computation failed', {
        service_id: serviceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  /**
   * Compute Business Context Index (BCI) - 0-100 normalized
   */
  private async computeBCI(serviceId: number): Promise<number> {
    try {
      const serviceQuery = `
        SELECT 
          confidentiality_score,
          integrity_score,
          availability_score,
          criticality_level
        FROM services
        WHERE id = ?
      `;

      const service = await this.db.prepare(serviceQuery).bind(serviceId).first();
      
      if (!service) return 50; // Default medium criticality

      let bci = 0;

      // CIA baseline contribution (60 max)
      const ciaScore = (
        (service.confidentiality_score + service.integrity_score + service.availability_score) / 3
      );
      bci += (ciaScore / 5) * 60; // Convert 1-5 scale to 0-60

      // Criticality level bonus (20 max)
      const criticalityBonus = {
        'critical': 20,
        'high': 15,
        'medium': 10,
        'low': 5
      }[service.criticality_level] || 10;
      bci += criticalityBonus;

      // Additional business context factors would be computed here
      // - Downtime cost per hour (normalized by tenant)
      // - SLA penalty exposure 
      // - Customer reach (normalized by tenant)

      return Math.min(100, Math.max(0, bci));

    } catch (error) {
      console.error('[Enhanced-Risk-Scoring] BCI computation failed', {
        service_id: serviceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 50;
    }
  }

  /**
   * Compute External Risk Index (ERI) - 0-100 normalized
   */
  private async computeERI(serviceId: number): Promise<number> {
    try {
      const signalsQuery = `
        SELECT 
          signal_type,
          severity_norm,
          confidence,
          start_date,
          end_date
        FROM external_signals
        WHERE status = 'active'
          AND (end_date IS NULL OR end_date >= date('now'))
        ORDER BY severity_norm DESC
        LIMIT 10
      `;

      const result = await this.db.prepare(signalsQuery).all();
      const signals = result.results || [];

      if (signals.length === 0) return 0;

      let eri = 0;

      // Geopolitical intensity (40 max)
      const geoSignals = signals.filter(s => s.signal_type === 'geopolitical');
      if (geoSignals.length > 0) {
        const maxGeoSeverity = Math.max(...geoSignals.map(s => s.severity_norm));
        eri += (maxGeoSeverity / 100) * 40;
      }

      // Industry targeting trend (30 max)
      const threatSignals = signals.filter(s => s.signal_type === 'industry_threat');
      if (threatSignals.length > 0) {
        const avgThreatSeverity = threatSignals.reduce((sum, s) => sum + s.severity_norm, 0) / threatSignals.length;
        eri += (avgThreatSeverity / 100) * 30;
      }

      // Regulatory pressure (20 max)
      const regSignals = signals.filter(s => s.signal_type === 'regulatory');
      if (regSignals.length > 0) {
        const avgRegSeverity = regSignals.reduce((sum, s) => sum + s.severity_norm, 0) / regSignals.length;
        eri += (avgRegSeverity / 100) * 20;
      }

      // Vendor/supply-chain incidents (10 max)
      const vendorSignals = signals.filter(s => s.signal_type === 'vendor_breach');
      if (vendorSignals.length > 0) {
        eri += 10;
      }

      return Math.min(100, Math.max(0, eri));

    } catch (error) {
      console.error('[Enhanced-Risk-Scoring] ERI computation failed', {
        service_id: serviceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  /**
   * Calculate normalized risk factors from service indices and risk data
   */
  private async calculateNormalizedFactors(
    riskData: any,
    serviceIndices: ServiceIndices
  ): Promise<NormalizedRiskFactors> {
    
    // Likelihood (0-100) from multiple components
    const likelihoodComponents = {
      sei: serviceIndices.sei * 0.35,
      exploitability: await this.calculateExploitability(riskData) * 0.25,
      ti_corroboration: await this.calculateTICorroboration(riskData) * 0.15,
      change_risk: await this.calculateChangeRisk(riskData) * 0.15,
      eri: serviceIndices.eri * 0.10
    };
    
    const likelihood_0_100 = Object.values(likelihoodComponents).reduce((sum, val) => sum + val, 0);

    // Impact (0-100) from multiple components  
    const impactComponents = {
      bci: serviceIndices.bci * 0.40,
      svi_critical: await this.getSVICriticalAssets(riskData) * 0.20,
      data_sensitivity: await this.getDataSensitivity(riskData) * 0.15,
      regulatory_fines: await this.getRegulatoryFines(riskData) * 0.15,
      dependency_weight: await this.getDependencyWeight(riskData) * 0.10
    };

    const impact_0_100 = Object.values(impactComponents).reduce((sum, val) => sum + val, 0);

    // Other factors (existing logic with enhancements)
    const confidence = await this.calculateEnhancedConfidence(riskData);
    const freshness = await this.calculateFreshnessScore(riskData);
    const evidence_quality = await this.calculateEvidenceQuality(riskData.evidence || []);
    const mitre_complexity = await this.calculateMITREComplexity(riskData.mitre_techniques || []);
    const threat_actor = await this.calculateThreatActorScore(riskData.threat_actors || []);
    const asset_criticality = await this.calculateAssetCriticality(riskData.asset_id);

    return {
      likelihood_0_100: Math.min(100, Math.max(0, likelihood_0_100)),
      impact_0_100: Math.min(100, Math.max(0, impact_0_100)),
      confidence,
      freshness,
      evidence_quality,
      mitre_complexity,
      threat_actor,
      asset_criticality
    };
  }

  /**
   * Calculate controls discount based on security posture
   */
  private async calculateControlsDiscount(serviceId: number): Promise<ControlsDiscount> {
    const maxDiscounts = this.tenantPolicy.controls_discounts;
    
    try {
      // Query service security posture (this would be populated by security tools)
      const postureQuery = `
        SELECT 
          edr_coverage_percent,
          network_segmentation_score,
          patch_cadence_days,
          backup_dr_last_test_days,
          iam_mfa_coverage_percent
        FROM service_security_posture 
        WHERE service_id = ?
        ORDER BY assessed_at DESC 
        LIMIT 1
      `;

      // For now, use default values (would be replaced with real data)
      const posture = {
        edr_coverage_percent: 85,
        network_segmentation_score: 70,
        patch_cadence_days: 14,
        backup_dr_last_test_days: 90,
        iam_mfa_coverage_percent: 92
      };

      const discounts: ControlsDiscount = {
        edr_coverage: (posture.edr_coverage_percent / 100) * maxDiscounts.edr_coverage,
        network_segmentation: (posture.network_segmentation_score / 100) * maxDiscounts.network_segmentation,
        patch_cadence: posture.patch_cadence_days <= 7 ? maxDiscounts.patch_cadence : 0,
        backup_dr_tested: posture.backup_dr_last_test_days <= 90 ? maxDiscounts.backup_dr_tested : 0,
        iam_mfa_coverage: posture.iam_mfa_coverage_percent >= 95 ? maxDiscounts.iam_mfa_coverage : 0,
        total_discount: 0
      };

      // Calculate total discount (capped per dimension)
      const likelihoodReduction = Math.min(
        maxDiscounts.max_reduction_per_dimension,
        discounts.edr_coverage + discounts.network_segmentation + discounts.patch_cadence + discounts.iam_mfa_coverage
      );
      
      const impactReduction = Math.min(
        maxDiscounts.max_reduction_per_dimension,
        discounts.backup_dr_tested
      );

      discounts.total_discount = (likelihoodReduction + impactReduction) / 2;

      return discounts;

    } catch (error) {
      console.error('[Enhanced-Risk-Scoring] Controls discount calculation failed', {
        service_id: serviceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return this.getDefaultControlsDiscount();
    }
  }

  /**
   * Apply controls discount to likelihood and impact
   */
  private applyControlsDiscount(
    factors: NormalizedRiskFactors,
    controlsDiscount: ControlsDiscount
  ): NormalizedRiskFactors {
    
    const adjustedFactors = { ...factors };
    
    // Apply likelihood reductions
    const likelihoodReduction = 
      controlsDiscount.edr_coverage +
      controlsDiscount.network_segmentation +
      controlsDiscount.patch_cadence +
      controlsDiscount.iam_mfa_coverage;
    
    adjustedFactors.likelihood_0_100 = Math.max(0, 
      adjustedFactors.likelihood_0_100 - likelihoodReduction
    );

    // Apply impact reductions  
    const impactReduction = controlsDiscount.backup_dr_tested;
    
    adjustedFactors.impact_0_100 = Math.max(0,
      adjustedFactors.impact_0_100 - impactReduction
    );

    return adjustedFactors;
  }

  /**
   * Convert normalized factors to 8-factor model (backward compatibility)
   */
  private convertToEightFactorModel(factors: NormalizedRiskFactors): any {
    return {
      likelihood: 1 + (4 * factors.likelihood_0_100 / 100), // Convert to 1-5 scale
      impact: 1 + (4 * factors.impact_0_100 / 100),         // Convert to 1-5 scale
      confidence: factors.confidence,
      freshness: factors.freshness,
      evidence_quality: factors.evidence_quality,
      mitre_complexity: factors.mitre_complexity,
      threat_actor: factors.threat_actor,
      asset_criticality: factors.asset_criticality
    };
  }

  /**
   * Calculate final score using enhanced 8-factor formula
   */
  private calculateFinalScore(eightFactorModel: any, riskType: string = 'security'): number {
    const weights = this.tenantPolicy.scoring_weights;
    
    // Base score components (maintaining existing formula structure)
    const likelihoodScore = ((eightFactorModel.likelihood - 1) / 4) * weights.likelihood;
    const impactScore = ((eightFactorModel.impact - 1) / 4) * weights.impact;
    const confidenceScore = eightFactorModel.confidence * weights.confidence;
    const freshnessScore = eightFactorModel.freshness * weights.freshness;
    const evidenceScore = eightFactorModel.evidence_quality * weights.evidence_quality;
    const mitreScore = eightFactorModel.mitre_complexity * weights.mitre_complexity;
    const actorScore = eightFactorModel.threat_actor * weights.threat_actor;
    const assetScore = eightFactorModel.asset_criticality * weights.asset_criticality;

    // Calculate composite score
    const baseScore = likelihoodScore + impactScore + confidenceScore + 
                     freshnessScore + evidenceScore + mitreScore + 
                     actorScore + assetScore;

    // Apply risk type multiplier
    const typeMultiplier = this.tenantPolicy.type_multipliers[riskType] || 1.0;
    
    return Math.min(1.0, baseScore * typeMultiplier);
  }

  /**
   * Determine risk level from final score
   */
  private determineRiskLevel(finalScore: number): string {
    const bands = this.tenantPolicy.risk_bands;
    
    if (finalScore >= bands.critical) return 'critical';
    if (finalScore >= bands.high) return 'high';
    if (finalScore >= bands.medium) return 'medium';
    return 'low';
  }

  /**
   * Generate detailed scoring explanation for auditability
   */
  private generateScoringExplanation(
    factors: NormalizedRiskFactors,
    serviceIndices: ServiceIndices,
    controlsDiscount: ControlsDiscount
  ): ScoringExplanation {
    
    const topFactors: Array<{factor: string; contribution: number; reason: string; value: number}> = [];
    
    // Analyze top contributing factors
    if (factors.likelihood_0_100 > 70) {
      topFactors.push({
        factor: 'High Likelihood',
        contribution: factors.likelihood_0_100,
        reason: `SEI: ${serviceIndices.sei.toFixed(1)}, Security events and exploitability indicators`,
        value: factors.likelihood_0_100
      });
    }

    if (factors.impact_0_100 > 70) {
      topFactors.push({
        factor: 'High Impact',
        contribution: factors.impact_0_100,
        reason: `BCI: ${serviceIndices.bci.toFixed(1)}, Business criticality and data sensitivity`,
        value: factors.impact_0_100
      });
    }

    if (serviceIndices.svi > 60) {
      topFactors.push({
        factor: 'Vulnerability Exposure',
        contribution: serviceIndices.svi,
        reason: 'Critical vulnerabilities, KEV presence, or patch delays detected',
        value: serviceIndices.svi
      });
    }

    if (serviceIndices.eri > 50) {
      topFactors.push({
        factor: 'External Risk Environment',
        contribution: serviceIndices.eri,
        reason: 'Heightened geopolitical, regulatory, or industry threat activity',
        value: serviceIndices.eri
      });
    }

    // Identify applied controls
    const controlsApplied: string[] = [];
    if (controlsDiscount.edr_coverage > 0) controlsApplied.push(`EDR Coverage (-${controlsDiscount.edr_coverage.toFixed(1)}%)`);
    if (controlsDiscount.network_segmentation > 0) controlsApplied.push(`Network Segmentation (-${controlsDiscount.network_segmentation.toFixed(1)}%)`);
    if (controlsDiscount.patch_cadence > 0) controlsApplied.push(`Patch Management (-${controlsDiscount.patch_cadence.toFixed(1)}%)`);
    if (controlsDiscount.backup_dr_tested > 0) controlsApplied.push(`Backup/DR (-${controlsDiscount.backup_dr_tested.toFixed(1)}%)`);
    if (controlsDiscount.iam_mfa_coverage > 0) controlsApplied.push(`IAM/MFA (-${controlsDiscount.iam_mfa_coverage.toFixed(1)}%)`);

    // Sort by contribution descending
    topFactors.sort((a, b) => b.contribution - a.contribution);

    return {
      top_factors: topFactors.slice(0, 5),
      controls_applied: controlsApplied,
      risk_drivers: topFactors.map(f => f.factor),
      confidence_factors: factors.confidence > 0.8 ? ['High-confidence sources', 'Multiple corroborating signals'] : ['Limited source confidence']
    };
  }

  // Helper methods and utility functions would continue here...
  // (Implementation of all the helper methods referenced above)

  private async loadTenantPolicy(tenantId: number): Promise<void> {
    try {
      const config = await this.db.prepare(`
        SELECT value FROM system_config WHERE key = 'tenant_risk_policy'
      `).first();
      
      if (config?.value) {
        this.tenantPolicy = JSON.parse(config.value);
      } else {
        this.tenantPolicy = this.getDefaultTenantPolicy();
      }
    } catch (error) {
      console.error('[Enhanced-Risk-Scoring] Failed to load tenant policy, using defaults');
      this.tenantPolicy = this.getDefaultTenantPolicy();
    }
  }

  private getDefaultTenantPolicy(): TenantRiskPolicy {
    return {
      scoring_weights: {
        likelihood: 0.25,
        impact: 0.30,
        confidence: 0.20,
        freshness: 0.10,
        evidence_quality: 0.08,
        mitre_complexity: 0.04,
        threat_actor: 0.02,
        asset_criticality: 0.01
      },
      service_indices_weights: {
        svi: 0.35,
        sei: 0.35,
        bci: 0.20,
        eri: 0.10
      },
      controls_discounts: {
        edr_coverage: 15,
        network_segmentation: 10,
        patch_cadence: 10,
        backup_dr_tested: 10,
        iam_mfa_coverage: 5,
        max_reduction_per_dimension: 30
      },
      type_multipliers: {
        security: 1.00,
        operational: 0.95,
        compliance: 0.90,
        strategic: 0.95
      },
      risk_bands: {
        critical: 0.85,
        high: 0.65,
        medium: 0.40,
        low: 0.0
      }
    };
  }

  private getDefaultServiceIndices(): ServiceIndices {
    return { svi: 30, sei: 20, bci: 50, eri: 10, composite: 30 };
  }

  private getDefaultControlsDiscount(): ControlsDiscount {
    return {
      edr_coverage: 0,
      network_segmentation: 0,
      patch_cadence: 0,
      backup_dr_tested: 0,
      iam_mfa_coverage: 0,
      total_discount: 0
    };
  }

  private generateCorrelationId(): string {
    return `enhanced-risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Placeholder implementations for helper methods
  private async getCachedServiceIndices(serviceId: number): Promise<ServiceIndices | null> { return null; }
  private async cacheServiceIndices(serviceId: number, indices: ServiceIndices): Promise<void> {}
  private analyzeKillChainCoverage(events: any[]): number { return 0.5; }
  private async calculateExploitability(riskData: any): Promise<number> { return 50; }
  private async calculateTICorroboration(riskData: any): Promise<number> { return 30; }
  private async calculateChangeRisk(riskData: any): Promise<number> { return 20; }
  private async getSVICriticalAssets(riskData: any): Promise<number> { return 40; }
  private async getDataSensitivity(riskData: any): Promise<number> { return 60; }
  private async getRegulatoryFines(riskData: any): Promise<number> { return 30; }
  private async getDependencyWeight(riskData: any): Promise<number> { return 25; }
  private async calculateEnhancedConfidence(riskData: any): Promise<number> { return 0.8; }
  private async calculateFreshnessScore(riskData: any): Promise<number> { return 0.9; }
  private async calculateEvidenceQuality(evidence: any[]): Promise<number> { return 0.7; }
  private async calculateMITREComplexity(techniques: string[]): Promise<number> { return 0.6; }
  private async calculateThreatActorScore(actors: string[]): Promise<number> { return 0.5; }
  private async calculateAssetCriticality(assetId?: number): Promise<number> { return 0.7; }
  private async getDataFreshness(serviceId?: number): Promise<number> { return 1; }
}

export default EnhancedRiskScoringOptimizer;