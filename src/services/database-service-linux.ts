// ARIA5.1 - Linux Database Service (SQLite/PostgreSQL)
import Database from 'better-sqlite3'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export class DatabaseService {
  private db: Database.Database
  private initialized = false

  constructor() {
    const dbPath = process.env.DATABASE_PATH || './data/aria5.db'
    
    // Ensure directory exists
    const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/'))
    if (!existsSync(dbDir)) {
      const { mkdirSync } = require('fs')
      mkdirSync(dbDir, { recursive: true })
    }

    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL') // Better performance
    this.db.pragma('foreign_keys = ON')   // Enable foreign keys
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return

    try {
      // Load schema if database is empty
      const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
      
      if (tables.length === 0) {
        console.log('📊 Initializing database schema...')
        await this.loadSchema()
        await this.seedData()
      }

      this.initialized = true
      console.log('✅ Database service initialized')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      throw error
    }
  }

  private async loadSchema() {
    const schemaPath = join(process.cwd(), 'schema.sql')
    
    if (existsSync(schemaPath)) {
      const schema = readFileSync(schemaPath, 'utf8')
      this.db.exec(schema)
      console.log('📋 Database schema loaded')
    } else {
      // Create basic schema if file doesn't exist
      this.createBasicSchema()
    }
  }

  private createBasicSchema() {
    const schema = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Risks table
      CREATE TABLE IF NOT EXISTS risks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        risk_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        likelihood INTEGER DEFAULT 1,
        probability INTEGER DEFAULT 1,
        impact INTEGER DEFAULT 1,
        risk_score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
        status TEXT DEFAULT 'active',
        owner_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      );

      -- Compliance frameworks table
      CREATE TABLE IF NOT EXISTS compliance_frameworks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Controls table
      CREATE TABLE IF NOT EXISTS controls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        control_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        framework_id INTEGER,
        control_type TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id)
      );

      -- Audit logs table
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id TEXT,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
      CREATE INDEX IF NOT EXISTS idx_risks_category ON risks(category);
      CREATE INDEX IF NOT EXISTS idx_risks_score ON risks(risk_score);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
    `

    this.db.exec(schema)
    console.log('📋 Basic database schema created')
  }

  private async seedData() {
    // Create default admin user
    const hashedPassword = require('bcryptjs').hashSync('demo123', 10)
    
    const seedUsers = [
      {
        username: 'admin',
        email: 'admin@aria5.local',
        password_hash: hashedPassword,
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin'
      },
      {
        username: 'avi_security',
        email: 'avi@aria5.local',
        password_hash: hashedPassword,
        first_name: 'Avi',
        last_name: 'Security Manager',
        role: 'admin'
      }
    ]

    const insertUser = this.db.prepare(`
      INSERT OR IGNORE INTO users (username, email, password_hash, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    for (const user of seedUsers) {
      insertUser.run(user.username, user.email, user.password_hash, user.first_name, user.last_name, user.role)
    }

    console.log('👥 Default users created')
  }

  // D1-compatible interface methods
  prepare(query: string) {
    return {
      bind: (...params: any[]) => ({
        first: () => {
          try {
            const stmt = this.db.prepare(query)
            return stmt.get(...params) || null
          } catch (error) {
            console.error('Database query error:', error)
            throw error
          }
        },
        all: () => {
          try {
            const stmt = this.db.prepare(query)
            return stmt.all(...params)
          } catch (error) {
            console.error('Database query error:', error)
            throw error
          }
        },
        run: () => {
          try {
            const stmt = this.db.prepare(query)
            const result = stmt.run(...params)
            return {
              success: true,
              meta: {
                changes: result.changes,
                last_row_id: result.lastInsertRowid
              }
            }
          } catch (error) {
            console.error('Database query error:', error)
            throw error
          }
        }
      }),
      first: () => {
        try {
          const stmt = this.db.prepare(query)
          return stmt.get() || null
        } catch (error) {
          console.error('Database query error:', error)
          throw error
        }
      },
      all: () => {
        try {
          const stmt = this.db.prepare(query)
          return stmt.all()
        } catch (error) {
          console.error('Database query error:', error)
          throw error
        }
      },
      run: () => {
        try {
          const stmt = this.db.prepare(query)
          const result = stmt.run()
          return {
            success: true,
            meta: {
              changes: result.changes,
              last_row_id: result.lastInsertRowid
            }
          }
        } catch (error) {
          console.error('Database query error:', error)
          throw error
        }
      }
    }
  }

  // Direct database access for complex operations
  getDirect() {
    return this.db
  }

  // Cleanup
  close() {
    if (this.db) {
      this.db.close()
      console.log('📊 Database connection closed')
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📊 Closing database connections...')
})

process.on('SIGINT', () => {
  console.log('📊 Closing database connections...')
})