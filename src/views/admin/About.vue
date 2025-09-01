<template>
  <div class="about-page">
    <el-card class="about-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">关于系统</span>
          <span class="card-subtitle">系统信息和版本详情</span>
        </div>
      </template>
      
      <div class="about-content">
        <div class="system-info">
          <h3>系统概述</h3>
          <p>这是一个专为找不同小游戏设计的后台管理系统，提供完整的游戏配置、图片管理和数据维护功能。</p>
          
          <h3>主要功能</h3>
          <ul>
            <li><strong>游戏设置</strong>：配置关卡数量、倒计时、闪烁提醒等游戏参数</li>
            <li><strong>图片管理</strong>：上传、编辑图片，绘制警示点，设置连接线</li>
            <li><strong>数据管理</strong>：导入导出游戏数据，备份恢复功能</li>
            <li><strong>系统配置</strong>：主题切换、布局设置、个性化配置</li>
          </ul>
          
          <h3>技术架构</h3>
          <div class="tech-stack">
            <div class="tech-item">
              <span class="tech-label">前端框架</span>
              <span class="tech-value">Vue 3 + TypeScript</span>
            </div>
            <div class="tech-item">
              <span class="tech-label">UI组件库</span>
              <span class="tech-value">Element Plus</span>
            </div>
            <div class="tech-item">
              <span class="tech-label">状态管理</span>
              <span class="tech-value">Vuex 4</span>
            </div>
            <div class="tech-item">
              <span class="tech-label">构建工具</span>
              <span class="tech-value">Vite</span>
            </div>
            <div class="tech-item">
              <span class="tech-label">路由管理</span>
              <span class="tech-value">Vue Router 4</span>
            </div>
          </div>
        </div>
        
        <div class="version-info">
          <h3>版本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统版本">v2.0.0</el-descriptions-item>
            <el-descriptions-item label="构建时间">2024年8月28日</el-descriptions-item>
            <el-descriptions-item label="Vue版本">3.5.17</el-descriptions-item>
            <el-descriptions-item label="TypeScript">5.8.3</el-descriptions-item>
            <el-descriptions-item label="Element Plus">2.4.4</el-descriptions-item>
            <el-descriptions-item label="Vite">7.0.3</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="features-list">
          <h3>功能特性</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="feature-item">
                <div class="feature-icon">
                  <el-icon size="24"><Setting /></el-icon>
                </div>
                <h4>智能配置</h4>
                <p>动态调整关卡数量，实时验证设置参数</p>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="feature-item">
                <div class="feature-icon">
                  <el-icon size="24"><Picture /></el-icon>
                </div>
                <h4>图片编辑</h4>
                <p>可视化绘制警示点，支持多种连接线样式</p>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="feature-item">
                <div class="feature-icon">
                  <el-icon size="24"><DataAnalysis /></el-icon>
                </div>
                <h4>数据管理</h4>
                <p>完整的导入导出功能，数据备份恢复</p>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="system-status">
          <h3>系统状态</h3>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="status-item">
                <div class="status-icon success">
                  <el-icon size="20"><Check /></el-icon>
                </div>
                <div class="status-content">
                  <div class="status-title">系统运行</div>
                  <div class="status-value">正常</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="status-item">
                <div class="status-icon info">
                  <el-icon size="20"><InfoFilled /></el-icon>
                </div>
                <div class="status-content">
                  <div class="status-title">存储状态</div>
                  <div class="status-value">正常</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="status-item">
                <div class="status-icon warning">
                  <el-icon size="20"><Warning /></el-icon>
                </div>
                <div class="status-content">
                  <div class="status-title">数据备份</div>
                  <div class="status-value">建议备份</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="status-item">
                <div class="status-icon success">
                  <el-icon size="20"><Connection /></el-icon>
                </div>
                <div class="status-content">
                  <div class="status-title">网络连接</div>
                  <div class="status-value">正常</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="contact-info">
          <h3>技术支持</h3>
          <p>如需技术支持或有任何问题，请联系系统管理员。</p>
          <div class="contact-details">
            <div class="contact-item">
              <span class="contact-label">技术支持</span>
              <span class="contact-value">admin@example.com</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">系统维护</span>
              <span class="contact-value">system@example.com</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStore } from 'vuex'
import {
  Setting,
  Picture,
  DataAnalysis,
  Check,
  InfoFilled,
  Warning,
  Connection
} from '@element-plus/icons-vue'

const store = useStore()

onMounted(() => {
  // 页面加载完成后的初始化逻辑
  console.log('关于页面已加载')
})
</script>

<style scoped>
.about-page {
  max-width: 1200px;
  margin: 0 auto;
}

.about-card {
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

.about-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.system-info h3,
.version-info h3,
.features-list h3,
.system-status h3,
.contact-info h3 {
  color: #1e1c72;
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.system-info p,
.contact-info p {
  color: #495057;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.system-info ul {
  color: #495057;
  line-height: 1.6;
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.system-info li {
  margin-bottom: 8px;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.tech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.tech-label {
  font-weight: 600;
  color: #495057;
}

.tech-value {
  color: #1e1c72;
  font-family: 'Courier New', monospace;
}

.feature-item {
  text-align: center;
  padding: 24px 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%);
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  height: 100%;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(30, 28, 114, 0.15);
  border-color: #1e1c72;
}

.feature-icon {
  color: #1e1c72;
  margin-bottom: 16px;
}

.feature-item h4 {
  color: #1e1c72;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.feature-item p {
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.status-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.status-icon.success {
  background: #28a745;
}

.status-icon.info {
  background: #17a2b8;
}

.status-icon.warning {
  background: #ffc107;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.contact-label {
  font-weight: 600;
  color: #495057;
}

.contact-value {
  color: #1e1c72;
  font-family: 'Courier New', monospace;
}

/* 响应式 */
@media (max-width: 768px) {
  .tech-stack {
    grid-template-columns: 1fr;
  }
  
  .el-col {
    margin-bottom: 16px;
  }
  
  .feature-item {
    margin-bottom: 16px;
  }
  
  .status-item {
    margin-bottom: 16px;
  }
}
</style> 