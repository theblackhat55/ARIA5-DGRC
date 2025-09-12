import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { IntegrationPlatformService } from '../services/integration-platform-service'
import type { D1Database } from '@cloudflare/workers-types'

const app = new Hono<{ Bindings: { DB: D1Database } }>()
app.use('*', cors())

// Initialize Integration Platform Service
const getIntegrationService = (db: D1Database) => new IntegrationPlatformService(db)

// Create integration connector
app.post('/integrations/connectors', async (c) => {
  try {
    const { connectorConfig, organizationId } = await c.req.json()
    
    if (!connectorConfig || !organizationId) {
      return c.json({ error: 'Connector configuration and organization ID are required' }, 400)
    }

    const integrationService = getIntegrationService(c.env.DB)
    const connector = await integrationService.createIntegrationConnector(connectorConfig, organizationId)

    return c.json({
      success: true,
      connector,
      message: `Integration connector created: ${connector.name}`
    })
  } catch (error) {
    console.error('Integration connector error:', error)
    return c.json({ error: 'Failed to create integration connector' }, 500)
  }
})

// Create partner integration
app.post('/integrations/partners', async (c) => {
  try {
    const partnerConfig = await c.req.json()
    
    if (!partnerConfig.name || !partnerConfig.type) {
      return c.json({ error: 'Partner name and type are required' }, 400)
    }

    const integrationService = getIntegrationService(c.env.DB)
    const partner = await integrationService.createPartnerIntegration(partnerConfig)

    return c.json({
      success: true,
      partner,
      message: `Partner integration created: ${partner.name}`
    })
  } catch (error) {
    console.error('Partner integration error:', error)
    return c.json({ error: 'Failed to create partner integration' }, 500)
  }
})

// Create data flow orchestration
app.post('/integrations/data-flows', async (c) => {
  try {
    const { flowConfig, organizationId } = await c.req.json()
    
    if (!flowConfig || !organizationId) {
      return c.json({ error: 'Flow configuration and organization ID are required' }, 400)
    }

    const integrationService = getIntegrationService(c.env.DB)
    const dataFlow = await integrationService.createDataFlowOrchestration(flowConfig, organizationId)

    return c.json({
      success: true,
      dataFlow,
      message: `Data flow orchestration created: ${dataFlow.name}`
    })
  } catch (error) {
    console.error('Data flow orchestration error:', error)
    return c.json({ error: 'Failed to create data flow orchestration' }, 500)
  }
})

// Get integration marketplace
app.get('/integrations/marketplace/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const category = c.req.query('category') || undefined

    const integrationService = getIntegrationService(c.env.DB)
    const marketplace = await integrationService.getIntegrationMarketplace(organizationId, category)

    return c.json({
      success: true,
      marketplace,
      message: 'Integration marketplace retrieved successfully'
    })
  } catch (error) {
    console.error('Integration marketplace error:', error)
    return c.json({ error: 'Failed to get integration marketplace' }, 500)
  }
})

// Get connector catalog
app.get('/integrations/catalog', async (c) => {
  try {
    const category = c.req.query('category') || undefined
    const search = c.req.query('search') || undefined

    const integrationService = getIntegrationService(c.env.DB)
    const catalog = await integrationService.getConnectorCatalog(category, search)

    return c.json({
      success: true,
      catalog,
      message: 'Connector catalog retrieved successfully'
    })
  } catch (error) {
    console.error('Connector catalog error:', error)
    return c.json({ error: 'Failed to get connector catalog' }, 500)
  }
})

// Configure integration settings
app.put('/integrations/connectors/:connectorId/config', async (c) => {
  try {
    const connectorId = c.req.param('connectorId')
    const configUpdates = await c.req.json()

    const integrationService = getIntegrationService(c.env.DB)
    const updatedConfig = await integrationService.configureIntegrationSettings(connectorId, configUpdates)

    return c.json({
      success: true,
      configuration: updatedConfig,
      message: `Integration settings updated for connector ${connectorId}`
    })
  } catch (error) {
    console.error('Integration configuration error:', error)
    return c.json({ error: 'Failed to update integration settings' }, 500)
  }
})

// Test integration connection
app.post('/integrations/connectors/:connectorId/test', async (c) => {
  try {
    const connectorId = c.req.param('connectorId')

    const integrationService = getIntegrationService(c.env.DB)
    const testResult = await integrationService.testIntegrationConnection(connectorId)

    return c.json({
      success: true,
      testResult,
      message: `Integration connection test completed for ${connectorId}`
    })
  } catch (error) {
    console.error('Integration test error:', error)
    return c.json({ error: 'Failed to test integration connection' }, 500)
  }
})

// Get integration analytics
app.get('/integrations/analytics/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const timeframe = c.req.query('timeframe') || '30 days'

    const integrationService = getIntegrationService(c.env.DB)
    const analytics = await integrationService.getIntegrationAnalytics(organizationId, timeframe)

    return c.json({
      success: true,
      analytics,
      message: `Integration analytics retrieved for ${timeframe}`
    })
  } catch (error) {
    console.error('Integration analytics error:', error)
    return c.json({ error: 'Failed to get integration analytics' }, 500)
  }
})

// Manage integration workflows
app.post('/integrations/workflows', async (c) => {
  try {
    const { workflowConfig, organizationId } = await c.req.json()
    
    if (!workflowConfig || !organizationId) {
      return c.json({ error: 'Workflow configuration and organization ID are required' }, 400)
    }

    const integrationService = getIntegrationService(c.env.DB)
    const workflow = await integrationService.createIntegrationWorkflow(workflowConfig, organizationId)

    return c.json({
      success: true,
      workflow,
      message: `Integration workflow created: ${workflow.name}`
    })
  } catch (error) {
    console.error('Integration workflow error:', error)
    return c.json({ error: 'Failed to create integration workflow' }, 500)
  }
})

// Get data sync status
app.get('/integrations/sync-status/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))

    const integrationService = getIntegrationService(c.env.DB)
    const syncStatus = await integrationService.getDataSyncStatus(organizationId)

    return c.json({
      success: true,
      syncStatus,
      message: 'Data sync status retrieved successfully'
    })
  } catch (error) {
    console.error('Data sync status error:', error)
    return c.json({ error: 'Failed to get data sync status' }, 500)
  }
})

// Execute integration action
app.post('/integrations/actions/:connectorId/execute', async (c) => {
  try {
    const connectorId = c.req.param('connectorId')
    const { action, parameters } = await c.req.json()
    
    if (!action) {
      return c.json({ error: 'Action is required' }, 400)
    }

    const integrationService = getIntegrationService(c.env.DB)
    const result = await integrationService.executeIntegrationAction(connectorId, action, parameters)

    return c.json({
      success: true,
      result,
      message: `Integration action executed: ${action}`
    })
  } catch (error) {
    console.error('Integration action error:', error)
    return c.json({ error: 'Failed to execute integration action' }, 500)
  }
})

// Get integration performance metrics
app.get('/integrations/performance/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const timeframe = c.req.query('timeframe') || '7 days'

    const integrationService = getIntegrationService(c.env.DB)
    const performance = await integrationService.getIntegrationPerformanceMetrics(organizationId, timeframe)

    return c.json({
      success: true,
      performance,
      message: `Integration performance metrics retrieved for ${timeframe}`
    })
  } catch (error) {
    console.error('Integration performance error:', error)
    return c.json({ error: 'Failed to get integration performance metrics' }, 500)
  }
})

// Manage integration security
app.put('/integrations/security/:connectorId', async (c) => {
  try {
    const connectorId = c.req.param('connectorId')
    const securityConfig = await c.req.json()

    const integrationService = getIntegrationService(c.env.DB)
    const security = await integrationService.manageIntegrationSecurity(connectorId, securityConfig)

    return c.json({
      success: true,
      security,
      message: `Integration security updated for ${connectorId}`
    })
  } catch (error) {
    console.error('Integration security error:', error)
    return c.json({ error: 'Failed to update integration security' }, 500)
  }
})

export default app