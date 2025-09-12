#!/usr/bin/env python3
"""
ARIA5 GRC Platform - Detailed Error Investigation
================================================

Follow-up investigation of specific errors found in the security scan
"""

import requests
import json
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DetailedErrorInvestigator:
    def __init__(self, base_url="https://dynamic-risk-intelligence.pages.dev"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'ARIA5-Error-Investigator/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        })
        
        # Authenticate first
        self.authenticate()
    
    def authenticate(self):
        """Authenticate with admin credentials"""
        try:
            auth_url = f"{self.base_url}/auth/login"
            login_data = {
                'username': 'admin',
                'password': 'demo123'
            }
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            }
            
            response = self.session.post(auth_url, data=login_data, headers=headers)
            
            if 'aria_token' in self.session.cookies:
                logger.info("✅ Successfully authenticated for error investigation")
                return True
            else:
                logger.error("❌ Failed to authenticate")
                return False
                
        except Exception as e:
            logger.error(f"❌ Authentication error: {e}")
            return False
    
    def investigate_500_error(self, url_path):
        """Investigate a 500 error in detail"""
        logger.info(f"🔍 Investigating 500 error: {url_path}")
        
        full_url = f"{self.base_url}{url_path}"
        
        try:
            response = self.session.get(full_url, timeout=10)
            
            logger.info(f"Status Code: {response.status_code}")
            logger.info(f"Content-Type: {response.headers.get('content-type')}")
            logger.info(f"Content-Length: {len(response.content)}")
            
            # Look for error information in response
            if 'text/html' in response.headers.get('content-type', ''):
                # Check for error messages in HTML
                content = response.text.lower()
                
                error_indicators = [
                    'error', 'exception', 'stack trace', 'internal server error',
                    'database error', 'connection error', 'timeout',
                    'undefined', 'null reference', 'syntax error'
                ]
                
                found_errors = []
                for indicator in error_indicators:
                    if indicator in content:
                        found_errors.append(indicator)
                
                if found_errors:
                    logger.warning(f"🚨 Error indicators found: {found_errors}")
                
                # Look for specific error messages
                import re
                
                # Common error patterns
                error_patterns = [
                    r'error[^a-zA-Z][^<>]*',
                    r'exception[^a-zA-Z][^<>]*',
                    r'failed[^a-zA-Z][^<>]*',
                    r'undefined[^a-zA-Z][^<>]*'
                ]
                
                for pattern in error_patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    if matches:
                        logger.warning(f"🔍 Error pattern '{pattern}' matches: {matches[:3]}")
            
            # Save response for manual review
            filename = f"/home/user/webapp/error_response_{url_path.replace('/', '_')}.html"
            with open(filename, 'w') as f:
                f.write(response.text)
            logger.info(f"📄 Response saved to: {filename}")
            
            return {
                'url': url_path,
                'status_code': response.status_code,
                'headers': dict(response.headers),
                'content_preview': response.text[:1000],
                'investigation_time': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error investigating {url_path}: {e}")
            return None
    
    def investigate_404_patterns(self, url_paths):
        """Analyze 404 patterns to understand missing endpoints"""
        logger.info("🔍 Analyzing 404 error patterns...")
        
        patterns = {
            'api_endpoints': [],
            'ui_pages': [],
            'missing_features': []
        }
        
        for url_path in url_paths:
            if url_path.startswith('/api/'):
                patterns['api_endpoints'].append(url_path)
            elif any(keyword in url_path for keyword in ['/dashboard', '/phase', '/dynamic']):
                patterns['ui_pages'].append(url_path)
            else:
                patterns['missing_features'].append(url_path)
        
        logger.info(f"📊 404 Analysis:")
        logger.info(f"  • Missing API Endpoints: {len(patterns['api_endpoints'])}")
        logger.info(f"  • Missing UI Pages: {len(patterns['ui_pages'])}")
        logger.info(f"  • Other Missing Features: {len(patterns['missing_features'])}")
        
        for category, urls in patterns.items():
            if urls:
                logger.info(f"  {category.replace('_', ' ').title()}:")
                for url in urls:
                    logger.info(f"    - {url}")
        
        return patterns
    
    def run_investigation(self):
        """Run complete error investigation"""
        logger.info("🚀 Starting detailed error investigation")
        
        # Errors from the scan
        errors_500 = ['/phase5']
        errors_404 = [
            '/dynamic-risk-analysis',
            '/api/compliance',
            '/api/services', 
            '/api/threat-intelligence/sources',
            '/api/threat-intelligence/indicators',
            '/api/validation/queue',
            '/api/validation/metrics'
        ]
        
        investigation_results = {
            'timestamp': datetime.now().isoformat(),
            'target': self.base_url,
            '500_errors': [],
            '404_patterns': {},
            'recommendations': []
        }
        
        # Investigate 500 errors
        for url_path in errors_500:
            result = self.investigate_500_error(url_path)
            if result:
                investigation_results['500_errors'].append(result)
        
        # Analyze 404 patterns
        investigation_results['404_patterns'] = self.investigate_404_patterns(errors_404)
        
        # Generate recommendations
        recommendations = []
        
        if investigation_results['500_errors']:
            recommendations.append("🚨 CRITICAL: Fix 500 server errors immediately - these indicate application failures")
            
        api_404s = investigation_results['404_patterns'].get('api_endpoints', [])
        if api_404s:
            recommendations.append(f"⚠️ HIGH: {len(api_404s)} API endpoints return 404 - may indicate incomplete implementation")
            
        ui_404s = investigation_results['404_patterns'].get('ui_pages', [])
        if ui_404s:
            recommendations.append(f"🔍 MEDIUM: {len(ui_404s)} UI pages return 404 - verify intended functionality")
        
        investigation_results['recommendations'] = recommendations
        
        # Save detailed investigation report
        with open('/home/user/webapp/detailed_error_investigation.json', 'w') as f:
            json.dump(investigation_results, f, indent=2)
        
        # Print summary
        print("\n" + "="*80)
        print("🔍 DETAILED ERROR INVESTIGATION RESULTS")
        print("="*80)
        print(f"🎯 Target: {self.base_url}")
        print(f"📅 Investigation Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        print(f"\n🚨 500 SERVER ERRORS INVESTIGATED: {len(investigation_results['500_errors'])}")
        for error in investigation_results['500_errors']:
            print(f"  • {error['url']} - Status: {error['status_code']}")
        
        print(f"\n📊 404 ERROR PATTERNS:")
        for category, urls in investigation_results['404_patterns'].items():
            if urls:
                print(f"  {category.replace('_', ' ').title()}: {len(urls)}")
                for url in urls[:5]:  # Show first 5
                    print(f"    - {url}")
                if len(urls) > 5:
                    print(f"    ... and {len(urls)-5} more")
        
        print(f"\n💡 RECOMMENDATIONS:")
        for i, rec in enumerate(recommendations, 1):
            print(f"  {i}. {rec}")
        
        print(f"\n📄 Detailed report saved to: /home/user/webapp/detailed_error_investigation.json")
        print("="*80)
        
        return investigation_results

def main():
    investigator = DetailedErrorInvestigator()
    investigator.run_investigation()

if __name__ == "__main__":
    main()