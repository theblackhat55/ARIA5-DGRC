/**
 * Tenant Policy Manager
 * Provides tenant-configurable JSON policies for risk scoring, thresholds, and decision criteria
 * Enables per-tenant customization without code changes
 */

export interface TenantPolicySchema {
  tenant_id: number;
  policy_version: string;
  effective_date: string;
  
  // Risk scoring configuration
  scoring: {
    version: string;
    weights: ScoringWeights;
    service_indices: ServiceIndicesConfig;
    controls: ControlsConfig;
    type_multipliers: TypeMultipliers;
    bands: RiskBands;
  };
  
  // Dynamic risk creation
  creation: {
    triggers: TriggerConfig;
    thresholds: DecisionThresholds;
    deduplication: DeduplicationConfig;
    rate_limits: RateLimits;
  };
  
  // AI analysis configuration
  ai_analysis: {
    enabled: boolean;
    providers: AIProviderConfig[];
    governance: AIGovernanceConfig;
    performance: AIPerformanceConfig;
  };
  
  // Operational settings
  operations: {
    processing_enabled: boolean;
    queue_settings: QueueConfig;
    performance_targets: PerformanceTargets;
    retention_policies: RetentionConfig;
  };
}

export interface ScoringWeights {
  likelihood: number;
  impact: number;
  confidence: number;
  freshness: number;
  evidence_quality: number;
  mitre_complexity: number;
  threat_actor: number;
  asset_criticality: number;
}

export interface ServiceIndicesConfig {
  weights: {
    svi: number;
    sei: number;
    bci: number;
    eri: number;
  };
  svi_factors: {
    cvss_weighted_mean: number;
    kev_present: number;
    public_exploit: number;
    patch_sla_overdue: number;
    internet_exposed: number;
    asset_criticality: number;
    decay_half_life_days: number;
  };
  sei_factors: {
    high_critical_incidents: number;
    multi_stage_correlation: number;
    recency_boost_72h: number;
    escalations_linked: number;
    dwell_time_penalty: number;
    ewma_alpha: number;
  };
  bci_factors: {
    cia_baseline_max: number;
    downtime_cost_max: number;
    sla_penalty_max: number;
    customer_reach_max: number;
  };
  eri_factors: {
    geopolitical_max: number;
    industry_threat_max: number;
    regulatory_pressure_max: number;
    vendor_breach_bonus: number;
  };
}

export interface ControlsConfig {
  discounts: {
    edr_coverage: number;
    network_segmentation: number;
    patch_cadence: number;
    backup_dr_tested: number;
    iam_mfa_coverage: number;
    max_reduction_per_dimension: number;
  };
  maturity_thresholds: {
    edr_coverage_threshold: number;
    mfa_coverage_threshold: number;
    patch_sla_days: number;
    backup_test_max_days: number;
    segmentation_score_min: number;
  };
}

export interface TypeMultipliers {
  security: number;
  operational: number;
  compliance: number;
  strategic: number;
  financial: number;
  reputational: number;
}

export interface RiskBands {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TriggerConfig {
  security: {
    defender_incidents_enabled: boolean;
    kev_cve_enabled: boolean;
    ti_corroboration_enabled: boolean;
    multi_stage_enabled: boolean;
    data_exfil_enabled: boolean;
    severity_thresholds: {
      defender_min_severity: number;
      ti_min_confidence: number;
      kill_chain_min_coverage: number;
    };
  };
  operational: {
    servicenow_enabled: boolean;
    change_failure_enabled: boolean;
    capacity_enabled: boolean;
    sla_breach_enabled: boolean;
    thresholds: {
      incident_recurrence_threshold: number;
      business_impact_hours_threshold: number;
      capacity_utilization_threshold: number;
    };
  };
  compliance: {
    mfa_coverage_enabled: boolean;
    stale_evidence_enabled: boolean;
    audit_findings_enabled: boolean;
    control_disabled_enabled: boolean;
    thresholds: {
      mfa_coverage_threshold: number;
      evidence_staleness_days: number;
      compliance_gap_threshold: number;
    };
  };
  strategic: {
    vendor_breach_enabled: boolean;
    geo_escalation_enabled: boolean;
    regulatory_enabled: boolean;
    supply_chain_enabled: boolean;
    thresholds: {
      business_impact_threshold: number;
      geo_risk_threshold: number;
      regulatory_timeline_days: number;
    };
  };
}

export interface DecisionThresholds {
  auto_approve: {
    confidence_min: number;
    composite_score_min: number;
    kev_exposed_shortcut: boolean;
    bci_threshold_for_kev: number;
    special_conditions: {
      data_exfil_auto_approve: boolean;
      audit_finding_auto_approve: boolean;
      vendor_breach_threshold: number;
    };
  };
  pending: {
    confidence_min: number;
    confidence_max: number;
    composite_score_min: number;
    composite_score_max: number;
  };
  suppress: {
    confidence_max: number;
    composite_score_max: number;
    exclusions: string[];
  };
}

export interface DeduplicationConfig {
  enabled: boolean;
  similarity_threshold: number;
  evidence_overlap_threshold: number;
  time_window_hours: number;
  merge_conditions: {
    same_service_required: boolean;
    same_category_required: boolean;
    confidence_upgrade_threshold: number;
  };
}

export interface RateLimits {
  max_risks_per_service_per_day: number;
  max_risks_per_tenant_per_hour: number;
  category_limits: {
    security: number;
    operational: number;
    compliance: number;
    strategic: number;
  };
}

export interface AIProviderConfig {
  provider_name: string;
  model: string;
  enabled: boolean;
  temperature: number;
  max_tokens: number;
  timeout_ms: number;
  cost_per_1k_tokens: number;
  priority: number;
}

export interface AIGovernanceConfig {
  auto_approval_enabled: boolean;
  human_review_required_confidence_threshold: number;
  pii_redaction_enabled: boolean;
  no_training_enforced: boolean;
  audit_retention_days: number;
  output_validation_strict: boolean;
}

export interface AIPerformanceConfig {
  daily_token_limit: number;
  concurrent_requests_limit: number;
  cache_enabled: boolean;
  cache_ttl_hours: number;
  fallback_enabled: boolean;
}

export interface QueueConfig {
  risk_engine_queue: {
    enabled: boolean;
    batch_size: number;
    processing_interval_seconds: number;
    retry_attempts: number;
  };
  ai_analysis_queue: {
    enabled: boolean;
    batch_size: number;
    processing_interval_seconds: number;
    priority_processing: boolean;
  };
}

export interface PerformanceTargets {
  slos: {
    candidate_creation_latency_minutes: number;
    rescoring_latency_minutes: number;
    api_p95_latency_ms: number;
  };
  kpis: {
    auto_approval_reversal_rate_max: number;
    duplicate_candidate_rate_max: number;
    missed_high_incidents_rate_max: number;
    ai_plan_acceptance_rate_min: number;
    ingestion_success_rate_min: number;
    ingestion_median_lag_minutes: number;
  };
}

export interface RetentionConfig {
  risk_score_history_days: number;
  ai_analysis_days: number;
  security_events_days: number;
  external_signals_days: number;
  audit_logs_days: number;
}

export class TenantPolicyManager {
  private db: D1Database;
  private cache: Map<string, TenantPolicySchema> = new Map();
  private cacheTTL: number = 300000; // 5 minutes
  private cacheTimestamps: Map<string, number> = new Map();

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Get tenant policy with caching and fallback to defaults
   */
  async getTenantPolicy(tenantId: number): Promise<TenantPolicySchema> {
    const cacheKey = `tenant_${tenantId}`;
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    try {
      // Load from database
      const policy = await this.loadTenantPolicyFromDB(tenantId);
      
      // Cache the result
      this.cache.set(cacheKey, policy);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      return policy;

    } catch (error) {
      console.error('[Tenant-Policy] Failed to load tenant policy', {
        tenant_id: tenantId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fallback to default policy
      return this.getDefaultTenantPolicy(tenantId);
    }
  }

  /**
   * Update tenant policy with validation
   */
  async updateTenantPolicy(
    tenantId: number,
    policy: Partial<TenantPolicySchema>,
    updatedBy: number
  ): Promise<{ success: boolean; errors: string[] }> {
    
    try {
      // Validate policy
      const validationResult = this.validatePolicy(policy);
      if (validationResult.errors.length > 0) {
        return validationResult;
      }

      // Get current policy and merge
      const currentPolicy = await this.getTenantPolicy(tenantId);
      const mergedPolicy = this.mergePolicy(currentPolicy, policy);

      // Store in database
      await this.storeTenantPolicy(tenantId, mergedPolicy, updatedBy);

      // Clear cache
      this.cache.delete(`tenant_${tenantId}`);
      this.cacheTimestamps.delete(`tenant_${tenantId}`);

      console.log('[Tenant-Policy] Policy updated', {
        tenant_id: tenantId,
        updated_by: updatedBy,
        version: mergedPolicy.policy_version
      });

      return { success: true, errors: [] };

    } catch (error) {
      console.error('[Tenant-Policy] Policy update failed', {
        tenant_id: tenantId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        errors: [`Policy update failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Get policy weights for risk scoring
   */
  async getScoringWeights(tenantId: number): Promise<ScoringWeights> {
    const policy = await this.getTenantPolicy(tenantId);
    return policy.scoring.weights;
  }

  /**
   * Get service indices configuration
   */
  async getServiceIndicesConfig(tenantId: number): Promise<ServiceIndicesConfig> {
    const policy = await this.getTenantPolicy(tenantId);
    return policy.scoring.service_indices;
  }

  /**
   * Get decision thresholds for risk creation
   */
  async getDecisionThresholds(tenantId: number): Promise<DecisionThresholds> {
    const policy = await this.getTenantPolicy(tenantId);
    return policy.creation.thresholds;
  }

  /**
   * Get controls configuration
   */
  async getControlsConfig(tenantId: number): Promise<ControlsConfig> {
    const policy = await this.getTenantPolicy(tenantId);
    return policy.scoring.controls;
  }

  /**
   * Export policy as JSON for backup/migration
   */
  async exportTenantPolicy(tenantId: number): Promise<string> {
    const policy = await this.getTenantPolicy(tenantId);
    return JSON.stringify(policy, null, 2);
  }

  /**
   * Import policy from JSON with validation
   */
  async importTenantPolicy(
    tenantId: number,
    policyJson: string,
    importedBy: number
  ): Promise<{ success: boolean; errors: string[] }> {
    
    try {
      const policy = JSON.parse(policyJson) as TenantPolicySchema;
      
      // Validate imported policy
      const validationResult = this.validatePolicy(policy);
      if (validationResult.errors.length > 0) {
        return validationResult;
      }

      // Store imported policy
      policy.tenant_id = tenantId;
      policy.effective_date = new Date().toISOString();
      
      await this.storeTenantPolicy(tenantId, policy, importedBy);

      // Clear cache
      this.cache.delete(`tenant_${tenantId}`);
      
      return { success: true, errors: [] };

    } catch (error) {
      return {
        success: false,
        errors: [`Policy import failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`]
      };
    }
  }

  /**
   * Load policy from database
   */
  private async loadTenantPolicyFromDB(tenantId: number): Promise<TenantPolicySchema> {
    
    // Check for tenant-specific policy
    const tenantPolicy = await this.db.prepare(`
      SELECT policy_json, policy_version, effective_date
      FROM tenant_policies
      WHERE tenant_id = ? AND is_active = 1
      ORDER BY effective_date DESC
      LIMIT 1
    `).bind(tenantId).first();

    if (tenantPolicy) {
      const policy = JSON.parse(tenantPolicy.policy_json) as TenantPolicySchema;
      policy.tenant_id = tenantId;
      return policy;
    }

    // Fallback to system default policy
    const systemPolicy = await this.db.prepare(`
      SELECT value FROM system_config WHERE key = 'tenant_risk_policy'
    `).first();

    if (systemPolicy?.value) {
      // Convert old format to new schema format
      const oldFormat = JSON.parse(systemPolicy.value);
      return this.convertLegacyPolicy(tenantId, oldFormat);
    }

    // Ultimate fallback to hardcoded default
    return this.getDefaultTenantPolicy(tenantId);
  }

  /**
   * Store policy in database with versioning
   */
  private async storeTenantPolicy(
    tenantId: number,
    policy: TenantPolicySchema,
    updatedBy: number
  ): Promise<void> {
    
    // Generate new version
    const version = `v${Date.now()}`;
    policy.policy_version = version;
    policy.effective_date = new Date().toISOString();

    // Deactivate current policy
    await this.db.prepare(`
      UPDATE tenant_policies 
      SET is_active = 0 
      WHERE tenant_id = ? AND is_active = 1
    `).bind(tenantId).run();

    // Insert new policy version
    await this.db.prepare(`
      INSERT INTO tenant_policies (
        tenant_id, policy_version, policy_json, 
        effective_date, created_by, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?)
    `).bind(
      tenantId,
      version,
      JSON.stringify(policy),
      policy.effective_date,
      updatedBy,
      new Date().toISOString()
    ).run();

    // Log policy change
    await this.logPolicyChange(tenantId, version, updatedBy, 'policy_updated');
  }

  /**
   * Validate policy structure and values
   */
  private validatePolicy(policy: Partial<TenantPolicySchema>): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate scoring weights sum to 1.0
    if (policy.scoring?.weights) {
      const weightSum = Object.values(policy.scoring.weights).reduce((sum, w) => sum + w, 0);
      if (Math.abs(weightSum - 1.0) > 0.01) {
        errors.push(`Scoring weights must sum to 1.0, got ${weightSum.toFixed(3)}`);
      }
    }

    // Validate service indices weights sum to 1.0
    if (policy.scoring?.service_indices?.weights) {
      const indicesSum = Object.values(policy.scoring.service_indices.weights).reduce((sum, w) => sum + w, 0);
      if (Math.abs(indicesSum - 1.0) > 0.01) {
        errors.push(`Service indices weights must sum to 1.0, got ${indicesSum.toFixed(3)}`);
      }
    }

    // Validate threshold ranges
    if (policy.creation?.thresholds) {
      const thresholds = policy.creation.thresholds;
      
      if (thresholds.auto_approve?.confidence_min > 1.0 || thresholds.auto_approve?.confidence_min < 0.0) {
        errors.push('Auto-approve confidence threshold must be between 0.0 and 1.0');
      }

      if (thresholds.suppress?.composite_score_max > 100 || thresholds.suppress?.composite_score_max < 0) {
        errors.push('Suppress composite score threshold must be between 0 and 100');
      }
    }

    // Validate AI configuration
    if (policy.ai_analysis?.providers) {
      for (const provider of policy.ai_analysis.providers) {
        if (provider.temperature < 0 || provider.temperature > 2) {
          errors.push(`AI provider temperature must be between 0 and 2, got ${provider.temperature}`);
        }
        
        if (provider.max_tokens < 100 || provider.max_tokens > 4096) {
          errors.push(`AI provider max_tokens must be between 100 and 4096, got ${provider.max_tokens}`);
        }
      }
    }

    return { success: errors.length === 0, errors };
  }

  /**
   * Merge partial policy update with existing policy
   */
  private mergePolicy(
    current: TenantPolicySchema,
    update: Partial<TenantPolicySchema>
  ): TenantPolicySchema {
    
    // Deep merge logic (simplified)
    const merged = JSON.parse(JSON.stringify(current));
    
    if (update.scoring) {
      if (update.scoring.weights) merged.scoring.weights = { ...merged.scoring.weights, ...update.scoring.weights };
      if (update.scoring.service_indices) merged.scoring.service_indices = { ...merged.scoring.service_indices, ...update.scoring.service_indices };
      if (update.scoring.controls) merged.scoring.controls = { ...merged.scoring.controls, ...update.scoring.controls };
    }

    if (update.creation) {
      if (update.creation.thresholds) merged.creation.thresholds = { ...merged.creation.thresholds, ...update.creation.thresholds };
      if (update.creation.triggers) merged.creation.triggers = { ...merged.creation.triggers, ...update.creation.triggers };
    }

    // Update metadata
    merged.policy_version = `v${Date.now()}`;
    merged.effective_date = new Date().toISOString();

    return merged;
  }

  /**
   * Convert legacy policy format to new schema
   */
  private convertLegacyPolicy(tenantId: number, oldFormat: any): TenantPolicySchema {
    return {
      tenant_id: tenantId,
      policy_version: 'v2.0-migrated',
      effective_date: new Date().toISOString(),
      
      scoring: {
        version: 'v2.0',
        weights: oldFormat.scoring_weights || this.getDefaultScoringWeights(),
        service_indices: {
          weights: oldFormat.service_indices_weights || { svi: 0.35, sei: 0.35, bci: 0.20, eri: 0.10 },
          svi_factors: oldFormat.svi_factors || this.getDefaultSVIFactors(),
          sei_factors: oldFormat.sei_factors || this.getDefaultSEIFactors(),
          bci_factors: this.getDefaultBCIFactors(),
          eri_factors: this.getDefaultERIFactors()
        },
        controls: {
          discounts: oldFormat.controls_discounts || this.getDefaultControlsDiscounts(),
          maturity_thresholds: this.getDefaultMaturityThresholds()
        },
        type_multipliers: oldFormat.type_multipliers || this.getDefaultTypeMultipliers(),
        bands: oldFormat.risk_bands || this.getDefaultRiskBands()
      },
      
      creation: {
        triggers: this.getDefaultTriggerConfig(),
        thresholds: this.getDefaultDecisionThresholds(),
        deduplication: this.getDefaultDeduplicationConfig(),
        rate_limits: this.getDefaultRateLimits()
      },
      
      ai_analysis: this.getDefaultAIConfig(),
      operations: this.getDefaultOperationsConfig()
    };
  }

  /**
   * Get default policy for new tenants
   */
  private getDefaultTenantPolicy(tenantId: number): TenantPolicySchema {
    return {
      tenant_id: tenantId,
      policy_version: 'v2.0-default',
      effective_date: new Date().toISOString(),
      
      scoring: {
        version: 'v2.0',
        weights: this.getDefaultScoringWeights(),
        service_indices: {
          weights: { svi: 0.35, sei: 0.35, bci: 0.20, eri: 0.10 },
          svi_factors: this.getDefaultSVIFactors(),
          sei_factors: this.getDefaultSEIFactors(),
          bci_factors: this.getDefaultBCIFactors(),
          eri_factors: this.getDefaultERIFactors()
        },
        controls: {
          discounts: this.getDefaultControlsDiscounts(),
          maturity_thresholds: this.getDefaultMaturityThresholds()
        },
        type_multipliers: this.getDefaultTypeMultipliers(),
        bands: this.getDefaultRiskBands()
      },
      
      creation: {
        triggers: this.getDefaultTriggerConfig(),
        thresholds: this.getDefaultDecisionThresholds(),
        deduplication: this.getDefaultDeduplicationConfig(),
        rate_limits: this.getDefaultRateLimits()
      },
      
      ai_analysis: this.getDefaultAIConfig(),
      operations: this.getDefaultOperationsConfig()
    };
  }

  // Default configuration methods
  private getDefaultScoringWeights(): ScoringWeights {
    return {
      likelihood: 0.25,
      impact: 0.30,
      confidence: 0.20,
      freshness: 0.10,
      evidence_quality: 0.08,
      mitre_complexity: 0.04,
      threat_actor: 0.02,
      asset_criticality: 0.01
    };
  }

  private getDefaultSVIFactors(): any {
    return {
      cvss_weighted_mean: 30,
      kev_present: 20,
      public_exploit: 10,
      patch_sla_overdue: 10,
      internet_exposed: 15,
      asset_criticality: 10,
      decay_half_life_days: 30
    };
  }

  private getDefaultSEIFactors(): any {
    return {
      high_critical_incidents: 35,
      multi_stage_correlation: 20,
      recency_boost_72h: 20,
      escalations_linked: 15,
      dwell_time_penalty: 10,
      ewma_alpha: 0.6
    };
  }

  private getDefaultBCIFactors(): any {
    return {
      cia_baseline_max: 60,
      downtime_cost_max: 20,
      sla_penalty_max: 10,
      customer_reach_max: 10
    };
  }

  private getDefaultERIFactors(): any {
    return {
      geopolitical_max: 40,
      industry_threat_max: 30,
      regulatory_pressure_max: 20,
      vendor_breach_bonus: 10
    };
  }

  private getDefaultControlsDiscounts(): any {
    return {
      edr_coverage: 15,
      network_segmentation: 10,
      patch_cadence: 10,
      backup_dr_tested: 10,
      iam_mfa_coverage: 5,
      max_reduction_per_dimension: 30
    };
  }

  private getDefaultMaturityThresholds(): any {
    return {
      edr_coverage_threshold: 90,
      mfa_coverage_threshold: 95,
      patch_sla_days: 7,
      backup_test_max_days: 90,
      segmentation_score_min: 70
    };
  }

  private getDefaultTypeMultipliers(): TypeMultipliers {
    return {
      security: 1.00,
      operational: 0.95,
      compliance: 0.90,
      strategic: 0.95,
      financial: 0.85,
      reputational: 0.80
    };
  }

  private getDefaultRiskBands(): RiskBands {
    return {
      critical: 0.85,
      high: 0.65,
      medium: 0.40,
      low: 0.0
    };
  }

  private getDefaultTriggerConfig(): TriggerConfig {
    return {
      security: {
        defender_incidents_enabled: true,
        kev_cve_enabled: true,
        ti_corroboration_enabled: true,
        multi_stage_enabled: true,
        data_exfil_enabled: true,
        severity_thresholds: {
          defender_min_severity: 75,
          ti_min_confidence: 0.6,
          kill_chain_min_coverage: 0.6
        }
      },
      operational: {
        servicenow_enabled: true,
        change_failure_enabled: true,
        capacity_enabled: true,
        sla_breach_enabled: true,
        thresholds: {
          incident_recurrence_threshold: 2,
          business_impact_hours_threshold: 1,
          capacity_utilization_threshold: 85
        }
      },
      compliance: {
        mfa_coverage_enabled: true,
        stale_evidence_enabled: true,
        audit_findings_enabled: true,
        control_disabled_enabled: true,
        thresholds: {
          mfa_coverage_threshold: 80,
          evidence_staleness_days: 30,
          compliance_gap_threshold: 20
        }
      },
      strategic: {
        vendor_breach_enabled: true,
        geo_escalation_enabled: true,
        regulatory_enabled: true,
        supply_chain_enabled: true,
        thresholds: {
          business_impact_threshold: 1000000,
          geo_risk_threshold: 70,
          regulatory_timeline_days: 90
        }
      }
    };
  }

  private getDefaultDecisionThresholds(): DecisionThresholds {
    return {
      auto_approve: {
        confidence_min: 0.85,
        composite_score_min: 80,
        kev_exposed_shortcut: true,
        bci_threshold_for_kev: 70,
        special_conditions: {
          data_exfil_auto_approve: true,
          audit_finding_auto_approve: true,
          vendor_breach_threshold: 1000000
        }
      },
      pending: {
        confidence_min: 0.50,
        confidence_max: 0.85,
        composite_score_min: 50,
        composite_score_max: 80
      },
      suppress: {
        confidence_max: 0.50,
        composite_score_max: 40,
        exclusions: ['audit_finding', 'data_exfil']
      }
    };
  }

  private getDefaultDeduplicationConfig(): DeduplicationConfig {
    return {
      enabled: true,
      similarity_threshold: 0.8,
      evidence_overlap_threshold: 0.5,
      time_window_hours: 48,
      merge_conditions: {
        same_service_required: true,
        same_category_required: true,
        confidence_upgrade_threshold: 0.1
      }
    };
  }

  private getDefaultRateLimits(): RateLimits {
    return {
      max_risks_per_service_per_day: 50,
      max_risks_per_tenant_per_hour: 200,
      category_limits: {
        security: 100,
        operational: 50,
        compliance: 30,
        strategic: 20
      }
    };
  }

  private getDefaultAIConfig(): any {
    return {
      enabled: true,
      providers: [
        {
          provider_name: 'cloudflare_workers_ai',
          model: '@cf/meta/llama-3.1-8b-instruct',
          enabled: true,
          temperature: 0.3,
          max_tokens: 1024,
          timeout_ms: 30000,
          cost_per_1k_tokens: 0.01,
          priority: 1
        }
      ],
      governance: {
        auto_approval_enabled: false,
        human_review_required_confidence_threshold: 0.8,
        pii_redaction_enabled: true,
        no_training_enforced: true,
        audit_retention_days: 90,
        output_validation_strict: true
      },
      performance: {
        daily_token_limit: 50000,
        concurrent_requests_limit: 10,
        cache_enabled: true,
        cache_ttl_hours: 24,
        fallback_enabled: true
      }
    };
  }

  private getDefaultOperationsConfig(): any {
    return {
      processing_enabled: true,
      queue_settings: {
        risk_engine_queue: {
          enabled: true,
          batch_size: 10,
          processing_interval_seconds: 300,
          retry_attempts: 3
        },
        ai_analysis_queue: {
          enabled: true,
          batch_size: 5,
          processing_interval_seconds: 60,
          priority_processing: true
        }
      },
      performance_targets: {
        slos: {
          candidate_creation_latency_minutes: 10,
          rescoring_latency_minutes: 15,
          api_p95_latency_ms: 800
        },
        kpis: {
          auto_approval_reversal_rate_max: 0.05,
          duplicate_candidate_rate_max: 0.03,
          missed_high_incidents_rate_max: 0.02,
          ai_plan_acceptance_rate_min: 0.65,
          ingestion_success_rate_min: 0.99,
          ingestion_median_lag_minutes: 5
        }
      },
      retention_policies: {
        risk_score_history_days: 365,
        ai_analysis_days: 90,
        security_events_days: 180,
        external_signals_days: 90,
        audit_logs_days: 2555 // 7 years
      }
    };
  }

  // Helper methods
  private isCacheValid(cacheKey: string): boolean {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    return timestamp ? (Date.now() - timestamp) < this.cacheTTL : false;
  }

  private async logPolicyChange(
    tenantId: number,
    version: string,
    userId: number,
    action: string
  ): Promise<void> {
    
    try {
      await this.db.prepare(`
        INSERT INTO tenant_policy_audit (
          tenant_id, policy_version, action, changed_by, timestamp
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        tenantId,
        version,
        action,
        userId,
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('[Tenant-Policy] Failed to log policy change', { error });
    }
  }
}

export default TenantPolicyManager;