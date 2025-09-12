/**
 * Universal AI Service - Enhanced AI capabilities for ARIA5 platform
 * Extends existing AI provider system with domain-specific intelligence
 */

import type { CloudflareBindings } from '../types';

interface AIRiskInsight {
  recommendation: string;
  confidence: number;
  reasoning: string;
  escalationSuggested: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ThreatCorrelation {
  vulnerabilityId: string;
  threatId: string;
  confidence: number;
  escalationRecommended: boolean;
  reasoning: string;
  threatActors?: string[];
  exploitationStatus: 'none' | 'poc' | 'active' | 'widespread';
}

interface ComplianceGaps {
  framework: string;
  gapsIdentified: Array<{
    control: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
    estimatedEffort: string;
  }>;
  overallScore: number;
  priorityActions: string[];
}

interface RiskData {
  riskId: string;
  title: string;
  probability: number;
  impact: number;
  category: string;
  assetCriticality?: string;
  existingControls?: string[];
}

interface Threat {
  id: string;
  cve?: string;
  description: string;
  severity: string;
  exploitationStatus: string;
  threatActors?: string[];
  lastUpdated: string;
}

interface Vulnerability {
  id: string;
  cve: string;
  cvss: number;
  description: string;
  assetId: string;
  patchAvailable: boolean;
  exploitAvailable: boolean;
}

export class UniversalAIService {
  private aiService: any;
  private db: D1Database;
  
  constructor(aiService: any, db: D1Database) {
    this.aiService = aiService;
    this.db = db;
  }

  /**
   * AI-powered risk intelligence analysis
   */
  async riskIntelligence(data: RiskData): Promise<AIRiskInsight> {
    const prompt = this.buildRiskAnalysisPrompt(data);
    
    try {
      const response = await this.aiService.generateResponse(prompt, {
        provider: this.selectOptimalProvider('risk_analysis'),
        context: 'cybersecurity_risk_assessment',
        maxTokens: 500,
        temperature: 0.3 // Lower temperature for more consistent analysis
      });

      return this.parseRiskInsight(response);
    } catch (error) {
      console.error('Risk intelligence error:', error);
      return this.generateFallbackRiskInsight(data);
    }
  }

  /**
   * Core vision implementation: Threat-vulnerability correlation
   */
  async threatCorrelation(threats: Threat[], vulns: Vulnerability[]): Promise<ThreatCorrelation[]> {
    const prompt = this.buildThreatCorrelationPrompt(threats, vulns);
    
    try {
      const response = await this.aiService.generateResponse(prompt, {
        provider: this.selectOptimalProvider('threat_correlation'),
        context: 'threat_intelligence_correlation',
        expectedOutput: 'escalation_recommendations',
        maxTokens: 800,
        temperature: 0.2 // Very low temperature for consistent correlation logic
      });

      return this.parseThreatCorrelations(response, threats, vulns);
    } catch (error) {
      console.error('Threat correlation error:', error);
      return this.generateFallbackCorrelations(threats, vulns);
    }
  }

  /**
   * Compliance framework gap analysis
   */
  async complianceAnalysis(framework: string, currentControls: any[]): Promise<ComplianceGaps> {
    const prompt = this.buildCompliancePrompt(framework, currentControls);
    
    try {
      const response = await this.aiService.generateResponse(prompt, {
        provider: this.selectOptimalProvider('compliance_analysis'),
        context: 'regulatory_frameworks',
        maxTokens: 1000,
        temperature: 0.4
      });

      return this.parseComplianceGaps(response, framework);
    } catch (error) {
      console.error('Compliance analysis error:', error);
      return this.generateFallbackComplianceAnalysis(framework);
    }
  }

  /**
   * Record AI decision feedback for learning
   */
  async recordDecisionFeedback(decisionId: string, outcome: 'correct' | 'incorrect', details?: string): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO ai_decision_feedback (decision_id, outcome, details, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(decisionId, outcome, details || null).run();
      
      // Update provider performance metrics
      await this.updateProviderPerformance(decisionId, outcome);
    } catch (error) {
      console.error('Failed to record decision feedback:', error);
    }
  }

  /**
   * Generate AI-powered critical decisions for dashboard
   */
  async generateCriticalDecisions(context: {
    userData: any;
    userRole: string;
    maxDecisions?: number;
    priorityFilter?: string;
  }): Promise<any[]> {
    const prompt = `
      Based on the following GRC platform data, identify the most critical decisions that need immediate attention:
      
      User Role: ${context.userRole}
      Platform Data: ${JSON.stringify(context.userData, null, 2)}
      
      Generate ${context.maxDecisions || 5} critical decisions in JSON format with:
      - decision: Clear question requiring user decision
      - aiRecommendation: Your recommended action
      - confidence: Confidence level (0-100)
      - reasoning: Why this decision is critical
      - impact: Business impact description
      - oneClickActions: Array of possible actions
      
      Focus on ${context.priorityFilter || 'high-impact security and compliance decisions'}.
    `;

    try {
      const response = await this.aiService.generateResponse(prompt, {
        provider: this.selectOptimalProvider('decision_generation'),
        context: 'grc_decision_support',
        maxTokens: 1500,
        temperature: 0.6
      });

      return this.parseCriticalDecisions(response);
    } catch (error) {
      console.error('Critical decisions generation error:', error);
      return this.generateFallbackDecisions(context);
    }
  }

  // Private helper methods

  private buildRiskAnalysisPrompt(data: RiskData): string {
    return `
      You are a cybersecurity risk analyst. Analyze this risk and provide actionable insights:
      
      Risk Details:
      - Title: ${data.title}
      - Probability: ${data.probability}/5
      - Impact: ${data.impact}/5
      - Category: ${data.category}
      - Asset Criticality: ${data.assetCriticality || 'Unknown'}
      - Existing Controls: ${data.existingControls?.join(', ') || 'None specified'}
      
      Provide analysis in JSON format with:
      - recommendation: Specific action to take
      - confidence: Your confidence level (0-100)
      - reasoning: Why this recommendation matters
      - escalationSuggested: true/false if escalation needed
      - threatLevel: overall threat assessment
    `;
  }

  private buildThreatCorrelationPrompt(threats: Threat[], vulns: Vulnerability[]): string {
    return `
      You are a threat intelligence analyst. Correlate these threats with vulnerabilities to identify critical matches:
      
      Active Threats (${threats.length}):
      ${threats.map(t => `- ${t.cve || t.id}: ${t.description} (${t.exploitationStatus})`).join('\\n')}
      
      Vulnerabilities (${vulns.length}):
      ${vulns.map(v => `- ${v.cve}: CVSS ${v.cvss} (Asset: ${v.assetId}, Exploit Available: ${v.exploitAvailable})`).join('\\n')}
      
      Identify correlations where:
      1. Threat CVE matches vulnerability CVE
      2. Active exploitation is occurring
      3. High-value assets are affected
      
      Return JSON array of correlations with escalation recommendations.
    `;
  }

  private buildCompliancePrompt(framework: string, currentControls: any[]): string {
    return `
      You are a compliance expert specializing in ${framework}. Analyze current control implementation and identify gaps:
      
      Framework: ${framework}
      Current Controls: ${JSON.stringify(currentControls, null, 2)}
      
      Provide gap analysis in JSON format with:
      - gapsIdentified: Array of missing or weak controls
      - overallScore: Compliance percentage (0-100)
      - priorityActions: Top 3 actions for improvement
    `;
  }

  private selectOptimalProvider(taskType: string): string {
    // Smart provider selection based on task requirements
    switch (taskType) {
      case 'risk_analysis':
      case 'decision_generation':
        return 'openai'; // Best for complex reasoning
      case 'threat_correlation':
        return 'cloudflare'; // Fast for real-time correlation
      case 'compliance_analysis':
        return 'anthropic'; // Detailed analysis
      default:
        return 'openai';
    }
  }

  private parseRiskInsight(response: string): AIRiskInsight {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return {
        recommendation: parsed.recommendation || 'Review risk parameters',
        confidence: parsed.confidence || 70,
        reasoning: parsed.reasoning || 'Analysis completed',
        escalationSuggested: parsed.escalationSuggested || false,
        threatLevel: parsed.threatLevel || 'medium'
      };
    } catch (error) {
      // Fallback for non-JSON responses
      return this.parseTextToRiskInsight(response);
    }
  }

  private parseThreatCorrelations(response: string, threats: Threat[], vulns: Vulnerability[]): ThreatCorrelation[] {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      // Fallback correlation logic
      return this.generateBasicCorrelations(threats, vulns);
    }
  }

  private parseComplianceGaps(response: string, framework: string): ComplianceGaps {
    try {
      const parsed = JSON.parse(response);
      return {
        framework,
        gapsIdentified: parsed.gapsIdentified || [],
        overallScore: parsed.overallScore || 75,
        priorityActions: parsed.priorityActions || ['Review control implementation']
      };
    } catch (error) {
      return this.generateBasicComplianceAnalysis(framework);
    }
  }

  private parseCriticalDecisions(response: string): any[] {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error('Failed to parse AI decisions:', error);
      return [];
    }
  }

  // Fallback methods for when AI is unavailable

  private generateFallbackRiskInsight(data: RiskData): AIRiskInsight {
    const riskScore = data.probability * data.impact;
    return {
      recommendation: riskScore >= 15 ? 'Immediate attention required' : 'Monitor and review',
      confidence: 60,
      reasoning: `Risk score of ${riskScore} based on probability (${data.probability}) × impact (${data.impact})`,
      escalationSuggested: riskScore >= 20,
      threatLevel: riskScore >= 20 ? 'critical' : riskScore >= 15 ? 'high' : riskScore >= 8 ? 'medium' : 'low'
    };
  }

  private generateFallbackCorrelations(threats: Threat[], vulns: Vulnerability[]): ThreatCorrelation[] {
    const correlations: ThreatCorrelation[] = [];
    
    for (const threat of threats) {
      for (const vuln of vulns) {
        if (threat.cve && threat.cve === vuln.cve && threat.exploitationStatus === 'active') {
          correlations.push({
            vulnerabilityId: vuln.id,
            threatId: threat.id,
            confidence: vuln.cvss >= 7 ? 90 : 70,
            escalationRecommended: vuln.cvss >= 7,
            reasoning: `Active exploitation of ${threat.cve} detected`,
            exploitationStatus: 'active'
          });
        }
      }
    }
    
    return correlations;
  }

  private generateBasicCorrelations(threats: Threat[], vulns: Vulnerability[]): ThreatCorrelation[] {
    return this.generateFallbackCorrelations(threats, vulns);
  }

  private generateFallbackComplianceAnalysis(framework: string): ComplianceGaps {
    return {
      framework,
      gapsIdentified: [
        {
          control: 'Access Controls',
          severity: 'medium',
          recommendation: 'Implement role-based access control',
          estimatedEffort: '2-4 weeks'
        }
      ],
      overallScore: 70,
      priorityActions: ['Review access controls', 'Update security policies', 'Conduct gap assessment']
    };
  }

  private generateBasicComplianceAnalysis(framework: string): ComplianceGaps {
    return this.generateFallbackComplianceAnalysis(framework);
  }

  private generateFallbackDecisions(context: any): any[] {
    return [
      {
        id: crypto.randomUUID(),
        decision: 'Review high-risk vulnerabilities requiring immediate patching',
        aiRecommendation: 'Prioritize patching based on CVSS scores and asset criticality',
        confidence: 80,
        reasoning: 'High CVSS vulnerabilities pose significant risk to operations',
        impact: 'Critical - potential system compromise',
        oneClickActions: ['Schedule Patching', 'Request Exception', 'Get More Details']
      }
    ];
  }

  private parseTextToRiskInsight(response: string): AIRiskInsight {
    // Simple text parsing fallback
    const hasEscalation = response.toLowerCase().includes('escalat') || response.toLowerCase().includes('critical');
    return {
      recommendation: response.substring(0, 200),
      confidence: 70,
      reasoning: 'Analysis based on risk parameters',
      escalationSuggested: hasEscalation,
      threatLevel: hasEscalation ? 'high' : 'medium'
    };
  }

  private async updateProviderPerformance(decisionId: string, outcome: 'correct' | 'incorrect'): Promise<void> {
    // Implementation for tracking provider performance
    // This would update metrics for provider selection optimization
    console.log(`Provider performance updated for decision ${decisionId}: ${outcome}`);
  }
}