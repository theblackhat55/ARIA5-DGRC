import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { EnterpriseScaleService } from '../services/enterprise-scale-service'
import type { D1Database } from '@cloudflare/workers-types'

const app = new Hono<{ Bindings: { DB: D1Database } }>()
app.use('*', cors())

// Initialize Enterprise Scale Service
const getEnterpriseService = (db: D1Database) => new EnterpriseScaleService(db)

// Create new tenant
app.post('/enterprise/tenants', async (c) => {
  try {
    const { organizationName, subscriptionTier, adminEmail, requirements } = await c.req.json()
    
    if (!organizationName || !subscriptionTier || !adminEmail) {
      return c.json({ error: 'Organization name, subscription tier, and admin email are required' }, 400)
    }

    const enterpriseService = getEnterpriseService(c.env.DB)
    const tenant = await enterpriseService.createTenant(organizationName, subscriptionTier, adminEmail, requirements)

    return c.json({
      success: true,
      tenant,
      message: `Tenant created successfully: ${organizationName}`
    })
  } catch (error) {
    console.error('Tenant creation error:', error)
    return c.json({ error: 'Failed to create tenant' }, 500)
  }
})

// Get scalability metrics
app.get('/enterprise/scalability-metrics', async (c) => {
  try {
    const enterpriseService = getEnterpriseService(c.env.DB)
    const metrics = await enterpriseService.getScalabilityMetrics()

    return c.json({
      success: true,
      metrics,
      message: 'Scalability metrics retrieved successfully'
    })
  } catch (error) {
    console.error('Scalability metrics error:', error)
    return c.json({ error: 'Failed to get scalability metrics' }, 500)
  }
})

// Deploy enterprise instance
app.post('/enterprise/deploy', async (c) => {
  try {
    const { tenantId, deploymentConfig } = await c.req.json()
    
    if (!tenantId || !deploymentConfig) {
      return c.json({ error: 'Tenant ID and deployment configuration are required' }, 400)
    }

    const enterpriseService = getEnterpriseService(c.env.DB)
    const deployment = await enterpriseService.deployEnterpriseInstance(tenantId, deploymentConfig)

    return c.json({
      success: true,
      deployment,
      message: `Enterprise instance deployed for tenant ${tenantId}`
    })
  } catch (error) {
    console.error('Enterprise deployment error:', error)
    return c.json({ error: 'Failed to deploy enterprise instance' }, 500)
  }
})

// Manage tenant configuration
app.put('/enterprise/tenants/:tenantId/config', async (c) => {
  try {
    const tenantId = c.req.param('tenantId')
    const configUpdates = await c.req.json()

    const enterpriseService = getEnterpriseService(c.env.DB)
    const updatedConfig = await enterpriseService.manageTenantConfiguration(tenantId, configUpdates)

    return c.json({
      success: true,
      configuration: updatedConfig,
      message: `Tenant configuration updated for ${tenantId}`
    })
  } catch (error) {
    console.error('Tenant configuration error:', error)
    return c.json({ error: 'Failed to update tenant configuration' }, 500)
  }
})

// Get tenant configuration
app.get('/enterprise/tenants/:tenantId/config', async (c) => {
  try {
    const tenantId = c.req.param('tenantId')

    const enterpriseService = getEnterpriseService(c.env.DB)
    const configuration = await enterpriseService.getTenantConfiguration(tenantId)

    return c.json({
      success: true,
      configuration,
      message: `Tenant configuration retrieved for ${tenantId}`
    })
  } catch (error) {
    console.error('Get tenant configuration error:', error)
    return c.json({ error: 'Failed to get tenant configuration' }, 500)
  }
})

// Get enterprise monitoring dashboard
app.get('/enterprise/monitoring/:tenantId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId')
    const timeframe = c.req.query('timeframe') || '24 hours'

    const enterpriseService = getEnterpriseService(c.env.DB)
    const monitoring = await enterpriseService.getEnterpriseMonitoring(tenantId, timeframe)

    return c.json({
      success: true,
      monitoring,
      message: `Enterprise monitoring data retrieved for ${timeframe}`
    })
  } catch (error) {
    console.error('Enterprise monitoring error:', error)
    return c.json({ error: 'Failed to get enterprise monitoring data' }, 500)
  }
})

// Configure SSO integration
app.post('/enterprise/sso/:tenantId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId')
    const ssoConfig = await c.req.json()
    
    if (!ssoConfig.provider || !ssoConfig.configuration) {
      return c.json({ error: 'SSO provider and configuration are required' }, 400)
    }

    const enterpriseService = getEnterpriseService(c.env.DB)
    const ssoIntegration = await enterpriseService.configureSSOIntegration(tenantId, ssoConfig)

    return c.json({
      success: true,
      ssoIntegration,
      message: `SSO integration configured for ${tenantId}`
    })
  } catch (error) {
    console.error('SSO configuration error:', error)
    return c.json({ error: 'Failed to configure SSO integration' }, 500)
  }
})

// Manage custom branding
app.post('/enterprise/branding/:tenantId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId')
    const brandingConfig = await c.req.json()

    const enterpriseService = getEnterpriseService(c.env.DB)
    const branding = await enterpriseService.manageCustomBranding(tenantId, brandingConfig)

    return c.json({
      success: true,
      branding,
      message: `Custom branding configured for ${tenantId}`
    })
  } catch (error) {
    console.error('Custom branding error:', error)
    return c.json({ error: 'Failed to configure custom branding' }, 500)
  }
})

// Get enterprise security settings
app.get('/enterprise/security/:tenantId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId')

    const enterpriseService = getEnterpriseService(c.env.DB)
    const security = await enterpriseService.getEnterpriseSecuritySettings(tenantId)

    return c.json({
      success: true,
      security,
      message: `Enterprise security settings retrieved for ${tenantId}`
    })
  } catch (error) {
    console.error('Enterprise security error:', error)
    return c.json({ error: 'Failed to get enterprise security settings' }, 500)
  }
})

// Update enterprise security settings
app.put('/enterprise/security/:tenantId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId')
    const securityUpdates = await c.req.json()

    const enterpriseService = getEnterpriseService(c.env.DB)
    const updatedSecurity = await enterpriseService.updateEnterpriseSecuritySettings(tenantId, securityUpdates)

    return c.json({
      success: true,
      security: updatedSecurity,
      message: `Enterprise security settings updated for ${tenantId}`
    })
  } catch (error) {
    console.error('Enterprise security update error:', error)
    return c.json({ error: 'Failed to update enterprise security settings' }, 500)
  }
})

// Get tenant analytics
app.get('/enterprise/analytics/:tenantId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId')
    const timeframe = c.req.query('timeframe') || '30 days'

    const enterpriseService = getEnterpriseService(c.env.DB)
    const analytics = await enterpriseService.getTenantAnalytics(tenantId, timeframe)

    return c.json({
      success: true,
      analytics,
      message: `Tenant analytics retrieved for ${timeframe}`
    })
  } catch (error) {
    console.error('Tenant analytics error:', error)
    return c.json({ error: 'Failed to get tenant analytics' }, 500)
  }
})

export default app