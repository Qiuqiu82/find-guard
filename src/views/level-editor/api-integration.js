/**
 * 关卡编辑器 API 集成模块
 * 用于将现有的关卡编辑器与后台API进行对接
 */

import { 
  systemAPI, 
  levelAPI, 
  pointAPI, 
  categoryAPI, 
  handleAPIError, 
  generatePointId, 
  generateLevelId 
} from '@/api/index.js'

/**
 * API集成管理器
 */
export class LevelEditorAPIManager {
  constructor() {
    this.currentLevels = []
    this.categories = []
    this.systemConfig = null
    this.isLoading = false
  }

  /**
   * 初始化 - 加载所有必要数据
   */
  async initialize() {
    try {
      this.isLoading = true
      
      // 并行加载数据
      const [systemConfigResponse, categoriesResponse, levelsResponse] = await Promise.all([
        systemAPI.getConfig(),
        categoryAPI.getAll(),
        levelAPI.getList({ size: 100 })
      ])
      
      this.systemConfig = systemConfigResponse.data
      this.categories = categoriesResponse.data
      this.currentLevels = levelsResponse.data.items || []
      
      return {
        success: true,
        data: {
          systemConfig: this.systemConfig,
          categories: this.categories,
          levels: this.currentLevels
        }
      }
    } catch (error) {
      handleAPIError(error, '初始化失败')
      return { success: false, error }
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 转换API数据为编辑器格式
   */
  convertAPILevelsToEditorFormat(apiLevels) {
    return apiLevels.map(level => ({
      id: level.id,
      levelId: level.level_id,
      name: level.name,
      image: level.image_url,
      imageSize: level.image_size,
      imageWidth: level.image_width || 1920,
      imageHeight: level.image_height || 945,
      difficulty: level.difficulty,
      categoryId: level.category_id,
      categoryName: level.category?.name || '未分类',
      isPreset: Boolean(level.is_preset),
      isActive: Boolean(level.is_active),
      sortOrder: level.sort_order || 0,
      points: (level.points || []).map(point => ({
        id: point.id,
        pointId: point.point_id,
        x: parseFloat(point.x),
        y: parseFloat(point.y),
        width: parseFloat(point.width),
        height: parseFloat(point.height),
        title: point.highlight_title,
        detail: point.highlight_detail,
        connectionType: point.connection_type,
        orderIndex: point.order_index || 1
      }))
    }))
  }

  /**
   * 转换编辑器数据为API格式
   */
  convertEditorLevelToAPIFormat(editorLevel) {
    return {
      level_id: editorLevel.levelId || generateLevelId(),
      name: editorLevel.name,
      category_id: editorLevel.categoryId,
      image_url: editorLevel.image,
      image_size: editorLevel.imageSize || 0,
      image_width: editorLevel.imageWidth || 1920,
      image_height: editorLevel.imageHeight || 945,
      difficulty: editorLevel.difficulty || 'medium',
      sort_order: editorLevel.sortOrder || 0
    }
  }

  /**
   * 转换编辑器警示点为API格式
   */
  convertEditorPointsToAPIFormat(editorPoints) {
    return editorPoints.map(point => ({
      point_id: point.pointId || generatePointId(),
      x: point.x,
      y: point.y,
      width: point.width,
      height: point.height,
      highlight_title: point.title,
      highlight_detail: point.detail,
      connection_type: point.connectionType || 'horizontal',
      order_index: point.orderIndex || 1
    }))
  }

  /**
   * 获取系统配置
   */
  getSystemConfig() {
    return this.systemConfig?.game || {
      total_levels: 6,
      countdown_seconds: 30,
      flash_threshold: 10
    }
  }

  /**
   * 获取分类列表
   */
  getCategories() {
    return this.categories
  }

  /**
   * 获取关卡列表（编辑器格式）
   */
  getLevels() {
    return this.convertAPILevelsToEditorFormat(this.currentLevels)
  }

  /**
   * 创建新关卡
   */
  async createLevel(editorLevel) {
    try {
      const apiLevel = this.convertEditorLevelToAPIFormat(editorLevel)
      const response = await levelAPI.create(apiLevel)
      
      // 更新本地数据
      this.currentLevels.push(response.data)
      
      return {
        success: true,
        data: {
          id: response.data.id,
          levelId: response.data.level_id
        }
      }
    } catch (error) {
      handleAPIError(error, '创建关卡失败')
      return { success: false, error }
    }
  }

  /**
   * 更新关卡信息
   */
  async updateLevel(levelId, updateData) {
    try {
      const response = await levelAPI.update(levelId, updateData)
      
      // 更新本地数据
      const index = this.currentLevels.findIndex(level => level.id === levelId)
      if (index !== -1) {
        this.currentLevels[index] = { ...this.currentLevels[index], ...response.data }
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      handleAPIError(error, '更新关卡失败')
      return { success: false, error }
    }
  }

  /**
   * 删除关卡
   */
  async deleteLevel(levelId) {
    try {
      await levelAPI.delete(levelId)
      
      // 从本地数据中移除
      this.currentLevels = this.currentLevels.filter(level => level.id !== levelId)
      
      return { success: true }
    } catch (error) {
      handleAPIError(error, '删除关卡失败')
      return { success: false, error }
    }
  }

  /**
   * 获取关卡详情（包含警示点）
   */
  async getLevelDetail(levelId) {
    try {
      const response = await levelAPI.getDetail(levelId)
      return {
        success: true,
        data: this.convertAPILevelsToEditorFormat([response.data])[0]
      }
    } catch (error) {
      handleAPIError(error, '获取关卡详情失败')
      return { success: false, error }
    }
  }

  /**
   * 批量创建警示点
   */
  async createPoints(levelId, editorPoints) {
    try {
      const apiPoints = this.convertEditorPointsToAPIFormat(editorPoints)
      const response = await pointAPI.createBatch(levelId, apiPoints)
      
      return {
        success: true,
        data: response.data.points
      }
    } catch (error) {
      handleAPIError(error, '创建警示点失败')
      return { success: false, error }
    }
  }

  /**
   * 更新警示点
   */
  async updatePoint(pointId, updateData) {
    try {
      const response = await pointAPI.update(pointId, updateData)
      return { success: true, data: response.data }
    } catch (error) {
      handleAPIError(error, '更新警示点失败')
      return { success: false, error }
    }
  }

  /**
   * 删除警示点
   */
  async deletePoint(pointId) {
    try {
      await pointAPI.delete(pointId)
      return { success: true }
    } catch (error) {
      handleAPIError(error, '删除警示点失败')
      return { success: false, error }
    }
  }

  /**
   * 保存整个关卡（包含警示点）
   */
  async saveLevelWithPoints(editorLevel) {
    try {
      let levelId = editorLevel.id
      
      // 如果是新关卡，先创建关卡
      if (!levelId) {
        const createResult = await this.createLevel(editorLevel)
        if (!createResult.success) {
          return createResult
        }
        levelId = createResult.data.id
      } else {
        // 更新现有关卡
        const updateData = {
          name: editorLevel.name,
          category_id: editorLevel.categoryId,
          difficulty: editorLevel.difficulty,
          sort_order: editorLevel.sortOrder
        }
        
        const updateResult = await this.updateLevel(levelId, updateData)
        if (!updateResult.success) {
          return updateResult
        }
      }
      
      // 处理警示点
      if (editorLevel.points && editorLevel.points.length > 0) {
        // 删除现有警示点（如果需要）
        const currentLevel = this.currentLevels.find(level => level.id === levelId)
        if (currentLevel && currentLevel.points) {
          for (const point of currentLevel.points) {
            await this.deletePoint(point.id)
          }
        }
        
        // 创建新的警示点
        const createPointsResult = await this.createPoints(levelId, editorLevel.points)
        if (!createPointsResult.success) {
          return createPointsResult
        }
      }
      
      return {
        success: true,
        data: { levelId, message: '关卡保存成功' }
      }
    } catch (error) {
      handleAPIError(error, '保存关卡失败')
      return { success: false, error }
    }
  }

  /**
   * 批量保存多个关卡
   */
  async saveLevels(editorLevels) {
    const results = []
    
    for (const level of editorLevels) {
      const result = await this.saveLevelWithPoints(level)
      results.push({
        level: level.name,
        success: result.success,
        error: result.error
      })
    }
    
    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount
    
    if (failCount > 0) {
      console.warn('部分关卡保存失败:', results.filter(r => !r.success))
    }
    
    return {
      success: successCount > 0,
      results,
      summary: `成功保存 ${successCount} 个关卡，失败 ${failCount} 个`
    }
  }

  /**
   * 获取随机关卡组合（用于游戏）
   */
  async getRandomLevels(count = 6, difficulty = 'mixed') {
    try {
      const response = await levelAPI.getRandomLevels({
        count,
        difficulty
      })
      
      return {
        success: true,
        data: this.convertAPILevelsToEditorFormat(response.data)
      }
    } catch (error) {
      handleAPIError(error, '获取随机关卡失败')
      return { success: false, error }
    }
  }

  /**
   * 更新系统配置
   */
  async updateSystemConfig(config) {
    try {
      const response = await systemAPI.updateConfig(config)
      this.systemConfig = response.data
      
      return { success: true, data: response.data }
    } catch (error) {
      handleAPIError(error, '更新系统配置失败')
      return { success: false, error }
    }
  }

  /**
   * 重新加载数据
   */
  async reload() {
    return await this.initialize()
  }
}

/**
 * 创建API管理器实例
 */
export function createAPIManager() {
  return new LevelEditorAPIManager()
}

/**
 * 兼容现有编辑器的适配器
 */
export class LevelEditorAdapter {
  constructor(apiManager) {
    this.apiManager = apiManager
    this.loadingStates = {
      initializing: false,
      saving: false,
      loading: false
    }
  }

  /**
   * 初始化编辑器数据
   */
  async initializeEditor() {
    try {
      this.loadingStates.initializing = true
      
      const result = await this.apiManager.initialize()
      if (!result.success) {
        throw new Error('初始化失败')
      }
      
      return {
        allGameLevels: this.apiManager.getLevels(),
        categories: this.apiManager.getCategories(),
        systemConfig: this.apiManager.getSystemConfig(),
        totalLevels: this.apiManager.getSystemConfig().total_levels
      }
    } finally {
      this.loadingStates.initializing = false
    }
  }

  /**
   * 保存编辑器数据
   */
  async saveEditorData(allGameLevels, settings) {
    try {
      this.loadingStates.saving = true
      
      // 保存关卡数据
      const levelsResult = await this.apiManager.saveLevels(allGameLevels)
      
      // 保存系统配置
      const configResult = await this.apiManager.updateSystemConfig({
        'game.total_levels': settings.totalLevels,
        'game.countdown_seconds': settings.countdownSeconds || 30,
        'game.flash_threshold': settings.flashThreshold || 10
      })
      
      return {
        success: levelsResult.success && configResult.success,
        message: levelsResult.summary,
        details: {
          levels: levelsResult,
          config: configResult
        }
      }
    } finally {
      this.loadingStates.saving = false
    }
  }

  /**
   * 添加新图片
   */
  async addNewImage(imageFile, levelName, categoryId, difficulty = 'medium') {
    try {
      // 这里需要先上传图片，然后创建关卡
      // 由于图片上传在其他组件处理，这里返回一个占位对象
      const newLevel = {
        id: null, // 将在保存时生成
        name: levelName || `新关卡_${Date.now()}`,
        image: URL.createObjectURL(imageFile), // 临时预览URL
        imageSize: imageFile.size,
        imageWidth: 1920,
        imageHeight: 945,
        difficulty: difficulty,
        categoryId: categoryId,
        points: [],
        isPreset: false,
        isActive: true,
        sortOrder: this.apiManager.getLevels().length + 1
      }
      
      return newLevel
    } catch (error) {
      handleAPIError(error, '添加图片失败')
      return null
    }
  }

  /**
   * 删除关卡
   */
  async deleteLevel(levelIndex, allGameLevels) {
    try {
      const level = allGameLevels[levelIndex]
      
      if (level.id) {
        const result = await this.apiManager.deleteLevel(level.id)
        if (!result.success) {
          return false
        }
      }
      
      // 从数组中移除
      allGameLevels.splice(levelIndex, 1)
      return true
    } catch (error) {
      handleAPIError(error, '删除关卡失败')
      return false
    }
  }

  /**
   * 获取加载状态
   */
  getLoadingStates() {
    return this.loadingStates
  }

  /**
   * 检查是否为预置关卡
   */
  isPresetLevel(level) {
    return level.isPreset || false
  }

  /**
   * 检查关卡是否可编辑
   */
  canEditLevel(level) {
    return !this.isPresetLevel(level)
  }

  /**
   * 检查关卡是否可删除
   */
  canDeleteLevel(level) {
    return !this.isPresetLevel(level)
  }
}

/**
 * 创建适配器实例
 */
export function createLevelEditorAdapter() {
  const apiManager = createAPIManager()
  return new LevelEditorAdapter(apiManager)
}

export default {
  LevelEditorAPIManager,
  LevelEditorAdapter,
  createAPIManager,
  createLevelEditorAdapter
}
