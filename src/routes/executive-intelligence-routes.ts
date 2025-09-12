import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ExecutiveIntelligenceService } from '../services/executive-intelligence-service'
import type { D1Database } from '@cloudflare/workers-types'

const app = new Hono<{ Bindings: { DB: D1Database } }>()
app.use('*', cors())

// Initialize Executive Intelligence Service
const getExecutiveService = (db: D1Database) => new ExecutiveIntelligenceService(db)

// Generate executive summary
app.get('/executive/summary/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))

    const executiveService = getExecutiveService(c.env.DB)
    const summary = await executiveService.generateExecutiveSummary(organizationId)

    return c.json({
      success: true,
      summary,
      message: 'Executive summary generated successfully'
    })
  } catch (error) {
    console.error('Executive summary error:', error)
    return c.json({ error: 'Failed to generate executive summary' }, 500)
  }
})

// Generate board report
app.post('/executive/board-report', async (c) => {
  try {
    const { organizationId, reportingPeriod, boardMeetingDate } = await c.req.json()
    
    if (!organizationId || !reportingPeriod || !boardMeetingDate) {
      return c.json({ error: 'Organization ID, reporting period, and board meeting date are required' }, 400)
    }

    const executiveService = getExecutiveService(c.env.DB)
    const boardReport = await executiveService.generateBoardReport(organizationId, reportingPeriod, boardMeetingDate)

    return c.json({
      success: true,
      boardReport,
      message: 'Board report generated successfully'
    })
  } catch (error) {
    console.error('Board report error:', error)
    return c.json({ error: 'Failed to generate board report' }, 500)
  }
})

// Generate predictive analysis
app.get('/executive/predictive-analysis/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const forecastPeriod = c.req.query('forecastPeriod') || '6 months'

    const executiveService = getExecutiveService(c.env.DB)
    const predictiveAnalysis = await executiveService.generatePredictiveAnalysis(organizationId, forecastPeriod)

    return c.json({
      success: true,
      predictiveAnalysis,
      message: `Predictive analysis generated for ${forecastPeriod}`
    })
  } catch (error) {
    console.error('Predictive analysis error:', error)
    return c.json({ error: 'Failed to generate predictive analysis' }, 500)
  }
})

// Generate strategic recommendations
app.post('/executive/strategic-recommendations', async (c) => {
  try {
    const { organizationId, focusAreas } = await c.req.json()
    
    if (!organizationId || !focusAreas) {
      return c.json({ error: 'Organization ID and focus areas are required' }, 400)
    }

    const executiveService = getExecutiveService(c.env.DB)
    const recommendations = await executiveService.generateStrategicRecommendations(organizationId, focusAreas)

    return c.json({
      success: true,
      recommendations,
      message: `Generated ${recommendations.length} strategic recommendations`
    })
  } catch (error) {
    console.error('Strategic recommendations error:', error)
    return c.json({ error: 'Failed to generate strategic recommendations' }, 500)
  }
})

// Get executive intelligence dashboard
app.get('/executive/dashboard/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))

    const executiveService = getExecutiveService(c.env.DB)
    const dashboard = await executiveService.getExecutiveIntelligenceDashboard(organizationId)

    return c.json({
      success: true,
      dashboard,
      message: 'Executive intelligence dashboard retrieved'
    })
  } catch (error) {
    console.error('Executive dashboard error:', error)
    return c.json({ error: 'Failed to get executive dashboard' }, 500)
  }
})

// Generate regulatory intelligence report
app.get('/executive/regulatory-intelligence/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const frameworks = c.req.query('frameworks')?.split(',') || []

    const executiveService = getExecutiveService(c.env.DB)
    const regulatoryIntelligence = await executiveService.generateRegulatoryIntelligence(organizationId, frameworks)

    return c.json({
      success: true,
      regulatoryIntelligence,
      message: 'Regulatory intelligence report generated'
    })
  } catch (error) {
    console.error('Regulatory intelligence error:', error)
    return c.json({ error: 'Failed to generate regulatory intelligence' }, 500)
  }
})

// Get competitive intelligence analysis
app.get('/executive/competitive-analysis/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const industry = c.req.query('industry') || ''

    const executiveService = getExecutiveService(c.env.DB)
    const competitiveAnalysis = await executiveService.generateCompetitiveIntelligence(organizationId, industry)

    return c.json({
      success: true,
      competitiveAnalysis,
      message: 'Competitive intelligence analysis generated'
    })
  } catch (error) {
    console.error('Competitive analysis error:', error)
    return c.json({ error: 'Failed to generate competitive analysis' }, 500)
  }
})

// Generate executive briefing
app.post('/executive/briefing', async (c) => {
  try {
    const { organizationId, briefingType, topics, urgencyLevel } = await c.req.json()
    
    if (!organizationId || !briefingType || !topics) {
      return c.json({ error: 'Organization ID, briefing type, and topics are required' }, 400)
    }

    const executiveService = getExecutiveService(c.env.DB)
    const briefing = await executiveService.generateExecutiveBriefing(organizationId, briefingType, topics, urgencyLevel)

    return c.json({
      success: true,
      briefing,
      message: `Executive briefing generated: ${briefingType}`
    })
  } catch (error) {
    console.error('Executive briefing error:', error)
    return c.json({ error: 'Failed to generate executive briefing' }, 500)
  }
})

// Get executive metrics and KPIs
app.get('/executive/metrics/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const timeframe = c.req.query('timeframe') || '30 days'

    const executiveService = getExecutiveService(c.env.DB)
    const metrics = await executiveService.getExecutiveMetrics(organizationId, timeframe)

    return c.json({
      success: true,
      metrics,
      message: `Executive metrics retrieved for ${timeframe}`
    })
  } catch (error) {
    console.error('Executive metrics error:', error)
    return c.json({ error: 'Failed to get executive metrics' }, 500)
  }
})

export default app