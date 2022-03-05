<template>
  <div v-if="this.riotAlive">
    <div id="nav">
      <router-link to="/">VALORANT Chat Client</router-link>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </router-view>
  </div>
  <RiotClientClosed v-else />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ValorantPresence } from "@/types/valorant-presence";
import RiotClientClosed from "@/views/RiotClientClosed.vue";

export default defineComponent({
  name: "App",
  components: { RiotClientClosed },
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
      console.log(this.riotAlive);
      if (puuid) this.$store.commit("updatePuuid", puuid);
    });

    window.ipc.send("IPC_STATUS", "IPC_READY");

    window.ipc.on(
      "VALORANT_PRESENCES",
      (new_presences: Map<string, ValorantPresence>) => {
        new_presences.forEach((v: ValorantPresence, k: string) => {
          console.log(v);
          this.$store.commit("updatePresence", { k, v });
        });
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

#app > div {
  @apply absolute top-0 bottom-0 w-full h-full;
}

#nav {
  @apply flex
  h-12
  m-auto max-w-1/2
  justify-center items-end
  cursor-default;
}

#nav a {
  @apply relative flex-1
  py-3 px-7  
  font-bold hover:text-lg;
}

#nav a:after {
  content: "";
  transition: all 300ms ease-in;
  transform: translate(50%, 0);
  @apply w-0;
}

#nav a.router-link-exact-active {
  @apply text-lg;
}

#nav a.router-link-exact-active:after {
  transition: all 300ms ease-in;
  transform: translate(0, 0);
  @apply absolute bottom-0 left-1/4 
  h-0.5 w-1/2
  bg-white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from {
  @apply opacity-100;
}
.fade-leave-to {
  @apply opacity-0;
}
</style>
