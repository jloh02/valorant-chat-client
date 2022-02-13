<template>
  <div v-if="this.riotAlive">
    <div id="nav">
      <router-link to="/">Chat</router-link>
      <router-link to="/home">In-Game</router-link>
      <router-link to="/about">Agent Select</router-link>
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
import { ValorantPresence } from "@/ipc_main/valorant_presence";
import RiotClientClosed from "@/views/RiotClientClosed.vue";

export default defineComponent({
  name: "App",
  components: { RiotClientClosed },
  data: () => {
    return {
      riotAlive: false,
    };
  },
  mounted() {
    while (!window.ipc);

    window.ipc.send("IPC_READY");

    window.ipc.on("LOCKFILE_UPDATE", (ready) => {
      this.riotAlive = ready;
      console.log(this.riotAlive);
    });

    window.ipc.on(
      "VALORANT_PRESENCES",
      (new_presences: Map<string, ValorantPresence>) => {
        new_presences.forEach((v, k) =>
          this.$store.commit("updatePresence", { k, v })
        );
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
  @apply bg-gray-800 text-white 
  text-center text-base 
  h-screen w-screen
  min-h-screen max-h-screen;
}

#app > div {
  @apply absolute top-0 bottom-0 w-full h-full;
}

#nav {
  @apply flex 
  m-auto h-12 max-w-1/2
  justify-center items-end;
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
