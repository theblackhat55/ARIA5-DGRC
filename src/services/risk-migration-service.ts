/**
 * Risk Migration Service
 * Manages the migration of existing ARIA5.1 risks to the Enhanced Risk Engine
 * Provides safe, non-destructive enhancement of legacy risk data
 */

import EnhancedRiskScoringOptimizer from '../lib/enhanced-risk-scoring-optimizer';
import EnhancedDynamicRiskManager from './enhanced-dynamic-risk-manager';
import AIAnalysisService from './ai-analysis-service';

export interface MigrationConfig {
  batch_size: number;
  migration_enabled: boolean;
  dry_run_mode: boolean;
  preserve_legacy_scores: boolean;
  auto_ai_analysis: boolean;
  migration_time_limit_hours: number;
  error_threshold_percent: number;
}

export interface MigrationProgress {
  total_risks: number;
  processed: number;
  enhanced: number;
  skipped: number;
  errors: number;
  success_rate: number;
  estimated_completion: string;
  current_batch: number;
  started_at: string;
  last_updated: string;
}

export interface RiskMigrationResult {
  risk_id: number;
  status: 'enhanced' | 'skipped' | 'error' | 'already_enhanced';
  original_score: number;
  enhanced_score?: number;
  score_delta?: number;
  enhancement_features: {
    service_indices_computed: boolean;
    controls_discount_applied: boolean;
    ai_analysis_scheduled: boolean;
    explainable_scoring_available: boolean;
  };
  processing_time_ms: number;
  error_message?: string;
  migration_timestamp: string;
}

export interface MigrationReport {
  migration_id: string;
  config: MigrationConfig;
  progress: MigrationProgress;
  results: RiskMigrationResult[];
  summary: {
    total_duration_ms: number;
    avg_processing_time_ms: number;
    score_improvements: {
      increased_count: number;
      decreased_count: number;
      unchanged_count: number;
      avg_delta: number;
    };
    feature_adoption: {
      service_indices_enabled: number;
      controls_discount_applied: number;
      ai_analysis_triggered: number;
    };
  };
  recommendations: string[];
}

export class RiskMigrationService {
  private db: D1Database;
  private aiBinding?: any;
  private config: MigrationConfig;
  private enhancedOptimizer: EnhancedRiskScoringOptimizer;
  private enhancedManager: EnhancedDynamicRiskManager;
  private aiService?: AIAnalysisService;
  
  private migrationId: string;
  private isRunning: boolean = false;
  private currentProgress: MigrationProgress;
  private results: RiskMigrationResult[] = [];
  
  constructor(db: D1Database, aiBinding?: any, config?: Partial<MigrationConfig>) {
    this.db = db;
    this.aiBinding = aiBinding;
    
    // Default configuration
    this.config = {
      batch_size: 50,
      migration_enabled: true,
      dry_run_mode: false,
      preserve_legacy_scores: true,
      auto_ai_analysis: false,
      migration_time_limit_hours: 4,
      error_threshold_percent: 10,
      ...config
    };
    
    this.migrationId = this.generateMigrationId();
    this.enhancedOptimizer = new EnhancedRiskScoringOptimizer(db);
    this.enhancedManager = new EnhancedDynamicRiskManager(db, aiBinding);
    
    if (this.config.auto_ai_analysis && aiBinding) {
      this.aiService = new AIAnalysisService(db, aiBinding);
    }
    
    this.currentProgress = this.initializeProgress();
  }
  
  /**
   * Start the migration process for existing risks
   */
  async startMigration(targetRiskIds?: number[]): Promise<string> {
    if (this.isRunning) {
      throw new Error('Migration is already in progress');
    }
    
    if (!this.config.migration_enabled) {
      throw new Error('Risk migration is disabled');
    }
    
    console.log('[Risk-Migration] Starting risk migration process', {
      migration_id: this.migrationId,
      dry_run: this.config.dry_run_mode,
      batch_size: this.config.batch_size
    });
    
    try {
      this.isRunning = true;
      this.currentProgress.started_at = new Date().toISOString();
      
      // Initialize migration tracking
      await this.initializeMigrationTracking();
      
      // Get eligible risks for migration
      const eligibleRisks = await this.getEligibleRisks(targetRiskIds);
      this.currentProgress.total_risks = eligibleRisks.length;
      
      console.log(`[Risk-Migration] Found ${eligibleRisks.length} eligible risks for migration`);
      
      if (eligibleRisks.length === 0) {
        return await this.completeMigration('no_eligible_risks');
      }
      
      // Process risks in batches
      await this.processBatches(eligibleRisks);
      
      return await this.completeMigration('success');
      
    } catch (error) {
      console.error('[Risk-Migration] Migration failed:', error);
      await this.completeMigration('error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * Get migration status and progress
   */
  getMigrationStatus(): {
    migration_id: string;
    is_running: boolean;
    progress: MigrationProgress;
    recent_results: RiskMigrationResult[];
  } {
    return {
      migration_id: this.migrationId,
      is_running: this.isRunning,
      progress: this.currentProgress,
      recent_results: this.results.slice(-10) // Last 10 results
    };
  }
  
  /**
   * Generate comprehensive migration report
   */
  async generateMigrationReport(): Promise<MigrationReport> {
    const startTime = Date.now();
    
    try {
      // Calculate summary statistics
      const summary = this.calculateSummaryStatistics();
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations();
      
      const report: MigrationReport = {
        migration_id: this.migrationId,
        config: this.config,
        progress: this.currentProgress,
        results: this.results,
        summary: {
          total_duration_ms: Date.now() - new Date(this.currentProgress.started_at).getTime(),
          avg_processing_time_ms: summary.avg_processing_time,
          score_improvements: summary.score_improvements,
          feature_adoption: summary.feature_adoption
        },
        recommendations
      };
      
      // Save report to database
      await this.saveMigrationReport(report);
      
      return report;
      
    } catch (error) {
      console.error('[Risk-Migration] Failed to generate migration report:', error);
      throw error;
    }
  }
  
  /**
   * Migrate a single risk (for testing or on-demand migration)
   */
  async migrateSingleRisk(riskId: number): Promise<RiskMigrationResult> {
    const startTime = Date.now();
    
    try {
      // Get existing risk
      const existingRisk = await this.db.prepare(`
        SELECT 
          id, title, description, category, service_id, 
          likelihood, impact, confidence_score, final_score,
          created_at, updated_at, enhanced_migration_date
        FROM risks 
        WHERE id = ?
      `).bind(riskId).first();
      
      if (!existingRisk) {
        return {
          risk_id: riskId,
          status: 'error',
          original_score: 0,
          enhancement_features: this.getDefaultFeatures(),
          processing_time_ms: Date.now() - startTime,
          error_message: 'Risk not found',
          migration_timestamp: new Date().toISOString()
        };
      }
      
      // Check if already enhanced
      if (existingRisk.enhanced_migration_date) {
        return {
          risk_id: riskId,
          status: 'already_enhanced',
          original_score: existingRisk.final_score || 0,
          enhancement_features: await this.checkExistingFeatures(riskId),
          processing_time_ms: Date.now() - startTime,
          migration_timestamp: new Date().toISOString()
        };
      }
      
      // Check eligibility
      if (!this.isRiskEligible(existingRisk)) {
        return {
          risk_id: riskId,
          status: 'skipped',
          original_score: existingRisk.final_score || 0,
          enhancement_features: this.getDefaultFeatures(),
          processing_time_ms: Date.now() - startTime,
          migration_timestamp: new Date().toISOString()
        };
      }
      
      // Perform enhancement
      const enhancementResult = await this.enhanceExistingRisk(existingRisk);
      
      return {
        risk_id: riskId,
        status: 'enhanced',
        original_score: existingRisk.final_score || 0,
        enhanced_score: enhancementResult.enhanced_score,
        score_delta: enhancementResult.enhanced_score - (existingRisk.final_score || 0),
        enhancement_features: enhancementResult.features,
        processing_time_ms: Date.now() - startTime,
        migration_timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        risk_id: riskId,
        status: 'error',
        original_score: 0,
        enhancement_features: this.getDefaultFeatures(),
        processing_time_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        migration_timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Preview migration impact without making changes
   */
  async previewMigration(riskIds?: number[]): Promise<{
    eligible_risks: number;
    preview_results: Array<{
      risk_id: number;
      current_score: number;
      projected_enhanced_score: number;
      score_delta: number;
      enhancement_available: boolean;
    }>;
    estimated_processing_time: string;
  }> {
    
    try {
      const eligibleRisks = await this.getEligibleRisks(riskIds);
      const previewResults = [];
      
      // Sample up to 10 risks for preview
      const sampleRisks = eligibleRisks.slice(0, Math.min(10, eligibleRisks.length));
      
      for (const risk of sampleRisks) {
        try {
          // Calculate enhanced score without saving
          const enhancedResult = await this.enhancedOptimizer.calculateEnhancedRiskScore(
            {
              likelihood: risk.likelihood,
              impact: risk.impact,
              confidence_score: risk.confidence_score,
              category: risk.category,
              title: risk.title,
              description: risk.description
            },
            risk.service_id
          );
          
          previewResults.push({
            risk_id: risk.id,
            current_score: risk.final_score || 0,
            projected_enhanced_score: enhancedResult.final_score,
            score_delta: enhancedResult.final_score - (risk.final_score || 0),
            enhancement_available: true
          });
          
        } catch (error) {
          previewResults.push({
            risk_id: risk.id,
            current_score: risk.final_score || 0,
            projected_enhanced_score: risk.final_score || 0,
            score_delta: 0,
            enhancement_available: false
          });
        }
      }
      
      // Estimate processing time
      const avgProcessingTime = 2000; // 2 seconds per risk (conservative estimate)
      const estimatedTotalTime = eligibleRisks.length * avgProcessingTime;
      const estimatedHours = Math.ceil(estimatedTotalTime / (1000 * 60 * 60));
      
      return {
        eligible_risks: eligibleRisks.length,
        preview_results: previewResults,
        estimated_processing_time: `${estimatedHours} hours (${Math.ceil(estimatedTotalTime / (1000 * 60))} minutes)`
      };
      
    } catch (error) {
      console.error('[Risk-Migration] Preview generation failed:', error);
      throw error;
    }
  }
  
  // Private implementation methods
  
  private async getEligibleRisks(targetRiskIds?: number[]): Promise<any[]> {
    let query = `
      SELECT 
        id, title, description, category, service_id,
        likelihood, impact, confidence_score, final_score,
        source_type, created_at, enhanced_migration_date
      FROM risks
      WHERE enhanced_migration_date IS NULL
    `;
    
    const params: any[] = [];
    
    if (targetRiskIds && targetRiskIds.length > 0) {
      query += ` AND id IN (${targetRiskIds.map(() => '?').join(',')})`;
      params.push(...targetRiskIds);
    } else {
      // Default filters for eligible risks
      query += `
        AND source_type IN ('Dynamic-TI', 'Manual', 'Threat-Intelligence')
        AND created_at >= date('now', '-180 days')
        AND (service_id IS NOT NULL OR category IS NOT NULL)
      `;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await this.db.prepare(query).bind(...params).all();
    
    return (result.results || []).filter((risk: any) => this.isRiskEligible(risk));
  }
  
  private isRiskEligible(risk: any): boolean {
    // Eligibility criteria for enhancement
    return (
      risk.id &&
      risk.category &&
      (risk.service_id || risk.title) &&
      !risk.enhanced_migration_date && // Not already enhanced
      (risk.confidence_score == null || risk.confidence_score >= 0.1) // Minimum confidence
    );
  }
  
  private async processBatches(risks: any[]): Promise<void> {
    const totalBatches = Math.ceil(risks.length / this.config.batch_size);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * this.config.batch_size;
      const batchEnd = Math.min(batchStart + this.config.batch_size, risks.length);
      const batch = risks.slice(batchStart, batchEnd);
      
      this.currentProgress.current_batch = batchIndex + 1;
      
      console.log(`[Risk-Migration] Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} risks)`);
      
      await this.processBatch(batch);
      
      // Check error threshold
      const errorRate = (this.currentProgress.errors / this.currentProgress.processed) * 100;
      if (errorRate > this.config.error_threshold_percent) {
        throw new Error(`Migration stopped: Error rate ${errorRate.toFixed(1)}% exceeds threshold ${this.config.error_threshold_percent}%`);
      }
      
      // Update progress
      await this.updateProgress();
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  private async processBatch(batch: any[]): Promise<void> {
    const batchResults: Promise<RiskMigrationResult>[] = batch.map(risk => 
      this.migrateSingleRisk(risk.id)
    );
    
    const results = await Promise.all(batchResults);
    
    // Update counters
    for (const result of results) {
      this.results.push(result);
      this.currentProgress.processed++;
      
      switch (result.status) {
        case 'enhanced':
          this.currentProgress.enhanced++;
          break;
        case 'skipped':
        case 'already_enhanced':
          this.currentProgress.skipped++;
          break;
        case 'error':
          this.currentProgress.errors++;
          break;
      }
    }
    
    this.currentProgress.success_rate = 
      ((this.currentProgress.enhanced + this.currentProgress.skipped) / this.currentProgress.processed) * 100;
    
    this.currentProgress.last_updated = new Date().toISOString();
  }
  
  private async enhanceExistingRisk(existingRisk: any): Promise<{
    enhanced_score: number;
    features: any;
  }> {
    
    // Calculate enhanced scoring
    const enhancedResult = await this.enhancedOptimizer.calculateEnhancedRiskScore(
      {
        likelihood: existingRisk.likelihood,
        impact: existingRisk.impact,
        confidence_score: existingRisk.confidence_score || 0.5,
        category: existingRisk.category,
        title: existingRisk.title,
        description: existingRisk.description
      },
      existingRisk.service_id
    );
    
    const features = {
      service_indices_computed: !!existingRisk.service_id && !!enhancedResult.service_indices,
      controls_discount_applied: enhancedResult.controls_discount.total_discount > 0,
      ai_analysis_scheduled: false,
      explainable_scoring_available: !!enhancedResult.explanation
    };
    
    if (!this.config.dry_run_mode) {
      // Update risk with enhanced data (non-destructive)
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
        existingRisk.id
      ).run();
      
      // Schedule AI analysis if enabled
      if (this.config.auto_ai_analysis && this.aiService && existingRisk.service_id) {
        try {
          await this.aiService.analyzeRisk({
            risk_id: existingRisk.id,
            title: existingRisk.title,
            description: existingRisk.description,
            category: existingRisk.category,
            service_id: existingRisk.service_id,
            svi: enhancedResult.service_indices?.svi,
            sei: enhancedResult.service_indices?.sei,
            bci: enhancedResult.service_indices?.bci,
            eri: enhancedResult.service_indices?.eri
          });
          
          features.ai_analysis_scheduled = true;
        } catch (error) {
          console.warn(`[Risk-Migration] AI analysis scheduling failed for risk ${existingRisk.id}:`, error);
        }
      }
    }
    
    return {
      enhanced_score: enhancedResult.final_score,
      features
    };
  }
  
  private async checkExistingFeatures(riskId: number): Promise<any> {
    const risk = await this.db.prepare(`
      SELECT service_indices_json, controls_discount, score_explanation
      FROM risks WHERE id = ?
    `).bind(riskId).first();
    
    const aiAnalysis = await this.db.prepare(`
      SELECT id FROM ai_analysis WHERE risk_id = ? LIMIT 1
    `).bind(riskId).first();
    
    return {
      service_indices_computed: !!risk?.service_indices_json,
      controls_discount_applied: (risk?.controls_discount || 0) > 0,
      ai_analysis_scheduled: !!aiAnalysis,
      explainable_scoring_available: !!risk?.score_explanation
    };
  }
  
  private getDefaultFeatures() {
    return {
      service_indices_computed: false,
      controls_discount_applied: false,
      ai_analysis_scheduled: false,
      explainable_scoring_available: false
    };
  }
  
  private calculateSummaryStatistics() {
    const enhancedResults = this.results.filter(r => r.status === 'enhanced');
    const scoreDeltas = enhancedResults.map(r => r.score_delta || 0);
    
    return {
      avg_processing_time: this.results.reduce((sum, r) => sum + r.processing_time_ms, 0) / this.results.length,
      score_improvements: {
        increased_count: scoreDeltas.filter(d => d > 0.01).length,
        decreased_count: scoreDeltas.filter(d => d < -0.01).length,
        unchanged_count: scoreDeltas.filter(d => Math.abs(d) <= 0.01).length,
        avg_delta: scoreDeltas.reduce((sum, d) => sum + d, 0) / scoreDeltas.length
      },
      feature_adoption: {
        service_indices_enabled: this.results.filter(r => r.enhancement_features.service_indices_computed).length,
        controls_discount_applied: this.results.filter(r => r.enhancement_features.controls_discount_applied).length,
        ai_analysis_triggered: this.results.filter(r => r.enhancement_features.ai_analysis_scheduled).length
      }
    };
  }
  
  private async generateRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    const stats = this.calculateSummaryStatistics();
    
    // Score improvement recommendations
    if (stats.score_improvements.decreased_count > stats.score_improvements.increased_count) {
      recommendations.push('Consider reviewing tenant risk policy weights - more risks decreased than increased in score');
    }
    
    if (stats.score_improvements.unchanged_count / this.results.length > 0.7) {
      recommendations.push('High percentage of unchanged scores may indicate configuration tuning needed');
    }
    
    // Feature adoption recommendations
    if (stats.feature_adoption.service_indices_enabled / this.currentProgress.enhanced < 0.5) {
      recommendations.push('Low service indices adoption - ensure services have proper service_id mapping');
    }
    
    if (stats.feature_adoption.controls_discount_applied / this.currentProgress.enhanced < 0.3) {
      recommendations.push('Low controls discount adoption - verify security posture data is available');
    }
    
    // Performance recommendations
    if (stats.avg_processing_time > 3000) {
      recommendations.push('High processing time detected - consider optimizing service indices computation');
    }
    
    // Error rate recommendations
    const errorRate = (this.currentProgress.errors / this.currentProgress.processed) * 100;
    if (errorRate > 5) {
      recommendations.push(`Error rate ${errorRate.toFixed(1)}% is elevated - review error logs for patterns`);
    }
    
    return recommendations;
  }
  
  private initializeProgress(): MigrationProgress {
    return {
      total_risks: 0,
      processed: 0,
      enhanced: 0,
      skipped: 0,
      errors: 0,
      success_rate: 0,
      estimated_completion: '',
      current_batch: 0,
      started_at: '',
      last_updated: ''
    };
  }
  
  private async initializeMigrationTracking(): Promise<void> {
    // Create migration tracking record
    await this.db.prepare(`
      INSERT OR REPLACE INTO migration_tracking (
        migration_id, status, config, started_at, created_at
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      this.migrationId,
      'running',
      JSON.stringify(this.config),
      this.currentProgress.started_at,
      new Date().toISOString()
    ).run();
  }
  
  private async updateProgress(): Promise<void> {
    // Update estimated completion
    if (this.currentProgress.processed > 0) {
      const avgProcessingTime = (Date.now() - new Date(this.currentProgress.started_at).getTime()) / this.currentProgress.processed;
      const remainingRisks = this.currentProgress.total_risks - this.currentProgress.processed;
      const estimatedRemainingTime = remainingRisks * avgProcessingTime;
      
      this.currentProgress.estimated_completion = new Date(Date.now() + estimatedRemainingTime).toISOString();
    }
    
    // Update database tracking
    await this.db.prepare(`
      UPDATE migration_tracking SET
        progress = ?,
        last_updated = ?
      WHERE migration_id = ?
    `).bind(
      JSON.stringify(this.currentProgress),
      new Date().toISOString(),
      this.migrationId
    ).run();
  }
  
  private async completeMigration(status: string, errorMessage?: string): Promise<string> {
    const completedAt = new Date().toISOString();
    
    await this.db.prepare(`
      UPDATE migration_tracking SET
        status = ?,
        progress = ?,
        error_message = ?,
        completed_at = ?
      WHERE migration_id = ?
    `).bind(
      status,
      JSON.stringify(this.currentProgress),
      errorMessage || null,
      completedAt,
      this.migrationId
    ).run();
    
    console.log(`[Risk-Migration] Migration ${status}`, {
      migration_id: this.migrationId,
      total_processed: this.currentProgress.processed,
      enhanced: this.currentProgress.enhanced,
      errors: this.currentProgress.errors,
      success_rate: this.currentProgress.success_rate
    });
    
    return this.migrationId;
  }
  
  private async saveMigrationReport(report: MigrationReport): Promise<void> {
    await this.db.prepare(`
      INSERT INTO migration_reports (
        migration_id, report_data, created_at
      ) VALUES (?, ?, ?)
    `).bind(
      this.migrationId,
      JSON.stringify(report),
      new Date().toISOString()
    ).run();
  }
  
  private generateMigrationId(): string {
    return `migration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default RiskMigrationService;