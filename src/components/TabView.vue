<template>
  <div class="admin-tabs" :class="{ 'fixed': fixedTags }">
    <el-tabs
      v-model="activeTab"
      type="card"
      @tab-click="handleTabClick"
      @tab-remove="removeTab"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.fullPath"
        :label="tab.title"
        :name="tab.fullPath"
        :closable="!tab.affix"
      >
        <template #label>
          <span>{{ tab.title }}</span>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'TabView',
  props: {
    fixedTags: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()

    // 计算属性
    const activeTab = computed(() => store.getters['tabs/activeTab'])
    const tabs = computed(() => store.getters['tabs/allTabs'])

    // 方法
    const handleTabClick = (tab: any) => {
      // 使用 tab.name 作为完整路径进行路由跳转
      if (tab.name && tab.name !== activeTab.value) {
        router.push(tab.name)
      }
    }

    const removeTab = async (targetFullPath: string) => {
      // 调用store的removeTab action
      const nextPath = await store.dispatch('tabs/removeTab', targetFullPath)
      
      // 如果返回了下一个路径，则跳转
      if (nextPath) {
        router.push(nextPath)
      } else {
        // 如果没有其他标签页，跳转到设置页面
        router.push('/admin/settings')
      }
    }

    return {
      activeTab,
      tabs,
      handleTabClick,
      removeTab
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

/* 暗色主题 */
:deep(.dark-theme) .admin-tabs {
  background-color: #1f1f1f;
  border-bottom-color: #303030;
}

:deep(.dark-theme) .admin-tabs .el-tabs__item {
  color: #e6e6e6;
  background-color: #2a2a2a;
  border-color: #404040;
}

:deep(.dark-theme) .admin-tabs .el-tabs__item:hover {
  color: #fff;
  background-color: #3a3a3a;
}

:deep(.dark-theme) .admin-tabs .el-tabs__item.is-active {
  color: #fff;
  background-color: #1e1c72;
  border-color: #1e1c72;
  font-weight: 600;
}

/* 标签页样式优化 */
:deep(.admin-tabs .el-tabs__item) {
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.admin-tabs .el-tabs__item:hover) {
  color: #1e1c72;
}

:deep(.admin-tabs .el-tabs__item.is-active) {
  color: #1e1c72;
  font-weight: 600;
}

/* 标签页内容区域样式 */
:deep(.admin-tabs .el-tabs__content) {
  background-color: transparent;
}
</style> 