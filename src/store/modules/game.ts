/**
 * 游戏模块Store
 * 使用统一类型系统，避免循环依赖
 */

import type { Module } from 'vuex'
import type { RootState } from '../index'
import type { GameState, GameSettings, GameLevel, PuzzlePoint, GameBundle } from '../../types/puzzle'
import { presetImages } from '../../data/presetImages'
import { migrateData } from '../../utils/migrate'

const game: Module<GameState, RootState> = {
  namespaced: true,
  state: (): GameState => ({
    settings: {
      totalLevels: 5,
      countdownSeconds: 30,
      flashThreshold: 10
    },
    levels: []
  }),

  mutations: {
    SET_SETTINGS(state: GameState, settings: Partial<GameSettings>) {
      // 设置合法化
      const newCountdownSeconds = Math.max(10, Math.min(300, settings.countdownSeconds ?? state.settings.countdownSeconds))
      const maxFlashThreshold = Math.min(60, newCountdownSeconds - 5) // 确保闪烁时间不超过倒计时-5秒
      
      const newSettings = {
        ...state.settings,
        ...settings,
        totalLevels: Math.max(1, Math.min(50, settings.totalLevels ?? state.settings.totalLevels)), // 最大50关
        countdownSeconds: newCountdownSeconds,
        flashThreshold: Math.max(5, Math.min(maxFlashThreshold, settings.flashThreshold ?? state.settings.flashThreshold)) // 5秒到倒计时-5秒
      }
      
      // 检查关卡数量限制（包括预置图片）
      const totalAvailable = presetImages.length + state.levels.length
      if (totalAvailable > 0 && newSettings.totalLevels > totalAvailable) {
        console.warn(`配置的关卡数 ${newSettings.totalLevels} 超过可用图片数 ${totalAvailable}，将在游戏中使用实际可用图片数`)
      }
      
      // 检查闪烁时间限制
      if (newSettings.flashThreshold >= newSettings.countdownSeconds) {
        console.warn(`闪烁提醒时间 ${newSettings.flashThreshold} 秒不能大于等于倒计时 ${newSettings.countdownSeconds} 秒，已自动调整`)
        newSettings.flashThreshold = Math.max(5, newSettings.countdownSeconds - 5)
      }
      
      state.settings = newSettings
      
      // 保存到 localStorage
      localStorage.setItem('game-settings', JSON.stringify(newSettings))
    },
    
    SET_LEVELS(state: GameState, levels: GameLevel[]) {
      state.levels = levels
      // 同步更新 totalLevels
      if (state.settings.totalLevels > levels.length && levels.length > 0) {
        state.settings.totalLevels = levels.length
      }
    },
    
    ADD_LEVEL(state: GameState, level: GameLevel) {
      state.levels.push(level)
    },
    
    UPDATE_LEVEL(state: GameState, { index, level }: { index: number; level: GameLevel }) {
      if (index >= 0 && index < state.levels.length) {
        state.levels[index] = level
      }
    },
    
    DELETE_LEVEL(state: GameState, index: number) {
      if (index >= 0 && index < state.levels.length) {
        state.levels.splice(index, 1)
        // 删除关卡后调整 totalLevels
        if (state.settings.totalLevels > state.levels.length && state.levels.length > 0) {
          state.settings.totalLevels = state.levels.length
        }
      }
    },
    
    UPDATE_LEVEL_POINTS(state: GameState, { levelIndex, points }: { levelIndex: number; points: PuzzlePoint[] }) {
      if (levelIndex >= 0 && levelIndex < state.levels.length) {
        state.levels[levelIndex].points = points
      }
    },
    
    INIT_FROM_STORAGE(state: GameState) {
      try {
        // 先尝试加载新格式的游戏设置
        const savedSettings = localStorage.getItem('game-settings')
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings)
          state.settings = {
            totalLevels: Math.max(1, Math.min(50, parsedSettings.totalLevels ?? 5)),
            countdownSeconds: Math.max(10, Math.min(300, parsedSettings.countdownSeconds ?? 30)),
            flashThreshold: Math.max(5, Math.min(60, parsedSettings.flashThreshold ?? 10))
          }
        }
        
        // 🔄 只加载自定义图片数据：扫描localStorage中的image_*数据，排除预置图片
        const loadedLevels: GameLevel[] = []
        
        // 创建预置图片URL集合，用于去重
        const presetImageUrls = new Set(presetImages.map(img => img.url))
        
        // 遍历localStorage查找所有image_开头的键
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('image_')) {
            try {
              const imageData = localStorage.getItem(key)
              if (imageData) {
                const parsedImageData = JSON.parse(imageData)
                
                // 验证必要字段，并排除预置图片
                if (parsedImageData.image && parsedImageData.points && 
                    !presetImageUrls.has(parsedImageData.image)) {
                  const level: GameLevel = {
                    id: parsedImageData.id || key.replace('image_', ''),
                    name: parsedImageData.name || '自定义图片',
                    url: parsedImageData.image,
                    image: parsedImageData.image,
                    size: parsedImageData.size || 0,
                    width: parsedImageData.width || 0,
                    height: parsedImageData.height || 0,
                    points: parsedImageData.points.map((point: any) => ({
                      x: point.x,
                      y: point.y,
                      width: point.width || 0,
                      height: point.height || 0,
                      found: false,
                      highlightTitle: point.highlightTitle || point.title || '未命名警示点',
                      highlightDetail: point.highlightDetail || point.description || '请添加详细说明',
                      connectionType: point.connectionType || 'none'
                    })),
                    createdAt: parsedImageData.createdAt || new Date().toISOString(),
                    updatedAt: parsedImageData.updatedAt || new Date().toISOString()
                  }
                  loadedLevels.push(level)
                  console.log(`✅ 从${key}加载自定义图片数据，警示点数量:`, level.points?.length || 0)
                } else if (presetImageUrls.has(parsedImageData.image)) {
                  console.log(`⏭️ 跳过预置图片:`, parsedImageData.image)
                }
              }
            } catch (e) {
              console.warn(`解析${key}数据失败:`, e)
            }
          }
        }
        
        // 然后尝试加载旧格式的游戏数据（向后兼容）
        const savedData = localStorage.getItem('game-data')
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          const migratedData = migrateData(parsedData)
          
          // 如果没有新格式设置，使用迁移的设置
          if (!savedSettings) {
            state.settings = migratedData.settings
          }
          
          // 合并game-data中的关卡和扫描到的图片数据，去重（排除预置图片和已存在的自定义图片）
          const existingImages = new Set(loadedLevels.map(level => level.image))
          const additionalLevels = (migratedData.levels || []).filter(
            level => level.image && 
                     !existingImages.has(level.image) && 
                     !presetImageUrls.has(level.image)
          )
          
          state.levels = [...loadedLevels, ...additionalLevels]
        } else {
          // 如果没有game-data，只使用扫描到的图片数据
          state.levels = loadedLevels
        }
        
        console.log(`🎮 Store加载完成，自定义关卡数:`, state.levels.length, `（预置图片已排除）`)
        
      } catch (e) {
        console.error('Failed to load game data from storage:', e)
        // 使用默认值
        state.settings = {
          totalLevels: 5,
          countdownSeconds: 30,
          flashThreshold: 10
        }
        state.levels = []
      }
    }
  },

  actions: {
    initGame({ commit }: any) {
      commit('INIT_FROM_STORAGE')
    },
    
    updateSettings({ commit }: any, settings: Partial<GameSettings>) {
      commit('SET_SETTINGS', settings)
    },
    
    addLevel({ commit }: any, level: GameLevel) {
      commit('ADD_LEVEL', level)
    },
    
    updateLevel({ commit }: any, payload: { index: number; level: GameLevel }) {
      commit('UPDATE_LEVEL', payload)
    },
    
    deleteLevel({ commit }: any, index: number) {
      commit('DELETE_LEVEL', index)
    },
    
    updateLevelPoints({ commit }: any, payload: { levelIndex: number; points: PuzzlePoint[] }) {
      commit('UPDATE_LEVEL_POINTS', payload)
    },
    
    importData({ commit }: any, data: any) {
      const migratedData = migrateData(data)
      commit('SET_SETTINGS', migratedData.settings)
      commit('SET_LEVELS', migratedData.levels)
    },
    
    exportData({ state }: any): GameBundle {
      return {
        version: '2.0',
        settings: state.settings,
        levels: state.levels,
        exportTime: new Date().toISOString()
      }
    },
    
    forceRefresh({ commit }: any) {
      // 强制刷新，重新从localStorage读取数据
      commit('INIT_FROM_STORAGE')
    }
  },

  getters: {
    totalPoints: (state: GameState) => state.levels.reduce((total, level) => total + (level.points?.length || 0), 0),
    // 计算总图片数量：预置图片 + 自定义图片
    maxLevels: (state: GameState) => presetImages.length + state.levels.length,
    currentSettings: (state: GameState) => state.settings,
    currentLevels: (state: GameState) => state.levels,
    // 获取实际游戏中使用的关卡数量（配置值和可用关卡数的最小值）
    effectiveGameLevels: (state: GameState) => {
      const configured = state.settings.totalLevels
      const available = presetImages.length + state.levels.length // 包括预置图片
      return available > 0 ? Math.min(configured, available) : configured
    },
    // 检查配置是否有效（关卡数不超过可用数量）
    isConfigValid: (state: GameState) => {
      const totalAvailable = presetImages.length + state.levels.length
      if (totalAvailable === 0) return true // 没有关卡数据时认为有效
      return state.settings.totalLevels <= totalAvailable
    },
    // 获取闪烁时间的安全上限（不能超过倒计时时间）
    safeFlashThresholdMax: (state: GameState) => Math.min(60, state.settings.countdownSeconds - 5), // 至少保留5秒
    // 检查闪烁时间设置是否安全
    isFlashThresholdSafe: (state: GameState) => {
      return state.settings.flashThreshold < state.settings.countdownSeconds
    }
  }
}

export default game 