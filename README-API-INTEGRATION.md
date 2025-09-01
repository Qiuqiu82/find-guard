# 🚀 FindGuard API 集成使用说明

## 📋 快速开始

### 1. 启动后台服务

确保后台API服务已启动并运行在 `http://localhost:4000`：

```bash
# 后台服务应该提供以下接口
GET  http://localhost:4000/api/system/config
GET  http://localhost:4000/api/system/stats
GET  http://localhost:4000/api/categories
GET  http://localhost:4000/api/levels
POST http://localhost:4000/api/levels
# ... 其他接口
```

### 2. 前端集成设置

```bash
# 安装依赖（如果还没有）
cd frontend-web01
npm install

# 启动开发服务器
npm run dev
```

### 3. 验证API连接

打开浏览器控制台（F12），运行：

```javascript
// 快速测试API连接
FindGuardAPITest.quick()

// 运行完整API测试
FindGuardAPITest.full()
```

## 🔧 使用新的API集成组件

### 1. 数据管理页面

访问 `/admin/data` 查看新的数据管理功能：

**功能特性:**
- ✅ 实时系统统计（关卡数、警示点数、存储使用量）
- ✅ 数据导出（JSON/SQL格式）
- ✅ 数据导入（支持验证和预览）
- ✅ 备份管理（创建、下载、恢复）

**API对接状态:**
```javascript
// 获取系统统计 - ✅ 已对接
systemAPI.getStats()

// 数据导出 - ✅ 已对接  
dataAPI.export(params)

// 备份管理 - ✅ 已对接
backupAPI.create(options)
```

### 2. 图片管理页面

访问 `/admin/images` 查看新的图片管理功能：

**功能特性:**
- ✅ 图片上传和关卡创建
- ✅ 关卡列表展示和筛选
- ✅ 可视化警示点编辑器
- ✅ 批量操作支持

**API对接状态:**
```javascript
// 文件上传 - ✅ 已对接
fileAPI.upload(file)

// 关卡管理 - ✅ 已对接
levelAPI.create(levelData)
levelAPI.getList(params)
levelAPI.getDetail(id)

// 警示点管理 - ✅ 已对接
pointAPI.createBatch(levelId, points)
pointAPI.update(pointId, data)
```

### 3. 关卡编辑器集成

关卡编辑器已准备好API适配器，可以渐进式集成：

```javascript
// 在现有编辑器中启用API模式
import { createLevelEditorAdapter } from './api-integration.js'

const adapter = createLevelEditorAdapter()
await adapter.initializeEditor()
```

## 📝 API接口对照表

### 已实现的接口映射

| 功能 | 前端方法 | 后台接口 | 状态 |
|------|---------|----------|------|
| 系统配置 | `systemAPI.getConfig()` | `GET /api/system/config` | ✅ |
| 系统统计 | `systemAPI.getStats()` | `GET /api/system/stats` | ✅ |
| 分类列表 | `categoryAPI.getAll()` | `GET /api/categories` | ✅ |
| 关卡列表 | `levelAPI.getList()` | `GET /api/levels` | ✅ |
| 关卡详情 | `levelAPI.getDetail(id)` | `GET /api/levels/{id}` | ✅ |
| 创建关卡 | `levelAPI.create(data)` | `POST /api/levels` | ✅ |
| 关卡警示点 | `pointAPI.getByLevel(id)` | `GET /api/levels/{id}/points` | ✅ |
| 批量创建警示点 | `pointAPI.createBatch(id, points)` | `POST /api/levels/{id}/points` | ✅ |
| 文件上传 | `fileAPI.upload(file)` | `POST /api/files/upload` | ✅ |
| 数据导出 | `dataAPI.export(params)` | `GET /api/data/export` | ✅ |
| 备份管理 | `backupAPI.create()` | `POST /api/backup/create` | ✅ |

## 🎮 游戏界面API集成

### 更新游戏主界面

在 `src/views/home/index.vue` 中添加API支持：

```javascript
// 添加API导入
import { levelAPI, systemAPI } from '@/api/index.js'

export default {
  data() {
    return {
      useAPI: true, // 启用API模式
      // ... 现有数据
    }
  },
  
  async mounted() {
    if (this.useAPI) {
      await this.loadGameDataFromAPI()
    } else {
      this.loadLocalGameData() // 保留原有逻辑
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
        
        // 转换为游戏格式
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

## 🔧 配置选项

### 环境变量配置

创建 `.env.development` 文件：

```bash
# API配置
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_KEY=findguard-api-key-2024
VITE_USE_API=true

# 调试选项
VITE_DEBUG_API=true
VITE_LOG_LEVEL=debug
```

### API模式切换

可以在运行时切换API模式：

```javascript
// 全局启用/禁用API模式
window.FINDGUARD_USE_API = true

// 单个组件切换
this.useAPI = false // 回退到本地模式
```

## 🧪 测试和调试

### 1. API连接测试

```javascript
// 浏览器控制台中运行
FindGuardAPITest.quick()  // 快速测试
FindGuardAPITest.full()   // 完整测试
```

### 2. 常见问题检查

**API连接失败:**
```bash
# 检查后台服务状态
curl http://localhost:4000/api/system/config

# 检查网络请求
# 打开浏览器开发者工具 -> Network 标签
```

**CORS错误:**
```javascript
// 后台需要配置CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
```

**数据格式错误:**
```javascript
// 检查API响应格式
console.log('API Response:', response)
// 确认与接口文档一致
```

### 3. 调试工具

```javascript
// 启用API调试模式
window.FINDGUARD_DEBUG = true

// 查看API请求日志
window.addEventListener('beforeunload', () => {
  console.log('API请求统计:', window.apiRequestStats)
})
```

## 📊 数据流程图

```
用户操作 -> Vue组件 -> API服务模块 -> HTTP请求 -> 后台API
    ↓           ↓           ↓           ↓          ↓
UI更新  <-  状态更新  <-  数据处理  <-  响应解析  <-  数据库操作
```

## 🚨 注意事项

### 1. 数据兼容性

- 新API组件与现有本地数据格式兼容
- 可以随时切换API模式和本地模式
- 数据迁移是渐进式的，不会影响现有功能

### 2. 错误处理

- 所有API调用都有统一的错误处理
- 网络错误时会自动回退到本地模式
- 用户会收到友好的错误提示

### 3. 性能考虑

- API请求有防抖机制
- 大量数据采用分页加载
- 图片资源使用CDN加速

## 📞 技术支持

如遇到集成问题，请：

1. **检查后台服务状态** - 确保API服务正常运行
2. **运行API测试** - 使用 `FindGuardAPITest.full()` 诊断
3. **查看浏览器控制台** - 检查错误信息和网络请求
4. **参考集成指南** - 查看 `api-integration-guide.md`

---

**版本**: v1.0  
**更新时间**: 2024-01-01  
**维护团队**: FindGuard 开发团队
