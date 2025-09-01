<template>
  <div class="fullscreen-layout">
    <!-- 全屏内容区域 -->
    <main class="fullscreen-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// 全屏布局组件，专门用于图片编辑
defineOptions({
  name: 'FullscreenLayout'
})

// 添加默认导出
defineExpose({})
</script>

<style scoped>
.fullscreen-layout {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
  z-index: 9999;
}

.fullscreen-main {
  width: 100%;
  height: 100%;
  position: relative;
}
</style> 