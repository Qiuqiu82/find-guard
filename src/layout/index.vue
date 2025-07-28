<script setup lang="ts">
// 主布局组件
</script>

<template>
  <div class="app-layout">
    <!-- 内容区域直接使用router-view -->
    <router-view />
  </div>
</template>

<style scoped>
.app-layout {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
