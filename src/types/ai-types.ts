/**
 * AI-Native Type Definitions
 * 
 * Comprehensive type definitions for the AI-native ARIA5 GRC platform.
 * Supports all AI services, intelligence workers, risk escalation, and metrics tracking.
 */

// Core AI Provider Types
export interface AIProvider {
  name: string;
  type: 'openai' | 'anthropic' | 'cloudflare' | 'google' | 'custom';
  endpoint?: string;
  apiKey?: string;
  model?: string;
  capabilities: AICapability[];
  status: 'active' | 'inactive' | 'error';
  lastUsed?: Date;
  responseTime?: number;
  successRate?: number;
}

export interface AICapability {
  name: string;
  description: string;
  supportedOperations: string[];
  qualityScore?: number;
  costEfficiency?: number;
}

export interface AIRequest {
  id: string;
  provider: string;
  operation: string;
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  timestamp: Date;
}

export interface AIResponse {
  id: string;
  requestId: string;
  provider: string;
  response: string;
  tokensUsed: number;
  responseTime: number;
  confidence?: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

// Universal AI Service Types
export interface RiskData {
  systemId: string;
  systemName: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  currentRiskLevel: string;
  vulnerabilities: any[];
  lastAssessment: Date;
  context: {
    industry?: string;
    compliance?: string[];
    dataClassification?: string;
  };
}

export interface AIRiskInsight {
  currentRiskLevel: string;
  recommendedRiskLevel?: string;
  confidence: number;
  reasoning: string;
  escalationRequired: boolean;
  recommendations: string[];
  evidence?: any[];
}

export interface Threat {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cveId?: string;
  firstSeen: Date;
  lastUpdated: Date;
  indicators: string[];
  affectedSystems: string[];
  confidence: number;
}

export interface Vulnerability {
  id: string;
  cveId?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvssScore: number;
  affectedSystems: string[];
  discoveredDate: Date;
  patchAvailable: boolean;
  systemCriticality: 'low' | 'medium' | 'high' | 'critical';
  exploitAvailable: boolean;
}

export interface ThreatCorrelation {
  id: string;
  threats: Threat[];
  vulnerabilities: Vulnerability[];
  confidence: number;
  activeExploitation: boolean;
  trendingUp: boolean;
  currentRiskLevel: string;
  systemCriticality: string;
  evidence: any[];
  correlationScore: number;
  recommendedActions: string[];
}

// Risk Escalation Types
export interface RiskEscalation {
  id: string;
  assetId: string;
  systemId?: string;
  fromRiskLevel: string;
  toRiskLevel: string;
  confidence: number;
  reasoning: string;
  triggers?: EscalationTrigger[];
  evidence: any[];
  timestamp: Date;
  status: 'pending' | 'executed' | 'failed' | 'rolled_back';
  autoApproved: boolean;
  approvedBy?: string;
  executedAt?: Date | null;
}

export interface EscalationRule {
  id: string;
  correlationId?: string;
  systemId?: string;
  fromLevel: string;
  toLevel: string;
  reason: string;
  confidence: number;
  triggeredBy: 'threat_intelligence' | 'ai_risk_assessment' | 'trend_analysis' | 'compliance_requirement';
  timestamp: Date;
  autoApproved: boolean;
  evidence?: any[];
}

export interface EscalationTrigger {
  id: string;
  type: 'critical_system_active_exploitation' | 'trending_threat_activity' | 'high_confidence_correlation' | 
        'multiple_vulnerability_exploitation' | 'compliance_sensitive_system';
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: 'immediate_escalation' | 'escalation_review' | 'auto_escalation' | 'compliance_escalation';
  evidence?: any;
  visionScenario?: boolean; // Mark triggers implementing core vision
}

export interface EscalationDecision {
  shouldEscalate: boolean;
  escalation: RiskEscalation | null;
  autoApproved: boolean;
  reasoning: string;
  confidence: number;
  requiresApproval: boolean;
}

export interface RiskContext {
  assetName?: string;
  systemCriticality: 'low' | 'medium' | 'high' | 'critical';
  industry?: string;
  complianceRequirements?: string[];
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  businessImpact?: 'low' | 'medium' | 'high' | 'critical';
}

export interface EscalationAuditLog {
  id: string;
  timestamp: Date;
  event: string;
  data: any;
  user: string;
}

// Intelligence Worker Types
export interface IntelligenceWorkerConfig {
  intervalMinutes: number;
  enabledCapabilities: string[];
  aiProviderPreferences: string[];
  maxConcurrentOperations: number;
}

export type WorkerStatus = 'stopped' | 'running' | 'processing' | 'idle' | 'error';

// AI Metrics Types
export type MetricType = 'provider_performance' | 'decision_accuracy' | 'user_feedback' | 'learning_progress';

export interface AIMetric {
  id: string;
  timestamp: Date;
  type: MetricType;
  provider: string;
  operation: string;
  responseTime?: number;
  tokenUsage?: number;
  success: boolean;
  confidence?: number;
  context?: string;
  metadata?: any;
}

export interface ProviderMetrics {
  provider: string;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  avgTokenUsage: number;
  avgConfidence: number;
  feedbackScore: number;
  trendDirection: 'improving' | 'stable' | 'declining';
  reliability: number;
  efficiency: number;
  lastUsed: Date | null;
  contextPerformance: Record<string, { successRate: number; avgResponseTime: number }>;
}

export interface LearningFeedback {
  id: string;
  timestamp: Date;
  provider: string;
  operation: string;
  recommendation: any;
  userAction: 'accepted' | 'rejected' | 'modified';
  feedbackScore: number; // 1-10 scale
  comments?: string;
  context?: string;
  processed: boolean;
}

export interface PerformanceReport {
  period: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  overview: MetricsAggregation;
  providerReports: ProviderMetrics[];
  insights: string[];
  recommendations: string[];
  generatedAt: Date;
}

export interface MetricsAggregation {
  totalRequests: number;
  avgResponseTime: number;
  avgTokenUsage: number;
  avgConfidence: number;
  successRate: number;
  errorRate: number;
  providerDistribution: Record<string, number>;
  contextDistribution: Record<string, number>;
  feedbackScore: number;
  learningProgress: number;
}

export interface AIDecisionAccuracy {
  operation: string;
  predicted: any;
  actual: any;
  accuracy: number;
  confidence: number;
  timestamp: Date;
}

export interface ResponseTimeMetrics {
  provider: string;
  operation: string;
  responseTime: number;
  timestamp: Date;
}

export interface TokenUsageMetrics {
  provider: string;
  operation: string;
  tokensUsed: number;
  cost?: number;
  timestamp: Date;
}

export interface UserFeedbackMetric {
  provider: string;
  operation: string;
  userRating: number; // 1-5 scale
  feedbackText?: string;
  timestamp: Date;
}

export interface SystemLearningMetric {
  provider: string;
  operation: string;
  improvementScore: number;
  iterationCount: number;
  learningType: 'reinforcement' | 'supervised' | 'unsupervised';
  timestamp: Date;
}

// Migration Progress Types
export interface MigrationTask {
  id: string;
  name: string;
  description: string;
  status: MigrationStatus;
  phase: string;
  startTime?: Date;
  endTime?: Date;
  progress: number; // 0-100
  errors: string[];
}

export type MigrationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';

export interface RouteConsolidationProgress {
  id: string;
  phase: string;
  startTime: Date;
  endTime: Date | null;
  status: MigrationStatus;
  totalRoutes: number;
  consolidatedRoutes: number;
  failedRoutes: number;
  skippedRoutes: number;
  currentBatch: number;
  totalBatches: number;
  errors: string[];
  performance: PerformanceImpact | null;
  rollbackExecuted: boolean;
}

export interface ModuleMigrationProgress {
  id: string;
  moduleName: string;
  status: MigrationStatus;
  startTime: Date;
  endTime: Date | null;
  progress: number;
  dependencies: string[];
  affectedRoutes: string[];
  testResults: any[];
  rollbackPlan?: string;
}

export interface PerformanceImpact {
  id: string;
  timestamp: Date;
  phase: string;
  metrics: {
    avgResponseTime: number;
    successRate: number;
    errorRate: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  compared: {
    avgResponseTime: number;
    successRate: number;
    errorRate: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
  } | null;
  impact: {
    responseTimeChange: number; // percentage
    successRateChange: number;
    errorRateChange: number;
    throughputChange: number;
  };
}

export interface UserAdoptionMetrics {
  id: string;
  timestamp: Date;
  userId: string;
  feature: string;
  action: 'engaged' | 'completed' | 'abandoned';
  sessionData: any;
  migrationPhase: string | null;
}

export interface MigrationHealth {
  id: string;
  progressId: string;
  timestamp: Date;
  checkpoint: string;
  status: 'healthy' | 'warning' | 'critical';
  issues: Array<{ severity: string; description: string }>;
  metrics: {
    responseTime: number;
    successRate: number;
    errorRate: number;
    userSatisfaction: number;
  };
  recommendations: string[];
}

export interface RollbackPlan {
  id: string;
  progressId: string;
  createdAt: Date;
  executedAt: Date | null;
  status: 'ready' | 'executing' | 'completed' | 'failed';
  complexity: 'simple' | 'moderate' | 'complex';
  steps: Array<{
    id: string;
    description: string;
    type: string;
  }>;
  estimatedDuration: number; // minutes
  errors: string[];
}

// Dashboard and UI Types
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'alert' | 'recommendation';
  title: string;
  data: any;
  aiGenerated: boolean;
  confidence?: number;
  lastUpdated: Date;
}

export interface ExecutiveSummary {
  summary: string;
  criticalIssues: string;
  opportunities: string;
  keyRecommendations: string;
  confidence: number;
  generatedAt: Date;
}

export interface DecisionRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'compliance' | 'operations' | 'strategic';
  estimatedTime: string;
  impact: string;
  riskReduction: string;
  confidence: number;
  aiProvider: string;
  evidence: any[];
  alternatives?: DecisionRecommendation[];
}

export interface ScenarioAnalysis {
  id: string;
  title: string;
  description: string;
  probability: number; // 0-1
  timeframe: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'threat' | 'compliance' | 'operational' | 'strategic';
  mitigation: string[];
  confidence: number;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  aiNative?: boolean;
  requestId?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Configuration Types
export interface AIConfiguration {
  providers: AIProvider[];
  defaultProvider: string;
  fallbackProviders: string[];
  retryAttempts: number;
  timeout: number;
  rateLimits: Record<string, number>;
  enabledFeatures: string[];
}

export interface SystemConfiguration {
  ai: AIConfiguration;
  escalation: {
    enableAutoEscalation: boolean;
    requireApprovalThreshold: number;
    maxAutoEscalations: number;
    coolingPeriod: number;
    escalationMatrix: Record<string, Record<string, string>>;
    contextWeights: Record<string, number>;
  };
  migration: {
    enableRollbackSafety: boolean;
    performanceThresholds: {
      maxResponseTimeIncrease: number;
      minSuccessRate: number;
      maxErrorRateIncrease: number;
    };
    consolidationBatches: {
      batchSize: number;
      delayBetweenBatches: number;
      rollbackThreshold: number;
    };
    adoptionTargets: {
      minUserEngagement: number;
      targetFeatureUsage: number;
      feedbackThreshold: number;
    };
  };
  intelligence: {
    workerConfigs: Record<string, IntelligenceWorkerConfig>;
    enabledWorkers: string[];
    globalSettings: {
      maxConcurrentWorkers: number;
      defaultInterval: number;
      errorRetryDelay: number;
    };
  };
}

// Event Types for Real-time Updates
export interface AIEvent {
  id: string;
  type: 'escalation' | 'correlation' | 'decision' | 'alert' | 'metric';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  data: any;
  timestamp: Date;
  acknowledged: boolean;
  userId?: string;
}

// Audit and Compliance Types
export interface AIAuditLog {
  id: string;
  timestamp: Date;
  event: string;
  category: 'ai_decision' | 'escalation' | 'user_action' | 'system_change';
  userId?: string;
  description: string;
  beforeState?: any;
  afterState?: any;
  confidence?: number;
  aiProvider?: string;
  compliance: boolean;
}

// Export all types for easy importing
export type {
  AIProvider,
  AICapability,
  AIRequest,
  AIResponse,
  RiskData,
  AIRiskInsight,
  Threat,
  Vulnerability,
  ThreatCorrelation,
  RiskEscalation,
  EscalationRule,
  EscalationTrigger,
  EscalationDecision,
  RiskContext,
  EscalationAuditLog,
  IntelligenceWorkerConfig,
  WorkerStatus,
  MetricType,
  AIMetric,
  ProviderMetrics,
  LearningFeedback,
  PerformanceReport,
  MetricsAggregation,
  MigrationTask,
  MigrationStatus,
  RouteConsolidationProgress,
  ModuleMigrationProgress,
  PerformanceImpact,
  UserAdoptionMetrics,
  MigrationHealth,
  RollbackPlan,
  DashboardWidget,
  ExecutiveSummary,
  DecisionRecommendation,
  ScenarioAnalysis,
  APIResponse,
  PaginatedResponse,
  AIConfiguration,
  SystemConfiguration,
  AIEvent,
  AIAuditLog
};