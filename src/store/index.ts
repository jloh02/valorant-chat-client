import { createStore } from "vuex";

const store = createStore({
  state() {
    //data
    return {
      puuid: "",
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
    updatePuuid(state: any, puuid) {
      state.puuid = puuid;
    },
  },
});

export default store;
