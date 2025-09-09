/**
 * AI-Driven Service Criticality Assessment Engine
 * 
 * This service provides intelligent, automated criticality assessment for organizational services
 * based on CIA triad scores, asset dependencies, risk associations, and machine learning models.
 */

export interface ServiceCriticalityFactors {
  // CIA Triad Impact (0-5 scale)
  confidentiality_impact: number;
  integrity_impact: number;
  availability_impact: number;
  
  // Asset Dependencies
  dependent_assets_count: number;
  critical_assets_count: number;
  asset_dependency_score: number;
  
  // Risk Associations
  associated_risks_count: number;
  high_severity_risks_count: number;
  risk_aggregation_score: number;
  
  // Business Impact
  business_function_criticality: number;
  user_impact_scope: number;
  revenue_impact: number;
  
  // Technical Factors
  recovery_time_objective: number; // RTO in hours
  recovery_point_objective: number; // RPO in hours
  service_uptime_requirement: number; // SLA percentage
  
  // Historical Data
  incident_frequency: number;
  downtime_history: number;
  security_events_count: number;
}

export interface CriticalityAssessment {
  service_id: string;
  service_name: string;
  calculated_criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  criticality_score: number; // 0-100 scale
  confidence_level: number; // ML model confidence
  
  contributing_factors: {
    cia_weighted_score: number;
    asset_dependency_impact: number;
    risk_correlation_impact: number;
    business_impact_score: number;
    technical_requirements_score: number;
    historical_pattern_score: number;
  };
  
  recommendations: string[];
  reassessment_trigger_conditions: string[];
  last_assessment: string;
  next_assessment_due: string;
}

export interface MLCriticalityModel {
  model_id: string;
  algorithm_type: 'random_forest' | 'neural_network' | 'gradient_boosting' | 'ensemble';
  training_features: string[];
  accuracy_score: number;
  precision_score: number;
  recall_score: number;
  f1_score: number;
  feature_importance: Record<string, number>;
  model_version: string;
  last_trained: string;
  training_data_size: number;
}

export class AIServiceCriticalityEngine {
  constructor(private db: D1Database) {}

  /**
   * Enhanced service criticality with risk cascading integration
   * Uses Phase 1 Dynamic GRC service-centric architecture
   */
  async calculateServiceCriticalityWithCascading(serviceId: number): Promise<CriticalityAssessment> {
    // Get service data from new services table
    const serviceData = await this.getServiceDataById(serviceId);
    if (!serviceData) {
      throw new Error(`Service ${serviceId} not found`);
    }

    // Get risk associations and dependencies
    const riskAssociations = await this.getServiceRiskAssociations(serviceId);
    const dependencies = await this.getServiceDependencyData(serviceId);
    const historicalData = await this.getServiceHistoricalData(serviceId);
    
    // Extract enhanced factors with risk cascading
    const factors = await this.extractEnhancedCriticalityFactors(
      serviceData, 
      riskAssociations,
      dependencies, 
      historicalData
    );
    
    // Apply weighted scoring with risk cascading
    const scores = this.calculateEnhancedWeightedScores(factors);
    
    // Use ML model for prediction refinement
    const mlPrediction = await this.applyMLPrediction(factors);
    
    // Combine scores with risk cascading impact
    const finalScore = this.combineScoresWithRiskCascading(scores, mlPrediction, riskAssociations);
    
    // Generate recommendations with risk-aware insights
    const recommendations = this.generateRiskAwareRecommendations(factors, finalScore, riskAssociations);
    
    return {
      service_id: serviceId.toString(),
      service_name: serviceData.name,
      calculated_criticality: this.scoreToCriticality(finalScore.overall_score),
      criticality_score: Math.round(finalScore.overall_score),
      confidence_level: mlPrediction.confidence,
      contributing_factors: scores,
      recommendations,
      reassessment_trigger_conditions: this.getEnhancedTriggerConditions(factors, riskAssociations),
      last_assessment: new Date().toISOString(),
      next_assessment_due: this.calculateNextAssessment(factors).toISOString()
    };
  }

  /**
   * Calculate automated service criticality using AI/ML algorithms
   */
  async calculateServiceCriticality(serviceId: string): Promise<CriticalityAssessment> {
    // 1. Gather service data and dependencies
    const serviceData = await this.getServiceData(serviceId);
    const assetDependencies = await this.getAssetDependencies(serviceId);
    const riskAssociations = await this.getRiskAssociations(serviceId);
    const historicalData = await this.getHistoricalServiceData(serviceId);
    
    // 2. Extract features for ML model
    const factors = await this.extractCriticalityFactors(
      serviceData, 
      assetDependencies, 
      riskAssociations, 
      historicalData
    );
    
    // 3. Apply weighted scoring algorithm
    const scores = this.calculateWeightedScores(factors);
    
    // 4. Use ML model for prediction refinement
    const mlPrediction = await this.applyMLPrediction(factors);
    
    // 5. Combine algorithmic and ML scores
    const finalScore = this.combineScores(scores, mlPrediction);
    
    // 6. Generate recommendations
    const recommendations = this.generateRecommendations(factors, finalScore);
    
    return {
      service_id: serviceId,
      service_name: serviceData.name,
      calculated_criticality: this.scoreToCriticality(finalScore.overall_score),
      criticality_score: Math.round(finalScore.overall_score),
      confidence_level: mlPrediction.confidence,
      contributing_factors: scores,
      recommendations,
      reassessment_trigger_conditions: this.getTriggerConditions(factors),
      last_assessment: new Date().toISOString(),
      next_assessment_due: this.calculateNextAssessment(factors).toISOString()
    };
  }

  /**
   * Enhanced weighted scoring with risk cascading integration
   */
  private calculateEnhancedWeightedScores(factors: ServiceCriticalityFactors) {
    // Enhanced CIA scoring (35% of total score) - reduced to make room for risk scoring
    const cia_weights = { confidentiality: 0.3, integrity: 0.4, availability: 0.3 };
    const cia_weighted_score = (
      factors.confidentiality_impact * cia_weights.confidentiality +
      factors.integrity_impact * cia_weights.integrity +
      factors.availability_impact * cia_weights.availability
    ) * 20; // Scale to 0-100
    
    // Service dependency impact (20% of total score)
    const asset_dependency_impact = Math.min(100, 
      (factors.dependent_assets_count * 3) + 
      (factors.critical_assets_count * 12) + 
      (factors.asset_dependency_score * 8)
    );
    
    // Risk aggregation impact (30% of total score) - enhanced for Phase 1
    const risk_correlation_impact = Math.min(100,
      (factors.associated_risks_count * 5) +
      (factors.high_severity_risks_count * 15) +
      (factors.risk_aggregation_score * 2) // Direct use of aggregate risk score
    );
    
    // Business impact (10% of total score)
    const business_impact_score = (
      factors.business_function_criticality * 0.4 +
      factors.user_impact_scope * 0.3 +
      factors.revenue_impact * 0.3
    ) * 20;
    
    // Technical requirements (3% of total score)
    const rto_score = Math.max(0, 100 - (factors.recovery_time_objective * 2));
    const rpo_score = Math.max(0, 100 - (factors.recovery_point_objective * 4));
    const sla_score = factors.service_uptime_requirement;
    const technical_requirements_score = (rto_score + rpo_score + sla_score) / 3;
    
    // Historical patterns (2% of total score)
    const historical_pattern_score = Math.min(100,
      (factors.incident_frequency * 10) +
      (factors.downtime_history * 15) +
      (factors.security_events_count * 8)
    );
    
    return {
      cia_weighted_score,
      asset_dependency_impact,
      risk_correlation_impact,
      business_impact_score,
      technical_requirements_score,
      historical_pattern_score
    };
  }

  /**
   * Legacy weighted scoring method
   */
  private calculateWeightedScores(factors: ServiceCriticalityFactors) {
    // Use enhanced version
    return this.calculateEnhancedWeightedScores(factors);
    // Weighted CIA scoring (40% of total score)
    const cia_weights = { confidentiality: 0.3, integrity: 0.4, availability: 0.3 };
    const cia_weighted_score = (
      factors.confidentiality_impact * cia_weights.confidentiality +
      factors.integrity_impact * cia_weights.integrity +
      factors.availability_impact * cia_weights.availability
    ) * 20; // Scale to 0-100
    
    // Asset dependency impact (25% of total score)
    const asset_dependency_impact = Math.min(100, 
      (factors.dependent_assets_count * 5) + 
      (factors.critical_assets_count * 15) + 
      (factors.asset_dependency_score * 10)
    );
    
    // Risk correlation impact (20% of total score)
    const risk_correlation_impact = Math.min(100,
      (factors.associated_risks_count * 3) +
      (factors.high_severity_risks_count * 12) +
      (factors.risk_aggregation_score * 8)
    );
    
    // Business impact (10% of total score)
    const business_impact_score = (
      factors.business_function_criticality * 0.4 +
      factors.user_impact_scope * 0.3 +
      factors.revenue_impact * 0.3
    ) * 20;
    
    // Technical requirements (3% of total score)
    const rto_score = Math.max(0, 100 - (factors.recovery_time_objective * 2));
    const rpo_score = Math.max(0, 100 - (factors.recovery_point_objective * 4));
    const sla_score = factors.service_uptime_requirement;
    const technical_requirements_score = (rto_score + rpo_score + sla_score) / 3;
    
    // Historical patterns (2% of total score)
    const historical_pattern_score = Math.min(100,
      (factors.incident_frequency * 10) +
      (factors.downtime_history * 15) +
      (factors.security_events_count * 8)
    );
    
    return {
      cia_weighted_score,
      asset_dependency_impact,
      risk_correlation_impact,
      business_impact_score,
      technical_requirements_score,
      historical_pattern_score
    };
  }

  /**
   * Apply machine learning model for prediction refinement
   */
  private async applyMLPrediction(factors: ServiceCriticalityFactors): Promise<{prediction: number, confidence: number}> {
    try {
      // Load trained ML model (in production, this would load from model store)
      const model = await this.getLatestMLModel();
      
      // Feature vector preparation
      const featureVector = [
        factors.confidentiality_impact,
        factors.integrity_impact,
        factors.availability_impact,
        factors.dependent_assets_count,
        factors.critical_assets_count,
        factors.associated_risks_count,
        factors.high_severity_risks_count,
        factors.business_function_criticality,
        factors.recovery_time_objective,
        factors.incident_frequency
      ];
      
      // Simulate ML prediction (in production, integrate with your ML framework)
      const prediction = await this.simulateMLPrediction(featureVector, model);
      
      return {
        prediction: prediction.score,
        confidence: prediction.confidence
      };
    } catch (error) {
      console.error('ML prediction failed, using fallback:', error);
      // Fallback to rule-based prediction
      return {
        prediction: this.fallbackPrediction(factors),
        confidence: 0.6 // Lower confidence for fallback
      };
    }
  }

  /**
   * Enhanced score combination with risk cascading impact
   */
  private combineScoresWithRiskCascading(algorithmicScores: any, mlPrediction: {prediction: number, confidence: number}, riskAssociations: any[]) {
    const weights = {
      cia: 0.35,      // Reduced from 0.40
      assets: 0.20,   // Reduced from 0.25
      risks: 0.30,    // Increased from 0.20 for risk-centric approach
      business: 0.10,
      technical: 0.03,
      historical: 0.02
    };
    
    // Calculate weighted algorithmic score
    const algorithmic_score = 
      algorithmicScores.cia_weighted_score * weights.cia +
      algorithmicScores.asset_dependency_impact * weights.assets +
      algorithmicScores.risk_correlation_impact * weights.risks +
      algorithmicScores.business_impact_score * weights.business +
      algorithmicScores.technical_requirements_score * weights.technical +
      algorithmicScores.historical_pattern_score * weights.historical;
    
    // Apply risk cascading boost for services with high-confidence risks
    const highConfidenceRisks = riskAssociations.filter(r => r.confidence_score > 0.8);
    const cascadingBoost = Math.min(15, highConfidenceRisks.length * 3);
    
    // Blend with ML prediction based on confidence
    const ml_weight = mlPrediction.confidence;
    const algorithmic_weight = 1 - ml_weight;
    
    const base_score = 
      (algorithmic_score * algorithmic_weight) + 
      (mlPrediction.prediction * ml_weight);
    
    const overall_score = Math.min(100, base_score + cascadingBoost);
    
    return {
      algorithmic_score: Math.round(algorithmic_score),
      ml_prediction_score: Math.round(mlPrediction.prediction),
      risk_cascading_boost: cascadingBoost,
      overall_score: Math.round(overall_score),
      confidence: mlPrediction.confidence
    };
  }

  /**
   * Legacy score combination method
   */
  private combineScores(algorithmicScores: any, mlPrediction: {prediction: number, confidence: number}) {
    // Use enhanced version with empty risk associations for compatibility
    return this.combineScoresWithRiskCascading(algorithmicScores, mlPrediction, []);
    const weights = {
      cia: 0.40,
      assets: 0.25,
      risks: 0.20,
      business: 0.10,
      technical: 0.03,
      historical: 0.02
    };
    
    // Calculate weighted algorithmic score
    const algorithmic_score = 
      algorithmicScores.cia_weighted_score * weights.cia +
      algorithmicScores.asset_dependency_impact * weights.assets +
      algorithmicScores.risk_correlation_impact * weights.risks +
      algorithmicScores.business_impact_score * weights.business +
      algorithmicScores.technical_requirements_score * weights.technical +
      algorithmicScores.historical_pattern_score * weights.historical;
    
    // Blend with ML prediction based on confidence
    const ml_weight = mlPrediction.confidence;
    const algorithmic_weight = 1 - ml_weight;
    
    const overall_score = 
      (algorithmic_score * algorithmic_weight) + 
      (mlPrediction.prediction * ml_weight);
    
    return {
      algorithmic_score: Math.round(algorithmic_score),
      ml_prediction_score: Math.round(mlPrediction.prediction),
      overall_score: Math.round(overall_score),
      confidence: mlPrediction.confidence
    };
  }

  /**
   * Convert numeric score to criticality level
   */
  private scoreToCriticality(score: number): 'Critical' | 'High' | 'Medium' | 'Low' {
    if (score >= 85) return 'Critical';
    if (score >= 65) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  }

  /**
   * Generate risk-aware recommendations for Dynamic GRC
   */
  private generateRiskAwareRecommendations(factors: ServiceCriticalityFactors, finalScore: any, riskAssociations: any[]): string[] {
    const recommendations: string[] = [];
    
    // Risk cascading specific recommendations
    const pendingRisks = riskAssociations.filter(r => r.approval_status === 'pending');
    if (pendingRisks.length > 0) {
      recommendations.push(`Urgent: ${pendingRisks.length} risks pending approval - prioritize risk workflow completion`);
    }
    
    const highConfidenceRisks = riskAssociations.filter(r => r.confidence_score > 0.8 && r.status === 'active');
    if (highConfidenceRisks.length > 2) {
      recommendations.push('Multiple high-confidence active risks detected - implement comprehensive risk mitigation plan');
    }
    
    // CIA-based recommendations with risk context
    if (factors.availability_impact >= 4) {
      const availabilityRisks = riskAssociations.filter(r => 
        r.title.toLowerCase().includes('availability') || 
        r.title.toLowerCase().includes('outage') || 
        r.title.toLowerCase().includes('ddos')
      );
      if (availabilityRisks.length > 0) {
        recommendations.push('Critical availability requirements with active availability risks - implement immediate failover mechanisms');
      } else {
        recommendations.push('Implement high-availability clustering and failover mechanisms');
      }
    }
    
    if (factors.integrity_impact >= 4) {
      const integrityRisks = riskAssociations.filter(r => 
        r.title.toLowerCase().includes('integrity') || 
        r.title.toLowerCase().includes('corruption') || 
        r.title.toLowerCase().includes('tampering')
      );
      if (integrityRisks.length > 0) {
        recommendations.push('High integrity requirements with active integrity risks - deploy enhanced data validation and monitoring');
      } else {
        recommendations.push('Deploy real-time data integrity monitoring and validation');
      }
    }
    
    if (factors.confidentiality_impact >= 4) {
      const securityRisks = riskAssociations.filter(r => 
        r.category === 'Security' || 
        r.title.toLowerCase().includes('breach') || 
        r.title.toLowerCase().includes('exposure')
      );
      if (securityRisks.length > 0) {
        recommendations.push('Critical confidentiality requirements with active security risks - implement zero-trust architecture immediately');
      } else {
        recommendations.push('Apply end-to-end encryption and zero-trust access controls');
      }
    }
    
    // Service dependency recommendations with risk cascading
    if (factors.dependent_assets_count > 5) {
      recommendations.push('High service interdependency detected - monitor risk cascading effects and implement circuit breakers');
    }
    
    // Risk aggregation recommendations
    if (factors.risk_aggregation_score > 20) {
      recommendations.push('Service shows high aggregate risk exposure - establish dedicated risk monitoring dashboard');
      recommendations.push('Consider risk transfer mechanisms (insurance, outsourcing) for high-impact risks');
    }
    
    return recommendations.slice(0, 8); // Increase limit for risk-aware recommendations
  }

  /**
   * Legacy recommendations method
   */
  private generateRecommendations(factors: ServiceCriticalityFactors, finalScore: any): string[] {
    // Use enhanced version with empty risk associations for compatibility
    return this.generateRiskAwareRecommendations(factors, finalScore, []);
    const recommendations: string[] = [];
    
    // CIA-based recommendations
    if (factors.availability_impact >= 4) {
      recommendations.push("Implement high-availability clustering and failover mechanisms");
      recommendations.push("Establish aggressive RTO targets (< 1 hour) with automated recovery");
    }
    
    if (factors.integrity_impact >= 4) {
      recommendations.push("Deploy real-time data integrity monitoring and validation");
      recommendations.push("Implement immutable audit trails and data verification checksums");
    }
    
    if (factors.confidentiality_impact >= 4) {
      recommendations.push("Apply end-to-end encryption and zero-trust access controls");
      recommendations.push("Conduct regular security assessments and penetration testing");
    }
    
    // Asset dependency recommendations
    if (factors.dependent_assets_count > 10) {
      recommendations.push("Reduce service complexity by decoupling non-critical dependencies");
      recommendations.push("Implement circuit breaker patterns for external dependencies");
    }
    
    // Risk-based recommendations
    if (factors.high_severity_risks_count > 2) {
      recommendations.push("Prioritize mitigation of high-severity associated risks");
      recommendations.push("Establish dedicated risk monitoring dashboard for this service");
    }
    
    // Historical pattern recommendations
    if (factors.incident_frequency > 3) {
      recommendations.push("Investigate root causes of recurring incidents and implement preventive controls");
      recommendations.push("Enhance monitoring and alerting to detect issues proactively");
    }
    
    return recommendations.slice(0, 6); // Limit to top 6 recommendations
  }

  /**
   * Enhanced trigger conditions for Dynamic GRC
   */
  private getEnhancedTriggerConditions(factors: ServiceCriticalityFactors, riskAssociations: any[]): string[] {
    const conditions = [
      'New high-severity risk associated with service',
      'Risk approval status changes (pending → approved/rejected)',
      'Service dependency added or removed',
      'Risk cascading threshold exceeded from dependent services',
      'Aggregate risk score increases by >20%',
      'Security incident involving service components',
      'Significant change in business function importance',
      'CIA triad scores updated',
      'Service criticality level changed',
      'Risk confidence score drops below threshold',
      'Multiple risks reach active status simultaneously'
    ];
    
    // Add dynamic conditions based on current risk profile
    if (riskAssociations.some(r => r.approval_status === 'pending')) {
      conditions.push('Pending risk approvals require immediate attention');
    }
    
    if (factors.risk_aggregation_score > 15) {
      conditions.push('High aggregate risk score requires frequent monitoring');
    }
    
    return conditions;
  }

  /**
   * Legacy trigger conditions method
   */
  private getTriggerConditions(factors: ServiceCriticalityFactors): string[] {
    // Use enhanced version with empty risk associations for compatibility
    return this.getEnhancedTriggerConditions(factors, []);
    return [
      "New high-severity risk associated with service",
      "Critical asset dependency added or removed",
      "Security incident involving service components",
      "Significant change in business function importance",
      "SLA requirements updated",
      "Major architectural changes to service",
      "Regulatory compliance requirements change"
    ];
  }

  /**
   * Calculate next assessment date based on criticality and volatility
   */
  private calculateNextAssessment(factors: ServiceCriticalityFactors): Date {
    const now = new Date();
    let daysUntilNext = 90; // Default quarterly assessment
    
    // More frequent assessments for high-risk services
    if (factors.high_severity_risks_count > 2) daysUntilNext = 30;
    if (factors.incident_frequency > 5) daysUntilNext = 14;
    if (factors.confidentiality_impact >= 4 || factors.integrity_impact >= 4) daysUntilNext = 60;
    
    now.setDate(now.getDate() + daysUntilNext);
    return now;
  }

  // Enhanced helper methods for Phase 1 Dynamic GRC schema
  private async getServiceDataById(serviceId: number) {
    const result = await this.db.prepare(
      "SELECT * FROM services WHERE id = ?"
    ).bind(serviceId).first();
    return result;
  }

  private async getServiceData(serviceId: string) {
    // Legacy method for backward compatibility
    const numericId = parseInt(serviceId);
    if (isNaN(numericId)) return {};
    return await this.getServiceDataById(numericId) || {};
  }

  private async getServiceRiskAssociations(serviceId: number) {
    // Query service-risk relationships from new schema
    const associations = await this.db.prepare(`
      SELECT r.*, sr.weight, 'direct' as relationship_type
      FROM service_risks sr
      JOIN risks r ON sr.risk_id = r.id
      WHERE sr.service_id = ?
    `).bind(serviceId).all();
    
    return associations.results || [];
  }

  private async getServiceDependencyData(serviceId: number) {
    // Query service dependencies from new schema
    const dependencies = await this.db.prepare(`
      SELECT s.*, sd.dependency_type, sd.criticality as dep_criticality
      FROM service_dependencies sd
      JOIN services s ON sd.depends_on_service_id = s.id
      WHERE sd.service_id = ?
    `).bind(serviceId).all();
    
    return dependencies.results || [];
  }

  private async getAssetDependencies(serviceId: string) {
    // Legacy method - redirect to service dependencies
    const numericId = parseInt(serviceId);
    if (isNaN(numericId)) return [];
    return await this.getServiceDependencyData(numericId);
  }

  private async getRiskAssociations(serviceId: string) {
    // Legacy method - redirect to new service risk associations
    const numericId = parseInt(serviceId);
    if (isNaN(numericId)) return [];
    return await this.getServiceRiskAssociations(numericId);
  }

  private async getServiceHistoricalData(serviceId: number) {
    // Enhanced historical data analysis for Phase 1
    // For now, use service risk trend as historical indicator
    const service = await this.getServiceDataById(serviceId);
    
    // Calculate incident simulation based on risk trend and current score
    const baseIncidents = service?.risk_trend === 'increasing' ? 3 : 
                         service?.risk_trend === 'decreasing' ? 1 : 2;
    const riskMultiplier = (service?.aggregate_risk_score || 0) / 10;
    
    return {
      incident_count: Math.floor(baseIncidents + riskMultiplier),
      high_severity_ratio: service?.aggregate_risk_score > 15 ? 0.6 : 0.2,
      security_events: service?.aggregate_risk_score > 20 ? 5 : 1
    };
  }

  private async getHistoricalServiceData(serviceId: string) {
    // Legacy method - redirect to enhanced version
    const numericId = parseInt(serviceId);
    if (isNaN(numericId)) return { incident_count: 0, high_severity_ratio: 0 };
    return await this.getServiceHistoricalData(numericId);
  }

  private async extractEnhancedCriticalityFactors(serviceData: any, risks: any[], dependencies: any[], historical: any): Promise<ServiceCriticalityFactors> {
    return {
      // Enhanced CIA scores from services table
      confidentiality_impact: serviceData.confidentiality_score || 3,
      integrity_impact: serviceData.integrity_score || 3,
      availability_impact: serviceData.availability_score || 3,
      
      // Enhanced dependency analysis
      dependent_assets_count: dependencies.length,
      critical_assets_count: dependencies.filter(d => d.dep_criticality === 'high').length,
      asset_dependency_score: serviceData.cia_score || 3,
      
      // Enhanced risk associations with cascading
      associated_risks_count: risks.length,
      high_severity_risks_count: risks.filter(r => r.risk_score >= 15).length,
      risk_aggregation_score: serviceData.aggregate_risk_score || 0,
      
      // Business impact from criticality level
      business_function_criticality: this.mapCriticalityLevelToScore(serviceData.criticality_level),
      user_impact_scope: this.estimateUserImpactFromCriticality(serviceData.criticality_level),
      revenue_impact: this.estimateRevenueImpactFromCriticality(serviceData.criticality_level),
      
      // Technical factors (estimated from criticality)
      recovery_time_objective: this.getRTOFromCriticality(serviceData.criticality_level),
      recovery_point_objective: this.getRPOFromCriticality(serviceData.criticality_level),
      service_uptime_requirement: this.getSLAFromCriticality(serviceData.criticality_level),
      
      // Enhanced historical data
      incident_frequency: historical.incident_count || 0,
      downtime_history: historical.high_severity_ratio * 100 || 0,
      security_events_count: historical.security_events || 0
    };
  }

  private async extractCriticalityFactors(serviceData: any, dependencies: any[], risks: any[], historical: any): Promise<ServiceCriticalityFactors> {
    // Legacy method - use enhanced version
    return await this.extractEnhancedCriticalityFactors(serviceData, risks, dependencies, historical);
    return {
      confidentiality_impact: serviceData.confidentiality_numeric || 2,
      integrity_impact: serviceData.integrity_numeric || 2,
      availability_impact: serviceData.availability_numeric || 2,
      dependent_assets_count: dependencies.length,
      critical_assets_count: dependencies.filter(d => d.criticality === 'Critical').length,
      asset_dependency_score: dependencies.reduce((sum, d) => sum + (d.confidentiality_numeric || 0), 0) / Math.max(1, dependencies.length),
      associated_risks_count: risks.length,
      high_severity_risks_count: risks.filter(r => r.severity === 'High' || r.severity === 'Critical').length,
      risk_aggregation_score: risks.reduce((sum, r) => sum + (r.risk_score || 0), 0),
      business_function_criticality: this.mapBusinessFunctionCriticality(serviceData.business_function),
      user_impact_scope: this.estimateUserImpactScope(serviceData),
      revenue_impact: this.estimateRevenueImpact(serviceData),
      recovery_time_objective: serviceData.rto_hours || 24,
      recovery_point_objective: serviceData.rpo_hours || 24,
      service_uptime_requirement: serviceData.sla_percentage || 99.0,
      incident_frequency: historical.incident_count || 0,
      downtime_history: historical.high_severity_ratio * 100 || 0,
      security_events_count: historical.security_events || 0
    };
  }

  private mapBusinessFunctionCriticality(businessFunction: string): number {
    const criticalityMap: Record<string, number> = {
      'Revenue Generation': 5,
      'Customer Service': 5,
      'Core Operations': 5,
      'Financial Management': 4,
      'Compliance & Legal': 4,
      'Human Resources': 3,
      'Marketing': 3,
      'IT Support': 2,
      'Training': 1,
      'Archive': 1
    };
    return criticalityMap[businessFunction] || 3;
  }

  private mapCriticalityLevelToScore(criticalityLevel: string): number {
    const levelMap: Record<string, number> = {
      'critical': 5,
      'high': 4,
      'medium': 3,
      'low': 2
    };
    return levelMap[criticalityLevel] || 3;
  }

  private estimateUserImpactFromCriticality(criticalityLevel: string): number {
    const impactMap: Record<string, number> = {
      'critical': 5,
      'high': 4,
      'medium': 3,
      'low': 2
    };
    return impactMap[criticalityLevel] || 3;
  }

  private estimateRevenueImpactFromCriticality(criticalityLevel: string): number {
    const revenueMap: Record<string, number> = {
      'critical': 5,
      'high': 4,
      'medium': 2,
      'low': 1
    };
    return revenueMap[criticalityLevel] || 2;
  }

  private getRTOFromCriticality(criticalityLevel: string): number {
    const rtoMap: Record<string, number> = {
      'critical': 1,   // 1 hour
      'high': 4,       // 4 hours
      'medium': 24,    // 24 hours
      'low': 72        // 72 hours
    };
    return rtoMap[criticalityLevel] || 24;
  }

  private getRPOFromCriticality(criticalityLevel: string): number {
    const rpoMap: Record<string, number> = {
      'critical': 0.5,  // 30 minutes
      'high': 2,        // 2 hours
      'medium': 12,     // 12 hours
      'low': 24         // 24 hours
    };
    return rpoMap[criticalityLevel] || 12;
  }

  private getSLAFromCriticality(criticalityLevel: string): number {
    const slaMap: Record<string, number> = {
      'critical': 99.99,
      'high': 99.9,
      'medium': 99.5,
      'low': 99.0
    };
    return slaMap[criticalityLevel] || 99.0;
  }

  private estimateUserImpactScope(serviceData: any): number {
    // Estimate based on service category and description
    if (serviceData.subcategory?.includes('Public') || serviceData.name?.includes('Customer')) return 5;
    if (serviceData.subcategory?.includes('Internal')) return 3;
    return 2;
  }

  private estimateRevenueImpact(serviceData: any): number {
    // Estimate based on business function and service type
    if (serviceData.business_function?.includes('Revenue') || serviceData.name?.includes('Payment')) return 5;
    if (serviceData.business_function?.includes('Customer')) return 4;
    return 2;
  }

  // ML Model simulation methods
  private async getLatestMLModel(): Promise<MLCriticalityModel> {
    // In production, this would load from your model store
    return {
      model_id: 'service-criticality-v1.2',
      algorithm_type: 'random_forest',
      training_features: ['cia_scores', 'asset_deps', 'risk_associations', 'business_impact', 'historical_patterns'],
      accuracy_score: 0.89,
      precision_score: 0.87,
      recall_score: 0.91,
      f1_score: 0.89,
      feature_importance: {
        'availability_impact': 0.28,
        'asset_dependencies': 0.22,
        'integrity_impact': 0.18,
        'risk_associations': 0.15,
        'business_function': 0.12,
        'confidentiality_impact': 0.05
      },
      model_version: '1.2.0',
      last_trained: new Date().toISOString(),
      training_data_size: 1247
    };
  }

  private async simulateMLPrediction(features: number[], model: MLCriticalityModel): Promise<{score: number, confidence: number}> {
    // Simulate ML model prediction using weighted features
    const importance = Object.values(model.feature_importance);
    let score = 0;
    
    for (let i = 0; i < Math.min(features.length, importance.length); i++) {
      score += (features[i] * importance[i] * 20); // Scale to 0-100
    }
    
    // Add some realistic noise and bounds
    score = Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 10));
    
    // Confidence based on model accuracy and feature completeness
    const confidence = model.accuracy_score * (features.filter(f => f > 0).length / features.length);
    
    return { score, confidence };
  }

  private fallbackPrediction(factors: ServiceCriticalityFactors): number {
    // Simple rule-based fallback
    const ciaAvg = (factors.confidentiality_impact + factors.integrity_impact + factors.availability_impact) / 3;
    const assetImpact = Math.min(5, factors.critical_assets_count + (factors.dependent_assets_count / 5));
    const riskImpact = Math.min(5, factors.high_severity_risks_count + (factors.associated_risks_count / 3));
    
    return ((ciaAvg + assetImpact + riskImpact) / 3) * 20; // Scale to 0-100
  }

  /**
   * Batch process all services for criticality assessment
   */
  async batchAssessAllServices(): Promise<CriticalityAssessment[]> {
    const services = await this.db.prepare(
      "SELECT asset_id FROM assets_enhanced WHERE category = 'service' AND active_status = TRUE"
    ).all();
    
    const assessments: CriticalityAssessment[] = [];
    
    for (const service of (services.results || [])) {
      try {
        const assessment = await this.calculateServiceCriticality(service.asset_id);
        assessments.push(assessment);
        
        // Store assessment in database
        await this.storeAssessment(assessment);
      } catch (error) {
        console.error(`Failed to assess service ${service.asset_id}:`, error);
      }
    }
    
    return assessments;
  }

  /**
   * Store assessment results in database
   */
  private async storeAssessment(assessment: CriticalityAssessment) {
    await this.db.prepare(`
      INSERT OR REPLACE INTO service_criticality_assessments (
        service_id, service_name, calculated_criticality, criticality_score,
        confidence_level, contributing_factors, recommendations,
        reassessment_triggers, last_assessment, next_assessment_due,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      assessment.service_id,
      assessment.service_name,
      assessment.calculated_criticality,
      assessment.criticality_score,
      assessment.confidence_level,
      JSON.stringify(assessment.contributing_factors),
      JSON.stringify(assessment.recommendations),
      JSON.stringify(assessment.reassessment_trigger_conditions),
      assessment.last_assessment,
      assessment.next_assessment_due
    ).run();
  }

  /**
   * Get real-time criticality recommendations
   */
  async getRealtimeCriticalityInsights(serviceId: string): Promise<{
    current_assessment: CriticalityAssessment | null;
    trending_factors: string[];
    immediate_actions: string[];
    risk_alerts: string[];
  }> {
    const assessment = await this.calculateServiceCriticality(serviceId);
    
    return {
      current_assessment: assessment,
      trending_factors: this.identifyTrendingFactors(assessment),
      immediate_actions: this.getImmediateActions(assessment),
      risk_alerts: this.generateRiskAlerts(assessment)
    };
  }

  private identifyTrendingFactors(assessment: CriticalityAssessment): string[] {
    const factors: string[] = [];
    
    if (assessment.contributing_factors.risk_correlation_impact > 70) {
      factors.push('High risk correlation detected');
    }
    if (assessment.contributing_factors.asset_dependency_impact > 80) {
      factors.push('Critical asset dependencies identified');
    }
    if (assessment.contributing_factors.cia_weighted_score > 75) {
      factors.push('High CIA triad impact');
    }
    
    return factors;
  }

  private getImmediateActions(assessment: CriticalityAssessment): string[] {
    const actions: string[] = [];
    
    if (assessment.criticality_score >= 85) {
      actions.push('Schedule immediate architecture review');
      actions.push('Verify disaster recovery procedures');
      actions.push('Establish 24/7 monitoring');
    } else if (assessment.criticality_score >= 65) {
      actions.push('Review backup and recovery processes');
      actions.push('Update incident response procedures');
    }
    
    return actions;
  }

  private generateRiskAlerts(assessment: CriticalityAssessment): string[] {
    const alerts: string[] = [];
    
    if (assessment.confidence_level < 0.7) {
      alerts.push('Low confidence in assessment - additional data needed');
    }
    if (assessment.criticality_score > 80 && assessment.contributing_factors.historical_pattern_score > 50) {
      alerts.push('Critical service with concerning incident history');
    }
    
    return alerts;
  }
}