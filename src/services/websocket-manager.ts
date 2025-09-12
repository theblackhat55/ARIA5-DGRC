// WebSocket Manager for Real-time TI Updates
// Handles real-time notifications and live dashboard updates

export interface WebSocketMessage {
  type: 'ti_update' | 'risk_alert' | 'validation_request' | 'system_status' | 'correlation_found';
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SubscriptionFilter {
  types?: string[];
  severity?: string[];
  categories?: string[];
  user_id?: number;
}

export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, SubscriptionFilter> = new Map();
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Register a new WebSocket connection
   */
  registerConnection(connectionId: string, ws: WebSocket, filter?: SubscriptionFilter): void {
    this.connections.set(connectionId, ws);
    
    if (filter) {
      this.subscriptions.set(connectionId, filter);
    }

    // Setup connection handlers
    ws.addEventListener('close', () => {
      this.unregisterConnection(connectionId);
    });

    ws.addEventListener('error', (error) => {
      console.error(`WebSocket error for connection ${connectionId}:`, error);
      this.unregisterConnection(connectionId);
    });

    // Send initial status
    this.sendToConnection(connectionId, {
      type: 'system_status',
      data: { status: 'connected', connection_id: connectionId },
      timestamp: new Date().toISOString(),
      priority: 'low'
    });

    console.log(`WebSocket connection registered: ${connectionId}`);
  }

  /**
   * Unregister a WebSocket connection
   */
  unregisterConnection(connectionId: string): void {
    this.connections.delete(connectionId);
    this.subscriptions.delete(connectionId);
    console.log(`WebSocket connection unregistered: ${connectionId}`);
  }

  /**
   * Send message to specific connection
   */
  sendToConnection(connectionId: string, message: WebSocketMessage): void {
    const ws = this.connections.get(connectionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send message to connection ${connectionId}:`, error);
        this.unregisterConnection(connectionId);
      }
    }
  }

  /**
   * Broadcast message to all connections
   */
  broadcast(message: WebSocketMessage): void {
    for (const [connectionId, ws] of this.connections) {
      if (this.shouldSendToConnection(connectionId, message)) {
        this.sendToConnection(connectionId, message);
      }
    }
  }

  /**
   * Broadcast to filtered connections
   */
  broadcastFiltered(message: WebSocketMessage, filter: (connectionId: string, subscription: SubscriptionFilter) => boolean): void {
    for (const [connectionId, subscription] of this.subscriptions) {
      if (filter(connectionId, subscription) && this.shouldSendToConnection(connectionId, message)) {
        this.sendToConnection(connectionId, message);
      }
    }
  }

  /**
   * Check if message should be sent to connection based on subscription
   */
  private shouldSendToConnection(connectionId: string, message: WebSocketMessage): boolean {
    const subscription = this.subscriptions.get(connectionId);
    if (!subscription) return true; // No filter, send all

    // Filter by message type
    if (subscription.types && !subscription.types.includes(message.type)) {
      return false;
    }

    // Filter by severity (for risk alerts)
    if (subscription.severity && message.data.severity && !subscription.severity.includes(message.data.severity)) {
      return false;
    }

    // Filter by category
    if (subscription.categories && message.data.category && !subscription.categories.includes(message.data.category)) {
      return false;
    }

    return true;
  }

  /**
   * Send TI update notification
   */
  async notifyTIUpdate(sourceId: number, indicatorsCount: number, criticalCount: number): Promise<void> {
    try {
      const source = await this.db.prepare('SELECT name FROM ti_sources WHERE id = ?').bind(sourceId).first();
      
      const message: WebSocketMessage = {
        type: 'ti_update',
        data: {
          source_id: sourceId,
          source_name: source?.name || 'Unknown',
          indicators_count: indicatorsCount,
          critical_count: criticalCount,
          update_time: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        priority: criticalCount > 0 ? 'high' : 'medium'
      };

      this.broadcast(message);
    } catch (error) {
      console.error('Failed to notify TI update:', error);
    }
  }

  /**
   * Send risk alert notification
   */
  async notifyRiskAlert(riskId: number, alertType: 'new' | 'updated' | 'escalated'): Promise<void> {
    try {
      const risk = await this.db.prepare(`
        SELECT id, title, category, risk_score, ti_enriched, risk_lifecycle_stage
        FROM risks WHERE id = ?
      `).bind(riskId).first();

      if (!risk) return;

      const message: WebSocketMessage = {
        type: 'risk_alert',
        data: {
          alert_type: alertType,
          risk_id: riskId,
          risk_title: risk.title,
          category: risk.category,
          risk_score: risk.risk_score,
          ti_enriched: risk.ti_enriched,
          lifecycle_stage: risk.risk_lifecycle_stage
        },
        timestamp: new Date().toISOString(),
        priority: risk.risk_score > 80 ? 'critical' : risk.risk_score > 60 ? 'high' : 'medium'
      };

      this.broadcast(message);
    } catch (error) {
      console.error('Failed to notify risk alert:', error);
    }
  }

  /**
   * Send validation request notification
   */
  async notifyValidationRequest(riskId: number, validatorId?: number): Promise<void> {
    try {
      const risk = await this.db.prepare(`
        SELECT id, title, category, risk_score, confidence_score
        FROM risks WHERE id = ?
      `).bind(riskId).first();

      if (!risk) return;

      const message: WebSocketMessage = {
        type: 'validation_request',
        data: {
          risk_id: riskId,
          risk_title: risk.title,
          category: risk.category,
          risk_score: risk.risk_score,
          validator_id: validatorId,
          requires_attention: true
        },
        timestamp: new Date().toISOString(),
        priority: 'high'
      };

      // Send to specific validator if specified, otherwise broadcast
      if (validatorId) {
        this.broadcastFiltered(message, (connectionId, subscription) => 
          subscription.user_id === validatorId
        );
      } else {
        this.broadcast(message);
      }
    } catch (error) {
      console.error('Failed to notify validation request:', error);
    }
  }

  /**
   * Send correlation found notification
   */
  async notifyCorrelationFound(riskId: number, indicatorId: number, relevanceScore: number): Promise<void> {
    try {
      const correlationData = await this.db.prepare(`
        SELECT r.title as risk_title, ti.identifier, ti.severity
        FROM risks r, ti_indicators ti
        WHERE r.id = ? AND ti.id = ?
      `).bind(riskId, indicatorId).first();

      if (!correlationData) return;

      const message: WebSocketMessage = {
        type: 'correlation_found',
        data: {
          risk_id: riskId,
          indicator_id: indicatorId,
          risk_title: correlationData.risk_title,
          indicator_identifier: correlationData.identifier,
          relevance_score: relevanceScore,
          severity: correlationData.severity
        },
        timestamp: new Date().toISOString(),
        priority: relevanceScore > 0.8 ? 'high' : 'medium'
      };

      this.broadcast(message);
    } catch (error) {
      console.error('Failed to notify correlation found:', error);
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    total_connections: number;
    active_connections: number;
    subscriptions_count: number;
    connection_ids: string[];
  } {
    const activeConnections = Array.from(this.connections.entries()).filter(
      ([_, ws]) => ws.readyState === WebSocket.OPEN
    ).length;

    return {
      total_connections: this.connections.size,
      active_connections: activeConnections,
      subscriptions_count: this.subscriptions.size,
      connection_ids: Array.from(this.connections.keys())
    };
  }

  /**
   * Cleanup inactive connections
   */
  cleanup(): void {
    for (const [connectionId, ws] of this.connections) {
      if (ws.readyState !== WebSocket.OPEN) {
        this.unregisterConnection(connectionId);
      }
    }
  }

  /**
   * Send periodic heartbeat to all connections
   */
  heartbeat(): void {
    const message: WebSocketMessage = {
      type: 'system_status',
      data: { 
        heartbeat: true,
        timestamp: new Date().toISOString(),
        connections: this.getStats().active_connections
      },
      timestamp: new Date().toISOString(),
      priority: 'low'
    };

    this.broadcast(message);
  }
}

// Global WebSocket manager instance (will be initialized with DB)
let wsManager: WebSocketManager | null = null;

export function initializeWebSocketManager(db: D1Database): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(db);
    
    // Setup periodic cleanup and heartbeat
    setInterval(() => {
      wsManager?.cleanup();
      wsManager?.heartbeat();
    }, 30000); // Every 30 seconds
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}