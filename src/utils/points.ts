/**
 * 点位操作工具函数
 * 纯函数，不改入参，统一合法化处理
 */

import type { GameLevel, PuzzlePoint } from '../types/puzzle'
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
 * 去抖浮点：适度四舍五入减少抖动
 * @param value 原始值
 * @param precision 精度（小数点后位数）
 * @returns 去抖后的值
 */
function denoiseFloat(value: number, precision: number = 4): number {
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor
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
 * 坐标合法化：统一的坐标和尺寸处理
 * @param x 相对X坐标
 * @param y 相对Y坐标
 * @param width 相对宽度
 * @param height 相对高度
 * @returns 合法化后的坐标
 */
function normalizeCoordinates(
  x: number, 
  y: number, 
  width: number, 
  height: number
): { x: number; y: number; width: number; height: number } {
  // 数值夹逼
  const clampedX = clamp(x, 0, 1)
  const clampedY = clamp(y, 0, 1)
  const clampedWidth = clamp(width, 0.01, 1) // 最小宽度 0.01
  const clampedHeight = clamp(height, 0.01, 1) // 最小高度 0.01
  
  // 越界修正
  const { x: finalX, size: finalWidth } = boundaryFix(clampedX, clampedWidth)
  const { x: finalY, size: finalHeight } = boundaryFix(clampedY, clampedHeight)
  
  return {
    x: denoiseFloat(finalX),
    y: denoiseFloat(finalY),
    width: denoiseFloat(finalWidth),
    height: denoiseFloat(finalHeight)
  }
}

/**
 * 创建新的警示点
 * @param x 相对X坐标 (0-1)
 * @param y 相对Y坐标 (0-1)
 * @param width 相对宽度 (0-1)
 * @param height 相对高度 (0-1)
 * @returns 新的PuzzlePoint
 */
export function createPoint(
  x: number, 
  y: number, 
  width: number, 
  height: number
): PuzzlePoint {
  const coords = normalizeCoordinates(x, y, width, height)
  
  return {
    ...coords,
    highlightTitle: '新警示点',
    highlightDetail: '请输入详细说明',
    connectionType: DEFAULT_CONNECTION_TYPE,
    found: false
  }
}

/**
 * 更新点位信息（纯函数，返回新副本）
 * @param levelIndex 关卡索引
 * @param pointIndex 点位索引
 * @param patch 要更新的字段
 * @param levels 关卡数组
 * @returns 更新后的关卡数组副本
 */
export function updatePoint(
  levelIndex: number,
  pointIndex: number,
  patch: Partial<PuzzlePoint>,
  levels: GameLevel[]
): GameLevel[] {
  if (levelIndex < 0 || levelIndex >= levels.length) {
    throw new Error(`Invalid level index: ${levelIndex}`)
  }
  
  if (pointIndex < 0 || pointIndex >= levels[levelIndex].points.length) {
    throw new Error(`Invalid point index: ${pointIndex}`)
  }
  
  const newLevels = [...levels]
  const newPoints = [...newLevels[levelIndex].points]
  const currentPoint = newPoints[pointIndex]
  
  // 处理坐标更新（如果有的话）
  const updatedPatch = { ...patch }
  if ('x' in patch || 'y' in patch || 'width' in patch || 'height' in patch) {
    const coords = normalizeCoordinates(
      patch.x ?? currentPoint.x,
      patch.y ?? currentPoint.y,
      patch.width ?? currentPoint.width,
      patch.height ?? currentPoint.height
    )
    Object.assign(updatedPatch, coords)
  }
  
  // 验证connectionType
  if (updatedPatch.connectionType && !isValidConnectionType(updatedPatch.connectionType)) {
    updatedPatch.connectionType = DEFAULT_CONNECTION_TYPE
  }
  
  newPoints[pointIndex] = { ...currentPoint, ...updatedPatch }
  newLevels[levelIndex] = { ...newLevels[levelIndex], points: newPoints }
  
  return newLevels
}

/**
 * 删除点位（纯函数，返回新副本）
 * @param levelIndex 关卡索引
 * @param pointIndex 点位索引
 * @param levels 关卡数组
 * @returns 更新后的关卡数组副本
 */
export function removePoint(
  levelIndex: number,
  pointIndex: number,
  levels: GameLevel[]
): GameLevel[] {
  if (levelIndex < 0 || levelIndex >= levels.length) {
    throw new Error(`Invalid level index: ${levelIndex}`)
  }
  
  if (pointIndex < 0 || pointIndex >= levels[levelIndex].points.length) {
    throw new Error(`Invalid point index: ${pointIndex}`)
  }
  
  const newLevels = [...levels]
  const newPoints = [...newLevels[levelIndex].points]
  newPoints.splice(pointIndex, 1)
  newLevels[levelIndex] = { ...newLevels[levelIndex], points: newPoints }
  
  return newLevels
}

/**
 * 添加新点位到关卡（纯函数，返回新副本）
 * @param levelIndex 关卡索引
 * @param point 新点位
 * @param levels 关卡数组
 * @returns 更新后的关卡数组副本
 */
export function addPoint(
  levelIndex: number,
  point: PuzzlePoint,
  levels: GameLevel[]
): GameLevel[] {
  if (levelIndex < 0 || levelIndex >= levels.length) {
    throw new Error(`Invalid level index: ${levelIndex}`)
  }
  
  // 确保新点位坐标合法
  const normalizedPoint = {
    ...point,
    ...normalizeCoordinates(point.x, point.y, point.width, point.height),
    connectionType: isValidConnectionType(point.connectionType) 
      ? point.connectionType 
      : DEFAULT_CONNECTION_TYPE
  }
  
  const newLevels = [...levels]
  const newPoints = [...newLevels[levelIndex].points, normalizedPoint]
  newLevels[levelIndex] = { ...newLevels[levelIndex], points: newPoints }
  
  return newLevels
}

/**
 * 验证点位坐标是否有效
 * @param point 点位
 * @returns 是否有效
 */
export function isValidPoint(point: PuzzlePoint): boolean {
  return (
    point.x >= 0 && point.x <= 1 &&
    point.y >= 0 && point.y <= 1 &&
    point.width > 0 && point.width <= 1 &&
    point.height > 0 && point.height <= 1 &&
    point.x + point.width <= 1 &&
    point.y + point.height <= 1 &&
    isValidConnectionType(point.connectionType)
  )
}

/**
 * 将像素坐标转换为相对坐标（安全版本）
 * @param pixelX 像素X坐标
 * @param pixelY 像素Y坐标
 * @param pixelWidth 像素宽度
 * @param pixelHeight 像素高度
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @returns 相对坐标
 */
export function pixelToRelative(
  pixelX: number,
  pixelY: number,
  pixelWidth: number,
  pixelHeight: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number; width: number; height: number } {
  // 防止除零
  const safeContainerWidth = containerWidth || 1
  const safeContainerHeight = containerHeight || 1
  
  return normalizeCoordinates(
    pixelX / safeContainerWidth,
    pixelY / safeContainerHeight,
    pixelWidth / safeContainerWidth,
    pixelHeight / safeContainerHeight
  )
}

/**
 * 将相对坐标转换为像素坐标（安全版本）
 * @param relativeX 相对X坐标
 * @param relativeY 相对Y坐标
 * @param relativeWidth 相对宽度
 * @param relativeHeight 相对高度
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @returns 像素坐标
 */
export function relativeToPixel(
  relativeX: number,
  relativeY: number,
  relativeWidth: number,
  relativeHeight: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number; width: number; height: number } {
  // 防止除零
  const safeContainerWidth = containerWidth || 1
  const safeContainerHeight = containerHeight || 1
  
  return {
    x: denoiseFloat(relativeX * safeContainerWidth),
    y: denoiseFloat(relativeY * safeContainerHeight),
    width: denoiseFloat(relativeWidth * safeContainerWidth),
    height: denoiseFloat(relativeHeight * safeContainerHeight)
  }
}
