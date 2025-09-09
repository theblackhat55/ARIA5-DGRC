import { Hono } from 'hono';
import { html } from 'hono/html';
import { setCookie } from 'hono/cookie';
import type { CloudflareBindings } from '../types';

export function createSimpleAuthRoutes() {
  const app = new Hono<{ Bindings: CloudflareBindings }>();
  
  // Simple login endpoint for Phase 1 testing
  app.post('/login', async (c) => {
    try {
      const formData = await c.req.parseBody();
      const username = formData.username as string;
      const password = formData.password as string;
      
      console.log('Login attempt:', username, password);
      
      if (!username || !password) {
        return c.html(html`
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4" role="alert">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">Username and password are required</p>
              </div>
            </div>
          </div>
        `);
      }
      
      // Get user from database
      let user = null;
      try {
        user = await c.env.DB.prepare(`
          SELECT id, username, email, role, first_name, last_name, is_active, password_hash
          FROM users 
          WHERE username = ? OR email = ?
        `).bind(username, username).first();
        
        console.log('User found:', user ? 'yes' : 'no');
        if (user) {
          console.log('User details:', { id: user.id, username: user.username, role: user.role, is_active: user.is_active });
        }
      } catch (error) {
        console.error('Database error:', error);
        return c.html(html`
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4" role="alert">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">Database error occurred</p>
              </div>
            </div>
          </div>
        `);
      }
      
      if (!user) {
        console.log('User not found for username:', username);
        return c.html(html`
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4" role="alert">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">Invalid username or password</p>
              </div>
            </div>
          </div>
        `);
      }
      
      if (!user.is_active) {
        console.log('User account is disabled:', username);
        return c.html(html`
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4" role="alert">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-lock text-red-500"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">Account is disabled</p>
              </div>
            </div>
          </div>
        `);
      }
      
      // Simple password check (for demo - accepts demo123 or matching hash)
      let isValidPassword = false;
      if (password === 'demo123' || user.password_hash === 'demo123' || user.password_hash === password) {
        isValidPassword = true;
      } else {
        // Try bcrypt if available
        try {
          const bcrypt = await import('bcryptjs');
          if (user.password_hash.startsWith('$2')) {
            isValidPassword = await bcrypt.compare(password, user.password_hash);
          }
        } catch (error) {
          console.log('Bcrypt not available, using fallback');
        }
      }
      
      console.log('Password validation result:', isValidPassword);
      
      if (!isValidPassword) {
        return c.html(html`
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4" role="alert">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">Invalid username or password</p>
              </div>
            </div>
          </div>
        `);
      }
      
      // Create simple session token
      const sessionToken = btoa(JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role,
        timestamp: Date.now()
      }));
      
      // Set authentication cookie
      setCookie(c, 'auth-token', sessionToken, {
        httpOnly: true,
        secure: false, // Set to true in production
        maxAge: 86400, // 24 hours
        path: '/'
      });
      
      console.log('Login successful, redirecting to dashboard');
      
      // Return redirect response
      return c.redirect('/dashboard');
      
    } catch (error) {
      console.error('Authentication error:', error);
      return c.html(html`
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4" role="alert">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-500"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">Authentication system error</p>
            </div>
          </div>
        </div>
      `, 500);
    }
  });

  // Simple logout
  app.post('/logout', async (c) => {
    setCookie(c, 'auth-token', '', {
      maxAge: 0,
      path: '/'
    });
    return c.redirect('/login');
  });

  return app;
}