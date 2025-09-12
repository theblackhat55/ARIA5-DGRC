import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { AdvancedAnalyticsEngine } from '../services/advanced-analytics-engine'
import type { D1Database } from '@cloudflare/workers-types'

const app = new Hono<{ Bindings: { DB: D1Database } }>()
app.use('*', cors())

// Initialize Advanced Analytics Engine
const getAnalyticsEngine = (db: D1Database) => new AdvancedAnalyticsEngine(db)

// Generate predictive analytics
app.get('/analytics/predictive/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))

    const analyticsEngine = getAnalyticsEngine(c.env.DB)
    const predictiveAnalytics = await analyticsEngine.generatePredictiveAnalytics(organizationId)

    return c.json({
      success: true,
      predictiveAnalytics,
      message: 'Predictive analytics generated successfully'
    })
  } catch (error) {
    console.error('Predictive analytics error:', error)
    return c.json({ error: 'Failed to generate predictive analytics' }, 500)
  }
})

// Generate mobile dashboard
app.get('/analytics/mobile-dashboard/:organizationId/:userId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const userId = c.req.param('userId')

    const analyticsEngine = getAnalyticsEngine(c.env.DB)
    const mobileDashboard = await analyticsEngine.generateMobileDashboard(organizationId, userId)

    return c.json({
      success: true,
      mobileDashboard,
      message: 'Mobile dashboard generated successfully'
    })
  } catch (error) {
    console.error('Mobile dashboard error:', error)
    return c.json({ error: 'Failed to generate mobile dashboard' }, 500)
  }
})

// Train predictive models
app.post('/analytics/train-models/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))

    const analyticsEngine = getAnalyticsEngine(c.env.DB)
    const models = await analyticsEngine.trainPredictiveModels(organizationId)

    return c.json({
      success: true,
      models,
      message: `Trained ${models.length} predictive models`
    })
  } catch (error) {
    console.error('Model training error:', error)
    return c.json({ error: 'Failed to train predictive models' }, 500)
  }
})

// Generate cross-platform analytics
app.post('/analytics/cross-platform', async (c) => {
  try {
    const { organizationId, platforms } = await c.req.json()
    
    if (!organizationId || !platforms) {
      return c.json({ error: 'Organization ID and platforms are required' }, 400)
    }

    const analyticsEngine = getAnalyticsEngine(c.env.DB)
    const crossPlatformAnalytics = await analyticsEngine.generateCrossPlatformAnalytics(organizationId, platforms)

    return c.json({
      success: true,
      crossPlatformAnalytics,
      message: 'Cross-platform analytics generated successfully'
    })
  } catch (error) {
    console.error('Cross-platform analytics error:', error)
    return c.json({ error: 'Failed to generate cross-platform analytics' }, 500)
  }
})

// Get advanced reporting
app.get('/analytics/advanced-reports/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const reportType = c.req.query('reportType') || 'comprehensive'
    const timeframe = c.req.query('timeframe') || '30 days'

    const analyticsEngine = getAnalyticsEngine(c.env.DB)
    const reports = await analyticsEngine.generateAdvancedReports(organizationId, reportType, timeframe)

    return c.json({
      success: true,
      reports,
      message: `Advanced ${reportType} reports generated for ${timeframe}`
    })
  } catch (error) {
    console.error('Advanced reporting error:', error)
    return c.json({ error: 'Failed to generate advanced reports' }, 500)
  }
})

// Get trend forecasting
app.get('/analytics/trend-forecast/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const forecastPeriod = c.req.query('period') || '6 months'
    const categories = c.req.query('categories')?.split(',') || ['security', 'compliance']

    const analyticsEngine = getAnalyticsEngine(c.env.DB)
    const trendForecast = await analyticsEngine.generateTrendForecast(organizationId, forecastPeriod, categories)

    return c.json({
      success: true,
      trendForecast,
      message: `Trend forecast generated for ${forecastPeriod}`
    })
  } catch (error) {
    console.error('Trend forecasting error:', error)
    return c.json({ error: 'Failed to generate trend forecast' }, 500)
  }
})

// Get real-time analytics
app.get('/analytics/real-time/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const metrics = c.req.query('metrics')?.split(',') || []

    const analyticsEngine = getAnalyticsEngine(c.env.DB)
    const realTimeAnalytics = await analyticsEngine.getRealTimeAnalytics(organizationId, metrics)

    return c.json({
      success: true,
      realTimeAnalytics,
      message: 'Real-time analytics retrieved successfully'
    })
  } catch (error) {
    console.error('Real-time analytics error:', error)
    return c.json({ error: 'Failed to get real-time analytics' }, 500)
  }
})

// Generate analytics insights
app.post('/analytics/insights', async (c) => {
  try {
    const { organizationId, dataPoints, analysisType } = await c.req.json()
    
    if (!organizationId || !dataPoints || !analysisType) {
      return c.json({ error: 'Organization ID, data points, and analysis type are required' }, 400)
    }

    const analyticsEngine = getAnalyticsEngine(c.env.DB)
    const insights = await analyticsEngine.generateAnalyticsInsights(organizationId, dataPoints, analysisType)

    return c.json({
      success: true,
      insights,
      message: `Analytics insights generated for ${analysisType} analysis`
    })
  } catch (error) {
    console.error('Analytics insights error:', error)
    return c.json({ error: 'Failed to generate analytics insights' }, 500)
  }
})

// Get analytics performance metrics
app.get('/analytics/performance/:organizationId', async (c) => {
  try {
    const organizationId = parseInt(c.req.param('organizationId'))
    const timeframe = c.req.query('timeframe') || '7 days'

    const analyticsEngine = getAnalyticsEngine(c.env.DB)
    const performanceMetrics = await analyticsEngine.getAnalyticsPerformanceMetrics(organizationId, timeframe)

    return c.json({
      success: true,
      performanceMetrics,
      message: `Analytics performance metrics retrieved for ${timeframe}`
    })
  } catch (error) {
    console.error('Analytics performance error:', error)
    return c.json({ error: 'Failed to get analytics performance metrics' }, 500)
  }
})

export default app