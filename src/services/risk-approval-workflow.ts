/**
 * Risk Approval Workflow Automation
 * 
 * Implements ML-powered automated approval workflow for dynamic risks.
 * Provides intelligent routing between auto-approval, human review, and rejection.
 * 
 * Key Features:
 * - ML confidence-based approval decisions (>0.8 auto-approve, 0.6-0.8 review, <0.4 reject)
 * - Automated workflow progression (Pending → Active/Review/Rejected)
 * - Human review queue management with priority routing
 * - Approval audit trail and compliance tracking
 * - Escalation management for overdue reviews
 * - Workflow analytics and performance metrics
 */

export interface WorkflowDecision {
  risk_id: number;
  decision: 'auto_approve' | 'require_review' | 'auto_reject';
  confidence_score: number;
  reasoning: string[];
  decision_factors: {
    ml_confidence: number;
    severity_level: number;
    business_impact: number;
    historical_accuracy: number;
    source_reliability: number;
  };
  automated: boolean;
  decided_at: string;
}

export interface ReviewRequest {
  id: string;
  risk_id: number;
  requester: 'system' | 'escalation' | 'manual';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assigned_to?: string;
  review_reason: string;
  context: {
    service_name?: string;
    asset_name?: string;
    risk_description: string;
    business_justification: string;
    recommended_action: string;
  };
  created_at: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'escalated';
  completed_at?: string;
  decision?: 'approve' | 'reject' | 'modify';
  reviewer_notes?: string;
}

export interface WorkflowMetrics {
  total_risks_processed: number;
  auto_approved: number;
  auto_rejected: number;
  sent_for_review: number;
  pending_reviews: number;
  overdue_reviews: number;
  average_review_time: number; // hours
  approval_accuracy_rate: number; // percentage
  sla_compliance_rate: number; // percentage
  last_updated: string;
}

export interface EscalationRule {
  id: string;
  condition: {
    review_age_hours: number;
    priority_level: string[];
    business_impact_threshold: number;
  };
  action: {
    escalate_to: string[];
    notification_method: 'email' | 'slack' | 'teams';
    escalation_message: string;
  };
  active: boolean;
}

export class RiskApprovalWorkflowEngine {
  private db: D1Database;
  private mlConfidenceThresholds = {
    auto_approve: 0.8,
    review_required: 0.6,
    auto_reject: 0.4
  };
  private reviewSlaHours = {
    urgent: 4,
    high: 24,
    medium: 72,
    low: 168
  };

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Process pending risks through the approval workflow
   */
  async processPendingRisks(): Promise<{
    processed: number;
    auto_approved: number;
    auto_rejected: number;
    sent_for_review: number;
    errors: number;
  }> {
    try {
      console.log('Processing pending risks through approval workflow...');

      // Get all pending risks
      const pendingRisks = await this.db.prepare(`
        SELECT * FROM dynamic_risks 
        WHERE status = 'pending' 
        ORDER BY discovered_at ASC
      `).all();

      let processed = 0;
      let autoApproved = 0;
      let autoRejected = 0;
      let sentForReview = 0;
      let errors = 0;

      for (const risk of pendingRisks.results || []) {
        try {
          const decision = await this.makeWorkflowDecision(risk);
          await this.executeWorkflowDecision(risk.id, decision);

          processed++;
          switch (decision.decision) {
            case 'auto_approve':
              autoApproved++;
              break;
            case 'auto_reject':
              autoRejected++;
              break;
            case 'require_review':
              sentForReview++;
              break;
          }

          console.log(`Processed risk ${risk.id}: ${decision.decision} (confidence: ${decision.confidence_score})`);

        } catch (error) {
          console.error(`Error processing risk ${risk.id}:`, error);
          errors++;
        }
      }

      console.log(`Workflow processing complete: ${processed} processed, ${autoApproved} auto-approved, ${autoRejected} auto-rejected, ${sentForReview} sent for review`);

      return {
        processed,
        auto_approved: autoApproved,
        auto_rejected: autoRejected,
        sent_for_review: sentForReview,
        errors
      };

    } catch (error) {
      console.error('Error processing pending risks:', error);
      throw error;
    }
  }

  /**
   * Make intelligent workflow decision based on ML confidence and risk factors
   */
  private async makeWorkflowDecision(risk: any): Promise<WorkflowDecision> {
    try {
      // Calculate decision factors
      const decisionFactors = {
        ml_confidence: risk.ml_confidence || 0.5,
        severity_level: this.normalizeSeverity(risk.severity_score),
        business_impact: this.normalizeBusinessImpact(risk.business_impact_score),
        historical_accuracy: await this.getSourceHistoricalAccuracy(risk.source),
        source_reliability: this.getSourceReliabilityScore(risk.source)
      };

      // Calculate composite confidence score
      const compositeConfidence = this.calculateCompositeConfidence(decisionFactors);

      // Make decision based on thresholds and factors
      let decision: 'auto_approve' | 'require_review' | 'auto_reject';
      let reasoning: string[] = [];

      if (compositeConfidence >= this.mlConfidenceThresholds.auto_approve) {
        // Auto-approve high confidence risks
        decision = 'auto_approve';
        reasoning.push(`High ML confidence (${compositeConfidence.toFixed(3)})`);
        
        if (decisionFactors.source_reliability >= 0.8) {
          reasoning.push('Reliable source with good track record');
        }
        
        if (decisionFactors.historical_accuracy >= 0.85) {
          reasoning.push('Source has high historical accuracy');
        }

      } else if (compositeConfidence >= this.mlConfidenceThresholds.review_required) {
        // Require human review for medium confidence
        decision = 'require_review';
        reasoning.push(`Medium ML confidence (${compositeConfidence.toFixed(3)}) requires human validation`);
        
        if (decisionFactors.business_impact >= 0.7) {
          reasoning.push('High business impact warrants human review');
        }
        
        if (decisionFactors.severity_level >= 0.8) {
          reasoning.push('High severity risk requires verification');
        }

      } else {
        // Auto-reject low confidence risks
        decision = 'auto_reject';
        reasoning.push(`Low ML confidence (${compositeConfidence.toFixed(3)})`);
        
        if (decisionFactors.source_reliability < 0.5) {
          reasoning.push('Unreliable source with poor track record');
        }
        
        if (decisionFactors.historical_accuracy < 0.6) {
          reasoning.push('Source has low historical accuracy');
        }
      }

      // Special cases that override default logic
      if (this.isHighCriticalityOverride(risk, decisionFactors)) {
        decision = 'require_review';
        reasoning.unshift('Critical asset/service requires manual review regardless of confidence');
      }

      if (this.isComplianceOverride(risk)) {
        decision = 'require_review';
        reasoning.unshift('Compliance-related risk requires mandatory review');
      }

      return {
        risk_id: risk.id,
        decision,
        confidence_score: compositeConfidence,
        reasoning,
        decision_factors: decisionFactors,
        automated: true,
        decided_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error making workflow decision:', error);
      throw error;
    }
  }

  /**
   * Calculate composite confidence score from multiple factors
   */
  private calculateCompositeConfidence(factors: any): number {
    // Weighted combination of factors
    const weights = {
      ml_confidence: 0.35,      // Primary ML prediction
      historical_accuracy: 0.25, // Source track record
      source_reliability: 0.20,  // Source trustworthiness
      severity_level: 0.10,      // Risk severity
      business_impact: 0.10      // Business impact
    };

    const weightedScore = (
      factors.ml_confidence * weights.ml_confidence +
      factors.historical_accuracy * weights.historical_accuracy +
      factors.source_reliability * weights.source_reliability +
      (1 - factors.severity_level) * weights.severity_level +  // Inverse: lower severity = higher confidence
      (1 - factors.business_impact) * weights.business_impact   // Inverse: lower impact = higher confidence
    );

    return Math.min(1.0, Math.max(0.0, weightedScore));
  }

  /**
   * Execute the workflow decision
   */
  private async executeWorkflowDecision(riskId: number, decision: WorkflowDecision): Promise<void> {
    try {
      // Store decision audit record
      await this.db.prepare(`
        INSERT INTO risk_workflow_decisions (
          risk_id, decision, confidence_score, reasoning, decision_factors,
          automated, decided_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        decision.risk_id,
        decision.decision,
        decision.confidence_score,
        JSON.stringify(decision.reasoning),
        JSON.stringify(decision.decision_factors),
        decision.automated ? 1 : 0,
        decision.decided_at
      ).run();

      // Execute the decision
      switch (decision.decision) {
        case 'auto_approve':
          await this.autoApproveRisk(riskId);
          break;

        case 'auto_reject':
          await this.autoRejectRisk(riskId);
          break;

        case 'require_review':
          await this.createReviewRequest(riskId, decision);
          break;
      }

    } catch (error) {
      console.error(`Error executing workflow decision for risk ${riskId}:`, error);
      throw error;
    }
  }

  /**
   * Auto-approve a risk (set status to active)
   */
  private async autoApproveRisk(riskId: number): Promise<void> {
    await this.db.prepare(`
      UPDATE dynamic_risks 
      SET status = 'active', 
          approved_at = ?, 
          approved_by = 'system_auto',
          last_updated = ?
      WHERE id = ?
    `).bind(
      new Date().toISOString(),
      new Date().toISOString(),
      riskId
    ).run();

    console.log(`Auto-approved risk ${riskId}`);
  }

  /**
   * Auto-reject a risk
   */
  private async autoRejectRisk(riskId: number): Promise<void> {
    await this.db.prepare(`
      UPDATE dynamic_risks 
      SET status = 'rejected', 
          rejected_at = ?, 
          rejected_by = 'system_auto',
          last_updated = ?
      WHERE id = ?
    `).bind(
      new Date().toISOString(),
      new Date().toISOString(),
      riskId
    ).run();

    console.log(`Auto-rejected risk ${riskId}`);
  }

  /**
   * Create a review request for human evaluation
   */
  private async createReviewRequest(riskId: number, decision: WorkflowDecision): Promise<void> {
    try {
      // Get risk details for context
      const risk = await this.db.prepare(`
        SELECT dr.*, bs.name as service_name, a.name as asset_name
        FROM dynamic_risks dr
        LEFT JOIN business_services bs ON dr.service_id = bs.id
        LEFT JOIN assets a ON dr.asset_id = a.id
        WHERE dr.id = ?
      `).bind(riskId).first();

      if (!risk) {
        throw new Error(`Risk ${riskId} not found`);
      }

      // Determine review priority
      const priority = this.determineReviewPriority(risk, decision.decision_factors);

      // Calculate due date based on priority
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + this.reviewSlaHours[priority]);

      const reviewId = `review_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Create review request
      const reviewRequest: ReviewRequest = {
        id: reviewId,
        risk_id: riskId,
        requester: 'system',
        priority,
        review_reason: decision.reasoning.join('; '),
        context: {
          service_name: risk.service_name || undefined,
          asset_name: risk.asset_name || undefined,
          risk_description: risk.description || 'No description provided',
          business_justification: this.generateBusinessJustification(risk, decision.decision_factors),
          recommended_action: this.generateRecommendedAction(risk, decision.decision_factors)
        },
        created_at: new Date().toISOString(),
        due_date: dueDate.toISOString(),
        status: 'pending'
      };

      // Store review request
      await this.db.prepare(`
        INSERT INTO risk_review_requests (
          id, risk_id, requester, priority, assigned_to, review_reason,
          context, created_at, due_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        reviewRequest.id,
        reviewRequest.risk_id,
        reviewRequest.requester,
        reviewRequest.priority,
        reviewRequest.assigned_to || null,
        reviewRequest.review_reason,
        JSON.stringify(reviewRequest.context),
        reviewRequest.created_at,
        reviewRequest.due_date,
        reviewRequest.status
      ).run();

      // Update risk status to under review
      await this.db.prepare(`
        UPDATE dynamic_risks 
        SET status = 'under_review', last_updated = ?
        WHERE id = ?
      `).bind(new Date().toISOString(), riskId).run();

      console.log(`Created ${priority} priority review request ${reviewId} for risk ${riskId}`);

    } catch (error) {
      console.error(`Error creating review request for risk ${riskId}:`, error);
      throw error;
    }
  }

  /**
   * Determine review priority based on risk factors
   */
  private determineReviewPriority(risk: any, factors: any): 'urgent' | 'high' | 'medium' | 'low' {
    // Urgent: Critical assets/services with high impact
    if (factors.business_impact >= 0.8 && factors.severity_level >= 0.8) {
      return 'urgent';
    }

    // High: High business impact or severity
    if (factors.business_impact >= 0.7 || factors.severity_level >= 0.7) {
      return 'high';
    }

    // Medium: Moderate impact/severity
    if (factors.business_impact >= 0.5 || factors.severity_level >= 0.5) {
      return 'medium';
    }

    // Low: Everything else
    return 'low';
  }

  /**
   * Generate business justification for review
   */
  private generateBusinessJustification(risk: any, factors: any): string {
    const justifications: string[] = [];

    if (factors.business_impact >= 0.7) {
      justifications.push('High business impact risk affecting critical operations');
    }

    if (factors.severity_level >= 0.7) {
      justifications.push('High severity security risk requiring validation');
    }

    if (factors.ml_confidence < 0.8 && factors.ml_confidence >= 0.6) {
      justifications.push('Moderate ML confidence requires human expertise for accurate assessment');
    }

    if (risk.service_name) {
      justifications.push(`Affects business service: ${risk.service_name}`);
    }

    if (risk.asset_name) {
      justifications.push(`Involves critical asset: ${risk.asset_name}`);
    }

    return justifications.length > 0 ? 
      justifications.join('. ') + '.' : 
      'Risk requires manual review for validation and approval.';
  }

  /**
   * Generate recommended action for reviewers
   */
  private generateRecommendedAction(risk: any, factors: any): string {
    if (factors.ml_confidence >= 0.75) {
      return 'Recommend approval - high confidence ML prediction with supporting factors';
    }

    if (factors.ml_confidence < 0.5 && factors.source_reliability < 0.6) {
      return 'Recommend rejection - low confidence and unreliable source';
    }

    if (factors.business_impact >= 0.8) {
      return 'Requires careful evaluation due to high business impact - consider approval with mitigation measures';
    }

    return 'Requires thorough review and risk assessment before decision';
  }

  /**
   * Process overdue review requests and escalate
   */
  async processOverdueReviews(): Promise<{
    overdue_found: number;
    escalated: number;
    errors: number;
  }> {
    try {
      console.log('Processing overdue review requests...');

      const overdueReviews = await this.db.prepare(`
        SELECT * FROM risk_review_requests 
        WHERE status IN ('pending', 'in_progress') 
        AND due_date < datetime('now')
        ORDER BY priority ASC, created_at ASC
      `).all();

      let escalated = 0;
      let errors = 0;

      for (const review of overdueReviews.results || []) {
        try {
          await this.escalateOverdueReview(review);
          escalated++;
        } catch (error) {
          console.error(`Error escalating review ${review.id}:`, error);
          errors++;
        }
      }

      console.log(`Escalation processing complete: ${escalated} escalated, ${errors} errors`);

      return {
        overdue_found: overdueReviews.results?.length || 0,
        escalated,
        errors
      };

    } catch (error) {
      console.error('Error processing overdue reviews:', error);
      throw error;
    }
  }

  /**
   * Escalate an overdue review request
   */
  private async escalateOverdueReview(review: any): Promise<void> {
    try {
      // Update review status to escalated
      await this.db.prepare(`
        UPDATE risk_review_requests 
        SET status = 'escalated', 
            escalated_at = ?
        WHERE id = ?
      `).bind(new Date().toISOString(), review.id).run();

      // Log escalation
      await this.db.prepare(`
        INSERT INTO review_escalations (
          review_id, escalated_at, escalation_reason, escalated_to
        ) VALUES (?, ?, ?, ?)
      `).bind(
        review.id,
        new Date().toISOString(),
        `Review overdue by ${this.calculateOverdueHours(review.due_date)} hours`,
        this.getEscalationTarget(review.priority)
      ).run();

      console.log(`Escalated overdue review ${review.id} (${review.priority} priority)`);

    } catch (error) {
      console.error(`Error escalating review ${review.id}:`, error);
      throw error;
    }
  }

  /**
   * Get pending review requests for human reviewers
   */
  async getPendingReviews(assignedTo?: string, priority?: string): Promise<ReviewRequest[]> {
    try {
      let query = `
        SELECT rrr.*, dr.description as risk_description, dr.severity_score, dr.likelihood_score
        FROM risk_review_requests rrr
        JOIN dynamic_risks dr ON rrr.risk_id = dr.id
        WHERE rrr.status = 'pending'
      `;

      const params: any[] = [];

      if (assignedTo) {
        query += ` AND rrr.assigned_to = ?`;
        params.push(assignedTo);
      }

      if (priority) {
        query += ` AND rrr.priority = ?`;
        params.push(priority);
      }

      query += ` ORDER BY 
        CASE rrr.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END, rrr.created_at ASC`;

      const reviews = await this.db.prepare(query).bind(...params).all();

      return (reviews.results || []).map(row => ({
        id: row.id,
        risk_id: row.risk_id,
        requester: row.requester,
        priority: row.priority,
        assigned_to: row.assigned_to,
        review_reason: row.review_reason,
        context: JSON.parse(row.context || '{}'),
        created_at: row.created_at,
        due_date: row.due_date,
        status: row.status,
        completed_at: row.completed_at,
        decision: row.decision,
        reviewer_notes: row.reviewer_notes
      }));

    } catch (error) {
      console.error('Error getting pending reviews:', error);
      throw error;
    }
  }

  /**
   * Submit a human review decision
   */
  async submitReviewDecision(
    reviewId: string, 
    decision: 'approve' | 'reject' | 'modify',
    reviewerNotes: string,
    reviewedBy: string,
    modificationDetails?: any
  ): Promise<void> {
    try {
      // Update review request
      await this.db.prepare(`
        UPDATE risk_review_requests 
        SET status = 'completed',
            completed_at = ?,
            decision = ?,
            reviewer_notes = ?,
            reviewed_by = ?
        WHERE id = ?
      `).bind(
        new Date().toISOString(),
        decision,
        reviewerNotes,
        reviewedBy,
        reviewId
      ).run();

      // Get risk ID
      const review = await this.db.prepare(`
        SELECT risk_id FROM risk_review_requests WHERE id = ?
      `).bind(reviewId).first();

      if (!review) {
        throw new Error(`Review ${reviewId} not found`);
      }

      // Execute the decision on the risk
      switch (decision) {
        case 'approve':
          await this.db.prepare(`
            UPDATE dynamic_risks 
            SET status = 'active',
                approved_at = ?,
                approved_by = ?,
                last_updated = ?
            WHERE id = ?
          `).bind(
            new Date().toISOString(),
            reviewedBy,
            new Date().toISOString(),
            review.risk_id
          ).run();
          break;

        case 'reject':
          await this.db.prepare(`
            UPDATE dynamic_risks 
            SET status = 'rejected',
                rejected_at = ?,
                rejected_by = ?,
                rejection_reason = ?,
                last_updated = ?
            WHERE id = ?
          `).bind(
            new Date().toISOString(),
            reviewedBy,
            reviewerNotes,
            new Date().toISOString(),
            review.risk_id
          ).run();
          break;

        case 'modify':
          // Update risk with modifications
          if (modificationDetails) {
            await this.db.prepare(`
              UPDATE dynamic_risks 
              SET status = 'active',
                  severity_score = COALESCE(?, severity_score),
                  likelihood_score = COALESCE(?, likelihood_score),
                  business_impact_score = COALESCE(?, business_impact_score),
                  description = COALESCE(?, description),
                  approved_at = ?,
                  approved_by = ?,
                  modification_notes = ?,
                  last_updated = ?
              WHERE id = ?
            `).bind(
              modificationDetails.severity_score,
              modificationDetails.likelihood_score,
              modificationDetails.business_impact_score,
              modificationDetails.description,
              new Date().toISOString(),
              reviewedBy,
              reviewerNotes,
              new Date().toISOString(),
              review.risk_id
            ).run();
          }
          break;
      }

      console.log(`Review ${reviewId} completed with decision: ${decision}`);

    } catch (error) {
      console.error(`Error submitting review decision for ${reviewId}:`, error);
      throw error;
    }
  }

  /**
   * Get workflow metrics and performance analytics
   */
  async getWorkflowMetrics(): Promise<WorkflowMetrics> {
    try {
      const metrics = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_decisions,
          SUM(CASE WHEN decision = 'auto_approve' THEN 1 ELSE 0 END) as auto_approved,
          SUM(CASE WHEN decision = 'auto_reject' THEN 1 ELSE 0 END) as auto_rejected,
          SUM(CASE WHEN decision = 'require_review' THEN 1 ELSE 0 END) as sent_for_review
        FROM risk_workflow_decisions
        WHERE decided_at >= datetime('now', '-24 hours')
      `).first();

      const reviewMetrics = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_reviews,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reviews,
          SUM(CASE WHEN status IN ('pending', 'in_progress') AND due_date < datetime('now') THEN 1 ELSE 0 END) as overdue_reviews,
          AVG(
            CASE 
              WHEN completed_at IS NOT NULL 
              THEN (julianday(completed_at) - julianday(created_at)) * 24
            END
          ) as average_review_hours
        FROM risk_review_requests
        WHERE created_at >= datetime('now', '-7 days')
      `).first();

      // Calculate approval accuracy (simplified - would need feedback mechanism in real implementation)
      const accuracyRate = 95.2; // Placeholder - would be calculated from feedback data

      // Calculate SLA compliance
      const totalReviews = reviewMetrics?.total_reviews || 0;
      const overdueReviews = reviewMetrics?.overdue_reviews || 0;
      const slaCompliance = totalReviews > 0 ? ((totalReviews - overdueReviews) / totalReviews) * 100 : 100;

      return {
        total_risks_processed: metrics?.total_decisions || 0,
        auto_approved: metrics?.auto_approved || 0,
        auto_rejected: metrics?.auto_rejected || 0,
        sent_for_review: metrics?.sent_for_review || 0,
        pending_reviews: reviewMetrics?.pending_reviews || 0,
        overdue_reviews: overdueReviews,
        average_review_time: Math.round((reviewMetrics?.average_review_hours || 0) * 100) / 100,
        approval_accuracy_rate: accuracyRate,
        sla_compliance_rate: Math.round(slaCompliance * 100) / 100,
        last_updated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting workflow metrics:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private normalizeSeverity(score: number): number {
    return Math.min(1.0, Math.max(0.0, (score || 5) / 10));
  }

  private normalizeBusinessImpact(score: number): number {
    return Math.min(1.0, Math.max(0.0, (score || 5) / 10));
  }

  private async getSourceHistoricalAccuracy(source: string): Promise<number> {
    try {
      // This would be calculated from historical feedback data
      // For now, return default values based on source type
      const accuracyMap: { [key: string]: number } = {
        'defender': 0.92,
        'servicenow': 0.88,
        'jira': 0.75,
        'threat_intel': 0.85,
        'asset_monitor': 0.90,
        'manual': 0.95,
        'system': 0.80
      };

      return accuracyMap[source] || 0.70;

    } catch (error) {
      console.error('Error getting source historical accuracy:', error);
      return 0.70; // Default moderate accuracy
    }
  }

  private getSourceReliabilityScore(source: string): number {
    const reliabilityMap: { [key: string]: number } = {
      'defender': 0.95,
      'servicenow': 0.90,
      'jira': 0.80,
      'threat_intel': 0.85,
      'asset_monitor': 0.88,
      'manual': 0.98,
      'system': 0.85
    };

    return reliabilityMap[source] || 0.60;
  }

  private isHighCriticalityOverride(risk: any, factors: any): boolean {
    // Override for critical assets or services
    return factors.business_impact >= 0.9 || 
           factors.severity_level >= 0.9 ||
           (risk.asset_criticality === 'critical') ||
           (risk.service_criticality === 'critical');
  }

  private isComplianceOverride(risk: any): boolean {
    // Override for compliance-related risks
    return risk.risk_type === 'compliance' ||
           (risk.description && risk.description.toLowerCase().includes('compliance'));
  }

  private calculateOverdueHours(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    return Math.round((now.getTime() - due.getTime()) / (1000 * 60 * 60));
  }

  private getEscalationTarget(priority: string): string {
    const escalationMap: { [key: string]: string } = {
      'urgent': 'security_manager',
      'high': 'senior_analyst',
      'medium': 'team_lead',
      'low': 'supervisor'
    };

    return escalationMap[priority] || 'team_lead';
  }
}