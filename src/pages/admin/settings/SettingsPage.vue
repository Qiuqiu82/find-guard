<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>游戏设置</h1>
      <p>配置游戏相关参数和选项</p>
    </div>
    
    <div class="settings-content">
      <el-card class="setting-card">
        <template #header>
          <div class="card-header">
            <span>基本设置</span>
          </div>
        </template>
        
        <el-form :model="settingsForm" label-width="120px">
          <el-form-item label="游戏名称">
            <el-input v-model="settingsForm.gameName" placeholder="请输入游戏名称" />
          </el-form-item>
          
          <el-form-item label="游戏难度">
            <el-select v-model="settingsForm.difficulty" placeholder="请选择难度">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="时间限制">
            <el-input-number 
              v-model="settingsForm.timeLimit" 
              :min="30" 
              :max="300" 
              :step="30"
              placeholder="秒"
            />
          </el-form-item>
          
          <el-form-item label="启用音效">
            <el-switch v-model="settingsForm.enableSound" />
          </el-form-item>
          
          <el-form-item label="启用动画">
            <el-switch v-model="settingsForm.enableAnimation" />
          </el-form-item>
        </el-form>
        
        <div class="form-actions">
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="resetSettings">重置</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 页面标题
const pageTitle = '游戏设置'

// 设置表单数据
const settingsForm = reactive({
  gameName: 'TestGuard',
  difficulty: 'medium',
  timeLimit: 120,
  enableSound: true,
  enableAnimation: true
})

// 保存设置
const saveSettings = () => {
  ElMessage.success('设置保存成功')
  console.log('保存设置:', settingsForm)
}

// 重置设置
const resetSettings = () => {
  Object.assign(settingsForm, {
    gameName: 'TestGuard',
    difficulty: 'medium',
    timeLimit: 120,
    enableSound: true,
    enableAnimation: true
  })
  ElMessage.info('设置已重置')
}
</script>

<style scoped>
.settings-page {
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

.settings-content {
  max-width: 800px;
}

.setting-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.form-actions {
  margin-top: 24px;
  text-align: center;
}

.form-actions .el-button {
  margin: 0 8px;
}
</style> 