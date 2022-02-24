/* eslint-disable */

import { Store } from "vuex";
import { ValorantPresence } from "./ipc_main/valorant_presence";

declare module "@vue/runtime-core" {
  interface State {
    puuid: string;
    presences: Map<string, ValorantPresence>;
  }
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
