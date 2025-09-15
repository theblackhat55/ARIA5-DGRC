// ARIA5.1 - Linux Cache Service (Redis/In-Memory)
import { createClient } from 'redis'

export class CacheService {
  private client: any
  private memoryCache = new Map<string, { value: any; expires?: number }>()
  private useRedis = false
  private initialized = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return

    // Try to connect to Redis first, fallback to in-memory
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    
    try {
      this.client = createClient({ url: redisUrl })
      
      this.client.on('error', (err: any) => {
        console.log('⚠️  Redis connection failed, using in-memory cache:', err.message)
        this.useRedis = false
      })

      this.client.on('connect', () => {
        console.log('✅ Redis cache service initialized')
        this.useRedis = true
      })

      await this.client.connect()
    } catch (error) {
      console.log('⚠️  Redis not available, using in-memory cache')
      this.useRedis = false
    }

    if (!this.useRedis) {
      console.log('💾 In-memory cache service initialized')
      // Clean up expired entries every 5 minutes
      setInterval(() => this.cleanupMemoryCache(), 5 * 60 * 1000)
    }

    this.initialized = true
  }

  private cleanupMemoryCache() {
    const now = Date.now()
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expires && entry.expires < now) {
        this.memoryCache.delete(key)
      }
    }
  }

  // KV-compatible interface methods
  async get(key: string): Promise<string | null> {
    await this.initialize()

    if (this.useRedis && this.client) {
      try {
        return await this.client.get(key)
      } catch (error) {
        console.error('Redis get error:', error)
        // Fallback to memory cache
      }
    }

    // In-memory fallback
    const entry = this.memoryCache.get(key)
    if (!entry) return null
    
    if (entry.expires && entry.expires < Date.now()) {
      this.memoryCache.delete(key)
      return null
    }
    
    return entry.value
  }

  async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    await this.initialize()

    if (this.useRedis && this.client) {
      try {
        if (options?.expirationTtl) {
          await this.client.setEx(key, options.expirationTtl, value)
        } else {
          await this.client.set(key, value)
        }
        return
      } catch (error) {
        console.error('Redis put error:', error)
        // Fallback to memory cache
      }
    }

    // In-memory fallback
    const expires = options?.expirationTtl ? Date.now() + (options.expirationTtl * 1000) : undefined
    this.memoryCache.set(key, { value, expires })
  }

  async delete(key: string): Promise<void> {
    await this.initialize()

    if (this.useRedis && this.client) {
      try {
        await this.client.del(key)
        return
      } catch (error) {
        console.error('Redis delete error:', error)
        // Fallback to memory cache
      }
    }

    // In-memory fallback
    this.memoryCache.delete(key)
  }

  async list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }> {
    await this.initialize()

    if (this.useRedis && this.client) {
      try {
        const pattern = options?.prefix ? `${options.prefix}*` : '*'
        const keys = await this.client.keys(pattern)
        return { keys: keys.map((name: string) => ({ name })) }
      } catch (error) {
        console.error('Redis list error:', error)
        // Fallback to memory cache
      }
    }

    // In-memory fallback
    const keys = Array.from(this.memoryCache.keys())
      .filter(key => !options?.prefix || key.startsWith(options.prefix))
      .map(name => ({ name }))
    
    return { keys }
  }

  // Session management methods
  async setSession(sessionId: string, userData: any, ttl: number = 86400): Promise<void> {
    await this.put(`session:${sessionId}`, JSON.stringify(userData), { expirationTtl: ttl })
  }

  async getSession(sessionId: string): Promise<any | null> {
    const data = await this.get(`session:${sessionId}`)
    return data ? JSON.parse(data) : null
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.delete(`session:${sessionId}`)
  }

  // Rate limiting methods
  async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number }> {
    await this.initialize()

    const rateLimitKey = `rate_limit:${key}`
    
    if (this.useRedis && this.client) {
      try {
        const current = await this.client.incr(rateLimitKey)
        
        if (current === 1) {
          await this.client.expire(rateLimitKey, window)
        }
        
        const remaining = Math.max(0, limit - current)
        return {
          allowed: current <= limit,
          remaining
        }
      } catch (error) {
        console.error('Redis rate limit error:', error)
        // Fallback to allow request
        return { allowed: true, remaining: limit }
      }
    }

    // In-memory rate limiting (simplified)
    const entry = this.memoryCache.get(rateLimitKey)
    const now = Date.now()
    
    if (!entry || (entry.expires && entry.expires < now)) {
      this.memoryCache.set(rateLimitKey, {
        value: 1,
        expires: now + (window * 1000)
      })
      return { allowed: true, remaining: limit - 1 }
    }
    
    const current = entry.value + 1
    entry.value = current
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current)
    }
  }

  // Cache statistics
  async getStats(): Promise<{ type: string; connected: boolean; keys?: number }> {
    await this.initialize()

    if (this.useRedis && this.client) {
      try {
        const info = await this.client.info('keyspace')
        const dbInfo = info.match(/db0:keys=(\d+)/)
        const keys = dbInfo ? parseInt(dbInfo[1]) : 0
        
        return {
          type: 'redis',
          connected: true,
          keys
        }
      } catch (error) {
        return {
          type: 'redis',
          connected: false
        }
      }
    }

    return {
      type: 'memory',
      connected: true,
      keys: this.memoryCache.size
    }
  }

  // Cleanup
  async close(): Promise<void> {
    if (this.useRedis && this.client) {
      try {
        await this.client.quit()
        console.log('💾 Redis cache connection closed')
      } catch (error) {
        console.error('Error closing Redis connection:', error)
      }
    }
    
    this.memoryCache.clear()
    console.log('💾 Cache service cleaned up')
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('💾 Closing cache connections...')
})

process.on('SIGINT', async () => {
  console.log('💾 Closing cache connections...')
})