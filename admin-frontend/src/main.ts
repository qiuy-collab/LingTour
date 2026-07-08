import { createApp } from 'vue'
import { ElLoading } from 'element-plus'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/theme.css'
import './styles/responsive.css'
import './style.css'

// 开发环境加载 Mock 数据（已禁用，使用真实后端 API）
// 如需启用 Mock，取消下方注释：
// if (import.meta.env.DEV) {
//   import('./mock')
// }

const app = createApp(App)

app.directive('loading', ElLoading.directive)
app.use(router)
app.use(createPinia())

app.mount('#app')
