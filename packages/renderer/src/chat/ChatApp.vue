<template>
  <title-bar />
  <div v-if="riotAlive" class="app-div"><chat /></div>
  <div v-else class="app-div">
    <error-page />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useStore } from "vuex";
import ValorantPresence from "../../../interfaces/ValorantPresence";
import TitleBar from "../components/titlebar/TitleBar.vue";
// import Chat from "./Chat.vue";
import ErrorPage from "../components/ErrorPage.vue";

const riotAlive = ref(false);
const store = useStore();

while (!window.ipc);

window.ipc.on("IPC_STATUS", (command, ready, puuid) => {
  if (command != "LOCKFILE_UPDATE") return;
  riotAlive.value = ready;
  if (puuid) store.commit("updatePuuid", puuid);
});

window.ipc.send("IPC_STATUS", "IPC_READY");

window.ipc.on(
  "VALORANT_PRESENCES",
  (eventType: string, newPresences: Map<string, ValorantPresence>) => {
    if (eventType == "Delete") {
      newPresences.forEach((v: ValorantPresence, k: string) => {
        store.commit("deletePresence", k);
      });
    } else {
      newPresences.forEach((v: ValorantPresence, k: string) => {
        store.commit("updatePresence", { k, v });
      });
    }
  }
);
</script>
