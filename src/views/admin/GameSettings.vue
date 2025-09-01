<template>
  <div class="game-settings">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">游戏设置</span>
          <span class="card-subtitle">配置游戏基本参数和规则</span>
        </div>
      </template>
      
      <el-form
        ref="settingsFormRef"
        :model="settingsForm"
        :rules="settingsRules"
        label-width="120px"
        class="settings-form"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="关卡配置" prop="totalLevels">
              <el-input-number
                v-model="settingsForm.totalLevels"
                :min="1"
                :max="maxLevels || 50"
                :step="1"
                size="large"
                style="width: 100%"
                placeholder="设置游戏总关卡数量"
              />
              <div class="form-hint">
                <div>设置范围: 1-{{ maxLevels || 50 }} 关</div>
                <div v-if="maxLevels > 0" class="hint-secondary">
                  当前可用图片: {{ maxLevels }} 张 (预置{{ presetCount }}张 + 自定义{{ customCount }}张)
                  <span v-if="settingsForm.totalLevels > maxLevels" class="warning-text">
                    （配置超出可用数量，游戏将使用 {{ maxLevels }} 关）
                  </span>
                </div>
                <div v-else class="hint-warning">
                  请先在"图片管理"中添加图片
                </div>
              </div>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="倒计时设置" prop="countdownSeconds">
              <el-input-number
                v-model="settingsForm.countdownSeconds"
                :min="10"
                :max="300"
                :step="5"
                size="large"
                style="width: 100%"
                placeholder="每关倒计时秒数"
              />
              <div class="form-hint">
                范围: 10-300秒，步长5秒
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="闪烁提醒" prop="flashThreshold">
              <el-input-number
                v-model="settingsForm.flashThreshold"
                :min="5"
                :max="safeFlashThresholdMax"
                :step="5"
                size="large"
                style="width: 100%"
                placeholder="闪烁提醒阈值"
              />
              <div class="form-hint">
                <div>剩余多少秒时开始闪烁红光（5-{{ safeFlashThresholdMax }}秒）</div>
                <div v-if="!isFlashThresholdSafe" class="hint-warning">
                  闪烁时间不能大于等于倒计时时间
                </div>
              </div>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="当前状态">
              <div class="status-display">
                <div class="status-item">
                  <span class="status-label">图片总数:</span>
                  <span class="status-value">{{ maxLevels }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">警示点总数:</span>
                  <span class="status-value">{{ totalPoints }}</span>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button type="primary" @click="saveSettings" :loading="saving">
            保存设置
          </el-button>
          <el-button @click="resetSettings">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 设置预览 -->
    <el-card class="preview-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">设置预览</span>
        </div>
      </template>
      
      <div class="preview-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="总关卡数">
            {{ settingsForm.totalLevels }}
          </el-descriptions-item>
          <el-descriptions-item label="倒计时">
            {{ settingsForm.countdownSeconds }}秒
          </el-descriptions-item>
          <el-descriptions-item label="闪烁提醒">
            {{ settingsForm.flashThreshold }}秒
          </el-descriptions-item>
          <el-descriptions-item label="图片总数">
            {{ maxLevels }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const store = useStore()

// 表单引用
const settingsFormRef = ref<FormInstance>()

// 响应式数据
const saving = ref(false)

// 表单数据
const settingsForm = reactive({
  totalLevels: 1,
  countdownSeconds: 30,
  flashThreshold: 10
})

// 表单验证规则（动态）
const settingsRules = computed<FormRules>(() => ({
  totalLevels: [
    { required: true, message: '请设置关卡数量', trigger: 'blur' },
    { 
      type: 'number', 
      min: 1, 
      max: maxLevels.value || 50, 
      message: `关卡数量范围1-${maxLevels.value || 50}关`, 
      trigger: 'blur' 
    }
  ],
  countdownSeconds: [
    { required: true, message: '请设置倒计时', trigger: 'blur' },
    { type: 'number', min: 10, max: 300, message: '倒计时范围10-300秒', trigger: 'blur' }
  ],
  flashThreshold: [
    { required: true, message: '请设置闪烁提醒阈值', trigger: 'blur' },
    { 
      type: 'number', 
      min: 5, 
      max: safeFlashThresholdMax.value, 
      message: `闪烁提醒范围5-${safeFlashThresholdMax.value}秒`, 
      trigger: 'blur' 
    }
  ]
}))

// 计算属性
const maxLevels = computed(() => store.getters['game/maxLevels'])
const totalPoints = computed(() => store.getters['game/totalPoints'])
const safeFlashThresholdMax = computed(() => store.getters['game/safeFlashThresholdMax'])
const isFlashThresholdSafe = computed(() => store.getters['game/isFlashThresholdSafe'])

// 预置图片和自定义图片数量
const presetCount = computed(() => {
  // 从presetImages获取预置图片数量
  return 12 // presetImages.length，硬编码避免循环依赖
})
const customCount = computed(() => store.getters['game/currentLevels'].length)

// 检查配置是否超出可用关卡数量（在模板中使用）
const isConfigExceedingAvailable = computed(() => {
  return maxLevels.value > 0 && settingsForm.totalLevels > maxLevels.value
})

// 保存设置
const saveSettings = async () => {
  if (!settingsFormRef.value) return
  
  try {
    await settingsFormRef.value.validate()
    
    saving.value = true
    
    // 更新store中的设置
    await store.dispatch('game/updateSettings', {
      totalLevels: settingsForm.totalLevels,
      countdownSeconds: settingsForm.countdownSeconds,
      flashThreshold: settingsForm.flashThreshold
    })
    
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败，请检查输入')
  } finally {
    saving.value = false
  }
}

// 重置设置
const resetSettings = () => {
  const currentSettings = store.getters['game/currentSettings']
  Object.assign(settingsForm, currentSettings)
  ElMessage.info('设置已重置')
}

// 监听倒计时变化，自动调整闪烁时间
watch(() => settingsForm.countdownSeconds, (newVal) => {
  const maxFlash = Math.min(60, newVal - 5)
  if (settingsForm.flashThreshold > maxFlash) {
    settingsForm.flashThreshold = Math.max(5, maxFlash)
    ElMessage.info('闪烁提醒时间已自动调整以适应倒计时设置')
  }
})

// 初始化表单数据
const initFormData = () => {
  const currentSettings = store.getters['game/currentSettings']
  Object.assign(settingsForm, currentSettings)
}

onMounted(() => {
  // 初始化游戏数据
  store.dispatch('game/initGame')
  
  // 初始化表单数据
  initFormData()
})
</script>

<style scoped>
.game-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card,
.preview-card {
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

.settings-form {
  margin-top: 20px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #6c757d;
}

.status-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.status-label {
  font-size: 14px;
  color: #495057;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: #1e1c72;
}

.preview-content {
  margin-top: 16px;
}

/* 提示样式 */
.hint-secondary {
  color: #606266;
  font-size: 12px;
  margin-top: 4px;
}

.warning-text {
  color: #E6A23C;
  font-weight: 500;
}

.hint-warning {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

/* 响应式 */
@media (max-width: 768px) {
  .el-col {
    margin-bottom: 16px;
  }
  
  .settings-form {
    margin-top: 16px;
  }
}
</style> 