// NVD (National Vulnerability Database) Connector
// Fetches CVE data from NIST NVD API 2.0

import { BaseTIConnector, TIIndicator, ConnectorConfig } from './base-connector';

interface NVDCVEItem {
  id: string;
  sourceIdentifier: string;
  published: string;
  lastModified: string;
  vulnStatus: string;
  descriptions: Array<{
    lang: string;
    value: string;
  }>;
  metrics?: {
    cvssMetricV31?: Array<{
      source: string;
      type: string;
      cvssData: {
        version: string;
        vectorString: string;
        baseScore: number;
        baseSeverity: string;
      };
    }>;
    cvssMetricV2?: Array<{
      source: string;
      type: string;
      cvssData: {
        version: string;
        vectorString: string;
        baseScore: number;
        baseSeverity: string;
      };
    }>;
  };
  configurations?: Array<{
    nodes: Array<{
      operator: string;
      cpeMatch: Array<{
        vulnerable: boolean;
        criteria: string;
        versionStartIncluding?: string;
        versionEndExcluding?: string;
      }>;
    }>;
  }>;
  references?: Array<{
    url: string;
    source: string;
    tags?: string[];
  }>;
}

interface NVDResponse {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  format: string;
  version: string;
  timestamp: string;
  vulnerabilities: Array<{
    cve: NVDCVEItem;
  }>;
}

export class NVDConnector extends BaseTIConnector {
  private readonly baseUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0/';

  constructor(config: ConnectorConfig) {
    super(config);
  }

  async fetchIndicators(options?: {
    lastModStartDate?: string;
    lastModEndDate?: string;
    pubStartDate?: string;
    pubEndDate?: string;
    cvssV3Severity?: string;
    limit?: number;
  }): Promise<TIIndicator[]> {
    try {
      this.log('info', 'Fetching NVD CVE data');
      
      // Default to last 7 days if no date range specified
      const defaultEndDate = new Date().toISOString();
      const defaultStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const params = new URLSearchParams({
        lastModStartDate: options?.lastModStartDate || defaultStartDate,
        lastModEndDate: options?.lastModEndDate || defaultEndDate,
        resultsPerPage: String(options?.limit || 100),
      });

      if (options?.cvssV3Severity) {
        params.set('cvssV3Severity', options.cvssV3Severity);
      }

      const url = `${this.baseUrl}?${params.toString()}`;
      const headers: Record<string, string> = {};
      
      // Add API key if required and provided
      if (this.config.api_key) {
        headers['apiKey'] = this.config.api_key;
      }

      const response = await this.rateLimitedFetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: NVDResponse = await response.json();
      const indicators = this.transformData(data);

      this.log('info', `Successfully fetched ${indicators.length} NVD CVE indicators`);
      return indicators;
    } catch (error) {
      this.log('error', 'Failed to fetch NVD data', error);
      throw error;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        resultsPerPage: '1',
      });
      
      const headers: Record<string, string> = {};
      if (this.config.api_key) {
        headers['apiKey'] = this.config.api_key;
      }

      const response = await this.rateLimitedFetch(
        `${this.baseUrl}?${params.toString()}`,
        { headers, method: 'GET' }
      );
      
      return response.ok;
    } catch (error) {
      this.log('error', 'Connection validation failed', error);
      return false;
    }
  }

  async getMetadata(): Promise<Record<string, any>> {
    try {
      const params = new URLSearchParams({
        resultsPerPage: '1',
      });
      
      const headers: Record<string, string> = {};
      if (this.config.api_key) {
        headers['apiKey'] = this.config.api_key;
      }

      const response = await this.rateLimitedFetch(
        `${this.baseUrl}?${params.toString()}`,
        { headers }
      );

      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }

      const data: NVDResponse = await response.json();
      
      return {
        format: data.format,
        version: data.version,
        timestamp: data.timestamp,
        total_results: data.totalResults,
        api_rate_limit: this.config.api_key ? '50 requests per 30 seconds' : '5 requests per 30 seconds',
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  protected transformData(data: NVDResponse): TIIndicator[] {
    return data.vulnerabilities.map(vuln => {
      const cve = vuln.cve;
      const description = cve.descriptions.find(d => d.lang === 'en')?.value || 
                         cve.descriptions[0]?.value || 
                         'No description available';

      // Extract CVSS score and severity
      let cvssScore: number | undefined;
      let severity: string | undefined;
      
      if (cve.metrics?.cvssMetricV31?.[0]) {
        const cvss31 = cve.metrics.cvssMetricV31[0];
        cvssScore = cvss31.cvssData.baseScore;
        severity = cvss31.cvssData.baseSeverity.toLowerCase();
      } else if (cve.metrics?.cvssMetricV2?.[0]) {
        const cvss2 = cve.metrics.cvssMetricV2[0];
        cvssScore = cvss2.cvssData.baseScore;
        severity = this.cvss2ToSeverity(cvss2.cvssData.baseScore);
      }

      // Extract affected products from CPE data
      const affectedProducts: string[] = [];
      if (cve.configurations) {
        cve.configurations.forEach(config => {
          config.nodes.forEach(node => {
            node.cpeMatch.forEach(cpe => {
              if (cpe.vulnerable) {
                // Parse CPE to human-readable format
                const cpeStr = cpe.criteria.replace('cpe:2.3:', '').split(':');
                if (cpeStr.length >= 3) {
                  affectedProducts.push(`${cpeStr[2]} ${cpeStr[3]}`);
                }
              }
            });
          });
        });
      }

      return {
        source_id: this.config.source.id,
        indicator_type: 'cve',
        identifier: cve.id,
        title: `${cve.id} - CVE Vulnerability`,
        description: description,
        severity: severity,
        cvss_score: cvssScore,
        exploit_available: false, // NVD doesn't track exploit availability directly
        affected_products: [...new Set(affectedProducts)], // Remove duplicates
        first_seen: cve.published,
        last_updated: cve.lastModified,
        metadata: {
          vuln_status: cve.vulnStatus,
          source_identifier: cve.sourceIdentifier,
          references: cve.references || [],
          cvss_vector: cve.metrics?.cvssMetricV31?.[0]?.cvssData.vectorString ||
                       cve.metrics?.cvssMetricV2?.[0]?.cvssData.vectorString,
        },
      };
    });
  }

  private cvss2ToSeverity(score: number): string {
    if (score >= 7.0) return 'high';
    if (score >= 4.0) return 'medium';
    return 'low';
  }

  /**
   * Fetch recent critical vulnerabilities
   */
  async fetchCriticalVulns(days: number = 7): Promise<TIIndicator[]> {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    return this.fetchIndicators({
      lastModStartDate: startDate,
      lastModEndDate: endDate,
      cvssV3Severity: 'CRITICAL',
      limit: 500,
    });
  }

  /**
   * Get NVD-specific statistics
   */
  async getNVDStats(days: number = 30): Promise<{
    total_cves: number;
    critical_cves: number;
    high_cves: number;
    medium_cves: number;
    low_cves: number;
    severity_breakdown: Record<string, number>;
  }> {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const indicators = await this.fetchIndicators({
        lastModStartDate: startDate,
        lastModEndDate: endDate,
        limit: 1000,
      });

      const severityBreakdown: Record<string, number> = {};
      let critical = 0, high = 0, medium = 0, low = 0;

      indicators.forEach(i => {
        const severity = i.severity || 'unknown';
        severityBreakdown[severity] = (severityBreakdown[severity] || 0) + 1;
        
        switch (severity) {
          case 'critical': critical++; break;
          case 'high': high++; break;
          case 'medium': medium++; break;
          case 'low': low++; break;
        }
      });

      return {
        total_cves: indicators.length,
        critical_cves: critical,
        high_cves: high,
        medium_cves: medium,
        low_cves: low,
        severity_breakdown: severityBreakdown,
      };
    } catch (error) {
      this.log('error', 'Failed to get NVD stats', error);
      throw error;
    }
  }
}