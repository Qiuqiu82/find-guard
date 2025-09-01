/**
 * 拼图游戏核心类型定义
 * 这是单一真相源，所有组件都从这里导入类型
 */

// 连接线类型（唯一权威定义）
export type ConnectionType = 'right' | 'left' | 'vertical-horizontal' | 'none' | 'horizontal'

// 拼图点位
export interface PuzzlePoint {
  x: number // 坐标或相对坐标
  y: number // 坐标或相对坐标
  width?: number // 相对宽度 0-1（可选）
  height?: number // 相对高度 0-1（可选）
  title?: string // 标题（可选）
  description?: string // 描述（可选）
  highlightTitle?: string // 高亮标题（可选）
  highlightDetail?: string // 高亮详情（可选）
  connectionType: ConnectionType
  found?: boolean // 是否已找到（可选）
}

// 游戏关卡
export interface GameLevel {
  id: string // 关卡ID
  name: string // 关卡名称
  url: string // 图片URL
  image?: string // 兼容旧版本字段
  size: number // 图片大小
  width: number // 图片宽度
  height: number // 图片高度
  warningPoints?: PuzzlePoint[] // 警告点位（新版本）
  points?: PuzzlePoint[] // 点位（兼容旧版本）
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
  isPreset?: boolean // 是否为预置图片
}

// 游戏设置
export interface GameSettings {
  totalLevels: number
  countdownSeconds: number
  flashThreshold: number
}

// 游戏状态
export interface GameState {
  settings: GameSettings
  levels: GameLevel[]
}

// 导入导出数据格式
export interface GameBundle {
  version: string
  settings: GameSettings
  levels: GameLevel[]
  exportTime: string
}

// 工具栏位置
export interface ToolbarPosition {
  x: number
  y: number
}

// 绘制模式
export type DrawMode = 'select' | 'rectangle' | 'move' | 'delete'
