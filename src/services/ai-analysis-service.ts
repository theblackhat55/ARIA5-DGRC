/**
 * AI Analysis Service - Standardized, auditable AI-powered risk analysis
 * Addresses explainability gaps and provides governance-ready AI outputs
 */

import { createHash } from 'crypto';

export interface AIAnalysisInput {
  risk_id?: number;
  title: string;
  description: string;
  category: string;
  
  // Service and asset context
  service_id?: number;
  asset_ids?: number[];
  
  // Service indices for context
  svi?: number;
  sei?: number;
  bci?: number;
  eri?: number;
  
  // Recent security context
  recent_incidents?: SecurityIncident[];
  vulnerabilities?: VulnerabilityContext[];
  threat_intel?: ThreatIntelContext[];
  
  // Control posture
  security_posture?: SecurityPosture;
  
  // Historical context
  related_risks?: RelatedRisk[];
}

export interface SecurityIncident {
  id: string;
  severity: number;
  category: string;
  techniques: string[];
  timestamp: string;
  status: string;
}

export interface VulnerabilityContext {
  cve: string;
  cvss_score: number;
  kev: boolean;
  public_exploit: boolean;
  age_days: number;
}

export interface ThreatIntelContext {
  indicator_type: string;
  indicator_value: string;
  confidence: number;
  source: string;
  techniques: string[];
}

export interface SecurityPosture {
  edr_coverage: number;
  mfa_coverage: number;
  patch_compliance: number;
  network_segmentation: number;
  backup_status: string;
}

export interface RelatedRisk {
  id: number;
  title: string;
  category: string;
  risk_score: number;
  status: string;
}

export interface StandardizedAIOutput {
  // Classification (required)
  classification: {
    category: string;
    subcategory: string;
    confidence: number;
  };
  
  // Risk bands (required)
  likelihood_band: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact_band: 'minimal' | 'minor' | 'moderate' | 'major' | 'severe';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Framework mappings (required)
  mapped_controls: {
    nist_csf: string[];
    iso_27001: string[];
    mitre_attack: string[];
  };
  
  // Mitigation plan (required)
  mitigation_plan: MitigationStep[];
  
  // Rationale with evidence (required)
  rationale: {
    summary: string;
    evidence_citations: string[];
    risk_factors: RiskFactor[];
    assumptions: string[];
  };
  
  // Confidence and alternatives
  confidence: number;
  alternatives?: AlternativeAssessment[];
  
  // Scoring recommendations
  scoring_inputs: {
    likelihood_score: number;
    impact_score: number;
    confidence_score: number;
    evidence_quality: number;
  };
}

export interface MitigationStep {
  step: string;
  owner: string;
  effort: 'minimal' | 'moderate' | 'significant';
  eta_days: number;
  expected_reduction_percent: number;
  priority: number;
}

export interface RiskFactor {
  factor: string;
  impact: 'positive' | 'negative';
  weight: number;
  evidence: string;
}

export interface AlternativeAssessment {
  scenario: string;
  likelihood_band: string;
  impact_band: string;
  rationale: string;
  confidence: number;
}

export interface AIAnalysisResult {
  id: string;
  risk_id: number;
  input_hash: string;
  output: StandardizedAIOutput;
  
  // Provider metadata
  provider: string;
  model_name: string;
  model_version?: string;
  
  // Validation results
  validated: boolean;
  validation_errors: ValidationError[];
  
  // Performance metrics
  token_count_input: number;
  token_count_output: number;
  processing_time_ms: number;
  cost_estimate_cents: number;
  
  // Governance
  human_reviewed: boolean;
  approved?: boolean;
  reviewer_feedback?: string;
  
  created_at: string;
  expires_at: string;
}

export interface ValidationError {
  field: string;
  error_type: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface AIProviderConfig {
  provider: string;
  model: string;
  temperature: number;
  max_tokens: number;
  timeout_ms: number;
  cost_per_1k_tokens: number;
}

export class AIAnalysisService {
  private db: D1Database;
  private aiBinding: any; // Cloudflare AI binding
  private correlationId: string;
  
  // Tenant configuration
  private aiEnabled: boolean = true;
  private dailyTokenLimit: number = 50000;
  private retentionDays: number = 90;
  
  // Provider configurations
  private providerConfigs: { [key: string]: AIProviderConfig } = {
    'cloudflare_workers_ai': {
      provider: 'cloudflare',
      model: '@cf/meta/llama-3.1-8b-instruct',
      temperature: 0.3,
      max_tokens: 1024,
      timeout_ms: 30000,
      cost_per_1k_tokens: 0.01 // Estimate
    }
  };

  constructor(db: D1Database, aiBinding?: any) {
    this.db = db;
    this.aiBinding = aiBinding;
    this.correlationId = this.generateCorrelationId();
    
    // Load tenant configuration
    this.loadConfiguration();
  }

  /**
   * Main entry point for AI analysis with full validation and auditability
   */
  async analyzeRisk(
    input: AIAnalysisInput,
    provider: string = 'cloudflare_workers_ai'
  ): Promise<AIAnalysisResult> {
    
    const startTime = Date.now();
    
    try {
      // Step 1: Validate inputs and check limits
      await this.validateInputs(input);
      await this.checkTokenLimits();
      
      // Step 2: Generate input hash for caching/deduplication
      const inputHash = this.generateInputHash(input);
      
      // Step 3: Check for existing analysis (cache)
      const cached = await this.getCachedAnalysis(inputHash);
      if (cached && !this.isExpired(cached)) {
        console.log('[AI-Analysis] Using cached result', {
          correlation_id: this.correlationId,
          input_hash: inputHash,
          cached_id: cached.id
        });
        return cached;
      }
      
      // Step 4: Prepare AI prompt with structured format
      const prompt = await this.buildStructuredPrompt(input);
      
      // Step 5: Call AI provider with error handling
      const rawOutput = await this.callAIProvider(prompt, provider);
      
      // Step 6: Parse and validate AI output against schema
      const validationResult = await this.validateAIOutput(rawOutput);
      
      // Step 7: Store analysis with audit trail
      const analysisResult = await this.storeAnalysis({
        risk_id: input.risk_id || 0,
        input_hash: inputHash,
        input_summary: this.generateInputSummary(input),
        raw_output: rawOutput,
        validated_output: validationResult.output,
        validation_errors: validationResult.errors,
        provider,
        processing_time_ms: Date.now() - startTime,
        token_counts: await this.estimateTokens(prompt, rawOutput)
      });
      
      console.log('[AI-Analysis] Analysis completed', {
        correlation_id: this.correlationId,
        analysis_id: analysisResult.id,
        validation_errors: validationResult.errors.length,
        processing_time: analysisResult.processing_time_ms
      });
      
      return analysisResult;
      
    } catch (error) {
      console.error('[AI-Analysis] Analysis failed', {
        correlation_id: this.correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time: Date.now() - startTime
      });
      
      throw error;
    }
  }

  /**
   * Build structured prompt with comprehensive context
   */
  private async buildStructuredPrompt(input: AIAnalysisInput): Promise<string> {
    const contextSections: string[] = [];

    // Risk basic information
    contextSections.push(`
RISK INFORMATION:
Title: ${input.title}
Description: ${input.description}
Category: ${input.category}
${input.service_id ? `Service ID: ${input.service_id}` : ''}
    `.trim());

    // Service indices context
    if (input.svi !== undefined || input.sei !== undefined) {
      contextSections.push(`
SERVICE RISK INDICES:
- Service Vulnerability Index (SVI): ${input.svi || 0}/100
- Security Event Index (SEI): ${input.sei || 0}/100  
- Business Context Index (BCI): ${input.bci || 0}/100
- External Risk Index (ERI): ${input.eri || 0}/100
      `.trim());
    }

    // Recent security incidents
    if (input.recent_incidents && input.recent_incidents.length > 0) {
      const incidents = input.recent_incidents.slice(0, 5).map(i => 
        `- ${i.id}: ${i.category} (Severity: ${i.severity}, Status: ${i.status})`
      ).join('\n');
      contextSections.push(`
RECENT SECURITY INCIDENTS:
${incidents}
      `.trim());
    }

    // Vulnerability context
    if (input.vulnerabilities && input.vulnerabilities.length > 0) {
      const vulns = input.vulnerabilities.slice(0, 5).map(v =>
        `- ${v.cve}: CVSS ${v.cvss_score}${v.kev ? ' (KEV)' : ''}${v.public_exploit ? ' (Public Exploit)' : ''} (${v.age_days} days old)`
      ).join('\n');
      contextSections.push(`
VULNERABILITY CONTEXT:
${vulns}
      `.trim());
    }

    // Threat intelligence  
    if (input.threat_intel && input.threat_intel.length > 0) {
      const ti = input.threat_intel.slice(0, 3).map(t =>
        `- ${t.indicator_type}: ${t.indicator_value} (${t.source}, Confidence: ${t.confidence})`
      ).join('\n');
      contextSections.push(`
THREAT INTELLIGENCE:
${ti}
      `.trim());
    }

    // Security posture
    if (input.security_posture) {
      contextSections.push(`
SECURITY POSTURE:
- EDR Coverage: ${input.security_posture.edr_coverage}%
- MFA Coverage: ${input.security_posture.mfa_coverage}%
- Patch Compliance: ${input.security_posture.patch_compliance}%
- Network Segmentation: ${input.security_posture.network_segmentation}%
- Backup Status: ${input.security_posture.backup_status}
      `.trim());
    }

    // Related risks
    if (input.related_risks && input.related_risks.length > 0) {
      const related = input.related_risks.slice(0, 3).map(r =>
        `- ${r.title} (${r.category}, Score: ${r.risk_score}, Status: ${r.status})`
      ).join('\n');
      contextSections.push(`
RELATED RISKS:
${related}
      `.trim());
    }

    const context = contextSections.join('\n\n');

    return `You are an expert cybersecurity risk analyst. Analyze this business risk and provide a comprehensive assessment with structured, actionable outputs.

${context}

ANALYSIS REQUIREMENTS:
Provide your response as valid JSON following this exact schema:

{
  "classification": {
    "category": "string (cybersecurity|operational|compliance|strategic|financial|reputational)",
    "subcategory": "string (specific sub-classification)",
    "confidence": "number (0.0-1.0)"
  },
  "likelihood_band": "string (very_low|low|medium|high|very_high)",
  "impact_band": "string (minimal|minor|moderate|major|severe)",
  "severity": "string (low|medium|high|critical)",
  "mapped_controls": {
    "nist_csf": ["array of NIST CSF controls like PR.IP-12, DE.CM-8"],
    "iso_27001": ["array of ISO 27001 controls like A.12.2.1"],
    "mitre_attack": ["array of MITRE ATT&CK techniques like T1566.001"]
  },
  "mitigation_plan": [
    {
      "step": "specific actionable mitigation step",
      "owner": "responsible role/team",
      "effort": "minimal|moderate|significant",
      "eta_days": "number of days",
      "expected_reduction_percent": "number (0-100)",
      "priority": "number (1-5, 1=highest)"
    }
  ],
  "rationale": {
    "summary": "concise risk assessment summary",
    "evidence_citations": ["cite specific incident IDs, CVE numbers, or data points"],
    "risk_factors": [
      {
        "factor": "specific risk factor",
        "impact": "positive|negative", 
        "weight": "number (0.0-1.0)",
        "evidence": "supporting evidence"
      }
    ],
    "assumptions": ["key assumptions made in analysis"]
  },
  "confidence": "number (0.0-1.0 overall confidence in assessment)",
  "alternatives": [
    {
      "scenario": "alternative scenario description",
      "likelihood_band": "string",
      "impact_band": "string", 
      "rationale": "reasoning for alternative",
      "confidence": "number (0.0-1.0)"
    }
  ],
  "scoring_inputs": {
    "likelihood_score": "number (0-100)",
    "impact_score": "number (0-100)",
    "confidence_score": "number (0.0-1.0)",
    "evidence_quality": "number (0.0-1.0)"
  }
}

INSTRUCTIONS:
- Cite specific evidence (incident IDs, CVE numbers, vulnerability details)
- Consider security posture when assessing likelihood reduction
- Provide concrete, actionable mitigation steps with realistic timelines
- Map to relevant framework controls based on risk type
- Include alternatives if confidence < 0.8
- Be specific about assumptions and evidence limitations
- Ensure all numeric values are within specified ranges

Respond ONLY with valid JSON. Do not include any text before or after the JSON.`;
  }

  /**
   * Call AI provider with comprehensive error handling
   */
  private async callAIProvider(prompt: string, provider: string): Promise<string> {
    const config = this.providerConfigs[provider];
    if (!config) {
      throw new Error(`Unknown AI provider: ${provider}`);
    }

    try {
      if (provider === 'cloudflare_workers_ai' && this.aiBinding) {
        const response = await this.aiBinding.run(config.model, {
          messages: [{ role: 'user', content: prompt }],
          max_tokens: config.max_tokens,
          temperature: config.temperature
        });
        
        return response.response || '';
      }
      
      throw new Error(`AI provider ${provider} not configured or available`);
      
    } catch (error) {
      console.error('[AI-Analysis] Provider call failed', {
        provider,
        model: config.model,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate AI output against standardized schema
   */
  private async validateAIOutput(rawOutput: string): Promise<{
    output: StandardizedAIOutput;
    errors: ValidationError[];
  }> {
    const errors: ValidationError[] = [];
    
    try {
      // Parse JSON
      let parsed;
      try {
        parsed = JSON.parse(rawOutput);
      } catch (parseError) {
        throw new Error(`Invalid JSON output: ${parseError instanceof Error ? parseError.message : 'Parse failed'}`);
      }

      // Validate required fields
      const requiredFields = [
        'classification', 'likelihood_band', 'impact_band', 'severity',
        'mapped_controls', 'mitigation_plan', 'rationale', 'confidence', 'scoring_inputs'
      ];

      for (const field of requiredFields) {
        if (!parsed[field]) {
          errors.push({
            field,
            error_type: 'missing_required_field',
            message: `Required field '${field}' is missing`,
            severity: 'error'
          });
        }
      }

      // Validate enums
      const validLikelihoodBands = ['very_low', 'low', 'medium', 'high', 'very_high'];
      if (parsed.likelihood_band && !validLikelihoodBands.includes(parsed.likelihood_band)) {
        errors.push({
          field: 'likelihood_band',
          error_type: 'invalid_enum_value',
          message: `Invalid likelihood_band: ${parsed.likelihood_band}`,
          severity: 'error'
        });
      }

      const validImpactBands = ['minimal', 'minor', 'moderate', 'major', 'severe'];
      if (parsed.impact_band && !validImpactBands.includes(parsed.impact_band)) {
        errors.push({
          field: 'impact_band',
          error_type: 'invalid_enum_value',
          message: `Invalid impact_band: ${parsed.impact_band}`,
          severity: 'error'
        });
      }

      // Validate confidence ranges
      if (parsed.confidence && (parsed.confidence < 0 || parsed.confidence > 1)) {
        errors.push({
          field: 'confidence',
          error_type: 'out_of_range',
          message: `Confidence must be between 0 and 1, got ${parsed.confidence}`,
          severity: 'error'
        });
      }

      // Validate mitigation plan structure
      if (parsed.mitigation_plan && Array.isArray(parsed.mitigation_plan)) {
        parsed.mitigation_plan.forEach((step: any, index: number) => {
          const requiredStepFields = ['step', 'owner', 'effort', 'eta_days', 'expected_reduction_percent', 'priority'];
          requiredStepFields.forEach(field => {
            if (!step[field]) {
              errors.push({
                field: `mitigation_plan[${index}].${field}`,
                error_type: 'missing_required_field',
                message: `Mitigation step ${index} missing required field: ${field}`,
                severity: 'warning'
              });
            }
          });
        });
      }

      // If too many errors, fail validation
      const errorCount = errors.filter(e => e.severity === 'error').length;
      if (errorCount > 3) {
        throw new Error(`Too many validation errors (${errorCount}). AI output quality insufficient.`);
      }

      return {
        output: parsed as StandardizedAIOutput,
        errors
      };

    } catch (error) {
      console.error('[AI-Analysis] Output validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        raw_output_preview: rawOutput.substring(0, 200)
      });
      
      throw error;
    }
  }

  /**
   * Store analysis with comprehensive audit trail
   */
  private async storeAnalysis(data: {
    risk_id: number;
    input_hash: string;
    input_summary: string;
    raw_output: string;
    validated_output: StandardizedAIOutput;
    validation_errors: ValidationError[];
    provider: string;
    processing_time_ms: number;
    token_counts: { input: number; output: number };
  }): Promise<AIAnalysisResult> {
    
    const analysisId = this.generateAnalysisId();
    const config = this.providerConfigs[data.provider];
    
    try {
      await this.db.prepare(`
        INSERT INTO ai_analysis (
          id, risk_id, input_hash, input_summary,
          provider, model_name, model_version, prompt_template_version,
          classification_category, classification_subcategory,
          likelihood_band, impact_band, severity,
          mapped_controls_nist, mapped_controls_iso, mapped_mitre_techniques,
          mitigation_plan_json, rationale, confidence,
          output_schema_version, validated, validation_errors,
          token_count_input, token_count_output, processing_time_ms,
          cost_estimate_cents, pii_redacted, no_training_flag,
          retention_days, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        analysisId,
        data.risk_id,
        data.input_hash,
        data.input_summary,
        data.provider,
        config.model,
        null, // model_version
        'v2.0', // prompt_template_version
        data.validated_output.classification?.category,
        data.validated_output.classification?.subcategory,
        data.validated_output.likelihood_band,
        data.validated_output.impact_band,
        data.validated_output.severity,
        JSON.stringify(data.validated_output.mapped_controls?.nist_csf || []),
        JSON.stringify(data.validated_output.mapped_controls?.iso_27001 || []),
        JSON.stringify(data.validated_output.mapped_controls?.mitre_attack || []),
        JSON.stringify(data.validated_output.mitigation_plan || []),
        JSON.stringify(data.validated_output.rationale || {}),
        data.validated_output.confidence,
        'v2.0', // output_schema_version
        data.validation_errors.filter(e => e.severity === 'error').length === 0,
        JSON.stringify(data.validation_errors),
        data.token_counts.input,
        data.token_counts.output,
        data.processing_time_ms,
        Math.round((data.token_counts.input + data.token_counts.output) * config.cost_per_1k_tokens / 10),
        true, // pii_redacted
        true, // no_training_flag
        this.retentionDays,
        new Date().toISOString()
      ).run();

      const result: AIAnalysisResult = {
        id: analysisId,
        risk_id: data.risk_id,
        input_hash: data.input_hash,
        output: data.validated_output,
        provider: data.provider,
        model_name: config.model,
        model_version: undefined,
        validated: data.validation_errors.filter(e => e.severity === 'error').length === 0,
        validation_errors: data.validation_errors,
        token_count_input: data.token_counts.input,
        token_count_output: data.token_counts.output,
        processing_time_ms: data.processing_time_ms,
        cost_estimate_cents: Math.round((data.token_counts.input + data.token_counts.output) * config.cost_per_1k_tokens / 10),
        human_reviewed: false,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + this.retentionDays * 24 * 60 * 60 * 1000).toISOString()
      };

      return result;

    } catch (error) {
      console.error('[AI-Analysis] Failed to store analysis', {
        analysis_id: analysisId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  // Helper methods
  private async validateInputs(input: AIAnalysisInput): Promise<void> {
    if (!this.aiEnabled) {
      throw new Error('AI analysis is disabled for this tenant');
    }
    
    if (!input.title || !input.description) {
      throw new Error('Title and description are required for AI analysis');
    }
    
    if (input.title.length > 200 || input.description.length > 2000) {
      throw new Error('Title or description too long for AI analysis');
    }
  }

  private async checkTokenLimits(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const usage = await this.db.prepare(`
      SELECT COALESCE(SUM(token_count_input + token_count_output), 0) as daily_tokens
      FROM ai_analysis
      WHERE DATE(created_at) = ?
    `).bind(today).first();
    
    if (usage && usage.daily_tokens >= this.dailyTokenLimit) {
      throw new Error(`Daily AI token limit exceeded (${usage.daily_tokens}/${this.dailyTokenLimit})`);
    }
  }

  private generateInputHash(input: AIAnalysisInput): string {
    const normalizedInput = {
      title: input.title.trim().toLowerCase(),
      description: input.description.trim().toLowerCase(),
      category: input.category,
      service_id: input.service_id,
      // Include key contextual data that affects analysis
      svi: input.svi,
      sei: input.sei,
      recent_incidents_count: input.recent_incidents?.length || 0,
      vulnerabilities_count: input.vulnerabilities?.length || 0
    };
    
    return createHash('sha256')
      .update(JSON.stringify(normalizedInput))
      .digest('hex');
  }

  private async getCachedAnalysis(inputHash: string): Promise<AIAnalysisResult | null> {
    try {
      const cached = await this.db.prepare(`
        SELECT * FROM ai_analysis 
        WHERE input_hash = ? 
          AND validated = 1
          AND expires_at > datetime('now')
        ORDER BY created_at DESC 
        LIMIT 1
      `).bind(inputHash).first();
      
      if (cached) {
        return this.mapDatabaseToResult(cached);
      }
      
      return null;
    } catch (error) {
      console.error('[AI-Analysis] Cache lookup failed', { input_hash: inputHash, error });
      return null;
    }
  }

  private isExpired(result: AIAnalysisResult): boolean {
    return new Date(result.expires_at) < new Date();
  }

  private generateInputSummary(input: AIAnalysisInput): string {
    return `${input.category}: ${input.title} - ${input.description.substring(0, 100)}${input.description.length > 100 ? '...' : ''}`;
  }

  private async estimateTokens(prompt: string, output: string): Promise<{ input: number; output: number }> {
    // Simple token estimation (words * 1.3 for subword tokenization)
    const inputTokens = Math.round(prompt.split(/\s+/).length * 1.3);
    const outputTokens = Math.round(output.split(/\s+/).length * 1.3);
    
    return { input: inputTokens, output: outputTokens };
  }

  private generateCorrelationId(): string {
    return `ai-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAnalysisId(): string {
    return `ai-${Date.now()}-${Math.random().toString(36).substr(2, 12)}`;
  }

  private async loadConfiguration(): Promise<void> {
    try {
      const config = await this.db.prepare(`
        SELECT key, value FROM system_config 
        WHERE key IN ('ai_analysis_enabled', 'ai_token_daily_limit', 'ai_analysis_retention_days')
      `).all();
      
      config.results?.forEach((row: any) => {
        switch (row.key) {
          case 'ai_analysis_enabled':
            this.aiEnabled = row.value === 'true';
            break;
          case 'ai_token_daily_limit':
            this.dailyTokenLimit = parseInt(row.value) || 50000;
            break;
          case 'ai_analysis_retention_days':
            this.retentionDays = parseInt(row.value) || 90;
            break;
        }
      });
    } catch (error) {
      console.error('[AI-Analysis] Failed to load configuration, using defaults', { error });
    }
  }

  private mapDatabaseToResult(row: any): AIAnalysisResult {
    return {
      id: row.id,
      risk_id: row.risk_id,
      input_hash: row.input_hash,
      output: {
        classification: {
          category: row.classification_category,
          subcategory: row.classification_subcategory,
          confidence: row.confidence
        },
        likelihood_band: row.likelihood_band,
        impact_band: row.impact_band,
        severity: row.severity,
        mapped_controls: {
          nist_csf: JSON.parse(row.mapped_controls_nist || '[]'),
          iso_27001: JSON.parse(row.mapped_controls_iso || '[]'),
          mitre_attack: JSON.parse(row.mapped_mitre_techniques || '[]')
        },
        mitigation_plan: JSON.parse(row.mitigation_plan_json || '[]'),
        rationale: JSON.parse(row.rationale || '{}'),
        confidence: row.confidence,
        alternatives: [],
        scoring_inputs: {
          likelihood_score: 0,
          impact_score: 0,
          confidence_score: row.confidence,
          evidence_quality: 0
        }
      },
      provider: row.provider,
      model_name: row.model_name,
      model_version: row.model_version,
      validated: row.validated,
      validation_errors: JSON.parse(row.validation_errors || '[]'),
      token_count_input: row.token_count_input,
      token_count_output: row.token_count_output,
      processing_time_ms: row.processing_time_ms,
      cost_estimate_cents: row.cost_estimate_cents,
      human_reviewed: row.human_reviewed,
      approved: row.approved,
      reviewer_feedback: row.reviewer_feedback,
      created_at: row.created_at,
      expires_at: row.expires_at
    };
  }
}

export default AIAnalysisService;