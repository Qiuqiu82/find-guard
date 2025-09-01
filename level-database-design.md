# 找茬游戏关卡管理轻量级数据库设计

## 设计理念

基于当前前端实现，设计一个轻量级的关卡管理数据库，专注于：
- 图片文件管理
- 警示点数据存储
- 关卡信息管理
- 简化的用户进度跟踪

## 核心表设计

### 1. 关卡表 (levels)
```sql
CREATE TABLE levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL COMMENT '关卡标题',
    description TEXT COMMENT '关卡描述',
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy' COMMENT '难度等级',
    
    -- 图片相关
    original_image_id INT COMMENT '原图ID',
    modified_image_id INT COMMENT '修改图ID',
    
    -- 游戏设置
    time_limit INT DEFAULT 300 COMMENT '时间限制(秒)',
    max_errors INT DEFAULT 5 COMMENT '最大错误次数',
    hint_count INT DEFAULT 3 COMMENT '提示次数',
    
    -- 状态管理
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    order_index INT DEFAULT 0 COMMENT '关卡顺序',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_difficulty (difficulty),
    INDEX idx_status (status),
    INDEX idx_order (order_index)
);
```

### 2. 图片文件表 (images)
```sql
CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL COMMENT '文件名',
    original_name VARCHAR(255) COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size INT NOT NULL COMMENT '文件大小(字节)',
    mime_type VARCHAR(50) COMMENT '文件类型',
    width INT COMMENT '图片宽度',
    height INT COMMENT '图片高度',
    
    -- 图片用途
    image_type ENUM('original', 'modified') COMMENT '图片类型',
    level_id INT COMMENT '关联关卡ID',
    
    -- Base64存储 (轻量级方案)
    base64_data LONGTEXT COMMENT 'Base64编码的图片数据',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_level_id (level_id),
    INDEX idx_image_type (image_type),
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);
```

### 3. 警示点表 (puzzle_points)
```sql
CREATE TABLE puzzle_points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level_id INT NOT NULL COMMENT '关卡ID',
    
    -- 坐标信息
    x_coordinate DECIMAL(8,2) NOT NULL COMMENT 'X坐标',
    y_coordinate DECIMAL(8,2) NOT NULL COMMENT 'Y坐标',
    radius DECIMAL(6,2) DEFAULT 20.0 COMMENT '点击半径',
    
    -- 点的属性
    point_order INT DEFAULT 1 COMMENT '点的序号',
    description VARCHAR(200) COMMENT '差异描述',
    hint_text VARCHAR(300) COMMENT '提示文本',
    
    -- 连接关系
    connection_type ENUM('single', 'chain', 'group') DEFAULT 'single' COMMENT '连接类型',
    group_id VARCHAR(50) COMMENT '分组ID',
    
    -- 状态
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_level_id (level_id),
    INDEX idx_connection_type (connection_type),
    INDEX idx_group_id (group_id),
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);
```

### 4. 用户进度表 (user_progress) - 简化版
```sql
CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_identifier VARCHAR(100) NOT NULL COMMENT '用户标识(可以是IP或简单ID)',
    level_id INT NOT NULL COMMENT '关卡ID',
    
    -- 游戏状态
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    best_time INT COMMENT '最佳完成时间(秒)',
    best_score INT DEFAULT 0 COMMENT '最高得分',
    
    -- 统计信息
    attempts INT DEFAULT 0 COMMENT '尝试次数',
    hints_used INT DEFAULT 0 COMMENT '使用提示次数',
    errors_made INT DEFAULT 0 COMMENT '错误次数',
    
    last_played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    
    UNIQUE KEY unique_user_level (user_identifier, level_id),
    INDEX idx_user_identifier (user_identifier),
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);
```

## 轻量级实现方案

### 方案一：SQLite + Base64图片存储
```typescript
// 技术栈
- 数据库: SQLite (单文件数据库)
- 后端: Node.js + Express + sqlite3
- 图片存储: Base64编码存储在数据库中
- 部署: 单文件部署，无需复杂配置
```

**优点**：
- ✅ 零配置部署
- ✅ 数据库和文件一体化
- ✅ 适合小型项目
- ✅ 备份简单(单个db文件)

**缺点**：
- ⚠️ 图片过多时数据库文件较大
- ⚠️ 并发性能有限

### 方案二：MySQL + 本地文件存储
```typescript
// 技术栈
- 数据库: MySQL
- 后端: Node.js + Express + mysql2
- 图片存储: 本地文件系统
- 部署: Docker容器化部署
```

**优点**：
- ✅ 性能更好
- ✅ 图片文件独立管理
- ✅ 支持更多并发

**缺点**：
- ⚠️ 需要配置MySQL
- ⚠️ 文件和数据库分离管理

## API接口设计

### 1. 关卡管理接口
```typescript
// 获取关卡列表
GET /api/levels
Response: {
  levels: [{
    id: number,
    title: string,
    description: string,
    difficulty: 'easy' | 'medium' | 'hard',
    originalImageUrl: string,
    modifiedImageUrl: string,
    timeLimit: number,
    maxErrors: number,
    hintCount: number,
    puzzlePoints: PuzzlePoint[]
  }]
}

// 获取关卡详情
GET /api/levels/:id
Response: {
  level: LevelDetail,
  puzzlePoints: PuzzlePoint[]
}

// 创建关卡
POST /api/levels
Body: {
  title: string,
  description: string,
  difficulty: string,
  timeLimit: number,
  maxErrors: number,
  hintCount: number
}

// 更新关卡
PUT /api/levels/:id
Body: Partial<Level>

// 删除关卡
DELETE /api/levels/:id
```

### 2. 图片管理接口
```typescript
// 上传图片
POST /api/images/upload
Body: FormData {
  file: File,
  imageType: 'original' | 'modified',
  levelId: number
}
Response: {
  imageId: number,
  imageUrl: string,
  filename: string
}

// 获取图片
GET /api/images/:id
Response: Image file or Base64 data

// 删除图片
DELETE /api/images/:id
```

### 3. 警示点管理接口
```typescript
// 获取关卡的所有警示点
GET /api/levels/:levelId/points
Response: {
  points: PuzzlePoint[]
}

// 创建警示点
POST /api/levels/:levelId/points
Body: {
  x: number,
  y: number,
  radius: number,
  description: string,
  hint: string,
  connectionType: 'single' | 'chain' | 'group',
  groupId?: string
}

// 更新警示点
PUT /api/points/:id
Body: Partial<PuzzlePoint>

// 删除警示点
DELETE /api/points/:id

// 批量更新警示点
PUT /api/levels/:levelId/points
Body: {
  points: PuzzlePoint[]
}
```

## 数据存储优化

### 1. 图片存储策略
```typescript
// 方案A: Base64存储 (轻量级)
interface ImageRecord {
  id: number;
  filename: string;
  base64Data: string; // 直接存储Base64
  levelId: number;
  imageType: 'original' | 'modified';
}

// 方案B: 文件路径存储
interface ImageRecord {
  id: number;
  filename: string;
  filePath: string; // 存储文件路径
  fileSize: number;
  levelId: number;
  imageType: 'original' | 'modified';
}
```

### 2. 警示点存储优化
```typescript
// 坐标数据结构
interface PuzzlePoint {
  id: number;
  levelId: number;
  x: number;
  y: number;
  radius: number;
  order: number;
  description: string;
  hint: string;
  connectionType: 'single' | 'chain' | 'group';
  groupId?: string;
  isActive: boolean;
}

// 可以考虑将同一关卡的点存储为JSON格式
// 减少表连接查询
interface LevelWithPoints {
  id: number;
  title: string;
  puzzlePointsJson: string; // JSON格式存储所有点
}
```

## 轻量级部署方案

### 方案一：SQLite单文件部署
```bash
# 项目结构
game-backend/
├── package.json
├── app.js                 # 主程序
├── database.sqlite        # SQLite数据库文件
├── routes/
│   ├── levels.js
│   ├── images.js
│   └── points.js
└── uploads/              # 图片上传目录(可选)
```

```dockerfile
# Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

### 方案二：Docker Compose部署
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=production
      - DB_PATH=/app/data/game.sqlite

  # 可选：如果使用MySQL
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=game_db
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 推荐实现方案

### 🎯 最佳轻量级方案
```typescript
技术栈：
- 数据库: SQLite
- 后端: Node.js + Express + better-sqlite3
- 图片: Base64存储在数据库中 (小于1MB的图片)
- 部署: 单个可执行文件或Docker容器

特点：
✅ 零配置启动
✅ 数据库自动创建
✅ 支持图片预览和编辑
✅ 一键备份(复制db文件)
✅ 适合演示和小型项目
```

### 📊 数据大小估算
```
单张图片 (800x600, JPEG, 80%质量): ~200KB
Base64编码后: ~270KB
100个关卡 (200张图片): ~54MB
加上元数据和索引: ~60MB数据库文件

结论: 非常适合轻量级部署
```

## 快速开发指南

### 1. 数据库初始化SQL
```sql
-- 创建表的完整SQL脚本
-- (已包含在上面的表设计中)

-- 插入示例数据
INSERT INTO levels (title, description, difficulty, time_limit, max_errors, hint_count, status) 
VALUES 
('新手教程', '学会如何找茬', 'easy', 180, 10, 5, 'published'),
('花园秘密', '花园中隐藏的差异', 'medium', 300, 5, 3, 'published'),
('城市迷宫', '复杂的城市场景', 'hard', 240, 3, 2, 'published');
```

### 2. 核心代码示例
```javascript
// Express路由示例
const express = require('express');
const Database = require('better-sqlite3');
const multer = require('multer');

const db = new Database('game.sqlite');
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

// 获取关卡列表
app.get('/api/levels', (req, res) => {
  const levels = db.prepare(`
    SELECT l.*, 
           (SELECT COUNT(*) FROM puzzle_points WHERE level_id = l.id) as point_count
    FROM levels l 
    WHERE status = 'published' 
    ORDER BY order_index
  `).all();
  
  res.json({ levels });
});

// 上传图片
app.post('/api/images/upload', upload.single('file'), (req, res) => {
  const { levelId, imageType } = req.body;
  const file = req.file;
  
  // 转换为Base64
  const base64Data = file.buffer.toString('base64');
  
  const result = db.prepare(`
    INSERT INTO images (filename, original_name, file_size, mime_type, 
                       image_type, level_id, base64_data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    `${Date.now()}_${file.originalname}`,
    file.originalname,
    file.size,
    file.mimetype,
    imageType,
    levelId,
    base64Data
  );
  
  res.json({ 
    imageId: result.lastInsertRowid,
    imageUrl: `/api/images/${result.lastInsertRowid}`
  });
});
```

这个轻量级设计方案专注于核心功能，易于部署和维护，非常适合您的找茬游戏项目！
