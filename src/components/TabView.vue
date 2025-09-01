<template>
  <div class="admin-tabs" :class="{ 'fixed': fixedTags }">
    <div class="tabs-container">
      <!-- 返回主页按钮 -->
      <el-button 
        v-if="!isHomePage"
        type="text" 
        class="home-btn"
        @click="goToHomePage"
        title="返回游戏设置"
      >
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      
      <!-- 当前页面标题 -->
      <div class="current-page-title">
        <el-icon v-if="currentPageIcon">
          <component :is="currentPageIcon" />
        </el-icon>
        <span>{{ currentPageTitle }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'TabView',
  components: {
    ArrowLeft
  },
  props: {
    fixedTags: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    // 计算属性
    const activeTab = computed(() => store.getters['tabs/activeTab'])
    const tabs = computed(() => store.getters['tabs/allTabs'])
    
    // 当前页面信息
    const currentPageTitle = computed(() => {
      return route.meta?.title || '未知页面'
    })
    
    const currentPageIcon = computed(() => {
      return route.meta?.icon
    })
    
    // 判断是否在主页（游戏设置页）
    const isHomePage = computed(() => {
      return route.path === '/admin/settings'
    })

    // 方法
    const goToHomePage = () => {
      router.push('/admin/settings')
    }

    return {
      activeTab,
      tabs,
      currentPageTitle,
      currentPageIcon,
      isHomePage,
      goToHomePage
    }
  }
})
</script>

<style scoped>
.admin-tabs {
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 24px;
}

.admin-tabs.fixed {
  position: sticky;
  top: 64px;
  z-index: 999;
}

.tabs-container {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
}

.home-btn {
  padding: 8px;
  border-radius: 6px;
  color: #666;
  font-size: 16px;
  transition: all 0.3s ease;
}

.home-btn:hover {
  color: #1e1c72;
  background-color: #f5f5f5;
}

.current-page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.current-page-title .el-icon {
  font-size: 18px;
  color: #1e1c72;
}

.current-page-title span {
  line-height: 1;
}

/* 暗色主题 */
:deep(.dark-theme) .admin-tabs {
  background-color: #1f1f1f;
  border-bottom-color: #303030;
}

:deep(.dark-theme) .home-btn {
  color: #e6e6e6;
}

:deep(.dark-theme) .home-btn:hover {
  color: #fff;
  background-color: #3a3a3a;
}

:deep(.dark-theme) .current-page-title {
  color: #e6e6e6;
}

:deep(.dark-theme) .current-page-title .el-icon {
  color: #1e1c72;
}
</style> 