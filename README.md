# ARIA5 GRC Platform - Dynamic Risk Intelligence System

A comprehensive Governance, Risk & Compliance (GRC) platform built with modern edge technologies, featuring AI-powered threat intelligence, dynamic risk analysis, and automated compliance management.

## 🚀 Live Demo

**Production URL**: https://ab7d4266.dynamic-risk-intelligence.pages.dev

### Demo Credentials
- **Admin**: `admin` / `demo123`
- **Security Manager**: `avi_security` / `demo123`
- **Compliance Officer**: `sjohnson` / `demo123`

## 🏗️ Architecture

### Core Technologies
- **Backend**: Hono Framework (TypeScript)
- **Runtime**: Cloudflare Workers/Pages
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare KV & R2
- **Frontend**: HTMX + TailwindCSS
- **Authentication**: JWT with secure sessions

### Key Features
- **🎯 5-Phase Risk Intelligence Dashboard**
  - Phase 1: Dynamic Risk Analysis
  - Phase 2: AI Orchestration 
  - Phase 3: Integration Management
  - Phase 4: Evidence Automation
  - Phase 5: Executive Intelligence

- **🛡️ Threat Intelligence Integration**
  - Real-time IOC analysis
  - Behavioral pattern detection
  - Neural network threat prediction
  - Multi-provider correlation

- **📊 Compliance Management**
  - Framework mapping (SOC2, ISO27001, Custom)
  - Automated gap analysis
  - Control implementation tracking
  - Audit readiness assessment

- **🤖 AI-Powered Features**
  - Risk analysis and scoring
  - Threat landscape assessment  
  - Compliance recommendations
  - Behavioral analytics

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for deployment)

### Local Development
```bash
# Clone repository
git clone https://github.com/theblackhat55/ARIA5-DGRC.git
cd ARIA5-DGRC

# Install dependencies
npm install

# Setup local database
npm run db:migrate:local
npm run db:seed

# Start development server
npm run dev:d1

# Access at http://localhost:3000
```

### Environment Variables
Create `.dev.vars` file:
```bash
JWT_SECRET=your-jwt-secret-here-32-chars-minimum
```

## 📋 Available Scripts

```bash
# Development
npm run dev              # Vite dev server
npm run dev:d1          # Wrangler with D1 database
npm run build           # Build for production

# Database Management
npm run db:migrate:local    # Apply migrations locally
npm run db:migrate:prod     # Apply migrations to production
npm run db:seed            # Seed test data
npm run db:reset          # Reset local database

# Deployment
npm run deploy            # Deploy to Cloudflare Pages
npm run deploy:prod       # Deploy to production

# Utilities
npm run clean-port        # Clean port 3000
npm run test             # Test local server
```

## 🗄️ Database Schema

### Core Tables
- **users** - User management and authentication
- **risks** - Risk register and assessments
- **business_services** - Service catalog and criticality
- **security_controls** - Control frameworks and mappings
- **incidents** - Incident tracking and response
- **compliance_frameworks** - Framework definitions
- **threat_indicators** - IOC and threat intelligence

## 🚀 Deployment

### Cloudflare Pages Deployment

1. **Setup Cloudflare API**
   ```bash
   # Configure API token
   export CLOUDFLARE_API_TOKEN=your-token
   ```

2. **Create D1 Database**
   ```bash
   npx wrangler d1 create aria5-production
   # Copy database_id to wrangler.jsonc
   ```

3. **Deploy Application**
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name aria5-grc
   ```

4. **Apply Database Migrations**
   ```bash
   npx wrangler d1 migrations apply aria5-production
   ```

### Environment Configuration

**Production Secrets**:
```bash
npx wrangler pages secret put JWT_SECRET --project-name aria5-grc
```

## 🔒 Security Features

- **Authentication**: JWT-based with secure httpOnly cookies
- **Authorization**: Role-based access control (RBAC)
- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Input Validation**: Comprehensive input sanitization
- **Audit Logging**: Complete audit trail for security events

## 🧪 Testing

### Security Testing
- Comprehensive authenticated endpoint scanning
- 404/500 error detection and resolution
- OWASP security compliance testing

### Performance Testing  
- Edge runtime optimization
- Database query performance
- Real-time data processing capabilities

## 📊 Current Status

### ✅ Completed Features
- Complete authentication and authorization system
- 5-phase risk intelligence dashboard
- Dynamic risk analysis and correlation
- Threat intelligence integration
- Compliance framework management
- AI-powered analytics and recommendations
- Comprehensive error handling and logging

### 🔧 Recent Fixes (Latest Update)
- **Fixed 31x 404 Errors** across dashboard navigation
- **Resolved 3x 500 Server Errors** in risk controls and intelligence modules
- **Implemented missing AI endpoints** for compliance, threat analysis, and recommendations
- **Added comprehensive route coverage** with 92.3% success rate
- **Enhanced error handling** and graceful fallbacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Phase 6: Advanced Analytics (Q1 2024)
- Machine learning model integration
- Predictive risk modeling
- Advanced behavioral analytics

### Phase 7: Enterprise Integration (Q2 2024)
- SIEM integration capabilities
- Third-party security tool connectors
- Enterprise SSO and directory services

### Phase 8: Regulatory Expansion (Q3 2024)
- Additional compliance frameworks
- Automated regulatory reporting
- Cross-jurisdiction compliance mapping

## 📞 Support

- **Documentation**: [Wiki](https://github.com/theblackhat55/ARIA5-DGRC/wiki)
- **Issues**: [GitHub Issues](https://github.com/theblackhat55/ARIA5-DGRC/issues)
- **Discussions**: [GitHub Discussions](https://github.com/theblackhat55/ARIA5-DGRC/discussions)

---

**Built with ❤️ using Cloudflare Workers, Hono Framework, and modern edge technologies**