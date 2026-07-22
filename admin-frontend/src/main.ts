import { createApp } from 'vue'
import { ElLoading } from 'element-plus'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/theme.css'
import './styles/responsive.css'
import './style.css'

const app = createApp(App)

app.directive('loading', ElLoading.directive)
app.use(router)
app.use(createPinia())

app.mount('#app')
