/**
 * Service-Centric Risk Scoring Engine
 * 
 * Implements CIA triad-based risk scoring with cascading from assets to business services.
 * Provides real-time risk score calculations and business impact assessments.
 * 
 * Key Features:
 * - CIA triad scoring (Confidentiality, Integrity, Availability)
 * - Risk cascading from assets to dependent business services
 * - Business impact assessment based on service criticality
 * - Real-time score updates with historical tracking
 * - Multi-dimensional risk aggregation
 */

export interface CIAScore {
  confidentiality: number; // 1-10 scale
  integrity: number;       // 1-10 scale
  availability: number;    // 1-10 scale
}

export interface RiskScore {
  overall: number;         // 1-100 calculated score
  cia: CIAScore;
  business_impact: number; // 1-10 based on service criticality
  technical_impact: number; // 1-10 based on asset criticality
  likelihood: number;      // 1-10 probability of occurrence
  computed_at: string;     // ISO timestamp
}

export interface ServiceRiskProfile {
  service_id: number;
  service_name: string;
  current_score: RiskScore;
  risk_trend: 'increasing' | 'stable' | 'decreasing';
  dependent_assets: number; // Count of assets affecting this service
  active_risks: number;     // Count of active risks
  last_updated: string;
}

export interface AssetRiskImpact {
  asset_id: number;
  asset_name: string;
  asset_type: string;
  risk_score: RiskScore;
  affected_services: number[]; // Service IDs that depend on this asset
}

export class ServiceCentricRiskScoringEngine {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Calculate comprehensive risk score for a business service
   * Aggregates risks from all dependent assets and direct service risks
   */
  async calculateServiceRiskScore(serviceId: number): Promise<ServiceRiskProfile> {
    try {
      // Get service details
      const service = await this.db.prepare(`
        SELECT id, name, criticality_level, availability_impact 
        FROM business_services 
        WHERE id = ?
      `).bind(serviceId).first();

      if (!service) {
        throw new Error(`Service ${serviceId} not found`);
      }

      // Get all assets that impact this service
      const impactingAssets = await this.db.prepare(`
        SELECT DISTINCT a.id, a.name, a.asset_type, a.criticality,
               dr.impact as severity_score, dr.probability as likelihood_score, dr.impact as business_impact_score
        FROM assets a
        JOIN service_asset_relationships sar ON a.id = sar.asset_id
        JOIN dynamic_risks dr ON a.id = dr.asset_id
        WHERE sar.service_id = ? AND dr.status = 'active'
      `).bind(serviceId).all();

      // Get direct service risks
      const serviceRisks = await this.db.prepare(`
        SELECT impact as severity_score, probability as likelihood_score, impact as business_impact_score,
               1 as confidentiality_impact, 1 as integrity_impact, 1 as availability_impact
        FROM dynamic_risks 
        WHERE service_id = ? AND status = 'active'
      `).bind(serviceId).all();

      // Calculate CIA scores
      const ciaScore = await this.calculateCIAScore(impactingAssets.results || [], serviceRisks.results || []);

      // Calculate overall risk score
      const overallScore = await this.calculateOverallScore(ciaScore, service, impactingAssets.results || []);

      // Get risk trend
      const riskTrend = await this.calculateRiskTrend(serviceId);

      // Count metrics
      const dependentAssets = impactingAssets.results?.length || 0;
      const activeRisks = (serviceRisks.results?.length || 0) + (impactingAssets.results?.length || 0);

      const riskScore: RiskScore = {
        overall: overallScore,
        cia: ciaScore,
        business_impact: this.mapCriticalityToScore(service.criticality_level),
        technical_impact: await this.calculateTechnicalImpact(impactingAssets.results || []),
        likelihood: await this.calculateAverageLikelihood(serviceRisks.results || [], impactingAssets.results || []),
        computed_at: new Date().toISOString()
      };

      // Store risk score history
      await this.storeRiskScoreHistory(serviceId, riskScore);

      return {
        service_id: serviceId,
        service_name: service.name,
        current_score: riskScore,
        risk_trend: riskTrend,
        dependent_assets: dependentAssets,
        active_risks: activeRisks,
        last_updated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error calculating service risk score:', error);
      throw error;
    }
  }

  /**
   * Calculate CIA triad scores based on asset and service risks
   */
  private async calculateCIAScore(assetRisks: any[], serviceRisks: any[]): Promise<CIAScore> {
    const allRisks = [...assetRisks, ...serviceRisks];
    
    if (allRisks.length === 0) {
      return { confidentiality: 1, integrity: 1, availability: 1 };
    }

    // Calculate weighted averages with higher weights for more severe risks
    const confidentiality = this.calculateWeightedCIAComponent(allRisks, 'confidentiality_impact');
    const integrity = this.calculateWeightedCIAComponent(allRisks, 'integrity_impact');
    const availability = this.calculateWeightedCIAComponent(allRisks, 'availability_impact');

    return {
      confidentiality: Math.min(10, Math.max(1, Math.round(confidentiality))),
      integrity: Math.min(10, Math.max(1, Math.round(integrity))),
      availability: Math.min(10, Math.max(1, Math.round(availability)))
    };
  }

  /**
   * Calculate weighted CIA component score
   */
  private calculateWeightedCIAComponent(risks: any[], component: string): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const risk of risks) {
      const componentScore = risk[component] || 1;
      const weight = (risk.severity_score || 5) * (risk.likelihood_score || 5) / 25; // Normalize to 0-1
      
      totalWeightedScore += componentScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 1;
  }

  /**
   * Calculate overall risk score (1-100)
   */
  private async calculateOverallScore(cia: CIAScore, service: any, assetRisks: any[]): Promise<number> {
    // Base score from CIA triad (weighted by business criticality)
    const ciaAverage = (cia.confidentiality + cia.integrity + cia.availability) / 3;
    const criticalityMultiplier = this.mapCriticalityToMultiplier(service.criticality_level);
    
    // Asset risk contribution
    const assetRiskContribution = this.calculateAssetRiskContribution(assetRisks);
    
    // Service availability impact factor
    const availabilityFactor = this.mapAvailabilityImpact(service.availability_impact);
    
    // Calculate composite score
    let overallScore = (ciaAverage * criticalityMultiplier * availabilityFactor) + assetRiskContribution;
    
    // Normalize to 1-100 scale
    overallScore = Math.min(100, Math.max(1, Math.round(overallScore * 10)));
    
    return overallScore;
  }

  /**
   * Calculate asset risk contribution to service score
   */
  private calculateAssetRiskContribution(assetRisks: any[]): number {
    if (assetRisks.length === 0) return 0;

    const averageSeverity = assetRisks.reduce((sum, risk) => sum + (risk.severity_score || 5), 0) / assetRisks.length;
    const averageLikelihood = assetRisks.reduce((sum, risk) => sum + (risk.likelihood_score || 5), 0) / assetRisks.length;
    
    // Risk contribution scaled by number of assets (more assets = higher potential impact)
    const assetCountFactor = Math.min(2.0, 1 + (assetRisks.length - 1) * 0.1);
    
    return (averageSeverity * averageLikelihood / 25) * assetCountFactor;
  }

  /**
   * Calculate technical impact score
   */
  private async calculateTechnicalImpact(assetRisks: any[]): Promise<number> {
    if (assetRisks.length === 0) return 1;

    // Consider asset criticality and risk severity
    const techImpact = assetRisks.reduce((sum, risk) => {
      const criticalityScore = this.mapCriticalityToScore(risk.criticality_level);
      const severityScore = risk.severity_score || 5;
      return sum + (criticalityScore * severityScore / 10);
    }, 0) / assetRisks.length;

    return Math.min(10, Math.max(1, Math.round(techImpact)));
  }

  /**
   * Calculate average likelihood across all risks
   */
  private async calculateAverageLikelihood(serviceRisks: any[], assetRisks: any[]): Promise<number> {
    const allRisks = [...serviceRisks, ...assetRisks];
    
    if (allRisks.length === 0) return 5; // Default moderate likelihood

    const averageLikelihood = allRisks.reduce((sum, risk) => sum + (risk.likelihood_score || 5), 0) / allRisks.length;
    return Math.min(10, Math.max(1, Math.round(averageLikelihood)));
  }

  /**
   * Calculate risk trend over time
   */
  private async calculateRiskTrend(serviceId: number): Promise<'increasing' | 'stable' | 'decreasing'> {
    try {
      const recentScores = await this.db.prepare(`
        SELECT overall_score, computed_at 
        FROM risk_score_history 
        WHERE service_id = ? 
        ORDER BY computed_at DESC 
        LIMIT 5
      `).bind(serviceId).all();

      const scores = recentScores.results || [];
      
      if (scores.length < 2) return 'stable';

      // Calculate trend using linear regression or simple comparison
      const oldScore = scores[scores.length - 1].overall_score;
      const newScore = scores[0].overall_score;
      const difference = newScore - oldScore;

      if (difference > 5) return 'increasing';
      if (difference < -5) return 'decreasing';
      return 'stable';

    } catch (error) {
      console.error('Error calculating risk trend:', error);
      return 'stable';
    }
  }

  /**
   * Store risk score in history for trend analysis
   */
  private async storeRiskScoreHistory(serviceId: number, riskScore: RiskScore): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO risk_score_history (
          service_id, overall_score, confidentiality_score, integrity_score, 
          availability_score, business_impact_score, technical_impact_score, 
          likelihood_score, computed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        serviceId,
        riskScore.overall,
        riskScore.cia.confidentiality,
        riskScore.cia.integrity,
        riskScore.cia.availability,
        riskScore.business_impact,
        riskScore.technical_impact,
        riskScore.likelihood,
        riskScore.computed_at
      ).run();

      // Clean up old history (keep last 30 days)
      await this.db.prepare(`
        DELETE FROM risk_score_history 
        WHERE service_id = ? AND computed_at < datetime('now', '-30 days')
      `).bind(serviceId).run();

    } catch (error) {
      console.error('Error storing risk score history:', error);
    }
  }

  /**
   * Get risk cascading analysis - how asset risks affect services
   */
  async getRiskCascadingAnalysis(): Promise<AssetRiskImpact[]> {
    try {
      const assetImpacts = await this.db.prepare(`
        SELECT DISTINCT 
          a.id as asset_id,
          a.name as asset_name,
          a.asset_type,
          a.criticality,
          dr.severity_score,
          dr.likelihood_score,
          dr.business_impact_score,
          dr.confidentiality_impact,
          dr.integrity_impact,
          dr.availability_impact,
          GROUP_CONCAT(sar.service_id) as service_ids
        FROM assets a
        JOIN dynamic_risks dr ON a.id = dr.asset_id
        JOIN service_asset_relationships sar ON a.id = sar.asset_id
        WHERE dr.status = 'active'
        GROUP BY a.id, a.name, a.asset_type, a.criticality,
                 dr.impact as severity_score, dr.probability as likelihood_score, dr.impact as business_impact_score,
                 1 as confidentiality_impact, 1 as integrity_impact, 1 as availability_impact
      `).all();

      const results: AssetRiskImpact[] = [];

      for (const asset of assetImpacts.results || []) {
        const ciaScore: CIAScore = {
          confidentiality: asset.confidentiality_impact || 1,
          integrity: asset.integrity_impact || 1,
          availability: asset.availability_impact || 1
        };

        const riskScore: RiskScore = {
          overall: Math.round((asset.severity_score || 5) * 10),
          cia: ciaScore,
          business_impact: asset.business_impact_score || 5,
          technical_impact: this.mapCriticalityToScore(asset.criticality_level),
          likelihood: asset.likelihood_score || 5,
          computed_at: new Date().toISOString()
        };

        const affectedServices = asset.service_ids ? 
          asset.service_ids.split(',').map((id: string) => parseInt(id)) : [];

        results.push({
          asset_id: asset.asset_id,
          asset_name: asset.asset_name,
          asset_type: asset.asset_type,
          risk_score: riskScore,
          affected_services: affectedServices
        });
      }

      return results;

    } catch (error) {
      console.error('Error getting risk cascading analysis:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive service risk dashboard data
   */
  async getServiceRiskDashboard(): Promise<{
    services: ServiceRiskProfile[];
    summary: {
      total_services: number;
      high_risk_services: number;
      medium_risk_services: number;
      low_risk_services: number;
      average_risk_score: number;
    };
  }> {
    try {
      // Get all business services
      const services = await this.db.prepare(`
        SELECT id FROM business_services WHERE service_status = 'Active'
      `).all();

      const serviceProfiles: ServiceRiskProfile[] = [];
      let totalScore = 0;

      // Calculate risk profile for each service
      for (const service of services.results || []) {
        const profile = await this.calculateServiceRiskScore(service.id);
        serviceProfiles.push(profile);
        totalScore += profile.current_score.overall;
      }

      // Calculate summary statistics
      const totalServices = serviceProfiles.length;
      const highRisk = serviceProfiles.filter(s => s.current_score.overall >= 70).length;
      const mediumRisk = serviceProfiles.filter(s => s.current_score.overall >= 40 && s.current_score.overall < 70).length;
      const lowRisk = serviceProfiles.filter(s => s.current_score.overall < 40).length;
      const averageScore = totalServices > 0 ? Math.round(totalScore / totalServices) : 0;

      return {
        services: serviceProfiles,
        summary: {
          total_services: totalServices,
          high_risk_services: highRisk,
          medium_risk_services: mediumRisk,
          low_risk_services: lowRisk,
          average_risk_score: averageScore
        }
      };

    } catch (error) {
      console.error('Error getting service risk dashboard:', error);
      throw error;
    }
  }

  /**
   * Helper methods for mapping and calculations
   */
  private mapCriticalityToScore(criticality: string): number {
    const mapping: { [key: string]: number } = {
      'critical': 10,
      'high': 8,
      'medium': 6,
      'low': 4,
      'minimal': 2
    };
    return mapping[criticality?.toLowerCase()] || 5;
  }

  private mapCriticalityToMultiplier(criticality: string): number {
    const mapping: { [key: string]: number } = {
      'critical': 1.5,
      'high': 1.3,
      'medium': 1.0,
      'low': 0.8,
      'minimal': 0.6
    };
    return mapping[criticality?.toLowerCase()] || 1.0;
  }

  private mapAvailabilityImpact(impact: number): number {
    // Map availability impact (1-5 scale) to factor
    // Higher impact = higher multiplier for risk
    const mapping: { [key: number]: number } = {
      5: 1.4,  // Critical availability needs
      4: 1.3,  // High availability needs
      3: 1.0,  // Standard availability
      2: 0.9,  // Lower availability needs
      1: 0.8   // Minimal availability needs
    };
    return mapping[impact] || 1.0;
  }

  /**
   * Recalculate all service risk scores (for batch updates)
   */
  async recalculateAllServiceRiskScores(): Promise<void> {
    try {
      console.log('Starting batch recalculation of all service risk scores...');

      const services = await this.db.prepare(`
        SELECT id FROM business_services WHERE service_status = 'Active'
      `).all();

      let processed = 0;
      for (const service of services.results || []) {
        try {
          await this.calculateServiceRiskScore(service.id);
          processed++;
          
          if (processed % 10 === 0) {
            console.log(`Processed ${processed}/${services.results?.length || 0} services...`);
          }
        } catch (error) {
          console.error(`Error processing service ${service.id}:`, error);
        }
      }

      console.log(`Completed batch recalculation. Processed ${processed} services.`);

    } catch (error) {
      console.error('Error in batch recalculation:', error);
      throw error;
    }
  }
}