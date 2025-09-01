# 找茬游戏后台系统需求文档

## 项目概述

这是一个基于Vue3的找茬游戏项目，目前前端功能基本完成，需要构建相应的后台系统来替代当前的localStorage存储方案。

### 当前技术栈
- **前端**: Vue 3 + TypeScript + Element Plus + Pinia
- **存储**: localStorage (需要替换为后台数据库)
- **路由**: Vue Router

## 核心业务功能

### 1. 用户系统
- **用户注册/登录**: 支持邮箱或用户名登录
- **用户等级系统**: 根据完成关卡数量和得分自动升级
- **用户统计**: 记录总游戏时间、完成关卡数、最高分等
- **排行榜**: 全服排行榜，按得分/通关速度排序

### 2. 游戏关卡管理
- **关卡数据**: 存储图片、找茬点坐标、提示信息等
- **难度分级**: 简单/中等/困难三个级别
- **关卡解锁**: 按顺序解锁，需要完成前置关卡
- **自定义关卡**: 用户可以创建和分享自定义关卡

### 3. 游戏进度系统
- **存档功能**: 保存用户当前游戏进度
- **成就系统**: 各种游戏成就，如"连击大师"、"火眼金睛"等
- **统计数据**: 每关最佳时间、错误次数、使用提示次数等

## 数据库设计需求

### 1. 用户表 (users)
```sql
- id: 主键
- username: 用户名 (唯一)
- email: 邮箱 (唯一)
- password: 密码 (加密存储)
- level: 用户等级
- total_score: 总得分
- total_playtime: 总游戏时间(秒)
- completed_levels: 完成关卡数
- created_at: 注册时间
- updated_at: 更新时间
- avatar_url: 头像链接
- is_active: 账户状态
```

### 2. 关卡表 (game_levels)
```sql
- id: 主键
- title: 关卡标题
- description: 关卡描述
- difficulty: 难度等级 (1=简单, 2=中等, 3=困难)
- original_image_url: 原图链接
- modified_image_url: 修改后图片链接
- puzzle_points: 找茬点数据 (JSON格式)
- time_limit: 时间限制(秒)
- max_errors: 最大错误次数
- hint_count: 提示次数
- creator_id: 创建者ID (可为null，表示官方关卡)
- is_official: 是否官方关卡
- order_index: 关卡顺序
- unlock_requirement: 解锁条件
- created_at: 创建时间
- updated_at: 更新时间
- status: 状态 (active/inactive)
```

### 3. 用户进度表 (user_progress)
```sql
- id: 主键
- user_id: 用户ID
- level_id: 关卡ID
- status: 完成状态 (not_started/in_progress/completed)
- best_time: 最佳完成时间(秒)
- best_score: 最高得分
- error_count: 错误次数
- hint_used: 使用提示次数
- attempts: 尝试次数
- first_completed_at: 首次完成时间
- last_played_at: 最后游戏时间
- created_at: 创建时间
- updated_at: 更新时间
```

### 4. 成就表 (achievements)
```sql
- id: 主键
- name: 成就名称
- description: 成就描述
- icon_url: 成就图标
- condition_type: 条件类型 (score/time/streak/levels等)
- condition_value: 条件数值
- reward_points: 奖励积分
- created_at: 创建时间
```

### 5. 用户成就表 (user_achievements)
```sql
- id: 主键
- user_id: 用户ID
- achievement_id: 成就ID
- achieved_at: 获得时间
- created_at: 创建时间
```

### 6. 游戏记录表 (game_sessions)
```sql
- id: 主键
- user_id: 用户ID
- level_id: 关卡ID
- start_time: 开始时间
- end_time: 结束时间
- final_score: 最终得分
- completion_time: 完成时间(秒)
- errors_made: 错误次数
- hints_used: 使用提示次数
- status: 游戏状态 (completed/abandoned/failed)
- created_at: 创建时间
```

### 7. 文件存储表 (file_storage)
```sql
- id: 主键
- filename: 文件名
- original_name: 原始文件名
- file_path: 文件路径
- file_size: 文件大小
- mime_type: 文件类型
- uploader_id: 上传者ID
- usage_type: 使用类型 (level_image/avatar/achievement_icon等)
- created_at: 上传时间
```

## API接口需求

### 1. 用户认证模块
```typescript
// 用户注册
POST /api/auth/register
{
  username: string,
  email: string,
  password: string
}

// 用户登录
POST /api/auth/login
{
  username: string, // 或email
  password: string
}

// 刷新Token
POST /api/auth/refresh
{
  refresh_token: string
}

// 用户信息
GET /api/auth/profile
Authorization: Bearer <token>

// 更新用户信息
PUT /api/auth/profile
{
  username?: string,
  email?: string,
  avatar_url?: string
}
```

### 2. 关卡管理模块
```typescript
// 获取关卡列表
GET /api/levels?difficulty=1&page=1&limit=20

// 获取关卡详情
GET /api/levels/:id

// 创建关卡 (管理员)
POST /api/levels
{
  title: string,
  description: string,
  difficulty: number,
  original_image: File,
  modified_image: File,
  puzzle_points: PuzzlePoint[],
  time_limit: number,
  max_errors: number,
  hint_count: number
}

// 更新关卡
PUT /api/levels/:id

// 删除关卡
DELETE /api/levels/:id

// 用户创建自定义关卡
POST /api/levels/custom
```

### 3. 游戏进度模块
```typescript
// 获取用户进度
GET /api/progress

// 开始游戏
POST /api/game/start
{
  level_id: number
}

// 提交游戏结果
POST /api/game/complete
{
  level_id: number,
  session_id: string,
  completion_time: number,
  final_score: number,
  errors_made: number,
  hints_used: number,
  found_points: number[]
}

// 获取排行榜
GET /api/leaderboard?type=score&limit=50
```

### 4. 成就系统模块
```typescript
// 获取用户成就
GET /api/achievements/user

// 获取所有成就
GET /api/achievements

// 检查成就触发
POST /api/achievements/check
{
  user_id: number,
  action_type: string,
  value: number
}
```

### 5. 文件上传模块
```typescript
// 上传图片
POST /api/upload/image
Content-Type: multipart/form-data
{
  file: File,
  usage_type: string
}

// 获取文件
GET /api/files/:filename
```

## 技术要求

### 1. 后端技术栈建议
- **Node.js + Express** 或 **Python + FastAPI** 或 **Java + Spring Boot**
- **数据库**: MySQL 8.0+ 或 PostgreSQL 13+
- **缓存**: Redis (用于session、排行榜缓存)
- **文件存储**: 本地存储 或 阿里云OSS/AWS S3
- **认证**: JWT Token
- **API文档**: Swagger/OpenAPI

### 2. 安全要求
- **密码加密**: 使用bcrypt等安全哈希算法
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 输入验证和输出编码
- **CSRF防护**: 实现CSRF Token
- **文件上传安全**: 文件类型验证、大小限制、病毒扫描
- **API限流**: 防止暴力破解和DDoS攻击

### 3. 性能要求
- **响应时间**: API响应时间 < 200ms
- **并发处理**: 支持至少1000并发用户
- **数据库优化**: 适当的索引设计
- **缓存策略**: 热点数据缓存
- **CDN**: 静态资源使用CDN加速

## 数据迁移计划

### 1. 现有数据结构
当前localStorage存储的数据格式：
```typescript
interface GameData {
  levels: GameLevel[]
  userProgress: UserProgress
  settings: GameSettings
}

interface GameLevel {
  id: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  originalImage: string
  modifiedImage: string
  puzzlePoints: PuzzlePoint[]
  timeLimit: number
  maxErrors: number
  hintCount: number
}

interface PuzzlePoint {
  id: number
  x: number
  y: number
  radius: number
  description: string
  connectionType: 'single' | 'chain' | 'group'
  hint: string
}
```

### 2. 迁移步骤
1. **数据导出**: 从localStorage导出现有关卡数据
2. **数据转换**: 将前端数据格式转换为数据库格式
3. **批量导入**: 将转换后的数据导入数据库
4. **数据验证**: 验证导入数据的完整性和正确性

## 部署要求

### 1. 开发环境
- **Docker**: 提供完整的开发环境Docker配置
- **数据库**: 本地MySQL/PostgreSQL实例
- **Redis**: 本地Redis实例
- **文档**: 详细的本地开发搭建文档

### 2. 生产环境
- **负载均衡**: 支持多实例部署
- **数据备份**: 自动化数据库备份策略
- **监控告警**: 系统监控和告警机制
- **日志管理**: 结构化日志记录和分析
- **SSL证书**: HTTPS加密传输

## 项目时间规划

### 第一阶段 (2周)
- [ ] 数据库设计和创建
- [ ] 基础用户认证系统
- [ ] 关卡数据API (CRUD)
- [ ] 文件上传功能

### 第二阶段 (2周)
- [ ] 游戏进度系统
- [ ] 排行榜功能
- [ ] 成就系统基础版
- [ ] 数据迁移工具

### 第三阶段 (1周)
- [ ] 性能优化
- [ ] 安全加固
- [ ] API文档完善
- [ ] 部署配置

## 验收标准

### 1. 功能验收
- [ ] 所有API接口正常工作
- [ ] 前后端数据交互无误
- [ ] 用户注册登录流程完整
- [ ] 游戏数据正确保存和读取
- [ ] 文件上传下载正常

### 2. 性能验收
- [ ] API响应时间符合要求
- [ ] 并发压力测试通过
- [ ] 数据库查询性能优化
- [ ] 缓存命中率 > 80%

### 3. 安全验收
- [ ] 通过基础安全扫描
- [ ] 密码加密强度符合标准
- [ ] 文件上传安全检查
- [ ] API访问权限控制正确

## 联系方式

如有任何问题或需要澄清的地方，请及时沟通。

---

**备注**: 本文档基于当前前端实现编写，如有遗漏或需要调整的地方，请在开发过程中及时反馈和更新。
