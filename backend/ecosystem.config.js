module.exports = {
  apps: [
    {
      name: 'bnkr-backend',
      script: 'src/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/bnkr-backend-error.log',
      out_file: '/var/log/pm2/bnkr-backend-out.log',
      log_file: '/var/log/pm2/bnkr-backend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
