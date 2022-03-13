<template>
  <button
    @click="this.modWindow"
    :class="'nav button' + (this.icon == 'xmark' ? ' close' : ' normal')"
  >
    <div class="nav button icon">
      <!--Custom svg for square icon-->
      <svg
        v-if="this.icon == 'minmax'"
        class="svg-inline--fa fa-minus"
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="square"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 700 700"
      >
        <rect
          x="150"
          y="150"
          rx="100"
          ry="100"
          width="400"
          height="400"
          stroke="currentColor"
          fill="transparent"
          stroke-width="100"
        />
      </svg>
      <font-awesome-icon v-else :icon="this.icon" />
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NavBarButton",
  props: ["icon"],
  methods: {
    modWindow() {
      switch (this.icon) {
        case "xmark":
          window.ipc?.send("WINDOW", "CLOSE");
          break;
        case "minmax":
          window.ipc?.send("WINDOW", "MINMAX");
          break;

        case "minus":
          window.ipc?.send("WINDOW", "MINIMIZE");
          break;
      }
    },
  },
});
</script>

<style lang="postcss">
.nav.button {
  @apply h-6 w-7;
}

.nav.button.icon {
  @apply p-1 flex justify-center items-center;
}

.nav.button svg {
  @apply w-auto h-full text-stone-400;
}

.nav.button.close:hover {
  @apply bg-red-500;
}

.nav.button.normal:hover {
  @apply bg-stone-700;
}
</style>
