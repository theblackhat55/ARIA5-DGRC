// Advanced Analytics Engine
// Provides comprehensive analytics for TI-enhanced risk management

export interface TrendAnalysis {
  period: string;
  data_points: Array<{
    date: string;
    critical_indicators: number;
    high_indicators: number;
    medium_indicators: number;
    low_indicators: number;
    risks_created: number;
    risks_validated: number;
    ti_enhanced_risks: number;
  }>;
  trends: {
    indicator_velocity: number; // indicators per day
    risk_creation_rate: number; // risks per day
    validation_efficiency: number; // percentage
    ti_enhancement_adoption: number; // percentage
  };
}

export interface ThreatLandscapeAnalysis {
  top_threat_actors: Array<{
    name: string;
    indicator_count: number;
    severity_distribution: Record<string, number>;
    recent_activity: number;
  }>;
  vulnerability_families: Array<{
    family: string;
    count: number;
    avg_cvss: number;
    exploit_rate: number;
  }>;
  attack_vectors: Array<{
    vector: string;
    prevalence: number;
    risk_score: number;
  }>;
  geographic_distribution: Array<{
    region: string;
    indicator_count: number;
    risk_level: string;
  }>;
}

export interface RiskCorrelationAnalysis {
  correlation_matrix: Array<{
    risk_id_1: number;
    risk_id_2: number;
    correlation_score: number;
    shared_indicators: number;
    correlation_type: string;
  }>;
  cluster_analysis: Array<{
    cluster_id: number;
    risk_ids: number[];
    cluster_theme: string;
    severity_level: string;
  }>;
  temporal_patterns: Array<{
    pattern_type: string;
    frequency: number;
    risk_categories: string[];
    predictive_indicators: string[];
  }>;
}

export interface ExecutiveReport {
  report_id: string;
  generated_at: string;
  period: string;
  executive_summary: {
    total_risks: number;
    critical_risks: number;
    ti_enhanced_percentage: number;
    validation_backlog: number;
    key_insights: string[];
  };
  risk_portfolio: {
    by_category: Record<string, number>;
    by_severity: Record<string, number>;
    by_lifecycle_stage: Record<string, number>;
  };
  threat_intelligence_summary: {
    sources_active: number;
    indicators_processed: number;
    critical_cves: number;
    active_exploits: number;
  };
  recommendations: Array<{
    priority: string;
    category: string;
    recommendation: string;
    impact: string;
  }>;
  kpi_dashboard: {
    risk_detection_rate: number;
    validation_sla_adherence: number;
    ti_feed_uptime: number;
    mean_time_to_resolution: number;
  };
}

export class AnalyticsEngine {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Generate trend analysis for specified period
   */
  async generateTrendAnalysis(days: number = 30): Promise<TrendAnalysis> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      // Get daily TI indicator counts by severity
      const indicatorTrends = await this.db.prepare(`
        SELECT 
          DATE(created_at) as date,
          SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_indicators,
          SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_indicators,
          SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_indicators,
          SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_indicators
        FROM ti_indicators 
        WHERE DATE(created_at) >= DATE(?) AND DATE(created_at) <= DATE(?)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `).bind(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).all();

      // Get daily risk creation and validation counts
      const riskTrends = await this.db.prepare(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as risks_created,
          SUM(CASE WHEN ti_enriched = TRUE THEN 1 ELSE 0 END) as ti_enhanced_risks
        FROM risks 
        WHERE DATE(created_at) >= DATE(?) AND DATE(created_at) <= DATE(?)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `).bind(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).all();

      const validationTrends = await this.db.prepare(`
        SELECT 
          DATE(validation_timestamp) as date,
          COUNT(*) as risks_validated
        FROM risk_validations 
        WHERE validation_status = 'approved' 
          AND DATE(validation_timestamp) >= DATE(?) 
          AND DATE(validation_timestamp) <= DATE(?)
        GROUP BY DATE(validation_timestamp)
        ORDER BY DATE(validation_timestamp)
      `).bind(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).all();

      // Combine data points by date
      const dateMap = new Map();
      
      // Initialize all dates in range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dateMap.set(dateStr, {
          date: dateStr,
          critical_indicators: 0,
          high_indicators: 0,
          medium_indicators: 0,
          low_indicators: 0,
          risks_created: 0,
          risks_validated: 0,
          ti_enhanced_risks: 0
        });
      }

      // Merge indicator data
      indicatorTrends.results?.forEach((row: any) => {
        if (dateMap.has(row.date)) {
          const existing = dateMap.get(row.date);
          existing.critical_indicators = row.critical_indicators || 0;
          existing.high_indicators = row.high_indicators || 0;
          existing.medium_indicators = row.medium_indicators || 0;
          existing.low_indicators = row.low_indicators || 0;
        }
      });

      // Merge risk data
      riskTrends.results?.forEach((row: any) => {
        if (dateMap.has(row.date)) {
          const existing = dateMap.get(row.date);
          existing.risks_created = row.risks_created || 0;
          existing.ti_enhanced_risks = row.ti_enhanced_risks || 0;
        }
      });

      // Merge validation data
      validationTrends.results?.forEach((row: any) => {
        if (dateMap.has(row.date)) {
          const existing = dateMap.get(row.date);
          existing.risks_validated = row.risks_validated || 0;
        }
      });

      const dataPoints = Array.from(dateMap.values());

      // Calculate trends
      const totalIndicators = dataPoints.reduce((sum, dp) => sum + dp.critical_indicators + dp.high_indicators + dp.medium_indicators + dp.low_indicators, 0);
      const totalRisks = dataPoints.reduce((sum, dp) => sum + dp.risks_created, 0);
      const totalValidated = dataPoints.reduce((sum, dp) => sum + dp.risks_validated, 0);
      const totalTIEnhanced = dataPoints.reduce((sum, dp) => sum + dp.ti_enhanced_risks, 0);

      return {
        period: `${days} days`,
        data_points: dataPoints,
        trends: {
          indicator_velocity: totalIndicators / days,
          risk_creation_rate: totalRisks / days,
          validation_efficiency: totalRisks > 0 ? (totalValidated / totalRisks) * 100 : 0,
          ti_enhancement_adoption: totalRisks > 0 ? (totalTIEnhanced / totalRisks) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Error generating trend analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze threat landscape
   */
  async analyzeThreatLandscape(): Promise<ThreatLandscapeAnalysis> {
    try {
      // Analyze vulnerability families (based on CVE patterns)
      const vulnFamilies = await this.db.prepare(`
        SELECT 
          CASE 
            WHEN identifier LIKE 'CVE-%' THEN SUBSTR(identifier, 1, 8)
            ELSE 'Other'
          END as family,
          COUNT(*) as count,
          AVG(COALESCE(cvss_score, 0)) as avg_cvss,
          AVG(CASE WHEN exploit_available = TRUE THEN 1.0 ELSE 0.0 END) as exploit_rate
        FROM ti_indicators 
        WHERE created_at > datetime('now', '-30 days')
        GROUP BY family
        HAVING count > 5
        ORDER BY count DESC
        LIMIT 20
      `).all();

      // Analyze attack vectors based on indicator metadata
      const attackVectors = await this.db.prepare(`
        SELECT 
          CASE 
            WHEN description LIKE '%remote%' OR description LIKE '%network%' THEN 'Network'
            WHEN description LIKE '%privilege%' OR description LIKE '%escalation%' THEN 'Privilege Escalation'
            WHEN description LIKE '%injection%' OR description LIKE '%xss%' THEN 'Injection'
            WHEN description LIKE '%authentication%' OR description LIKE '%bypass%' THEN 'Authentication'
            ELSE 'Other'
          END as vector,
          COUNT(*) as prevalence,
          AVG(COALESCE(cvss_score, 0)) as risk_score
        FROM ti_indicators
        WHERE created_at > datetime('now', '-30 days')
        GROUP BY vector
        ORDER BY prevalence DESC
      `).all();

      return {
        top_threat_actors: [
          // Placeholder data - would be populated from real TI sources
          {
            name: 'APT29',
            indicator_count: 45,
            severity_distribution: { critical: 12, high: 23, medium: 10 },
            recent_activity: 8
          },
          {
            name: 'Lazarus Group',
            indicator_count: 38,
            severity_distribution: { critical: 15, high: 18, medium: 5 },
            recent_activity: 12
          }
        ],
        vulnerability_families: (vulnFamilies.results || []).map((row: any) => ({
          family: row.family,
          count: row.count,
          avg_cvss: Math.round(row.avg_cvss * 10) / 10,
          exploit_rate: Math.round(row.exploit_rate * 100)
        })),
        attack_vectors: (attackVectors.results || []).map((row: any) => ({
          vector: row.vector,
          prevalence: row.prevalence,
          risk_score: Math.round(row.risk_score * 10) / 10
        })),
        geographic_distribution: [
          // Placeholder data - would be populated from geolocation analysis
          { region: 'North America', indicator_count: 234, risk_level: 'medium' },
          { region: 'Europe', indicator_count: 189, risk_level: 'medium' },
          { region: 'Asia Pacific', indicator_count: 156, risk_level: 'high' },
          { region: 'Other', indicator_count: 78, risk_level: 'low' }
        ]
      };
    } catch (error) {
      console.error('Error analyzing threat landscape:', error);
      throw error;
    }
  }

  /**
   * Perform risk correlation analysis
   */
  async performRiskCorrelationAnalysis(): Promise<RiskCorrelationAnalysis> {
    try {
      // Find risks sharing TI indicators
      const correlations = await this.db.prepare(`
        SELECT 
          r1.risk_id as risk_id_1,
          r2.risk_id as risk_id_2,
          COUNT(*) as shared_indicators,
          AVG(r1.relevance_score * r2.relevance_score) as correlation_score
        FROM risk_ti_mappings r1
        JOIN risk_ti_mappings r2 ON r1.ti_indicator_id = r2.ti_indicator_id
        WHERE r1.risk_id < r2.risk_id
        GROUP BY r1.risk_id, r2.risk_id
        HAVING shared_indicators >= 2
        ORDER BY correlation_score DESC
        LIMIT 50
      `).all();

      // Cluster risks by category and TI patterns
      const clusters = await this.db.prepare(`
        SELECT 
          r.category,
          r.risk_lifecycle_stage,
          COUNT(*) as cluster_size,
          AVG(r.risk_score) as avg_risk_score,
          GROUP_CONCAT(r.id) as risk_ids
        FROM risks r
        WHERE r.ti_enriched = TRUE
        GROUP BY r.category, r.risk_lifecycle_stage
        HAVING cluster_size >= 3
        ORDER BY avg_risk_score DESC
      `).all();

      return {
        correlation_matrix: (correlations.results || []).map((row: any, index: number) => ({
          risk_id_1: row.risk_id_1,
          risk_id_2: row.risk_id_2,
          correlation_score: Math.round(row.correlation_score * 100) / 100,
          shared_indicators: row.shared_indicators,
          correlation_type: row.shared_indicators > 3 ? 'strong' : 'moderate'
        })),
        cluster_analysis: (clusters.results || []).map((row: any, index: number) => ({
          cluster_id: index + 1,
          risk_ids: row.risk_ids.split(',').map(Number),
          cluster_theme: `${row.category} risks in ${row.risk_lifecycle_stage} stage`,
          severity_level: row.avg_risk_score > 70 ? 'high' : row.avg_risk_score > 40 ? 'medium' : 'low'
        })),
        temporal_patterns: [
          {
            pattern_type: 'Weekly CVE Releases',
            frequency: 7,
            risk_categories: ['cybersecurity'],
            predictive_indicators: ['NVD updates', 'Security advisories']
          },
          {
            pattern_type: 'Monthly Compliance Reviews',
            frequency: 30,
            risk_categories: ['compliance'],
            predictive_indicators: ['Audit schedules', 'Regulatory updates']
          }
        ]
      };
    } catch (error) {
      console.error('Error performing risk correlation analysis:', error);
      throw error;
    }
  }

  /**
   * Generate executive report
   */
  async generateExecutiveReport(period: string = '30d'): Promise<ExecutiveReport> {
    try {
      const days = parseInt(period.replace('d', ''));
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get executive summary statistics
      const riskStats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_risks,
          SUM(CASE WHEN risk_score >= 80 THEN 1 ELSE 0 END) as critical_risks,
          SUM(CASE WHEN ti_enriched = TRUE THEN 1 ELSE 0 END) as ti_enhanced_count,
          SUM(CASE WHEN validation_status = 'pending' THEN 1 ELSE 0 END) as validation_backlog
        FROM risks
        WHERE created_at >= ?
      `).bind(startDate.toISOString()).first();

      const tiStats = await this.db.prepare(`
        SELECT 
          COUNT(DISTINCT source_id) as sources_active,
          COUNT(*) as indicators_processed,
          SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_cves,
          SUM(CASE WHEN exploit_available = TRUE THEN 1 ELSE 0 END) as active_exploits
        FROM ti_indicators
        WHERE created_at >= ?
      `).bind(startDate.toISOString()).first();

      // Get risk portfolio breakdown
      const categoryBreakdown = await this.db.prepare(`
        SELECT category, COUNT(*) as count
        FROM risks
        WHERE created_at >= ?
        GROUP BY category
      `).bind(startDate.toISOString()).all();

      const severityBreakdown = await this.db.prepare(`
        SELECT 
          CASE 
            WHEN risk_score >= 80 THEN 'Critical'
            WHEN risk_score >= 60 THEN 'High'
            WHEN risk_score >= 40 THEN 'Medium'
            ELSE 'Low'
          END as severity,
          COUNT(*) as count
        FROM risks
        WHERE created_at >= ?
        GROUP BY severity
      `).bind(startDate.toISOString()).all();

      const stageBreakdown = await this.db.prepare(`
        SELECT risk_lifecycle_stage, COUNT(*) as count
        FROM risks
        WHERE created_at >= ?
        GROUP BY risk_lifecycle_stage
      `).bind(startDate.toISOString()).all();

      // Calculate KPIs
      const validationSLA = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_validations,
          SUM(CASE WHEN 
            julianday(validation_timestamp) - julianday(created_at) <= 1 
            THEN 1 ELSE 0 END
          ) as within_sla
        FROM risk_validations
        WHERE created_at >= ?
      `).bind(startDate.toISOString()).first();

      const reportId = `exec-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      return {
        report_id: reportId,
        generated_at: new Date().toISOString(),
        period: period,
        executive_summary: {
          total_risks: riskStats?.total_risks || 0,
          critical_risks: riskStats?.critical_risks || 0,
          ti_enhanced_percentage: riskStats?.total_risks ? 
            Math.round((riskStats.ti_enhanced_count / riskStats.total_risks) * 100) : 0,
          validation_backlog: riskStats?.validation_backlog || 0,
          key_insights: [
            `${riskStats?.critical_risks || 0} critical risks identified in the last ${days} days`,
            `${Math.round(((riskStats?.ti_enhanced_count || 0) / (riskStats?.total_risks || 1)) * 100)}% of risks are TI-enhanced`,
            `${tiStats?.active_exploits || 0} indicators with active exploits detected`,
            `${tiStats?.sources_active || 0} threat intelligence sources active`
          ]
        },
        risk_portfolio: {
          by_category: this.arrayToObject(categoryBreakdown.results || []),
          by_severity: this.arrayToObject(severityBreakdown.results || []),
          by_lifecycle_stage: this.arrayToObject(stageBreakdown.results || [])
        },
        threat_intelligence_summary: {
          sources_active: tiStats?.sources_active || 0,
          indicators_processed: tiStats?.indicators_processed || 0,
          critical_cves: tiStats?.critical_cves || 0,
          active_exploits: tiStats?.active_exploits || 0
        },
        recommendations: [
          {
            priority: 'High',
            category: 'Validation Process',
            recommendation: 'Reduce validation backlog by implementing automated pre-screening',
            impact: 'Improved response time and resource allocation'
          },
          {
            priority: 'Medium',
            category: 'TI Integration',
            recommendation: 'Increase TI enhancement coverage to 95% of risks',
            impact: 'Better risk prioritization and context'
          },
          {
            priority: 'Medium',
            category: 'Threat Monitoring',
            recommendation: 'Add additional TI sources for comprehensive coverage',
            impact: 'Enhanced threat visibility and detection'
          }
        ],
        kpi_dashboard: {
          risk_detection_rate: Math.round(((riskStats?.total_risks || 0) / days) * 10) / 10,
          validation_sla_adherence: validationSLA?.total_validations ? 
            Math.round(((validationSLA.within_sla / validationSLA.total_validations) * 100) * 10) / 10 : 0,
          ti_feed_uptime: 98.5, // Placeholder - would be calculated from actual uptime data
          mean_time_to_resolution: 4.2 // Placeholder - would be calculated from resolution times
        }
      };
    } catch (error) {
      console.error('Error generating executive report:', error);
      throw error;
    }
  }

  /**
   * Helper method to convert array results to object
   */
  private arrayToObject(arr: any[]): Record<string, number> {
    const obj: Record<string, number> = {};
    arr.forEach(item => {
      const key = Object.values(item)[0] as string;
      const value = Object.values(item)[1] as number;
      obj[key] = value;
    });
    return obj;
  }

  /**
   * Get real-time analytics dashboard data
   */
  async getDashboardAnalytics(): Promise<{
    real_time_metrics: any;
    performance_indicators: any;
    threat_activity: any;
  }> {
    try {
      const realTimeMetrics = await this.db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM risks WHERE status = 'active') as active_risks,
          (SELECT COUNT(*) FROM risks WHERE validation_status = 'pending') as pending_validation,
          (SELECT COUNT(*) FROM ti_indicators WHERE created_at > datetime('now', '-1 hour')) as recent_indicators,
          (SELECT COUNT(*) FROM risk_validations WHERE validation_timestamp > datetime('now', '-1 hour')) as recent_validations
      `).first();

      const performanceIndicators = await this.db.prepare(`
        SELECT 
          AVG(CASE WHEN validation_timestamp IS NOT NULL THEN 
            (julianday(validation_timestamp) - julianday(created_at)) * 24 
          END) as avg_validation_time_hours,
          (SELECT COUNT(*) FROM ti_sources WHERE status = 'active') as active_ti_sources,
          (SELECT COUNT(*) FROM risks WHERE ti_enriched = TRUE) * 100.0 / 
          NULLIF((SELECT COUNT(*) FROM risks), 0) as ti_enhancement_rate
        FROM risk_validations
        WHERE created_at > datetime('now', '-7 days')
      `).first();

      const threatActivity = await this.db.prepare(`
        SELECT 
          severity,
          COUNT(*) as count
        FROM ti_indicators 
        WHERE created_at > datetime('now', '-24 hours')
        GROUP BY severity
        ORDER BY 
          CASE severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2  
            WHEN 'medium' THEN 3
            ELSE 4
          END
      `).all();

      return {
        real_time_metrics: realTimeMetrics,
        performance_indicators: performanceIndicators,
        threat_activity: threatActivity.results || []
      };
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      throw error;
    }
  }
}