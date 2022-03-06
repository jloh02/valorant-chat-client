import { ValorantPresence } from "@/types/valorant-presence";
import { State } from "@vue/runtime-core";
import { createStore } from "vuex";

const store = createStore({
  state() {
    //data
    return {
      puuid: "",
      presences: new Map<string, ValorantPresence>(),
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
    deletePresence(state: State, key) {
      state.presences.delete(key);
    },
    updatePresence(state: State, record) {
      state.presences.set(record.k, record.v);
    },
    updatePuuid(state: State, puuid: string) {
      state.puuid = puuid;
    },
  },
});

export default store;
