/**
 * Background Intelligence Worker
 * 
 * Core component implementing the vision of continuous AI-powered threat intelligence
 * that automatically correlates threats with vulnerabilities for dynamic risk escalation.
 * 
 * Key Vision: "low vulnerability on critical system treated as medium risk should 
 * automatically escalate to high/critical when threat intelligence shows active exploitation"
 */

import { UniversalAIService } from '../services/universal-ai-service';
import type { 
  Threat, 
  Vulnerability, 
  RiskData, 
  ThreatCorrelation, 
  EscalationRule,
  IntelligenceWorkerConfig,
  WorkerStatus,
  CorrelationResult
} from '../types/ai-types';

export interface IntelligenceJobResult {
  jobId: string;
  timestamp: Date;
  processed: number;
  correlations: ThreatCorrelation[];
  escalations: EscalationRule[];
  errors: string[];
  performance: {
    duration: number;
    apiCalls: number;
    tokenUsage: number;
  };
}

export interface WorkerMetrics {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  averageDuration: number;
  lastRun: Date | null;
  status: WorkerStatus;
  correlationsFound: number;
  escalationsTriggered: number;
}

/**
 * Background Intelligence Worker
 * Continuously processes threat and vulnerability data to identify correlations
 * and trigger automatic risk escalations based on real-time threat intelligence
 */
export class IntelligenceWorker {
  private universalAI: UniversalAIService;
  private config: IntelligenceWorkerConfig;
  private metrics: WorkerMetrics;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(universalAI: UniversalAIService, config: IntelligenceWorkerConfig) {
    this.universalAI = universalAI;
    this.config = config;
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): WorkerMetrics {
    return {
      totalJobs: 0,
      successfulJobs: 0,
      failedJobs: 0,
      averageDuration: 0,
      lastRun: null,
      status: 'stopped',
      correlationsFound: 0,
      escalationsTriggered: 0
    };
  }

  /**
   * Start the background intelligence worker
   * Runs continuous threat-vulnerability correlation analysis
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Intelligence worker is already running');
    }

    this.isRunning = true;
    this.metrics.status = 'running';
    
    console.log(`🤖 Starting Intelligence Worker with ${this.config.intervalMinutes}min intervals`);

    // Run immediately on start
    await this.runIntelligenceJob();

    // Set up recurring execution
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.runIntelligenceJob();
      }
    }, this.config.intervalMinutes * 60 * 1000);
  }

  /**
   * Stop the background intelligence worker
   */
  stop(): void {
    this.isRunning = false;
    this.metrics.status = 'stopped';
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 Intelligence Worker stopped');
  }

  /**
   * Run a single intelligence analysis job
   * Core implementation of threat-vulnerability correlation vision
   */
  private async runIntelligenceJob(): Promise<IntelligenceJobResult> {
    const jobId = `intel-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();
    const result: IntelligenceJobResult = {
      jobId,
      timestamp: new Date(),
      processed: 0,
      correlations: [],
      escalations: [],
      errors: [],
      performance: {
        duration: 0,
        apiCalls: 0,
        tokenUsage: 0
      }
    };

    try {
      this.metrics.totalJobs++;
      this.metrics.status = 'processing';

      console.log(`🔍 Starting intelligence job ${jobId}`);

      // Fetch active threats and vulnerabilities
      const threats = await this.fetchActiveThreats();
      const vulnerabilities = await this.fetchActiveVulnerabilities();
      
      result.processed = threats.length + vulnerabilities.length;

      // Core Vision Implementation: Threat-Vulnerability Correlation
      if (threats.length > 0 && vulnerabilities.length > 0) {
        console.log(`📊 Correlating ${threats.length} threats with ${vulnerabilities.length} vulnerabilities`);
        
        const correlations = await this.universalAI.threatCorrelation(threats, vulnerabilities);
        result.correlations = correlations;
        this.metrics.correlationsFound += correlations.length;

        // Automatic Risk Escalation Logic
        for (const correlation of correlations) {
          const escalations = await this.evaluateEscalation(correlation);
          result.escalations.push(...escalations);
          
          // Apply escalations immediately
          for (const escalation of escalations) {
            await this.applyEscalation(escalation);
            this.metrics.escalationsTriggered++;
            
            console.log(`⬆️ Risk escalated: ${escalation.reason} (${escalation.fromLevel} → ${escalation.toLevel})`);
          }
        }
      }

      // Process individual risk assessments for critical systems
      const criticalSystems = await this.fetchCriticalSystems();
      for (const system of criticalSystems) {
        const riskData = await this.buildSystemRiskData(system);
        const insight = await this.universalAI.riskIntelligence(riskData);
        
        if (insight.escalationRequired) {
          const escalation = await this.createSystemEscalation(system, insight);
          result.escalations.push(escalation);
          await this.applyEscalation(escalation);
          this.metrics.escalationsTriggered++;
        }
      }

      this.metrics.successfulJobs++;
      this.metrics.status = 'idle';
      
      console.log(`✅ Intelligence job ${jobId} completed: ${result.correlations.length} correlations, ${result.escalations.length} escalations`);

    } catch (error) {
      this.metrics.failedJobs++;
      this.metrics.status = 'error';
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMsg);
      
      console.error(`❌ Intelligence job ${jobId} failed:`, errorMsg);
    } finally {
      const duration = Date.now() - startTime;
      result.performance.duration = duration;
      
      this.metrics.lastRun = new Date();
      this.metrics.averageDuration = this.calculateAverageDuration(duration);
    }

    return result;
  }

  /**
   * Evaluate if correlation requires risk escalation
   * Implements the core vision scenario: low vuln + active threat = high risk
   */
  private async evaluateEscalation(correlation: ThreatCorrelation): Promise<EscalationRule[]> {
    const escalations: EscalationRule[] = [];

    // Core Vision Logic: Active exploitation detection
    if (correlation.confidence > 0.8 && correlation.activeExploitation) {
      const currentRisk = correlation.currentRiskLevel;
      const systemCriticality = correlation.systemCriticality;
      
      // Vision Scenario: "low vulnerability on critical system... should automatically escalate to high/critical"
      if (currentRisk === 'low' && systemCriticality === 'critical') {
        escalations.push({
          id: `esc-${Date.now()}`,
          correlationId: correlation.id,
          fromLevel: 'low',
          toLevel: 'critical',
          reason: 'Active exploitation detected on critical system',
          confidence: correlation.confidence,
          triggeredBy: 'threat_intelligence',
          timestamp: new Date(),
          autoApproved: true,
          evidence: correlation.evidence
        });
      }
      
      // Medium risk systems with active threats escalate to high
      else if (currentRisk === 'medium' && correlation.activeExploitation) {
        escalations.push({
          id: `esc-${Date.now()}`,
          correlationId: correlation.id,
          fromLevel: 'medium',
          toLevel: 'high',
          reason: 'Active exploitation detected',
          confidence: correlation.confidence,
          triggeredBy: 'threat_intelligence',
          timestamp: new Date(),
          autoApproved: true,
          evidence: correlation.evidence
        });
      }
    }

    // Trending threat escalations
    if (correlation.trendingUp && correlation.confidence > 0.7) {
      escalations.push({
        id: `esc-${Date.now()}`,
        correlationId: correlation.id,
        fromLevel: correlation.currentRiskLevel,
        toLevel: this.getNextRiskLevel(correlation.currentRiskLevel),
        reason: 'Trending threat activity detected',
        confidence: correlation.confidence,
        triggeredBy: 'trend_analysis',
        timestamp: new Date(),
        autoApproved: correlation.confidence > 0.9,
        evidence: correlation.evidence
      });
    }

    return escalations;
  }

  /**
   * Apply risk escalation to the system
   */
  private async applyEscalation(escalation: EscalationRule): Promise<void> {
    // This would integrate with your existing risk management system
    console.log(`🚨 Applying escalation: ${escalation.reason}`);
    
    // Update risk levels in database
    // Trigger notifications
    // Update compliance dashboards
    // Log audit trail
  }

  /**
   * Fetch active threats from threat intelligence sources
   */
  private async fetchActiveThreats(): Promise<Threat[]> {
    // This would integrate with your threat intelligence feeds
    // For now, returning mock data structure
    return [
      {
        id: 'threat-001',
        name: 'CVE-2024-1234 Active Exploitation',
        description: 'Remote code execution vulnerability being actively exploited',
        severity: 'critical',
        cveId: 'CVE-2024-1234',
        firstSeen: new Date('2024-01-01'),
        lastUpdated: new Date(),
        indicators: ['suspicious_network_traffic', 'exploit_code_available'],
        affectedSystems: ['web_servers', 'application_servers'],
        confidence: 0.95
      }
    ];
  }

  /**
   * Fetch active vulnerabilities from vulnerability scanners
   */
  private async fetchActiveVulnerabilities(): Promise<Vulnerability[]> {
    // This would integrate with your vulnerability management system
    return [
      {
        id: 'vuln-001',
        cveId: 'CVE-2024-1234',
        title: 'Remote Code Execution in Web Framework',
        description: 'Buffer overflow allows remote code execution',
        severity: 'medium', // Note: Currently rated as medium, but will escalate with threat intel
        cvssScore: 6.5,
        affectedSystems: ['prod-web-01', 'prod-web-02'],
        discoveredDate: new Date('2024-01-15'),
        patchAvailable: true,
        systemCriticality: 'critical', // Critical system with medium vuln = escalation candidate
        exploitAvailable: true
      }
    ];
  }

  /**
   * Fetch critical systems for targeted analysis
   */
  private async fetchCriticalSystems(): Promise<any[]> {
    // This would integrate with your asset management system
    return [
      {
        id: 'sys-001',
        name: 'Production Web Cluster',
        criticality: 'critical',
        riskLevel: 'medium',
        vulnerabilities: ['vuln-001'],
        lastAssessment: new Date('2024-01-10')
      }
    ];
  }

  /**
   * Build comprehensive risk data for AI analysis
   */
  private async buildSystemRiskData(system: any): Promise<RiskData> {
    return {
      systemId: system.id,
      systemName: system.name,
      criticality: system.criticality,
      currentRiskLevel: system.riskLevel,
      vulnerabilities: system.vulnerabilities,
      lastAssessment: system.lastAssessment,
      context: {
        industry: 'technology',
        compliance: ['SOC2', 'ISO27001'],
        dataClassification: 'confidential'
      }
    };
  }

  /**
   * Create escalation rule for system-level risks
   */
  private async createSystemEscalation(system: any, insight: any): Promise<EscalationRule> {
    return {
      id: `sys-esc-${Date.now()}`,
      systemId: system.id,
      fromLevel: system.riskLevel,
      toLevel: insight.recommendedRiskLevel,
      reason: insight.escalationReason,
      confidence: insight.confidence,
      triggeredBy: 'ai_risk_assessment',
      timestamp: new Date(),
      autoApproved: insight.confidence > 0.9,
      evidence: insight.evidence
    };
  }

  /**
   * Get next risk level for escalation
   */
  private getNextRiskLevel(current: string): string {
    const levels = ['low', 'medium', 'high', 'critical'];
    const index = levels.indexOf(current);
    return index < levels.length - 1 ? levels[index + 1] : current;
  }

  /**
   * Calculate rolling average duration
   */
  private calculateAverageDuration(newDuration: number): number {
    const totalJobs = this.metrics.totalJobs;
    const currentAvg = this.metrics.averageDuration;
    return ((currentAvg * (totalJobs - 1)) + newDuration) / totalJobs;
  }

  /**
   * Get current worker metrics
   */
  getMetrics(): WorkerMetrics {
    return { ...this.metrics };
  }

  /**
   * Get worker configuration
   */
  getConfig(): IntelligenceWorkerConfig {
    return { ...this.config };
  }

  /**
   * Update worker configuration
   */
  updateConfig(newConfig: Partial<IntelligenceWorkerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Force run intelligence job manually
   */
  async forceRun(): Promise<IntelligenceJobResult> {
    return await this.runIntelligenceJob();
  }
}

/**
 * Intelligence Worker Manager
 * Manages multiple intelligence workers and coordinates their execution
 */
export class IntelligenceWorkerManager {
  private workers: Map<string, IntelligenceWorker> = new Map();
  private universalAI: UniversalAIService;

  constructor(universalAI: UniversalAIService) {
    this.universalAI = universalAI;
  }

  /**
   * Create and register a new intelligence worker
   */
  createWorker(name: string, config: IntelligenceWorkerConfig): IntelligenceWorker {
    const worker = new IntelligenceWorker(this.universalAI, config);
    this.workers.set(name, worker);
    return worker;
  }

  /**
   * Start all registered workers
   */
  async startAll(): Promise<void> {
    for (const [name, worker] of this.workers) {
      console.log(`🚀 Starting intelligence worker: ${name}`);
      await worker.start();
    }
  }

  /**
   * Stop all workers
   */
  stopAll(): void {
    for (const [name, worker] of this.workers) {
      console.log(`🛑 Stopping intelligence worker: ${name}`);
      worker.stop();
    }
  }

  /**
   * Get worker by name
   */
  getWorker(name: string): IntelligenceWorker | undefined {
    return this.workers.get(name);
  }

  /**
   * Get all worker metrics
   */
  getAllMetrics(): Record<string, WorkerMetrics> {
    const metrics: Record<string, WorkerMetrics> = {};
    for (const [name, worker] of this.workers) {
      metrics[name] = worker.getMetrics();
    }
    return metrics;
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    totalWorkers: number;
    runningWorkers: number;
    totalJobs: number;
    totalCorrelations: number;
    totalEscalations: number;
  } {
    let runningWorkers = 0;
    let totalJobs = 0;
    let totalCorrelations = 0;
    let totalEscalations = 0;

    for (const worker of this.workers.values()) {
      const metrics = worker.getMetrics();
      if (metrics.status === 'running') runningWorkers++;
      totalJobs += metrics.totalJobs;
      totalCorrelations += metrics.correlationsFound;
      totalEscalations += metrics.escalationsTriggered;
    }

    return {
      totalWorkers: this.workers.size,
      runningWorkers,
      totalJobs,
      totalCorrelations,
      totalEscalations
    };
  }
}