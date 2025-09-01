import { createStore } from 'vuex'
import app from './modules/app'
import game from './modules/game'
import tabs from './modules/tabs'
import user from './modules/user'

// localStorage插件 - 插件化持久化
const localStoragePlugin = (store: any) => {
  // 需要持久化的mutation列表
  const persistMutations = [
    'game/SET_SETTINGS',
    'game/SET_LEVELS', 
    'game/ADD_LEVEL',
    'game/UPDATE_LEVEL',
    'game/DELETE_LEVEL',
    'game/UPDATE_LEVEL_POINTS'
  ]
  
  // 防抖函数
  let saveTimeout: number | null = null
  const debouncedSave = (state: any) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = window.setTimeout(() => {
      const gameData = {
        version: '2.0',
        settings: state.game.settings,
        levels: state.game.levels,
        exportTime: new Date().toISOString()
      }
      localStorage.setItem('game-data', JSON.stringify(gameData))
    }, 300) // 300ms防抖
  }
  
  // 订阅指定的mutations
  store.subscribe((mutation: any, state: any) => {
    if (persistMutations.includes(mutation.type)) {
      debouncedSave(state)
    }
  })
}

export default createStore({
  modules: {
    app,
    game,
    tabs,
    user
  },
  plugins: [localStoragePlugin]
})

export interface RootState {
  app: any
  game: any
  tabs: any
  user: any
} 