import { createStore } from "vuex";

const store = createStore({
  state() {
    //data
    return {
      presences: new Map(),
    };
  },
  getters: {
    //computed
  },
  actions: {
    //methods
  },
  mutations: {
    //Set/update data
    updatePresence(state: any, record) {
      state.presences.set(record.k, record.v);
    },
  },
});

export default store;
