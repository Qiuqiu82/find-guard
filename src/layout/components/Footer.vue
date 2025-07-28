<script setup lang="ts">
// 页脚组件
</script>

<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <p>找不同小游戏 &copy; {{ new Date().getFullYear() }}</p>
        <p>一个有趣的找不同游戏平台</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  width: 100%;
  background-color: #f5f7fa;
  padding: 30px 0;
  margin-top: 30px;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.footer-content {
  text-align: center;
  color: #606266;
}

.footer-content p {
  margin: 5px 0;
}

@media (max-width: 768px) {
  .footer-container {
    max-width: 375px;
    padding: 0 10px;
  }
}
</style> 