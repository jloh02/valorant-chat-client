<template>
  <div class="updater-close-button">
    <button @click="this.cancel">
      <svg
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
    </button>
  </div>
  <div class="updater">
    <p v-if="this.total == 1" class="updater-text">
      Update Available. Do you want to update now?
    </p>
    <p v-else class="updater-text">
      Update in Progress. Please allow installation upon completion.
    </p>
    <div class="updater-row">
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="'width:' + progress + '%'" />
      </div>
      <div class="updater-right">
        <button
          v-if="this.total == 1"
          @click="this.update"
          class="updater-button"
        >
          Update
        </button>
        <p v-else>{{ this.transferred }}/{{ this.total }} kB</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Updater",
  data: () => {
    return {
      transferred: 0,
      total: 1,
    };
  },
  computed: {
    progress() {
      return Math.round((this.transferred / this.total) * 100);
    },
  },
  methods: {
    update() {
      window.ipc?.send("UPDATE", "UPDATE");
    },
    cancel() {
      window.ipc?.send("UPDATE", "CANCEL");
    },
  },
  mounted() {
    while (!window.ipc);

    window.ipc.on("UPDATE", (command, transfer, total) => {
      if (command != "PROGRESS") return;
      this.total = total;
      this.transferred = transfer;
    });
  },
});
</script>

<style lang="postcss">
.updater {
  @apply flex flex-col h-full w-full justify-center items-start p-8 bg-stone-900;
}

.updater-close-button {
  @apply absolute top-0 right-0 h-8 w-9
  flex items-center justify-center
  cursor-pointer;
}
.updater-close-button svg {
  @apply text-stone-400;
}

.updater-text {
  @apply pb-3;
}

.updater-row {
  @apply flex flex-row w-full items-center;
}
.updater-right {
  @apply ml-4 p-0 text-sm whitespace-nowrap;
}
.updater-button {
  @apply bg-red-600 m-0 p-3 py-1 rounded-sm;
}

.progress-bar {
  @apply h-1 w-full bg-stone-800 rounded-l-full rounded-r-full;
}
.progress-bar-fill {
  transition: width 500ms ease-in-out;
  @apply h-1 block bg-red-600 rounded-l-full rounded-r-full;
}
</style>
