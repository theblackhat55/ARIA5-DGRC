// Base Threat Intelligence Connector
// Provides abstract interface for all TI connectors

export interface TIIndicator {
  source_id: number;
  indicator_type: string;
  identifier: string;
  title?: string;
  description?: string;
  severity?: string;
  cvss_score?: number;
  epss_score?: number;
  exploit_available?: boolean;
  exploit_maturity?: string;
  affected_products?: string[];
  mitigation_available?: boolean;
  mitigation_details?: string;
  first_seen?: string;
  last_updated?: string;
  metadata?: Record<string, any>;
}

export interface TISource {
  id: number;
  name: string;
  type: string;
  url?: string;
  api_key_required: boolean;
  status: 'active' | 'inactive' | 'error';
  error_message?: string;
  last_updated?: string;
}

export interface ConnectorConfig {
  source: TISource;
  api_key?: string;
  rate_limit?: number;
  timeout?: number;
  batch_size?: number;
}

export abstract class BaseTIConnector {
  protected config: ConnectorConfig;
  protected last_fetch: Date | null = null;
  protected fetch_count: number = 0;
  
  constructor(config: ConnectorConfig) {
    this.config = config;
  }

  /**
   * Fetch fresh threat intelligence indicators
   */
  abstract fetchIndicators(): Promise<TIIndicator[]>;

  /**
   * Validate connector configuration and connectivity
   */
  abstract validateConnection(): Promise<boolean>;

  /**
   * Get connector-specific metadata
   */
  abstract getMetadata(): Promise<Record<string, any>>;

  /**
   * Transform raw data to standardized TIIndicator format
   */
  protected abstract transformData(rawData: any): TIIndicator[];

  /**
   * Handle rate limiting and retry logic
   */
  protected async rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
    const rate_limit = this.config.rate_limit || 100; // requests per minute
    const timeout = this.config.timeout || 30000; // 30 seconds

    // Basic rate limiting
    if (this.last_fetch) {
      const elapsed = Date.now() - this.last_fetch.getTime();
      const min_interval = (60 * 1000) / rate_limit; // ms between requests
      
      if (elapsed < min_interval) {
        await new Promise(resolve => setTimeout(resolve, min_interval - elapsed));
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      this.last_fetch = new Date();
      this.fetch_count++;

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'ARIA5-DGRC-TI-Connector/1.0',
          'Accept': 'application/json',
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Log connector activity
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] [${this.config.source.name}] ${message}`, data || '');
  }

  /**
   * Get connector status
   */
  getStatus(): { 
    source: TISource; 
    last_fetch: Date | null; 
    fetch_count: number;
    uptime: number;
  } {
    return {
      source: this.config.source,
      last_fetch: this.last_fetch,
      fetch_count: this.fetch_count,
      uptime: this.last_fetch ? Date.now() - this.last_fetch.getTime() : 0,
    };
  }

  /**
   * Update source status in database
   */
  async updateSourceStatus(db: D1Database, status: 'active' | 'inactive' | 'error', error_message?: string): Promise<void> {
    await db.prepare(`
      UPDATE ti_sources 
      SET status = ?, error_message = ?, last_updated = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(status, error_message || null, this.config.source.id).run();
  }
}