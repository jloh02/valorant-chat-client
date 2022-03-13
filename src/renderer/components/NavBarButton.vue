<template>
  <button
    @click="this.modWindow"
    :class="'nav button' + (this.icon == 'xmark' ? ' close' : ' normal')"
  >
    <div class="nav button icon">
      <!--Custom svg for square icon-->
      <svg
        v-if="this.icon == 'minmax'"
        aria-hidden="true"
        focusable="false"
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
      <!-- Icon from https://fontawesome.com/ -->
      <svg
        v-else-if="this.icon == 'minus'"
        aria-hidden="true"
        focusable="false"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
      >
        <path
          fill="currentColor"
          d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"
        ></path>
      </svg>
      <!-- Icon from https://fontawesome.com/ -->
      <svg
        v-else
        aria-hidden="true"
        focusable="false"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 512"
      >
        <path
          fill="currentColor"
          d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"
        ></path>
      </svg>
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
