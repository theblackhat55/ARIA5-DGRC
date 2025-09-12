/**
 * Reports Routes - Legacy compatibility
 * Redirects to AI Insights Dashboard
 */

import { Hono } from 'hono';

const app = new Hono();

// Redirect all report routes to AI insights
app.get('/*', (c) => {
  return c.redirect('/ai-insights', 301);
});

export default app;