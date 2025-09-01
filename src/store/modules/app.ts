import type { Module } from 'vuex'
import type { RootState } from '../index'

export interface AppState {
  theme: 'light' | 'dark'
  primaryColor: string
  cardRadius: number
  fixedHeader: boolean
  fixedTags: boolean
  grayMode: boolean
  colorWeak: boolean
  sidebarCollapsed: boolean
  sidebarDrawer: boolean
}

const app: Module<AppState, RootState> = {
  namespaced: true,
  state: (): AppState => ({
    theme: 'light',
    primaryColor: '#1e1c72',
    cardRadius: 8,
    fixedHeader: true,
    fixedTags: true,
    grayMode: false,
    colorWeak: false,
    sidebarCollapsed: false,
    sidebarDrawer: false
  }),

  mutations: {
    SET_THEME(state, theme: 'light' | 'dark') {
      state.theme = theme
      localStorage.setItem('app-theme', theme)
    },
    SET_PRIMARY_COLOR(state, color: string) {
      state.primaryColor = color
      localStorage.setItem('app-primary-color', color)
    },
    SET_CARD_RADIUS(state, radius: number) {
      state.cardRadius = radius
      localStorage.setItem('app-card-radius', radius.toString())
    },
    SET_FIXED_HEADER(state, fixed: boolean) {
      state.fixedHeader = fixed
      localStorage.setItem('app-fixed-header', fixed.toString())
    },
    SET_FIXED_TAGS(state, fixed: boolean) {
      state.fixedTags = fixed
      localStorage.setItem('app-fixed-tags', fixed.toString())
    },
    SET_GRAY_MODE(state, enabled: boolean) {
      state.grayMode = enabled
      localStorage.setItem('app-gray-mode', enabled.toString())
    },
    SET_COLOR_WEAK(state, enabled: boolean) {
      state.colorWeak = enabled
      localStorage.setItem('app-color-weak', enabled.toString())
    },
    SET_SIDEBAR_COLLAPSED(state, collapsed: boolean) {
      state.sidebarCollapsed = collapsed
    },
    SET_SIDEBAR_DRAWER(state, drawer: boolean) {
      state.sidebarDrawer = drawer
    },
    INIT_FROM_STORAGE(state) {
      const theme = localStorage.getItem('app-theme') as 'light' | 'dark'
      const primaryColor = localStorage.getItem('app-primary-color')
      const cardRadius = localStorage.getItem('app-card-radius')
      const fixedHeader = localStorage.getItem('app-fixed-header')
      const fixedTags = localStorage.getItem('app-fixed-tags')
      const grayMode = localStorage.getItem('app-gray-mode')
      const colorWeak = localStorage.getItem('app-color-weak')

      if (theme) state.theme = theme
      if (primaryColor) state.primaryColor = primaryColor
      if (cardRadius) state.cardRadius = parseInt(cardRadius)
      if (fixedHeader) state.fixedHeader = fixedHeader === 'true'
      if (fixedTags) state.fixedTags = fixedTags === 'true'
      if (grayMode) state.grayMode = grayMode === 'true'
      if (colorWeak) state.colorWeak = colorWeak === 'true'
    }
  },

  actions: {
    initApp({ commit }) {
      commit('INIT_FROM_STORAGE')
    },
    toggleTheme({ commit, state }) {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      commit('SET_THEME', newTheme)
    },
    toggleSidebar({ commit, state }) {
      commit('SET_SIDEBAR_COLLAPSED', !state.sidebarCollapsed)
    },
    toggleSidebarDrawer({ commit, state }) {
      commit('SET_SIDEBAR_DRAWER', !state.sidebarDrawer)
    }
  },

  getters: {
    isDarkTheme: (state) => state.theme === 'dark',
    sidebarWidth: (state) => state.sidebarCollapsed ? 64 : 200
  }
}

export default app 