<template>
  <nav-bar />
  <div v-if="this.riotAlive" class="app-div"><chat /></div>
  <div v-else class="app-div">
    <riot-client-closed />
  </div>
</template>

<script lang="ts">
import NavBar from "./components/NavBar.vue";
import Chat from "./views/Chat.vue";
import { defineComponent } from "vue";
import { ValorantPresence } from "@/types/valorant-presence";
import RiotClientClosed from "./views/RiotClientClosed.vue";

export default defineComponent({
  name: "App",
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
#app {
  font-family: "Segoe UI", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply bg-stone-800 text-white 
  text-center text-base 
  h-screen w-screen
  min-h-screen max-h-screen;
}

.app-div {
  height: calc(100%-1.25rem);
  @apply absolute top-5 bottom-0 w-full
  flex flex-col items-center justify-center;
}

*:focus {
  outline: none;
}

* {
  -webkit-user-select: none;
}

input {
  -webkit-user-select: text;
}

::selection {
  @apply bg-stone-400;
}

svg {
  display: inline-block;
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
  overflow: visible;
  box-sizing: content-box;
}
</style>
