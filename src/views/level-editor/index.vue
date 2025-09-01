<template>
  <div class="level-editor-page">
    <div class="level-editor">
      <div class="editor-header">
        <h2>关卡编辑器</h2>
        <button class="close-btn" @click="goBack">返回游戏</button>
      </div>
      
      <div class="editor-content">
        <!-- 关卡数设置 -->
        <div class="setting-section">
          <h3>游戏设置</h3>
          <div class="setting-item">
            <label>关卡数量:</label>
            <input 
              type="number" 
              v-model="totalLevels" 
              min="1" 
              :max="allGameLevels.length"
              class="number-input"
            />
            <span class="hint">(最大: {{ allGameLevels.length }})</span>
          </div>
        </div>
        
        <!-- 图片管理 -->
        <div class="setting-section">
          <h3>图片管理</h3>
          <div class="image-list">
            <div 
              v-for="(level, index) in allGameLevels" 
              :key="index"
              class="image-item"
              @click="selectImageForEdit(index)"
            >
              <img :src="level.image" :alt="`图片${index + 1}`" />
              <div class="image-info">
                <span>图片{{ index + 1 }}</span>
                <span>{{ level.points.length }}个警示点</span>
              </div>
              <button 
                class="delete-btn" 
                @click.stop="deleteImage(index)"
                title="删除图片"
              >
                ×
              </button>
            </div>
          </div>
        </div>
        
        <!-- 图片编辑器 -->
        <div v-if="selectedImageIndex !== null" class="setting-section">
          <h3>
            编辑图片: {{ selectedImageIndex + 1 }}
            <span v-if="isDrawing" class="drawing-status">🖱️ 绘制模式</span>
          </h3>
          <div class="image-editor">
            <div class="image-container" ref="imageContainer">
              <img 
                :src="allGameLevels[selectedImageIndex].image" 
                @load="onImageLoad"
                @click="handleImageClick"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseUp"
                class="editable-image"
              />
              
              <!-- 显示现有的警示框 -->
              <div 
                v-for="(point, pointIndex) in allGameLevels[selectedImageIndex].points" 
                :key="pointIndex"
                class="existing-point"
                :style="{
                  left: `${point.x * scaleX.value}px`,
                  top: `${point.y * scaleY.value}px`,
                  width: `${point.width * scaleX.value}px`,
                  height: `${point.height * scaleY.value}px`
                }"
                @click.stop="editPoint(pointIndex)"
              >
                <span class="point-number">{{ pointIndex + 1 }}</span>
                
                <!-- 连接线预览 -->
                <div class="connection-line" :class="point.connectionType">
                  <div class="line-segment horizontal"></div>
                  <div v-if="point.connectionType === 'vertical-horizontal'" class="line-segment vertical"></div>
                </div>
              </div>
              
              <!-- 正在绘制的警示框 -->
              <div 
                v-if="isDrawing && isMouseDown"
                class="drawing-rect"
                :style="{
                  left: `${Math.min(startPoint.x, currentPoint.x) * scaleX.value}px`,
                  top: `${Math.min(startPoint.y, currentPoint.y) * scaleY.value}px`,
                  width: `${Math.abs(currentPoint.x - startPoint.x) * scaleX.value}px`,
                  height: `${Math.abs(currentPoint.y - startPoint.y) * scaleY.value}px`
                }"
              ></div>
              
              <!-- 绘制提示 -->
              <div v-if="isDrawing && !isMouseDown" class="drawing-hint">
                <p>🖱️ 点击并拖拽绘制警示框</p>
                <p class="hint-small">按 ESC 键可取消绘制</p>
              </div>
            </div>
            
            <!-- 警示点编辑面板 -->
            <div class="point-editor">
              <h4>警示点设置</h4>
              
              <!-- 连接线预览区域 -->
              <div v-if="editingPointIndex !== null && editingPoint" class="connection-preview">
                <h5>连接线预览</h5>
                <div class="preview-container">
                  <div class="preview-point">
                    <span class="preview-number">{{ editingPointIndex + 1 }}</span>
                  </div>
                  <div class="preview-connection-line" :class="editingPoint.connectionType">
                    <div class="preview-line-segment horizontal"></div>
                    <div v-if="editingPoint.connectionType === 'vertical-horizontal'" class="preview-line-segment vertical"></div>
                  </div>
                </div>
              </div>
              
              <div v-if="editingPointIndex !== null && editingPoint" class="point-form">
                <div class="form-group">
                  <label>标题:</label>
                  <input 
                    v-model="editingPoint.highlightTitle" 
                    type="text" 
                    class="form-input"
                    placeholder="输入警示标题"
                  />
                </div>
                <div class="form-group">
                  <label>详细说明:</label>
                  <textarea 
                    v-model="editingPoint.highlightDetail" 
                    class="form-textarea"
                    placeholder="输入详细说明"
                    rows="3"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label>连接线类型:</label>
                  <select v-model="editingPoint.connectionType" class="form-select">
                    <option value="horizontal">横线</option>
                    <option value="vertical-horizontal">L型（先竖后横）</option>
                    <option value="none">无连接线</option>
                  </select>
                </div>
                <div class="form-actions">
                  <button @click="savePoint" class="save-point-btn">保存</button>
                  <button @click="cancelEditPoint" class="cancel-point-btn">取消</button>
                  <button @click="deletePoint" class="delete-point-btn">删除</button>
                </div>
              </div>
              
              <div v-else class="add-point-section">
                <p>点击图片绘制警示框，或点击现有警示框进行编辑</p>
                <div class="drawing-controls">
                  <button @click="startDrawing" class="add-point-btn">开始绘制</button>
                  <button v-if="isDrawing" @click="cancelDrawing" class="cancel-drawing-btn">取消绘制</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 添加新图片 -->
        <div class="setting-section">
          <h3>添加新图片</h3>
          <div class="upload-section">
            <div 
              class="upload-area"
              :class="{ 'drag-over': isDragOver }"
              @drop="handleDrop"
              @dragover.prevent="isDragOver = true"
              @dragenter.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
            >
              <input 
                type="file" 
                accept="image/jpeg,image/jpg,image/png,image/webp" 
                @change="handleImageUpload" 
                class="file-input"
                id="imageUpload"
              />
              <label for="imageUpload" class="upload-btn">选择图片</label>
              <div class="upload-hint">
                <p>支持格式：JPG、PNG、WebP</p>
                <p>建议尺寸：1920×945</p>
                <p>最大文件：5MB</p>
                <p class="drag-hint">或直接拖拽图片到此处</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="editor-footer">
        <div class="footer-left">
          <button class="export-btn" @click="exportLevels">导出关卡</button>
          <button class="import-btn" @click="importLevels">导入关卡</button>
        </div>
        <div class="footer-right">
          <button class="save-btn" @click="saveSettings">保存设置</button>
          <button class="cancel-btn" @click="goBack">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// 定义警示点类型
interface PuzzlePoint {
  x: number;
  y: number;
  width: number;
  height: number;
  found: boolean;
  highlightTitle: string;
  highlightDetail: string;
  connectionType?: 'horizontal' | 'vertical-horizontal' | 'none';
}

// 定义关卡类型
interface GameLevel {
  image: string;
  points: PuzzlePoint[];
}

const router = useRouter();
const route = useRoute();

// 从路由参数或本地存储获取数据
const allGameLevels = ref<GameLevel[]>([]);
const totalLevels = ref(6);

// 响应式数据
const selectedImageIndex = ref<number | null>(null);
const editingPointIndex = ref<number | null>(null);
const editingPoint = ref<PuzzlePoint | null>(null);

// 绘制相关
const isDrawing = ref(false);
const startPoint = ref({ x: 0, y: 0 });
const currentPoint = ref({ x: 0, y: 0 });
const imageContainer = ref<HTMLDivElement | null>(null);
const isMouseDown = ref(false);

// 拖拽状态
const isDragOver = ref(false);

// 坐标缩放比例 - 动态计算
const scaleX = ref(1);
const scaleY = ref(1);

// 初始化数据
onMounted(() => {
  loadGameData();
});

// 加载游戏数据
const loadGameData = () => {
  // 从本地存储加载数据
  const savedLevels = localStorage.getItem('gameLevels');
  const savedTotalLevels = localStorage.getItem('gameTotalLevels');
  
  if (savedLevels) {
    try {
      allGameLevels.value = JSON.parse(savedLevels);
    } catch (error) {
      console.error('加载关卡数据失败:', error);
      // 使用默认数据
      allGameLevels.value = getDefaultLevels();
    }
  } else {
    // 使用默认数据
    allGameLevels.value = getDefaultLevels();
  }
  
  if (savedTotalLevels) {
    totalLevels.value = parseInt(savedTotalLevels);
  }
};

// 获取默认关卡数据
const getDefaultLevels = (): GameLevel[] => {
  // 返回默认的关卡数据
  return [
    {
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSI5NDUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjBmMCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EZWZhdWx0IEdhbWUgSW1hZ2UgKDE5MjB4OTQ1KTwvdGV4dD4KPC9zdmc+',
      points: []
    }
  ];
};

// 返回游戏页面
const goBack = () => {
  router.push('/home');
};

// 选择图片进行编辑
const selectImageForEdit = (index: number) => {
  selectedImageIndex.value = index;
  editingPointIndex.value = null;
  editingPoint.value = null;
  // 重置绘制状态
  resetDrawing();
  
  // 等待DOM更新后重新计算缩放比例
  nextTick(() => {
    onImageLoad();
  });
};

// 图片加载完成
const onImageLoad = () => {
  // 动态计算缩放比例
  if (imageContainer.value) {
    const containerRect = imageContainer.value.getBoundingClientRect();
    const img = imageContainer.value.querySelector('img') as HTMLImageElement;
    
    if (img) {
      // 获取图片的实际显示尺寸
      const displayWidth = img.offsetWidth;
      const displayHeight = img.offsetHeight;
      
      // 获取图片的原始尺寸（从 src 中获取）
      const tempImg = new Image();
      tempImg.onload = () => {
        const naturalWidth = tempImg.naturalWidth;
        const naturalHeight = tempImg.naturalHeight;
        
        // 计算缩放比例：显示尺寸 / 原始尺寸
        scaleX.value = displayWidth / naturalWidth;
        scaleY.value = displayHeight / naturalHeight;
        
        console.log('📐 图片缩放比例计算:', {
          naturalSize: `${naturalWidth}x${naturalHeight}`,
          displaySize: `${displayWidth}x${displayHeight}`,
          scaleX: scaleX.value,
          scaleY: scaleY.value
        });
      };
      tempImg.src = img.src;
    }
  }
};

// 重置绘制状态
const resetDrawing = () => {
  console.log('🔄 重置绘制状态');
  isDrawing.value = false;
  isMouseDown.value = false;
  startPoint.value = { x: 0, y: 0 };
  currentPoint.value = { x: 0, y: 0 };
  console.log('绘制状态已重置:', { isDrawing: isDrawing.value, isMouseDown: isMouseDown.value });
};

// 开始绘制警示框
const startDrawing = () => {
  console.log('🎨 开始绘制模式');
  isDrawing.value = true;
  editingPointIndex.value = null;
  editingPoint.value = null;
  // 重置鼠标状态，但保持绘制模式
  isMouseDown.value = false;
  startPoint.value = { x: 0, y: 0 };
  currentPoint.value = { x: 0, y: 0 };
  console.log('绘制状态:', { isDrawing: isDrawing.value, isMouseDown: isMouseDown.value });
};

// 取消绘制
const cancelDrawing = () => {
  resetDrawing();
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isDrawing.value) {
    cancelDrawing();
  }
};

// 监听键盘事件
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

// 处理鼠标按下
const handleMouseDown = (event: MouseEvent) => {
  console.log('🖱️ 鼠标按下', { isDrawing: isDrawing.value, imageContainer: !!imageContainer.value });
  if (!isDrawing.value || !imageContainer.value) return;
  
  isMouseDown.value = true;
  const rect = imageContainer.value.getBoundingClientRect();
  const x = (event.clientX - rect.left) / scaleX.value;
  const y = (event.clientY - rect.top) / scaleY.value;
  
  startPoint.value = { x, y };
  currentPoint.value = { x, y };
  console.log('📍 设置起点:', { x, y });
};

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  if (!isDrawing.value || !isMouseDown.value || !imageContainer.value) return;
  
  const rect = imageContainer.value.getBoundingClientRect();
  const x = (event.clientX - rect.left) / scaleX.value;
  const y = (event.clientY - rect.top) / scaleY.value;
  
  currentPoint.value = { x, y };
  console.log('🔄 鼠标移动:', { x, y });
};

// 处理鼠标松开
const handleMouseUp = () => {
  if (!isDrawing.value || !isMouseDown.value) return;
  
  isMouseDown.value = false;
  
  // 检查是否有有效的绘制区域
  const width = Math.abs(currentPoint.value.x - startPoint.value.x);
  const height = Math.abs(currentPoint.value.y - startPoint.value.y);
  
  console.log('📏 绘制区域:', { width, height, startPoint: startPoint.value, currentPoint: currentPoint.value });
  
  if (width > 10 && height > 10) { // 最小尺寸限制
    console.log('✅ 绘制完成，区域有效');
    finishDrawing();
  } else {
    console.log('❌ 绘制区域太小，取消绘制');
    resetDrawing();
  }
};

// 处理图片点击（兼容旧版本）
const handleImageClick = (event: MouseEvent) => {
  if (!isDrawing.value || !imageContainer.value) return;
  
  const rect = imageContainer.value.getBoundingClientRect();
  const x = (event.clientX - rect.left) / scaleX.value;
  const y = (event.clientY - rect.top) / scaleY.value;
  
  if (!startPoint.value.x && !startPoint.value.y) {
    // 第一次点击，设置起点
    startPoint.value = { x, y };
    currentPoint.value = { x, y };
  } else {
    // 第二次点击，完成绘制
    currentPoint.value = { x, y };
    finishDrawing();
  }
};

// 完成绘制
const finishDrawing = () => {
  console.log('🎯 开始完成绘制');
  if (!isDrawing.value) return;
  
  // 计算绘制区域的坐标和尺寸
  const x = Math.min(startPoint.value.x, currentPoint.value.x);
  const y = Math.min(startPoint.value.y, currentPoint.value.y);
  const width = Math.abs(currentPoint.value.x - startPoint.value.x);
  const height = Math.abs(currentPoint.value.y - startPoint.value.y);
  
  console.log('📐 绘制区域坐标:', { x, y, width, height });
  
  // 检查绘制区域是否有效
  if (width < 10 || height < 10) {
    console.log('❌ 绘制区域太小，取消绘制');
    resetDrawing();
    return;
  }
  
  // 创建新的警示点 - 使用相对坐标（0-1范围）
  const newPoint: PuzzlePoint = {
    x: x,           // 这些坐标已经是相对于图片显示尺寸的
    y: y,           // 在游戏中使用时会根据实际屏幕尺寸重新计算
    width: width,
    height: height,
    found: false,
    highlightTitle: '新警示点',
    highlightDetail: '请输入详细说明',
    connectionType: 'horizontal'
  };
  
  console.log('🆕 创建新警示点:', newPoint);
  
  // 添加到当前图片
  if (selectedImageIndex.value !== null) {
    allGameLevels.value[selectedImageIndex.value].points.push(newPoint);
    
    console.log('💾 警示点已添加到图片', selectedImageIndex.value);
    console.log('📊 当前图片警示点数量:', allGameLevels.value[selectedImageIndex.value].points.length);
    
    // 自动编辑新创建的警示点
    editPoint(allGameLevels.value[selectedImageIndex.value].points.length - 1);
  }
  
  // 重置绘制状态
  isDrawing.value = false;
  startPoint.value = { x: 0, y: 0 };
  currentPoint.value = { x: 0, y: 0 };
  console.log('🔄 绘制状态已重置');
};

// 编辑警示点
const editPoint = (pointIndex: number) => {
  if (selectedImageIndex.value === null) return;
  
  editingPointIndex.value = pointIndex;
  editingPoint.value = { ...allGameLevels.value[selectedImageIndex.value].points[pointIndex] };
};

// 保存警示点
const savePoint = () => {
  if (editingPointIndex.value === null || !editingPoint.value || selectedImageIndex.value === null) return;
  
  allGameLevels.value[selectedImageIndex.value].points[editingPointIndex.value] = { ...editingPoint.value };
  editingPointIndex.value = null;
  editingPoint.value = null;
};

// 取消编辑警示点
const cancelEditPoint = () => {
  editingPointIndex.value = null;
  editingPoint.value = null;
};

// 删除警示点
const deletePoint = () => {
  if (editingPointIndex.value === null || selectedImageIndex.value === null) return;
  
  allGameLevels.value[selectedImageIndex.value].points.splice(editingPointIndex.value, 1);
  editingPointIndex.value = null;
  editingPoint.value = null;
};

// 删除图片
const deleteImage = (index: number) => {
  const confirmDelete = confirm('确定要删除此图片吗？此操作不可逆。');
  if (confirmDelete) {
    allGameLevels.value.splice(index, 1);
    if (selectedImageIndex.value === index) {
      selectedImageIndex.value = null;
      editingPointIndex.value = null;
      editingPoint.value = null;
    } else if (selectedImageIndex.value !== null && selectedImageIndex.value > index) {
      selectedImageIndex.value--;
    }
    alert('图片已删除！');
  }
};

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    processImageFile(file);
  }
  isDragOver.value = false; // 拖拽结束后恢复默认状态
};

// 处理图片文件（通用函数）
const processImageFile = (file: File) => {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择有效的图片文件！');
    return;
  }
  
  // 验证文件大小（限制为5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('图片文件大小不能超过5MB！');
    return;
  }
  
  // 创建图片预览和验证
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // 检查图片尺寸
      const { naturalWidth, naturalHeight } = img;
      
      // 建议尺寸检查（1920x945，允许一定误差）
      const recommendedWidth = 1920;
      const recommendedHeight = 945;
      const tolerance = 0.2; // 允许20%的误差
      
      const widthRatio = Math.abs(naturalWidth - recommendedWidth) / recommendedWidth;
      const heightRatio = Math.abs(naturalHeight - recommendedHeight) / recommendedHeight;
      
      if (widthRatio > tolerance || heightRatio > tolerance) {
        const confirmUpload = confirm(
          `当前图片尺寸为 ${naturalWidth}x${naturalHeight}，建议尺寸为 ${recommendedWidth}x${recommendedHeight}。\n\n` +
          `继续上传可能会导致显示效果不佳。是否继续？`
        );
        
        if (!confirmUpload) {
          return;
        }
      }
      
      // 创建新的游戏关卡
      const newLevel: GameLevel = {
        image: e.target?.result as string,
        points: []
      };
      
      // 添加到关卡列表
      allGameLevels.value.push(newLevel);
      
      // 自动选择新添加的图片进行编辑
      selectedImageIndex.value = allGameLevels.value.length - 1;
      
      // 显示成功提示
      alert(`图片上传成功！\n尺寸: ${naturalWidth}x${naturalHeight}\n已添加到关卡 ${allGameLevels.value.length}`);
    };
    
    img.onerror = () => {
      alert('图片加载失败，请检查文件是否损坏！');
    };
    
    img.src = e.target?.result as string;
  };
  
  reader.onerror = () => {
    alert('文件读取失败，请重试！');
  };
  
  reader.readAsDataURL(file);
};

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    processImageFile(file);
    target.value = ''; // 清空文件选择
  }
};

// 导出关卡数据
const exportLevels = () => {
  try {
    const dataStr = JSON.stringify(allGameLevels.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `game-levels-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    alert('关卡数据导出成功！');
  } catch (error) {
    alert('导出失败：' + error);
  }
};

// 导入关卡数据
const importLevels = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedLevels = JSON.parse(e.target?.result as string);
          
          // 验证导入数据的格式
          if (!Array.isArray(importedLevels)) {
            throw new Error('导入文件格式不正确');
          }
          
          // 验证每个关卡的数据结构
          for (const level of importedLevels) {
            if (!level.image || !Array.isArray(level.points)) {
              throw new Error('关卡数据结构不正确');
            }
          }
          
          const confirmImport = confirm(
            `确定要导入 ${importedLevels.length} 个关卡吗？\n这将覆盖现有的关卡数据。`
          );
          
          if (confirmImport) {
            allGameLevels.value = importedLevels;
            selectedImageIndex.value = null;
            editingPointIndex.value = null;
            editingPoint.value = null;
            alert(`成功导入 ${importedLevels.length} 个关卡！`);
          }
        } catch (error) {
          alert('导入失败：' + error);
        }
      };
      
      reader.readAsText(file);
    }
  };
  
  input.click();
};

// 保存设置
const saveSettings = () => {
  // 保存到本地存储
  localStorage.setItem('gameTotalLevels', totalLevels.value.toString());
  localStorage.setItem('gameLevels', JSON.stringify(allGameLevels.value));
  
  alert('设置已保存！');
  goBack();
};
</script>

<style scoped>
.level-editor-page {
  min-height: 100vh;
  background-color: #f0f0f0;
  padding: 20px;
}

.level-editor {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.editor-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.close-btn {
  background-color: #1e1c72;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #2d2a9d;
}

.editor-content {
  padding: 24px;
}

.setting-section {
  margin-bottom: 32px;
}

.setting-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
  border-bottom: 2px solid #1e1c72;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawing-status {
  background-color: #1e1c72;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: normal;
  animation: statusPulse 1.5s infinite;
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.setting-item label {
  font-weight: 600;
  color: #555;
  min-width: 100px;
}

.number-input {
  width: 80px;
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  text-align: center;
}

.number-input:focus {
  outline: none;
  border-color: #1e1c72;
}

.hint {
  color: #888;
  font-size: 14px;
}

.hint-small {
  font-size: 12px;
  color: #666;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.image-item {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: border-color 0.2s;
  cursor: pointer;
  position: relative;
}

.image-item:hover {
  border-color: #1e1c72;
}

.image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.image-info span {
  font-size: 14px;
  color: #666;
}

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #dc3545;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: #f8d7da;
}

.image-editor {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

.image-container {
  position: relative;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9;
}

.editable-image {
  width: 100%;
  height: auto;
  cursor: crosshair;
}

.existing-point {
  position: absolute;
  border: 2px solid #ff4757;
  background-color: rgba(255, 71, 87, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.existing-point:hover {
  border-color: #ff6b7a;
  background-color: rgba(255, 107, 122, 0.3);
}

.point-number {
  color: #ff4757;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 1px 1px 2px white;
}

/* 高亮区域样式 - 与游戏界面保持一致 */
.highlight-area {
  position: absolute;
  background-color: rgba(249, 239, 240, 0.4); /* 浅粉色背景带更高透明度 */
  border: 2.5px solid #1a175d; /* 加粗的深蓝色边框 */
  border-radius: 30px; /* 圆弧矩形 */
  z-index: 5;
  display: flex;
  flex-direction: column;
  overflow: visible;
  box-shadow: 0 0 8px rgba(26, 23, 93, 0.5); /* 添加阴影效果增强可见性 */
}

/* 高亮区域标题和详情的容器 */
.highlight-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 改为左对齐 */
  z-index: 6;
  max-width: 90%; /* 确保不超出图片宽度 */
}

/* 高亮区域标题样式 */
.highlight-title {
  position: absolute;
  background-color: #ff454d; /* 红色背景 */
  color: white;
  padding: 8px 15px;
  border-radius: 30px; /* 大圆角 */
  border: 2px solid #1a175d; /* 深蓝色边框 */
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
  z-index: 8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-left: -20px; /* 向左偏移，让标题在详情的左侧 */
  top: 0; /* 位于顶部 */
  left: 0; /* 从左侧开始 */
  display: inline-block; /* 确保内容宽度符合内容 */
}

/* 高亮区域详细说明样式 */
.highlight-detail {
  position: absolute;
  background-color: white; /* 白色背景 */
  color: #1a175d; /* 深蓝色文字 */
  padding: 10px 15px;
  padding-top: 15px; /* 增加顶部内边距，为标题重叠留出空间 */
  padding-left: 25px; /* 增加左侧内边距，为标题留出空间 */
  border-radius: 14px; /* 较小圆角 */
  border: 2px solid #1a175d; /* 深蓝色边框 */
  font-size: 14px;
  width: max-content;
  text-align: left;
  z-index: 7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  top: 20px; /* 位于标题下方 */
  left: 20px; /* 从左侧开始，但比标题靠右 */
}

/* 当高亮区域在左侧显示时的样式 */
.highlight-container[data-position="left"] .highlight-title {
  position: absolute;
  left: auto; /* 取消左侧定位 */
  right: 0; /* 从右侧开始 */
  margin-left: 0; /* 取消左侧偏移 */
  margin-right: -20px; /* 向右偏移 */
}

.highlight-container[data-position="left"] .highlight-detail {
  position: absolute;
  left: auto; /* 取消左侧定位 */
  right: 20px; /* 从右侧开始，但比标题靠左 */
  padding-left: 15px; /* 恢复正常左侧内边距 */
  padding-right: 25px; /* 增加右侧内边距，为标题留出空间 */
}

/* 连接线样式 - 与游戏界面保持一致 */
.connection-line {
  position: absolute;
  pointer-events: none;
  z-index: 5;
}

.line-segment {
  position: absolute;
  background-color: #1a175d; /* 与游戏界面保持一致的颜色 */
  box-shadow: 0 0 4px rgba(26, 23, 93, 0.3);
}

.line-segment.horizontal {
  width: 80px; /* 与游戏界面保持一致 */
  height: 2.5px; /* 与游戏界面保持一致 */
  top: 50%;
  right: -80px;
  transform: translateY(-50%);
}

.line-segment.vertical {
  width: 2.5px; /* 与游戏界面保持一致 */
  height: 80px;
  left: 50%;
  top: -80px;
  transform: translateX(-50%);
}

.connection-line.vertical-horizontal .line-segment.horizontal {
  top: -80px;
  right: -100px; /* 与游戏界面保持一致 */
  width: 100px; /* 与游戏界面保持一致 */
  height: 2.5px; /* 与游戏界面保持一致 */
}

.connection-line.vertical-horizontal .line-segment.vertical {
  top: -80px;
  left: 50%;
  width: 2.5px; /* 与游戏界面保持一致 */
  height: 100px; /* 与游戏界面保持一致 */
}

.drawing-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(30, 28, 114, 0.9);
  color: white;
  padding: 15px 25px;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  z-index: 10;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.drawing-rect {
  position: absolute;
  border: 3px dashed #1e1c72;
  background-color: rgba(30, 28, 114, 0.1);
  pointer-events: none;
  z-index: 8;
  animation: drawAnimation 0.3s ease-out;
}

@keyframes drawAnimation {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.point-editor {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.point-editor h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

.point-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.form-input, .form-textarea, .form-select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #1e1c72;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.save-point-btn, .cancel-point-btn, .delete-point-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-point-btn {
  background-color: #28a745;
  color: white;
}

.save-point-btn:hover {
  background-color: #218838;
}

.cancel-point-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-point-btn:hover {
  background-color: #5a6268;
}

.delete-point-btn {
  background-color: #dc3545;
  color: white;
}

.delete-point-btn:hover {
  background-color: #c82333;
}

.add-point-section {
  text-align: center;
  padding: 20px;
}

.add-point-section p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.add-point-btn {
  background-color: #1e1c72;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-point-btn:hover {
  background-color: #2d2a9d;
}

.cancel-drawing-btn {
  background-color: #dc3545;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-drawing-btn:hover {
  background-color: #c82333;
}

.drawing-controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.upload-section {
  text-align: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.upload-area {
  position: relative;
  width: 100%;
  height: 150px;
  border: 2px dashed #1e1c72;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-area:hover {
  background-color: #d0d0d0;
}

.upload-area.drag-over {
  background-color: #c0c0c0;
  border-color: #1e1c72;
}

.file-input {
  display: none;
}

.upload-btn {
  display: inline-block;
  background-color: #1e1c72;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.upload-btn:hover {
  background-color: #2d2a9d;
}

.upload-hint {
  margin-top: 12px;
  color: #888;
  font-size: 14px;
}

.drag-hint {
  font-style: italic;
  color: #555;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.footer-left {
  display: flex;
  gap: 12px;
}

.footer-right {
  display: flex;
  gap: 12px;
}

.save-btn, .cancel-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background-color: #1e1c72;
  color: white;
}

.save-btn:hover {
  background-color: #2d2a9d;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.export-btn, .import-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #4CAF50;
  color: white;
}

.export-btn:hover {
  background-color: #45a049;
}

.import-btn:hover {
  background-color: #45a049;
}

.connection-preview {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.connection-preview h5 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.preview-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.preview-point {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #1e1c72;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview-connection-line {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-line-segment {
  position: absolute;
  background-color: #1e1c72;
  box-shadow: 0 0 4px rgba(30, 28, 114, 0.3);
}

.preview-line-segment.horizontal {
  width: 100px;
  height: 2.5px; /* 与游戏界面保持一致 */
  top: 50%;
  right: -100px;
  transform: translateY(-50%);
}

.preview-line-segment.vertical {
  width: 2.5px; /* 与游戏界面保持一致 */
  height: 100px;
  left: 50%;
  top: -100px;
  transform: translateX(-50%);
}

.preview-connection-line.vertical-horizontal .preview-line-segment.horizontal {
  top: -100px;
  right: -100px;
}

.preview-connection-line.vertical-horizontal .preview-line-segment.vertical {
  top: -100px;
  left: 50%;
}

/* 移动端适配样式 - 与游戏界面保持一致 */
@media (max-width: 768px) {
  /* 移动端上的高亮区域样式 */
  .highlight-container {
    max-width: 95%;
  }
  
  .highlight-title {
    font-size: 12px;
    padding: 6px 12px;
    margin-left: -15px;
  }
  
  .highlight-detail {
    font-size: 12px;
    padding-left: 15px;
  }
  
  /* 移动端上的连接线 */
  .line-segment.horizontal {
    width: 40px !important; /* 与游戏界面保持一致 */
  }
  
  /* 移动端上的左侧连接线 */
  .connection-line.vertical-horizontal .line-segment.horizontal {
    width: 40px !important; /* 移动端保持原有尺寸，确保视觉效果清晰 */
  }
}
</style> 