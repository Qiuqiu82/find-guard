<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- 不需要额外内容，游戏界面将直接包含所需的UI元素 -->
    </div>
  </header>
</template>

<style scoped>
.app-header {
  width: 100%;
  height: 60px;
  background-color: #1e1c72;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  height: 100%;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style> 