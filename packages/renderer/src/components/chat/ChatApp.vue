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
import ValorantPresence from "../../../../interfaces/ValorantPresence";
import Chat from "./Chat.vue";
import ErrorPage from "../ErrorPage.vue";
import TitleBar from "../titlebar/TitleBar.vue";

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

<style lang="scss" scoped>
.app-div {
  @extend .flex-col;
  justify-content: center;
  position: absolute;
  top: 1.25rem;
  bottom: 0;
  width: 100%;
}
</style>
