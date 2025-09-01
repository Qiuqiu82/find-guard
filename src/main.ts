import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import './style.css'

// 创建应用
const app = createApp(App)

// 全局CSS变量，设置Element Plus主题色
document.documentElement.style.setProperty('--el-color-primary', '#1e1c72');

app.use(ElementPlus)
app.use(router)
app.use(store)

// 初始化游戏数据
store.dispatch('game/initGame')

app.mount('#app')
