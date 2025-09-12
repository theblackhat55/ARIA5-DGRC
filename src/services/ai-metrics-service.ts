/**
 * AI Metrics Tracking Service
 * 
 * Comprehensive tracking and analysis of AI system performance,
 * learning feedback loops, and success metrics for continuous improvement.
 * 
 * Tracks decision accuracy, response times, user feedback, and system learning.
 */

import type { 
  AIMetric, 
  MetricType, 
  ProviderMetrics, 
  LearningFeedback, 
  PerformanceReport,
  AIDecisionAccuracy,
  ResponseTimeMetrics,
  TokenUsageMetrics,
  UserFeedbackMetric,
  SystemLearningMetric
} from '../types/ai-types';

export interface MetricsFilter {
  startDate?: Date;
  endDate?: Date;
  providers?: string[];
  metricTypes?: MetricType[];
  contexts?: string[];
  minConfidence?: number;
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

/**
 * AI Metrics Tracking Service
 * Provides comprehensive monitoring and analytics for AI system performance
 */
export class AIMetricsService {
  private metrics: AIMetric[] = [];
  private feedbackHistory: LearningFeedback[] = [];
  private readonly maxMetricsHistory = 10000; // Keep last 10k metrics
  private readonly maxFeedbackHistory = 5000; // Keep last 5k feedback entries

  /**
   * Record AI provider performance metric
   */
  recordProviderMetric(
    provider: string,
    operation: string,
    responseTime: number,
    tokenUsage: number,
    success: boolean,
    confidence?: number,
    context?: string,
    metadata?: any
  ): void {
    const metric: AIMetric = {
      id: `metric-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      type: 'provider_performance',
      provider,
      operation,
      responseTime,
      tokenUsage,
      success,
      confidence,
      context,
      metadata
    };

    this.addMetric(metric);
  }

  /**
   * Record AI decision accuracy
   */
  recordDecisionAccuracy(
    provider: string,
    operation: string,
    predicted: any,
    actual: any,
    accuracy: number,
    context?: string
  ): void {
    const metric: AIMetric = {
      id: `accuracy-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      type: 'decision_accuracy',
      provider,
      operation,
      success: accuracy > 0.8,
      confidence: accuracy,
      context,
      metadata: {
        predicted,
        actual,
        accuracy,
        correctPrediction: accuracy > 0.8
      }
    };

    this.addMetric(metric);
  }

  /**
   * Record user feedback on AI recommendations
   */
  recordUserFeedback(
    provider: string,
    operation: string,
    recommendation: any,
    userAction: 'accepted' | 'rejected' | 'modified',
    feedbackScore: number,
    comments?: string,
    context?: string
  ): void {
    const feedback: LearningFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      provider,
      operation,
      recommendation,
      userAction,
      feedbackScore,
      comments,
      context,
      processed: false
    };

    this.addFeedback(feedback);

    // Also record as metric
    const metric: AIMetric = {
      id: `user-feedback-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      type: 'user_feedback',
      provider,
      operation,
      success: userAction === 'accepted',
      confidence: feedbackScore / 10, // Normalize to 0-1
      context,
      metadata: {
        userAction,
        feedbackScore,
        comments
      }
    };

    this.addMetric(metric);
  }

  /**
   * Record learning progress metric
   */
  recordLearningProgress(
    provider: string,
    operation: string,
    learningType: 'reinforcement' | 'supervised' | 'unsupervised',
    improvementScore: number,
    iterationCount: number,
    context?: string
  ): void {
    const metric: AIMetric = {
      id: `learning-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      type: 'learning_progress',
      provider,
      operation,
      success: improvementScore > 0,
      confidence: Math.min(improvementScore, 1),
      context,
      metadata: {
        learningType,
        improvementScore,
        iterationCount,
        progressRate: improvementScore / iterationCount
      }
    };

    this.addMetric(metric);
  }

  /**
   * Get aggregated metrics with filtering
   */
  getAggregatedMetrics(filter?: MetricsFilter): MetricsAggregation {
    const filteredMetrics = this.filterMetrics(filter);
    
    if (filteredMetrics.length === 0) {
      return this.getEmptyAggregation();
    }

    const totalRequests = filteredMetrics.length;
    const successfulRequests = filteredMetrics.filter(m => m.success).length;
    const responseTimes = filteredMetrics.filter(m => m.responseTime).map(m => m.responseTime!);
    const tokenUsages = filteredMetrics.filter(m => m.tokenUsage).map(m => m.tokenUsage!);
    const confidences = filteredMetrics.filter(m => m.confidence).map(m => m.confidence!);

    // Provider distribution
    const providerDistribution: Record<string, number> = {};
    filteredMetrics.forEach(m => {
      providerDistribution[m.provider] = (providerDistribution[m.provider] || 0) + 1;
    });

    // Context distribution
    const contextDistribution: Record<string, number> = {};
    filteredMetrics.forEach(m => {
      if (m.context) {
        contextDistribution[m.context] = (contextDistribution[m.context] || 0) + 1;
      }
    });

    // Feedback score
    const feedbackMetrics = filteredMetrics.filter(m => m.type === 'user_feedback');
    const feedbackScore = feedbackMetrics.length > 0 
      ? feedbackMetrics.reduce((sum, m) => sum + (m.metadata?.feedbackScore || 0), 0) / feedbackMetrics.length 
      : 0;

    // Learning progress
    const learningMetrics = filteredMetrics.filter(m => m.type === 'learning_progress');
    const learningProgress = learningMetrics.length > 0
      ? learningMetrics.reduce((sum, m) => sum + (m.metadata?.improvementScore || 0), 0) / learningMetrics.length
      : 0;

    return {
      totalRequests,
      avgResponseTime: this.calculateAverage(responseTimes),
      avgTokenUsage: this.calculateAverage(tokenUsages),
      avgConfidence: this.calculateAverage(confidences),
      successRate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
      errorRate: totalRequests > 0 ? (totalRequests - successfulRequests) / totalRequests : 0,
      providerDistribution,
      contextDistribution,
      feedbackScore,
      learningProgress
    };
  }

  /**
   * Get provider-specific performance metrics
   */
  getProviderMetrics(provider: string, filter?: MetricsFilter): ProviderMetrics {
    const providerFilter = { ...filter, providers: [provider] };
    const metrics = this.filterMetrics(providerFilter);
    const aggregation = this.getAggregatedMetrics(providerFilter);

    // Calculate provider-specific insights
    const recentMetrics = metrics.slice(-100); // Last 100 requests
    const trendDirection = this.calculateTrend(recentMetrics);
    const reliability = this.calculateReliability(metrics);
    const efficiency = this.calculateEfficiency(metrics);

    return {
      provider,
      totalRequests: aggregation.totalRequests,
      successRate: aggregation.successRate,
      avgResponseTime: aggregation.avgResponseTime,
      avgTokenUsage: aggregation.avgTokenUsage,
      avgConfidence: aggregation.avgConfidence,
      feedbackScore: aggregation.feedbackScore,
      trendDirection,
      reliability,
      efficiency,
      lastUsed: metrics.length > 0 ? metrics[metrics.length - 1].timestamp : null,
      contextPerformance: this.getContextPerformance(metrics)
    };
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(period: 'day' | 'week' | 'month' = 'week'): PerformanceReport {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const filter: MetricsFilter = { startDate, endDate };
    const aggregation = this.getAggregatedMetrics(filter);
    const providers = Object.keys(aggregation.providerDistribution);
    
    const providerReports = providers.map(provider => 
      this.getProviderMetrics(provider, filter)
    );

    // Performance insights
    const insights = this.generateInsights(aggregation, providerReports);
    const recommendations = this.generateRecommendations(providerReports);

    return {
      period,
      startDate,
      endDate,
      overview: aggregation,
      providerReports,
      insights,
      recommendations,
      generatedAt: new Date()
    };
  }

  /**
   * Get learning feedback analytics
   */
  getLearningAnalytics(): {
    totalFeedback: number;
    averageScore: number;
    acceptanceRate: number;
    rejectionRate: number;
    modificationRate: number;
    topIssues: Array<{ issue: string; count: number }>;
    improvementTrends: Array<{ date: Date; score: number }>;
  } {
    const feedback = this.feedbackHistory;
    const totalFeedback = feedback.length;

    if (totalFeedback === 0) {
      return {
        totalFeedback: 0,
        averageScore: 0,
        acceptanceRate: 0,
        rejectionRate: 0,
        modificationRate: 0,
        topIssues: [],
        improvementTrends: []
      };
    }

    const averageScore = feedback.reduce((sum, f) => sum + f.feedbackScore, 0) / totalFeedback;
    const acceptanceRate = feedback.filter(f => f.userAction === 'accepted').length / totalFeedback;
    const rejectionRate = feedback.filter(f => f.userAction === 'rejected').length / totalFeedback;
    const modificationRate = feedback.filter(f => f.userAction === 'modified').length / totalFeedback;

    // Extract top issues from comments
    const issues: Record<string, number> = {};
    feedback.forEach(f => {
      if (f.comments) {
        // Simple keyword extraction for issues
        const keywords = f.comments.toLowerCase().split(/\s+/);
        keywords.forEach(keyword => {
          if (keyword.length > 4) { // Filter short words
            issues[keyword] = (issues[keyword] || 0) + 1;
          }
        });
      }
    });

    const topIssues = Object.entries(issues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([issue, count]) => ({ issue, count }));

    // Generate improvement trends (weekly averages)
    const improvementTrends = this.calculateImprovementTrends(feedback);

    return {
      totalFeedback,
      averageScore,
      acceptanceRate,
      rejectionRate,
      modificationRate,
      topIssues,
      improvementTrends
    };
  }

  /**
   * Get real-time system status
   */
  getSystemStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    lastUpdate: Date;
    activeProviders: number;
    totalRequests24h: number;
    successRate24h: number;
    avgResponseTime: number;
    alerts: string[];
  } {
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    
    const recent = this.getAggregatedMetrics({ 
      startDate: last24h 
    });

    const alerts: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Health checks
    if (recent.successRate < 0.8) {
      alerts.push(`Low success rate: ${(recent.successRate * 100).toFixed(1)}%`);
      status = 'critical';
    } else if (recent.successRate < 0.9) {
      alerts.push(`Success rate below threshold: ${(recent.successRate * 100).toFixed(1)}%`);
      status = 'warning';
    }

    if (recent.avgResponseTime > 5000) {
      alerts.push(`High response time: ${recent.avgResponseTime.toFixed(0)}ms`);
      status = status === 'critical' ? 'critical' : 'warning';
    }

    if (recent.feedbackScore < 6) {
      alerts.push(`Low user satisfaction: ${recent.feedbackScore.toFixed(1)}/10`);
      status = status === 'critical' ? 'critical' : 'warning';
    }

    return {
      status,
      lastUpdate: new Date(),
      activeProviders: Object.keys(recent.providerDistribution).length,
      totalRequests24h: recent.totalRequests,
      successRate24h: recent.successRate,
      avgResponseTime: recent.avgResponseTime,
      alerts
    };
  }

  /**
   * Export metrics data
   */
  exportMetrics(format: 'json' | 'csv' = 'json', filter?: MetricsFilter): string {
    const metrics = this.filterMetrics(filter);
    
    if (format === 'csv') {
      return this.convertToCSV(metrics);
    }
    
    return JSON.stringify(metrics, null, 2);
  }

  // Private helper methods

  private addMetric(metric: AIMetric): void {
    this.metrics.push(metric);
    
    // Maintain history limit
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  private addFeedback(feedback: LearningFeedback): void {
    this.feedbackHistory.push(feedback);
    
    // Maintain history limit
    if (this.feedbackHistory.length > this.maxFeedbackHistory) {
      this.feedbackHistory = this.feedbackHistory.slice(-this.maxFeedbackHistory);
    }
  }

  private filterMetrics(filter?: MetricsFilter): AIMetric[] {
    if (!filter) return [...this.metrics];

    return this.metrics.filter(metric => {
      if (filter.startDate && metric.timestamp < filter.startDate) return false;
      if (filter.endDate && metric.timestamp > filter.endDate) return false;
      if (filter.providers && !filter.providers.includes(metric.provider)) return false;
      if (filter.metricTypes && !filter.metricTypes.includes(metric.type)) return false;
      if (filter.contexts && metric.context && !filter.contexts.includes(metric.context)) return false;
      if (filter.minConfidence && (!metric.confidence || metric.confidence < filter.minConfidence)) return false;
      
      return true;
    });
  }

  private calculateAverage(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private calculateTrend(metrics: AIMetric[]): 'improving' | 'stable' | 'declining' {
    if (metrics.length < 10) return 'stable';

    const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
    const secondHalf = metrics.slice(Math.floor(metrics.length / 2));

    const firstHalfSuccess = firstHalf.filter(m => m.success).length / firstHalf.length;
    const secondHalfSuccess = secondHalf.filter(m => m.success).length / secondHalf.length;

    const improvement = secondHalfSuccess - firstHalfSuccess;

    if (improvement > 0.05) return 'improving';
    if (improvement < -0.05) return 'declining';
    return 'stable';
  }

  private calculateReliability(metrics: AIMetric[]): number {
    if (metrics.length === 0) return 0;
    
    const successRate = metrics.filter(m => m.success).length / metrics.length;
    const consistencyScore = this.calculateConsistency(metrics);
    
    return (successRate * 0.7) + (consistencyScore * 0.3);
  }

  private calculateEfficiency(metrics: AIMetric[]): number {
    const responseTimes = metrics.filter(m => m.responseTime).map(m => m.responseTime!);
    const tokenUsages = metrics.filter(m => m.tokenUsage).map(m => m.tokenUsage!);
    
    if (responseTimes.length === 0) return 0;
    
    const avgResponseTime = this.calculateAverage(responseTimes);
    const avgTokenUsage = this.calculateAverage(tokenUsages);
    
    // Normalize efficiency score (lower time and tokens = higher efficiency)
    const timeScore = Math.max(0, 1 - (avgResponseTime / 10000)); // Normalize to 10s max
    const tokenScore = Math.max(0, 1 - (avgTokenUsage / 2000)); // Normalize to 2000 tokens max
    
    return (timeScore + tokenScore) / 2;
  }

  private calculateConsistency(metrics: AIMetric[]): number {
    const responseTimes = metrics.filter(m => m.responseTime).map(m => m.responseTime!);
    if (responseTimes.length < 2) return 1;
    
    const avg = this.calculateAverage(responseTimes);
    const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / responseTimes.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    return Math.max(0, 1 - (stdDev / avg));
  }

  private getContextPerformance(metrics: AIMetric[]): Record<string, { successRate: number; avgResponseTime: number }> {
    const contextPerformance: Record<string, { successRate: number; avgResponseTime: number }> = {};
    
    const contexts = [...new Set(metrics.filter(m => m.context).map(m => m.context!))];
    
    contexts.forEach(context => {
      const contextMetrics = metrics.filter(m => m.context === context);
      const successRate = contextMetrics.filter(m => m.success).length / contextMetrics.length;
      const responseTimes = contextMetrics.filter(m => m.responseTime).map(m => m.responseTime!);
      const avgResponseTime = this.calculateAverage(responseTimes);
      
      contextPerformance[context] = { successRate, avgResponseTime };
    });
    
    return contextPerformance;
  }

  private generateInsights(aggregation: MetricsAggregation, providerReports: ProviderMetrics[]): string[] {
    const insights: string[] = [];
    
    // Performance insights
    if (aggregation.successRate > 0.95) {
      insights.push('Excellent system reliability with 95%+ success rate');
    } else if (aggregation.successRate < 0.8) {
      insights.push('System reliability needs attention - success rate below 80%');
    }
    
    // Response time insights
    if (aggregation.avgResponseTime < 1000) {
      insights.push('Fast response times under 1 second');
    } else if (aggregation.avgResponseTime > 5000) {
      insights.push('Response times are high - consider optimization');
    }
    
    // Provider insights
    const bestProvider = providerReports.reduce((best, current) => 
      current.successRate > best.successRate ? current : best
    );
    insights.push(`Best performing provider: ${bestProvider.provider} (${(bestProvider.successRate * 100).toFixed(1)}% success rate)`);
    
    // User satisfaction
    if (aggregation.feedbackScore > 8) {
      insights.push('High user satisfaction with AI recommendations');
    } else if (aggregation.feedbackScore < 6) {
      insights.push('User satisfaction needs improvement');
    }
    
    return insights;
  }

  private generateRecommendations(providerReports: ProviderMetrics[]): string[] {
    const recommendations: string[] = [];
    
    // Provider optimization
    const lowPerforming = providerReports.filter(p => p.successRate < 0.8);
    if (lowPerforming.length > 0) {
      recommendations.push(`Consider reviewing configuration for providers: ${lowPerforming.map(p => p.provider).join(', ')}`);
    }
    
    // Load balancing
    const usage = providerReports.map(p => p.totalRequests);
    const maxUsage = Math.max(...usage);
    const minUsage = Math.min(...usage);
    if (maxUsage / minUsage > 3) {
      recommendations.push('Consider load balancing - some providers are underutilized');
    }
    
    // Performance optimization
    const slowProviders = providerReports.filter(p => p.avgResponseTime > 3000);
    if (slowProviders.length > 0) {
      recommendations.push(`Optimize response times for: ${slowProviders.map(p => p.provider).join(', ')}`);
    }
    
    return recommendations;
  }

  private calculateImprovementTrends(feedback: LearningFeedback[]): Array<{ date: Date; score: number }> {
    const trends: Array<{ date: Date; score: number }> = [];
    const sortedFeedback = feedback.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Group by week and calculate average scores
    const weeklyScores: Record<string, number[]> = {};
    
    sortedFeedback.forEach(f => {
      const weekStart = new Date(f.timestamp);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyScores[weekKey]) {
        weeklyScores[weekKey] = [];
      }
      weeklyScores[weekKey].push(f.feedbackScore);
    });
    
    Object.entries(weeklyScores).forEach(([dateStr, scores]) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      trends.push({
        date: new Date(dateStr),
        score: avgScore
      });
    });
    
    return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private convertToCSV(metrics: AIMetric[]): string {
    if (metrics.length === 0) return '';
    
    const headers = ['id', 'timestamp', 'type', 'provider', 'operation', 'responseTime', 'tokenUsage', 'success', 'confidence', 'context'];
    const csvRows = [headers.join(',')];
    
    metrics.forEach(metric => {
      const row = [
        metric.id,
        metric.timestamp.toISOString(),
        metric.type,
        metric.provider,
        metric.operation || '',
        metric.responseTime || '',
        metric.tokenUsage || '',
        metric.success,
        metric.confidence || '',
        metric.context || ''
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  private getEmptyAggregation(): MetricsAggregation {
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      avgTokenUsage: 0,
      avgConfidence: 0,
      successRate: 0,
      errorRate: 0,
      providerDistribution: {},
      contextDistribution: {},
      feedbackScore: 0,
      learningProgress: 0
    };
  }
}