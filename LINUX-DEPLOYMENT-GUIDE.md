# 🐧 ARIA5.1 Platform - Linux Server Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying the ARIA5.1 Dynamic Risk Intelligence Platform on a Linux server, migrated from Cloudflare Workers/Pages to a full Node.js server environment.

## 🎯 Architecture Changes Summary

### **FROM: Cloudflare Workers/Pages**
- Cloudflare Workers (Edge Runtime, 10ms CPU limit)
- Cloudflare D1 Database (SQLite on edge)
- Cloudflare KV Storage (Edge key-value)
- Cloudflare R2 Storage (Object storage)
- Wrangler dev server

### **TO: Linux Server Stack**
- Node.js HTTP Server with Hono framework
- SQLite/PostgreSQL database with full SQL features
- Redis cache for session management
- Local file system for file storage
- PM2 process management + Nginx reverse proxy

---

## 🚀 Quick Deployment (Automated)

### **Option 1: One-Command Deployment**

```bash
# Download and run the deployment script
curl -sSL https://raw.githubusercontent.com/your-org/aria5-platform/main/deploy-linux.sh | bash

# Or with custom domain and SSL
curl -sSL https://raw.githubusercontent.com/your-org/aria5-platform/main/deploy-linux.sh | bash -s -- --domain your-domain.com --email admin@your-domain.com
```

### **Option 2: Manual Script Execution**

```bash
# Clone the repository
git clone https://github.com/your-org/aria5-platform.git
cd aria5-platform

# Make deployment script executable
chmod +x deploy-linux.sh

# Run deployment
./deploy-linux.sh --domain your-domain.com --email admin@your-domain.com
```

---

## 🔧 Manual Deployment (Step-by-Step)

### **1. System Requirements**

**Supported Operating Systems:**
- Ubuntu 22.04 LTS (Recommended)
- Ubuntu 20.04 LTS
- Debian 11/12
- CentOS 8+
- Red Hat Enterprise Linux 8+

**Minimum Hardware:**
- **CPU:** 2 cores
- **RAM:** 4GB (8GB recommended)
- **Storage:** 20GB SSD
- **Network:** 1Gbps connection

**Software Requirements:**
- Node.js 18+ 
- npm 8+
- Redis 6+
- Nginx 1.18+
- SQLite 3+ (or PostgreSQL 13+)

### **2. Install Dependencies**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y nodejs npm redis-server nginx sqlite3 build-essential git

# Install PM2 globally
sudo npm install -g pm2

# Verify installations
node --version    # Should be 18+
npm --version     # Should be 8+
redis-cli ping    # Should return "PONG"
nginx -v          # Should show version
```

### **3. Create Application User**

```bash
# Create dedicated application user for security
sudo useradd -r -m -s /bin/bash aria5
sudo mkdir -p /opt/aria5-platform
sudo chown aria5:aria5 /opt/aria5-platform
```

### **4. Deploy Application**

```bash
# Clone repository
git clone https://github.com/your-org/aria5-platform.git /opt/aria5-platform
cd /opt/aria5-platform
sudo chown -R aria5:aria5 /opt/aria5-platform

# Switch to Linux configuration
sudo -u aria5 cp package-linux.json package.json
sudo -u aria5 cp tsconfig-linux.json tsconfig.json
sudo -u aria5 cp ecosystem-linux.config.js ecosystem.config.js

# Install dependencies and build
sudo -u aria5 npm install
sudo -u aria5 npm run build

# Create required directories
sudo -u aria5 mkdir -p data uploads logs backups
```

### **5. Configure Database**

```bash
# Initialize SQLite database
sudo -u aria5 npm run db:init

# Or set up PostgreSQL (optional)
sudo apt-get install -y postgresql postgresql-contrib
sudo -u postgres createdb aria5_platform
sudo -u postgres psql -c "CREATE USER aria5 WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aria5_platform TO aria5;"
```

### **6. Configure Redis**

```bash
# Edit Redis configuration
sudo tee /etc/redis/redis-aria5.conf > /dev/null <<EOF
bind 127.0.0.1
port 6379
protected-mode yes
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly yes
EOF

# Restart Redis with new config
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### **7. Configure Environment**

```bash
# Create environment file
sudo -u aria5 tee /opt/aria5-platform/.env > /dev/null <<EOF
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_PATH=/opt/aria5-platform/data/aria5.db
REDIS_URL=redis://localhost:6379
STORAGE_PATH=/opt/aria5-platform/uploads
JWT_SECRET=your-very-secure-jwt-secret-change-this
SESSION_TIMEOUT=86400
MAX_FILE_SIZE=50000000
EOF
```

### **8. Start Application with PM2**

```bash
# Start PM2 processes as aria5 user
sudo -u aria5 pm2 start ecosystem.config.js --env production

# Save PM2 configuration
sudo -u aria5 pm2 save

# Setup PM2 startup script
sudo -u aria5 pm2 startup
# Follow the instructions from the output
```

### **9. Configure Nginx Reverse Proxy**

```bash
# Create Nginx site configuration
sudo tee /etc/nginx/sites-available/aria5-platform > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;  # Change this to your domain
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files caching
    location /static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Rate limiting for API
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
    }
}

# Rate limiting configuration
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/aria5-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **10. SSL Certificate (Optional)**

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com --email admin@your-domain.com --agree-tos
```

### **11. Systemd Service (Optional)**

```bash
# Create systemd service for automatic startup
sudo tee /etc/systemd/system/aria5-platform.service > /dev/null <<EOF
[Unit]
Description=ARIA5.1 Risk Intelligence Platform
After=network.target redis-server.service

[Service]
Type=forking
User=aria5
WorkingDirectory=/opt/aria5-platform
ExecStart=/usr/bin/pm2 start /opt/aria5-platform/ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 stop all
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable aria5-platform
sudo systemctl start aria5-platform
```

---

## 🧪 Testing Deployment

### **1. Health Check**
```bash
# Test basic connectivity
curl http://localhost:3000/health
curl http://your-domain.com/health

# Expected response:
{
  "status": "healthy",
  "version": "5.1.0-linux",
  "mode": "Linux Server",
  "timestamp": "2025-09-12T08:30:00.000Z"
}
```

### **2. Test Key Features**
```bash
# Test Dynamic Risk Engine (should redirect to login)
curl -I http://your-domain.com/dynamic-risk-analysis

# Test Phase dashboards
curl -I http://your-domain.com/phase1
curl -I http://your-domain.com/phase2
curl -I http://your-domain.com/phase3

# Test login page
curl -I http://your-domain.com/login
```

### **3. Load Testing**
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Basic load test
ab -n 1000 -c 10 http://your-domain.com/health

# API load test
ab -n 500 -c 5 http://your-domain.com/api/health
```

---

## 📊 Monitoring & Management

### **Application Management**
```bash
# PM2 commands
sudo -u aria5 pm2 status          # View process status
sudo -u aria5 pm2 logs            # View logs
sudo -u aria5 pm2 restart all     # Restart all processes
sudo -u aria5 pm2 reload all      # Zero-downtime reload
sudo -u aria5 pm2 monit           # Real-time monitoring

# System service commands
sudo systemctl status aria5-platform
sudo systemctl restart aria5-platform
sudo systemctl stop aria5-platform
```

### **Database Management**
```bash
# SQLite operations
sudo -u aria5 sqlite3 /opt/aria5-platform/data/aria5.db

# Backup database
sudo -u aria5 npm run db:backup

# View database schema
sudo -u aria5 npm run db:schema:dump
```

### **Redis Management**
```bash
# Redis CLI
redis-cli
> INFO
> KEYS *
> FLUSHDB  # Clear cache

# Cache statistics
curl http://localhost:3000/api/cache/stats
```

### **Nginx & SSL**
```bash
# Nginx status
sudo systemctl status nginx
sudo nginx -t  # Test configuration

# SSL certificate renewal
sudo certbot renew --dry-run
```

---

## 🔒 Security Considerations

### **Firewall Configuration**
```bash
# Enable UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### **File Permissions**
```bash
# Ensure proper ownership
sudo chown -R aria5:aria5 /opt/aria5-platform
sudo chmod -R 755 /opt/aria5-platform
sudo chmod 600 /opt/aria5-platform/.env

# Secure database files
sudo chmod 600 /opt/aria5-platform/data/*.db
```

### **Regular Security Updates**
```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Update Node.js dependencies
sudo -u aria5 npm audit fix

# Update PM2
sudo npm update -g pm2
```

---

## 🚨 Troubleshooting

### **Common Issues**

**1. Application Won't Start**
```bash
# Check PM2 status
sudo -u aria5 pm2 status
sudo -u aria5 pm2 logs

# Check systemd logs
sudo journalctl -u aria5-platform -f

# Check port availability
sudo netstat -tlnp | grep :3000
```

**2. Database Connection Issues**
```bash
# Check database file permissions
ls -la /opt/aria5-platform/data/aria5.db

# Test database connection
sudo -u aria5 sqlite3 /opt/aria5-platform/data/aria5.db ".tables"
```

**3. Redis Connection Issues**
```bash
# Check Redis status
sudo systemctl status redis-server
redis-cli ping

# Check Redis logs
sudo journalctl -u redis-server -f
```

**4. Nginx Issues**
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### **Performance Issues**
```bash
# Monitor system resources
htop
iostat -x 1
free -m

# PM2 monitoring
sudo -u aria5 pm2 monit

# Check application metrics
curl http://localhost:3000/api/metrics
```

---

## 🔄 Deployment Updates

### **Rolling Updates**
```bash
# Pull latest code
cd /opt/aria5-platform
sudo -u aria5 git pull origin main

# Install new dependencies
sudo -u aria5 npm install

# Build application
sudo -u aria5 npm run build

# Zero-downtime reload
sudo -u aria5 pm2 reload all
```

### **Database Migrations**
```bash
# Run migrations
sudo -u aria5 npm run db:migrate

# Backup before major updates
sudo -u aria5 npm run db:backup
```

---

## ✅ Success Metrics

After successful deployment, verify:

- ✅ Health endpoint returns 200 OK
- ✅ All Dynamic Risk Engine routes accessible
- ✅ Authentication flow works correctly
- ✅ File uploads/downloads function
- ✅ Redis caching operates properly
- ✅ Database queries execute successfully
- ✅ SSL certificate valid (if configured)
- ✅ Nginx rate limiting active
- ✅ PM2 processes stable
- ✅ Systemd service auto-starts

## 📞 Support

For deployment issues or questions:
- Check logs: `sudo journalctl -u aria5-platform -f`
- PM2 status: `sudo -u aria5 pm2 status`  
- System resources: `htop` and `free -m`
- Nginx status: `sudo systemctl status nginx`

---

**🎉 Congratulations! Your ARIA5.1 Platform is now running on Linux!**

Access your platform at: **http://your-domain.com**
Dynamic Risk Engine: **http://your-domain.com/dynamic-risk-analysis**