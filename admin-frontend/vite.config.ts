import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import ElementPlus from 'unplugin-element-plus/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

function chunkNameForModule(id: string) {
  if (id.includes('node_modules')) {
    if (id.includes('element-plus') || id.includes('@element-plus')) {
      return 'vendor-element'
    }
    if (id.includes('echarts')) {
      return 'vendor-charts'
    }
    if (id.includes('xlsx')) {
      return 'vendor-spreadsheet'
    }
    if (
      id.includes('vue-router') ||
      id.includes('/vue/') ||
      id.includes('/pinia/')
    ) {
      return 'vendor-vue'
    }
    return 'vendor-misc'
  }

  return undefined
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const apiOrigin = env.VITE_API_ORIGIN || 'http://localhost:8000'

  return {
    plugins: [
      vue(),
      Components({
        dts: false,
        resolvers: [ElementPlusResolver({ importStyle: 'css' })],
      }),
      ElementPlus({}),
    ],
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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            return chunkNameForModule(id)
          },
        },
      },
    },
  }
})
