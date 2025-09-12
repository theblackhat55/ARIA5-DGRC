#!/usr/bin/env python3
"""
ARIA5 GRC Platform - Authenticated Security Scanner
==================================================

This script performs comprehensive authenticated crawling of the ARIA5 GRC platform
to identify all accessible pages and detect HTTP 400/500 errors.

Target: https://dynamic-risk-intelligence.pages.dev
Authentication: Form-based with demo credentials
"""

import requests
import json
import time
import re
from urllib.parse import urljoin, urlparse, parse_qs
from bs4 import BeautifulSoup
from collections import defaultdict, deque
import logging
from datetime import datetime
import csv
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/user/webapp/scan_results.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class ARIA5Scanner:
    def __init__(self, base_url="https://dynamic-risk-intelligence.pages.dev"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'ARIA5-Security-Scanner/1.0 (Authenticated Penetration Testing)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        # Track discovered URLs and errors
        self.discovered_urls = set()
        self.crawled_urls = set()
        self.error_pages = defaultdict(list)
        self.successful_pages = []
        self.authentication_failures = []
        self.csrf_tokens = {}
        
        # Rate limiting
        self.request_delay = 1  # 1 second between requests
        self.max_retries = 3
        
        # Known ARIA5 routes from the codebase analysis
        self.known_routes = [
            '/', '/dashboard', '/login', '/health',
            '/risk', '/compliance', '/operations', '/intelligence', '/admin',
            '/phase1', '/phase2', '/phase3', '/phase4', '/phase5',
            '/dynamic-risk-analysis',
            '/api/health', '/api/risks', '/api/compliance', '/api/services',
            '/api/threat-intelligence/sources', '/api/threat-intelligence/indicators',
            '/api/analytics/trends', '/api/analytics/threat-landscape',
            '/api/validation/queue', '/api/validation/metrics'
        ]
        
        # Demo credentials from README
        self.credentials = [
            {'username': 'admin', 'password': 'demo123', 'role': 'admin'},
            {'username': 'avi_security', 'password': 'demo123', 'role': 'security_manager'}
        ]

    def authenticate(self, username, password):
        """Authenticate with the ARIA5 platform using form-based login"""
        logger.info(f"🔐 Attempting authentication as: {username}")
        
        try:
            # Step 1: Get login page and extract any CSRF tokens
            login_url = urljoin(self.base_url, '/login')
            response = self.session.get(login_url, timeout=10)
            
            if response.status_code != 200:
                logger.error(f"❌ Failed to access login page: {response.status_code}")
                return False
            
            # Parse login form for CSRF tokens or hidden fields
            soup = BeautifulSoup(response.text, 'html.parser')
            csrf_token = None
            
            # Look for CSRF token in meta tags or hidden inputs
            csrf_meta = soup.find('meta', {'name': 'csrf-token'})
            if csrf_meta:
                csrf_token = csrf_meta.get('content')
            else:
                csrf_input = soup.find('input', {'name': 'csrf_token'})
                if csrf_input:
                    csrf_token = csrf_input.get('value')
            
            # Step 2: Submit login credentials
            auth_url = urljoin(self.base_url, '/auth/login')
            login_data = {
                'username': username,
                'password': password
            }
            
            # Add CSRF token if found
            if csrf_token:
                login_data['csrf_token'] = csrf_token
                self.csrf_tokens['login'] = csrf_token
            
            # Set headers for form submission
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': login_url,
                'X-Requested-With': 'XMLHttpRequest'  # HTMX header
            }
            
            auth_response = self.session.post(
                auth_url, 
                data=login_data,
                headers=headers,
                timeout=10,
                allow_redirects=True
            )
            
            logger.info(f"🔍 Auth response: {auth_response.status_code}")
            logger.info(f"🍪 Cookies received: {list(self.session.cookies.keys())}")
            
            # Step 3: Verify authentication by checking for auth cookie or redirect
            if 'aria_token' in self.session.cookies:
                logger.info(f"✅ Successfully authenticated as {username} (JWT token received)")
                return True
            elif auth_response.status_code == 302:
                # Check if redirected to dashboard (successful auth)
                if '/dashboard' in auth_response.headers.get('location', ''):
                    logger.info(f"✅ Successfully authenticated as {username} (redirect to dashboard)")
                    return True
            elif auth_response.status_code == 200:
                # Check response content for success indicators
                if 'dashboard' in auth_response.text.lower() or 'welcome' in auth_response.text.lower():
                    logger.info(f"✅ Successfully authenticated as {username} (success page)")
                    return True
            
            # Authentication failed
            logger.error(f"❌ Authentication failed for {username}")
            logger.error(f"Response content preview: {auth_response.text[:500]}")
            return False
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Network error during authentication: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error during authentication: {e}")
            return False

    def is_authenticated(self):
        """Check if current session is authenticated"""
        try:
            # Try accessing a protected endpoint
            dashboard_url = urljoin(self.base_url, '/dashboard')
            response = self.session.get(dashboard_url, timeout=10, allow_redirects=False)
            
            # If we get 200, we're authenticated
            if response.status_code == 200:
                return True
            # If we get redirected to login, we're not authenticated
            elif response.status_code == 302 and '/login' in response.headers.get('location', ''):
                return False
            # Other redirects might be normal
            elif response.status_code == 302:
                return True
            else:
                return False
                
        except Exception as e:
            logger.error(f"❌ Error checking authentication status: {e}")
            return False

    def make_request(self, url, method='GET', **kwargs):
        """Make an authenticated request with error handling and retry logic"""
        full_url = urljoin(self.base_url, url) if not url.startswith('http') else url
        
        for attempt in range(self.max_retries):
            try:
                # Add delay between requests
                time.sleep(self.request_delay)
                
                # Make request
                if method.upper() == 'GET':
                    response = self.session.get(full_url, timeout=15, **kwargs)
                elif method.upper() == 'POST':
                    response = self.session.post(full_url, timeout=15, **kwargs)
                else:
                    response = self.session.request(method, full_url, timeout=15, **kwargs)
                
                # Handle 302 redirects to login (re-authenticate)
                if response.status_code == 302 and '/login' in response.headers.get('location', ''):
                    logger.warning(f"🔄 Got 302 redirect to login for {full_url}, re-authenticating...")
                    self.authentication_failures.append({
                        'url': full_url,
                        'timestamp': datetime.now().isoformat(),
                        'status_code': response.status_code
                    })
                    
                    # Try to re-authenticate with available credentials
                    for cred in self.credentials:
                        if self.authenticate(cred['username'], cred['password']):
                            # Retry the original request
                            return self.make_request(url, method, **kwargs)
                    
                    logger.error(f"❌ Failed to re-authenticate for {full_url}")
                    return response
                
                return response
                
            except requests.exceptions.Timeout:
                logger.warning(f"⏱️ Timeout on attempt {attempt + 1} for {full_url}")
                if attempt == self.max_retries - 1:
                    raise
            except requests.exceptions.RequestException as e:
                logger.warning(f"⚠️ Request error on attempt {attempt + 1} for {full_url}: {e}")
                if attempt == self.max_retries - 1:
                    raise
        
        return None

    def extract_links_from_page(self, url, html_content):
        """Extract all links from HTML content"""
        links = set()
        
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract links from <a> tags
            for link in soup.find_all('a', href=True):
                href = link['href']
                full_url = urljoin(url, href)
                # Only include links within the same domain
                if urlparse(full_url).netloc == urlparse(self.base_url).netloc or href.startswith('/'):
                    links.add(full_url)
            
            # Extract HTMX endpoints (hx-get, hx-post, etc.)
            htmx_attrs = ['hx-get', 'hx-post', 'hx-put', 'hx-delete', 'hx-patch']
            for attr in htmx_attrs:
                for element in soup.find_all(attrs={attr: True}):
                    endpoint = element.get(attr)
                    if endpoint:
                        full_url = urljoin(url, endpoint)
                        if urlparse(full_url).netloc == urlparse(self.base_url).netloc or endpoint.startswith('/'):
                            links.add(full_url)
            
            # Extract form actions
            for form in soup.find_all('form', action=True):
                action = form['action']
                full_url = urljoin(url, action)
                if urlparse(full_url).netloc == urlparse(self.base_url).netloc or action.startswith('/'):
                    links.add(full_url)
            
        except Exception as e:
            logger.error(f"❌ Error extracting links from {url}: {e}")
        
        return links

    def crawl_page(self, url):
        """Crawl a single page and return status information"""
        logger.info(f"🕷️ Crawling: {url}")
        
        try:
            response = self.make_request(url, allow_redirects=True)
            
            if response is None:
                return {
                    'url': url,
                    'status_code': 'TIMEOUT',
                    'error': 'Request timed out',
                    'links': set()
                }
            
            # Record the result
            result = {
                'url': url,
                'status_code': response.status_code,
                'content_type': response.headers.get('content-type', ''),
                'content_length': len(response.content),
                'response_time': response.elapsed.total_seconds(),
                'links': set()
            }
            
            # Categorize by status code
            if 400 <= response.status_code < 500:
                self.error_pages['4xx'].append(result)
                logger.warning(f"⚠️ 4xx Error: {response.status_code} - {url}")
            elif 500 <= response.status_code < 600:
                self.error_pages['5xx'].append(result)
                logger.error(f"❌ 5xx Error: {response.status_code} - {url}")
            elif 200 <= response.status_code < 300:
                self.successful_pages.append(result)
                logger.info(f"✅ Success: {response.status_code} - {url}")
            else:
                self.error_pages['other'].append(result)
                logger.info(f"ℹ️ Other: {response.status_code} - {url}")
            
            # Extract links if it's HTML content
            if response.status_code == 200 and 'text/html' in result['content_type']:
                result['links'] = self.extract_links_from_page(url, response.text)
                self.discovered_urls.update(result['links'])
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error crawling {url}: {e}")
            error_result = {
                'url': url,
                'status_code': 'ERROR',
                'error': str(e),
                'links': set()
            }
            self.error_pages['exceptions'].append(error_result)
            return error_result

    def perform_authenticated_scan(self):
        """Perform comprehensive authenticated scan of the platform"""
        logger.info("🚀 Starting ARIA5 GRC Platform Authenticated Security Scan")
        logger.info(f"🎯 Target: {self.base_url}")
        
        # Step 1: Authenticate with available credentials
        authenticated = False
        current_user = None
        
        for cred in self.credentials:
            if self.authenticate(cred['username'], cred['password']):
                authenticated = True
                current_user = cred
                break
        
        if not authenticated:
            logger.error("❌ Failed to authenticate with any available credentials")
            return False
        
        logger.info(f"✅ Successfully authenticated as: {current_user['username']} ({current_user['role']})")
        
        # Step 2: Initialize crawling queue with known routes
        crawl_queue = deque(self.known_routes)
        self.discovered_urls.update(self.known_routes)
        
        # Step 3: Perform breadth-first crawling
        logger.info("🕷️ Starting comprehensive crawling...")
        crawled_count = 0
        max_pages = 200  # Reasonable limit for demo environment
        
        while crawl_queue and crawled_count < max_pages:
            url = crawl_queue.popleft()
            
            # Skip if already crawled
            if url in self.crawled_urls:
                continue
            
            # Skip external URLs
            if url.startswith('http') and not url.startswith(self.base_url):
                continue
            
            # Skip certain file types and problematic endpoints
            skip_patterns = [
                '.pdf', '.jpg', '.png', '.gif', '.css', '.js', '.ico',
                '/logout', '/api/logout', 'javascript:', 'mailto:',
                '#', 'data:'
            ]
            
            if any(pattern in url.lower() for pattern in skip_patterns):
                continue
            
            # Crawl the page
            result = self.crawl_page(url)
            self.crawled_urls.add(url)
            crawled_count += 1
            
            # Add newly discovered links to queue
            for link in result.get('links', []):
                if link not in self.discovered_urls and link not in self.crawled_urls:
                    crawl_queue.append(link)
                    self.discovered_urls.add(link)
            
            # Progress update
            if crawled_count % 10 == 0:
                logger.info(f"📊 Progress: {crawled_count} pages crawled, {len(crawl_queue)} in queue")
        
        logger.info(f"✅ Crawling completed: {crawled_count} pages processed")
        return True

    def generate_report(self):
        """Generate comprehensive security scan report"""
        logger.info("📊 Generating security scan report...")
        
        report = {
            'scan_info': {
                'target': self.base_url,
                'timestamp': datetime.now().isoformat(),
                'pages_crawled': len(self.crawled_urls),
                'total_discovered': len(self.discovered_urls),
                'successful_pages': len(self.successful_pages),
                'error_pages': sum(len(errors) for errors in self.error_pages.values()),
                'authentication_failures': len(self.authentication_failures)
            },
            'error_summary': {
                '4xx_errors': len(self.error_pages.get('4xx', [])),
                '5xx_errors': len(self.error_pages.get('5xx', [])),
                'other_errors': len(self.error_pages.get('other', [])),
                'exceptions': len(self.error_pages.get('exceptions', []))
            },
            'detailed_errors': dict(self.error_pages),
            'authentication_failures': self.authentication_failures,
            'successful_pages': self.successful_pages[:10],  # First 10 for brevity
            'all_discovered_urls': list(self.discovered_urls)
        }
        
        # Save detailed report as JSON
        with open('/home/user/webapp/security_scan_report.json', 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        # Save CSV of errors for easy analysis
        with open('/home/user/webapp/error_analysis.csv', 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['URL', 'Status Code', 'Error Type', 'Content Type', 'Response Time'])
            
            for error_type, errors in self.error_pages.items():
                for error in errors:
                    writer.writerow([
                        error.get('url', ''),
                        error.get('status_code', ''),
                        error_type,
                        error.get('content_type', ''),
                        error.get('response_time', '')
                    ])
        
        # Print summary to console
        print("\n" + "="*80)
        print("🔍 ARIA5 GRC PLATFORM - SECURITY SCAN RESULTS")
        print("="*80)
        print(f"🎯 Target: {self.base_url}")
        print(f"📅 Scan Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🕷️ Pages Crawled: {len(self.crawled_urls)}")
        print(f"🔗 URLs Discovered: {len(self.discovered_urls)}")
        print("\n📊 STATUS CODE SUMMARY:")
        print(f"  ✅ Successful (2xx): {len(self.successful_pages)}")
        print(f"  ⚠️  Client Errors (4xx): {len(self.error_pages.get('4xx', []))}")
        print(f"  ❌ Server Errors (5xx): {len(self.error_pages.get('5xx', []))}")
        print(f"  🔄 Auth Failures: {len(self.authentication_failures)}")
        print(f"  💥 Exceptions: {len(self.error_pages.get('exceptions', []))}")
        
        # Display critical errors
        if self.error_pages.get('5xx'):
            print("\n🚨 CRITICAL 5xx SERVER ERRORS:")
            for error in self.error_pages['5xx'][:10]:
                print(f"  • {error['status_code']} - {error['url']}")
        
        if self.error_pages.get('4xx'):
            print("\n⚠️ CLIENT ERRORS (4xx) - Top 10:")
            for error in self.error_pages['4xx'][:10]:
                print(f"  • {error['status_code']} - {error['url']}")
        
        print(f"\n📄 Detailed reports saved:")
        print(f"  • JSON Report: /home/user/webapp/security_scan_report.json")
        print(f"  • CSV Analysis: /home/user/webapp/error_analysis.csv")
        print(f"  • Scan Logs: /home/user/webapp/scan_results.log")
        print("="*80)
        
        return report

def main():
    """Main execution function"""
    scanner = ARIA5Scanner("https://dynamic-risk-intelligence.pages.dev")
    
    try:
        # Perform authenticated scan
        if scanner.perform_authenticated_scan():
            # Generate and save reports
            scanner.generate_report()
            logger.info("✅ Security scan completed successfully")
            return 0
        else:
            logger.error("❌ Security scan failed")
            return 1
            
    except KeyboardInterrupt:
        logger.info("⚠️ Scan interrupted by user")
        scanner.generate_report()
        return 1
    except Exception as e:
        logger.error(f"❌ Unexpected error during scan: {e}")
        return 1

if __name__ == "__main__":
    exit(main())