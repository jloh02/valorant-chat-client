<template>
  <div class="home">
    <img alt="Vue logo" class="mx-auto" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

export default defineComponent({
  name: "Home",
  components: {
    HelloWorld,
  },
});

while (!window.ipc);

window.ipc.on("LOCKFILE_UPDATE", (event, args) => {
  console.log("Update");
});
</script>
