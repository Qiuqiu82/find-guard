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

    <!-- 关卡创建配置 -->
    <el-card v-if="uploadedFile" class="config-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">关卡配置</span>
          <span class="card-subtitle">为上传的图片配置关卡信息</span>
        </div>
      </template>
      
      <el-form :model="levelForm" :rules="levelRules" ref="levelFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关卡名称" prop="name">
              <el-input v-model="levelForm.name" placeholder="请输入关卡名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关卡分类" prop="category_id">
              <el-select v-model="levelForm.category_id" placeholder="选择分类" style="width: 100%">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="难度等级" prop="difficulty">
              <el-select v-model="levelForm.difficulty" placeholder="选择难度" style="width: 100%">
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序序号" prop="sort_order">
              <el-input-number v-model="levelForm.sort_order" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button type="primary" @click="createLevel" :loading="createLevelLoading">
            创建关卡
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 关卡列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">关卡管理</span>
          <div class="header-actions">
            <span class="card-subtitle">共 {{ levelList.length }} 个关卡</span>
            <el-button :icon="Refresh" @click="loadLevels">刷新</el-button>
          </div>
        </div>
      </template>
      
      <!-- 筛选选项 -->
      <div class="filter-section">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-select v-model="filterCategory" placeholder="筛选分类" clearable @change="filterLevels">
              <el-option label="全部分类" value="" />
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filterDifficulty" placeholder="筛选难度" clearable @change="filterLevels">
              <el-option label="全部难度" value="" />
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filterPreset" placeholder="筛选类型" clearable @change="filterLevels">
              <el-option label="全部类型" value="" />
              <el-option label="预置关卡" value="1" />
              <el-option label="自定义关卡" value="0" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input v-model="searchKeyword" placeholder="搜索关卡名称" clearable @input="filterLevels">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
        </el-row>
      </div>
      
      <div v-if="filteredLevelList.length === 0" class="empty-state">
        <el-empty description="暂无关卡，请先上传图片创建关卡">
          <el-icon size="60" color="#909399"><Picture /></el-icon>
        </el-empty>
      </div>
      
      <div v-else class="level-grid" v-loading="levelListLoading">
        <div
          v-for="level in filteredLevelList"
          :key="level.id"
          class="level-item"
          :class="{ 'active': selectedLevel?.id === level.id }"
          @click="selectLevel(level)"
        >
          <div class="level-preview">
            <img :src="level.image_url" :alt="level.name" />
            <div class="level-overlay">
              <span class="point-count">{{ level.points?.length || 0 }}个警示点</span>
              <div class="level-badges">
                <el-tag v-if="level.is_preset" type="info" size="small">预置</el-tag>
                <el-tag :type="getDifficultyType(level.difficulty)" size="small">
                  {{ getDifficultyText(level.difficulty) }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="level-info">
            <div class="level-title">{{ level.name }}</div>
            <div class="level-meta">
              <span class="category-name">{{ level.category?.name || '未分类' }}</span>
              <span class="level-size">{{ formatFileSize(level.image_size) }}</span>
            </div>
            <div class="level-actions">
              <el-button
                type="primary"
                size="small"
                @click.stop="editLevelFullscreen(level)"
              >
                <el-icon><FullScreen /></el-icon>
                全屏编辑
              </el-button>
              <el-button
                type="success"
                size="small"
                @click.stop="editLevel(level)"
              >
                编辑警示点
              </el-button>
              <el-button
                v-if="!level.is_preset"
                type="danger"
                size="small"
                @click.stop="deleteLevel(level)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 警示点编辑对话框 -->
    <el-dialog
      v-model="showPointEditor"
      title="警示点编辑"
      width="80%"
      :close-on-click-modal="false"
      class="point-editor-dialog"
    >
      <div v-if="editingLevel" class="point-editor">
        <div class="editor-layout">
          <!-- 左侧图片显示 -->
          <div class="image-display">
            <div class="image-container" ref="imageContainer">
              <img 
                :src="editingLevel.image_url" 
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
                v-for="(point, pointIndex) in editingLevel.points" 
                :key="point.id"
                class="existing-point"
                :style="getPointStyle(point)"
                @click.stop="editPoint(pointIndex)"
              >
                <span class="point-number">{{ point.order_index }}</span>
                
                <!-- 连接线预览 -->
                <div class="connection-line" :class="point.connection_type">
                  <div class="line-segment horizontal"></div>
                  <div v-if="point.connection_type === 'vertical-horizontal'" class="line-segment vertical"></div>
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
            
            <div class="image-tools">
              <el-button
                :type="isDrawing ? 'primary' : 'default'"
                @click="toggleDrawingMode"
                :icon="isDrawing ? Check : Plus"
              >
                {{ isDrawing ? '完成绘制' : '添加警示点' }}
              </el-button>
              <el-button @click="resetImageZoom" :icon="Refresh">
                重置缩放
              </el-button>
            </div>
          </div>
          
          <!-- 右侧控制面板 -->
          <div class="control-panel">
            <div class="panel-section">
              <h4>警示点列表</h4>
              <div class="points-list">
                <div
                  v-for="(point, index) in editingLevel.points"
                  :key="point.id"
                  class="point-item"
                  :class="{ 'active': editingPointIndex === index }"
                  @click="selectPoint(index)"
                >
                  <div class="point-header">
                    <span class="point-index">{{ point.order_index }}</span>
                    <span class="point-title">{{ point.highlight_title }}</span>
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click.stop="deletePoint(index)"
                      :icon="Delete"
                    />
                  </div>
                  <div class="point-detail">
                    {{ point.highlight_detail }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 警示点编辑表单 -->
            <div v-if="editingPointIndex !== null" class="panel-section">
              <h4>编辑警示点</h4>
              <el-form :model="pointForm" label-width="80px" size="small">
                <el-form-item label="标题">
                  <el-input v-model="pointForm.highlight_title" />
                </el-form-item>
                <el-form-item label="详细说明">
                  <el-input
                    v-model="pointForm.highlight_detail"
                    type="textarea"
                    :rows="3"
                  />
                </el-form-item>
                <el-form-item label="连接线">
                  <el-select v-model="pointForm.connection_type" style="width: 100%">
                    <el-option label="水平" value="horizontal" />
                    <el-option label="垂直+水平" value="vertical-horizontal" />
                  </el-select>
                </el-form-item>
                <el-form-item label="显示顺序">
                  <el-input-number 
                    v-model="pointForm.order_index" 
                    :min="1" 
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="updatePoint" :loading="updatePointLoading">
                    更新
                  </el-button>
                  <el-button @click="cancelEditPoint">取消</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPointEditor = false">关闭</el-button>
          <el-button type="primary" @click="saveAllPoints" :loading="savePointsLoading">
            保存所有更改
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新警示点表单对话框 -->
    <el-dialog
      v-model="showNewPointDialog"
      title="添加警示点"
      width="500px"
    >
      <el-form :model="newPointForm" :rules="pointRules" ref="newPointFormRef" label-width="80px">
        <el-form-item label="标题" prop="highlight_title">
          <el-input v-model="newPointForm.highlight_title" />
        </el-form-item>
        <el-form-item label="详细说明" prop="highlight_detail">
          <el-input
            v-model="newPointForm.highlight_detail"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="连接线" prop="connection_type">
          <el-select v-model="newPointForm.connection_type" style="width: 100%">
            <el-option label="水平" value="horizontal" />
            <el-option label="垂直+水平" value="vertical-horizontal" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示顺序" prop="order_index">
          <el-input-number 
            v-model="newPointForm.order_index" 
            :min="1" 
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showNewPointDialog = false">取消</el-button>
          <el-button type="primary" @click="addNewPoint" :loading="addPointLoading">
            添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UploadFilled, 
  Picture, 
  FullScreen, 
  Refresh, 
  Search, 
  Plus, 
  Check, 
  Delete 
} from '@element-plus/icons-vue'
import { 
  levelAPI, 
  pointAPI, 
  categoryAPI, 
  fileAPI, 
  handleAPIError, 
  formatFileSize, 
  generatePointId, 
  generateLevelId 
} from '@/api/index.js'

// 基础数据
const categories = ref([])
const levelList = ref([])
const filteredLevelList = ref([])
const selectedLevel = ref(null)

// 上传相关
const uploadedFile = ref(null)
const createLevelLoading = ref(false)

// 关卡表单
const levelForm = reactive({
  name: '',
  category_id: null,
  difficulty: 'medium',
  sort_order: 1
})

const levelRules = {
  name: [{ required: true, message: '请输入关卡名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择关卡分类', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度等级', trigger: 'change' }]
}

const levelFormRef = ref(null)

// 筛选相关
const filterCategory = ref('')
const filterDifficulty = ref('')
const filterPreset = ref('')
const searchKeyword = ref('')
const levelListLoading = ref(false)

// 警示点编辑相关
const showPointEditor = ref(false)
const editingLevel = ref(null)
const editingPointIndex = ref(null)
const savePointsLoading = ref(false)
const updatePointLoading = ref(false)

// 绘制相关
const isDrawing = ref(false)
const isMouseDown = ref(false)
const startPoint = reactive({ x: 0, y: 0 })
const currentPoint = reactive({ x: 0, y: 0 })
const imageContainer = ref(null)
const imageRect = ref(null)

// 警示点表单
const pointForm = reactive({
  highlight_title: '',
  highlight_detail: '',
  connection_type: 'horizontal',
  order_index: 1
})

const newPointForm = reactive({
  highlight_title: '',
  highlight_detail: '',
  connection_type: 'horizontal',
  order_index: 1
})

const showNewPointDialog = ref(false)
const addPointLoading = ref(false)
const newPointFormRef = ref(null)

const pointRules = {
  highlight_title: [{ required: true, message: '请输入警示点标题', trigger: 'blur' }],
  highlight_detail: [{ required: true, message: '请输入详细说明', trigger: 'blur' }],
  connection_type: [{ required: true, message: '请选择连接线类型', trigger: 'change' }],
  order_index: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }]
}

// 页面初始化
onMounted(async () => {
  await loadCategories()
  await loadLevels()
})

/**
 * 加载分类列表
 */
async function loadCategories() {
  try {
    const response = await categoryAPI.getAll()
    categories.value = response.data
  } catch (error) {
    handleAPIError(error, '获取分类列表失败')
  }
}

/**
 * 加载关卡列表
 */
async function loadLevels() {
  try {
    levelListLoading.value = true
    const response = await levelAPI.getList({ size: 100 })
    levelList.value = response.data.items || []
    filterLevels()
  } catch (error) {
    handleAPIError(error, '获取关卡列表失败')
  } finally {
    levelListLoading.value = false
  }
}

/**
 * 筛选关卡
 */
function filterLevels() {
  let filtered = [...levelList.value]
  
  if (filterCategory.value) {
    filtered = filtered.filter(level => level.category_id == filterCategory.value)
  }
  
  if (filterDifficulty.value) {
    filtered = filtered.filter(level => level.difficulty === filterDifficulty.value)
  }
  
  if (filterPreset.value !== '') {
    filtered = filtered.filter(level => level.is_preset == filterPreset.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(level => 
      level.name.toLowerCase().includes(keyword)
    )
  }
  
  filteredLevelList.value = filtered
}

/**
 * 处理图片上传
 */
async function handleImageUpload(file) {
  if (!file.raw) return
  
  try {
    const response = await fileAPI.upload(file.raw)
    uploadedFile.value = response.data
    
    // 重置表单
    levelForm.name = `新关卡_${Date.now()}`
    levelForm.sort_order = levelList.value.length + 1
    
    ElMessage.success('图片上传成功，请配置关卡信息')
  } catch (error) {
    handleAPIError(error, '图片上传失败')
  }
}

/**
 * 上传前验证
 */
function beforeImageUpload(file) {
  const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
  const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
  
  if (!isValidType) {
    ElMessage.error('只支持 JPG/PNG/WebP 格式的图片')
    return false
  }
  
  if (!isValidSize) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  
  return true
}

/**
 * 创建关卡
 */
async function createLevel() {
  if (!levelFormRef.value) return
  
  try {
    await levelFormRef.value.validate()
    
    createLevelLoading.value = true
    
    const levelData = {
      level_id: generateLevelId(),
      name: levelForm.name,
      category_id: levelForm.category_id,
      image_url: uploadedFile.value.url,
      image_size: uploadedFile.value.size,
      image_width: uploadedFile.value.width || 1920,
      image_height: uploadedFile.value.height || 945,
      difficulty: levelForm.difficulty,
      sort_order: levelForm.sort_order
    }
    
    const response = await levelAPI.create(levelData)
    
    ElMessage.success('关卡创建成功')
    
    // 重置表单和上传文件
    resetForm()
    uploadedFile.value = null
    
    // 刷新关卡列表
    await loadLevels()
    
  } catch (error) {
    if (error.errors) {
      // 表单验证错误
      return
    }
    handleAPIError(error, '创建关卡失败')
  } finally {
    createLevelLoading.value = false
  }
}

/**
 * 重置表单
 */
function resetForm() {
  if (levelFormRef.value) {
    levelFormRef.value.resetFields()
  }
  Object.assign(levelForm, {
    name: '',
    category_id: null,
    difficulty: 'medium',
    sort_order: 1
  })
}

/**
 * 选择关卡
 */
function selectLevel(level) {
  selectedLevel.value = level
}

/**
 * 编辑关卡（警示点编辑）
 */
async function editLevel(level) {
  try {
    // 获取关卡详情（包含警示点）
    const response = await levelAPI.getDetail(level.id)
    editingLevel.value = response.data
    showPointEditor.value = true
    
    await nextTick()
    if (imageContainer.value) {
      const img = imageContainer.value.querySelector('img')
      if (img.complete) {
        onImageLoad()
      }
    }
  } catch (error) {
    handleAPIError(error, '获取关卡详情失败')
  }
}

/**
 * 全屏编辑关卡
 */
function editLevelFullscreen(level) {
  // 这里可以跳转到专门的全屏编辑页面
  // 或者打开一个全屏对话框
  editLevel(level)
}

/**
 * 删除关卡
 */
async function deleteLevel(level) {
  try {
    await ElMessageBox.confirm(
      `确定要删除关卡 "${level.name}" 吗？此操作将同时删除所有相关警示点！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await levelAPI.delete(level.id)
    
    ElMessage.success('关卡删除成功')
    
    // 刷新列表
    await loadLevels()
    
    // 如果删除的是当前选中的关卡，清空选中状态
    if (selectedLevel.value?.id === level.id) {
      selectedLevel.value = null
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      handleAPIError(error, '删除关卡失败')
    }
  }
}

/**
 * 图片加载完成
 */
function onImageLoad() {
  if (imageContainer.value) {
    const img = imageContainer.value.querySelector('img')
    const containerRect = imageContainer.value.getBoundingClientRect()
    imageRect.value = {
      width: img.offsetWidth,
      height: img.offsetHeight,
      left: img.offsetLeft,
      top: img.offsetTop
    }
  }
}

/**
 * 切换绘制模式
 */
function toggleDrawingMode() {
  isDrawing.value = !isDrawing.value
  if (!isDrawing.value) {
    isMouseDown.value = false
  }
}

/**
 * 鼠标按下事件
 */
function handleMouseDown(event) {
  if (!isDrawing.value) return
  
  isMouseDown.value = true
  const rect = event.target.getBoundingClientRect()
  startPoint.x = event.clientX - rect.left
  startPoint.y = event.clientY - rect.top
  currentPoint.x = startPoint.x
  currentPoint.y = startPoint.y
}

/**
 * 鼠标移动事件
 */
function handleMouseMove(event) {
  if (!isDrawing.value || !isMouseDown.value) return
  
  const rect = event.target.getBoundingClientRect()
  currentPoint.x = event.clientX - rect.left
  currentPoint.y = event.clientY - rect.top
}

/**
 * 鼠标释放事件
 */
function handleMouseUp(event) {
  if (!isDrawing.value || !isMouseDown.value) return
  
  isMouseDown.value = false
  
  const rect = event.target.getBoundingClientRect()
  const endX = event.clientX - rect.left
  const endY = event.clientY - rect.top
  
  // 计算选框大小，如果太小则忽略
  const width = Math.abs(endX - startPoint.x)
  const height = Math.abs(endY - startPoint.y)
  
  if (width < 10 || height < 10) {
    ElMessage.warning('警示框太小，请重新绘制')
    return
  }
  
  // 转换为相对坐标
  const imgWidth = imageRect.value.width
  const imgHeight = imageRect.value.height
  
  const relativeX = Math.min(startPoint.x, endX) / imgWidth
  const relativeY = Math.min(startPoint.y, endY) / imgHeight
  const relativeWidth = width / imgWidth
  const relativeHeight = height / imgHeight
  
  // 设置新警示点表单的坐标
  newPointForm.x = relativeX
  newPointForm.y = relativeY
  newPointForm.width = relativeWidth
  newPointForm.height = relativeHeight
  newPointForm.order_index = (editingLevel.value?.points?.length || 0) + 1
  
  // 显示新警示点表单
  showNewPointDialog.value = true
  
  // 退出绘制模式
  isDrawing.value = false
}

/**
 * 图片点击事件
 */
function handleImageClick(event) {
  // 处理图片点击逻辑
}

/**
 * 获取警示点样式
 */
function getPointStyle(point) {
  if (!imageRect.value) return {}
  
  const x = parseFloat(point.x) * imageRect.value.width
  const y = parseFloat(point.y) * imageRect.value.height
  const width = parseFloat(point.width) * imageRect.value.width
  const height = parseFloat(point.height) * imageRect.value.height
  
  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`
  }
}

/**
 * 选择警示点进行编辑
 */
function selectPoint(index) {
  editingPointIndex.value = index
  const point = editingLevel.value.points[index]
  Object.assign(pointForm, {
    highlight_title: point.highlight_title,
    highlight_detail: point.highlight_detail,
    connection_type: point.connection_type,
    order_index: point.order_index
  })
}

/**
 * 编辑警示点
 */
function editPoint(index) {
  selectPoint(index)
}

/**
 * 更新警示点
 */
async function updatePoint() {
  if (editingPointIndex.value === null) return
  
  try {
    updatePointLoading.value = true
    
    const point = editingLevel.value.points[editingPointIndex.value]
    const updateData = {
      highlight_title: pointForm.highlight_title,
      highlight_detail: pointForm.highlight_detail,
      connection_type: pointForm.connection_type,
      order_index: pointForm.order_index
    }
    
    await pointAPI.update(point.id, updateData)
    
    // 更新本地数据
    Object.assign(point, updateData)
    
    ElMessage.success('警示点更新成功')
    
    // 取消编辑状态
    cancelEditPoint()
    
  } catch (error) {
    handleAPIError(error, '更新警示点失败')
  } finally {
    updatePointLoading.value = false
  }
}

/**
 * 取消编辑警示点
 */
function cancelEditPoint() {
  editingPointIndex.value = null
  Object.assign(pointForm, {
    highlight_title: '',
    highlight_detail: '',
    connection_type: 'horizontal',
    order_index: 1
  })
}

/**
 * 删除警示点
 */
async function deletePoint(index) {
  try {
    const point = editingLevel.value.points[index]
    
    await ElMessageBox.confirm(
      `确定要删除警示点 "${point.highlight_title}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await pointAPI.delete(point.id)
    
    // 从本地数据中移除
    editingLevel.value.points.splice(index, 1)
    
    // 如果删除的是正在编辑的警示点，取消编辑状态
    if (editingPointIndex.value === index) {
      cancelEditPoint()
    } else if (editingPointIndex.value > index) {
      editingPointIndex.value--
    }
    
    ElMessage.success('警示点删除成功')
    
  } catch (error) {
    if (error !== 'cancel') {
      handleAPIError(error, '删除警示点失败')
    }
  }
}

/**
 * 添加新警示点
 */
async function addNewPoint() {
  if (!newPointFormRef.value) return
  
  try {
    await newPointFormRef.value.validate()
    
    addPointLoading.value = true
    
    const pointData = {
      point_id: generatePointId(),
      x: newPointForm.x,
      y: newPointForm.y,
      width: newPointForm.width,
      height: newPointForm.height,
      highlight_title: newPointForm.highlight_title,
      highlight_detail: newPointForm.highlight_detail,
      connection_type: newPointForm.connection_type,
      order_index: newPointForm.order_index
    }
    
    const response = await pointAPI.create(editingLevel.value.id, pointData)
    
    // 添加到本地数据
    editingLevel.value.points.push(response.data.points[0])
    
    ElMessage.success('警示点添加成功')
    
    // 重置表单
    showNewPointDialog.value = false
    Object.assign(newPointForm, {
      highlight_title: '',
      highlight_detail: '',
      connection_type: 'horizontal',
      order_index: 1
    })
    
  } catch (error) {
    if (error.errors) {
      // 表单验证错误
      return
    }
    handleAPIError(error, '添加警示点失败')
  } finally {
    addPointLoading.value = false
  }
}

/**
 * 保存所有警示点更改
 */
async function saveAllPoints() {
  try {
    savePointsLoading.value = true
    
    // 这里可以执行批量保存操作
    // 由于我们是实时更新的，这里主要是关闭对话框
    
    ElMessage.success('所有更改已保存')
    showPointEditor.value = false
    
    // 刷新关卡列表
    await loadLevels()
    
  } catch (error) {
    handleAPIError(error, '保存失败')
  } finally {
    savePointsLoading.value = false
  }
}

/**
 * 重置图片缩放
 */
function resetImageZoom() {
  // 实现图片缩放重置逻辑
  onImageLoad()
}

/**
 * 获取难度类型（用于标签颜色）
 */
function getDifficultyType(difficulty) {
  const types = {
    'easy': 'success',
    'medium': 'warning', 
    'hard': 'danger'
  }
  return types[difficulty] || 'info'
}

/**
 * 获取难度文本
 */
function getDifficultyText(difficulty) {
  const texts = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return texts[difficulty] || '未知'
}
</script>

<style scoped>
.image-management {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-subtitle {
  font-size: 14px;
  color: #909399;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload-card {
  margin-bottom: 24px;
}

.upload-area {
  width: 100%;
}

.upload-content {
  text-align: center;
  padding: 40px 20px;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  color: #606266;
  font-size: 16px;
  margin-bottom: 8px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
}

.config-card {
  margin-bottom: 24px;
}

.list-card {
  margin-bottom: 24px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.level-item {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.level-item:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
}

.level-item.active {
  border-color: #409eff;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.level-preview {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.level-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.level-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  color: white;
}

.point-count {
  align-self: flex-start;
  background: rgba(0,0,0,0.6);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.level-badges {
  display: flex;
  gap: 8px;
  align-self: flex-end;
}

.level-info {
  padding: 16px;
}

.level-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.level-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #909399;
}

.category-name {
  font-weight: 500;
}

.level-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.level-actions .el-button {
  flex: 1;
  min-width: 0;
}

/* 警示点编辑器样式 */
.point-editor-dialog {
  --el-dialog-padding-primary: 20px;
}

.point-editor {
  height: 70vh;
}

.editor-layout {
  display: flex;
  height: 100%;
  gap: 20px;
}

.image-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.image-container {
  flex: 1;
  position: relative;
  overflow: auto;
  background: #f5f7fa;
}

.editable-image {
  max-width: 100%;
  height: auto;
  display: block;
  cursor: crosshair;
}

.existing-point {
  position: absolute;
  border: 2px solid #409eff;
  background: rgba(64, 158, 255, 0.1);
  cursor: pointer;
  z-index: 10;
}

.existing-point:hover {
  background: rgba(64, 158, 255, 0.2);
}

.point-number {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 20px;
  height: 20px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.connection-line {
  position: absolute;
  pointer-events: none;
}

.line-segment {
  position: absolute;
  background: #409eff;
}

.line-segment.horizontal {
  height: 2px;
  right: -20px;
  top: 50%;
  width: 20px;
  transform: translateY(-50%);
}

.line-segment.vertical {
  width: 2px;
  right: -20px;
  top: -20px;
  height: 20px;
}

.drawing-rect {
  position: absolute;
  border: 2px dashed #67c23a;
  background: rgba(103, 194, 58, 0.1);
  pointer-events: none;
  z-index: 20;
}

.image-tools {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  background: white;
  display: flex;
  gap: 12px;
}

.control-panel {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.panel-section {
  padding: 16px;
}

.panel-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
}

.points-list {
  max-height: 300px;
  overflow-y: auto;
}

.point-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.point-item:hover {
  border-color: #409eff;
}

.point-item.active {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.point-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.point-index {
  width: 20px;
  height: 20px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.point-title {
  flex: 1;
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.point-detail {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
  margin-left: 28px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-management {
    padding: 12px;
  }
  
  .level-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .level-actions {
    flex-direction: column;
  }
  
  .filter-section .el-row {
    gap: 8px;
  }
  
  .filter-section .el-col {
    margin-bottom: 8px;
  }
  
  .editor-layout {
    flex-direction: column;
    height: auto;
  }
  
  .control-panel {
    width: 100%;
  }
}
</style>
