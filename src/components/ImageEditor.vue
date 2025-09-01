<template>
  <div class="image-editor-fullscreen">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <span class="image-name">{{ currentImage.name }}</span>
        <span class="image-info">{{ currentImage.width }} × {{ currentImage.height }}</span>
      </div>
      <div class="status-center">
        <span class="warning-points-count">{{ currentImage.warningPoints.length }} 个警示点</span>
      </div>
      <div class="status-right">
        <el-button 
          type="primary" 
          size="small"
          @click="saveImage"
        >
          保存
        </el-button>
        <el-button 
          type="success" 
          size="small"
          @click="exportImage"
        >
          导出
        </el-button>
        <el-button 
          type="warning" 
          size="small"
          @click="resetImage"
        >
          重置
        </el-button>
        <el-button 
          type="info" 
          size="small"
          @click="$emit('exit')"
        >
          退出
        </el-button>
      </div>
    </div>

    <!-- 全屏图片容器 -->
    <div class="fullscreen-image-container" ref="imageContainerRef">
      <img 
        :src="currentImage.url" 
        :alt="currentImage.name"
        ref="imageRef"
        @load="onImageLoad"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @wheel="onWheel"
      />
      
      <!-- 警示点绘制层 -->
      <div class="drawing-layer" ref="drawingLayerRef">
        <!-- 警示点矩形 -->
        <div
          v-for="point in currentImage.warningPoints"
          :key="point.id"
          class="warning-point"
          :class="{ 'selected': selectedPoint?.id === point.id }"
          :style="getWarningPointStyle(point)"
          @click="selectPoint(point)"
        >
          <!-- 连接线 -->
          <div 
            class="connection-line"
            :class="point.connectionType"
            :style="getConnectionLineStyle(point)"
          ></div>
          
          <!-- 警示标题框 -->
          <div 
            class="warning-title"
            :style="getWarningTitleStyle(point)"
          >
            {{ point.title }}
          </div>
          
          <!-- 警示详细内容框 -->
          <div 
            class="warning-description"
            :style="getWarningDescriptionStyle(point)"
          >
            {{ point.description }}
          </div>
        </div>
        
        <!-- 正在绘制的矩形 -->
        <div
          v-if="isDrawing"
          class="drawing-rectangle"
          :style="getDrawingRectangleStyle()"
        ></div>
      </div>
    </div>
    
    <!-- 浮动工具栏 -->
    <div 
      class="floating-toolbar"
      :class="{ 'collapsed': toolbarCollapsed }"
      :style="toolbarStyle"
      ref="toolbarRef"
    >
      <div class="toolbar-header" @mousedown="startToolbarDrag">
        <span class="toolbar-title">绘制工具</span>
        <div class="toolbar-controls">
          <el-button 
            type="text" 
            size="small"
            @click="toggleToolbar"
          >
            <el-icon><component :is="toolbarCollapsed ? 'Expand' : 'Fold'" /></el-icon>
          </el-button>
          <el-button 
            type="text" 
            size="small"
            @click="resetToolbarPosition"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>
      
      <div class="toolbar-content" v-show="!toolbarCollapsed">
        <!-- 绘制模式选择 -->
        <div class="tool-section">
          <h4>绘制模式</h4>
          <div class="mode-buttons">
            <el-button 
              :type="drawMode === 'select' ? 'primary' : 'default'"
              size="small"
              @click="setDrawMode('select')"
            >
              选择
            </el-button>
            <el-button 
              :type="drawMode === 'rectangle' ? 'primary' : 'default'"
              size="small"
              @click="setDrawMode('rectangle')"
            >
              矩形
            </el-button>
            <el-button 
              :type="drawMode === 'move' ? 'primary' : 'default'"
              size="small"
              @click="setDrawMode('move')"
            >
              移动
            </el-button>
            <el-button 
              :type="drawMode === 'delete' ? 'primary' : 'default'"
              size="small"
              @click="setDrawMode('delete')"
            >
              删除
            </el-button>
          </div>
        </div>
        
        <!-- 连接线类型选择 -->
        <div class="tool-section">
          <h4>连接线类型</h4>
          <div class="connection-type-buttons">
            <el-button 
              :type="connectionType === 'horizontal' ? 'primary' : 'default'"
              size="small"
              @click="setConnectionType('horizontal')"
            >
              横线
            </el-button>
            <el-button 
              :type="connectionType === 'vertical-horizontal' ? 'primary' : 'default'"
              size="small"
              @click="setConnectionType('vertical-horizontal')"
            >
              L型（先竖后横）
            </el-button>
            <el-button 
              :type="connectionType === 'none' ? 'primary' : 'default'"
              size="small"
              @click="setConnectionType('none')"
            >
              无连接线
            </el-button>
          </div>
        </div>
        
        <!-- 警示点属性编辑 -->
        <div v-if="selectedPoint" class="tool-section">
          <h4>警示点属性</h4>
          <div class="point-form">
            <el-input
              v-model="selectedPoint.title"
              placeholder="警示标题"
              size="small"
              style="margin-bottom: 8px;"
            />
            <el-textarea
              v-model="selectedPoint.description"
              placeholder="详细描述"
              :rows="3"
              size="small"
              style="margin-bottom: 8px;"
            />
            <div class="point-actions">
              <el-button 
                type="danger" 
                size="small"
                @click="deleteSelectedPoint"
              >
                删除警示点
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="tool-section">
          <h4>操作</h4>
          <div class="action-buttons">
            <el-button 
              type="primary" 
              size="small"
              @click="saveImage"
            >
              保存
            </el-button>
            <el-button 
              type="success" 
              size="small"
              @click="exportImage"
            >
              导出
            </el-button>
            <el-button 
              type="warning" 
              size="small"
              @click="resetImage"
            >
              重置
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Expand, Fold, Refresh } from '@element-plus/icons-vue'
import type { GameLevel, PuzzlePoint, ConnectionType } from '../types/puzzle'

// 定义组件所需的绘制模式类型
type DrawMode = 'select' | 'rectangle' | 'move' | 'delete'

// 扩展PuzzlePoint接口，添加编辑器所需的字段
interface ExtendedPuzzlePoint extends PuzzlePoint {
  id?: string  // 编辑器中用于标识的ID
  connectionOffset?: { x: number; y: number }  // 连接线偏移
}

// 为了兼容性，创建类型别名
type GameImage = GameLevel
type WarningPoint = ExtendedPuzzlePoint
type ConnectionLineType = ConnectionType

// 添加默认导出
defineOptions({
  name: 'ImageEditor'
})

// Props
interface Props {
  image: GameImage
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  exit: []
  save: [image: GameImage]
}>()

// Refs
const editorRef = ref<HTMLDivElement>()
const imageContainerRef = ref<HTMLDivElement>()
const imageRef = ref<HTMLImageElement>()
const drawingLayerRef = ref<HTMLDivElement>()
const toolbarRef = ref<HTMLDivElement>()

// 响应式数据
const currentImage = ref<GameImage>(JSON.parse(JSON.stringify(props.image)))
const selectedPoint = ref<WarningPoint | null>(null)
const drawMode = ref<DrawMode>('select')
const connectionType = ref<ConnectionLineType>('horizontal')
const isDrawing = ref(false)
const drawingStart = ref({ x: 0, y: 0 })
const drawingEnd = ref({ x: 0, y: 0 })
const toolbarCollapsed = ref(false)
const toolbarPosition = reactive({ x: 20, y: 20 })
const isDraggingToolbar = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 图片缩放和位置信息
const imageScale = ref(1)
const imageOffset = ref({ x: 0, y: 0 })

// 计算属性
const toolbarStyle = computed(() => ({
  left: `${toolbarPosition.x}px`,
  top: `${toolbarPosition.y}px`
}))

// 方法
const onImageLoad = () => {
  if (imageRef.value) {
    calculateImageScale()
  }
}

const calculateImageScale = () => {
  if (!imageRef.value || !imageContainerRef.value) return
  
  const container = imageContainerRef.value.getBoundingClientRect()
  const img = imageRef.value
  
  const scaleX = container.width / img.naturalWidth
  const scaleY = container.height / img.naturalHeight
  
  imageScale.value = Math.min(scaleX, scaleY)
  
  // 居中图片
  const scaledWidth = img.naturalWidth * imageScale.value
  const scaledHeight = img.naturalHeight * imageScale.value
  
  imageOffset.value.x = (container.width - scaledWidth) / 2
  imageOffset.value.y = (container.height - scaledHeight) / 2
}

const onMouseDown = (e: MouseEvent) => {
  if (drawMode.value === 'rectangle') {
    startDrawing(e)
  } else if (drawMode.value === 'move') {
    startMoving(e)
  }
}

const onMouseMove = (e: MouseEvent) => {
  if (isDrawing.value) {
    updateDrawing(e)
  }
}

const onMouseUp = (e: MouseEvent) => {
  if (isDrawing.value) {
    finishDrawing(e)
  }
}

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  // 可以添加缩放功能
}

const startDrawing = (e: MouseEvent) => {
  const rect = imageContainerRef.value!.getBoundingClientRect()
  const x = (e.clientX - rect.left - imageOffset.value.x) / imageScale.value
  const y = (e.clientY - rect.top - imageOffset.value.y) / imageScale.value
  
  drawingStart.value = { x, y }
  drawingEnd.value = { x, y }
  isDrawing.value = true
}

const updateDrawing = (e: MouseEvent) => {
  if (!isDrawing.value) return
  
  const rect = imageContainerRef.value!.getBoundingClientRect()
  const x = (e.clientX - rect.left - imageOffset.value.x) / imageScale.value
  const y = (e.clientY - rect.top - imageOffset.value.y) / imageScale.value
  
  drawingEnd.value = { x, y }
}

const finishDrawing = (e: MouseEvent) => {
  if (!isDrawing.value) return
  
  const rect = imageContainerRef.value!.getBoundingClientRect()
  const x = (e.clientX - rect.left - imageOffset.value.x) / imageScale.value
  const y = (e.clientY - rect.top - imageOffset.value.y) / imageScale.value
  
  drawingEnd.value = { x, y }
  
  // 检查矩形大小是否有效
  const width = Math.abs(drawingEnd.value.x - drawingStart.value.x)
  const height = Math.abs(drawingEnd.value.y - drawingStart.value.y)
  
  if (width < 20 || height < 20) {
    isDrawing.value = false
    return
  }
  
  // 创建新的警示点
  const newPoint: WarningPoint = {
    id: `wp-${Date.now()}`,
    x: Math.min(drawingStart.value.x, drawingEnd.value.x),
    y: Math.min(drawingStart.value.y, drawingEnd.value.y),
    width,
    height,
    title: '新警示点',
    description: '请输入警示描述',
    connectionType: connectionType.value,
    connectionOffset: { x: 100, y: 0 }
  }
  
  currentImage.value.warningPoints.push(newPoint)
  selectedPoint.value = newPoint
  drawMode.value = 'select'
  isDrawing.value = false
  
  ElMessage.success('警示点创建成功')
}

const startMoving = (e: MouseEvent) => {
  // 实现移动功能
}

const selectPoint = (point: WarningPoint) => {
  if (drawMode.value === 'delete') {
    deleteWarningPointById(point.id)
    return
  }
  
  selectedPoint.value = point
  drawMode.value = 'select'
}

const deleteWarningPointById = (id: string) => {
  const index = currentImage.value.warningPoints.findIndex(p => p.id === id)
  if (index > -1) {
    currentImage.value.warningPoints.splice(index, 1)
    if (selectedPoint.value?.id === id) {
      selectedPoint.value = null
    }
    ElMessage.success('警示点删除成功')
  }
}

const deleteSelectedPoint = () => {
  if (!selectedPoint.value) return
  
  ElMessageBox.confirm('确定要删除这个警示点吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteWarningPointById(selectedPoint.value!.id)
  })
}

const updateWarningPoint = () => {
  if (!selectedPoint.value) return
  
  const index = currentImage.value.warningPoints.findIndex(p => p.id === selectedPoint.value!.id)
  if (index > -1) {
    currentImage.value.warningPoints[index] = { ...selectedPoint.value }
  }
}

const setDrawMode = (mode: DrawMode) => {
  drawMode.value = mode
  selectedPoint.value = null
}

const setConnectionType = (type: ConnectionLineType) => {
  connectionType.value = type
}

const toggleToolbar = () => {
  toolbarCollapsed.value = !toolbarCollapsed.value
  saveToolbarState()
}

const startToolbarDrag = (e: MouseEvent) => {
  isDraggingToolbar.value = true
  dragStart.value = {
    x: e.clientX - toolbarPosition.x,
    y: e.clientY - toolbarPosition.y
  }
  
  document.addEventListener('mousemove', onToolbarDrag)
  document.addEventListener('mouseup', stopToolbarDrag)
}

const onToolbarDrag = (e: MouseEvent) => {
  if (!isDraggingToolbar.value) return
  
  const newX = e.clientX - dragStart.value.x
  const newY = e.clientY - dragStart.value.y
  
  // 限制在窗口内
  const maxX = window.innerWidth - 300
  const maxY = window.innerHeight - 400
  
  toolbarPosition.x = Math.max(0, Math.min(newX, maxX))
  toolbarPosition.y = Math.max(0, Math.min(newY, maxY))
}

const stopToolbarDrag = () => {
  isDraggingToolbar.value = false
  document.removeEventListener('mousemove', onToolbarDrag)
  document.removeEventListener('mouseup', stopToolbarDrag)
  saveToolbarState()
}

const resetToolbarPosition = () => {
  toolbarPosition.x = 20
  toolbarPosition.y = 20
  saveToolbarState()
}

const saveToolbarState = () => {
  localStorage.setItem('imageEditor_toolbar', JSON.stringify({
    position: toolbarPosition,
    collapsed: toolbarCollapsed.value
  }))
}

const loadToolbarState = () => {
  try {
    const saved = localStorage.getItem('imageEditor_toolbar')
    if (saved) {
      const state = JSON.parse(saved)
      toolbarPosition.x = state.position.x
      toolbarPosition.y = state.position.y
      toolbarCollapsed.value = state.collapsed
    }
  } catch (error) {
    console.warn('Failed to load toolbar state:', error)
  }
}

const saveImage = () => {
  currentImage.value.updatedAt = new Date().toISOString()
  emit('save', currentImage.value)
  ElMessage.success('图片保存成功')
}

const exportImage = () => {
  const data = {
    version: '1.0',
    image: currentImage.value,
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentImage.value.name}_export.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('图片导出成功')
}

const resetImage = () => {
  ElMessageBox.confirm('确定要重置图片吗？所有修改将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    currentImage.value = JSON.parse(JSON.stringify(props.image))
    selectedPoint.value = null
    ElMessage.success('图片已重置')
  })
}

// 样式计算
const getWarningPointStyle = (point: WarningPoint) => ({
  left: `${point.x * imageScale.value + imageOffset.value.x}px`,
  top: `${point.y * imageScale.value + imageOffset.value.y}px`,
  width: `${point.width * imageScale.value}px`,
  height: `${point.height * imageScale.value}px`
})

const getConnectionLineStyle = (point: WarningPoint) => {
  const baseStyle = {
    left: `${(point.x + point.width / 2) * imageScale.value + imageOffset.value.x}px`,
    top: `${(point.y + point.height / 2) * imageScale.value + imageOffset.value.y}px`
  }
  
  if (point.connectionType === 'horizontal') {
    return {
      ...baseStyle,
      width: `${Math.abs(point.connectionOffset.x) * imageScale.value}px`,
      height: '2px'
    }
  } else if (point.connectionType === 'vertical') {
    return {
      ...baseStyle,
      width: '2px',
      height: `${Math.abs(point.connectionOffset.y) * imageScale.value}px`
    }
  } else {
    return {
      ...baseStyle,
      width: `${Math.abs(point.connectionOffset.x) * imageScale.value}px`,
      height: `${Math.abs(point.connectionOffset.y) * imageScale.value}px`
    }
  }
}

const getWarningTitleStyle = (point: WarningPoint) => {
  const x = (point.x + point.width / 2) * imageScale.value + imageOffset.value.x
  const y = point.y * imageScale.value + imageOffset.value.y
  
  if (point.connectionType === 'horizontal') {
    return {
      left: `${x + point.connectionOffset.x * imageScale.value}px`,
      top: `${y - 60}px`
    }
  } else if (point.connectionType === 'vertical') {
    return {
      left: `${x}px`,
      top: `${y + point.connectionOffset.y * imageScale.value}px`
    }
  } else {
    return {
      left: `${x + point.connectionOffset.x * imageScale.value}px`,
      top: `${y + point.connectionOffset.y * imageScale.value}px`
    }
  }
}

const getWarningDescriptionStyle = (point: WarningPoint) => {
  const titleStyle = getWarningTitleStyle(point)
  return {
    left: titleStyle.left,
    top: `${parseInt(titleStyle.top as string) + 40}px`
  }
}

const getDrawingRectangleStyle = () => {
  if (!isDrawing.value) return {}
  
  const x = Math.min(drawingStart.value.x, drawingEnd.value.x)
  const y = Math.min(drawingStart.value.y, drawingEnd.value.y)
  const width = Math.abs(drawingEnd.value.x - drawingStart.value.x)
  const height = Math.abs(drawingEnd.value.y - drawingStart.value.y)
  
  return {
    left: `${x * imageScale.value + imageOffset.value.x}px`,
    top: `${y * imageScale.value + imageOffset.value.y}px`,
    width: `${width * imageScale.value}px`,
    height: `${height * imageScale.value}px`
  }
}

// 生命周期
onMounted(() => {
  loadToolbarState()
  nextTick(() => {
    calculateImageScale()
  })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onToolbarDrag)
  document.removeEventListener('mouseup', stopToolbarDrag)
})
</script>

<style scoped>
.image-editor-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  z-index: 9999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10000;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}

.status-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-name {
  font-size: 16px;
  font-weight: bold;
}

.image-info {
  font-size: 14px;
  color: #ccc;
}

.status-center {
  flex-grow: 1;
  text-align: center;
}

.warning-points-count {
  font-size: 16px;
  font-weight: bold;
  color: #ffa502;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fullscreen-image-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-top: 50px; /* 为状态栏留出空间 */
}

.fullscreen-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: auto;
}

.drawing-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.warning-point {
  position: absolute;
  border: 2px solid #ff6b7a;
  background-color: rgba(255, 107, 122, 0.2);
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
}

.warning-point:hover {
  border-color: #ffa502;
  background-color: rgba(255, 165, 2, 0.3);
}

.warning-point.selected {
  border-color: #ffa502;
  background-color: rgba(255, 165, 2, 0.2);
  box-shadow: 0 0 10px rgba(255, 165, 2, 0.5);
}

.drawing-rectangle {
  position: absolute;
  border: 2px dashed #ffa502;
  background-color: rgba(255, 165, 2, 0.1);
  pointer-events: none;
}

.connection-line {
  position: absolute;
  background-color: #ffa502;
  transform: translate(-50%, -50%);
}

.connection-line.horizontal {
  height: 2px;
}

.connection-line.vertical {
  width: 2px;
}

.connection-line.horizontal-vertical {
  width: 2px;
  height: 2px;
}

.warning-title {
  position: absolute;
  background-color: #ffa502;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  transform: translate(-50%, -100%);
  margin-top: -8px;
  pointer-events: auto;
  cursor: pointer;
}

.warning-description {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  max-width: 200px;
  transform: translate(-50%, 0);
  margin-top: 8px;
  pointer-events: auto;
  cursor: pointer;
  line-height: 1.4;
}

.floating-toolbar {
  position: fixed;
  width: 280px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  user-select: none;
  top: 70px; /* 在状态栏下方 */
}

.floating-toolbar.collapsed {
  width: 200px;
}

.toolbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 8px 8px 0 0;
  cursor: move;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.toolbar-controls {
  display: flex;
  gap: 4px;
}

.toolbar-content {
  padding: 16px;
}

.tool-section {
  margin-bottom: 20px;
}

.tool-section:last-child {
  margin-bottom: 0;
}

.tool-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.mode-buttons,
.connection-type-buttons,
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.point-actions {
  margin-top: 12px;
  text-align: center;
}

.point-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .floating-toolbar {
    width: 260px;
  }
  
  .floating-toolbar.collapsed {
    width: 180px;
  }
  
  .status-bar {
    padding: 0 10px;
  }
  
  .status-left,
  .status-right {
    gap: 5px;
  }
}
</style> 