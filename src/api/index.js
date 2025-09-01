/**
 * FindGuard API 服务模块
 * 统一管理所有后台接口请求
 * 使用 axios 处理 HTTP 请求和跨域问题
 */

import axiosInstance, { get, post, put, del, upload, testCORS } from '@/utils/axios.js'

// ===================
// 系统管理接口
// ===================

/**
 * 获取系统统计信息
 */
export const getSystemStats = () => {
  return get('/system/stats')
}

/**
 * 测试 API 连接
 */
export const testConnection = () => {
  return get('/test')
}

/**
 * 测试 CORS 配置
 */
export const testCORSConnection = testCORS

// ===================
// 关卡管理接口
// ===================

/**
 * 获取关卡列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.category - 分类筛选
 * @param {string} params.difficulty - 难度筛选
 * @param {string} params.type - 类型筛选
 * @param {string} params.search - 搜索关键词
 */
export const getLevels = (params = {}) => {
  return get('/levels', params)
}

/**
 * 获取单个关卡详情
 * @param {number} id - 关卡ID
 */
export const getLevel = (id) => {
  return get(`/levels/${id}`)
}

/**
 * 创建新关卡
 * @param {Object} levelData - 关卡数据
 */
export const createLevel = (levelData) => {
  return post('/levels', levelData)
}

/**
 * 更新关卡
 * @param {number} id - 关卡ID
 * @param {Object} levelData - 关卡数据
 */
export const updateLevel = (id, levelData) => {
  return put(`/levels/${id}`, levelData)
}

/**
 * 删除关卡
 * @param {number} id - 关卡ID
 */
export const deleteLevel = (id) => {
  return del(`/levels/${id}`)
}

/**
 * 批量删除关卡
 * @param {number[]} ids - 关卡ID数组
 */
export const batchDeleteLevels = (ids) => {
  return post('/levels/batch-delete', { ids })
}

/**
 * 更新关卡状态
 * @param {number} id - 关卡ID
 * @param {string} status - 状态 (active/inactive)
 */
export const updateLevelStatus = (id, status) => {
  return put(`/levels/${id}/status`, { status })
}

// ===================
// 图片管理接口
// ===================

/**
 * 上传图片
 * @param {File} file - 图片文件
 * @param {Function} onProgress - 上传进度回调
 */
export const uploadImage = (file, onProgress) => {
  return upload('/images/upload', file, onProgress)
}

/**
 * 获取图片列表
 * @param {Object} params - 查询参数
 */
export const getImages = (params = {}) => {
  return get('/images', params)
}

/**
 * 获取图片信息
 * @param {number} id - 图片ID
 */
export const getImageInfo = (id) => {
  return get(`/images/${id}`)
}

/**
 * 删除图片
 * @param {number} id - 图片ID
 */
export const deleteImage = (id) => {
  return del(`/images/${id}`)
}

/**
 * 批量删除图片
 * @param {number[]} ids - 图片ID数组
 */
export const batchDeleteImages = (ids) => {
  return post('/images/batch-delete', { ids })
}

// ===================
// 警示点管理接口
// ===================

/**
 * 获取警示点列表
 * @param {number} levelId - 关卡ID
 */
export const getWarningPoints = (levelId) => {
  return get(`/levels/${levelId}/warning-points`)
}

/**
 * 创建警示点
 * @param {number} levelId - 关卡ID
 * @param {Object} pointData - 警示点数据
 */
export const createWarningPoint = (levelId, pointData) => {
  return post(`/levels/${levelId}/warning-points`, pointData)
}

/**
 * 更新警示点
 * @param {number} levelId - 关卡ID
 * @param {number} pointId - 警示点ID
 * @param {Object} pointData - 警示点数据
 */
export const updateWarningPoint = (levelId, pointId, pointData) => {
  return put(`/levels/${levelId}/warning-points/${pointId}`, pointData)
}

/**
 * 删除警示点
 * @param {number} levelId - 关卡ID
 * @param {number} pointId - 警示点ID
 */
export const deleteWarningPoint = (levelId, pointId) => {
  return del(`/levels/${levelId}/warning-points/${pointId}`)
}

/**
 * 批量更新警示点
 * @param {number} levelId - 关卡ID
 * @param {Object[]} points - 警示点数组
 */
export const batchUpdateWarningPoints = (levelId, points) => {
  return put(`/levels/${levelId}/warning-points/batch`, { points })
}

// ===================
// 数据管理接口
// ===================

/**
 * 导出数据
 * @param {Object} options - 导出选项
 * @param {string} options.format - 导出格式 (json/sql)
 * @param {string[]} options.tables - 要导出的表
 * @param {Object} options.filters - 筛选条件
 */
export const exportData = (options) => {
  return post('/data/export', options)
}

/**
 * 导入数据
 * @param {Object} data - 导入数据
 * @param {string} format - 数据格式
 */
export const importData = (data, format) => {
  return post('/data/import', { data, format })
}

/**
 * 验证导入数据
 * @param {Object} data - 要验证的数据
 * @param {string} format - 数据格式
 */
export const validateImportData = (data, format) => {
  return post('/data/validate', { data, format })
}

/**
 * 获取备份列表
 */
export const getBackups = () => {
  return get('/data/backups')
}

/**
 * 创建备份
 * @param {Object} options - 备份选项
 */
export const createBackup = (options = {}) => {
  return post('/data/backup', options)
}

/**
 * 恢复备份
 * @param {string} backupId - 备份ID
 */
export const restoreBackup = (backupId) => {
  return post(`/data/restore/${backupId}`)
}

/**
 * 下载备份
 * @param {string} backupId - 备份ID
 */
export const downloadBackup = (backupId) => {
  return get(`/data/backups/${backupId}/download`)
}

/**
 * 删除备份
 * @param {string} backupId - 备份ID
 */
export const deleteBackup = (backupId) => {
  return del(`/data/backups/${backupId}`)
}

// ===================
// 分类管理接口
// ===================

/**
 * 获取分类列表
 */
export const getCategories = () => {
  return get('/categories')
}

/**
 * 创建分类
 * @param {Object} categoryData - 分类数据
 */
export const createCategory = (categoryData) => {
  return post('/categories', categoryData)
}

/**
 * 更新分类
 * @param {number} id - 分类ID
 * @param {Object} categoryData - 分类数据
 */
export const updateCategory = (id, categoryData) => {
  return put(`/categories/${id}`, categoryData)
}

/**
 * 删除分类
 * @param {number} id - 分类ID
 */
export const deleteCategory = (id) => {
  return del(`/categories/${id}`)
}

// ===================
// API 对象封装
// ===================

/**
 * 系统管理 API 对象
 */
export const systemAPI = {
  getStats: getSystemStats,
  getConfig: () => get('/system/config'),
  updateConfig: (config) => put('/system/config', config),
  testConnection: testConnection,
  testCORS: testCORSConnection
}

/**
 * 分类管理 API 对象
 */
export const categoryAPI = {
  getAll: getCategories,
  create: createCategory,
  update: updateCategory,
  delete: deleteCategory
}

/**
 * 关卡管理 API 对象
 */
export const levelAPI = {
  getAll: getLevels,
  getList: getLevels,
  getById: getLevel,
  getDetail: getLevel,
  create: createLevel,
  update: updateLevel,
  delete: deleteLevel,
  getRandomLevels: (params) => get('/game/random-levels', params)
}

/**
 * 图片管理 API 对象
 */
export const imageAPI = {
  upload: uploadImage,
  delete: deleteImage,
  getInfo: getImageInfo
}

/**
 * 文件管理 API 对象
 */
export const fileAPI = {
  upload: uploadImage,  // 复用图片上传功能
  delete: deleteImage,  // 复用图片删除功能
  getInfo: getImageInfo // 复用图片信息获取功能
}

/**
 * 点位管理 API 对象
 */
export const pointAPI = {
  getAll: getWarningPoints,
  create: createWarningPoint,
  update: updateWarningPoint,
  delete: deleteWarningPoint,
  batchUpdate: batchUpdateWarningPoints
}

/**
 * 数据管理 API 对象
 */
export const dataAPI = {
  export: exportData,
  import: importData,
  getProgress: getImportProgress,
  validate: (data) => post('/data/validate', data),
  download: (filename) => `/api/data/download/${filename}`
}

/**
 * 备份管理 API 对象
 */
export const backupAPI = {
  getAll: getBackups,
  getList: getBackups,
  create: createBackup,
  restore: restoreBackup,
  delete: deleteBackup,
  download: (backupId) => `/api/data/backups/${backupId}/download`
}

/**
 * 错误处理工具函数
 */
export const handleAPIError = (error) => {
  console.error('API 请求错误:', error)
  if (error.response) {
    return error.response.data?.message || '服务器错误'
  } else if (error.request) {
    return '网络连接错误'
  } else {
    return error.message || '未知错误'
  }
}



// ===================
// API 测试工具
// ===================

/**
 * FindGuard API 测试工具
 * 用于快速测试各个接口功能
 */
export const FindGuardAPITest = {
  /**
   * 快速测试 - 测试基本连接和主要功能
   */
  async quick() {
    console.log('🧪 FindGuard API 快速测试开始...')
    console.log('='.repeat(50))
    
    try {
      // 1. 测试连接
      console.log('1️⃣ 测试 API 连接...')
      await testConnection()
      console.log('✅ API 连接正常')
      
      // 2. 测试 CORS
      console.log('2️⃣ 测试 CORS 配置...')
      await testCORSConnection()
      console.log('✅ CORS 配置正常')
      
      // 3. 获取系统统计
      console.log('3️⃣ 获取系统统计...')
      const stats = await getSystemStats()
      console.log('✅ 系统统计:', stats.data)
      
      // 4. 获取关卡列表
      console.log('4️⃣ 获取关卡列表...')
      const levels = await levelAPI.getAll({ page: 1, limit: 5 })
      console.log('✅ 关卡数据:', levels.data)
      
      // 5. 获取分类列表
      console.log('5️⃣ 获取分类列表...')
      const categories = await categoryAPI.getAll()
      console.log('✅ 分类数据:', categories.data)
      
      console.log('='.repeat(50))
      console.log('🎉 所有测试通过！API 工作正常')
      return true
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message)
      console.log('🔧 请检查：')
      console.log('1. 后台服务是否启动 (http://localhost:4000)')
      console.log('2. 数据库连接是否正常')
      console.log('3. 网络连接是否正常')
      console.log('4. CORS 配置是否正确')
      return false
    }
  },
  
  /**
   * 详细测试 - 测试所有接口功能
   */
  async detailed() {
    console.log('🧪 FindGuard API 详细测试开始...')
    console.log('='.repeat(50))
    
    const results = {
      connection: false,
      system: false,
      levels: false,
      images: false,
      categories: false,
      data: false
    }
    
    try {
      // 基础连接测试
      console.log('📡 测试基础连接...')
      await testConnection()
      await testCORSConnection()
      results.connection = true
      console.log('✅ 连接测试通过')
      
      // 系统接口测试
      console.log('📊 测试系统接口...')
      await getSystemStats()
      results.system = true
      console.log('✅ 系统接口测试通过')
      
      // 关卡接口测试
      console.log('🎮 测试关卡接口...')
      await levelAPI.getAll()
      results.levels = true
      console.log('✅ 关卡接口测试通过')
      
      // 图片接口测试
      console.log('🖼️ 测试图片接口...')
      await getImages()
      results.images = true
      console.log('✅ 图片接口测试通过')
      
      // 分类接口测试
      console.log('📂 测试分类接口...')
      await categoryAPI.getAll()
      results.categories = true
      console.log('✅ 分类接口测试通过')
      
      // 数据管理接口测试
      console.log('💾 测试数据管理接口...')
      await backupAPI.getAll()
      results.data = true
      console.log('✅ 数据管理接口测试通过')
      
      console.log('='.repeat(50))
      console.log('🎉 详细测试完成！')
      console.log('📋 测试结果:', results)
      
      const passedCount = Object.values(results).filter(Boolean).length
      const totalCount = Object.keys(results).length
      console.log(`📈 通过率: ${passedCount}/${totalCount} (${Math.round(passedCount/totalCount*100)}%)`)
      
      return results
      
    } catch (error) {
      console.error('❌ 详细测试失败:', error.message)
      console.log('📋 测试结果:', results)
      return results
    }
  }
}

// ===================
// 工具函数
// ===================

/**
 * 生成唯一的关卡ID
 * @returns {string} 关卡ID
 */
export const generateLevelId = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `level_${timestamp}_${random}`
}

/**
 * 生成唯一的点位ID
 * @returns {string} 点位ID
 */
export const generatePointId = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `point_${timestamp}_${random}`
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 在开发环境下自动将测试工具添加到全局
if (import.meta.env.DEV) {
  window.FindGuardAPITest = FindGuardAPITest
  console.log('🛠️ API 测试工具已注册到全局: window.FindGuardAPITest')
  console.log('💡 快速测试: FindGuardAPITest.quick()')
  console.log('💡 详细测试: FindGuardAPITest.detailed()')
}