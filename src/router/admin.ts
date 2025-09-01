import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: {
      title: '后台管理',
      requiresAuth: true,
      isAdmin: true
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        redirect: '/admin/settings'
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/GameSettings.vue'),
        meta: {
          title: '游戏设置',
          icon: 'Setting',
          affix: true,
          keepAlive: true
        }
      },
      // component: () => import('../views/admin/ImageManagement.vue'),
//component: () => import('../views/admin/DataManagement.vue'),
      {
        path: 'images',
        name: 'AdminImages',
        component: () => import('../views/admin/ImageManagement.vue'),
        meta: {
          title: '图片管理',
          icon: 'Picture',
          keepAlive: true
        }
      },
      {
        path: 'images/editor/:id',
        name: 'ImageEditor',
        component: () => import('@/pages/admin/images/ImageEditorPage.vue'),
        meta: {
          title: '图片编辑',
          hidden: true
        }
      },
      {
        path: 'data',
        name: 'AdminData',
        component: () => import('../views/admin/DataManagement.vue'),
        meta: {
          title: '数据管理',
          icon: 'FolderOpened',
          keepAlive: true
        }
      },
      {
        path: 'about',
        name: 'AdminAbout',
        component: () => import('../views/admin/About.vue'),
        meta: {
          title: '关于',
          icon: 'InfoFilled',
          keepAlive: true
        }
      },
      {
        path: 'test',
        name: 'AdminTest',
        component: () => import('../views/admin/Test.vue'),
        meta: {
          title: '测试页面',
          icon: 'InfoFilled',
          keepAlive: false
        }
      }
    ]
  }
] 