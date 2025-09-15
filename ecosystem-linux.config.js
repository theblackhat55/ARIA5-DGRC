// PM2 Configuration for Linux Server Deployment
module.exports = {
  apps: [
    {
      name: 'webapp-linux',
      script: './dist/server-linux.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable clustering for better performance
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        DATABASE_PATH: './data/aria5-production.db',
        REDIS_URL: 'redis://localhost:6379',
        STORAGE_PATH: './uploads',
        JWT_SECRET: 'aria5-production-jwt-secret-2024-change-in-production-very-secure',
        SESSION_TIMEOUT: 86400,
        MAX_FILE_SIZE: 50000000,
        RATE_LIMIT_REQUESTS: 1000,
        RATE_LIMIT_WINDOW: 3600
      },
      
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
        DATABASE_PATH: './data/aria5-dev.db',
        REDIS_URL: 'redis://localhost:6379',
        STORAGE_PATH: './uploads-dev',
        JWT_SECRET: 'aria5-development-jwt-secret-2024',
        RATE_LIMIT_REQUESTS: 100,
        RATE_LIMIT_WINDOW: 900
      },
      
      // Process management
      watch: false, // Disable file watching in production
      ignore_watch: ['node_modules', 'logs', 'uploads', 'data'],
      max_memory_restart: '1G',
      
      // Logging
      log_file: './logs/app.log',
      out_file: './logs/app-out.log',
      error_file: './logs/app-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Health monitoring
      health_check_grace_period: 30000
    },
    
    // Redis server management (optional)
    {
      name: 'redis-server',
      script: 'redis-server',
      args: './config/redis.conf',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'https://github.com/your-org/aria5-platform.git',
      path: '/var/www/aria5-platform',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build:prod && pm2 reload ecosystem-linux.config.js --env production',
      'pre-setup': 'sudo apt-get update && sudo apt-get install -y nodejs npm redis-server nginx'
    },
    
    staging: {
      user: 'deploy',
      host: 'staging-server.com',
      ref: 'origin/develop', 
      repo: 'https://github.com/your-org/aria5-platform.git',
      path: '/var/www/aria5-platform-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem-linux.config.js --env development'
    }
  }
}