import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// 开发环境加载 Mock 已关闭，连接真实后端
// if (import.meta.env.DEV) {
//   import('./mock')
// }

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.use(createPinia())

app.mount('#app')
