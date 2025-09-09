import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  timestamp: number;
}

// Simple authentication middleware for Phase 1
export const simpleAuthMiddleware = createMiddleware<{
  Variables: {
    user: AuthUser;
  };
}>(async (c, next) => {
  const token = getCookie(c, 'auth-token');
  
  if (!token) {
    return c.redirect('/login');
  }
  
  try {
    const userData = JSON.parse(atob(token)) as AuthUser;
    
    // Check if token is expired (24 hours)
    if (Date.now() - userData.timestamp > 86400000) {
      return c.redirect('/login');
    }
    
    // Set user in context
    c.set('user', userData);
    
    await next();
  } catch (error) {
    console.error('Auth token validation error:', error);
    return c.redirect('/login');
  }
});

// Simple admin check middleware
export const simpleAdminMiddleware = createMiddleware<{
  Variables: {
    user: AuthUser;
  };
}>(async (c, next) => {
  const user = c.get('user');
  
  if (!user || user.role !== 'admin') {
    return c.text('Forbidden: Admin access required', 403);
  }
  
  await next();
});