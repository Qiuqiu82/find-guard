<template>
  <div class="admin-layout" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 侧边栏 -->
    <div 
      class="admin-sidebar" 
      :class="{ 
        'collapsed': sidebarCollapsed,
        'drawer': sidebarDrawer 
      }"
      :style="{ width: sidebarWidth + 'px' }"
    >
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-text" v-show="!sidebarCollapsed">管理系统</span>
          <span class="logo-text-collapsed" v-show="sidebarCollapsed">管</span>
        </div>
        <el-button
          v-if="!sidebarCollapsed"
          type="text"
          class="collapse-btn"
          @click="toggleSidebar"
        >
          <el-icon><Fold /></el-icon>
        </el-button>
      </div>
      
                           <el-menu
          :default-active="route.path"
          :collapse="sidebarCollapsed"
          :unique-opened="true"
          router
          class="sidebar-menu"
        >
                 <el-menu-item 
           v-for="menuRoute in menuRoutes" 
           :key="menuRoute.path"
           :index="`/admin/${menuRoute.path}`"
         >
          <el-icon><component :is="menuRoute.meta?.icon" /></el-icon>
          <template #title>{{ menuRoute.meta?.title }}</template>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="admin-main">
      <!-- 顶栏 -->
      <div class="admin-header" :class="{ 'fixed': fixedHeader }">
        <div class="header-left">
          <el-button
            v-if="sidebarCollapsed"
            type="text"
            class="expand-btn"
            @click="toggleSidebar"
          >
            <el-icon><Expand /></el-icon>
          </el-button>
          
                     <!-- <el-breadcrumb separator="/">
             <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
           </el-breadcrumb> 面包屑导航-->
        </div>
        
        <div class="header-right">
          <el-button type="text" @click="refreshPage">
            <el-icon><Refresh /></el-icon>
          </el-button>
          
          <el-button type="text" @click="toggleFullscreen">
            <el-icon><FullScreen /></el-icon>
          </el-button>
          
          <el-button type="text" @click="toggleTheme">
            <el-icon><Sunny v-if="isDarkTheme" /><Moon v-else /></el-icon>
          </el-button>
          
          <el-button type="text" @click="showSettings = true">
            <el-icon><Setting /></el-icon>
          </el-button>
          
          <el-dropdown>
            <span class="user-menu">
              <el-avatar size="small" :src="userAvatar" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

                          <!-- 标签页 -->
        <TabView :fixed-tags="fixedTags" />

      <!-- 内容区 -->
      <div class="admin-content">
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="cachedViews">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </router-view>
      </div>
    </div>

    <!-- 设置抽屉 -->
    <el-drawer
      v-model="showSettings"
      title="系统设置"
      direction="rtl"
      size="300px"
    >
      <div class="settings-content">
        <el-form label-position="top">
          <el-form-item label="主题模式">
            <el-switch
              v-model="isDarkTheme"
              active-text="暗色"
              inactive-text="亮色"
              @change="toggleTheme"
            />
          </el-form-item>
          
          <el-form-item label="主色调">
            <el-color-picker
              v-model="primaryColor"
              @change="updatePrimaryColor"
            />
          </el-form-item>
          
          <el-form-item label="卡片圆角">
            <el-slider
              v-model="cardRadius"
              :min="0"
              :max="20"
              @change="updateCardRadius"
            />
          </el-form-item>
          
          <el-form-item label="固定头部">
            <el-switch
              v-model="fixedHeader"
              @change="updateFixedHeader"
            />
          </el-form-item>
          
          <el-form-item label="固定标签页">
            <el-switch
              v-model="fixedTags"
              @change="updateFixedTags"
            />
          </el-form-item>
          
          <el-form-item label="灰色模式">
            <el-switch
              v-model="grayMode"
              @change="updateGrayMode"
            />
          </el-form-item>
          
          <el-form-item label="色弱模式">
            <el-switch
              v-model="colorWeak"
              @change="updateColorWeak"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import TabView from '../components/TabView.vue'
import {
  Fold,
  Expand,
  Refresh,
  FullScreen,
  Sunny,
  Moon,
  Setting
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

// 响应式数据
const showSettings = ref(false)

// 计算属性
const isDarkTheme = computed(() => store.getters['app/isDarkTheme'])
const sidebarCollapsed = computed(() => store.state.app.sidebarCollapsed)
const sidebarDrawer = computed(() => store.state.app.sidebarDrawer)
const sidebarWidth = computed(() => store.getters['app/sidebarWidth'])
const fixedHeader = computed(() => store.state.app.fixedHeader)
const fixedTags = computed(() => store.state.app.fixedTags)
const primaryColor = computed(() => store.state.app.primaryColor)
const cardRadius = computed(() => store.state.app.cardRadius)
const grayMode = computed(() => store.state.app.grayMode)
const colorWeak = computed(() => store.state.app.colorWeak)



// 菜单路由
const menuRoutes = computed(() => {
  return router.getRoutes()
    .filter(route => 
      route.path.startsWith('/admin') && 
      route.meta?.title && 
      route.path !== '/admin' &&
      !route.meta?.hidden
    )
    .map(route => ({
      path: route.path.replace('/admin/', ''),
      meta: route.meta
    }))
})

// 当前页面标题(由TabView组件处理)
// const currentPageTitle = computed(() => {
//   return route.meta?.title || '未知页面'
// })



// 缓存的视图
const cachedViews = computed(() => {
  return router.getRoutes()
    .filter(route => route.path.startsWith('/admin') && route.meta?.keepAlive)
    .map(route => route.name as string)
    .filter(Boolean)
})

// 用户头像
const userAvatar = computed(() => {
  return 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})



// 监听路由变化
watch(() => route.fullPath, (newFullPath) => {
  // 添加新标签页（如果不存在）
  store.dispatch('tabs/addTab', route)
  // 激活当前标签页
  store.dispatch('tabs/activateTab', newFullPath)
}, { immediate: true })

// 初始化
onMounted(() => {
  // 初始化应用设置
  store.dispatch('app/initApp')
  
  // 初始化标签页
  const adminRoutes = router.getRoutes()
    .filter(route => route.path.startsWith('/admin') && route.meta?.title && route.path !== '/admin')
    .map(route => ({
      ...route,
      name: route.name || route.path.replace('/admin/', 'Admin')
    }))
  
  store.dispatch('tabs/initTabs', adminRoutes)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  handleResize()
})

const toggleSidebar = () => {
  store.dispatch('app/toggleSidebar')
}

const toggleTheme = () => {
  store.dispatch('app/toggleTheme')
}

const refreshPage = () => {
  window.location.reload()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const updatePrimaryColor = (color: string) => {
  store.commit('app/SET_PRIMARY_COLOR', color)
}

const updateCardRadius = (radius: number) => {
  store.commit('app/SET_CARD_RADIUS', radius)
}

const updateFixedHeader = (fixed: boolean) => {
  store.commit('app/SET_FIXED_HEADER', fixed)
}

const updateFixedTags = (fixed: boolean) => {
  store.commit('app/SET_FIXED_TAGS', fixed)
}

const updateGrayMode = (enabled: boolean) => {
  store.commit('app/SET_GRAY_MODE', enabled)
}

const updateColorWeak = (enabled: boolean) => {
  store.commit('app/SET_COLOR_WEAK', enabled)
}

const logout = () => {
  store.dispatch('user/setAdminStatus', false)
  router.push('/')
  ElMessage.success('已退出登录')
}

// 响应式处理
const handleResize = () => {
  // 只在小屏幕（手机）上使用抽屉模式，但不自动折叠侧边栏
  if (window.innerWidth < 768) {
    store.commit('app/SET_SIDEBAR_DRAWER', true)
  } else {
    store.commit('app/SET_SIDEBAR_DRAWER', false)
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.admin-sidebar {
  background-color: #001529;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #1f1f1f;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-text-collapsed {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  width: 100%;
  display: block;
}

.collapse-btn {
  color: #fff;
}

.sidebar-menu {
  border: none;
  background-color: transparent;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 64px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.admin-header.fixed {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.expand-btn {
  font-size: 18px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.user-menu:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
}



.admin-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.settings-content {
  padding: 20px;
}

/* 暗色主题 */
.dark-theme {
  background-color: #141414;
}

/* 侧边栏菜单样式 - 确保在不同主题下都有足够的对比度 */
.sidebar-menu {
  border: none;
  background-color: transparent;
}

/* 亮色主题下的侧边栏菜单 */
.sidebar-menu .el-menu-item {
  color: #fff !important;
  background-color: transparent !important;
  border: none !important;
}

.sidebar-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  border-right: 3px solid #1e1c72 !important;
}

.sidebar-menu .el-menu-item .el-icon {
  color: #fff !important;
}

.sidebar-menu .el-menu-item span {
  color: #fff !important;
}

/* 暗色主题下的侧边栏菜单 */
.dark-theme .sidebar-menu .el-menu-item {
  color: #e6e6e6 !important;
  background-color: transparent !important;
}

.dark-theme .sidebar-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  color: #fff !important;
}

.dark-theme .sidebar-menu .el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.25) !important;
  color: #fff !important;
  border-right: 3px solid #1e1c72 !important;
}

.dark-theme .sidebar-menu .el-menu-item .el-icon {
  color: #e6e6e6 !important;
}

.dark-theme .sidebar-menu .el-menu-item.is-active .el-icon {
  color: #fff !important;
}

.dark-theme .sidebar-menu .el-menu-item span {
  color: #e6e6e6 !important;
}

.dark-theme .sidebar-menu .el-menu-item.is-active span {
  color: #fff !important;
}

/* 暗色主题下的其他元素 */
.dark-theme .admin-header {
  background-color: #1f1f1f;
  border-bottom-color: #303030;
}

.dark-theme .admin-header .username {
  color: #e6e6e6;
}

.dark-theme .admin-header .el-breadcrumb__inner {
  color: #e6e6e6;
}

.dark-theme .admin-header .el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: #fff;
}

/* 夜间模式下右上角图标的样式 */
.dark-theme .admin-header .header-right .el-button {
  color: #e6e6e6 !important;
}

.dark-theme .admin-header .header-right .el-button:hover {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.dark-theme .admin-header .header-right .el-button .el-icon {
  color: #e6e6e6 !important;
}

.dark-theme .admin-header .header-right .el-button:hover .el-icon {
  color: #fff !important;
}

.dark-theme .admin-header .expand-btn {
  color: #e6e6e6 !important;
}

.dark-theme .admin-header .expand-btn:hover {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.dark-theme .admin-header .expand-btn .el-icon {
  color: #e6e6e6 !important;
}

.dark-theme .admin-header .expand-btn:hover .el-icon {
  color: #fff !important;
}

.dark-theme .admin-content {
  background-color: #141414;
  color: #e6e6e6;
}

/* 响应式 - 移除1280px下的自动折叠，保持侧边栏完整显示 */

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .admin-sidebar.drawer {
    transform: translateX(0);
  }
  
  .admin-main {
    margin-left: 0;
  }
}
</style> 