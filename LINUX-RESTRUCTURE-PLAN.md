# 🐧 ARIA5.1 Platform - Linux Server Restructure Plan

## 📋 Architecture Migration Overview

### Current: Cloudflare Workers/Pages
```
├── Cloudflare Workers (Edge Runtime)
├── Cloudflare D1 Database (SQLite)
├── Cloudflare KV (Key-Value Store)
├── Cloudflare R2 (Object Storage)
├── Cloudflare AI (Edge AI)
└── Wrangler Dev Server
```

### Target: Linux Server Stack
```
├── Node.js HTTP Server (@hono/node-server)
├── SQLite/PostgreSQL Database
├── Redis Cache (KV replacement)
├── Local File System (R2 replacement)
├── Optional: Local AI Models/APIs
└── PM2/Systemd Process Management
```

## 🔧 Component Replacements

### 1. **Runtime Environment**
**FROM:** Cloudflare Workers (V8 Edge Runtime)
**TO:** Node.js Server with Hono

**Changes Required:**
- Replace `serveStatic` from 'hono/cloudflare-workers'
- Use `@hono/node-server` instead
- Enable full Node.js APIs (fs, path, crypto, etc.)
- Remove Cloudflare-specific bindings

### 2. **Database Layer**
**FROM:** Cloudflare D1 Database
**TO:** Local SQLite or PostgreSQL

**Migration Steps:**
- Export D1 schema and data
- Create local database setup
- Update database connection logic
- Remove Cloudflare D1 bindings

### 3. **Caching Layer**
**FROM:** Cloudflare KV Storage
**TO:** Redis or In-Memory Cache

**Implementation:**
- Install Redis server
- Replace KV operations with Redis commands
- Update session management
- Add cache configuration

### 4. **File Storage**
**FROM:** Cloudflare R2 Storage
**TO:** Local File System + Optional MinIO

**Setup:**
- Create uploads directory structure
- Implement file upload handlers
- Add file serving endpoints
- Optional: MinIO for S3-compatible API

### 5. **Static File Serving**
**FROM:** Cloudflare Pages static serving
**TO:** Hono + Node.js static serving

**Updates:**
- Change import from 'hono/cloudflare-workers'
- Use '@hono/node-server/serve-static'
- Configure public directory structure

## 📦 New Dependencies Required

### Core Server Dependencies
```json
{
  "dependencies": {
    "@hono/node-server": "^1.12.2",
    "better-sqlite3": "^9.4.0",
    "redis": "^4.6.13",
    "multer": "^1.4.5-lts.1",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"
  }
}
```

### Optional Database Upgrades
```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "mysql2": "^3.9.2",
    "prisma": "^5.10.2"
  }
}
```

## 🔄 File Structure Changes

### Current Structure
```
webapp/
├── src/
│   ├── index.ts (Cloudflare Workers entry)
│   ├── middleware/auth-middleware.ts
│   └── routes/
├── wrangler.jsonc (Cloudflare config)
├── vite.config.ts (Workers build)
└── public/ (static files)
```

### Linux Structure
```
webapp/
├── src/
│   ├── server.ts (Node.js HTTP server entry)
│   ├── app.ts (Hono app setup)
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── storage.ts
│   ├── middleware/
│   │   ├── auth-middleware-linux.ts
│   │   └── file-upload.ts
│   ├── routes/
│   └── services/
│       ├── database-service.ts
│       ├── cache-service.ts
│       └── storage-service.ts
├── config/
│   ├── ecosystem.config.js (PM2)
│   ├── nginx.conf (reverse proxy)
│   └── systemd.service
├── uploads/ (file storage)
├── logs/ (application logs)
└── public/ (static files)
```

## 🎯 Migration Strategy

### Phase 1: Core Server Setup
1. Create Node.js server entry point
2. Replace Cloudflare-specific imports
3. Set up basic HTTP server
4. Test core routing functionality

### Phase 2: Database Migration
1. Export existing D1 data
2. Set up local SQLite/PostgreSQL
3. Update database service layer
4. Migrate data and test

### Phase 3: Cache & Storage
1. Install and configure Redis
2. Set up file storage system
3. Update KV operations
4. Test file upload/download

### Phase 4: Production Setup
1. Configure PM2/systemd
2. Set up Nginx reverse proxy
3. Configure SSL certificates
4. Set up monitoring and logging

## 🔒 Security Enhancements

### Linux-Specific Security
- **File permissions**: Proper chmod/chown setup
- **Process isolation**: Non-root user execution
- **Firewall rules**: iptables/ufw configuration
- **Rate limiting**: Nginx + application level
- **Log rotation**: logrotate configuration
- **SSL/TLS**: Let's Encrypt integration

## 📈 Performance Optimizations

### Linux Server Advantages
- **Database**: Full SQL features, complex queries, joins
- **Caching**: Redis with advanced data structures
- **File I/O**: Direct file system access
- **Background jobs**: Cron jobs, task queues
- **WebSockets**: Real-time features
- **Clustering**: Multi-core utilization

## 🚀 Deployment Options

### Option 1: Traditional Server
- **OS**: Ubuntu 22.04 LTS
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL
- **Cache**: Redis

### Option 2: Docker Container
- **Base**: Node.js Alpine image
- **Database**: PostgreSQL container
- **Cache**: Redis container
- **Orchestration**: Docker Compose

### Option 3: Kubernetes
- **Deployment**: K8s manifests
- **Database**: StatefulSet
- **Cache**: Redis Cluster
- **Ingress**: Nginx Ingress Controller

## 📋 Migration Checklist

- [ ] Create Linux-compatible server entry point
- [ ] Replace Cloudflare-specific imports
- [ ] Set up local database (SQLite/PostgreSQL)
- [ ] Configure Redis for caching
- [ ] Implement file storage system
- [ ] Update authentication middleware
- [ ] Configure static file serving
- [ ] Set up process management (PM2)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL certificates
- [ ] Configure logging and monitoring
- [ ] Test all functionality
- [ ] Deploy and verify production setup