<template>
  <div id="nav">
    <p>VALORANT Chat Client</p>
    <div>
      <nav-bar-button icon="minus" />
      <nav-bar-button icon="minmax" />
      <nav-bar-button icon="xmark" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavBarButton from "./NavBarButton.vue";

export default defineComponent({
  name: "NavBar",
  components: { NavBarButton },
});
</script>

<style lang="postcss">
#nav {
  -webkit-user-select: none;
  -webkit-app-region: drag;
  @apply flex
  bg-stone-900
  h-6
  m-auto
  items-center justify-between
  cursor-default;
}

#nav p {
  @apply text-xs font-bold pl-2 text-stone-400;
}

#nav div {
  -webkit-app-region: no-drag;
  @apply h-6 flex items-center;
}
</style>
