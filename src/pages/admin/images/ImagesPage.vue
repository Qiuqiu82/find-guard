<template>
  <div class="images-page">
    <div class="page-header">
      <h1>图片管理</h1>
      <p>管理游戏中的图片资源，支持警示点绘制和编辑</p>
    </div>
    
    <div class="images-content">
      <!-- 统计信息 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ totalImages }}</div>
              <div class="stat-label">总图片数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ presetImagesCount }}</div>
              <div class="stat-label">预置图片</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ customImagesCount }}</div>
              <div class="stat-label">自定义图片</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ totalWarningPoints }}</div>
              <div class="stat-label">警示点总数</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 操作工具栏 -->
      <el-card class="actions-card">
        <template #header>
          <div class="card-header">
            <span>操作工具栏</span>
          </div>
        </template>
        
        <div class="actions-toolbar">
          <el-button type="primary" @click="showUploadDialog = true">
            <el-icon><Upload /></el-icon>
            上传图片
          </el-button>
          
          <el-button type="success" @click="showImportDialog = true">
            <el-icon><Download /></el-icon>
            导入数据
          </el-button>
          
          <el-button type="warning" @click="exportAllData">
            <el-icon><UploadFilled /></el-icon>
            导出所有数据
          </el-button>
          
          <el-button type="info" @click="refreshImages">
            <el-icon><Refresh /></el-icon>
            刷新列表
          </el-button>
          
          <el-button type="danger" @click="clearAllImages" :disabled="imagesList.length === 0">
            <el-icon><Delete /></el-icon>
            清空所有
          </el-button>
        </div>
      </el-card>
      
      <!-- 图片列表 -->
      <el-card class="images-list-card">
        <template #header>
          <div class="card-header">
            <span>图片列表</span>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索图片名称..."
                prefix-icon="Search"
                clearable
                style="width: 200px; margin-right: 16px;"
              />
              <el-select v-model="filterType" placeholder="筛选类型" style="width: 120px; margin-right: 16px;">
                <el-option label="全部" value="all" />
                <el-option label="预置图片" value="preset" />
                <el-option label="自定义图片" value="custom" />
              </el-select>
              <el-button type="primary" size="small" @click="refreshImages">
                刷新
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="images-grid">
          <div 
            v-for="image in filteredImages" 
            :key="image.id" 
            class="image-item"
          >
            <div class="image-preview">
              <img :src="image.url" :alt="image.name" />
              <div class="image-overlay">
                <div class="overlay-buttons">
                  <el-button 
                    type="primary" 
                    size="small"
                    @click="editImageFullscreen(image)"
                  >
                    <el-icon><FullScreen /></el-icon>
                    全屏编辑
                  </el-button>
                  
                  <el-button 
                    type="success" 
                    size="small"
                    @click="editImage(image)"
                  >
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  
                  <el-button 
                    type="danger" 
                    size="small"
                    @click="deleteImage(image.id)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
              
              <!-- 警示点数量标识 -->
              <div class="warning-points-badge" v-if="image.warningPoints.length > 0">
                {{ image.warningPoints.length }} 个警示点
              </div>
            </div>
            
            <div class="image-info">
              <div class="image-header">
                <p class="image-name">{{ image.name }}</p>
                <el-tag 
                  :type="image.id.startsWith('preset-') ? 'success' : 'primary'"
                  size="small"
                >
                  {{ image.id.startsWith('preset-') ? '预置' : '自定义' }}
                </el-tag>
              </div>
              
              <p class="image-size">{{ formatFileSize(image.size) }}</p>
              <p class="image-dimensions">{{ image.width }} × {{ image.height }}</p>
              
              <div class="image-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ image.warningPoints.length }} 警示点
                </span>
                <span class="stat-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatDate(image.updatedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="filteredImages.length === 0" class="empty-state">
          <el-empty description="暂无图片数据" />
        </div>
      </el-card>
    </div>
    
    <!-- 上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传图片"
      width="500px"
    >
      <el-upload
        class="image-uploader"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="fileList"
        accept="image/*"
        multiple
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 jpg、png、gif 格式，单个文件不超过 5MB
          </div>
        </template>
      </el-upload>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showUploadDialog = false">取消</el-button>
          <el-button type="primary" @click="uploadImages" :disabled="fileList.length === 0">
            开始上传
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 导入对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入图片数据"
      width="500px"
    >
      <el-upload
        class="import-uploader"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleImportFileChange"
        :file-list="importFileList"
        accept=".json"
      >
        <el-icon class="el-icon--upload"><document /></el-icon>
        <div class="el-upload__text">
          将 JSON 文件拖到此处，或<em>点击选择</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持导出的 JSON 格式文件
          </div>
        </template>
      </el-upload>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showImportDialog = false">取消</el-button>
          <el-button type="primary" @click="importImages" :disabled="importFileList.length === 0">
            开始导入
          </el-button>
        </div>
      </template>
    </el-dialog>
    

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Upload, 
  Download, 
  UploadFilled, 
  Refresh, 
  Delete, 
  FullScreen, 
  Edit, 
  View, 
  Clock, 
  Search,
  Document
} from '@element-plus/icons-vue'
import { presetImages } from '../../../data/presetImages'
import type { GameImage } from '../../../types/image'


// 路由
const router = useRouter()

// 页面标题
const pageTitle = '图片管理'

// 响应式数据
const imagesList = ref<GameImage[]>([])
const searchKeyword = ref('')
const filterType = ref('all')
const showUploadDialog = ref(false)
const showImportDialog = ref(false)

const fileList = ref<any[]>([])
const importFileList = ref<any[]>([])

// 计算属性
const totalImages = computed(() => imagesList.value.length)
const presetImagesCount = computed(() => imagesList.value.filter(img => img.id.startsWith('preset-')).length)
const customImagesCount = computed(() => imagesList.value.filter(img => !img.id.startsWith('preset-')).length)
const totalWarningPoints = computed(() => imagesList.value.reduce((total, img) => total + img.warningPoints.length, 0))

const filteredImages = computed(() => {
  let filtered = imagesList.value
  
  // 按类型筛选
  if (filterType.value === 'preset') {
    filtered = filtered.filter(img => img.id.startsWith('preset-'))
  } else if (filterType.value === 'custom') {
    filtered = filtered.filter(img => !img.id.startsWith('preset-'))
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(img => 
      img.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  return filtered
})

// 方法
const initializeImages = () => {
  // 加载预置图片
  imagesList.value = [...presetImages]
  
  // 从 localStorage 加载自定义图片
  try {
    const saved = localStorage.getItem('customImages')
    if (saved) {
      const customImages = JSON.parse(saved)
      imagesList.value.push(...customImages)
    }
  } catch (error) {
    console.warn('Failed to load custom images:', error)
  }
}

const handleFileChange = (file: any, fileList: any[]) => {
  console.log('选择的文件:', file)
}

const handleImportFileChange = (file: any, fileList: any[]) => {
  console.log('选择的导入文件:', file)
}

const uploadImages = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的图片')
    return
  }
  
  // 模拟上传过程
  fileList.value.forEach((file, index) => {
    const newImage: GameImage = {
      id: `custom-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file.raw),
      size: file.size,
      width: 1920, // 默认尺寸
      height: 1080,
      warningPoints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    imagesList.value.push(newImage)
  })
  
  // 保存到 localStorage
  saveCustomImages()
  
  ElMessage.success(`成功上传 ${fileList.value.length} 张图片`)
  fileList.value = []
  showUploadDialog.value = false
}

const importImages = () => {
  if (importFileList.value.length === 0) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }
  
  const file = importFileList.value[0]
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      
      if (data.images && Array.isArray(data.images)) {
        // 导入多张图片
        data.images.forEach((img: GameImage) => {
          if (!imagesList.value.find(existing => existing.id === img.id)) {
            imagesList.value.push(img)
          }
        })
        ElMessage.success(`成功导入 ${data.images.length} 张图片`)
      } else if (data.image) {
        // 导入单张图片
        const img = data.image
        if (!imagesList.value.find(existing => existing.id === img.id)) {
          imagesList.value.push(img)
          ElMessage.success('成功导入图片')
        } else {
          ElMessage.warning('图片已存在')
        }
      }
      
      saveCustomImages()
      showImportDialog.value = false
      importFileList.value = []
    } catch (error) {
      ElMessage.error('导入失败：文件格式错误')
    }
  }
  
  reader.readAsText(file.raw)
}

const exportAllData = () => {
  const data = {
    version: '1.0',
    images: imagesList.value,
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `images_export_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('数据导出成功')
}

const refreshImages = () => {
  initializeImages()
  ElMessage.info('图片列表已刷新')
}

const clearAllImages = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有图片吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 只保留预置图片
    imagesList.value = imagesList.value.filter(img => img.id.startsWith('preset-'))
    saveCustomImages()
    
    ElMessage.success('已清空所有自定义图片')
  } catch {
    // 用户取消操作
  }
}



const editImage = (image: GameImage) => {
  // 将图片数据保存到localStorage，供全屏编辑页面使用
  localStorage.setItem(`image_${image.id}`, JSON.stringify(image))
  // 跳转到全屏编辑页面
  router.push(`/admin/images/editor/${image.id}`)
}

const editImageFullscreen = (image: GameImage) => {
  // 将图片数据保存到localStorage，供全屏编辑页面使用
  localStorage.setItem(`image_${image.id}`, JSON.stringify(image))
  // 直接跳转到全屏编辑页面，不创建新标签页
  router.push(`/admin/images/editor/${image.id}?fullscreen=true`)
}

const deleteImage = async (id: string) => {
  // 不允许删除预置图片
  if (id.startsWith('preset-')) {
    ElMessage.warning('预置图片不能删除')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    imagesList.value = imagesList.value.filter(img => img.id !== id)
    saveCustomImages()
    
    ElMessage.success('图片删除成功')
  } catch {
    // 用户取消删除
  }
}

const saveCustomImages = () => {
  const customImages = imagesList.value.filter(img => !img.id.startsWith('preset-'))
  localStorage.setItem('customImages', JSON.stringify(customImages))
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  initializeImages()
})
</script>

<style scoped>
.images-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.images-content {
  max-width: 1400px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.actions-card,
.images-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
}

.actions-toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.image-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  background-color: #fff;
}

.image-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.image-preview {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.overlay-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning-points-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #ff4757;
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.image-info {
  padding: 16px;
}

.image-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.image-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  flex: 1;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-size,
.image-dimensions {
  margin: 4px 0;
  font-size: 12px;
  color: #909399;
}

.image-stats {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.dialog-footer {
  text-align: right;
}

.image-uploader,
.import-uploader {
  width: 100%;
}

/* 响应式 */
@media (max-width: 768px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .actions-toolbar {
    flex-direction: column;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style> 