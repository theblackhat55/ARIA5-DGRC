/**
 * Assets Routes - Asset Management
 */

import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Asset Management - ARIA5 GRC</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="container mx-auto px-6 py-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-server mr-2"></i>Asset Management
            </h1>
            <div class="bg-white rounded-xl shadow-lg p-6">
                <p class="text-gray-600">Manage and track organizational assets.</p>
                <div class="mt-4">
                    <a href="/ai-insights" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                        View Asset Intelligence
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

export default app;