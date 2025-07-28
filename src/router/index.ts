import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

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
    component: () => import('../layout/index.vue'),
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