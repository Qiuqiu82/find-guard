<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <button @click="goHome">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
  text-align: center;
}

.content {
  max-width: 500px;
}

h1 {
  font-size: 72px;
  margin: 0;
  color: #1e1c72;
}

h2 {
  font-size: 32px;
  margin: 10px 0;
  color: #1e1c72;
}

p {
  color: #606266;
  margin: 20px 0 30px;
}

button {
  background-color: #1e1c72;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: #2d2a9d;
}
</style> 