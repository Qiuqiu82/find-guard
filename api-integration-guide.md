# 🔗 FindGuard API 集成指南

## 📋 概述

本指南详细说明如何将现有的Vue组件与后台API进行对接，包括数据管理、图片管理和关卡编辑器的API集成。

## 🎯 已完成的API集成

### 1. API服务模块 (`src/api/index.js`)
✅ **已完成** - 统一的API接口服务

**功能特性:**
- 8大模块的完整API接口
- 统一的错误处理机制
- 文件上传支持
- 请求拦截和响应处理

**使用示例:**
```javascript
import { systemAPI, levelAPI, pointAPI } from '@/api/index.js'

// 获取系统配置
const config = await systemAPI.getConfig()

// 创建关卡
const level = await levelAPI.create(levelData)

// 批量创建警示点
const points = await pointAPI.createBatch(levelId, pointsData)
```

### 2. 数据管理组件 (`src/views/admin/DataManagement-new.vue`)
✅ **已完成** - 对接系统统计、数据导入导出、备份管理API

**核心功能:**
- 实时系统统计数据展示
- 数据导入导出功能
- 备份创建和恢复
- 分类筛选支持

**API集成点:**
```javascript
// 获取系统统计
await systemAPI.getStats()

// 数据导出
await dataAPI.export(params)

// 数据导入
await dataAPI.import(file, options)

// 备份管理
await backupAPI.create(options)
```

### 3. 图片管理组件 (`src/views/admin/ImageManagement-new.vue`)
✅ **已完成** - 对接图片上传、关卡管理、警示点编辑API

**核心功能:**
- 图片上传和关卡创建
- 关卡列表展示和筛选
- 可视化警示点编辑
- 批量操作支持

**API集成点:**
```javascript
// 上传图片
await fileAPI.upload(file)

// 创建关卡
await levelAPI.create(levelData)

// 批量创建警示点
await pointAPI.createBatch(levelId, points)

// 更新警示点
await pointAPI.update(pointId, updateData)
```

## 🔧 集成现有组件的步骤

### 步骤1: 替换现有文件

将新创建的组件文件替换现有文件：

```bash
# 备份现有文件
cp src/views/admin/DataManagement.vue src/views/admin/DataManagement-backup.vue
cp src/views/admin/ImageManagement.vue src/views/admin/ImageManagement-backup.vue

# 使用新的API集成版本
cp src/views/admin/DataManagement-new.vue src/views/admin/DataManagement.vue
cp src/views/admin/ImageManagement-new.vue src/views/admin/ImageManagement.vue
```

### 步骤2: 更新路由配置

确保路由指向正确的组件文件：

```javascript
// router/index.js
{
  path: '/admin/data',
  component: () => import('@/views/admin/DataManagement.vue')
},
{
  path: '/admin/images',
  component: () => import('@/views/admin/ImageManagement.vue')
}
```

### 步骤3: 关卡编辑器集成

对于关卡编辑器，使用适配器模式进行渐进式集成：

```javascript
// 在现有的 level-editor/index.vue 中添加
import { createLevelEditorAdapter } from './api-integration.js'

export default {
  data() {
    return {
      // 现有数据...
      apiAdapter: null,
      isAPIMode: true // 切换到API模式
    }
  },
  
  async mounted() {
    if (this.isAPIMode) {
      this.apiAdapter = createLevelEditorAdapter()
      await this.initializeWithAPI()
    } else {
      // 保留原有的初始化逻辑
      this.initializeLocal()
    }
  },
  
  methods: {
    async initializeWithAPI() {
      try {
        const data = await this.apiAdapter.initializeEditor()
        this.allGameLevels = data.allGameLevels
        this.totalLevels = data.totalLevels
        // 更新其他数据...
      } catch (error) {
        console.error('API初始化失败:', error)
        // 回退到本地模式
        this.isAPIMode = false
        this.initializeLocal()
      }
    },
    
    async saveToAPI() {
      if (!this.isAPIMode) return
      
      try {
        const result = await this.apiAdapter.saveEditorData(
          this.allGameLevels,
          { totalLevels: this.totalLevels }
        )
        
        if (result.success) {
          this.$message.success('保存成功')
        } else {
          this.$message.error('保存失败')
        }
      } catch (error) {
        this.$message.error('保存失败: ' + error.message)
      }
    }
  }
}
```

## 🎮 游戏界面API集成

### 更新游戏主界面 (`src/views/home/index.vue`)

```javascript
// 在现有组件中添加API支持
import { levelAPI, systemAPI } from '@/api/index.js'

export default {
  data() {
    return {
      useAPI: true, // API模式开关
      // 现有数据...
    }
  },
  
  async mounted() {
    if (this.useAPI) {
      await this.loadGameDataFromAPI()
    } else {
      // 保留原有逻辑
      this.loadLocalGameData()
    }
  },
  
  methods: {
    async loadGameDataFromAPI() {
      try {
        // 获取系统配置
        const configResponse = await systemAPI.getConfig()
        this.settings = configResponse.data.game
        
        // 获取随机关卡组合
        const levelsResponse = await levelAPI.getRandomLevels({
          count: this.settings.total_levels,
          difficulty: 'mixed'
        })
        
        this.gameLevels = levelsResponse.data.map(level => ({
          image: level.image_url,
          points: level.points.map(point => ({
            x: parseFloat(point.x),
            y: parseFloat(point.y),
            width: parseFloat(point.width),
            height: parseFloat(point.height),
            title: point.highlight_title,
            detail: point.highlight_detail,
            connectionType: point.connection_type
          }))
        }))
        
      } catch (error) {
        console.error('加载游戏数据失败:', error)
        // 回退到本地数据
        this.useAPI = false
        this.loadLocalGameData()
      }
    }
  }
}
```

## 📊 配置管理

### 环境配置

在项目根目录创建 `.env.development` 和 `.env.production`:

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_KEY=findguard-api-key-2024
VITE_USE_API=true

# .env.production
VITE_API_BASE_URL=https://your-domain.com/api
VITE_API_KEY=your-production-api-key
VITE_USE_API=true
```

### 更新API配置

```javascript
// src/api/index.js 更新
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const API_KEY = import.meta.env.VITE_API_KEY || 'findguard-api-key-2024'
const USE_API = import.meta.env.VITE_USE_API === 'true'

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
}
```

## 🚀 部署和测试

### 1. 本地测试

确保后台服务运行在 `http://localhost:4000`:

```bash
# 启动后台服务（假设使用Node.js）
cd backend
npm start

# 启动前端开发服务器
cd frontend-web01
npm run dev
```

### 2. API连接测试

创建测试脚本验证API连接：

```javascript
// tests/api-test.js
import { systemAPI, levelAPI } from '@/api/index.js'

async function testAPIConnection() {
  try {
    console.log('测试系统配置API...')
    const config = await systemAPI.getConfig()
    console.log('✓ 系统配置获取成功:', config.data)
    
    console.log('测试关卡列表API...')
    const levels = await levelAPI.getList({ size: 5 })
    console.log('✓ 关卡列表获取成功:', levels.data.items.length, '个关卡')
    
    console.log('🎉 所有API测试通过！')
  } catch (error) {
    console.error('❌ API测试失败:', error)
  }
}

// 在浏览器控制台中执行
testAPIConnection()
```

### 3. 功能测试清单

**数据管理测试:**
- [ ] 系统统计数据正确显示
- [ ] 数据导出功能正常
- [ ] 数据导入功能正常
- [ ] 备份创建和恢复正常

**图片管理测试:**
- [ ] 图片上传功能正常
- [ ] 关卡创建功能正常
- [ ] 警示点编辑功能正常
- [ ] 关卡删除功能正常

**游戏界面测试:**
- [ ] 关卡数据从API加载
- [ ] 警示点显示正确
- [ ] 游戏逻辑正常运行

## 🔍 故障排除

### 常见问题解决

**1. CORS错误**
```javascript
// 后台需要配置CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
```

**2. API Key验证失败**
```javascript
// 检查请求头
console.log('API Key:', 'findguard-api-key-2024')
// 确保后台验证逻辑正确
```

**3. 数据格式不匹配**
```javascript
// 检查API响应格式
console.log('API Response:', response.data)
// 确认与文档中的格式一致
```

### 调试工具

```javascript
// 开启API调试模式
window.FINDGUARD_DEBUG = true

// 监听所有API请求
window.addEventListener('beforeunload', () => {
  console.log('API请求统计:', window.apiStats)
})
```

## 📝 后续优化建议

### 1. 性能优化
- 实现数据缓存机制
- 添加请求防抖
- 优化图片加载策略

### 2. 用户体验
- 添加加载状态指示
- 实现离线模式支持
- 增加操作确认对话框

### 3. 错误处理
- 完善错误提示信息
- 添加重试机制
- 实现错误上报

### 4. 安全性
- 实现Token认证
- 添加请求签名
- 敏感数据加密

---

**版本**: v1.0  
**更新时间**: 2024-01-01  
**文档维护**: FindGuard 开发团队
