import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { EvidenceCollectionEngine } from '../services/evidence-collection-engine'
import type { D1Database } from '@cloudflare/workers-types'

const app = new Hono<{ Bindings: { DB: D1Database } }>()
app.use('*', cors())

// Initialize Evidence Collection Engine
const getEvidenceEngine = (db: D1Database) => new EvidenceCollectionEngine(db)

// Collect compliance evidence for specific frameworks
app.post('/evidence/collect', async (c) => {
  try {
    const { framework, requirements } = await c.req.json()
    
    if (!framework || !requirements) {
      return c.json({ error: 'Framework and requirements are required' }, 400)
    }

    const evidenceEngine = getEvidenceEngine(c.env.DB)
    const evidence = await evidenceEngine.collectComplianceEvidence(framework, requirements)

    return c.json({
      success: true,
      evidence,
      message: `Collected ${evidence.length} evidence items for ${framework}`
    })
  } catch (error) {
    console.error('Evidence collection error:', error)
    return c.json({ error: 'Failed to collect evidence' }, 500)
  }
})

// Generate comprehensive audit package
app.post('/evidence/audit-package', async (c) => {
  try {
    const { title, scope, frameworks, userId } = await c.req.json()
    
    if (!title || !scope || !frameworks || !userId) {
      return c.json({ error: 'Title, scope, frameworks, and userId are required' }, 400)
    }

    const evidenceEngine = getEvidenceEngine(c.env.DB)
    const auditPackage = await evidenceEngine.generateAuditPackage(title, scope, frameworks, userId)

    return c.json({
      success: true,
      auditPackage,
      message: `Generated audit package: ${title}`
    })
  } catch (error) {
    console.error('Audit package generation error:', error)
    return c.json({ error: 'Failed to generate audit package' }, 500)
  }
})

// Validate evidence completeness
app.post('/evidence/validate/:auditPackageId', async (c) => {
  try {
    const auditPackageId = c.req.param('auditPackageId')
    const { organizationId } = await c.req.json()
    
    if (!organizationId) {
      return c.json({ error: 'Organization ID is required' }, 400)
    }

    const evidenceEngine = getEvidenceEngine(c.env.DB)
    const validation = await evidenceEngine.validateEvidenceCompleteness(auditPackageId, organizationId)

    return c.json({
      success: true,
      validation,
      message: `Evidence validation completed for package ${auditPackageId}`
    })
  } catch (error) {
    console.error('Evidence validation error:', error)
    return c.json({ error: 'Failed to validate evidence' }, 500)
  }
})

// Get evidence collection recommendations
app.get('/evidence/recommendations/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const frameworks = c.req.query('frameworks')?.split(',') || []

    const evidenceEngine = getEvidenceEngine(c.env.DB)
    const recommendations = await evidenceEngine.getEvidenceCollectionRecommendations(organizationId, frameworks)

    return c.json({
      success: true,
      recommendations,
      message: `Retrieved ${recommendations.length} evidence collection recommendations`
    })
  } catch (error) {
    console.error('Evidence recommendations error:', error)
    return c.json({ error: 'Failed to get evidence recommendations' }, 500)
  }
})

// Get evidence collection analytics
app.get('/evidence/analytics/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))

    const evidenceEngine = getEvidenceEngine(c.env.DB)
    const analytics = await evidenceEngine.getEvidenceAnalytics(organizationId)

    return c.json({
      success: true,
      analytics,
      message: 'Evidence collection analytics retrieved'
    })
  } catch (error) {
    console.error('Evidence analytics error:', error)
    return c.json({ error: 'Failed to get evidence analytics' }, 500)
  }
})

// Auto-collect evidence based on risk changes
app.post('/evidence/auto-collect', async (c) => {
  try {
    const { organizationId, riskIds, frameworks } = await c.req.json()
    
    if (!organizationId || !riskIds || !frameworks) {
      return c.json({ error: 'Organization ID, risk IDs, and frameworks are required' }, 400)
    }

    const evidenceEngine = getEvidenceEngine(c.env.DB)
    const collectedEvidence = await evidenceEngine.autoCollectEvidenceForRisks(organizationId, riskIds, frameworks)

    return c.json({
      success: true,
      collectedEvidence,
      message: `Auto-collected evidence for ${riskIds.length} risks`
    })
  } catch (error) {
    console.error('Auto evidence collection error:', error)
    return c.json({ error: 'Failed to auto-collect evidence' }, 500)
  }
})

// Get evidence collection status
app.get('/evidence/status/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))

    const evidenceEngine = getEvidenceEngine(c.env.DB)
    const status = await evidenceEngine.getEvidenceCollectionStatus(organizationId)

    return c.json({
      success: true,
      status,
      message: 'Evidence collection status retrieved'
    })
  } catch (error) {
    console.error('Evidence status error:', error)
    return c.json({ error: 'Failed to get evidence status' }, 500)
  }
})

export default app