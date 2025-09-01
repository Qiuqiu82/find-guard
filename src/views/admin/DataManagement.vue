<template>
  <div class="data-management">
    <!-- 数据概览 -->
    <el-card class="overview-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">数据概览</span>
          <span class="card-subtitle">当前系统数据统计信息</span>
        </div>
      </template>
      
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="32"><Picture /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ imageCount }}</div>
              <div class="stat-label">图片总数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="32"><Location /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalPoints }}</div>
              <div class="stat-label">警示点总数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="32"><Setting /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ settings.totalLevels }}</div>
              <div class="stat-label">启用关卡数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="32"><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ settings.countdownSeconds }}s</div>
              <div class="stat-label">倒计时设置</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据操作 -->
    <el-row :gutter="24">
      <el-col :span="12">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">数据导出</span>
              <span class="card-subtitle">导出当前所有游戏数据</span>
            </div>
          </template>
          
          <div class="action-content">
            <p class="action-description">
              导出包含所有图片、警示点信息和游戏设置的完整数据包，格式为JSON文件。
            </p>
            
            <div class="export-info">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="导出内容">
                  图片数据 + 警示点 + 游戏设置
                </el-descriptions-item>
                <el-descriptions-item label="文件格式">
                  JSON
                </el-descriptions-item>
                <el-descriptions-item label="预计大小">
                  {{ estimatedSize }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
            
            <el-button
              type="primary"
              size="large"
              @click="exportData"
              :loading="exporting"
              :disabled="imageCount === 0"
            >
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">数据导入</span>
              <span class="card-subtitle">导入游戏数据包</span>
            </div>
          </template>
          
          <div class="action-content">
            <p class="action-description">
              导入JSON格式的游戏数据包，将覆盖当前所有数据。请确保数据格式正确。
            </p>
            
            <div class="import-info">
              <el-alert
                title="注意事项"
                type="warning"
                :closable="false"
                show-icon
              >
                <template #default>
                  <ul>
                    <li>导入将覆盖现有所有数据</li>
                    <li>请确保JSON文件格式正确</li>
                    <li>建议先导出当前数据作为备份</li>
                  </ul>
                </template>
              </el-alert>
            </div>
            
            <el-upload
              class="import-upload"
              :auto-upload="false"
              :on-change="handleImportFile"
              accept=".json"
              :limit="1"
              :show-file-list="false"
            >
              <el-button
                type="warning"
                size="large"
                :loading="importing"
                :disabled="imageCount === 0"
              >
                <el-icon><Upload /></el-icon>
                选择文件导入
              </el-button>
            </el-upload>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据备份 -->
    <el-card class="backup-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">数据备份</span>
          <span class="card-subtitle">管理数据备份和恢复</span>
        </div>
      </template>
      
      <div class="backup-content">
        <div class="backup-info">
          <p>系统会自动保存数据到本地存储，但建议定期导出数据作为备份。</p>
          <p>最后备份时间：{{ lastBackupTime }}</p>
        </div>
        
        <div class="backup-actions">
          <el-button @click="createBackup" :loading="creatingBackup">
            <el-icon><CopyDocument /></el-icon>
            创建备份
          </el-button>
          
          <el-button @click="clearAllData" type="danger">
            <el-icon><Delete /></el-icon>
            清空所有数据
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 导入确认对话框 -->
    <el-dialog
      v-model="showImportConfirm"
      title="确认导入数据"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="import-confirm-content">
        <el-alert
          title="警告"
          type="error"
          :closable="false"
          show-icon
        >
          <template #default>
            导入新数据将完全覆盖当前所有数据，此操作不可逆！
          </template>
        </el-alert>
        
        <div class="import-preview">
          <h4>导入数据预览：</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="图片数量">
              {{ importPreview.levels?.length || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="警示点总数">
              {{ importPreview.totalPoints || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="总关卡数">
              {{ importPreview.settings?.totalLevels || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="倒计时">
              {{ importPreview.settings?.countdownSeconds || 0 }}秒
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showImportConfirm = false">取消</el-button>
          <el-button type="danger" @click="confirmImport" :loading="importing">
            确认导入
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Picture,
  Location,
  Setting,
  Timer,
  Download,
  Upload,
  CopyDocument,
  Delete
} from '@element-plus/icons-vue'

const store = useStore()

// 响应式数据
const exporting = ref(false)
const importing = ref(false)
const creatingBackup = ref(false)
const showImportConfirm = ref(false)
const importPreview = ref<any>({})
const importFile = ref<File | null>(null)

// 计算属性
const imageCount = computed(() => store.getters['game/maxLevels'])
const totalPoints = computed(() => store.getters['game/totalPoints'])
const settings = computed(() => store.getters['game/currentSettings'])
const estimatedSize = computed(() => {
  const baseSize = imageCount.value * 100 // 每张图片约100KB
  const pointsSize = totalPoints.value * 2 // 每个警示点约2KB
  const totalKB = Math.round((baseSize + pointsSize) / 1024)
  return totalKB > 1024 ? `${(totalKB / 1024).toFixed(1)}MB` : `${totalKB}KB`
})
const lastBackupTime = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-CN')
})

// 导出数据
const exportData = async () => {
  try {
    exporting.value = true
    
    const data = store.dispatch('game/exportData')
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `game-data-${new Date().toISOString().split('T')[0]}.json`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('数据导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 处理导入文件
const handleImportFile = (file: any) => {
  if (!file.raw) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      
      // 验证数据格式
      if (!validateImportData(data)) {
        ElMessage.error('数据格式不正确，请检查文件')
        return
      }
      
      importPreview.value = data
      importFile.value = file.raw
      showImportConfirm.value = true
      
    } catch (error) {
      ElMessage.error('文件解析失败，请确保是有效的JSON文件')
    }
  }
  
  reader.readAsText(file.raw)
}

// 验证导入数据
const validateImportData = (data: any): boolean => {
  // 检查基本结构
  if (!data || typeof data !== 'object') return false
  
  // 检查设置
  if (!data.settings || typeof data.settings !== 'object') return false
  if (typeof data.settings.totalLevels !== 'number') return false
  if (typeof data.settings.countdownSeconds !== 'number') return false
  if (typeof data.settings.flashThreshold !== 'number') return false
  
  // 检查关卡数据
  if (!Array.isArray(data.levels)) return false
  
  // 验证每个关卡
  for (const level of data.levels) {
    if (!level.image || typeof level.image !== 'string') return false
    if (!Array.isArray(level.points)) return false
    
    // 验证警示点
    for (const point of level.points) {
      if (typeof point.x !== 'number' || point.x < 0 || point.x > 1) return false
      if (typeof point.y !== 'number' || point.y < 0 || point.y > 1) return false
      if (typeof point.width !== 'number' || point.width <= 0 || point.width > 1) return false
      if (typeof point.height !== 'number' || point.height <= 0 || point.height > 1) return false
      if (typeof point.highlightTitle !== 'string') return false
      if (typeof point.highlightDetail !== 'string') return false
      if (!['horizontal', 'vertical-horizontal'].includes(point.connectionType)) return false
      if (typeof point.found !== 'boolean') return false
    }
  }
  
  return true
}

// 确认导入
const confirmImport = async () => {
  if (!importFile.value) return
  
  try {
    importing.value = true
    
    // 导入数据到store
    await store.dispatch('game/importData', importPreview.value)
    
    ElMessage.success('数据导入成功')
    showImportConfirm.value = false
    importPreview.value = {}
    importFile.value = null
    
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('数据导入失败，请重试')
  } finally {
    importing.value = false
  }
}

// 创建备份
const createBackup = async () => {
  try {
    creatingBackup.value = true
    
    // 导出当前数据作为备份
    await exportData()
    
    ElMessage.success('备份创建成功')
  } catch (error) {
    console.error('创建备份失败:', error)
    ElMessage.error('备份创建失败，请重试')
  } finally {
    creatingBackup.value = false
  }
}

// 清空所有数据
const clearAllData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有数据吗？此操作不可逆，建议先导出备份。',
      '确认清空',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )
    
    // 清空数据
    store.dispatch('game/importData', { settings: { totalLevels: 1, countdownSeconds: 30, flashThreshold: 10 }, levels: [] })
    
    ElMessage.success('所有数据已清空')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  // 初始化游戏数据
  store.dispatch('game/initGame')
})
</script>

<style scoped>
.data-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-card,
.action-card,
.backup-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

/* 统计项样式 */
.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%);
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(30, 28, 114, 0.15);
  border-color: #1e1c72;
}

.stat-icon {
  color: #1e1c72;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e1c72;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
}

/* 操作卡片样式 */
.action-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-description {
  color: #495057;
  line-height: 1.6;
  margin: 0;
}

.export-info,
.import-info {
  margin: 16px 0;
}

.import-upload {
  text-align: center;
}

/* 备份卡片样式 */
.backup-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.backup-info {
  color: #495057;
  line-height: 1.6;
}

.backup-info p {
  margin: 8px 0;
}

.backup-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* 导入确认对话框 */
.import-confirm-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.import-preview h4 {
  margin: 0 0 12px 0;
  color: #1e1c72;
}

/* 响应式 */
@media (max-width: 768px) {
  .el-col {
    margin-bottom: 16px;
  }
  
  .stat-item {
    padding: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .backup-actions {
    flex-direction: column;
  }
}
</style> 