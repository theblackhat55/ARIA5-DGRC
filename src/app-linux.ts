// ARIA5.1 - Linux-Compatible Hono Application
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { html } from 'hono/html'
import { getCookie } from 'hono/cookie'

// Linux-compatible imports
import { DatabaseService } from './services/database-service-linux'
import { CacheService } from './services/cache-service-linux'
import { StorageService } from './services/storage-service-linux'

// Import route handlers (same as Cloudflare version)
import { createAuthRoutes } from './routes/auth-routes'
import { createCleanDashboardRoutes } from './routes/dashboard-routes-clean'
import { createRiskRoutesARIA5 } from './routes/risk-routes-aria5'
import { createComplianceRoutes } from './routes/compliance-routes'
import { createOperationsRoutes } from './routes/operations-fixed'
import { createIntelligenceRoutes } from './routes/intelligence-routes'
import { createAdminRoutesARIA5 } from './routes/admin-routes-aria5'
import { createAPIRoutes } from './routes/api-routes'
import { createPhase1DashboardRoutes } from './routes/phase1-dashboard-routes'
import { createPhase2DashboardRoutes } from './routes/phase2-dashboard-routes'
import { createPhase3DashboardRoutes } from './routes/phase3-dashboard-routes'
import { phase4EvidenceDashboard } from './routes/phase4-evidence-dashboard-routes'
import { dynamicRiskAnalysisRoutes } from './routes/dynamic-risk-analysis-routes'

// Linux-compatible middleware
import { authMiddleware } from './middleware/auth-middleware-linux'
import { requireAdmin } from './middleware/auth-middleware'

// Clean templates
import { cleanLayout } from './templates/layout-clean'
import { loginPage } from './templates/auth/login'

// Linux Services Context Type
type LinuxBindings = {
  DB: DatabaseService
  CACHE: CacheService
  STORAGE: StorageService
}

const app = new Hono<{ Bindings: LinuxBindings }>()

// Initialize services
const dbService = new DatabaseService()
const cacheService = new CacheService()
const storageService = new StorageService()

// Inject services into context
app.use('*', async (c, next) => {
  c.env = {
    DB: dbService,
    CACHE: cacheService,
    STORAGE: storageService
  } as any
  await next()
})

// Security middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
    connectSrc: ["'self'"]
  },
  crossOriginEmbedderPolicy: false
}))

// Landing page route (public)
app.get('/', async (c) => {
  return c.redirect('/risk')
})

// Login page (public)
app.get('/login', (c) => {
  const token = getCookie(c, 'aria_token')
  
  if (token) {
    return c.redirect('/dashboard')
  }
  
  return c.html(loginPage())
})

// Mount route groups with authentication
const authRoutes = createAuthRoutes()
const dashboardRoutes = createCleanDashboardRoutes()
const riskRoutes = createRiskRoutesARIA5()
const complianceRoutes = createComplianceRoutes()
const operationsRoutes = createOperationsRoutes()
const intelligenceRoutes = createIntelligenceRoutes()
const adminRoutes = createAdminRoutesARIA5()
const apiRoutes = createAPIRoutes()

// Public routes (no authentication required)
app.route('/auth', authRoutes)

// Protected routes (require authentication)
app.use('/dashboard/*', authMiddleware)
app.route('/dashboard', dashboardRoutes)

// Risk routes with debug endpoints excluded from auth
app.use('/risk/*', async (c, next) => {
  // Skip authentication for debug endpoints
  if (c.req.path.includes('/debug')) {
    return next()
  }
  return authMiddleware(c, next)
})
app.route('/risk', riskRoutes)

app.use('/compliance/*', authMiddleware)
app.route('/compliance', complianceRoutes)

app.use('/operations/*', authMiddleware)
app.route('/operations', operationsRoutes)

app.use('/intelligence/*', authMiddleware)
app.route('/intelligence', intelligenceRoutes)

// Admin routes (require admin role)
app.use('/admin/*', authMiddleware)
app.use('/admin/*', requireAdmin)
app.route('/admin', adminRoutes)

// API routes (require authentication)
app.use('/api/*', authMiddleware)
app.route('/api', apiRoutes)

// Phase Dashboard routes (require authentication)
app.use('/phase1/*', authMiddleware)
const phase1Routes = createPhase1DashboardRoutes()
app.route('/phase1', phase1Routes)

app.use('/phase2/*', authMiddleware)
const phase2Routes = createPhase2DashboardRoutes()
app.route('/phase2', phase2Routes)

app.use('/phase3/*', authMiddleware)
const phase3Routes = createPhase3DashboardRoutes()
app.route('/phase3', phase3Routes)

app.use('/phase4/*', authMiddleware)
app.route('/phase4', phase4EvidenceDashboard)

// Dynamic Risk Analysis routes (require authentication)
app.use('/dynamic-risk-analysis/*', authMiddleware)
app.route('/dynamic-risk-analysis', dynamicRiskAnalysisRoutes)

// File upload endpoints
app.post('/api/upload', authMiddleware, async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    const fileId = await c.env.STORAGE.saveFile(file)
    return c.json({ 
      success: true, 
      fileId,
      url: `/api/files/${fileId}`
    })
  } catch (error) {
    console.error('File upload error:', error)
    return c.json({ error: 'Upload failed' }, 500)
  }
})

app.get('/api/files/:fileId', async (c) => {
  const fileId = c.req.param('fileId')
  
  try {
    const fileData = await c.env.STORAGE.getFile(fileId)
    if (!fileData) {
      return c.notFound()
    }
    
    return new Response(fileData.buffer, {
      headers: {
        'Content-Type': fileData.mimeType,
        'Content-Disposition': `inline; filename="${fileData.filename}"`
      }
    })
  } catch (error) {
    console.error('File retrieval error:', error)
    return c.json({ error: 'File not found' }, 404)
  }
})

// 404 handler
app.notFound((c) => {
  const htmxRequest = c.req.header('HX-Request')
  
  if (htmxRequest) {
    return c.html('<div class="text-gray-500 text-center p-4">Content not available</div>', 404)
  }
  
  return c.html(
    cleanLayout({
      title: '404 - Page Not Found',
      content: html`
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <h1 class="text-6xl font-bold text-gray-200">404</h1>
            <p class="text-xl text-gray-600 mt-4">Page not found</p>
            <a href="/dashboard" class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Go to Dashboard
            </a>
          </div>
        </div>
      `
    }),
    404
  )
})

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err}`)
  
  const htmxRequest = c.req.header('HX-Request')
  
  if (htmxRequest) {
    return c.html('<div class="text-red-500 text-center p-4">Server error. Please try again.</div>', 500)
  }
  
  return c.html(
    cleanLayout({
      title: 'Error',
      content: html`
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <h1 class="text-4xl font-bold text-red-600">Error</h1>
            <p class="text-gray-600 mt-4">Something went wrong. Please try again.</p>
            <a href="/dashboard" class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Go to Dashboard
            </a>
          </div>
        </div>
      `
    }),
    500
  )
})

export default app