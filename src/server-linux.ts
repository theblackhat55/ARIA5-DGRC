// ARIA5.1 - Linux Server Entry Point
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import app from './app-linux'

// Configuration
const PORT = parseInt(process.env.PORT || '3000')
const HOST = process.env.HOST || '0.0.0.0'

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/assets/*', serveStatic({ root: './public' }))

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    version: '5.1.0-linux',
    mode: 'Linux Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
  })
})

// Start server
const server = serve({
  fetch: app.fetch,
  port: PORT,
  hostname: HOST
})

console.log(`🚀 ARIA5.1 Platform running on http://${HOST}:${PORT}`)
console.log(`📊 Health check: http://${HOST}:${PORT}/health`)
console.log(`🎯 Dynamic Risk Engine: http://${HOST}:${PORT}/dynamic-risk-analysis`)

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down server...')
  server.close(() => {
    console.log('✅ Server shutdown complete')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('📴 Shutting down server...')
  server.close(() => {
    console.log('✅ Server shutdown complete')
    process.exit(0)
  })
})

export default server