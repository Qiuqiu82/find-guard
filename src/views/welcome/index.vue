<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showInstructions = ref(false);

// 开始游戏
const startGame = () => {
  console.log('开始游戏被点击');
  router.push('/home');
};

// 显示游戏说明
const toggleInstructions = () => {
  console.log('游戏说明被点击');
  showInstructions.value = !showInstructions.value;
};

// 关闭游戏说明并开始游戏
const closeInstructionsAndStart = () => {
  console.log('关闭游戏说明');
  showInstructions.value = false;
  router.push('/home');
};
</script>

<template>
  <div class="welcome-container">
    <!-- 使用图片上已有的UI元素，添加点击区域 -->
    <div class="clickable-areas">
      <!-- 开始游戏按钮点击区域 -->
      <div class="start-game-area" @click="startGame"></div>
      
      <!-- 游戏说明点击区域 -->
      <div class="instructions-area" @click="toggleInstructions"></div>
    </div>

    <!-- 游戏说明弹窗 -->
    <div v-if="showInstructions" class="instructions-overlay" @click="closeInstructionsAndStart">
      <div class="instructions-content">
        <!-- 移除所有文字内容，背景图已包含所有信息 -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  width: 100%;
  height: 100vh;
  background-image: url('@/assets/images/home.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
  background-color: #1e1c72; /* 确保背景色与图片一致 */
}

.clickable-areas {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

/* 开始游戏按钮点击区域 - 根据背景图中按钮位置进行调整 */
.start-game-area {
  position: absolute;
  width: 200px;
  height: 80px;
  top: 71%;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  /*border: 1px solid red; 调试用边框 */
  z-index: 10;
}

/* 游戏说明点击区域 - 根据背景图中文字位置进行调整 */
.instructions-area {
  position: absolute;
  width: 150px;
  height: 40px;
  top: 85%;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  /*border: 1px solid blue; 调试用边框 */
  z-index: 10;
}

.instructions-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  cursor: pointer;
}

.instructions-content {
  background-image: url('@/assets/images/instructions.png');
  background-size: cover;
  background-position: center;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  padding: 0;
  position: relative;
  z-index: 101;
}

@media (max-width: 768px) {
  .start-game-area {
    width: 180px;
    height: 60px;
  }
  
  .instructions-area {
    width: 130px;
    height: 35px;
    top: 73%;
  }
  
  .instructions-content {
    width: 100vw;
    height: 100vh;
    padding: 0;
  }
}
</style> 