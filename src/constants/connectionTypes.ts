/**
 * 连接线类型常量和选项
 * 单一选项源，避免重复定义
 */

import type { ConnectionType } from '../types/puzzle'

// 默认连接线类型
export const DEFAULT_CONNECTION_TYPE: ConnectionType = 'right'

// 所有有效的连接线类型
export const VALID_CONNECTION_TYPES: ConnectionType[] = ['right', 'left', 'vertical-horizontal', 'none', 'horizontal']

// UI选择器选项（唯一权威源）
export const CONNECTION_TYPE_OPTIONS = [
  { label: '右侧连接线', value: 'right' as ConnectionType },
  { label: '左侧连接线', value: 'left' as ConnectionType },
  { label: '折线（先竖后横）', value: 'vertical-horizontal' as ConnectionType },
  { label: '水平线', value: 'horizontal' as ConnectionType },
  { label: '无连接线', value: 'none' as ConnectionType }
]

/**
 * 检查连接线类型是否有效
 * @param type 要检查的类型
 * @returns 是否有效
 */
export function isValidConnectionType(type: any): type is ConnectionType {
  return VALID_CONNECTION_TYPES.includes(type)
}

/**
 * 获取连接线类型的显示名称
 * @param type 连接线类型
 * @returns 显示名称
 */
export function getConnectionTypeLabel(type: ConnectionType): string {
  const option = CONNECTION_TYPE_OPTIONS.find(opt => opt.value === type)
  return option?.label ?? '未知类型'
}