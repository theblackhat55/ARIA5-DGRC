// Threat Intelligence Ingestion Service
// High-level service for TI data ingestion and enrichment

import { TIOrchestrator, TIOrchestrationResult } from './ti-connectors/ti-orchestrator';

export interface IngestionJob {
  id: string;
  type: 'full' | 'incremental' | 'source-specific';
  source_ids?: number[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  results?: TIOrchestrationResult[];
  error_message?: string;
}

export class TIIngestionService {
  private orchestrator: TIOrchestrator;
  private db: D1Database;
  private activeJobs: Map<string, IngestionJob> = new Map();

  constructor(db: D1Database) {
    this.db = db;
    this.orchestrator = new TIOrchestrator(db);
  }

  /**
   * Initialize the ingestion service
   */
  async initialize(): Promise<void> {
    await this.orchestrator.initializeConnectors();
    console.log('TI Ingestion Service initialized');
  }

  /**
   * Ingest data from all sources
   */
  async ingestFromAllSources(): Promise<IngestionJob> {
    const jobId = this.generateJobId();
    const job: IngestionJob = {
      id: jobId,
      type: 'full',
      status: 'pending',
    };

    this.activeJobs.set(jobId, job);

    try {
      job.status = 'running';
      job.started_at = new Date().toISOString();

      const results = await this.orchestrator.ingestFromAllSources();
      
      job.status = 'completed';
      job.completed_at = new Date().toISOString();
      job.results = results;

      // After ingestion, trigger risk enrichment
      await this.enrichExistingRisks();

      return job;
    } catch (error) {
      job.status = 'failed';
      job.completed_at = new Date().toISOString();
      job.error_message = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('Full ingestion failed:', error);
      return job;
    }
  }

  /**
   * Ingest data from specific source
   */
  async ingestFromSource(sourceId: number): Promise<IngestionJob> {
    const jobId = this.generateJobId();
    const job: IngestionJob = {
      id: jobId,
      type: 'source-specific',
      source_ids: [sourceId],
      status: 'pending',
    };

    this.activeJobs.set(jobId, job);

    try {
      job.status = 'running';
      job.started_at = new Date().toISOString();

      const result = await this.orchestrator.ingestFromSource(sourceId);
      
      job.status = 'completed';
      job.completed_at = new Date().toISOString();
      job.results = [result];

      // Enrich risks related to this source
      await this.enrichRisksForSource(sourceId);

      return job;
    } catch (error) {
      job.status = 'failed';
      job.completed_at = new Date().toISOString();
      job.error_message = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`Source ${sourceId} ingestion failed:`, error);
      return job;
    }
  }

  /**
   * Process and enrich indicators after ingestion
   */
  async processIndicator(indicator: any): Promise<void> {
    try {
      // Auto-generate risks for critical indicators
      if (this.shouldAutoGenerateRisk(indicator)) {
        await this.autoGenerateRisk(indicator);
      }

      // Update existing risk mappings
      await this.updateRiskMappings(indicator);

      // Send notifications for high-severity indicators
      if (this.shouldNotify(indicator)) {
        await this.sendNotification(indicator);
      }
    } catch (error) {
      console.error(`Failed to process indicator ${indicator.identifier}:`, error);
    }
  }

  /**
   * Enrich existing risks with TI data
   */
  async enrichExistingRisks(): Promise<void> {
    try {
      console.log('Starting risk enrichment with TI data...');
      
      // Get all active risks
      const risks = await this.db.prepare(`
        SELECT id, title, description, category 
        FROM risks 
        WHERE status = 'active' AND ti_enriched = FALSE
      `).all();

      let enrichedCount = 0;

      for (const risk of risks.results) {
        const enriched = await this.enrichSingleRisk(risk);
        if (enriched) {
          enrichedCount++;
        }
      }

      console.log(`Enriched ${enrichedCount} risks with TI data`);
    } catch (error) {
      console.error('Risk enrichment failed:', error);
    }
  }

  /**
   * Enrich risks for specific TI source
   */
  private async enrichRisksForSource(sourceId: number): Promise<void> {
    try {
      // Get indicators from this source
      const indicators = await this.db.prepare(`
        SELECT * FROM ti_indicators WHERE source_id = ?
      `).bind(sourceId).all();

      // Find related risks and create mappings
      for (const indicator of indicators.results) {
        await this.findAndMapRelatedRisks(indicator);
      }
    } catch (error) {
      console.error(`Risk enrichment for source ${sourceId} failed:`, error);
    }
  }

  /**
   * Enrich a single risk with TI data
   */
  private async enrichSingleRisk(risk: any): Promise<boolean> {
    try {
      // Find related TI indicators based on keywords, CVEs, etc.
      const relatedIndicators = await this.findRelatedIndicators(risk);
      
      if (relatedIndicators.length === 0) {
        return false;
      }

      // Calculate TI-enhanced risk score
      const tiScore = this.calculateTIEnhancedScore(relatedIndicators);
      
      // Update risk with TI enrichment
      await this.db.prepare(`
        UPDATE risks SET
          ti_enriched = TRUE,
          ti_sources = ?,
          epss_score = ?,
          cvss_score = ?
        WHERE id = ?
      `).bind(
        JSON.stringify(relatedIndicators.map(i => i.source_id)),
        this.getMaxEPSS(relatedIndicators),
        this.getMaxCVSS(relatedIndicators),
        risk.id
      ).run();

      // Create risk-TI mappings
      for (const indicator of relatedIndicators) {
        await this.createRiskTIMapping(risk.id, indicator.id, 0.8); // Default relevance
      }

      return true;
    } catch (error) {
      console.error(`Failed to enrich risk ${risk.id}:`, error);
      return false;
    }
  }

  /**
   * Find TI indicators related to a risk
   */
  private async findRelatedIndicators(risk: any): Promise<any[]> {
    const searchTerms = this.extractSearchTerms(risk);
    const indicators: any[] = [];

    for (const term of searchTerms) {
      const results = await this.db.prepare(`
        SELECT * FROM ti_indicators 
        WHERE identifier LIKE ? OR title LIKE ? OR description LIKE ?
        LIMIT 10
      `).bind(`%${term}%`, `%${term}%`, `%${term}%`).all();

      indicators.push(...results.results);
    }

    // Remove duplicates
    const uniqueIndicators = indicators.filter((indicator, index, self) =>
      index === self.findIndex(i => i.id === indicator.id)
    );

    return uniqueIndicators;
  }

  /**
   * Extract search terms from risk data
   */
  private extractSearchTerms(risk: any): string[] {
    const text = `${risk.title} ${risk.description}`.toLowerCase();
    const terms: string[] = [];

    // Extract CVE patterns
    const cveMatches = text.match(/cve-\d{4}-\d{4,}/g);
    if (cveMatches) {
      terms.push(...cveMatches);
    }

    // Extract technology keywords
    const techKeywords = [
      'windows', 'linux', 'apache', 'nginx', 'mysql', 'postgresql',
      'exchange', 'sharepoint', 'office', 'chrome', 'firefox', 'safari',
      'java', 'python', 'php', 'nodejs', 'docker', 'kubernetes'
    ];

    techKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        terms.push(keyword);
      }
    });

    return [...new Set(terms)]; // Remove duplicates
  }

  /**
   * Find risks related to a TI indicator
   */
  private async findAndMapRelatedRisks(indicator: any): Promise<void> {
    try {
      // Search for risks containing the CVE or related keywords
      const searchTerms = [
        indicator.identifier,
        ...(indicator.affected_products ? JSON.parse(indicator.affected_products) : [])
      ];

      for (const term of searchTerms) {
        const risks = await this.db.prepare(`
          SELECT id FROM risks 
          WHERE (title LIKE ? OR description LIKE ?) AND status = 'active'
        `).bind(`%${term}%`, `%${term}%`).all();

        for (const risk of risks.results) {
          await this.createRiskTIMapping(risk.id, indicator.id, 0.9);
        }
      }
    } catch (error) {
      console.error(`Failed to map risks for indicator ${indicator.identifier}:`, error);
    }
  }

  /**
   * Create risk-TI mapping
   */
  private async createRiskTIMapping(riskId: number, indicatorId: number, relevance: number): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT OR IGNORE INTO risk_ti_mappings (risk_id, ti_indicator_id, relevance_score, mapping_reason)
        VALUES (?, ?, ?, 'auto-mapped during ingestion')
      `).bind(riskId, indicatorId, relevance).run();
    } catch (error) {
      console.error(`Failed to create risk-TI mapping: ${riskId} -> ${indicatorId}`, error);
    }
  }

  /**
   * Calculate TI-enhanced risk score
   */
  private calculateTIEnhancedScore(indicators: any[]): number {
    if (indicators.length === 0) return 0;

    let maxScore = 0;
    
    indicators.forEach(indicator => {
      let score = 0;
      
      // Base severity score
      switch (indicator.severity) {
        case 'critical': score += 40; break;
        case 'high': score += 30; break;
        case 'medium': score += 20; break;
        case 'low': score += 10; break;
      }

      // EPSS score bonus
      if (indicator.epss_score) {
        score += indicator.epss_score * 30; // Max 30 points
      }

      // Exploit availability bonus
      if (indicator.exploit_available) {
        score += 20;
      }

      maxScore = Math.max(maxScore, score);
    });

    return Math.min(maxScore, 100); // Cap at 100
  }

  /**
   * Get maximum EPSS score from indicators
   */
  private getMaxEPSS(indicators: any[]): number | null {
    const epssScores = indicators
      .map(i => i.epss_score)
      .filter(score => score !== null && score !== undefined);
    
    return epssScores.length > 0 ? Math.max(...epssScores) : null;
  }

  /**
   * Get maximum CVSS score from indicators
   */
  private getMaxCVSS(indicators: any[]): number | null {
    const cvssScores = indicators
      .map(i => i.cvss_score)
      .filter(score => score !== null && score !== undefined);
    
    return cvssScores.length > 0 ? Math.max(...cvssScores) : null;
  }

  /**
   * Check if risk should be auto-generated for indicator
   */
  private shouldAutoGenerateRisk(indicator: any): boolean {
    return (
      indicator.severity === 'critical' &&
      indicator.exploit_available &&
      (indicator.epss_score || 0) >= 0.3
    );
  }

  /**
   * Auto-generate risk from TI indicator
   */
  private async autoGenerateRisk(indicator: any): Promise<void> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO risks (
          title, description, category, likelihood, impact, risk_score, status,
          ti_enriched, epss_score, cvss_score, risk_lifecycle_stage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        `Auto-detected: ${indicator.title}`,
        `Critical vulnerability detected via threat intelligence: ${indicator.description}`,
        'cybersecurity',
        'high',
        'high',
        85, // High score for critical TI-derived risks
        'draft',
        true,
        indicator.epss_score,
        indicator.cvss_score,
        'detected'
      ).run();

      // Create mapping to the indicator
      if (result.meta?.last_row_id) {
        await this.createRiskTIMapping(result.meta.last_row_id, indicator.id, 1.0);
      }

      console.log(`Auto-generated risk for critical indicator: ${indicator.identifier}`);
    } catch (error) {
      console.error(`Failed to auto-generate risk for ${indicator.identifier}:`, error);
    }
  }

  /**
   * Check if notification should be sent
   */
  private shouldNotify(indicator: any): boolean {
    return indicator.severity === 'critical' || 
           (indicator.exploit_available && indicator.severity === 'high');
  }

  /**
   * Send notification for high-priority indicator
   */
  private async sendNotification(indicator: any): Promise<void> {
    // In a real implementation, this would send emails, Slack messages, etc.
    console.log(`🚨 HIGH PRIORITY TI ALERT: ${indicator.identifier} - ${indicator.title}`);
  }

  /**
   * Schedule periodic ingestion
   */
  async scheduleIngestion(): Promise<void> {
    // In Cloudflare Workers, this would be handled by Cron Triggers
    console.log('Ingestion scheduling configured (handled by Cloudflare Cron)');
  }

  /**
   * Get ingestion job status
   */
  getJobStatus(jobId: string): IngestionJob | null {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): IngestionJob[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Get ingestion statistics
   */
  async getIngestionStats(): Promise<{
    orchestrator_status: any;
    ti_statistics: any;
    recent_jobs: IngestionJob[];
  }> {
    const orchestratorStatus = this.orchestrator.getStatus();
    const tiStatistics = await this.orchestrator.getTIStatistics();
    const recentJobs = Array.from(this.activeJobs.values())
      .sort((a, b) => (b.started_at || '').localeCompare(a.started_at || ''))
      .slice(0, 10);

    return {
      orchestrator_status: orchestratorStatus,
      ti_statistics: tiStatistics,
      recent_jobs: recentJobs,
    };
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}