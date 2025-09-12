// WebSocket API Routes
// Handles WebSocket connections for real-time TI and risk updates

import { Hono } from 'hono';
import { upgradeWebSocket } from 'hono/cloudflare-workers';
import { requireAuth } from '../middleware/auth';
import { initializeWebSocketManager, getWebSocketManager } from '../services/websocket-manager';

const apiWebSocketRoutes = new Hono();

// WebSocket endpoint for real-time updates
apiWebSocketRoutes.get('/live-updates', 
  upgradeWebSocket((c) => {
    const db = c.env?.DB;
    if (!db) {
      throw new Error('Database binding not available');
    }

    // Initialize WebSocket manager
    const wsManager = initializeWebSocketManager(db);
    const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    return {
      onOpen(event, ws) {
        console.log(`WebSocket opened: ${connectionId}`);
        
        // Get subscription filters from query parameters
        const url = new URL(c.req.url);
        const types = url.searchParams.get('types')?.split(',');
        const severity = url.searchParams.get('severity')?.split(',');
        const categories = url.searchParams.get('categories')?.split(',');
        
        const filter = {
          types: types || undefined,
          severity: severity || undefined, 
          categories: categories || undefined,
          user_id: 1 // This would come from authentication
        };

        wsManager.registerConnection(connectionId, ws, filter);
      },

      onMessage(event, ws) {
        try {
          const message = JSON.parse(event.data.toString());
          console.log(`WebSocket message from ${connectionId}:`, message);
          
          // Handle client messages (ping, subscription updates, etc.)
          if (message.type === 'ping') {
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
          }
        } catch (error) {
          console.error(`Error processing WebSocket message from ${connectionId}:`, error);
        }
      },

      onClose(event, ws) {
        console.log(`WebSocket closed: ${connectionId}`);
        wsManager.unregisterConnection(connectionId);
      },

      onError(event, ws) {
        console.error(`WebSocket error for ${connectionId}:`, event);
        wsManager.unregisterConnection(connectionId);
      }
    };
  })
);

// WebSocket status endpoint
apiWebSocketRoutes.get('/status', async (c) => {
  try {
    const wsManager = getWebSocketManager();
    
    if (!wsManager) {
      return c.json({
        success: false,
        error: 'WebSocket manager not initialized'
      }, 503);
    }

    const stats = wsManager.getStats();
    
    return c.json({
      success: true,
      data: {
        websocket_enabled: true,
        ...stats,
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting WebSocket status:', error);
    return c.json({
      success: false,
      error: 'Failed to get WebSocket status'
    }, 500);
  }
});

// Trigger test notification (for debugging)
apiWebSocketRoutes.post('/test-notification', requireAuth, async (c) => {
  try {
    const wsManager = getWebSocketManager();
    const { type, data } = await c.req.json();
    
    if (!wsManager) {
      return c.json({
        success: false,
        error: 'WebSocket manager not initialized'
      }, 503);
    }

    // Send test notification
    wsManager.broadcast({
      type: type || 'system_status',
      data: data || { message: 'Test notification', test: true },
      timestamp: new Date().toISOString(),
      priority: 'low'
    });

    return c.json({
      success: true,
      message: 'Test notification sent',
      recipients: wsManager.getStats().active_connections
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return c.json({
      success: false,
      error: 'Failed to send test notification'
    }, 500);
  }
});

export { apiWebSocketRoutes };