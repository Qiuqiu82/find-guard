<template>
  <div>
    <!-- 普通直线连接线 -->
    <template v-if="lineType === 'straight'">
      <div
        :class="['connection-line', isLeftSide ? 'connection-line-left' : 'connection-line-right']"
        :style="straightLineStyle"
        :data-index="pointIndex"
      ></div>
    </template>
    
    <!-- 特殊折线连接线 -->
    <template v-else-if="lineType === 'l-shape'">
      <!-- 竖线 -->
      <div
        :style="verticalLineStyle"
      ></div>
      <!-- 横线 -->
      <div
        :style="horizontalLineStyle"
      ></div>
    </template>
    
    <!-- 十字连接线 -->
    <template v-else-if="lineType === 'cross'">
      <!-- 竖线 -->
      <div
        :style="crossVerticalStyle"
      ></div>
      <!-- 横线 -->
      <div
        :style="crossHorizontalStyle"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  point: {
    pixelX: number;
    pixelY: number;
    pixelWidth: number;
    pixelHeight: number;
    x: number;
    y: number;
  };
  pointIndex: number;
  lineType: 'straight' | 'l-shape' | 'cross';
  imageName: string;
  isLeftSide: boolean;
  customOffset?: {
    vertical?: number;
    horizontal?: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  customOffset: () => ({})
});

// 判断是否为特殊图片的特殊点位
const isSpecialPoint = computed(() => {
  const { imageName, pointIndex } = props;
  
  // 图9点2、图3点4：整体下移100px并加长
  if ((imageName.includes('p9.jpg') && pointIndex === 1) || 
      (imageName.includes('p3.jpg') && pointIndex === 3)) {
    return 'extended-down';
  }
  
  // 图3点1：折线（竖150px，横150px，竖线起点右移30px）
  if (imageName.includes('p3.jpg') && pointIndex === 0) {
    return 'l-shape-large';
  }
  
  // 图6点2：折线（竖30px，横30px，竖线起点为下边线中间）
  if (imageName.includes('p6.jpg') && pointIndex === 1) {
    return 'l-shape-small';
  }
  
  return 'normal';
});

// 普通直线样式
const straightLineStyle = computed(() => {
  const { point, isLeftSide, customOffset } = props;
  const specialType = isSpecialPoint.value;
  
  let topOffset = 0;
  let width = isLeftSide ? 230 : 80;
  
  if (specialType === 'extended-down') {
    topOffset = 100;
    width = isLeftSide ? 260 : 120;
  }
  
  return {
    position: 'absolute',
    left: isLeftSide 
      ? `${point.pixelX - width}px` 
      : `${point.pixelX + point.pixelWidth}px`,
    top: `${point.pixelY + point.pixelHeight/2 + topOffset}px`,
    width: `${width}px`,
    height: '3px',
    backgroundColor: '#1a175d',
    zIndex: 10,
    transform: 'translateY(-50%)'
  };
});

// L型折线竖线样式
const verticalLineStyle = computed(() => {
  const { point, customOffset } = props;
  const specialType = isSpecialPoint.value;
  
  let left = point.pixelX;
  let height = 150;
  
  if (specialType === 'l-shape-large') {
    left = point.pixelX + 30;
    height = 150;
  } else if (specialType === 'l-shape-small') {
    left = point.pixelX + point.pixelWidth/2;
    height = 30;
  }
  
  return {
    position: 'absolute',
    left: `${left}px`,
    top: `${point.pixelY + point.pixelHeight}px`,
    width: '3px',
    height: `${height}px`,
    backgroundColor: '#1a175d',
    zIndex: 10
  };
});

// L型折线横线样式
const horizontalLineStyle = computed(() => {
  const { point, customOffset } = props;
  const specialType = isSpecialPoint.value;
  
  let left = point.pixelX;
  let top = point.pixelY + point.pixelHeight;
  let width = 150;
  
  if (specialType === 'l-shape-large') {
    left = point.pixelX + 30;
    top = point.pixelY + point.pixelHeight + 150;
    width = 150;
  } else if (specialType === 'l-shape-small') {
    left = point.pixelX + point.pixelWidth/2;
    top = point.pixelY + point.pixelHeight + 30;
    width = 30;
  }
  
  return {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: '3px',
    backgroundColor: '#1a175d',
    zIndex: 10
  };
});

// 十字连接线样式
const crossVerticalStyle = computed(() => {
  const { point, customOffset } = props;
  return {
    position: 'absolute',
    left: `${point.pixelX + point.pixelWidth/2}px`,
    top: `${point.pixelY + point.pixelHeight}px`,
    width: '3px',
    height: '100px',
    backgroundColor: '#1a175d',
    zIndex: 10
  };
});

const crossHorizontalStyle = computed(() => {
  const { point, customOffset } = props;
  return {
    position: 'absolute',
    left: `${point.pixelX + point.pixelWidth/2 - 50}px`,
    top: `${point.pixelY + point.pixelHeight + 100}px`,
    width: '100px',
    height: '3px',
    backgroundColor: '#1a175d',
    zIndex: 10
  };
});
</script>

<style scoped>
/* 连接线基础样式 */
.connection-line {
  position: absolute;
  height: 2.5px;
  background-color: #1a175d;
  z-index: 5;
  margin-right: -1px;
  transition: none;
  transform: translateY(-50%);
  pointer-events: none;
}

/* 右侧连接线样式 */
.connection-line-right {
  width: 80px;
  transform: translateY(-50%) translateX(-1.25px);
}

/* 左侧连接线样式 */
.connection-line-left {
  width: 230px !important;
  transform: translateY(-50%);
  right: auto;
}
</style>
