// Threat Intelligence Orchestrator
// Manages all TI connectors and coordinates data ingestion

import { BaseTIConnector, TIIndicator, TISource, ConnectorConfig } from './base-connector';
import { CISAKEVConnector } from './cisa-kev-connector';
import { NVDConnector } from './nvd-connector';
import { EPSSConnector } from './epss-connector';

export interface TIOrchestrationResult {
  source_id: number;
  source_name: string;
  status: 'success' | 'error' | 'partial';
  indicators_fetched: number;
  error_message?: string;
  duration_ms: number;
  timestamp: string;
}

export class TIOrchestrator {
  private connectors: Map<number, BaseTIConnector> = new Map();
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Initialize connectors for all active TI sources
   */
  async initializeConnectors(): Promise<void> {
    const sources = await this.getActiveSources();
    
    for (const source of sources) {
      try {
        const connector = this.createConnector(source);
        if (connector) {
          this.connectors.set(source.id, connector);
          console.log(`Initialized connector for ${source.name}`);
        }
      } catch (error) {
        console.error(`Failed to initialize connector for ${source.name}:`, error);
        await this.updateSourceStatus(source.id, 'error', error.message);
      }
    }
  }

  /**
   * Create appropriate connector based on source type
   */
  private createConnector(source: TISource): BaseTIConnector | null {
    const config: ConnectorConfig = {
      source,
      rate_limit: this.getRateLimit(source.type),
      timeout: 30000,
      batch_size: this.getBatchSize(source.type),
    };

    switch (source.type) {
      case 'cisa_kev':
        return new CISAKEVConnector(config);
      case 'nvd':
        return new NVDConnector(config);
      case 'epss':
        return new EPSSConnector(config);
      default:
        console.warn(`Unknown connector type: ${source.type}`);
        return null;
    }
  }

  /**
   * Get rate limits for different connector types
   */
  private getRateLimit(type: string): number {
    switch (type) {
      case 'cisa_kev': return 60; // 1 request per minute (static file)
      case 'nvd': return 5; // 5 requests per 30 seconds (no API key)
      case 'epss': return 30; // Conservative limit
      default: return 10;
    }
  }

  /**
   * Get batch sizes for different connector types
   */
  private getBatchSize(type: string): number {
    switch (type) {
      case 'cisa_kev': return 1000; // Full dataset
      case 'nvd': return 100; // API limit
      case 'epss': return 1000; // API limit
      default: return 100;
    }
  }

  /**
   * Ingest data from all sources
   */
  async ingestFromAllSources(): Promise<TIOrchestrationResult[]> {
    const results: TIOrchestrationResult[] = [];
    
    for (const [sourceId, connector] of this.connectors) {
      const result = await this.ingestFromConnector(sourceId, connector);
      results.push(result);
    }

    // Log overall ingestion summary
    const totalIndicators = results.reduce((sum, r) => sum + r.indicators_fetched, 0);
    const successCount = results.filter(r => r.status === 'success').length;
    
    console.log(`Ingestion complete: ${totalIndicators} indicators from ${successCount}/${results.length} sources`);
    
    return results;
  }

  /**
   * Ingest data from specific source
   */
  async ingestFromSource(sourceId: number): Promise<TIOrchestrationResult> {
    const connector = this.connectors.get(sourceId);
    if (!connector) {
      throw new Error(`No connector found for source ID ${sourceId}`);
    }
    
    return this.ingestFromConnector(sourceId, connector);
  }

  /**
   * Ingest data from a specific connector
   */
  private async ingestFromConnector(sourceId: number, connector: BaseTIConnector): Promise<TIOrchestrationResult> {
    const startTime = Date.now();
    const source = connector.getStatus().source;
    
    try {
      // Validate connection first
      const isConnected = await connector.validateConnection();
      if (!isConnected) {
        throw new Error('Connection validation failed');
      }

      // Fetch indicators
      const indicators = await connector.fetchIndicators();
      
      // Store indicators in database
      const storedCount = await this.storeIndicators(indicators);
      
      // Update source status
      await connector.updateSourceStatus(this.db, 'active');
      
      const duration = Date.now() - startTime;
      
      return {
        source_id: sourceId,
        source_name: source.name,
        status: 'success',
        indicators_fetched: storedCount,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update source status with error
      await connector.updateSourceStatus(this.db, 'error', errorMessage);
      
      return {
        source_id: sourceId,
        source_name: source.name,
        status: 'error',
        indicators_fetched: 0,
        error_message: errorMessage,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Store TI indicators in database
   */
  private async storeIndicators(indicators: TIIndicator[]): Promise<number> {
    if (indicators.length === 0) return 0;

    let storedCount = 0;
    
    for (const indicator of indicators) {
      try {
        // Check if indicator already exists
        const existing = await this.db.prepare(
          'SELECT id FROM ti_indicators WHERE source_id = ? AND identifier = ?'
        ).bind(indicator.source_id, indicator.identifier).first();

        if (existing) {
          // Update existing indicator
          await this.db.prepare(`
            UPDATE ti_indicators SET
              title = ?, description = ?, severity = ?, cvss_score = ?, epss_score = ?,
              exploit_available = ?, exploit_maturity = ?, affected_products = ?,
              mitigation_available = ?, mitigation_details = ?, last_updated = ?, metadata = ?
            WHERE id = ?
          `).bind(
            indicator.title, indicator.description, indicator.severity,
            indicator.cvss_score, indicator.epss_score, indicator.exploit_available,
            indicator.exploit_maturity, JSON.stringify(indicator.affected_products),
            indicator.mitigation_available, indicator.mitigation_details,
            indicator.last_updated, JSON.stringify(indicator.metadata),
            existing.id
          ).run();
        } else {
          // Insert new indicator
          await this.db.prepare(`
            INSERT INTO ti_indicators (
              source_id, indicator_type, identifier, title, description, severity,
              cvss_score, epss_score, exploit_available, exploit_maturity,
              affected_products, mitigation_available, mitigation_details,
              first_seen, last_updated, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            indicator.source_id, indicator.indicator_type, indicator.identifier,
            indicator.title, indicator.description, indicator.severity,
            indicator.cvss_score, indicator.epss_score, indicator.exploit_available,
            indicator.exploit_maturity, JSON.stringify(indicator.affected_products),
            indicator.mitigation_available, indicator.mitigation_details,
            indicator.first_seen, indicator.last_updated, JSON.stringify(indicator.metadata)
          ).run();
        }
        
        storedCount++;
      } catch (error) {
        console.error(`Failed to store indicator ${indicator.identifier}:`, error);
      }
    }
    
    return storedCount;
  }

  /**
   * Get all active TI sources from database
   */
  private async getActiveSources(): Promise<TISource[]> {
    const result = await this.db.prepare(
      "SELECT * FROM ti_sources WHERE status = 'active'"
    ).all();
    
    return result.results.map(row => ({
      id: row.id as number,
      name: row.name as string,
      type: row.type as string,
      url: row.url as string,
      api_key_required: Boolean(row.api_key_required),
      status: row.status as 'active' | 'inactive' | 'error',
      error_message: row.error_message as string,
      last_updated: row.last_updated as string,
    }));
  }

  /**
   * Update source status
   */
  private async updateSourceStatus(sourceId: number, status: string, errorMessage?: string): Promise<void> {
    await this.db.prepare(`
      UPDATE ti_sources 
      SET status = ?, error_message = ?, last_updated = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(status, errorMessage || null, sourceId).run();
  }

  /**
   * Get orchestrator status
   */
  getStatus(): {
    total_connectors: number;
    active_connectors: number;
    connector_status: Array<{
      source_id: number;
      source_name: string;
      status: string;
      last_fetch?: Date;
      fetch_count: number;
    }>;
  } {
    const connectorStatus = Array.from(this.connectors.entries()).map(([id, connector]) => {
      const status = connector.getStatus();
      return {
        source_id: id,
        source_name: status.source.name,
        status: status.source.status,
        last_fetch: status.last_fetch,
        fetch_count: status.fetch_count,
      };
    });

    return {
      total_connectors: this.connectors.size,
      active_connectors: connectorStatus.filter(s => s.status === 'active').length,
      connector_status: connectorStatus,
    };
  }

  /**
   * Schedule automatic ingestion (for use with cron jobs or background tasks)
   */
  async scheduleIngestion(intervalHours: number = 24): Promise<void> {
    const runIngestion = async () => {
      console.log('Starting scheduled TI ingestion...');
      const results = await this.ingestFromAllSources();
      console.log('Scheduled ingestion completed:', results.length, 'sources processed');
    };

    // Run immediately
    await runIngestion();

    // Note: In Cloudflare Workers environment, we can't use setInterval
    // This would need to be handled by Cloudflare Cron Triggers
    console.log(`TI ingestion scheduled every ${intervalHours} hours`);
  }

  /**
   * Get aggregated TI statistics
   */
  async getTIStatistics(): Promise<{
    total_indicators: number;
    by_source: Record<string, number>;
    by_type: Record<string, number>;
    by_severity: Record<string, number>;
    recent_indicators: number; // Last 7 days
    high_risk_indicators: number; // Critical/High severity with exploits
  }> {
    const stats = await this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        ts.name as source_name,
        ti.indicator_type,
        ti.severity,
        ti.exploit_available,
        ti.created_at
      FROM ti_indicators ti
      JOIN ti_sources ts ON ti.source_id = ts.id
      GROUP BY ts.name, ti.indicator_type, ti.severity, ti.exploit_available
    `).all();

    const bySource: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let totalIndicators = 0;
    let recentIndicators = 0;
    let highRiskIndicators = 0;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    stats.results.forEach((row: any) => {
      const count = row.total;
      totalIndicators += count;
      
      bySource[row.source_name] = (bySource[row.source_name] || 0) + count;
      byType[row.indicator_type] = (byType[row.indicator_type] || 0) + count;
      bySeverity[row.severity || 'unknown'] = (bySeverity[row.severity || 'unknown'] || 0) + count;
      
      if (new Date(row.created_at) > sevenDaysAgo) {
        recentIndicators += count;
      }
      
      if ((row.severity === 'critical' || row.severity === 'high') && row.exploit_available) {
        highRiskIndicators += count;
      }
    });

    return {
      total_indicators: totalIndicators,
      by_source: bySource,
      by_type: byType,
      by_severity: bySeverity,
      recent_indicators: recentIndicators,
      high_risk_indicators: highRiskIndicators,
    };
  }
}