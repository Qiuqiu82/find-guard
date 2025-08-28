<template>
  <div class="level-editor-overlay">
    <div class="level-editor">
      <!-- 顶部导航栏 -->
      <div class="editor-header">
        <div class="header-left">
          <div class="logo-section">
            <div class="logo-icon">🎮</div>
            <div class="logo-text">
              <h2>关卡编辑器</h2>
              <span class="version">v2.0</span>
            </div>
          </div>
        </div>
        
        <div class="header-center">
          <div class="nav-tabs">
            <div 
              class="nav-tab" 
              :class="{ 'active': activeMenu === 'game-settings' }"
              @click="activeMenu = 'game-settings'"
            >
              游戏设置
            </div>
            <div 
              class="nav-tab" 
              :class="{ 'active': activeMenu === 'image-drawing' }"
              @click="activeMenu = 'image-drawing'"
            >
              图片绘制
            </div>
            <div 
              class="nav-tab" 
              :class="{ 'active': activeMenu === 'data-management' }"
              @click="activeMenu = 'data-management'"
            >
              数据管理
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-label">图片数</span>
              <span class="stat-value">{{ allGameLevels.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">警示点</span>
              <span class="stat-value">{{ totalPoints }}</span>
            </div>
          </div>
          
          <div class="header-actions">
            <el-button type="primary" @click="saveSettings" :loading="saving">
              <el-icon><Check /></el-icon>
              保存设置
            </el-button>
            <el-button @click="$emit('close')" class="close-btn">
              <el-icon><Close /></el-icon>
              关闭
            </el-button>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="editor-main">
        <!-- 左侧导航菜单 -->
        <div class="editor-sidebar">
          <div class="sidebar-section">
            <h3 class="section-title">📊 快速统计</h3>
            <div class="stats-cards">
              <div class="stat-card">
                <div class="stat-icon">🖼️</div>
                <div class="stat-content">
                  <div class="stat-number">{{ allGameLevels.length }}</div>
                  <div class="stat-label">总图片数</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                  <div class="stat-number">{{ totalPoints }}</div>
                  <div class="stat-label">总警示点</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">⚙️</div>
                <div class="stat-content">
                  <div class="stat-number">{{ gameSettings.totalLevels }}</div>
                  <div class="stat-label">启用关卡</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-content">
                  <div class="stat-number">{{ gameSettings.countdownSeconds }}s</div>
                  <div class="stat-label">倒计时</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="sidebar-section">
            <h3 class="section-title">🔧 快捷操作</h3>
            <div class="quick-actions">
              <el-button 
                type="primary" 
                class="quick-btn"
                @click="showUploadDialog = true"
              >
                <el-icon><Plus /></el-icon>
                添加图片
              </el-button>
              
              <el-button 
                type="success" 
                class="quick-btn"
                @click="exportLevels"
              >
                <el-icon><Download /></el-icon>
                导出数据
              </el-button>
              
              <el-button 
                type="warning" 
                class="quick-btn"
                @click="importLevels"
              >
                <el-icon><Upload /></el-icon>
                导入数据
              </el-button>
            </div>
          </div>
        </div>

        <!-- 右侧内容区域 -->
        <div class="editor-content">
          <!-- 游戏设置模块 -->
          <div v-show="activeMenu === 'game-settings'" class="content-section">
            <div class="section-header">
              <h3>⚙️ 游戏设置</h3>
              <p class="section-desc">配置游戏的基本参数和规则</p>
            </div>
            
            <div class="settings-grid">
              <el-card class="setting-card">
                <template #header>
                  <div class="card-header">
                    <span class="card-icon">🎯</span>
                    <span>关卡配置</span>
                  </div>
                </template>
                
                <div class="setting-content">
                  <div class="setting-item">
                    <label>关卡数量</label>
                    <el-input-number
                      v-model="gameSettings.totalLevels"
                      :min="1"
                      :max="allGameLevels.length"
                      :step="1"
                      size="large"
                      class="setting-input"
                    />
                    <div class="setting-hint">最大可设置: {{ allGameLevels.length }} 关</div>
                  </div>
                </div>
              </el-card>
              
              <el-card class="setting-card">
                <template #header>
                  <div class="card-header">
                    <span class="card-icon">⏱️</span>
                    <span>时间设置</span>
                  </div>
                </template>
                
                <div class="setting-content">
                  <div class="setting-item">
                    <label>倒计时设置</label>
                    <el-input-number
                      v-model="gameSettings.countdownSeconds"
                      :min="10"
                      :max="120"
                      :step="5"
                      size="large"
                      class="setting-input"
                    />
                    <div class="setting-hint">每关的倒计时秒数</div>
                  </div>
                  
                  <div class="setting-item">
                    <label>闪烁提醒</label>
                    <el-input-number
                      v-model="gameSettings.flashThreshold"
                      :min="5"
                      :max="30"
                      :step="5"
                      size="large"
                      class="setting-input"
                    />
                    <div class="setting-hint">剩余多少秒时开始闪烁红光</div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>

          <!-- 图片绘制模块 -->
          <div v-show="activeMenu === 'image-drawing'" class="content-section">
            <div class="section-header">
              <h3>🎨 图片绘制</h3>
              <p class="section-desc">管理游戏图片和警示点设置</p>
            </div>
            
            <div class="drawing-layout">
              <!-- 左侧图片列表 -->
              <div class="image-list-panel">
                <el-card class="list-card">
                  <template #header>
                    <div class="card-header">
                      <span class="card-icon">📁</span>
                      <span>图片管理</span>
                      <el-button type="primary" size="small" @click="showUploadDialog = true">
                        <el-icon><Plus /></el-icon>
                        添加
                      </el-button>
                    </div>
                  </template>
                  
                  <div class="image-list">
                    <div
                      v-for="(level, index) in allGameLevels"
                      :key="index"
                      class="image-item"
                      :class="{ 'active': selectedImageIndex === index }"
                      @click="selectImageForEdit(index)"
                    >
                      <div class="image-preview">
                        <img :src="level.image" :alt="`图片${index + 1}`" />
                        <div class="image-overlay">
                          <span class="point-count">{{ level.points.length }}个警示点</span>
                        </div>
                      </div>
                      <div class="image-info">
                        <span class="image-title">图片{{ index + 1 }}</span>
                        <div class="image-actions">
                          <el-button
                            type="danger"
                            size="small"
                            circle
                            @click.stop="deleteImage(index)"
                          >
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>

              <!-- 右侧绘制区域 -->
              <div class="drawing-panel">
                <el-card class="drawing-card">
                  <template #header>
                    <div class="card-header">
                      <span class="card-icon">🎨</span>
                      <span>绘制区域</span>
                      <div class="drawing-controls" v-if="selectedImageIndex !== null">
                        <el-button
                          v-if="!isDrawing"
                          type="primary"
                          @click="startDrawing"
                        >
                          <el-icon><EditPen /></el-icon>
                          开始绘制
                        </el-button>
                        <el-button
                          v-else
                          type="danger"
                          @click="cancelDrawing"
                        >
                          <el-icon><Close /></el-icon>
                          退出绘制
                        </el-button>
                      </div>
                    </div>
                  </template>
                  
                  <div v-if="selectedImageIndex !== null" class="drawing-area">
                    <div 
                      class="image-container" 
                      ref="imageContainer"
                      :class="{ 'fullscreen-drawing': isDrawing }"
                    >
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
                          left: `${point.x * scaleX}px`,
                          top: `${point.y * scaleY}px`,
                          width: `${point.width * scaleX}px`,
                          height: `${point.height * scaleY}px`
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
                          left: `${Math.min(startPoint.x, currentPoint.x) * scaleX}px`,
                          top: `${Math.min(startPoint.y, currentPoint.y) * scaleY}px`,
                          width: `${Math.abs(currentPoint.x - startPoint.x) * scaleX}px`,
                          height: `${Math.abs(currentPoint.y - startPoint.y) * scaleY}px`
                        }"
                      ></div>
                      
                      <!-- 绘制提示 -->
                      <div v-if="isDrawing && !isMouseDown" class="drawing-hint">
                        <div class="hint-content">
                          <h4>🎨 绘制警示框</h4>
                          <p>1. 点击并拖拽鼠标绘制矩形区域</p>
                          <p>2. 松开鼠标完成绘制</p>
                          <p>3. 按 ESC 键可退出全屏</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="empty-drawing">
                    <el-empty description="请选择一个图片进行编辑">
                      <el-icon size="60" color="#909399"><Picture /></el-icon>
                    </el-empty>
                  </div>
                </el-card>
              </div>
            </div>
          </div>

          <!-- 数据管理模块 -->
          <div v-show="activeMenu === 'data-management'" class="content-section">
            <div class="section-header">
              <h3>💾 数据管理</h3>
              <p class="section-desc">导入导出关卡数据和系统设置</p>
            </div>
            
            <div class="data-actions">
              <el-card class="action-card">
                <template #header>
                  <div class="card-header">
                    <span class="card-icon">📤</span>
                    <span>导出数据</span>
                  </div>
                </template>
                <div class="action-content">
                  <p>将当前所有关卡数据导出为JSON文件</p>
                  <el-button type="primary" @click="exportLevels" class="action-btn">
                    <el-icon><Download /></el-icon>
                    导出关卡数据
                  </el-button>
                </div>
              </el-card>
              
              <el-card class="action-card">
                <template #header>
                  <div class="card-header">
                    <span class="card-icon">📥</span>
                    <span>导入数据</span>
                  </div>
                </template>
                <div class="action-content">
                  <p>从JSON文件导入关卡数据（将覆盖现有数据）</p>
                  <el-button type="warning" @click="importLevels" class="action-btn">
                    <el-icon><Upload /></el-icon>
                    导入关卡数据
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 警示点编辑对话框 -->
    <el-dialog
      v-model="showPointEditor"
      title="⚙️ 警示点设置"
      width="600px"
      :close-on-click-modal="false"
      class="modern-dialog"
    >
      <el-form :model="editingPoint" label-width="100px" v-if="editingPoint">
        <el-form-item label="标题">
          <el-input
            v-model="editingPoint.highlightTitle"
            placeholder="输入警示标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="详细说明">
          <el-input
            v-model="editingPoint.highlightDetail"
            type="textarea"
            :rows="4"
            placeholder="输入详细说明"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="连接线类型">
          <el-select v-model="editingPoint.connectionType" style="width: 100%">
            <el-option label="横线" value="horizontal" />
            <el-option label="先竖后横" value="vertical-horizontal" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPointEditor = false">取消</el-button>
          <el-button type="danger" @click="deletePoint">删除</el-button>
          <el-button type="primary" @click="savePoint">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="📁 添加新图片"
      width="500px"
      class="modern-dialog"
    >
      <el-upload
        class="upload-area"
        drag
        :auto-upload="false"
        :on-change="handleImageUpload"
        :before-upload="beforeImageUpload"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        :limit="1"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将图片拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 JPG/PNG/WebP 格式，建议尺寸 1920×945，最大 5MB
          </div>
        </template>
      </el-upload>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showUploadDialog = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Check,
  Close,
  Setting,
  Picture,
  FolderOpened,
  Plus,
  Delete,
  EditPen,
  Download,
  Upload,
  UploadFilled
} from '@element-plus/icons-vue';

// 定义警示点类型
interface PuzzlePoint {
  x: number;
  y: number;
  width: number;
  height: number;
  found: boolean;
  highlightTitle: string;
  highlightDetail: string;
  connectionType?: 'horizontal' | 'vertical-horizontal';
}

// 定义关卡类型
interface GameLevel {
  image: string;
  points: PuzzlePoint[];
}

// 游戏设置类型
interface GameSettings {
  totalLevels: number;
  countdownSeconds: number;
  flashThreshold: number;
}

// Props
interface Props {
  allGameLevels: GameLevel[];
  totalLevels: number;
}

// Emits
interface Emits {
  (e: 'close'): void;
  (e: 'update:totalLevels', value: number): void;
  (e: 'update:allGameLevels', value: GameLevel[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const activeMenu = ref('game-settings');
const saving = ref(false);
const showPointEditor = ref(false);
const showUploadDialog = ref(false);

// 游戏设置
const gameSettings = ref<GameSettings>({
  totalLevels: props.totalLevels,
  countdownSeconds: 30,
  flashThreshold: 10
});

// 图片编辑相关
const selectedImageIndex = ref<number | null>(null);
const editingPointIndex = ref<number | null>(null);
const editingPoint = ref<PuzzlePoint | null>(null);

// 绘制相关
const isDrawing = ref(false);
const startPoint = ref({ x: 0, y: 0 });
const currentPoint = ref({ x: 0, y: 0 });
const imageContainer = ref<HTMLDivElement | null>(null);
const isMouseDown = ref(false);

// 坐标缩放比例
const scaleX = ref(1);
const scaleY = ref(1);

// 计算总警示点数量
const totalPoints = computed(() => {
  return props.allGameLevels.reduce((total, level) => total + level.points.length, 0);
});

// 菜单选择处理
const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
};

// 保存设置
const saveSettings = async () => {
  try {
    saving.value = true;
    
    // 更新关卡数量
    emit('update:totalLevels', gameSettings.value.totalLevels);
    
    // 保存到本地存储
    localStorage.setItem('gameTotalLevels', gameSettings.value.totalLevels.toString());
    localStorage.setItem('gameCountdownSeconds', gameSettings.value.countdownSeconds.toString());
    localStorage.setItem('gameFlashThreshold', gameSettings.value.flashThreshold.toString());
    
    ElMessage.success('设置已保存！');
    emit('close');
  } catch (error) {
    ElMessage.error('保存失败：' + error);
  } finally {
    saving.value = false;
  }
};

// 选择图片进行编辑
const selectImageForEdit = (index: number) => {
  selectedImageIndex.value = index;
  editingPointIndex.value = null;
  editingPoint.value = null;
  resetDrawing();
  
  nextTick(() => {
    onImageLoad();
  });
};

// 图片加载完成
const onImageLoad = () => {
  if (imageContainer.value) {
    const img = imageContainer.value.querySelector('img') as HTMLImageElement;
    
    if (img) {
      const displayWidth = img.offsetWidth;
      const displayHeight = img.offsetHeight;
      
      const tempImg = new Image();
      tempImg.onload = () => {
        const naturalWidth = tempImg.naturalWidth;
        const naturalHeight = tempImg.naturalHeight;
        
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
  if (imageContainer.value) {
    imageContainer.value.classList.remove('fullscreen-drawing');
    
    imageContainer.value.style.position = '';
    imageContainer.value.style.top = '';
    imageContainer.value.style.left = '';
    imageContainer.value.style.width = '';
    imageContainer.value.style.height = '';
    imageContainer.value.style.zIndex = '';
    imageContainer.value.style.backgroundColor = '';
    imageContainer.value.style.display = '';
    imageContainer.value.style.alignItems = '';
    imageContainer.value.style.justifyContent = '';
    imageContainer.value.style.overflow = '';
    
    imageContainer.value.offsetHeight;
  }
  
  isDrawing.value = false;
  isMouseDown.value = false;
  startPoint.value = { x: 0, y: 0 };
  currentPoint.value = { x: 0, y: 0 };
};

// 开始绘制警示框
const startDrawing = () => {
  isDrawing.value = true;
  editingPointIndex.value = null;
  editingPoint.value = null;
  isMouseDown.value = false;
  startPoint.value = { x: 0, y: 0 };
  currentPoint.value = { x: 0, y: 0 };
  
  nextTick(() => {
    if (imageContainer.value) {
      imageContainer.value.classList.add('fullscreen-drawing');
      
      imageContainer.value.style.position = 'fixed';
      imageContainer.value.style.top = '0';
      imageContainer.value.style.left = '0';
      imageContainer.value.style.width = '100vw';
      imageContainer.value.style.height = '100vh';
      imageContainer.value.style.zIndex = '99999';
      imageContainer.value.style.backgroundColor = '#000';
      imageContainer.value.style.display = 'flex';
      imageContainer.value.style.alignItems = 'center';
      imageContainer.value.style.justifyContent = 'center';
      imageContainer.value.style.overflow = 'hidden';
      
      imageContainer.value.offsetHeight;
    }
  });
};

// 取消绘制
const cancelDrawing = () => {
  if (imageContainer.value) {
    imageContainer.value.classList.remove('fullscreen-drawing');
    
    imageContainer.value.style.position = '';
    imageContainer.value.style.top = '';
    imageContainer.value.style.left = '';
    imageContainer.value.style.width = '';
    imageContainer.value.style.height = '';
    imageContainer.value.style.zIndex = '';
    imageContainer.value.style.backgroundColor = '';
    imageContainer.value.style.display = '';
    imageContainer.value.style.alignItems = '';
    imageContainer.value.style.justifyContent = '';
    imageContainer.value.style.overflow = '';
    
    imageContainer.value.offsetHeight;
  }
  resetDrawing();
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (isDrawing.value) {
      cancelDrawing();
    }
  }
};

// 监听键盘事件
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  
  // 从本地存储加载设置
  const savedCountdown = localStorage.getItem('gameCountdownSeconds');
  const savedFlashThreshold = localStorage.getItem('gameFlashThreshold');
  
  if (savedCountdown) {
    gameSettings.value.countdownSeconds = parseInt(savedCountdown);
  }
  if (savedFlashThreshold) {
    gameSettings.value.flashThreshold = parseInt(savedFlashThreshold);
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

// 处理鼠标按下
const handleMouseDown = (event: MouseEvent) => {
  if (!isDrawing.value || !imageContainer.value) return;
  
  isMouseDown.value = true;
  const rect = imageContainer.value.getBoundingClientRect();
  const x = (event.clientX - rect.left) / scaleX.value;
  const y = (event.clientY - rect.top) / scaleY.value;
  
  startPoint.value = { x, y };
  currentPoint.value = { x, y };
};

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  if (!isDrawing.value || !isMouseDown.value || !imageContainer.value) return;
  
  const rect = imageContainer.value.getBoundingClientRect();
  const x = (event.clientX - rect.left) / scaleX.value;
  const y = (event.clientY - rect.top) / scaleY.value;
  
  currentPoint.value = { x, y };
};

// 处理鼠标松开
const handleMouseUp = () => {
  if (!isDrawing.value || !isMouseDown.value) return;
  
  isMouseDown.value = false;
  
  const width = Math.abs(currentPoint.value.x - startPoint.value.x);
  const height = Math.abs(currentPoint.value.y - startPoint.value.y);
  
  if (width > 10 && height > 10) {
    finishDrawing();
  } else {
    resetDrawing();
  }
};

// 处理图片点击
const handleImageClick = (event: MouseEvent) => {
  if (!isDrawing.value || !imageContainer.value) return;
  
  const rect = imageContainer.value.getBoundingClientRect();
  const x = (event.clientX - rect.left) / scaleX.value;
  const y = (event.clientY - rect.top) / scaleY.value;
  
  if (!startPoint.value.x && !startPoint.value.y) {
    startPoint.value = { x, y };
    currentPoint.value = { x, y };
  } else {
    currentPoint.value = { x, y };
    finishDrawing();
  }
};

// 完成绘制
const finishDrawing = () => {
  if (!isDrawing.value) return;
  
  const x = Math.min(startPoint.value.x, currentPoint.value.x);
  const y = Math.min(startPoint.value.y, currentPoint.value.y);
  const width = Math.abs(currentPoint.value.x - startPoint.value.x);
  const height = Math.abs(currentPoint.value.y - startPoint.value.y);
  
  if (width < 10 || height < 10) {
    resetDrawing();
    return;
  }
  
  const newPoint: PuzzlePoint = {
    x: x,
    y: y,
    width: width,
    height: height,
    found: false,
    highlightTitle: '新警示点',
    highlightDetail: '请输入详细说明',
    connectionType: 'horizontal'
  };
  
  if (selectedImageIndex.value !== null) {
    const updatedLevels = [...props.allGameLevels];
    updatedLevels[selectedImageIndex.value].points.push(newPoint);
    
    emit('update:allGameLevels', updatedLevels);
    
    editPoint(updatedLevels[selectedImageIndex.value].points.length - 1);
  }
  
  isDrawing.value = false;
  startPoint.value = { x: 0, y: 0 };
  currentPoint.value = { x: 0, y: 0 };
};

// 编辑警示点
const editPoint = (pointIndex: number) => {
  if (selectedImageIndex.value === null) return;
  
  editingPointIndex.value = pointIndex;
  editingPoint.value = { ...props.allGameLevels[selectedImageIndex.value].points[pointIndex] };
  showPointEditor.value = true;
};

// 保存警示点
const savePoint = () => {
  if (editingPointIndex.value === null || !editingPoint.value || selectedImageIndex.value === null) return;
  
  props.allGameLevels[selectedImageIndex.value].points[editingPointIndex.value] = { ...editingPoint.value };
  editingPointIndex.value = null;
  editingPoint.value = null;
  showPointEditor.value = false;
  
  if (imageContainer.value && imageContainer.value.classList.contains('fullscreen-drawing')) {
    cancelDrawing();
  }
  
  ElMessage.success('警示点已保存！');
};

// 删除警示点
const deletePoint = async () => {
  if (editingPointIndex.value === null || selectedImageIndex.value === null) return;
  
  try {
    await ElMessageBox.confirm('确定要删除这个警示点吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    props.allGameLevels[selectedImageIndex.value].points.splice(editingPointIndex.value, 1);
    editingPointIndex.value = null;
    editingPoint.value = null;
    showPointEditor.value = false;
    
    if (imageContainer.value && imageContainer.value.classList.contains('fullscreen-drawing')) {
      cancelDrawing();
    }
    
    ElMessage.success('警示点已删除！');
  } catch {
    // 用户取消删除
  }
};

// 删除图片
const deleteImage = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除此图片吗？此操作不可逆。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    props.allGameLevels.splice(index, 1);
    if (selectedImageIndex.value === index) {
      selectedImageIndex.value = null;
      editingPointIndex.value = null;
      editingPoint.value = null;
    } else if (selectedImageIndex.value !== null && selectedImageIndex.value > index) {
      selectedImageIndex.value--;
    }
    emit('update:allGameLevels', props.allGameLevels);
    
    ElMessage.success('图片已删除！');
  } catch {
    // 用户取消删除
  }
};

// 图片上传前验证
const beforeImageUpload = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择有效的图片文件！');
    return false;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片文件大小不能超过5MB！');
    return false;
  }
  
  return true;
};

// 处理图片上传
const handleImageUpload = (file: any) => {
  if (!file.raw) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      
      const recommendedWidth = 1920;
      const recommendedHeight = 945;
      const tolerance = 0.2;
      
      const widthRatio = Math.abs(naturalWidth - recommendedWidth) / recommendedWidth;
      const heightRatio = Math.abs(naturalHeight - recommendedHeight) / recommendedHeight;
      
      if (widthRatio > tolerance || heightRatio > tolerance) {
        ElMessage.warning(
          `当前图片尺寸为 ${naturalWidth}x${naturalHeight}，建议尺寸为 ${recommendedWidth}x${recommendedHeight}`
        );
      }
      
      const newLevel: GameLevel = {
        image: e.target?.result as string,
        points: []
      };
      
      const updatedLevels = [...props.allGameLevels, newLevel];
      emit('update:allGameLevels', updatedLevels);
      
      selectedImageIndex.value = updatedLevels.length - 1;
      showUploadDialog.value = false;
      
      ElMessage.success(`图片上传成功！尺寸: ${naturalWidth}x${naturalHeight}`);
    };
    
    img.onerror = () => {
      ElMessage.error('图片加载失败，请检查文件是否损坏！');
    };
    
    img.src = e.target?.result as string;
  };
  
  reader.onerror = () => {
    ElMessage.error('文件读取失败，请重试！');
  };
  
  reader.readAsDataURL(file.raw);
};

// 导出关卡数据
const exportLevels = () => {
  try {
    const dataStr = JSON.stringify(props.allGameLevels, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `game-levels-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    ElMessage.success('关卡数据导出成功！');
  } catch (error) {
    ElMessage.error('导出失败：' + error);
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
          
          if (!Array.isArray(importedLevels)) {
            throw new Error('导入文件格式不正确');
          }
          
          for (const level of importedLevels) {
            if (!level.image || !Array.isArray(level.points)) {
              throw new Error('关卡数据结构不正确');
            }
          }
          
          ElMessageBox.confirm(
            `确定要导入 ${importedLevels.length} 个关卡吗？\n这将覆盖现有的关卡数据。`,
            '确认导入',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            emit('update:allGameLevels', importedLevels);
            selectedImageIndex.value = null;
            editingPointIndex.value = null;
            editingPoint.value = null;
            ElMessage.success(`成功导入 ${importedLevels.length} 个关卡！`);
          }).catch(() => {
            // 用户取消导入
          });
        } catch (error) {
          ElMessage.error('导入失败：' + error);
        }
      };
      
      reader.readAsText(file);
    }
  };
  
  input.click();
};
</script>

<style scoped>
.level-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.level-editor {
  background-color: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1400px;
  max-height: 95vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #1e1c72;
  background: linear-gradient(135deg, #1e1c72 0%, #2d2a9d 100%);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 36px;
  font-weight: bold;
}

.logo-text h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-left .version {
  font-size: 14px;
  opacity: 0.8;
}

.header-center {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}

.nav-tabs {
  display: flex;
  gap: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 5px 10px;
  border: 1px solid #dee2e6;
}

.nav-tab {
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #495057;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.nav-tab.active {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%);
  color: #1e1c72;
  border-color: #1e1c72;
}

.nav-tab:hover:not(.active) {
  background: #e9ecef;
  color: #1e1c72;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.header-actions .el-button {
  margin-left: 10px;
}

.editor-sidebar {
  width: 350px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-right: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.sidebar-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e1c72;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(30, 28, 114, 0.15);
  border-color: #1e1c72;
}

.stat-icon {
  font-size: 28px;
  color: #1e1c72;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #1e1c72;
}

.stat-label {
  font-size: 13px;
  color: #6c757d;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-btn {
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.quick-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.editor-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.content-section {
  margin-bottom: 24px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.section-header h3 {
  margin: 0;
  color: #1e1c72;
  font-size: 20px;
  font-weight: 600;
}

.section-desc {
  font-size: 14px;
  color: #6c757d;
  margin-top: 4px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.setting-card .el-card__header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e9ecef;
  color: #1e1c72;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  font-size: 20px;
}

.setting-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.setting-item {
  display: flex;
  flex-direction: column;
}

.setting-item label {
  font-weight: 600;
  color: #495057;
  font-size: 15px;
  margin-bottom: 5px;
}

.setting-input .el-input-number__decrease,
.setting-input .el-input-number__increase {
  line-height: 28px;
}

.setting-input .el-input-number__inner {
  text-align: center;
  font-size: 15px;
}

.setting-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.drawing-layout {
  display: flex;
  gap: 24px;
}

.image-list-panel {
  flex: 0 0 350px;
  max-height: 70vh;
  overflow-y: auto;
}

.list-card .el-card__header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e9ecef;
  color: #1e1c72;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-item {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  background: white;
}

.image-item:hover {
  border-color: #1e1c72;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 28, 114, 0.2);
}

.image-item.active {
  border-color: #1e1c72;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%);
  box-shadow: 0 0 15px rgba(30, 28, 114, 0.3);
}

.image-preview {
  width: 100%;
  height: 120px;
  overflow: hidden;
  border-radius: 6px;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 0 0 6px 6px;
  font-size: 12px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.image-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  width: 100%;
}

.image-info .image-title {
  font-size: 14px;
  color: #495057;
  font-weight: 600;
}

.image-actions .el-button {
  padding: 0;
  min-width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-actions .el-button i {
  font-size: 18px;
}

.drawing-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.drawing-card .el-card__header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e9ecef;
  color: #1e1c72;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.drawing-area {
  position: relative;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 全屏模式下的绘制区域样式 */
.drawing-area.fullscreen-drawing {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 99999 !important;
  background-color: #000 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.editable-image {
  width: 100%;
  height: auto;
  cursor: crosshair;
  transition: transform 0.3s ease;
}

.editable-image:hover {
  transform: scale(1.02);
}

.existing-point {
  position: absolute;
  border: 3px solid #ff4757;
  background-color: rgba(255, 71, 87, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.existing-point:hover {
  border-color: #ff6b7a;
  background-color: rgba(255, 107, 122, 0.3);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
}

.point-number {
  color: #ff4757;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 1px 1px 2px white;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.connection-line {
  position: absolute;
  pointer-events: none;
  z-index: 5;
}

.line-segment {
  position: absolute;
  background: linear-gradient(135deg, #1e1c72 0%, #2d2a9d 100%);
  box-shadow: 0 0 8px rgba(30, 28, 114, 0.4);
  border-radius: 2px;
}

.line-segment.horizontal {
  width: 150px;
  height: 4px;
  top: 50%;
  right: -150px;
  transform: translateY(-50%);
}

.line-segment.vertical {
  width: 4px;
  height: 120px;
  left: 50%;
  top: -120px;
  transform: translateX(-50%);
}

/* 垂直-水平连接线的特殊样式 */
.connection-line.vertical-horizontal .line-segment.horizontal {
  top: -120px;
  right: -150px;
}

.connection-line.vertical-horizontal .line-segment.vertical {
  top: -120px;
  left: 50%;
}

.drawing-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(30, 28, 114, 0.95) 0%, rgba(45, 42, 157, 0.95) 100%);
  color: white;
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  z-index: 10;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hint-content h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #fff;
}

.hint-content p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.9;
}

/* 改进绘制矩形的样式 */
.drawing-rect {
  position: absolute;
  border: 4px dashed #1e1c72;
  background-color: rgba(30, 28, 114, 0.1);
  pointer-events: none;
  z-index: 8;
  animation: drawAnimation 0.3s ease-out;
  border-radius: 4px;
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

.empty-drawing {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.empty-drawing .el-empty__description {
  color: #6c757d;
}

.empty-drawing .el-empty__image {
  opacity: 0.5;
}

.data-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.action-card .el-card__header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e9ecef;
  color: #1e1c72;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-content p {
  font-size: 14px;
  color: #495057;
  margin-bottom: 15px;
}

.action-btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
}

.modern-dialog .el-dialog__header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e9ecef;
  color: #1e1c72;
  font-size: 18px;
  font-weight: 600;
}

.modern-dialog .el-dialog__body {
  padding: 20px;
}

.modern-dialog .el-dialog__footer {
  padding: 15px 20px;
  border-top: 2px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-footer .el-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
}

.modern-dialog .el-dialog__header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e9ecef;
  color: #1e1c72;
  font-size: 18px;
  font-weight: 600;
}

.modern-dialog .el-dialog__body {
  padding: 20px;
}

.modern-dialog .el-dialog__footer {
  padding: 15px 20px;
  border-top: 2px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.upload-area {
  text-align: center;
  border: 2px dashed #1e1c72;
  border-radius: 8px;
  padding: 40px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.upload-area:hover {
  border-color: #2d2a9d;
  background-color: #e9ecef;
}

.upload-area .el-icon--upload {
  font-size: 60px;
  color: #1e1c72;
  margin-bottom: 15px;
}

.upload-area .el-upload__text {
  font-size: 16px;
  color: #495057;
}

.upload-area .el-upload__text em {
  font-style: normal;
  color: #1e1c72;
  font-weight: 600;
}

.upload-area .el-upload__tip {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .level-editor {
    width: 98%;
    max-width: none;
  }
  
  .editor-sidebar {
    width: 250px;
  }
  
  .drawing-layout {
    flex-direction: column;
  }

  .image-list-panel {
    flex: none;
    width: 100%;
    max-height: 30vh;
  }

  .drawing-panel {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .level-editor {
    flex-direction: column;
    height: 95vh;
  }
  
  .editor-sidebar {
    width: 100%;
    max-height: 40vh;
  }
  
  .sidebar-menu {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .sidebar-menu .el-menu-item {
    width: 50%;
    text-align: center;
  }

  .sidebar-menu .el-menu-item.is-active {
    border-right: none;
    border-bottom: 3px solid #1e1c72;
  }

  .editor-content {
    padding: 15px;
  }

  .content-section {
    padding: 15px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .section-header h3 {
    font-size: 18px;
  }

  .section-desc {
    font-size: 13px;
  }

  .setting-form .el-form-item {
    margin-bottom: 15px;
  }

  .setting-form .el-input-number {
    width: 100%;
  }

  .setting-form .el-input-number__decrease,
  .setting-form .el-input-number__increase {
    line-height: 24px;
  }

  .setting-form .el-input-number__inner {
    font-size: 14px;
  }

  .form-hint {
    font-size: 11px;
  }

  .image-list-panel {
    max-height: 30vh;
  }

  .image-item {
    padding: 10px;
  }

  .image-preview {
    height: 100px;
  }

  .image-overlay {
    padding: 3px 6px;
    font-size: 10px;
  }

  .image-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .image-info .image-title {
    font-size: 13px;
  }

  .image-actions .el-button {
    padding: 0;
    min-width: 25px;
    height: 25px;
  }

  .image-actions .el-button i {
    font-size: 16px;
  }

  .drawing-card .el-card__header {
    font-size: 16px;
  }

  .drawing-area {
    border: 1px solid #dee2e6;
    background-color: #f8f9fa;
  }

  .drawing-area.fullscreen-drawing {
    grid-template-columns: 1fr !important;
  }

  .editable-image {
    max-width: 100vw !important;
    max-height: 100vh !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    cursor: crosshair !important;
    position: relative !important;
    z-index: 1 !important;
  }

  .existing-point {
    border-width: 3px !important;
    border-color: #ff4757 !important;
    background-color: rgba(255, 71, 87, 0.2) !important;
    box-shadow: 0 0 15px rgba(255, 71, 87, 0.5) !important;
  }

  .point-number {
    font-size: 16px !important;
    text-shadow: 1px 1px 2px white !important;
  }

  .connection-line .line-segment {
    background: linear-gradient(135deg, #1e1c72 0%, #2d2a9d 100%) !important;
    box-shadow: 0 0 8px rgba(30, 28, 114, 0.4) !important;
  }

  .line-segment.horizontal {
    width: 120px !important;
    height: 4px !important;
    top: 50% !important;
    right: -120px !important;
    transform: translateY(-50%) !important;
  }

  .line-segment.vertical {
    width: 4px !important;
    height: 100px !important;
    left: 50% !important;
    top: -100px !important;
    transform: translateX(-50%) !important;
  }

  .connection-line.vertical-horizontal .line-segment.horizontal {
    top: -100px !important;
    right: -120px !important;
  }

  .connection-line.vertical-horizontal .line-segment.vertical {
    top: -100px !important;
    left: 50% !important;
  }

  .drawing-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 20px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    text-align: center;
    z-index: 100000;
  }

  .hint-content h4 {
    color: #1e1c72;
    margin-bottom: 15px;
    font-size: 20px;
  }

  .hint-content p {
    margin: 8px 0;
    color: #495057;
    font-size: 14px;
  }

  .drawing-rect {
    border-width: 3px !important;
    border-color: #1e1c72 !important;
    background-color: rgba(30, 28, 114, 0.1) !important;
    box-shadow: 0 0 15px rgba(30, 28, 114, 0.6) !important;
  }

  .point-editor {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #dee2e6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .point-editor h4 {
    margin: 0 0 15px 0;
    color: #1e1c72;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 10px;
  }

  .instruction-box {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .instruction-box h5 {
    margin: 0 0 12px 0;
    color: #1e1c72;
    font-size: 14px;
    font-weight: 600;
  }

  .instruction-box ol {
    margin: 0;
    padding-left: 15px;
    color: #495057;
    line-height: 1.5;
  }

  .instruction-box li {
    margin-bottom: 6px;
  }

  .connection-preview {
    margin-bottom: 15px;
    padding: 15px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .connection-preview h5 {
    margin: 0 0 12px 0;
    color: #1e1c72;
    font-size: 14px;
    font-weight: 600;
  }

  .preview-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%);
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .preview-point {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1e1c72 0%, #2d2a9d 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 8px rgba(30, 28, 114, 0.3);
  }

  .preview-connection-line {
    position: relative;
    width: 100px;
    height: 100px;
  }

  .preview-line-segment {
    position: absolute;
    background: linear-gradient(135deg, #1e1c72 0%, #2d2a9d 100%);
    box-shadow: 0 0 8px rgba(30, 28, 114, 0.4);
    border-radius: 2px;
  }

  .preview-line-segment.horizontal {
    width: 100px;
    height: 4px;
    top: 50%;
    right: -100px;
    transform: translateY(-50%);
  }

  .preview-line-segment.vertical {
    width: 4px;
    height: 90px;
    left: 50%;
    top: -90px;
    transform: translateX(-50%);
  }

  .preview-connection-line.vertical-horizontal .preview-line-segment.horizontal {
    top: -90px;
    right: -100px;
  }

  .preview-connection-line.vertical-horizontal .preview-line-segment.vertical {
    top: -90px;
    left: 50%;
  }

  .point-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-weight: 600;
    color: #495057;
    font-size: 13px;
  }

  .form-input, .form-textarea, .form-select {
    padding: 10px 14px;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    transition: all 0.3s ease;
    background: white;
  }

  .form-input:focus, .form-textarea:focus, .form-select:focus {
    outline: none;
    border-color: #1e1c72;
    box-shadow: 0 0 0 3px rgba(30, 28, 114, 0.1);
    transform: translateY(-1px);
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }

  .save-point-btn, .cancel-point-btn, .delete-point-btn {
    flex: 1;
    padding: 10px 14px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .save-point-btn {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
  }

  .save-point-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(40, 167, 69, 0.3);
  }

  .cancel-point-btn {
    background: #6c757d;
    color: white;
  }

  .cancel-point-btn:hover {
    background: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(108, 117, 125, 0.3);
  }

  .delete-point-btn {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
  }

  .delete-point-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(220, 53, 69, 0.3);
  }

  .add-point-section {
    text-align: center;
    padding: 15px;
  }

  .drawing-controls {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    justify-content: center;
  }

  .add-point-btn {
    background: linear-gradient(135deg, #1e1c72 0%, #2d2a9d 100%);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(30, 28, 114, 0.3);
  }

  .add-point-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(30, 28, 114, 0.4);
  }

  .cancel-drawing-btn {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }

  .cancel-drawing-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(220, 53, 69, 0.4);
  }

  .floating-editor {
    position: fixed !important;
    z-index: 100000 !important;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border: 2px solid #e9ecef;
    min-width: 350px;
    max-width: 450px;
    transform: translate(-50%, -50%);
    cursor: move;
    user-select: none;
  }

  .floating-editor.fullscreen-editor {
    transform: none;
  }

  .floating-editor .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 2px solid #e9ecef;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px 12px 0 0;
    cursor: move;
  }

  .floating-editor .editor-header h4 {
    margin: 0;
    color: #1e1c72;
    font-size: 16px;
    font-weight: 600;
  }

  .close-editor-btn {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .close-editor-btn:hover {
    background: #c82333;
    transform: scale(1.1);
  }

  .fullscreen-controls {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100001;
  }

  .fullscreen-controls .cancel-drawing-btn {
    background: rgba(220, 53, 69, 0.9);
    backdrop-filter: blur(10px);
    border: 2px solid white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .image-editor.fullscreen-drawing .image-container {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 99999 !important;
    background: #000 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .image-editor.fullscreen-drawing .image-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .image-editor.fullscreen-drawing .drawing-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    text-align: center;
    z-index: 100000;
  }

  .image-editor.fullscreen-drawing .drawing-hint h4 {
    color: #1e1c72;
    margin-bottom: 15px;
    font-size: 20px;
  }

  .image-editor.fullscreen-drawing .drawing-hint p {
    margin: 8px 0;
    color: #495057;
    font-size: 14px;
  }
}

/* 现代化卡片样式 */
.setting-card,
.action-card,
.list-card,
.drawing-card {
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.setting-card:hover,
.action-card:hover,
.list-card:hover,
.drawing-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(30, 28, 114, 0.15);
  border-color: #1e1c72;
}

/* 现代化输入框样式 */
.setting-input .el-input-number {
  width: 100%;
}

.setting-input .el-input-number__inner {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.setting-input .el-input-number__inner:focus {
  border-color: #1e1c72;
  box-shadow: 0 0 0 3px rgba(30, 28, 114, 0.1);
}

/* 现代化按钮样式 */
.header-actions .el-button {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.header-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式优化 */
@media (max-width: 1400px) {
  .editor-sidebar {
    width: 300px;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1200px) {
  .level-editor {
    width: 98%;
    max-width: none;
  }
  
  .editor-sidebar {
    width: 280px;
  }
  
  .drawing-layout {
    flex-direction: column;
  }

  .image-list-panel {
    flex: none;
    width: 100%;
    max-height: 30vh;
  }

  .drawing-panel {
    flex: none;
    width: 100%;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .level-editor {
    flex-direction: column;
    height: 95vh;
  }
  
  .editor-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .header-center {
    order: 2;
  }
  
  .header-right {
    order: 3;
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .editor-sidebar {
    width: 100%;
    max-height: 40vh;
    padding: 15px;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .quick-actions {
    justify-content: center;
  }
  
  .editor-content {
    padding: 15px;
  }
  
  .content-section {
    padding: 15px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .section-header h3 {
    font-size: 18px;
  }
  
  .section-desc {
    font-size: 13px;
  }
  
  .setting-item {
    margin-bottom: 15px;
  }
  
  .setting-input .el-input-number {
    width: 100%;
  }
  
  .image-list-panel {
    max-height: 30vh;
  }
  
  .image-item {
    padding: 10px;
  }
  
  .image-preview {
    height: 100px;
  }
  
  .image-overlay {
    padding: 3px 6px;
    font-size: 10px;
  }
  
  .image-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .image-info .image-title {
    font-size: 13px;
  }
  
  .image-actions .el-button {
    padding: 0;
    min-width: 25px;
    height: 25px;
  }
  
  .image-actions .el-button i {
    font-size: 16px;
  }
  
  .drawing-card .el-card__header {
    font-size: 16px;
  }
  
  .drawing-area {
    border: 1px solid #dee2e6;
    background-color: #f8f9fa;
  }
  
  .drawing-area.fullscreen-drawing {
    grid-template-columns: 1fr !important;
  }
  
  .editable-image {
    max-width: 100vw !important;
    max-height: 100vh !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    cursor: crosshair !important;
    position: relative !important;
    z-index: 1 !important;
  }
  
  .existing-point {
    border-width: 3px !important;
    border-color: #ff4757 !important;
    background-color: rgba(255, 71, 87, 0.2) !important;
    box-shadow: 0 0 15px rgba(255, 71, 87, 0.5) !important;
  }
  
  .point-number {
    font-size: 16px !important;
    text-shadow: 1px 1px 2px white !important;
  }
  
  .connection-line .line-segment {
    background: linear-gradient(135deg, #1e1c72 0%, #2d2a9d 100%) !important;
    box-shadow: 0 0 8px rgba(30, 28, 114, 0.4) !important;
  }
  
  .line-segment.horizontal {
    width: 120px !important;
    height: 4px !important;
    top: 50% !important;
    right: -120px !important;
    transform: translateY(-50%) !important;
  }
  
  .line-segment.vertical {
    width: 4px !important;
    height: 100px !important;
    left: 50% !important;
    top: -100px !important;
    transform: translateX(-50%) !important;
  }
  
  .connection-line.vertical-horizontal .line-segment.horizontal {
    top: -100px !important;
    right: -120px !important;
  }
  
  .connection-line.vertical-horizontal .line-segment.vertical {
    top: -100px !important;
    left: 50% !important;
  }
  
  .drawing-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 20px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    text-align: center;
    z-index: 100000;
  }
  
  .hint-content h4 {
    color: #1e1c72;
    margin-bottom: 15px;
    font-size: 20px;
  }
  
  .hint-content p {
    margin: 8px 0;
    color: #495057;
    font-size: 14px;
  }
  
  .drawing-rect {
    border-width: 3px !important;
    border-color: #1e1c72 !important;
    background-color: rgba(30, 28, 114, 0.1) !important;
    box-shadow: 0 0 15px rgba(30, 28, 114, 0.6) !important;
  }
  
  .point-editor {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #dee2e6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .point-editor h4 {
    margin: 0 0 15px 0;
    color: #1e1c72;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 10px;
  }
  
  .instruction-box {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .instruction-box h5 {
    margin: 0 0 12px 0;
    color: #1e1c72;
    font-size: 14px;
    font-weight: 600;
  }
  
  .instruction-box ol {
    margin: 0;
    padding-left: 15px;
    color: #495057;
    line-height: 1.5;
  }
  
  .instruction-box li {
    margin-bottom: 6px;
  }
  
  .connection-preview {
    margin-bottom: 15px;
    padding: 15px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .connection-preview h5 {
    margin: 0 0 12px 0;
    color: #1e1c72;
    font-size: 14px;
    font-weight: 600;
  }
  
  .preview-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%);
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .preview-point {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1e1c72 0%, #2d2a9d 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 8px rgba(30, 28, 114, 0.3);
  }
  
  .preview-connection-line {
    position: relative;
    width: 100px;
    height: 100px;
  }
  
  .preview-line-segment {
    position: absolute;
    background: linear-gradient(135deg, #1e1c72 0%, #2d2a9d 100%);
    box-shadow: 0 0 8px rgba(30, 28, 114, 0.4);
    border-radius: 2px;
  }
  
  .preview-line-segment.horizontal {
    width: 100px;
    height: 4px;
    top: 50%;
    right: -100px;
    transform: translateY(-50%);
  }
  
  .preview-line-segment.vertical {
    width: 4px;
    height: 90px;
    left: 50%;
    top: -90px;
    transform: translateX(-50%);
  }
  
  .preview-connection-line.vertical-horizontal .preview-line-segment.horizontal {
    top: -90px;
    right: -100px;
  }
  
  .preview-connection-line.vertical-horizontal .preview-line-segment.vertical {
    top: -90px;
    left: 50%;
  }
  
  .point-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .form-group label {
    font-weight: 600;
    color: #495057;
    font-size: 13px;
  }
  
  .form-input, .form-textarea, .form-select {
    padding: 10px 14px;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    transition: all 0.3s ease;
    background: white;
  }
  
  .form-input:focus, .form-textarea:focus, .form-select:focus {
    outline: none;
    border-color: #1e1c72;
    box-shadow: 0 0 0 3px rgba(30, 28, 114, 0.1);
    box-shadow: 0 0 0 3px rgba(30, 28, 114, 0.1);
  }
  
  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }
  
  .save-point-btn, .cancel-point-btn, .delete-point-btn {
    flex: 1;
    padding: 10px 14px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .save-point-btn {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
  }
  
  .save-point-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(40, 167, 69, 0.3);
  }
  
  .cancel-point-btn {
    background: #6c757d;
    color: white;
  }
  
  .cancel-point-btn:hover {
    background: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(108, 117, 125, 0.3);
  }
  
  .delete-point-btn {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
  }
  
  .delete-point-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(220, 53, 69, 0.3);
  }
  
  .add-point-section {
    text-align: center;
    padding: 15px;
  }
  
  .drawing-controls {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    justify-content: center;
  }
  
  .add-point-btn {
    background: linear-gradient(135deg, #1e1c72 0%, #2d2a9d 100%);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(30, 28, 114, 0.3);
  }
  
  .add-point-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(30, 28, 114, 0.4);
  }
  
  .cancel-drawing-btn {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }
  
  .cancel-drawing-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(220, 53, 69, 0.4);
  }
  
  .floating-editor {
    position: fixed !important;
    z-index: 100000 !important;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border: 2px solid #e9ecef;
    min-width: 350px;
    max-width: 450px;
    transform: translate(-50%, -50%);
    cursor: move;
    user-select: none;
  }
  
  .floating-editor.fullscreen-editor {
    transform: none;
  }
  
  .floating-editor .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 2px solid #e9ecef;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px 12px 0 0;
    cursor: move;
  }
  
  .floating-editor .editor-header h4 {
    margin: 0;
    color: #1e1c72;
    font-size: 16px;
    font-weight: 600;
  }
  
  .close-editor-btn {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .close-editor-btn:hover {
    background: #c82333;
    transform: scale(1.1);
  }
  
  .fullscreen-controls {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100001;
  }
  
  .fullscreen-controls .cancel-drawing-btn {
    background: rgba(220, 53, 69, 0.9);
    backdrop-filter: blur(10px);
    border: 2px solid white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
  
  .image-editor.fullscreen-drawing .image-container {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 99999 !important;
    background: #000 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  .image-editor.fullscreen-drawing .image-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .image-editor.fullscreen-drawing .drawing-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    text-align: center;
    z-index: 100000;
  }
  
  .image-editor.fullscreen-drawing .drawing-hint h4 {
    color: #1e1c72;
    margin-bottom: 15px;
    font-size: 20px;
  }
  
  .image-editor.fullscreen-drawing .drawing-hint p {
    margin: 8px 0;
    color: #495057;
    font-size: 14px;
  }
}
</style> 