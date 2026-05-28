module.exports = {
  apps: [
    {
      name: 'lingtour-api',
      cwd: './api',
      script: 'dist/main.js',
      env: { NODE_ENV: 'production', PORT: 8000 },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'lingtour-site',
      cwd: './site',
      script: 'server.cjs',
      env: { NODE_ENV: 'production', PORT: 3001 },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
    },
    {
      name: 'lingtour-admin',
      cwd: './projects/proj-1778970788262-5mcldi/admin-frontend',
      script: 'server.cjs',
      env: { PORT: 4173, VITE_API_ORIGIN: 'https://api.lingfengtranstour.cn' },
      instances: 1,
      autorestart: true,
    },
  ],
};
