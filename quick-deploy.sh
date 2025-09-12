#!/bin/bash
# ARIA5 GRC Platform - Quick Deployment Script

set -e  # Exit on any error

echo "🚀 ARIA5 GRC Platform - Quick Deployment Script"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js and npm are available"

# Install dependencies
print_info "Installing dependencies..."
npm install

# Setup environment variables
if [ ! -f .dev.vars ]; then
    print_info "Creating .dev.vars file..."
    echo 'JWT_SECRET=aria5-production-jwt-secret-2024-change-in-production-32-chars-minimum' > .dev.vars
    print_status ".dev.vars created with default JWT secret"
    print_warning "Remember to change the JWT secret for production!"
else
    print_status ".dev.vars already exists"
fi

# Check if wrangler is installed globally
if ! command -v wrangler &> /dev/null; then
    print_info "Installing Wrangler CLI globally..."
    npm install -g wrangler
    print_status "Wrangler CLI installed"
else
    print_status "Wrangler CLI is available"
fi

# Setup local database
print_info "Setting up local database..."
npm run db:migrate:local
npm run db:seed
print_status "Local database setup complete"

# Build the application
print_info "Building application..."
npm run build
print_status "Build completed successfully"

# Display next steps
echo ""
echo "🎉 Setup Complete! Next Steps:"
echo "================================"
echo ""
echo "📍 Local Development:"
echo "   npm run dev:d1          # Start local server with D1 database"
echo "   open http://localhost:3000"
echo ""
echo "🌐 Production Deployment:"
echo "   1. wrangler login                                    # Authenticate with Cloudflare"
echo "   2. wrangler d1 create aria5-production              # Create production database"
echo "   3. Update database_id in wrangler.jsonc            # Copy ID from step 2"
echo "   4. wrangler pages project create aria5-grc         # Create Cloudflare Pages project"
echo "   5. wrangler pages deploy dist --project-name aria5-grc  # Deploy to production"
echo "   6. wrangler d1 migrations apply aria5-production   # Apply database migrations"
echo "   7. wrangler pages secret put JWT_SECRET --project-name aria5-grc  # Set JWT secret"
echo ""
echo "🔐 Demo Credentials:"
echo "   Admin: admin / demo123"
echo "   Security Manager: avi_security / demo123"
echo "   Compliance Officer: sjohnson / demo123"
echo ""
echo "📚 Full documentation: ./DEPLOYMENT_GUIDE.md"
echo "🌟 Live Demo: https://ab7d4266.dynamic-risk-intelligence.pages.dev"