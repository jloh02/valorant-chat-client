<template>
  <div class="updater-close-button">
    <button @click="cancel">
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
    <p v-if="total === 1" class="updater-text">
      Update Available. Do you want to update now?
    </p>
    <p v-else class="updater-text">
      Update in Progress. Please allow installation upon completion.
    </p>
    <div class="updater-row">
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="'width:' + progress + '%'" />
      </div>
      <div class="updater-button">
        <button v-if="total === 1" @click="update">Update</button>
        <p v-else>{{ transferred }}/{{ total }} kB</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";

const transferred = ref(0);
const total = ref(1);
const progress = computed(() =>
  Math.round((transferred.value / total.value) * 100)
);

function update() {
  window.ipc?.send("UPDATE", "UPDATE");
}
function cancel() {
  window.ipc?.send("UPDATE", "CANCEL");
}

while (!window.ipc);
window.ipc.on(
  "UPDATE",
  (command: string, newTransferred: number, newTotal: number) => {
    if (command !== "PROGRESS") return;
    total.value = newTotal;
    transferred.value = newTransferred;
  }
);
</script>

<style lang="scss" scoped>
.updater {
  @extend .flex-col;
  @extend .max-size;
  justify-content: center;
  align-items: flex-start;
}

.updater-close-button {
  @extend .center;
  position: absolute;
  top: 0;
  right: 0;
  height: 2rem;
  width: 2.25rem;
  cursor: pointer;

  svg {
    color: $background-accent;
  }
}
.updater-text {
  margin-bottom: 0.75rem;
}

.updater-row {
  @extend .flex;
  width: 100%;
}

.updater-button {
  @extend .text-sm;
  margin-left: 1rem;
  padding: 0;
  white-space: nowrap;

  button {
    @extend .valo-red-theme;
    margin: 0;
    padding: 0.75rem;
    border-radius: 0.125rem;
  }
}

.progress-bar {
  height: 0.25rem;
  width: 100%;
  background-color: $background-col;
  border-radius: 50%;
  .progress-bar-fill {
    display: block;
    height: 0.25rem;
    border-radius: 100%;
    transition: width 500ms ease-in-out;
  }
}
</style>
