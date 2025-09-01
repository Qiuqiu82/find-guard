/**
 * 数据迁移工具
 * 只做一次性映射：旧结构 -> 新结构，避免双模型转换
 */

import type { GameLevel, PuzzlePoint, GameSettings, GameBundle } from '../types/puzzle'
import { DEFAULT_CONNECTION_TYPE, isValidConnectionType } from '../constants/connectionTypes'

/**
 * 数值夹逼：将值限制在指定范围内
 * @param value 原始值
 * @param min 最小值
 * @param max 最大值
 * @returns 夹逼后的值
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 安全取值：空值合并，只在 null/undefined 时回退，保留 0
 * @param value 原始值
 * @param fallback 回退值
 * @returns 安全值
 */
function safeValue<T>(value: T | null | undefined, fallback: T): T {
  return value ?? fallback
}

/**
 * 越界修正：确保 x+width <= 1, y+height <= 1
 * @param x 起始坐标
 * @param size 尺寸
 * @returns 修正后的坐标和尺寸
 */
function boundaryFix(x: number, size: number): { x: number; size: number } {
  if (x + size > 1) {
    if (size > 1) {
      // 尺寸超过1，将其压缩到1并重置x为0
      return { x: 0, size: 1 }
    } else {
      // 向内回收
      return { x: 1 - size, size }
    }
  }
  return { x, size }
}

/**
 * 迁移旧的WarningPoint数据到PuzzlePoint
 * @param oldPoint 旧的WarningPoint数据
 * @returns 新的PuzzlePoint数据
 */
export function migrateWarningPoint(oldPoint: any): PuzzlePoint {
  // 数值夹逼与越界修正
  const rawX = clamp(safeValue(oldPoint.x, 0), 0, 1)
  const rawY = clamp(safeValue(oldPoint.y, 0), 0, 1)
  const rawWidth = clamp(safeValue(oldPoint.width, 0.1), 0.01, 1)
  const rawHeight = clamp(safeValue(oldPoint.height, 0.1), 0.01, 1)
  
  const { x, size: width } = boundaryFix(rawX, rawWidth)
  const { x: y, size: height } = boundaryFix(rawY, rawHeight)
  
  // 连接线合法化
  const oldConnectionType = oldPoint.connectionType ?? oldPoint.pointLineType
  const connectionType = isValidConnectionType(oldConnectionType) 
    ? oldConnectionType 
    : DEFAULT_CONNECTION_TYPE
  
  return {
    x: Math.round(x * 10000) / 10000, // 去抖浮点
    y: Math.round(y * 10000) / 10000,
    width: Math.round(width * 10000) / 10000,
    height: Math.round(height * 10000) / 10000,
    highlightTitle: safeValue(oldPoint.title ?? oldPoint.highlightTitle, '未命名'),
    highlightDetail: safeValue(oldPoint.description ?? oldPoint.highlightDetail, '请输入详细说明'),
    connectionType,
    found: safeValue(oldPoint.found, false)
  }
}

/**
 * 迁移旧的GameImage数据到GameLevel
 * @param oldImage 旧的GameImage数据
 * @returns 新的GameLevel数据
 */
export function migrateGameImage(oldImage: any): GameLevel {
  return {
    image: safeValue(oldImage.url ?? oldImage.image, ''),
    points: (oldImage.warningPoints ?? oldImage.points ?? []).map(migrateWarningPoint),
    name: safeValue(oldImage.name, `图片${Date.now()}`),
    isPreset: safeValue(oldImage.isPreset, false)
  }
}

/**
 * 迁移游戏设置
 * @param oldSettings 旧设置数据
 * @returns 新设置数据
 */
export function migrateGameSettings(oldSettings: any): GameSettings {
  return {
    totalLevels: Math.max(1, safeValue(oldSettings?.totalLevels, 1)),
    countdownSeconds: Math.max(1, safeValue(oldSettings?.countdownSeconds, 30)),
    flashThreshold: Math.max(1, safeValue(oldSettings?.flashThreshold, 10))
  }
}

/**
 * 批量迁移旧数据（一次性映射）
 * @param oldData 旧数据
 * @returns 新数据Bundle
 */
export function migrateData(oldData: any): GameBundle {
  let levels: GameLevel[] = []
  let settings: GameSettings
  
  if (oldData.levels && Array.isArray(oldData.levels)) {
    // 已经是新格式，但仍需要合法化
    levels = oldData.levels.map((level: any) => ({
      image: safeValue(level.image, ''),
      points: (level.points ?? []).map(migrateWarningPoint),
      name: safeValue(level.name, `关卡${Date.now()}`),
      isPreset: safeValue(level.isPreset, false)
    }))
  } else if (oldData.images && Array.isArray(oldData.images)) {
    // 旧格式，需要迁移
    levels = oldData.images.map(migrateGameImage)
  }
  
  settings = migrateGameSettings(oldData.settings)
  
  // 设置合法化：totalLevels 不应超过实际关卡数
  if (settings.totalLevels > levels.length && levels.length > 0) {
    settings.totalLevels = levels.length
  }
  
  return {
    version: '2.0',
    settings,
    levels,
    exportTime: new Date().toISOString()
  }
}
