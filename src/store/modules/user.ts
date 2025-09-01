import type { Module } from 'vuex'
import type { RootState } from '../index'

export interface UserState {
  isAdmin: boolean
}

const user: Module<UserState, RootState> = {
  namespaced: true,
  state: (): UserState => ({
    isAdmin: false
  }),

  mutations: {
    SET_ADMIN_STATUS(state, isAdmin: boolean) {
      state.isAdmin = isAdmin
    }
  },

  actions: {
    setAdminStatus({ commit }, isAdmin: boolean) {
      commit('SET_ADMIN_STATUS', isAdmin)
    }
  },

  getters: {
    isAdmin: (state) => state.isAdmin
  }
}

export default user 