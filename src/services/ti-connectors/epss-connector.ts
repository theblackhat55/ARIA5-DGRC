// EPSS (Exploit Prediction Scoring System) Connector
// Fetches EPSS scores from FIRST.org API

import { BaseTIConnector, TIIndicator, ConnectorConfig } from './base-connector';

interface EPSSScore {
  cve: string;
  epss: string;
  percentile: string;
  date: string;
}

interface EPSSResponse {
  status: string;
  status_code: number;
  version: string;
  access: string;
  total: number;
  offset: number;
  limit: number;
  data: EPSSScore[];
}

export class EPSSConnector extends BaseTIConnector {
  private readonly baseUrl = 'https://api.first.org/data/v1/epss';

  constructor(config: ConnectorConfig) {
    super(config);
  }

  async fetchIndicators(options?: {
    cves?: string[];
    date?: string;
    limit?: number;
    offset?: number;
    gt?: number; // EPSS score greater than
    lt?: number; // EPSS score less than
  }): Promise<TIIndicator[]> {
    try {
      this.log('info', 'Fetching EPSS data');
      
      const params = new URLSearchParams({
        format: 'json',
      });

      if (options?.cves && options.cves.length > 0) {
        params.set('cve', options.cves.join(','));
      }
      
      if (options?.date) {
        params.set('date', options.date);
      }
      
      if (options?.limit) {
        params.set('limit', String(Math.min(options.limit, 1000))); // API max is 1000
      }
      
      if (options?.offset) {
        params.set('offset', String(options.offset));
      }
      
      if (options?.gt !== undefined) {
        params.set('epss-gt', String(options.gt));
      }
      
      if (options?.lt !== undefined) {
        params.set('epss-lt', String(options.lt));
      }

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await this.rateLimitedFetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: EPSSResponse = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`EPSS API error: ${data.status}`);
      }

      const indicators = this.transformData(data);

      this.log('info', `Successfully fetched ${indicators.length} EPSS indicators`);
      return indicators;
    } catch (error) {
      this.log('error', 'Failed to fetch EPSS data', error);
      throw error;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await this.rateLimitedFetch(`${this.baseUrl}?format=json&limit=1`);
      if (!response.ok) return false;
      
      const data: EPSSResponse = await response.json();
      return data.status === 'OK';
    } catch (error) {
      this.log('error', 'Connection validation failed', error);
      return false;
    }
  }

  async getMetadata(): Promise<Record<string, any>> {
    try {
      const response = await this.rateLimitedFetch(`${this.baseUrl}?format=json&limit=1`);

      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }

      const data: EPSSResponse = await response.json();
      
      return {
        status: data.status,
        version: data.version,
        access: data.access,
        total_scores: data.total,
        api_limits: 'No explicit rate limits documented',
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  protected transformData(data: EPSSResponse): TIIndicator[] {
    return data.data.map(score => {
      const epssScore = parseFloat(score.epss);
      const percentile = parseFloat(score.percentile);
      
      // Classify EPSS severity based on score and percentile
      let severity: string;
      if (epssScore >= 0.7 || percentile >= 90) {
        severity = 'critical';
      } else if (epssScore >= 0.3 || percentile >= 70) {
        severity = 'high';
      } else if (epssScore >= 0.1 || percentile >= 50) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      return {
        source_id: this.config.source.id,
        indicator_type: 'epss',
        identifier: score.cve,
        title: `${score.cve} - EPSS Score`,
        description: `Exploit Prediction Scoring System assessment for ${score.cve}`,
        severity: severity,
        epss_score: epssScore,
        exploit_available: epssScore >= 0.2, // Heuristic: EPSS > 0.2 suggests exploit potential
        exploit_maturity: this.getExploitMaturity(epssScore, percentile),
        first_seen: score.date,
        last_updated: new Date().toISOString(),
        metadata: {
          percentile: percentile,
          score_date: score.date,
          epss_version: data.version,
          probability_interpretation: this.getEPSSInterpretation(epssScore, percentile),
        },
      };
    });
  }

  private getExploitMaturity(epssScore: number, percentile: number): string {
    if (epssScore >= 0.7 || percentile >= 95) return 'active';
    if (epssScore >= 0.3 || percentile >= 80) return 'proof-of-concept';
    if (epssScore >= 0.1 || percentile >= 60) return 'unproven';
    return 'theoretical';
  }

  private getEPSSInterpretation(epssScore: number, percentile: number): string {
    const scorePercent = (epssScore * 100).toFixed(1);
    return `${scorePercent}% probability of exploitation in next 30 days (${percentile.toFixed(1)}th percentile)`;
  }

  /**
   * Fetch high-risk EPSS scores (>= 0.3)
   */
  async fetchHighRiskScores(date?: string): Promise<TIIndicator[]> {
    return this.fetchIndicators({
      gt: 0.3,
      date: date,
      limit: 1000,
    });
  }

  /**
   * Fetch EPSS scores for specific CVEs
   */
  async fetchCVEScores(cves: string[]): Promise<TIIndicator[]> {
    const chunkSize = 100; // Process in chunks to respect API limits
    const allIndicators: TIIndicator[] = [];

    for (let i = 0; i < cves.length; i += chunkSize) {
      const chunk = cves.slice(i, i + chunkSize);
      const indicators = await this.fetchIndicators({ cves: chunk });
      allIndicators.push(...indicators);
      
      // Small delay between chunks to be respectful of API
      if (i + chunkSize < cves.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return allIndicators;
  }

  /**
   * Get EPSS statistics for current dataset
   */
  async getEPSSStats(): Promise<{
    total_scores: number;
    high_risk_count: number; // EPSS >= 0.3
    critical_risk_count: number; // EPSS >= 0.7
    average_score: number;
    score_distribution: {
      critical: number;   // >= 0.7
      high: number;       // 0.3-0.69
      medium: number;     // 0.1-0.29
      low: number;        // < 0.1
    };
  }> {
    try {
      // Get sample of recent scores for statistics
      const indicators = await this.fetchIndicators({ limit: 1000 });
      
      const total = indicators.length;
      let highRisk = 0;
      let criticalRisk = 0;
      let totalScore = 0;
      
      const distribution = { critical: 0, high: 0, medium: 0, low: 0 };

      indicators.forEach(i => {
        const score = i.epss_score || 0;
        totalScore += score;
        
        if (score >= 0.7) {
          criticalRisk++;
          distribution.critical++;
        } else if (score >= 0.3) {
          highRisk++;
          distribution.high++;
        } else if (score >= 0.1) {
          distribution.medium++;
        } else {
          distribution.low++;
        }
      });

      if (score >= 0.3) highRisk++;

      return {
        total_scores: total,
        high_risk_count: highRisk,
        critical_risk_count: criticalRisk,
        average_score: total > 0 ? totalScore / total : 0,
        score_distribution: distribution,
      };
    } catch (error) {
      this.log('error', 'Failed to get EPSS stats', error);
      throw error;
    }
  }
}