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
              <div class="stat-value">{{ systemStats.total_levels }}</div>
              <div class="stat-label">关卡总数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="32"><Location /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ systemStats.total_points }}</div>
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
              <div class="stat-value">{{ systemStats.preset_levels }}</div>
              <div class="stat-label">预置关卡数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="32"><FolderOpened /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatFileSize(systemStats.storage_used) }}</div>
              <div class="stat-label">存储使用量</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据操作 -->
    <el-row :gutter="24">
      <el-col :span="12">
        <!-- 数据导出 -->
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">数据导出</span>
              <span class="card-subtitle">导出游戏数据和配置信息</span>
            </div>
          </template>
          
          <div class="action-content">
            <div class="export-options">
              <el-form :model="exportForm" label-width="100px">
                <el-form-item label="导出格式">
                  <el-radio-group v-model="exportForm.format">
                    <el-radio label="json">JSON格式</el-radio>
                    <el-radio label="sql">SQL格式</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="包含图片">
                  <el-switch 
                    v-model="exportForm.includeImages"
                    active-text="包含图片文件"
                    inactive-text="仅数据"
                  />
                </el-form-item>
                
                <el-form-item label="指定分类">
                  <el-select 
                    v-model="exportForm.categories" 
                    multiple 
                    placeholder="选择分类（空表示全部）"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="category in availableCategories"
                      :key="category.id"
                      :label="category.name"
                      :value="category.id"
                    />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="数据范围">
                  <el-switch 
                    v-model="exportForm.presetOnly"
                    active-text="仅预置数据"
                    inactive-text="全部数据"
                  />
                </el-form-item>
              </el-form>
            </div>
            
            <div class="action-buttons">
              <el-button 
                type="primary" 
                :icon="Download" 
                @click="handleExport"
                :loading="exportLoading"
                :disabled="exportLoading"
              >
                {{ exportLoading ? '导出中...' : '开始导出' }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <!-- 数据导入 -->
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">数据导入</span>
              <span class="card-subtitle">从JSON文件导入游戏数据</span>
            </div>
          </template>
          
          <div class="action-content">
            <div class="import-options">
              <el-upload
                class="import-uploader"
                drag
                :auto-upload="false"
                :on-change="handleImportFile"
                :before-upload="() => false"
                accept=".json"
                :limit="1"
              >
                <el-icon class="upload-icon"><Upload /></el-icon>
                <div class="upload-text">
                  将JSON文件拖到此处，或<em>点击选择</em>
                </div>
                <div class="upload-tip">
                  支持JSON格式的游戏数据文件
                </div>
              </el-upload>
              
              <div v-if="importFile" class="import-info">
                <p><strong>选择文件:</strong> {{ importFile.name }}</p>
                <p><strong>文件大小:</strong> {{ formatFileSize(importFile.size) }}</p>
              </div>
              
              <el-form label-width="100px" style="margin-top: 20px;">
                <el-form-item label="导入模式">
                  <el-radio-group v-model="importMode">
                    <el-radio label="merge">合并模式</el-radio>
                    <el-radio label="replace">替换模式</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="安全选项">
                  <el-switch 
                    v-model="backupBeforeImport"
                    active-text="导入前自动备份"
                    inactive-text="直接导入"
                  />
                </el-form-item>
              </el-form>
            </div>
            
            <div class="action-buttons">
              <el-button 
                type="success" 
                :icon="Upload" 
                @click="handleValidateImport"
                :loading="importLoading"
                :disabled="!importFile || importLoading"
              >
                {{ importLoading ? '验证中...' : '验证并导入' }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 备份管理 -->
    <el-card class="backup-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">备份管理</span>
          <span class="card-subtitle">数据备份和恢复功能</span>
        </div>
      </template>
      
      <div class="backup-actions">
        <el-button 
          type="warning" 
          :icon="DocumentCopy" 
          @click="handleCreateBackup"
          :loading="backupLoading"
        >
          {{ backupLoading ? '备份中...' : '创建备份' }}
        </el-button>
        
        <el-button 
          :icon="Refresh" 
          @click="loadBackupList"
        >
          刷新列表
        </el-button>
      </div>
      
      <el-table 
        :data="backupList" 
        style="width: 100%; margin-top: 20px;"
        v-loading="backupListLoading"
      >
        <el-table-column prop="backup_name" label="备份名称" />
        <el-table-column prop="backup_type" label="类型">
          <template #default="{ row }">
            <el-tag :type="row.backup_type === 'auto' ? 'info' : 'primary'">
              {{ row.backup_type === 'auto' ? '自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="file_size" label="大小">
          <template #default="{ row }">
            {{ formatFileSize(row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button 
              size="small" 
              :icon="Download" 
              @click="handleDownloadBackup(row)"
            >
              下载
            </el-button>
            <el-button 
              size="small" 
              type="warning" 
              @click="handleRestoreBackup(row)"
            >
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 导入确认对话框 -->
    <el-dialog
      v-model="importConfirmVisible"
      title="导入数据确认"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="importPreview.valid">
        <el-alert
          title="验证通过"
          type="success"
          :closable="false"
          show-icon
        >
          数据格式验证通过，可以安全导入
        </el-alert>
        
        <div class="import-summary" style="margin-top: 20px;">
          <h4>导入数据概览：</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="关卡数量">
              {{ importPreview.summary?.levels_count || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="警示点数量">
              {{ importPreview.summary?.points_count || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="使用分类">
              {{ importPreview.summary?.categories_used?.join(', ') || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="预计耗时">
              {{ importPreview.summary?.estimated_import_time || '未知' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div v-if="importPreview.warnings?.length" class="import-warnings" style="margin-top: 20px;">
          <h4>警告信息：</h4>
          <el-alert
            v-for="(warning, index) in importPreview.warnings"
            :key="index"
            :title="warning"
            type="warning"
            :closable="false"
            style="margin-bottom: 10px;"
          />
        </div>
      </div>
      
      <div v-else>
        <el-alert
          title="验证失败"
          type="error"
          :closable="false"
          show-icon
        >
          数据格式验证失败，无法导入
        </el-alert>
        
        <div v-if="importPreview.errors?.length" class="import-errors" style="margin-top: 20px;">
          <h4>错误信息：</h4>
          <el-alert
            v-for="(error, index) in importPreview.errors"
            :key="index"
            :title="error"
            type="error"
            :closable="false"
            style="margin-bottom: 10px;"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importConfirmVisible = false">取消</el-button>
          <el-button 
            v-if="importPreview.valid"
            type="primary" 
            @click="handleConfirmImport"
            :loading="importLoading"
          >
            确认导入
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Location, Setting, FolderOpened, Download, Upload, Delete, Refresh, DocumentCopy } from '@element-plus/icons-vue'
import { systemAPI, categoryAPI, dataAPI, backupAPI, handleAPIError, formatFileSize } from '@/api/index.js'

// 系统统计数据
const systemStats = reactive({
  total_levels: 0,
  preset_levels: 0,
  custom_levels: 0,
  total_points: 0,
  storage_used: 0,
  storage_limit: 0,
  storage_usage_percent: 0
})

// 导出功能
const exportDialogVisible = ref(false)
const exportLoading = ref(false)
const exportForm = reactive({
  format: 'json',
  includeImages: false,
  categories: [],
  presetOnly: false
})

// 可用分类列表（用于导出选择）
const availableCategories = ref([])

// 导入功能
const importLoading = ref(false)
const importFile = ref(null)
const importMode = ref('merge')
const backupBeforeImport = ref(true)
const importConfirmVisible = ref(false)
const importPreview = reactive({
  valid: false,
  errors: [],
  warnings: [],
  summary: null
})

// 备份管理
const backupLoading = ref(false)
const backupListLoading = ref(false)
const backupList = ref([])

// 页面初始化
onMounted(async () => {
  await loadSystemStats()
  await loadCategories()
  await loadBackupList()
})

/**
 * 加载系统统计数据
 */
async function loadSystemStats() {
  try {
    const response = await systemAPI.getStats()
    Object.assign(systemStats, response.data)
  } catch (error) {
    handleAPIError(error, '获取系统统计失败')
  }
}

/**
 * 加载分类列表
 */
async function loadCategories() {
  try {
    const response = await categoryAPI.getAll()
    availableCategories.value = response.data
  } catch (error) {
    handleAPIError(error, '获取分类列表失败')
  }
}

/**
 * 处理数据导出
 */
async function handleExport() {
  try {
    exportLoading.value = true
    
    const params = {
      format: exportForm.format,
      include_images: exportForm.includeImages,
      preset_only: exportForm.presetOnly
    }
    
    if (exportForm.categories.length > 0) {
      params.categories = exportForm.categories.join(',')
    }
    
    const response = await dataAPI.export(params)
    
    // 下载导出文件
    const downloadUrl = dataAPI.download(response.data.export_id.split('_')[1] + '.' + exportForm.format)
    window.open(downloadUrl, '_blank')
    
    ElMessage.success(`导出成功！文件大小: ${formatFileSize(response.data.file_size)}`)
    
  } catch (error) {
    handleAPIError(error, '数据导出失败')
  } finally {
    exportLoading.value = false
  }
}

/**
 * 处理导入文件选择
 */
function handleImportFile(file) {
  importFile.value = file.raw
}

/**
 * 验证导入数据
 */
async function handleValidateImport() {
  if (!importFile.value) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }
  
  try {
    importLoading.value = true
    
    // 读取文件内容
    const fileContent = await readFileAsText(importFile.value)
    const jsonData = JSON.parse(fileContent)
    
    // 验证数据格式
    const response = await dataAPI.validate(jsonData)
    
    // 更新预览信息
    Object.assign(importPreview, response.data)
    
    // 显示确认对话框
    importConfirmVisible.value = true
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      ElMessage.error('JSON文件格式错误，请检查文件内容')
    } else {
      handleAPIError(error, '验证导入数据失败')
    }
  } finally {
    importLoading.value = false
  }
}

/**
 * 确认执行导入
 */
async function handleConfirmImport() {
  try {
    importLoading.value = true
    
    const options = {
      mode: importMode.value,
      backup_before_import: backupBeforeImport.value
    }
    
    const response = await dataAPI.import(importFile.value, options)
    
    ElMessage.success(`导入成功！导入了 ${response.data.results.imported_levels} 个关卡，${response.data.results.imported_points} 个警示点`)
    
    if (response.data.backup_created) {
      ElMessage.info(`已自动创建备份: ${response.data.backup_created}`)
    }
    
    // 刷新统计数据
    await loadSystemStats()
    
    // 关闭对话框
    importConfirmVisible.value = false
    importFile.value = null
    
  } catch (error) {
    handleAPIError(error, '数据导入失败')
  } finally {
    importLoading.value = false
  }
}

/**
 * 创建备份
 */
async function handleCreateBackup() {
  try {
    const { value: backupName } = await ElMessageBox.prompt('请输入备份名称', '创建备份', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputValue: `手动备份_${new Date().toISOString().split('T')[0]}`
    })
    
    backupLoading.value = true
    
    const response = await backupAPI.create({
      backup_name: backupName,
      backup_type: 'manual',
      include_files: true
    })
    
    ElMessage.success('备份创建成功')
    
    // 刷新备份列表
    await loadBackupList()
    
  } catch (error) {
    if (error !== 'cancel') {
      handleAPIError(error, '创建备份失败')
    }
  } finally {
    backupLoading.value = false
  }
}

/**
 * 加载备份列表
 */
async function loadBackupList() {
  try {
    backupListLoading.value = true
    const response = await backupAPI.getList({ page: 1, size: 20 })
    backupList.value = response.data.items || []
  } catch (error) {
    handleAPIError(error, '获取备份列表失败')
  } finally {
    backupListLoading.value = false
  }
}

/**
 * 下载备份
 */
function handleDownloadBackup(backup) {
  const downloadUrl = backupAPI.download(backup.id)
  window.open(downloadUrl, '_blank')
}

/**
 * 恢复备份
 */
async function handleRestoreBackup(backup) {
  try {
    await ElMessageBox.confirm(
      `确定要恢复备份 "${backup.backup_name}" 吗？此操作将替换当前所有数据！`,
      '恢复备份确认',
      {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await backupAPI.restore(backup.id, {
      confirm: true,
      backup_current: true
    })
    
    ElMessage.success('备份恢复成功')
    
    // 刷新统计数据
    await loadSystemStats()
    
  } catch (error) {
    if (error !== 'cancel') {
      handleAPIError(error, '恢复备份失败')
    }
  }
}

/**
 * 读取文件内容为文本
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}
</script>

<style scoped>
.data-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.overview-card {
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  transition: transform 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  color: #409eff;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.action-card {
  margin-bottom: 24px;
  height: 100%;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.export-options,
.import-options {
  flex: 1;
}

.action-buttons {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.import-uploader {
  width: 100%;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
}

.import-info {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}

.backup-card {
  margin-bottom: 24px;
}

.backup-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.import-summary,
.import-warnings,
.import-errors {
  margin-top: 16px;
}

.import-summary h4,
.import-warnings h4,
.import-errors h4 {
  margin-bottom: 12px;
  font-size: 16px;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-management {
    padding: 12px;
  }
  
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
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
