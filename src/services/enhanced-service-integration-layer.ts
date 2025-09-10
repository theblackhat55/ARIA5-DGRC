/**
 * Enhanced Service Integration Layer
 * Provides seamless integration between ARIA5.1 existing services and Enhanced Risk Engine
 * Maintains backward compatibility while enabling progressive enhancement
 */

import EnhancedRiskScoringOptimizer from '../lib/enhanced-risk-scoring-optimizer';
import EnhancedDynamicRiskManager from './enhanced-dynamic-risk-manager';
import AIAnalysisService from './ai-analysis-service';
import TenantPolicyManager from '../lib/tenant-policy-manager';

// Import existing ARIA5.1 services
import DynamicRiskDiscovery from './dynamic-risk-discovery';
import ThreatIntelligence from './threat-intelligence';
import ServiceCentricRiskScoring from './service-centric-risk-scoring';

export interface ServiceIntegrationConfig {
  enhanced_engine_enabled: boolean;
  progressive_rollout_percent: number;
  fallback_to_legacy: boolean;
  performance_monitoring: boolean;
  ai_analysis_enabled: boolean;
  tenant_policies_enabled: boolean;
}

export interface EnhancedServiceCapabilities {
  service_indices_computation: boolean;
  ai_native_analysis: boolean;
  explainable_scoring: boolean;
  multi_trigger_support: boolean;
  real_time_updates: boolean;
  tenant_configurability: boolean;
}

export class EnhancedServiceIntegrationLayer {
  private db: D1Database;
  private aiBinding?: any;
  private config: ServiceIntegrationConfig;
  
  // Enhanced Services
  private enhancedRiskScoringOptimizer: EnhancedRiskScoringOptimizer;
  private enhancedDynamicRiskManager: EnhancedDynamicRiskManager;
  private aiAnalysisService: AIAnalysisService;
  private tenantPolicyManager: TenantPolicyManager;
  
  // Existing ARIA5.1 Services (for fallback/hybrid operation)
  private legacyDynamicRiskDiscovery: DynamicRiskDiscovery;
  private legacyThreatIntelligence: ThreatIntelligence;
  private legacyServiceCentricRiskScoring: ServiceCentricRiskScoring;
  
  // Integration state
  private isInitialized: boolean = false;
  private performanceMetrics: Map<string, any> = new Map();
  
  constructor(db: D1Database, aiBinding?: any, config?: Partial<ServiceIntegrationConfig>) {
    this.db = db;
    this.aiBinding = aiBinding;
    
    // Default configuration
    this.config = {
      enhanced_engine_enabled: false,
      progressive_rollout_percent: 0,
      fallback_to_legacy: true,
      performance_monitoring: true,
      ai_analysis_enabled: false,
      tenant_policies_enabled: false,
      ...config
    };
  }
  
  /**
   * Initialize the integration layer with progressive enhancement
   */
  async initialize(): Promise<void> {
    try {
      console.log('[Service-Integration] Initializing Enhanced Service Integration Layer');
      
      // Load configuration from database
      await this.loadConfigurationFromDatabase();
      
      // Initialize existing ARIA5.1 services first (legacy compatibility)
      await this.initializeLegacyServices();
      
      // Initialize enhanced services if enabled
      if (this.config.enhanced_engine_enabled) {
        await this.initializeEnhancedServices();
      }
      
      // Setup performance monitoring
      if (this.config.performance_monitoring) {
        await this.initializePerformanceMonitoring();
      }
      
      this.isInitialized = true;
      
      console.log('[Service-Integration] Integration layer initialized', {
        enhanced_enabled: this.config.enhanced_engine_enabled,
        rollout_percent: this.config.progressive_rollout_percent,
        ai_enabled: this.config.ai_analysis_enabled
      });
      
    } catch (error) {
      console.error('[Service-Integration] Initialization failed:', error);
      
      // Fallback to legacy services only
      await this.initializeLegacyServices();
      this.config.enhanced_engine_enabled = false;
      this.isInitialized = true;
    }
  }
  
  /**
   * Smart routing for risk creation requests
   */
  async createRisk(riskData: any, options?: { force_enhanced?: boolean; user_id?: string }): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Determine routing strategy
      const useEnhanced = this.shouldUseEnhancedEngine(riskData, options);
      
      let result;
      if (useEnhanced && this.config.enhanced_engine_enabled) {
        result = await this.createEnhancedRisk(riskData);
        await this.recordMetric('enhanced_risk_creation', Date.now() - startTime, true);
      } else {
        result = await this.createLegacyRisk(riskData);
        await this.recordMetric('legacy_risk_creation', Date.now() - startTime, true);
      }
      
      return {
        ...result,
        engine_used: useEnhanced ? 'enhanced' : 'legacy',
        fallback_occurred: !useEnhanced && this.config.enhanced_engine_enabled
      };
      
    } catch (error) {
      await this.recordMetric('risk_creation_error', Date.now() - startTime, false);
      
      // Fallback strategy
      if (this.config.fallback_to_legacy && this.config.enhanced_engine_enabled) {
        console.warn('[Service-Integration] Enhanced risk creation failed, falling back to legacy');
        try {
          const result = await this.createLegacyRisk(riskData);
          return {
            ...result,
            engine_used: 'legacy_fallback',
            fallback_occurred: true,
            original_error: error instanceof Error ? error.message : 'Unknown error'
          };
        } catch (fallbackError) {
          console.error('[Service-Integration] Fallback also failed:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Smart routing for risk scoring requests
   */
  async calculateRiskScore(riskData: any, options?: { use_enhanced?: boolean }): Promise<any> {
    const startTime = Date.now();
    
    try {
      const useEnhanced = options?.use_enhanced ?? this.shouldUseEnhancedEngine(riskData, options);
      
      if (useEnhanced && this.config.enhanced_engine_enabled) {
        const result = await this.enhancedRiskScoringOptimizer.calculateEnhancedRiskScore(
          riskData,
          riskData.service_id
        );
        
        await this.recordMetric('enhanced_scoring', Date.now() - startTime, true);
        
        return {
          ...result,
          engine_version: 'v2.0',
          enhanced_features: {
            service_indices: true,
            controls_discount: true,
            explainable_scoring: true
          }
        };
      } else {
        const result = await this.legacyServiceCentricRiskScoring.calculateRiskScore(riskData);
        
        await this.recordMetric('legacy_scoring', Date.now() - startTime, true);
        
        return {
          ...result,
          engine_version: 'v1.0',
          enhanced_features: {
            service_indices: false,
            controls_discount: false,
            explainable_scoring: false
          }
        };
      }
      
    } catch (error) {
      await this.recordMetric('scoring_error', Date.now() - startTime, false);
      throw error;
    }
  }
  
  /**
   * Service indices computation (enhanced feature only)
   */
  async getServiceIndices(serviceId: number): Promise<any> {
    if (!this.config.enhanced_engine_enabled) {
      throw new Error('Service indices computation requires enhanced engine');
    }
    
    const startTime = Date.now();
    
    try {
      const indices = await this.enhancedRiskScoringOptimizer.computeServiceIndices(serviceId);
      
      await this.recordMetric('service_indices_computation', Date.now() - startTime, true);
      
      return {
        service_id: serviceId,
        indices,
        enhanced_feature: true,
        computed_at: new Date().toISOString()
      };
      
    } catch (error) {
      await this.recordMetric('service_indices_error', Date.now() - startTime, false);
      throw error;
    }
  }
  
  /**
   * AI analysis integration (enhanced feature only)
   */
  async requestAIAnalysis(riskId: number, analysisInput: any): Promise<any> {
    if (!this.config.ai_analysis_enabled) {
      throw new Error('AI analysis requires enhanced engine with AI capabilities');
    }
    
    const startTime = Date.now();
    
    try {
      const result = await this.aiAnalysisService.analyzeRisk({
        risk_id: riskId,
        ...analysisInput
      });
      
      await this.recordMetric('ai_analysis', Date.now() - startTime, true);
      
      return {
        analysis_id: result.analysis_id,
        risk_id: riskId,
        status: 'completed',
        enhanced_feature: true,
        analyzed_at: new Date().toISOString()
      };
      
    } catch (error) {
      await this.recordMetric('ai_analysis_error', Date.now() - startTime, false);
      throw error;
    }
  }
  
  /**
   * Hybrid service information (combines legacy + enhanced data)
   */
  async getServiceInformation(serviceId: number, includeEnhanced: boolean = true): Promise<any> {
    try {
      // Get basic service information (from existing ARIA5.1 system)
      const basicService = await this.db.prepare(`
        SELECT 
          id, name, category, criticality_level,
          confidentiality_score, integrity_score, availability_score,
          created_at, updated_at
        FROM services
        WHERE id = ?
      `).bind(serviceId).first();
      
      if (!basicService) {
        throw new Error(`Service ${serviceId} not found`);
      }
      
      const serviceInfo: any = {
        ...basicService,
        enhanced_data_available: this.config.enhanced_engine_enabled && includeEnhanced
      };
      
      // Add enhanced data if available and requested
      if (this.config.enhanced_engine_enabled && includeEnhanced) {
        try {
          const indices = await this.enhancedRiskScoringOptimizer.computeServiceIndices(serviceId);
          serviceInfo.service_indices = indices;
          serviceInfo.enhanced_capabilities = await this.getServiceEnhancedCapabilities(serviceId);
        } catch (error) {
          console.warn(`[Service-Integration] Could not load enhanced data for service ${serviceId}:`, error);
          serviceInfo.enhanced_data_error = error instanceof Error ? error.message : 'Unknown error';
        }
      }
      
      return serviceInfo;
      
    } catch (error) {
      console.error(`[Service-Integration] Failed to get service information for ${serviceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Migration utility for enhancing existing risks
   */
  async migrateExistingRisk(riskId: number): Promise<any> {
    if (!this.config.enhanced_engine_enabled) {
      throw new Error('Risk migration requires enhanced engine');
    }
    
    try {
      // Get existing risk
      const existingRisk = await this.db.prepare(`
        SELECT * FROM risks WHERE id = ?
      `).bind(riskId).first();
      
      if (!existingRisk) {
        throw new Error(`Risk ${riskId} not found`);
      }
      
      // Calculate enhanced scoring
      const enhancedResult = await this.enhancedRiskScoringOptimizer.calculateEnhancedRiskScore(
        {
          likelihood: existingRisk.likelihood,
          impact: existingRisk.impact,
          confidence_score: existingRisk.confidence_score,
          category: existingRisk.category,
          title: existingRisk.title,
          description: existingRisk.description
        },
        existingRisk.service_id
      );
      
      // Update risk with enhanced data (additive, non-destructive)
      await this.db.prepare(`
        UPDATE risks SET
          risk_score_composite = ?,
          likelihood_0_100 = ?,
          impact_0_100 = ?,
          service_indices_json = ?,
          controls_discount = ?,
          score_explanation = ?,
          enhanced_migration_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        enhancedResult.risk_score_composite,
        enhancedResult.factors.likelihood_0_100,
        enhancedResult.factors.impact_0_100,
        JSON.stringify(enhancedResult.service_indices),
        enhancedResult.controls_discount.total_discount,
        JSON.stringify(enhancedResult.explanation),
        riskId
      ).run();
      
      return {
        risk_id: riskId,
        migration_completed: true,
        original_score: existingRisk.final_score,
        enhanced_score: enhancedResult.final_score,
        enhancement_delta: enhancedResult.final_score - (existingRisk.final_score || 0),
        migrated_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`[Service-Integration] Risk migration failed for ${riskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get integration layer status and capabilities
   */
  getIntegrationStatus(): {
    initialized: boolean;
    configuration: ServiceIntegrationConfig;
    capabilities: EnhancedServiceCapabilities;
    performance_summary?: any;
  } {
    return {
      initialized: this.isInitialized,
      configuration: this.config,
      capabilities: {
        service_indices_computation: this.config.enhanced_engine_enabled,
        ai_native_analysis: this.config.ai_analysis_enabled,
        explainable_scoring: this.config.enhanced_engine_enabled,
        multi_trigger_support: this.config.enhanced_engine_enabled,
        real_time_updates: this.config.enhanced_engine_enabled,
        tenant_configurability: this.config.tenant_policies_enabled
      },
      performance_summary: this.config.performance_monitoring ? this.getPerformanceSummary() : undefined
    };
  }
  
  // Private helper methods
  
  private async loadConfigurationFromDatabase(): Promise<void> {
    try {
      const configRows = await this.db.prepare(`
        SELECT key, value FROM system_config 
        WHERE key LIKE 'enhanced_%' OR key LIKE 'integration_%'
      `).all();
      
      for (const row of (configRows.results || [])) {
        switch (row.key) {
          case 'enhanced_risk_engine_enabled':
            this.config.enhanced_engine_enabled = row.value === 'true';
            break;
          case 'enhanced_rollout_percent':
            this.config.progressive_rollout_percent = parseInt(row.value) || 0;
            break;
          case 'integration_fallback_enabled':
            this.config.fallback_to_legacy = row.value === 'true';
            break;
          case 'enhanced_ai_analysis_enabled':
            this.config.ai_analysis_enabled = row.value === 'true';
            break;
          case 'enhanced_tenant_policies_enabled':
            this.config.tenant_policies_enabled = row.value === 'true';
            break;
        }
      }
    } catch (error) {
      console.warn('[Service-Integration] Could not load configuration from database, using defaults');
    }
  }
  
  private async initializeLegacyServices(): Promise<void> {
    this.legacyDynamicRiskDiscovery = new DynamicRiskDiscovery(this.db);
    this.legacyThreatIntelligence = new ThreatIntelligence(this.db);
    this.legacyServiceCentricRiskScoring = new ServiceCentricRiskScoring(this.db);
  }
  
  private async initializeEnhancedServices(): Promise<void> {
    this.enhancedRiskScoringOptimizer = new EnhancedRiskScoringOptimizer(this.db);
    this.enhancedDynamicRiskManager = new EnhancedDynamicRiskManager(this.db, this.aiBinding);
    
    if (this.config.ai_analysis_enabled) {
      this.aiAnalysisService = new AIAnalysisService(this.db, this.aiBinding);
    }
    
    if (this.config.tenant_policies_enabled) {
      this.tenantPolicyManager = new TenantPolicyManager(this.db);
    }
  }
  
  private async initializePerformanceMonitoring(): Promise<void> {
    // Create performance tracking tables if they don't exist
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS service_integration_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        success BOOLEAN NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    console.log('[Service-Integration] Performance monitoring initialized');
  }
  
  private shouldUseEnhancedEngine(riskData: any, options?: any): boolean {
    if (!this.config.enhanced_engine_enabled) {
      return false;
    }
    
    if (options?.force_enhanced) {
      return true;
    }
    
    // Progressive rollout logic
    if (this.config.progressive_rollout_percent < 100) {
      const userId = options?.user_id || riskData?.created_by || '0';
      const hash = this.simpleHash(userId);
      if ((hash % 100) >= this.config.progressive_rollout_percent) {
        return false;
      }
    }
    
    // Enhanced engine eligibility criteria
    return (
      riskData.service_id &&
      (riskData.confidence_score || 0) >= 0.3 &&
      !riskData.legacy_only_flag
    );
  }
  
  private async createEnhancedRisk(riskData: any): Promise<any> {
    // Convert to enhanced trigger format
    const trigger = {
      category: riskData.category || 'security',
      source_type: riskData.source_type || 'manual',
      trigger_data: riskData,
      confidence: riskData.confidence_score || 0.5,
      urgency: this.determineUrgency(riskData),
      auto_approve_eligible: false
    };
    
    return await this.enhancedDynamicRiskManager.createDynamicRiskFromTrigger(trigger);
  }
  
  private async createLegacyRisk(riskData: any): Promise<any> {
    return await this.legacyDynamicRiskDiscovery.createRiskFromThreatIntelligence(riskData);
  }
  
  private async getServiceEnhancedCapabilities(serviceId: number): Promise<any> {
    // Check what enhanced capabilities are available for this service
    const capabilities = {
      vulnerability_scanning: false,
      security_events_collection: false,
      business_impact_modeling: false,
      external_intelligence_integration: false
    };
    
    try {
      // Check for vulnerabilities data
      const vulnCheck = await this.db.prepare(`
        SELECT COUNT(*) as count FROM vulnerabilities WHERE service_id = ?
      `).bind(serviceId).first();
      capabilities.vulnerability_scanning = (vulnCheck?.count || 0) > 0;
      
      // Check for security events data
      const eventsCheck = await this.db.prepare(`
        SELECT COUNT(*) as count FROM security_events WHERE service_id = ?
      `).bind(serviceId).first();
      capabilities.security_events_collection = (eventsCheck?.count || 0) > 0;
      
      // Check for external signals
      const signalsCheck = await this.db.prepare(`
        SELECT COUNT(*) as count FROM external_signals WHERE status = 'active'
      `).first();
      capabilities.external_intelligence_integration = (signalsCheck?.count || 0) > 0;
      
      capabilities.business_impact_modeling = true; // Always available through BCI computation
      
    } catch (error) {
      console.warn(`[Service-Integration] Could not assess capabilities for service ${serviceId}`);
    }
    
    return capabilities;
  }
  
  private async recordMetric(operation: string, duration: number, success: boolean, metadata?: any): Promise<void> {
    if (!this.config.performance_monitoring) return;
    
    try {
      await this.db.prepare(`
        INSERT INTO service_integration_metrics (operation, duration_ms, success, metadata)
        VALUES (?, ?, ?, ?)
      `).bind(operation, duration, success, JSON.stringify(metadata || {})).run();
      
      // Keep in-memory cache for quick access
      this.performanceMetrics.set(operation, {
        last_duration: duration,
        last_success: success,
        last_updated: new Date().toISOString()
      });
      
    } catch (error) {
      console.warn('[Service-Integration] Could not record performance metric:', error);
    }
  }
  
  private getPerformanceSummary(): any {
    const summary: any = {
      operations_tracked: this.performanceMetrics.size,
      last_24h_summary: null
    };
    
    // Add in-memory metrics
    const operations: any = {};
    this.performanceMetrics.forEach((value, key) => {
      operations[key] = value;
    });
    summary.recent_operations = operations;
    
    return summary;
  }
  
  private determineUrgency(riskData: any): 'low' | 'medium' | 'high' | 'critical' {
    if (riskData.likelihood >= 4 && riskData.impact >= 4) return 'critical';
    if (riskData.likelihood >= 3 && riskData.impact >= 3) return 'high';
    if (riskData.likelihood >= 2 && riskData.impact >= 2) return 'medium';
    return 'low';
  }
  
  private simpleHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export default EnhancedServiceIntegrationLayer;