#!/bin/bash

# ARIA5.1 Platform - Linux Server Deployment Script
# This script automates the deployment of the ARIA5.1 platform on a Linux server

set -e  # Exit on any error

# Configuration
APP_NAME="aria5-platform"
APP_USER="aria5"
APP_DIR="/opt/aria5-platform"
SERVICE_PORT="3000"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check OS
    if [[ ! -f /etc/os-release ]]; then
        error "Cannot detect Linux distribution"
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18 or higher"
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//')
    REQUIRED_VERSION="18.0.0"
    
    if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION'))" 2>/dev/null; then
        error "Node.js version $NODE_VERSION is too old. Please install version $REQUIRED_VERSION or higher"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    log "✓ System requirements check passed"
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update package list
    sudo apt-get update
    
    # Install required packages
    sudo apt-get install -y \
        redis-server \
        nginx \
        certbot \
        python3-certbot-nginx \
        sqlite3 \
        build-essential \
        git \
        curl \
        wget \
        unzip \
        logrotate
    
    # Install PM2 globally if not present
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    fi
    
    log "✓ System dependencies installed"
}

# Create application user and directories
setup_user_and_directories() {
    log "Setting up application user and directories..."
    
    # Create application user if not exists
    if ! id "$APP_USER" &>/dev/null; then
        sudo useradd -r -m -s /bin/bash "$APP_USER"
        log "✓ Created application user: $APP_USER"
    fi
    
    # Create application directory
    sudo mkdir -p "$APP_DIR"
    sudo chown "$APP_USER:$APP_USER" "$APP_DIR"
    
    # Create required subdirectories
    sudo -u "$APP_USER" mkdir -p "$APP_DIR"/{data,uploads,logs,backups,config}
    
    log "✓ Application directories created"
}

# Deploy application code
deploy_application() {
    log "Deploying application code..."
    
    # Copy application files
    sudo cp -r . "$APP_DIR/"
    sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    
    # Install Node.js dependencies
    cd "$APP_DIR"
    sudo -u "$APP_USER" cp package-linux.json package.json
    sudo -u "$APP_USER" cp tsconfig-linux.json tsconfig.json
    sudo -u "$APP_USER" npm install --production
    
    # Build application
    sudo -u "$APP_USER" npm run build
    
    log "✓ Application deployed and built"
}

# Configure Redis
configure_redis() {
    log "Configuring Redis..."
    
    # Create Redis configuration
    sudo tee /etc/redis/redis-aria5.conf > /dev/null <<EOF
# Redis configuration for ARIA5 Platform
bind 127.0.0.1
port 6379
protected-mode yes
timeout 300
databases 16
save 900 1
save 300 10
save 60 10000
rdbcompression yes
dbfilename aria5-dump.rdb
dir /var/lib/redis/
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "aria5-appendonly.aof"
EOF
    
    # Enable and start Redis
    sudo systemctl enable redis-server
    sudo systemctl restart redis-server
    
    log "✓ Redis configured and started"
}

# Configure Nginx
configure_nginx() {
    log "Configuring Nginx reverse proxy..."
    
    # Create Nginx site configuration
    sudo tee "$NGINX_AVAILABLE/aria5-platform" > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN:-localhost};
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    
    # Main application
    location / {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Login rate limiting
    location /auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files caching
    location /static/ {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check
    location /health {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        access_log off;
    }
}
EOF
    
    # Enable site
    sudo ln -sf "$NGINX_AVAILABLE/aria5-platform" "$NGINX_ENABLED/"
    sudo nginx -t
    sudo systemctl reload nginx
    
    log "✓ Nginx configured"
}

# Setup SSL certificate
setup_ssl() {
    if [[ -n "$DOMAIN" && "$DOMAIN" != "localhost" ]]; then
        log "Setting up SSL certificate for $DOMAIN..."
        
        # Obtain SSL certificate
        sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "${EMAIL:-admin@$DOMAIN}"
        
        log "✓ SSL certificate configured"
    else
        warn "No domain specified, skipping SSL setup"
    fi
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    
    # Enable UFW if available
    if command -v ufw &> /dev/null; then
        sudo ufw --force enable
        sudo ufw allow ssh
        sudo ufw allow 'Nginx Full'
        sudo ufw reload
        log "✓ Firewall configured"
    else
        warn "UFW not available, manual firewall configuration may be required"
    fi
}

# Setup systemd service
setup_systemd() {
    log "Setting up systemd service..."
    
    sudo tee /etc/systemd/system/aria5-platform.service > /dev/null <<EOF
[Unit]
Description=ARIA5.1 Risk Intelligence Platform
After=network.target redis-server.service
Wants=redis-server.service

[Service]
Type=forking
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/pm2 start $APP_DIR/ecosystem-linux.config.js --env production
ExecReload=/usr/bin/pm2 reload $APP_DIR/ecosystem-linux.config.js --env production
ExecStop=/usr/bin/pm2 stop $APP_DIR/ecosystem-linux.config.js
PIDFile=$APP_DIR/.pm2/pm2.pid
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable aria5-platform
    
    log "✓ Systemd service configured"
}

# Setup log rotation
setup_logrotate() {
    log "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/aria5-platform > /dev/null <<EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
    
    log "✓ Log rotation configured"
}

# Start services
start_services() {
    log "Starting services..."
    
    # Initialize database
    cd "$APP_DIR"
    sudo -u "$APP_USER" npm run db:init || warn "Database initialization failed or already exists"
    
    # Start PM2 processes
    sudo -u "$APP_USER" pm2 start ecosystem-linux.config.js --env production
    sudo -u "$APP_USER" pm2 save
    sudo -u "$APP_USER" pm2 startup
    
    # Start systemd service
    sudo systemctl start aria5-platform
    
    log "✓ Services started"
}

# Main deployment function
main() {
    log "Starting ARIA5.1 Platform Linux deployment..."
    
    check_root
    check_requirements
    install_dependencies
    setup_user_and_directories
    deploy_application
    configure_redis
    configure_nginx
    setup_ssl
    configure_firewall
    setup_systemd
    setup_logrotate
    start_services
    
    log "✅ ARIA5.1 Platform deployment completed successfully!"
    log ""
    log "🌐 Access your platform at: http://${DOMAIN:-localhost}"
    log "📊 Health check: http://${DOMAIN:-localhost}/health"
    log "🔍 Dynamic Risk Engine: http://${DOMAIN:-localhost}/dynamic-risk-analysis"
    log ""
    log "📋 Management commands:"
    log "  - View logs: sudo journalctl -u aria5-platform -f"
    log "  - PM2 status: sudo -u $APP_USER pm2 status"
    log "  - Restart app: sudo systemctl restart aria5-platform"
    log "  - Nginx status: sudo systemctl status nginx"
    log "  - Redis status: sudo systemctl status redis-server"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --email)
            EMAIL="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [--domain DOMAIN] [--email EMAIL]"
            echo ""
            echo "Options:"
            echo "  --domain DOMAIN   Domain name for the application (enables SSL)"
            echo "  --email EMAIL     Email for SSL certificate registration"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Run main deployment
main