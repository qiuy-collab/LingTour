import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const apiOrigin = env.VITE_API_ORIGIN || 'http://localhost:8000'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      allowedHosts: ['admin.lingfengtranstour.cn'],
      proxy: {
        '/api/admin/auth': {
          target: apiOrigin,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/admin\/auth/, '/api/v1/auth'),
        },
        '/api/admin': {
          target: apiOrigin,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/admin/, '/api/v1/admin'),
        },
      },
    },
    preview: {
      port: 4173,
      strictPort: true,
      allowedHosts: ['admin.lingfengtranstour.cn'],
    },
  }
})
