<template>
  <button
    @click="modWindow"
    :class="'title-bar-button' + (props.icon === 'xmark' ? ' close' : ' normal')"
  >
    <div class="title-bar-button icon">
      <!--Custom svg for square icon-->
      <minmax v-if="props.icon === 'minmax'" />
      <minus v-else-if="props.icon === 'minus'" />
      <x-mark v-else />
    </div>
  </button>
</template>

<script lang="ts" setup>
import Minus from "../../icons/Minus.vue";
import Minmax from "../../icons/Minmax.vue";
import XMark from "../../icons/XMark.vue";

const props = defineProps<{
  icon: String;
}>();

function modWindow() {
  switch (props.icon) {
    case "xmark":
      window.ipc?.send("WINDOW", "CLOSE");
      break;
    case "minmax":
      window.ipc?.send("WINDOW", "MINMAX");
      break;
    case "minus":
      window.ipc?.send("WINDOW", "MINIMIZE");
      break;
    default:
  }
}
</script>

<style lang="scss" scoped>
.title-bar-button {
  height: 1.5rem;
  width: 1.75rem;
  padding: 0.25rem;
  border: none;
  border-radius: 0;
  background-color: transparent;

  &.icon {
    @extend .flex;
    position: relative;
    height: 100%;
    width: 100%;
    padding: 0;
    justify-content: center;
  }
  &.close:hover {
    background-color: $valo-red;
  }
  &.normal:hover {
    background-color: $background-lighter;
  }
}
</style>

<style lang="scss">
.title-bar-button.icon svg {
  width: auto;
  height: 100%;
  color: $background-accent;
}
</style>
