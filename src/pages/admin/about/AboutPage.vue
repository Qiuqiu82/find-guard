<template>
  <div class="about-page">
    <div class="page-header">
      <h1>关于系统</h1>
      <p>系统信息和版本详情</p>
    </div>
    
    <div class="about-content">
      <!-- 系统信息卡片 -->
      <el-card class="system-info-card">
        <template #header>
          <div class="card-header">
            <span>系统信息</span>
          </div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="系统名称">TestGuard 管理系统</el-descriptions-item>
          <el-descriptions-item label="当前版本">v1.0.0</el-descriptions-item>
          <el-descriptions-item label="构建时间">2024-01-15</el-descriptions-item>
          <el-descriptions-item label="运行环境">Vue 3 + TypeScript</el-descriptions-item>
          <el-descriptions-item label="UI框架">Element Plus</el-descriptions-item>
          <el-descriptions-item label="Node版本">v18.0.0</el-descriptions-item>
        </el-descriptions>
      </el-card>
      
      <!-- 功能特性卡片 -->
      <el-card class="features-card">
        <template #header>
          <div class="card-header">
            <span>功能特性</span>
          </div>
        </template>
        
        <div class="features-grid">
          <div class="feature-item">
            <el-icon class="feature-icon"><setting /></el-icon>
            <h3>游戏设置管理</h3>
            <p>灵活配置游戏参数，支持难度调整和时间限制设置</p>
          </div>
          
          <div class="feature-item">
            <el-icon class="feature-icon"><picture /></el-icon>
            <h3>图片资源管理</h3>
            <p>拖拽上传、批量管理、格式转换等完整的图片处理功能</p>
          </div>
          
          <div class="feature-item">
            <el-icon class="feature-icon"><folder-opened /></el-icon>
            <h3>数据管理</h3>
            <p>用户数据管理、搜索筛选、分页展示等数据操作功能</p>
          </div>
          
          <div class="feature-item">
            <el-icon class="feature-icon"><monitor /></el-icon>
            <h3>系统监控</h3>
            <p>实时监控系统状态、性能指标和运行日志</p>
          </div>
        </div>
      </el-card>
      
      <!-- 技术栈卡片 -->
      <el-card class="tech-stack-card">
        <template #header>
          <div class="card-header">
            <span>技术栈</span>
          </div>
        </template>
        
        <div class="tech-list">
          <div class="tech-category">
            <h4>前端框架</h4>
            <el-tag v-for="tech in frontendTechs" :key="tech" class="tech-tag">
              {{ tech }}
            </el-tag>
          </div>
          
          <div class="tech-category">
            <h4>UI组件</h4>
            <el-tag v-for="tech in uiTechs" :key="tech" class="tech-tag" type="success">
              {{ tech }}
            </el-tag>
          </div>
          
          <div class="tech-category">
            <h4>开发工具</h4>
            <el-tag v-for="tech in devTechs" :key="tech" class="tech-tag" type="warning">
              {{ tech }}
            </el-tag>
          </div>
        </div>
      </el-card>
      
      <!-- 更新日志卡片 -->
      <el-card class="changelog-card">
        <template #header>
          <div class="card-header">
            <span>更新日志</span>
          </div>
        </template>
        
        <el-timeline>
          <el-timeline-item
            v-for="log in changelog"
            :key="log.version"
            :timestamp="log.date"
            placement="top"
          >
            <el-card>
              <h4>v{{ log.version }}</h4>
              <ul>
                <li v-for="item in log.items" :key="item">{{ item }}</li>
              </ul>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Setting, Picture, FolderOpened, Monitor } from '@element-plus/icons-vue'

// 页面标题
const pageTitle = '关于系统'

// 技术栈数据
const frontendTechs = ['Vue 3', 'TypeScript', 'Vite', 'Pinia']
const uiTechs = ['Element Plus', 'Vue Router', 'Axios']
const devTechs = ['ESLint', 'Prettier', 'Husky', 'Commitlint']

// 更新日志
const changelog = ref([
  {
    version: '1.0.0',
    date: '2024-01-15',
    items: [
      '初始版本发布',
      '实现基础的管理功能',
      '支持游戏设置配置',
      '图片资源管理功能',
      '用户数据管理功能'
    ]
  },
  {
    version: '0.9.0',
    date: '2024-01-10',
    items: [
      'Beta版本测试',
      '修复已知问题',
      '优化用户体验',
      '完善错误处理'
    ]
  },
  {
    version: '0.8.0',
    date: '2024-01-05',
    items: [
      'Alpha版本发布',
      '基础功能实现',
      'UI界面设计',
      '路由系统搭建'
    ]
  }
])
</script>

<style scoped>
.about-page {
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

.about-content {
  max-width: 1200px;
}

.system-info-card,
.features-card,
.tech-stack-card,
.changelog-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.feature-item h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.feature-item p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.tech-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tech-category h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.tech-tag {
  margin: 0 8px 8px 0;
}

.changelog-card .el-timeline {
  padding: 0;
}

.changelog-card .el-card {
  margin: 0;
  border: none;
  box-shadow: none;
}

.changelog-card h4 {
  margin: 0 0 12px 0;
  color: #409eff;
  font-weight: 600;
}

.changelog-card ul {
  margin: 0;
  padding-left: 20px;
}

.changelog-card li {
  margin-bottom: 4px;
  color: #606266;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-list {
    gap: 16px;
  }
}
</style> 