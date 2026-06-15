// ecosystem.config.js — PM2 Configuration for ALEYART EXAMAI PRO
module.exports = {
  apps: [
    {
      name: 'aleyart-api',
      script: './backend/src/server.js',
      cwd: '/opt/aleyart-examai-pro',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/aleyart/api-error.log',
      out_file: '/var/log/aleyart/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
};
