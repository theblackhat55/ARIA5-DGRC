// CISA KEV (Known Exploited Vulnerabilities) Connector
// Fetches data from CISA's Known Exploited Vulnerabilities Catalog

import { BaseTIConnector, TIIndicator, ConnectorConfig } from './base-connector';

interface CISAKEVEntry {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse: string;
  notes?: string;
}

interface CISAKEVResponse {
  title: string;
  catalogVersion: string;
  dateReleased: string;
  count: number;
  vulnerabilities: CISAKEVEntry[];
}

export class CISAKEVConnector extends BaseTIConnector {
  constructor(config: ConnectorConfig) {
    super(config);
  }

  async fetchIndicators(): Promise<TIIndicator[]> {
    try {
      this.log('info', 'Fetching CISA KEV data');
      
      const response = await this.rateLimitedFetch(
        this.config.source.url || 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CISAKEVResponse = await response.json();
      const indicators = this.transformData(data);

      this.log('info', `Successfully fetched ${indicators.length} CISA KEV indicators`);
      return indicators;
    } catch (error) {
      this.log('error', 'Failed to fetch CISA KEV data', error);
      throw error;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await this.rateLimitedFetch(
        this.config.source.url || 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
        { method: 'HEAD' }
      );
      return response.ok;
    } catch (error) {
      this.log('error', 'Connection validation failed', error);
      return false;
    }
  }

  async getMetadata(): Promise<Record<string, any>> {
    try {
      const response = await this.rateLimitedFetch(
        this.config.source.url || 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
      );

      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }

      const data: CISAKEVResponse = await response.json();
      
      return {
        title: data.title,
        catalog_version: data.catalogVersion,
        date_released: data.dateReleased,
        vulnerability_count: data.count,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  protected transformData(data: CISAKEVResponse): TIIndicator[] {
    return data.vulnerabilities.map(vuln => ({
      source_id: this.config.source.id,
      indicator_type: 'cve',
      identifier: vuln.cveID,
      title: vuln.vulnerabilityName,
      description: vuln.shortDescription,
      severity: 'critical', // CISA KEV are all critical by definition
      exploit_available: true, // KEV means actively exploited
      exploit_maturity: 'active',
      affected_products: [`${vuln.vendorProject} ${vuln.product}`],
      mitigation_available: true,
      mitigation_details: vuln.requiredAction,
      first_seen: vuln.dateAdded,
      last_updated: new Date().toISOString(),
      metadata: {
        due_date: vuln.dueDate,
        ransomware_use: vuln.knownRansomwareCampaignUse === 'Known',
        notes: vuln.notes,
        catalog_version: data.catalogVersion,
        vendor_project: vuln.vendorProject,
        product: vuln.product,
      },
    }));
  }

  /**
   * Get KEV-specific statistics
   */
  async getKEVStats(): Promise<{
    total_vulnerabilities: number;
    ransomware_related: number;
    recent_additions: number;
    vendor_breakdown: Record<string, number>;
  }> {
    try {
      const indicators = await this.fetchIndicators();
      const total = indicators.length;
      const ransomware = indicators.filter(i => i.metadata?.ransomware_use).length;
      const recent = indicators.filter(i => {
        const added = new Date(i.first_seen || '');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return added > thirtyDaysAgo;
      }).length;

      const vendorBreakdown: Record<string, number> = {};
      indicators.forEach(i => {
        const vendor = i.metadata?.vendor_project || 'Unknown';
        vendorBreakdown[vendor] = (vendorBreakdown[vendor] || 0) + 1;
      });

      return {
        total_vulnerabilities: total,
        ransomware_related: ransomware,
        recent_additions: recent,
        vendor_breakdown: vendorBreakdown,
      };
    } catch (error) {
      this.log('error', 'Failed to get KEV stats', error);
      throw error;
    }
  }
}