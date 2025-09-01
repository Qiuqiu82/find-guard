<template>
  <div class="image-management">
    <!-- 图片上传区域 -->
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">图片上传</span>
          <span class="card-subtitle">支持JPG/PNG/WebP格式，建议尺寸1920×945</span>
        </div>
      </template>
      
      <el-upload
        class="upload-area"
        drag
        :auto-upload="false"
        :on-change="handleImageUpload"
        :before-upload="beforeImageUpload"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        :limit="1"
        multiple
      >
        <div class="upload-content">
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">
            将图片拖到此处，或<em>点击上传</em>
          </div>
          <div class="upload-tip">
            支持 JPG/PNG/WebP 格式，建议尺寸 1920×945，最大 5MB
          </div>
        </div>
      </el-upload>
    </el-card>

    <!-- 图片列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <div>
            <span class="card-title">图片管理</span>
            <span class="card-subtitle">共 {{ imageList.length }} 张图片</span>
          </div>
          <div class="header-actions">
            <el-button @click="cleanupLegacyData" type="warning" size="small" icon="Delete">
              清理旧数据
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="imageList.length === 0" class="empty-state">
        <el-empty description="暂无图片，请先上传图片">
          <el-icon size="60" color="#909399"><Picture /></el-icon>
        </el-empty>
      </div>
      
      <div v-else class="image-grid">
        <div
          v-for="(level, index) in imageList"
          :key="index"
          class="image-item"
          :class="{ 'active': selectedImageIndex === index }"
          @click="selectImage(index)"
        >
          <div class="image-preview">
            <img :src="level.image" :alt="`图片${index + 1}`" />
            <div class="image-overlay">
              <span class="point-count">{{ level.points.length }}个警示点</span>
            </div>
          </div>
          
          <div class="image-info">
            <div class="image-title">{{ level.name || `图片${index + 1}` }}</div>
            <div class="image-actions">
              <el-button
                type="primary"
                size="small"
                @click.stop="editImageFullscreen(index)"
              >
                <el-icon><FullScreen /></el-icon>
                全屏编辑
              </el-button>
              <el-button
                type="success"
                size="small"
                @click.stop="editImage(index)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click.stop="deleteImage(index)"
                :disabled="level.isPreset"
                v-if="!level.isPreset"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 图片编辑对话框 -->
    <el-dialog
      v-model="showImageEditor"
      title="图片编辑"
      width="80%"
      :close-on-click-modal="false"
      class="image-editor-dialog"
    >
      <div v-if="editingImage" class="image-editor">
        <div class="editor-layout">
          <!-- 左侧图片显示 -->
          <div class="image-display">
            <div class="image-container" ref="imageContainer">
              <img 
                :src="editingImage.image" 
                @load="onImageLoad"
                @click="handleImageClick"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseUp"
                class="editable-image"
              />
              
              <!-- 显示现有的警示点 -->
              <div 
                v-for="(point, pointIndex) in editingImage.points" 
                :key="pointIndex"
                class="existing-point"
                :style="getPointStyle(point)"
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
                  left: `${Math.min(startPoint.x, currentPoint.x)}px`,
                  top: `${Math.min(startPoint.y, currentPoint.y)}px`,
                  width: `${Math.abs(currentPoint.x - startPoint.x)}px`,
                  height: `${Math.abs(currentPoint.y - startPoint.y)}px`
                }"
              ></div>
            </div>
            
            <!-- 绘制控制 -->
            <div class="drawing-controls">
              <el-button
                v-if="!isDrawing"
                type="primary"
                @click="startDrawing"
              >
                开始绘制
              </el-button>
              <el-button
                v-else
                type="danger"
                @click="cancelDrawing"
              >
                退出绘制
              </el-button>
            </div>
          </div>
          
          <!-- 右侧编辑面板 -->
          <div class="edit-panel">
            <div class="panel-section">
              <h4>绘制说明</h4>
              <div class="instruction-box">
                <ol>
                  <li>点击"开始绘制"进入绘制模式</li>
                  <li>在图片上拖拽鼠标绘制矩形区域</li>
                  <li>松开鼠标完成绘制</li>
                  <li>点击现有警示点进行编辑</li>
                </ol>
              </div>
            </div>
            
            <div class="panel-section">
              <h4>警示点列表</h4>
              <div class="points-list">
                <div
                  v-for="(point, pointIndex) in editingImage.points"
                  :key="pointIndex"
                  class="point-item"
                  :class="{ 'active': editingPointIndex === pointIndex }"
                  @click="editPoint(pointIndex)"
                >
                  <span class="point-index">{{ pointIndex + 1 }}</span>
                  <span class="point-title">{{ point.highlightTitle || '未命名' }}</span>
                  <div class="point-actions">
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click.stop="deletePoint(pointIndex)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showImageEditor = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 警示点编辑对话框 -->
    <el-dialog
      v-model="showPointEditor"
      title="警示点设置"
      width="500px"
      :close-on-click-modal="false"
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
          <el-select 
            v-model="editingPoint.connectionType" 
            style="width: 100%" 
            :teleported="true"
            popper-class="debug-popper"
          >
            <el-option 
              v-for="option in CONNECTION_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Picture, Delete, FullScreen } from '@element-plus/icons-vue'
import type { GameLevel, PuzzlePoint } from '../../types/puzzle'
import { CONNECTION_TYPE_OPTIONS } from '../../constants/connectionTypes'
import { createPoint, addPoint, pixelToRelative, relativeToPixel } from '../../utils/points'
import { presetImages } from '../../data/presetImages'

const store = useStore()
const router = useRouter()

// 响应式数据
const showImageEditor = ref(false)
const showPointEditor = ref(false)
const selectedImageIndex = ref<number | null>(null)
const editingImage = ref<GameLevel | null>(null)
const editingPointIndex = ref<number | null>(null)
const editingPoint = ref<PuzzlePoint | null>(null)
const forceUpdate = ref(0) // 强制更新触发器

// 存储空间信息
const storageInfo = ref({
  used: 0,
  total: 5 * 1024 * 1024 // 5MB 限制
})

// 检查存储空间
const checkStorageSpace = () => {
  try {
    const currentGameData = localStorage.getItem('game-data')
    if (currentGameData) {
      const dataSize = new Blob([currentGameData]).size
      storageInfo.value.used = dataSize
      
      // 如果使用超过80%，显示警告
      if (dataSize > storageInfo.value.total * 0.8) {
        ElMessage.warning('存储空间即将不足，建议删除一些图片')
      }
      
      // 如果使用超过90%，显示严重警告
      if (dataSize > storageInfo.value.total * 0.9) {
        ElMessage.error('存储空间严重不足！请删除一些图片')
      }
    }
  } catch (error) {
    console.error('检查存储空间失败:', error)
  }
}

// 清理旧版本数据
const cleanupLegacyData = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将清理所有旧版本的图片数据（gameLevels等），确保游戏只使用最新的管理系统数据。\n\n这有助于解决删除图片后仍在游戏中出现的问题。\n\n确定要继续吗？',
      '清理旧数据',
      {
        confirmButtonText: '确定清理',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    let cleanupCount = 0
    const cleanupLog: string[] = []
    
    // 1. 清理旧版本的gameLevels数据
    if (localStorage.getItem('gameLevels')) {
      localStorage.removeItem('gameLevels')
      cleanupCount++
      cleanupLog.push('✅ 清理旧版本gameLevels数据')
    }
    
    // 2. 清理gameTotalLevels数据
    if (localStorage.getItem('gameTotalLevels')) {
      localStorage.removeItem('gameTotalLevels')
      cleanupCount++
      cleanupLog.push('✅ 清理gameTotalLevels数据')
    }
    
    // 3. 清理单个图片的编辑数据
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('image_')) {
        // 检查是否是当前有效图片的数据
        const imageId = key.replace('image_', '')
        const isValidImage = imageList.value.some(img => img.id === imageId)
        
        if (!isValidImage) {
          keysToRemove.push(key)
        }
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      cleanupCount++
      cleanupLog.push(`✅ 清理无效图片数据: ${key}`)
    })
    
    // 4. 清理sessionStorage中的相关数据
    const sessionKeysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith('image_')) {
        sessionKeysToRemove.push(key)
      }
    }
    
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key)
      cleanupCount++
      cleanupLog.push(`✅ 清理session数据: ${key}`)
    })
    
    // 5. 清理其他可能的旧数据
    const otherKeysToCheck = [
      'currentEditingImageIndex',
      'currentDebugImageIndex',
      'selectedImageIndex'
    ]
    
    otherKeysToCheck.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        cleanupCount++
        cleanupLog.push(`✅ 清理索引数据: ${key}`)
      }
    })
    
    // 输出清理结果
    console.log('🧹 数据清理完成:')
    cleanupLog.forEach(log => console.log(log))
    
    if (cleanupCount > 0) {
      ElMessage.success(`数据清理完成！清理了 ${cleanupCount} 项旧数据`)
      
      // 刷新页面状态
      refreshImageList()
    } else {
      ElMessage.info('没有发现需要清理的旧数据')
    }
    
  } catch (error) {
    // 用户取消操作
    console.log('用户取消清理操作')
  }
}

// 绘制相关
const isDrawing = ref(false)
const startPoint = ref({ x: 0, y: 0 })
const currentPoint = ref({ x: 0, y: 0 })
const imageContainer = ref<HTMLDivElement | null>(null)
const isMouseDown = ref(false)

// 不再需要坐标缩放比例，直接使用相对坐标

// 从localStorage加载图片数据
const loadImageDataFromStorage = (imageId: string) => {
  try {
    // 首先尝试从localStorage加载
    const storageKey = `image_${imageId}`
    const savedData = localStorage.getItem(storageKey)
    
    if (savedData) {
      const data = JSON.parse(savedData)
      console.log(`从localStorage加载图片数据 ${imageId}:`, data)
      return data
    }
    
    // 如果localStorage没有，尝试从sessionStorage加载
    const sessionData = sessionStorage.getItem(storageKey)
    if (sessionData) {
      const data = JSON.parse(sessionData)
      console.log(`从sessionStorage加载图片数据 ${imageId}:`, data)
      return data
    }
    
    return null
  } catch (error) {
    console.error(`加载图片数据失败 ${imageId}:`, error)
    return null
  }
}

// 获取点位样式（相对坐标转像素坐标）
const getPointStyle = (point: PuzzlePoint) => {
  if (!imageContainer.value) return {}
  
  const imageElement = imageContainer.value.querySelector('img') as HTMLImageElement
  if (!imageElement) return {}
  
  const pixelCoords = relativeToPixel(
    point.x, point.y, point.width || 100, point.height || 50,
    imageElement.clientWidth, imageElement.clientHeight
  )
  
  return {
    left: `${pixelCoords.x}px`,
    top: `${pixelCoords.y}px`,
    width: `${pixelCoords.width}px`,
    height: `${pixelCoords.height}px`
  }
}

// 响应式store状态引用 - 使用ref包装确保响应性
const storeLevels = ref(store.getters['game/currentLevels'] || [])

// 监听store变化，手动更新响应式引用
const updateStoreLevels = () => {
  // 强制重新获取store数据
  const newLevels = store.getters['game/currentLevels'] || []
  storeLevels.value = [...newLevels] // 使用展开运算符创建新数组，确保响应性
  console.log('🔄 updateStoreLevels: 更新store引用，新数据长度:', newLevels.length)
}

// 计算属性
const imageList = computed(() => {
  // 触发强制更新机制
  forceUpdate.value
  
  // 合并预置图片和store中的自定义图片
  const customLevels = storeLevels.value
  
  // 将预置图片转换为level格式，并检查是否有编辑后的数据
  const presetLevels = presetImages.map((img: any, index: number) => {
    // 生成与编辑页面相同的ID
    const imageName = img.name || img.url.split('/').pop()?.split('.')[0] || 'unknown'
    const uniqueId = `preset-${imageName}-${index}`
    
    // 尝试从localStorage加载编辑后的数据
    const savedData = loadImageDataFromStorage(uniqueId)
    
    return {
      image: img.url,
      points: savedData?.puzzlePoints || savedData?.warningPoints || img.warningPoints || [],
      name: img.name,
      isPreset: true,
      originalImage: img,
      id: uniqueId
    }
  })
  
  // 过滤掉无效的自定义图片（没有image字段或image为空的）
  const validCustomLevels = customLevels.filter((level: any) => 
    level && level.image && level.image.trim() !== ''
  )
  
  // 将自定义图片转换为level格式，并检查是否有编辑后的数据
  const customLevelsFormatted = validCustomLevels.map((level: any, index: number) => {
    // 使用level的固有属性生成稳定的ID，如果没有则使用图片名称
    const imageName = level.name || level.image?.split('/').pop()?.split('.')[0] || 'unknown'
    const uniqueId = level.id || `custom-${imageName}-${index}`
    
    // 尝试从localStorage加载编辑后的数据
    const savedData = loadImageDataFromStorage(uniqueId)
    
    return {
      ...level,
      points: savedData?.puzzlePoints || savedData?.warningPoints || level.points || [],
      isPreset: false,
      id: uniqueId
    }
  })
  
  console.log('预置图片数量:', presetLevels.length)
  console.log('有效自定义图片数量:', validCustomLevels.length)
  console.log('总图片数量:', presetLevels.length + validCustomLevels.length)
  
  return [...presetLevels, ...customLevelsFormatted]
})

// 图片上传前验证
const beforeImageUpload = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择有效的图片文件')
    return false
  }
  
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片文件大小不能超过5MB')
    return false
  }
  
  return true
}

// 处理图片上传
const handleImageUpload = (file: any) => {
  if (!file.raw) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img
      
      const recommendedWidth = 1920
      const recommendedHeight = 945
      const tolerance = 0.2
      
      const widthRatio = Math.abs(naturalWidth - recommendedWidth) / recommendedWidth
      const heightRatio = Math.abs(naturalHeight - recommendedHeight) / recommendedHeight
      
      if (widthRatio > tolerance || heightRatio > tolerance) {
        ElMessage.warning(
          `当前图片尺寸为 ${naturalWidth}x${naturalHeight}，建议尺寸为 ${recommendedWidth}x${recommendedHeight}`
        )
      }
      
      // 生成唯一ID，避免重复
      const timestamp = Date.now()
      const uniqueId = `custom-${timestamp}-${Math.random().toString(36).substr(2, 9)}`
      
      const newLevel: GameLevel = {
        id: uniqueId,
        name: `图片${timestamp}`,
        url: e.target?.result as string,
        image: e.target?.result as string,
        size: file.raw.size,
        width: naturalWidth,
        height: naturalHeight,
        points: [],
        warningPoints: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      store.dispatch('game/addLevel', newLevel).then(() => {
        // 手动更新响应式引用
        updateStoreLevels()
        // 强制刷新列表
        forceUpdate.value++
      })
      ElMessage.success(`图片上传成功！尺寸: ${naturalWidth}x${naturalHeight}`)
    }
    
    img.onerror = () => {
      ElMessage.error('图片加载失败，请检查文件是否损坏')
    }
    
    img.src = e.target?.result as string
  }
  
  reader.onerror = () => {
    ElMessage.error('文件读取失败，请重试')
  }
  
  reader.readAsDataURL(file.raw)
}

// 选择图片
const selectImage = (index: number) => {
  selectedImageIndex.value = index
}

// 编辑图片
const editImage = (index: number) => {
  const imageData = imageList.value[index]
  editingImage.value = { ...imageData }
  selectedImageIndex.value = index
  showImageEditor.value = true
  
  nextTick(() => {
    onImageLoad()
  })
}

// 全屏编辑图片
const editImageFullscreen = (index: number) => {
  const imageData = imageList.value[index]
  
  // 检查图片数据是否存在
  if (!imageData || !imageData.image) {
    ElMessage.error('图片数据无效')
    return
  }
  
  // 生成唯一ID：使用与计算属性相同的逻辑
  let uniqueId: string
  if (imageData.isPreset) {
    // 预置图片：使用图片名称作为唯一标识
    const imageName = imageData.name || imageData.image.split('/').pop()?.split('.')[0] || 'unknown'
    uniqueId = `preset-${imageName}-${index}`
  } else {
    // 自定义图片：使用图片名称生成稳定的ID
    const imageName = imageData.name || imageData.image?.split('/').pop()?.split('.')[0] || 'unknown'
    uniqueId = imageData.id || `custom-${imageName}-${index - presetImages.length}`
  }
  
  // 将图片数据保存到localStorage，供全屏编辑页面使用
  // 确保图片URL正确处理
  let imageUrl = imageData.image
  
  const gameLevel: GameLevel = {
    id: uniqueId,
    name: imageData.name || `图片${index + 1}`,
    url: imageUrl,
    image: imageUrl, // 添加image字段确保兼容性
    size: 0,
    width: 1920,
    height: 945,
    warningPoints: imageData.points || [],
    points: imageData.points || [], // 添加points字段确保兼容性
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // 确保数据正确保存
  try {
    // 检查数据大小，如果太大则不保存图片数据到localStorage
    const dataString = JSON.stringify(gameLevel);
    const dataSizeKB = new Blob([dataString]).size / 1024;
    
    console.log(`图片数据大小: ${dataSizeKB.toFixed(2)} KB`);
    
    if (dataSizeKB > 5000) { // 如果超过5MB
      console.warn('图片数据过大，采用临时存储策略');
      // 对于大图片，只保存元数据，图片URL保持原样
      const lightGameLevel = {
        ...gameLevel,
        // 保持原始imageUrl，不做base64转换
      };
      
      // 使用sessionStorage存储大数据（容量更大）
      sessionStorage.setItem(`image_${gameLevel.id}`, JSON.stringify(lightGameLevel));
      localStorage.setItem('currentEditingImageIndex', index.toString());
      ElMessage.warning('图片较大，将使用临时存储模式');
    } else {
      localStorage.setItem(`image_${gameLevel.id}`, dataString);
      localStorage.setItem('currentEditingImageIndex', index.toString());
    }
    
    console.log('保存的图片数据:', gameLevel)
    console.log('当前编辑图片索引:', index)
    
    // 跳转到全屏编辑页面
    router.push(`/admin/images/editor/${gameLevel.id}`)
  } catch (error) {
    console.error('保存图片数据失败:', error)
    
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      ElMessage.error('图片太大，无法保存。请选择较小的图片或清理浏览器存储空间。')
    } else {
      ElMessage.error('保存图片数据失败')
    }
  }
}

// 删除图片
const deleteImage = async (index: number) => {
  // 检查是否为预置图片
  if (imageList.value[index]?.isPreset) {
    ElMessage.warning('预置图片不能删除')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要删除此图片吗？此操作不可逆。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 计算在store中的实际索引（减去预置图片的数量）
    const presetCount = presetImages.length
    const storeIndex = index - presetCount
    
    console.log('删除索引计算:', { 
      index, 
      presetCount, 
      storeIndex, 
      storeLevelsLength: storeLevels.value.length,
      totalImages: imageList.value.length
    })
    
    if (storeIndex >= 0 && storeIndex < storeLevels.value.length) {
      console.log('=== 删除图片调试信息 ===')
      console.log('删除前状态:')
      console.log('- 图片列表索引:', index)
      console.log('- Store索引:', storeIndex)
      console.log('- 删除前总数:', imageList.value.length)
      console.log('- Store中关卡数:', storeLevels.value.length)
      console.log('- localStorage game-data:', localStorage.getItem('game-data'))
      
      // 获取要删除的图片信息
      const imageToDelete = imageList.value[index]
      const imageId = imageToDelete?.id
      
      // 删除store中的关卡
      await store.dispatch('game/deleteLevel', storeIndex)
      
      // 手动更新响应式引用
      updateStoreLevels()
      
      // 完整清理所有相关存储数据
      try {
        // 1. 清理单个图片的编辑数据
        if (imageId) {
          localStorage.removeItem(`image_${imageId}`)
          sessionStorage.removeItem(`image_${imageId}`)
          console.log('🗑️ 已清理图片编辑数据:', `image_${imageId}`)
        }
        
        // 2. 清理旧版本的gameLevels数据（如果存在）
        const oldGameLevels = localStorage.getItem('gameLevels')
        if (oldGameLevels) {
          try {
            const parsedLevels = JSON.parse(oldGameLevels)
            if (Array.isArray(parsedLevels)) {
              // 从旧数据中移除对应的图片
              const filteredLevels = parsedLevels.filter((level: any, levelIndex: number) => {
                // 根据索引或图片URL来匹配要删除的图片
                const levelImageIndex = levelIndex + presetImages.length  // 加上预置图片数量
                return levelImageIndex !== index
              })
              
              if (filteredLevels.length !== parsedLevels.length) {
                localStorage.setItem('gameLevels', JSON.stringify(filteredLevels))
                console.log('🗑️ 已更新旧版本gameLevels数据')
              }
            }
          } catch (e) {
            console.warn('清理旧版本gameLevels数据时出错:', e)
            // 如果解析失败，直接清除
            localStorage.removeItem('gameLevels')
            console.log('🗑️ 已清除损坏的gameLevels数据')
          }
        }
        
        // 3. 清理其他可能的相关数据
        const keysToCheck = [
          'currentEditingImageIndex',
          'currentDebugImageIndex'
        ]
        
        keysToCheck.forEach(key => {
          const value = localStorage.getItem(key)
          if (value !== null) {
            const savedIndex = parseInt(value)
            if (savedIndex === index) {
              localStorage.removeItem(key)
              console.log('🗑️ 已清理相关索引数据:', key)
            } else if (savedIndex > index) {
              // 如果保存的索引大于删除的索引，需要减1
              localStorage.setItem(key, (savedIndex - 1).toString())
              console.log('🔄 已更新索引数据:', key, savedIndex - 1)
            }
          }
        })
        
      } catch (cleanupError) {
        console.error('清理存储数据时出错:', cleanupError)
      }
      
      console.log('删除后状态:')
      console.log('- Store中关卡数:', storeLevels.value.length)
      console.log('- localStorage game-data:', localStorage.getItem('game-data'))
      
      // 清除相关状态
      if (selectedImageIndex.value === index) {
        selectedImageIndex.value = null
        editingImage.value = null
        editingPointIndex.value = null
        editingPoint.value = null
      } else if (selectedImageIndex.value !== null && selectedImageIndex.value > index) {
        selectedImageIndex.value--
      }
      
      // 关闭编辑对话框
      showImageEditor.value = false
      showPointEditor.value = false
      
      // 等待界面更新，确保响应式数据正确更新
      await nextTick()
      
      // 强制触发界面更新
      forceUpdate.value++
      
      console.log('界面更新后状态:')
      console.log('- 计算属性总数:', imageList.value.length)
      console.log('- 强制更新值:', forceUpdate.value)
      console.log('=== 删除图片调试信息结束 ===')
      
      ElMessage.success('图片已完全删除（包括所有相关数据）')
    }
  } catch {
    // 用户取消删除
  }
}

// 图片加载完成
const onImageLoad = () => {
  // 图片加载完成后触发响应式更新
  nextTick(() => {
    if (editingImage.value) {
      editingImage.value = { ...editingImage.value }
    }
  })
}

// 开始绘制
const startDrawing = () => {
  isDrawing.value = true
  editingPointIndex.value = null
  editingPoint.value = null
  isMouseDown.value = false
  startPoint.value = { x: 0, y: 0 }
  currentPoint.value = { x: 0, y: 0 }
}

// 取消绘制
const cancelDrawing = () => {
  isDrawing.value = false
  isMouseDown.value = false
  startPoint.value = { x: 0, y: 0 }
  currentPoint.value = { x: 0, y: 0 }
}

// 处理鼠标按下
const handleMouseDown = (event: MouseEvent) => {
  if (!isDrawing.value || !imageContainer.value) return
  
  isMouseDown.value = true
  const rect = imageContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  startPoint.value = { x, y }
  currentPoint.value = { x, y }
}

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  if (!isDrawing.value || !isMouseDown.value || !imageContainer.value) return
  
  const rect = imageContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  currentPoint.value = { x, y }
}

// 处理鼠标松开
const handleMouseUp = () => {
  if (!isDrawing.value || !isMouseDown.value) return
  
  isMouseDown.value = false
  
  const width = Math.abs(currentPoint.value.x - startPoint.value.x)
  const height = Math.abs(currentPoint.value.y - startPoint.value.y)
  
  if (width > 10 && height > 10) {
    finishDrawing()
  }
}

// 处理图片点击
const handleImageClick = (event: MouseEvent) => {
  if (!isDrawing.value || !imageContainer.value) return
  
  const rect = imageContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  if (!startPoint.value.x && !startPoint.value.y) {
    startPoint.value = { x, y }
    currentPoint.value = { x, y }
  } else {
    currentPoint.value = { x, y }
    finishDrawing()
  }
}

// 完成绘制
const finishDrawing = () => {
  if (!isDrawing.value || !editingImage.value || !imageContainer.value) return
  
  const imageElement = imageContainer.value.querySelector('img') as HTMLImageElement
  if (!imageElement) return
  
  const pixelX = Math.min(startPoint.value.x, currentPoint.value.x)
  const pixelY = Math.min(startPoint.value.y, currentPoint.value.y)
  const pixelWidth = Math.abs(currentPoint.value.x - startPoint.value.x)
  const pixelHeight = Math.abs(currentPoint.value.y - startPoint.value.y)
  
  if (pixelWidth < 10 || pixelHeight < 10) {
    cancelDrawing()
    return
  }
  
  // 使用新的工具函数创建点位（自动转换为相对坐标）
  const relativeCoords = pixelToRelative(
    pixelX, pixelY, pixelWidth, pixelHeight,
    imageElement.clientWidth, imageElement.clientHeight
  )
  
  const newPoint = createPoint(
    relativeCoords.x, 
    relativeCoords.y, 
    relativeCoords.width, 
    relativeCoords.height
  )
  
  // 使用纯函数添加点位
  const levels = store.getters['game/currentLevels']
  const currentLevelIndex = levels.findIndex((level: GameLevel) => level === editingImage.value)
  if (currentLevelIndex !== -1) {
    const newLevels = addPoint(currentLevelIndex, newPoint, levels)
    if (newLevels && newLevels[currentLevelIndex]) {
    store.dispatch('game/updateLevel', {
      index: currentLevelIndex,
      level: newLevels[currentLevelIndex]
    })
    editingImage.value = newLevels[currentLevelIndex]
    }
  }
  
  // 编辑新创建的警示点
  if (editingImage.value?.points) {
    editPoint(editingImage.value.points.length - 1)
  }
  
  cancelDrawing()
}

// 编辑警示点
const editPoint = (pointIndex: number) => {
  if (!editingImage.value) return
  
  editingPointIndex.value = pointIndex
  if (editingImage.value?.points) {
    editingPoint.value = { ...editingImage.value.points[pointIndex] }
  }
  // 必查7：确保数据完整
  console.log('Edit point data:', editingPoint.value)
  if (editingPoint.value) {
    console.log('Connection type:', editingPoint.value.connectionType)
  }
  showPointEditor.value = true
}

// 保存警示点
const savePoint = () => {
  if (editingPointIndex.value === null || !editingPoint.value || !editingImage.value || !editingImage.value.points) return
  
  editingImage.value.points[editingPointIndex.value] = { ...editingPoint.value }
  
  // 检查是否为预置图片
  const currentImage = imageList.value[selectedImageIndex.value!]
  if (currentImage?.isPreset) {
    // 对于预置图片，我们需要更新原始数据
    const presetIndex = selectedImageIndex.value! - 0 // 预置图片在列表开头
    if (presetIndex >= 0 && presetIndex < presetImages.length) {
      // 转换PuzzlePoint到WarningPoint格式
      const warningPoints = (editingImage.value.points || []).map((point, index) => ({
        id: `wp-${presetIndex + 1}-${index + 1}`,
        x: point.x,
        y: point.y,
        width: point.width,
        height: point.height,
        title: point.highlightTitle,
        description: point.highlightDetail,
        connectionType: point.connectionType,
        connectionOffset: { x: 100, y: 0 }
      }))
      
      // 更新预置图片的警示点
      presetImages[presetIndex].warningPoints = warningPoints
      // 可以保存到localStorage作为用户自定义的修改
      localStorage.setItem('presetImagesModifications', JSON.stringify(presetImages))
    }
  } else {
    // 对于自定义图片，更新store
    const storeIndex = selectedImageIndex.value! - presetImages.length
    if (storeIndex >= 0) {
      store.dispatch('game/updateLevel', {
        index: storeIndex,
        level: editingImage.value
      })
    }
  }
  
  editingPointIndex.value = null
  editingPoint.value = null
  showPointEditor.value = false
  
  ElMessage.success('警示点已保存')
}

// 删除警示点
const deletePoint = async (pointIndex?: number) => {
  if (pointIndex !== undefined) {
    // 直接删除指定索引的警示点
    if (editingImage.value && editingImage.value.points && editingImage.value.points[pointIndex]) {
      editingImage.value.points.splice(pointIndex, 1)
      
      // 检查是否为预置图片
      const currentImage = imageList.value[selectedImageIndex.value!]
      if (currentImage?.isPreset) {
        // 对于预置图片，更新原始数据
        const presetIndex = selectedImageIndex.value! - 0
        if (presetIndex >= 0 && presetIndex < presetImages.length) {
          // 转换并更新预置图片的警示点
          const warningPoints = (editingImage.value.points || []).map((point, index) => ({
            id: `wp-${presetIndex + 1}-${index + 1}`,
            x: point.x,
            y: point.y,
            width: point.width,
            height: point.height,
            title: point.highlightTitle,
            description: point.highlightDetail,
            connectionType: point.connectionType,
            connectionOffset: { x: 100, y: 0 }
          }))
          presetImages[presetIndex].warningPoints = warningPoints
          localStorage.setItem('presetImagesModifications', JSON.stringify(presetImages))
        }
      } else {
        // 对于自定义图片，更新store
        const storeIndex = selectedImageIndex.value! - presetImages.length
        if (storeIndex >= 0) {
          store.dispatch('game/updateLevel', {
            index: storeIndex,
            level: editingImage.value
          })
        }
      }
      
      ElMessage.success('警示点已删除')
    }
    return
  }
  
  // 删除当前编辑的警示点
  if (editingPointIndex.value === null || !editingImage.value) return
  
  try {
    await ElMessageBox.confirm('确定要删除这个警示点吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    if (editingImage.value.points) {
      editingImage.value.points.splice(editingPointIndex.value, 1)
    }
    
    // 检查是否为预置图片
    const currentImage = imageList.value[selectedImageIndex.value!]
    if (currentImage?.isPreset) {
      // 对于预置图片，更新原始数据
      const presetIndex = selectedImageIndex.value! - 0
      if (presetIndex >= 0 && presetIndex < presetImages.length) {
        // 转换并更新预置图片的警示点
        const warningPoints = (editingImage.value.points || []).map((point, index) => ({
          id: `wp-${presetIndex + 1}-${index + 1}`,
          x: point.x,
          y: point.y,
          width: point.width,
          height: point.height,
          title: point.highlightTitle,
          description: point.highlightDetail,
          connectionType: point.connectionType,
          connectionOffset: { x: 100, y: 0 }
        }))
        presetImages[presetIndex].warningPoints = warningPoints
        localStorage.setItem('presetImagesModifications', JSON.stringify(presetImages))
      }
    } else {
      // 对于自定义图片，更新store
      const storeIndex = selectedImageIndex.value! - presetImages.length
      if (storeIndex >= 0) {
        store.dispatch('game/updateLevel', {
          index: storeIndex,
          level: editingImage.value
        })
      }
    }
    
    editingPointIndex.value = null
    editingPoint.value = null
    showPointEditor.value = false
    
    ElMessage.success('警示点已删除')
  } catch {
    // 用户取消删除
  }
}

// 刷新图片列表
const refreshImageList = () => {
  forceUpdate.value++
  console.log('🔄 强制刷新图片列表')
}

// 监听页面焦点，在用户从编辑页面返回时刷新数据
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // 页面变为可见时刷新
    refreshImageList()
  }
}

onMounted(() => {
  // 初始化游戏数据
  store.dispatch('game/initGame')
  // 必查1：选项源是否真的有3个
  console.log('OPS', CONNECTION_TYPE_OPTIONS.map(o=>o.value))
  // 检查存储空间
  checkStorageSpace()
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.image-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-card,
.list-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.card-header > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e1c72;
}

.card-subtitle {
  font-size: 14px;
  color: #6c757d;
}

.upload-area {
  text-align: center;
}

.upload-content {
  padding: 40px 20px;
}

.upload-icon {
  font-size: 60px;
  color: #1e1c72;
  margin-bottom: 15px;
}

.upload-text {
  font-size: 16px;
  color: #495057;
  margin-bottom: 10px;
}

.upload-text em {
  font-style: normal;
  color: #1e1c72;
  font-weight: 600;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.image-item {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
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
  position: relative;
  height: 200px;
  overflow: hidden;
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
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
}

.image-info {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-title {
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.image-actions {
  display: flex;
  gap: 8px;
}

/* 图片编辑器样式 */
.image-editor-dialog .el-dialog__body {
  padding: 0;
}

.image-editor {
  height: 70vh;
}

.editor-layout {
  display: flex;
  height: 100%;
  gap: 24px;
}

.image-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-container {
  flex: 1;
  position: relative;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editable-image {
  max-width: 100%;
  max-height: 100%;
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

.connection-line.vertical-horizontal .line-segment.horizontal {
  top: -90px; /* 调整到标题框的大概中点位置 */
  right: -200px; /* 延长横线，确保能连接到标题框 */
  width: 200px; /* 增加横线长度 */
  transform: translateY(-50%); /* 确保横线垂直居中 */
}

.connection-line.vertical-horizontal .line-segment.vertical {
  top: -90px; /* 调整竖线终点到横线位置 */
  left: 50%;
  transform: translateX(-50%);
  height: 90px; /* 调整竖线高度以匹配新的终点 */
}

.drawing-rect {
  position: absolute;
  border: 4px dashed #1e1c72;
  background-color: rgba(30, 28, 114, 0.1);
  pointer-events: none;
  z-index: 8;
  border-radius: 4px;
}

.drawing-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.edit-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.panel-section h4 {
  margin: 0 0 12px 0;
  color: #1e1c72;
  font-size: 16px;
  font-weight: 600;
}

.instruction-box {
  background: white;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.instruction-box ol {
  margin: 0;
  padding-left: 16px;
  color: #495057;
  line-height: 1.6;
}

.instruction-box li {
  margin-bottom: 8px;
}

.points-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s ease;
}

.point-item:hover {
  border-color: #1e1c72;
  background-color: #f8f9ff;
}

.point-item.active {
  border-color: #1e1c72;
  background-color: #e8eaff;
}

.point-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1e1c72;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.point-title {
  flex: 1;
  font-size: 14px;
  color: #495057;
}

.point-actions {
  display: flex;
  gap: 4px;
}

/* 响应式 */
/* 必查3：调试下拉层样式 */
.debug-popper {
  z-index: 99999 !important;
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
}

/* 确保对话框不裁剪下拉层 */
.el-dialog__body {
  overflow: visible !important;
}

@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: 1fr;
  }
  
  .editor-layout {
    flex-direction: column;
  }
  
  .edit-panel {
    width: 100%;
  }
}
</style> 