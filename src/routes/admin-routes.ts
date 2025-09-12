/**
 * Admin Routes - Compatibility wrapper
 * Re-exports from admin-routes-aria5.ts for backward compatibility
 */

import { Hono } from 'hono';

const app = new Hono();

// Import existing admin functionality (keeping it simple for now)
app.get('/', (c) => {
  return c.redirect('/admin/dashboard');
});

app.get('/dashboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Admin Dashboard - ARIA5 GRC</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="container mx-auto px-6 py-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-cog mr-2"></i>Admin Dashboard
            </h1>
            <div class="bg-white rounded-xl shadow-lg p-6">
                <p class="text-gray-600">Administrative functions and system management.</p>
                <div class="mt-4">
                    <a href="/ai-insights" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mr-2">
                        AI Insights Dashboard
                    </a>
                    <a href="/decision-center" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg">
                        Decision Center
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

export default app;