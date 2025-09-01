import type { Module } from 'vuex'
import type { RootState } from '../index'

export interface TabItem {
  path: string
  fullPath: string
  title: string
  affix: boolean
  name?: string
  keepAlive?: boolean
  query?: Record<string, any>
  hash?: string
}

export interface TabsState {
  tabs: TabItem[]
  activeTab: string
}

const tabs: Module<TabsState, RootState> = {
  namespaced: true,
  state: (): TabsState => ({
    tabs: [],
    activeTab: ''
  }),

  mutations: {
    ADD_TAB(state, tab: TabItem) {
      // 检查标签页是否已存在
      const existingTab = state.tabs.find(t => t.fullPath === tab.fullPath)
      if (!existingTab) {
        state.tabs.push(tab)
      }
    },
    
    ACTIVATE_TAB(state, fullPath: string) {
      state.activeTab = fullPath
    },
    
    REMOVE_TAB(state, fullPath: string) {
      const index = state.tabs.findIndex(tab => tab.fullPath === fullPath)
      if (index > -1) {
        state.tabs.splice(index, 1)
      }
    },
    
    SET_TABS(state, tabs: TabItem[]) {
      state.tabs = tabs
    },
    
    SET_ACTIVE_TAB(state, fullPath: string) {
      state.activeTab = fullPath
    },
    
    CLEAR_TABS(state) {
      state.tabs = []
      state.activeTab = ''
    }
  },

  actions: {
    addTab({ commit }, route: any) {
      const tab: TabItem = {
        path: route.path,
        fullPath: route.fullPath,
        title: route.meta?.title || '未知页面',
        affix: route.meta?.affix || false,
        name: route.name,
        keepAlive: route.meta?.keepAlive || false,
        query: route.query,
        hash: route.hash
      }
      commit('ADD_TAB', tab)
    },
    
    activateTab({ commit }, fullPath: string) {
      commit('ACTIVATE_TAB', fullPath)
    },
    
    removeTab({ commit, state }, fullPath: string) {
      commit('REMOVE_TAB', fullPath)
      
      // 如果关闭的是当前激活的标签页，需要切换到其他标签页
      if (state.activeTab === fullPath) {
        const remainingTabs = state.tabs.filter(tab => tab.fullPath !== fullPath)
        if (remainingTabs.length > 0) {
          // 优先跳转到固定标签页，否则跳转到最后一个标签页
          const nextTab = remainingTabs.find(tab => tab.affix) || remainingTabs[remainingTabs.length - 1]
          return nextTab.fullPath
        }
      }
      return null
    },
    
    initTabs({ commit }, routes: any[]) {
      // 初始化固定标签页
      const affixTabs = routes
        .filter(route => route.meta?.affix && route.path.startsWith('/admin') && route.path !== '/admin')
        .map(route => ({
          path: route.path,
          fullPath: route.path,
          title: route.meta?.title || '未知页面',
          affix: true,
          name: route.name,
          keepAlive: route.meta?.keepAlive || false,
          query: {},
          hash: ''
        }))
      
      commit('SET_TABS', affixTabs)
      
      // 设置默认激活标签页
      if (affixTabs.length > 0) {
        commit('SET_ACTIVE_TAB', affixTabs[0].fullPath)
      }
    }
  },

  getters: {
    allTabs: (state) => state.tabs,
    activeTab: (state) => state.activeTab,
    affixTabs: (state) => state.tabs.filter(tab => tab.affix),
    nonAffixTabs: (state) => state.tabs.filter(tab => !tab.affix),
    hasTabs: (state) => state.tabs.length > 0
  }
}

export default tabs 