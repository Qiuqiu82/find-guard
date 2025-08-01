// @ts-ignore
import { createStore } from 'vuex';
import createVuexAlong from 'vuex-along';

interface GameData {
  totalLevels: number;
  currentLevel: number;
  highestLevel: number;
  scores: number[];
}

interface UserInfo {
  isLoggedIn: boolean;
  username: string;
  avatar: string;
}

interface State {
  gameData: GameData;
  userInfo: UserInfo;
}

export default createStore<State>({
  state: {
    // 游戏全局状态
    gameData: {
      totalLevels: 6,
      currentLevel: 1,
      highestLevel: 1,
      scores: []
    },
    userInfo: {
      isLoggedIn: false,
      username: '',
      avatar: ''
    }
  },
  getters: {
    gameData: (state: State) => state.gameData,
    userInfo: (state: State) => state.userInfo,
    isLoggedIn: (state: State) => state.userInfo.isLoggedIn
  },
  mutations: {
    SET_CURRENT_LEVEL(state: State, level: number) {
      state.gameData.currentLevel = level;
      if (level > state.gameData.highestLevel) {
        state.gameData.highestLevel = level;
      }
    },
    SET_SCORE(state: State, { level, score }: { level: number, score: number }) {
      while (state.gameData.scores.length < level) {
        state.gameData.scores.push(0);
      }
      state.gameData.scores[level - 1] = score;
    },
    SET_USER_INFO(state: State, userInfo: Partial<UserInfo>) {
      state.userInfo = { ...state.userInfo, ...userInfo };
    },
    SET_LOGIN_STATE(state: State, isLoggedIn: boolean) {
      state.userInfo.isLoggedIn = isLoggedIn;
    }
  },
  actions: {
    updateLevel(context: any, level: number) {
      context.commit('SET_CURRENT_LEVEL', level);
    },
    saveScore(context: any, payload: { level: number, score: number }) {
      context.commit('SET_SCORE', payload);
    },
    login(context: any, userInfo: Partial<UserInfo>) {
      context.commit('SET_USER_INFO', userInfo);
      context.commit('SET_LOGIN_STATE', true);
    },
    logout(context: any) {
      context.commit('SET_USER_INFO', {
        username: '',
        avatar: ''
      });
      context.commit('SET_LOGIN_STATE', false);
    }
  },
  modules: {},
  plugins: [
    // @ts-ignore
    createVuexAlong({
      name: 'find-diff-game-storage',
      local: {
        list: ['gameData', 'userInfo']
      }
    })
  ]
}); 