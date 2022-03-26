<template>
  <nav-bar />
  <div v-if="this.riotAlive" class="app-div"><chat /></div>
  <div v-else class="app-div">
    <riot-client-closed />
  </div>
</template>

<script lang="ts">
import NavBar from "../components/NavBar.vue";
import Chat from "./Chat.vue";
import { defineComponent } from "vue";
import { ValorantPresence } from "@/types/valorant-presence";
import RiotClientClosed from "./RiotClientClosed.vue";

export default defineComponent({
  name: "ChatApp",
  components: { NavBar, Chat, RiotClientClosed },
  data: () => {
    return {
      riotAlive: false,
    };
  },
  created() {
    while (!window.ipc);

    window.ipc.on("IPC_STATUS", (command, ready, puuid) => {
      if (command != "LOCKFILE_UPDATE") return;
      this.riotAlive = ready;
      if (puuid) this.$store.commit("updatePuuid", puuid);
    });

    window.ipc.send("IPC_STATUS", "IPC_READY");

    window.ipc.on(
      "VALORANT_PRESENCES",
      (eventType: string, new_presences: Map<string, ValorantPresence>) => {
        if (eventType == "Delete") {
          new_presences.forEach((v: ValorantPresence, k: string) => {
            this.$store.commit("deletePresence", k);
          });
        } else {
          new_presences.forEach((v: ValorantPresence, k: string) => {
            this.$store.commit("updatePresence", { k, v });
          });
        }
      }
    );
  },
});
</script>

<style lang="postcss">
.app-div {
  height: calc(100%-1.25rem);
  @apply absolute top-5 bottom-0 w-full
  flex flex-col items-center justify-center;
}
</style>
