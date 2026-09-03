module.exports = {
  apps: [
    {
      name: 'lingtour-api',
      cwd: './api',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        REDIS_URL: 'redis://127.0.0.1:6379',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'lingtour-site',
      cwd: './site',
      script: 'server.cjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        INTERNAL_API_ORIGIN: 'http://127.0.0.1:8000/api/v1',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
    },
    {
      name: 'lingtour-admin',
      cwd: './admin-frontend',
      script: 'server.cjs',
      env: { PORT: 4173, VITE_API_ORIGIN: 'https://api.lingfengtranstour.cn' },
      instances: 1,
      autorestart: true,
    },
  ],
};
