import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import ElementPlus from 'unplugin-element-plus/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const elementChunkGroups: Record<string, string> = {
  autocomplete: 'overlay',
  breadcrumb: 'navigation',
  button: 'core',
  card: 'content',
  checkbox: 'forms',
  col: 'layout',
  'config-provider': 'core',
  'date-picker': 'forms',
  descriptions: 'data',
  dialog: 'overlay',
  divider: 'layout',
  drawer: 'overlay',
  dropdown: 'navigation',
  empty: 'data',
  form: 'forms',
  icon: 'core',
  image: 'content',
  input: 'forms',
  'input-number': 'forms',
  loading: 'core',
  menu: 'navigation',
  option: 'forms',
  'option-group': 'forms',
  pagination: 'data',
  popover: 'overlay',
  progress: 'data',
  radio: 'forms',
  row: 'layout',
  scrollbar: 'layout',
  select: 'forms',
  skeleton: 'data',
  space: 'layout',
  switch: 'forms',
  table: 'data',
  'tab-pane': 'navigation',
  tabs: 'navigation',
  tag: 'data',
  'time-picker': 'forms',
  tooltip: 'overlay',
  upload: 'forms',
}

function chunkNameForElementModule(id: string) {
  const normalizedId = id.replace(/\\/g, '/')

  if (normalizedId.includes('/@element-plus/icons-vue/')) {
    return 'vendor-element-icons'
  }

  const componentMatch = normalizedId.match(
    /\/element-plus\/(?:es|lib)\/components\/([^/]+)\//,
  )

  if (componentMatch) {
    const group = elementChunkGroups[componentMatch[1]] ?? 'core'
    return `vendor-element-${group}`
  }

  if (
    normalizedId.includes('/element-plus/') ||
    normalizedId.includes('/@element-plus/')
  ) {
    return 'vendor-element-core'
  }

  return undefined
}

function chunkNameForModule(id: string) {
  if (id.includes('node_modules')) {
    const elementChunkName = chunkNameForElementModule(id)
    if (elementChunkName) {
      return elementChunkName
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
