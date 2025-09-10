/**
 * ARIA5.1 Phase 5: Executive Intelligence - Service-Level Business Impact
 * 
 * Executive dashboard service with service-centric risk aggregation and financial
 * impact modeling for C-level executives and board reporting.
 */

export interface BusinessImpactModel {
  id: number;
  model_name: string;
  model_type: 'financial' | 'operational' | 'reputational' | 'regulatory';
  calculation_method: string;
  base_parameters: string;
  accuracy_score: number;
  usage_count: number;
}

export interface ServiceFinancialProfile {
  id: number;
  service_id: number;
  annual_revenue_impact: number;
  annual_cost_to_operate: number;
  downtime_cost_per_hour: number;
  regulatory_fine_potential: number;
  sla_penalty_costs: number;
  reputation_impact_value: number;
  confidence_level: number;
}

export interface ExecutiveRiskSummary {
  id: number;
  summary_date: string;
  reporting_period: string;
  total_services_monitored: number;
  critical_services_at_risk: number;
  high_risk_services: number;
  total_financial_exposure: number;
  critical_financial_exposure: number;
  potential_regulatory_fines: number;
  risk_trend_direction: 'increasing' | 'decreasing' | 'stable';
  executive_action_required: boolean;
  board_escalation_needed: boolean;
}

export interface ServiceRiskAggregation {
  service_id: number;
  service_name: string;
  direct_risk_score: number;
  cascaded_risk_score: number;
  total_risk_score: number;
  financial_impact_estimate: number;
  expected_loss_value: number;
  trend_indicator: 'improving' | 'degrading' | 'stable';
  compliance_impact_score: number;
}

export interface ExecutiveDecisionSupport {
  id: number;
  decision_id: string;
  decision_type: 'investment' | 'mitigation' | 'strategic' | 'operational';
  decision_title: string;
  financial_implications: number;
  recommended_action: string;
  risk_reduction_potential: number;
  approval_status: 'pending' | 'approved' | 'rejected' | 'deferred';
}

export interface BusinessImpactReport {
  total_services: number;
  critical_services: ServiceRiskAggregation[];
  financial_summary: {
    total_revenue_at_risk: number;
    total_financial_exposure: number;
    expected_annual_loss: number;
    risk_adjusted_impact: number;
  };
  risk_trends: {
    direction: string;
    velocity: number;
    key_drivers: string[];
  };
  recommendations: ExecutiveDecisionSupport[];
  compliance_posture: {
    overall_score: number;
    framework_scores: Record<string, number>;
    gaps_identified: number;
  };
}

export interface RiskAppetiteStatus {
  framework_name: string;
  business_area: string;
  current_exposure: number;
  tolerance_threshold: number;
  utilization_percentage: number;
  status: 'within_tolerance' | 'approaching_limit' | 'exceeds_tolerance';
}

export class Phase5ExecutiveIntelligence {
  private db: any;
  private logger: any;

  constructor(database: any, logger?: any) {
    this.db = database;
    this.logger = logger || console;
  }

  /**
   * Generate comprehensive business impact report for executives
   */
  async generateBusinessImpactReport(): Promise<BusinessImpactReport> {
    try {
      this.logger.info('Generating executive business impact report');

      // 1. Service-level risk aggregation
      const serviceRisks = await this.aggregateServiceRisks();
      
      // 2. Financial impact calculation
      const financialSummary = await this.calculateFinancialImpact(serviceRisks);
      
      // 3. Risk trend analysis
      const riskTrends = await this.analyzeRiskTrends();
      
      // 4. Generate recommendations
      const recommendations = await this.generateExecutiveRecommendations();
      
      // 5. Compliance posture assessment
      const compliancePosture = await this.assessCompliancePosture();

      const report: BusinessImpactReport = {
        total_services: serviceRisks.length,
        critical_services: serviceRisks.filter(s => s.total_risk_score >= 80),
        financial_summary: financialSummary,
        risk_trends: riskTrends,
        recommendations: recommendations,
        compliance_posture: compliancePosture
      };

      // Store report for audit trail
      await this.storeExecutiveReport('business_impact', report);

      this.logger.info('Business impact report generated successfully');
      return report;

    } catch (error) {
      this.logger.error('Business impact report generation failed:', error);
      throw new Error(`Executive report generation failed: ${error.message}`);
    }
  }

  /**
   * Aggregate service-level risks with financial context
   */
  async aggregateServiceRisks(): Promise<ServiceRiskAggregation[]> {
    try {
      const query = `
        SELECT 
          s.id as service_id,
          s.name as service_name,
          COALESCE(sra.direct_risk_score, 0) as direct_risk_score,
          COALESCE(sra.cascaded_risk_score, 0) as cascaded_risk_score,
          COALESCE(sra.total_risk_score, 0) as total_risk_score,
          COALESCE(sra.financial_impact_estimate, 0) as financial_impact_estimate,
          COALESCE(sra.expected_loss_value, 0) as expected_loss_value,
          COALESCE(sra.trend_indicator, 'stable') as trend_indicator,
          COALESCE(sra.compliance_impact_score, 0) as compliance_impact_score,
          s.criticality_level,
          sfp.annual_revenue_impact,
          sfp.downtime_cost_per_hour
        FROM services s
        LEFT JOIN service_risk_aggregations sra ON s.id = sra.service_id 
          AND sra.aggregation_date = date('now')
        LEFT JOIN service_financial_profiles sfp ON s.id = sfp.service_id
        WHERE s.service_status = 'Active'
        ORDER BY sra.total_risk_score DESC, sfp.annual_revenue_impact DESC
      `;

      const result = await this.db.prepare(query).all();
      return result.results || [];

    } catch (error) {
      this.logger.error('Service risk aggregation failed:', error);
      return [];
    }
  }

  /**
   * Calculate comprehensive financial impact metrics
   */
  async calculateFinancialImpact(serviceRisks: ServiceRiskAggregation[]): Promise<any> {
    try {
      const totalRevenueAtRisk = serviceRisks.reduce((sum, s) => 
        sum + (s.financial_impact_estimate * (s.total_risk_score / 100)), 0);
      
      const totalFinancialExposure = serviceRisks.reduce((sum, s) => 
        sum + s.financial_impact_estimate, 0);
      
      const expectedAnnualLoss = serviceRisks.reduce((sum, s) => 
        sum + s.expected_loss_value, 0);

      const riskAdjustedImpact = totalRevenueAtRisk * 0.85; // Risk adjustment factor

      return {
        total_revenue_at_risk: Math.round(totalRevenueAtRisk),
        total_financial_exposure: Math.round(totalFinancialExposure), 
        expected_annual_loss: Math.round(expectedAnnualLoss),
        risk_adjusted_impact: Math.round(riskAdjustedImpact)
      };

    } catch (error) {
      this.logger.error('Financial impact calculation failed:', error);
      return {
        total_revenue_at_risk: 0,
        total_financial_exposure: 0,
        expected_annual_loss: 0,
        risk_adjusted_impact: 0
      };
    }
  }

  /**
   * Analyze risk trends and patterns for executive insights
   */
  async analyzeRiskTrends(): Promise<any> {
    try {
      // Get trend analysis from the last 30 days
      const trendsQuery = `
        SELECT 
          trend_direction,
          AVG(trend_velocity) as avg_velocity,
          COUNT(*) as trend_count
        FROM executive_trend_analysis
        WHERE analysis_date >= date('now', '-30 days')
        GROUP BY trend_direction
        ORDER BY trend_count DESC
      `;

      const trendsResult = await this.db.prepare(trendsQuery).all();
      const trends = trendsResult.results || [];

      // Determine overall trend direction
      let overallDirection = 'stable';
      let avgVelocity = 0;
      
      if (trends.length > 0) {
        const primaryTrend = trends[0];
        overallDirection = primaryTrend.trend_direction;
        avgVelocity = primaryTrend.avg_velocity || 0;
      }

      // Get key risk drivers
      const driversQuery = `
        SELECT key_drivers
        FROM executive_trend_analysis
        WHERE analysis_date >= date('now', '-7 days')
        AND trend_direction = ?
        ORDER BY analysis_date DESC
        LIMIT 1
      `;

      const driversResult = await this.db.prepare(driversQuery).bind(overallDirection).first();
      let keyDrivers = ['Market volatility', 'Operational changes', 'External threats'];
      
      if (driversResult?.key_drivers) {
        try {
          keyDrivers = JSON.parse(driversResult.key_drivers);
        } catch {
          // Use defaults if JSON parsing fails
        }
      }

      return {
        direction: overallDirection,
        velocity: avgVelocity,
        key_drivers: keyDrivers
      };

    } catch (error) {
      this.logger.error('Risk trends analysis failed:', error);
      return {
        direction: 'stable',
        velocity: 0,
        key_drivers: ['Data unavailable']
      };
    }
  }

  /**
   * Generate executive-level recommendations based on risk analysis
   */
  async generateExecutiveRecommendations(): Promise<ExecutiveDecisionSupport[]> {
    try {
      const query = `
        SELECT 
          id, decision_id, decision_type, decision_title,
          financial_implications, recommended_action,
          risk_reduction_potential, approval_status,
          implementation_timeframe, resource_requirements
        FROM executive_decision_support
        WHERE approval_status = 'pending'
        AND decision_type IN ('investment', 'mitigation', 'strategic')
        ORDER BY financial_implications DESC, risk_reduction_potential DESC
        LIMIT 10
      `;

      const result = await this.db.prepare(query).all();
      return result.results || [];

    } catch (error) {
      this.logger.error('Executive recommendations generation failed:', error);
      return [];
    }
  }

  /**
   * Assess overall compliance posture across frameworks
   */
  async assessCompliancePosture(): Promise<any> {
    try {
      // Get compliance scores by framework
      const complianceQuery = `
        SELECT 
          framework_name,
          AVG(automation_percentage) as avg_automation,
          AVG(evidence_quality_average) as avg_quality,
          AVG(validation_success_rate) as success_rate
        FROM evidence_automation_metrics
        WHERE metric_date >= date('now', '-30 days')
        GROUP BY framework_name
      `;

      const complianceResult = await this.db.prepare(complianceQuery).all();
      const frameworks = complianceResult.results || [];

      const frameworkScores: Record<string, number> = {};
      let overallScore = 0;

      frameworks.forEach((fw: any) => {
        const score = ((fw.avg_automation + fw.avg_quality * 100 + fw.success_rate * 100) / 3);
        frameworkScores[fw.framework_name] = Math.round(score);
        overallScore += score;
      });

      overallScore = frameworks.length > 0 ? Math.round(overallScore / frameworks.length) : 0;

      // Count compliance gaps (simplified)
      const gapsIdentified = frameworks.filter((fw: any) => fw.avg_automation < 60).length;

      return {
        overall_score: overallScore,
        framework_scores: frameworkScores,
        gaps_identified: gapsIdentified
      };

    } catch (error) {
      this.logger.error('Compliance posture assessment failed:', error);
      return {
        overall_score: 0,
        framework_scores: {},
        gaps_identified: 0
      };
    }
  }

  /**
   * Get current risk appetite status across all frameworks
   */
  async getRiskAppetiteStatus(): Promise<RiskAppetiteStatus[]> {
    try {
      const query = `
        SELECT 
          framework_name,
          business_area,
          current_exposure,
          tolerance_threshold,
          utilization_percentage,
          CASE 
            WHEN utilization_percentage <= 75 THEN 'within_tolerance'
            WHEN utilization_percentage <= 90 THEN 'approaching_limit'
            ELSE 'exceeds_tolerance'
          END as status
        FROM risk_appetite_framework
        WHERE is_active = 1
        ORDER BY utilization_percentage DESC
      `;

      const result = await this.db.prepare(query).all();
      return result.results || [];

    } catch (error) {
      this.logger.error('Risk appetite status retrieval failed:', error);
      return [];
    }
  }

  /**
   * Generate executive KPI dashboard data
   */
  async generateExecutiveKPIs(): Promise<Record<string, any>> {
    try {
      // Get latest executive risk summary
      const summaryQuery = `
        SELECT * FROM executive_risk_summaries
        WHERE summary_date = (SELECT MAX(summary_date) FROM executive_risk_summaries)
        LIMIT 1
      `;

      const summary = await this.db.prepare(summaryQuery).first();

      // Calculate real-time metrics
      const serviceRisks = await this.aggregateServiceRisks();
      const riskAppetite = await this.getRiskAppetiteStatus();
      const financialImpact = await this.calculateFinancialImpact(serviceRisks);

      const kpis = {
        // Core Risk Metrics
        total_services_monitored: serviceRisks.length,
        critical_services_at_risk: serviceRisks.filter(s => s.total_risk_score >= 80).length,
        high_risk_services: serviceRisks.filter(s => s.total_risk_score >= 60 && s.total_risk_score < 80).length,
        
        // Financial Metrics
        total_financial_exposure: financialImpact.total_financial_exposure,
        expected_annual_loss: financialImpact.expected_annual_loss,
        risk_adjusted_impact: financialImpact.risk_adjusted_impact,
        
        // Risk Appetite Metrics
        risk_appetite_utilization: riskAppetite.length > 0 ? riskAppetite[0].utilization_percentage : 0,
        risk_appetite_breaches: riskAppetite.filter(r => r.status === 'exceeds_tolerance').length,
        
        // Trend Indicators
        risk_trend_direction: summary?.risk_trend_direction || 'stable',
        executive_action_required: summary?.executive_action_required || false,
        board_escalation_needed: summary?.board_escalation_needed || false,
        
        // Operational Metrics
        average_risk_score: serviceRisks.reduce((sum, s) => sum + s.total_risk_score, 0) / Math.max(serviceRisks.length, 1),
        services_improving: serviceRisks.filter(s => s.trend_indicator === 'improving').length,
        services_degrading: serviceRisks.filter(s => s.trend_indicator === 'degrading').length
      };

      return kpis;

    } catch (error) {
      this.logger.error('Executive KPI generation failed:', error);
      return {};
    }
  }

  /**
   * Create or update service financial profiles
   */
  async updateServiceFinancialProfile(serviceId: number, profile: Partial<ServiceFinancialProfile>): Promise<boolean> {
    try {
      const updateQuery = `
        INSERT OR REPLACE INTO service_financial_profiles (
          service_id, annual_revenue_impact, annual_cost_to_operate,
          downtime_cost_per_hour, regulatory_fine_potential,
          sla_penalty_costs, reputation_impact_value,
          confidence_level, last_updated_by, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;

      await this.db.prepare(updateQuery).bind(
        serviceId,
        profile.annual_revenue_impact || 0,
        profile.annual_cost_to_operate || 0,
        profile.downtime_cost_per_hour || 0,
        profile.regulatory_fine_potential || 0,
        profile.sla_penalty_costs || 0,
        profile.reputation_impact_value || 0,
        profile.confidence_level || 0.5,
        'system'
      ).run();

      this.logger.info(`Financial profile updated for service ${serviceId}`);
      return true;

    } catch (error) {
      this.logger.error('Service financial profile update failed:', error);
      return false;
    }
  }

  /**
   * Record business impact from actual incidents
   */
  async recordBusinessImpactIncident(incident: any): Promise<boolean> {
    try {
      const insertQuery = `
        INSERT INTO business_impact_incidents (
          incident_id, service_id, incident_title, incident_start_time,
          incident_end_time, duration_minutes, severity_level,
          actual_financial_impact, customers_affected, revenue_lost,
          sla_penalties_incurred, recovery_costs, root_cause_category,
          recorded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.prepare(insertQuery).bind(
        incident.incident_id,
        incident.service_id,
        incident.incident_title,
        incident.incident_start_time,
        incident.incident_end_time,
        incident.duration_minutes,
        incident.severity_level,
        incident.actual_financial_impact || 0,
        incident.customers_affected || 0,
        incident.revenue_lost || 0,
        incident.sla_penalties_incurred || 0,
        incident.recovery_costs || 0,
        incident.root_cause_category || 'unknown',
        'system'
      ).run();

      this.logger.info(`Business impact incident recorded: ${incident.incident_id}`);
      return true;

    } catch (error) {
      this.logger.error('Business impact incident recording failed:', error);
      return false;
    }
  }

  /**
   * Generate executive decision support recommendations
   */
  async createExecutiveDecision(decision: Partial<ExecutiveDecisionSupport>): Promise<string> {
    try {
      const decisionId = `EXEC-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const insertQuery = `
        INSERT INTO executive_decision_support (
          decision_id, decision_type, decision_title, decision_description,
          financial_implications, recommended_action, risk_reduction_potential,
          implementation_timeframe, approval_status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.prepare(insertQuery).bind(
        decisionId,
        decision.decision_type || 'mitigation',
        decision.decision_title || 'Executive Decision Required',
        decision.decision_description || '',
        decision.financial_implications || 0,
        decision.recommended_action || 'Review required',
        decision.risk_reduction_potential || 0,
        decision.implementation_timeframe || 'medium_term',
        'pending',
        'system'
      ).run();

      this.logger.info(`Executive decision created: ${decisionId}`);
      return decisionId;

    } catch (error) {
      this.logger.error('Executive decision creation failed:', error);
      throw error;
    }
  }

  /**
   * Update service risk aggregations (typically called by orchestrator)
   */
  async updateServiceRiskAggregation(serviceId: number, riskData: any): Promise<boolean> {
    try {
      const insertQuery = `
        INSERT OR REPLACE INTO service_risk_aggregations (
          service_id, aggregation_date, aggregation_type,
          direct_risk_score, cascaded_risk_score, total_risk_score,
          financial_impact_estimate, probability_of_impact,
          expected_loss_value, trend_indicator, compliance_impact_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.prepare(insertQuery).bind(
        serviceId,
        new Date().toISOString().split('T')[0], // Today's date
        'daily',
        riskData.direct_risk_score || 0,
        riskData.cascaded_risk_score || 0,
        riskData.total_risk_score || 0,
        riskData.financial_impact_estimate || 0,
        riskData.probability_of_impact || 0,
        riskData.expected_loss_value || 0,
        riskData.trend_indicator || 'stable',
        riskData.compliance_impact_score || 0
      ).run();

      return true;

    } catch (error) {
      this.logger.error('Service risk aggregation update failed:', error);
      return false;
    }
  }

  /**
   * Store executive report for audit and history
   */
  private async storeExecutiveReport(reportType: string, reportData: any): Promise<void> {
    try {
      const reportId = `RPT-${Date.now()}-${reportType.toUpperCase()}`;
      
      const insertQuery = `
        INSERT INTO executive_reports (
          report_id, report_type, report_title, 
          reporting_period_start, reporting_period_end,
          key_metrics, executive_summary, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const today = new Date().toISOString().split('T')[0];
      const executiveSummary = `Business Impact Report: ${reportData.critical_services.length} critical services, $${reportData.financial_summary.total_financial_exposure.toLocaleString()} total exposure`;

      await this.db.prepare(insertQuery).bind(
        reportId,
        reportType,
        `Executive ${reportType.replace('_', ' ').toUpperCase()} Report`,
        today,
        today,
        JSON.stringify(reportData.financial_summary),
        executiveSummary,
        'system'
      ).run();

    } catch (error) {
      this.logger.error('Executive report storage failed:', error);
      // Non-critical error, continue operation
    }
  }

  /**
   * Get executive dashboard configuration
   */
  async getExecutiveDashboardConfig(dashboardType: string): Promise<any> {
    try {
      const query = `
        SELECT * FROM executive_kpi_dashboards
        WHERE dashboard_type = ? AND is_active = 1
        LIMIT 1
      `;

      const result = await this.db.prepare(query).bind(dashboardType).first();
      
      if (result) {
        try {
          result.kpi_configuration = JSON.parse(result.kpi_configuration || '{}');
          result.visualization_settings = JSON.parse(result.visualization_settings || '{}');
          result.alert_thresholds = JSON.parse(result.alert_thresholds || '{}');
        } catch {
          // Use defaults if JSON parsing fails
        }
      }

      return result;

    } catch (error) {
      this.logger.error('Executive dashboard config retrieval failed:', error);
      return null;
    }
  }

  /**
   * Calculate return on investment for risk mitigation
   */
  async calculateMitigationROI(mitigationCost: number, riskReductionPercent: number, currentRiskValue: number): Promise<number> {
    const riskReduction = currentRiskValue * (riskReductionPercent / 100);
    const roi = ((riskReduction - mitigationCost) / mitigationCost) * 100;
    return Math.round(roi * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get services requiring immediate executive attention
   */
  async getServicesRequiringAttention(): Promise<ServiceRiskAggregation[]> {
    try {
      const query = `
        SELECT 
          s.id as service_id,
          s.name as service_name,
          sra.total_risk_score,
          sra.financial_impact_estimate,
          sra.trend_indicator,
          sfp.annual_revenue_impact
        FROM services s
        JOIN service_risk_aggregations sra ON s.id = sra.service_id
        LEFT JOIN service_financial_profiles sfp ON s.id = sfp.service_id
        WHERE sra.total_risk_score >= 75
        AND sra.aggregation_date = date('now')
        AND (sra.trend_indicator = 'degrading' OR sra.total_risk_score >= 85)
        ORDER BY sra.total_risk_score DESC, sfp.annual_revenue_impact DESC
      `;

      const result = await this.db.prepare(query).all();
      return result.results || [];

    } catch (error) {
      this.logger.error('Services requiring attention query failed:', error);
      return [];
    }
  }
}