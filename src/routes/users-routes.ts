/**
 * Users Routes - User Management
 */

import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>User Management - ARIA5 GRC</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="container mx-auto px-6 py-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-users mr-2"></i>User Management
            </h1>
            <div class="bg-white rounded-xl shadow-lg p-6">
                <p class="text-gray-600">Manage users and access controls.</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

export default app;