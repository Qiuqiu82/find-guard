import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { adminRoutes } from './admin'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'welcome',
    component: () => import('../views/welcome/index.vue'),
    meta: { title: '欢迎', hidden: true }
  },
  {
    path: '/game',
    name: 'layout',
    component: () => import('@/layouts/index.vue'),
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('../views/home/index.vue'),
        meta: { title: '游戏', icon: 'game' }
      }
    ]
  },
  // 旧的路由已移除，现在使用新的管理系统路由
  // {
  //   path: '/level-editor',
  //   name: 'levelEditor',
  //   component: () => import('../views/level-editor/index.vue'),
  //   meta: { title: '关卡编辑器', hidden: true }
  // },
  // 后台管理路由
  ...adminRoutes,
  {
    path: '/404',
    name: '404',
    component: () => import('../views/error/404.vue'),
    meta: { title: '404', hidden: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { hidden: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 