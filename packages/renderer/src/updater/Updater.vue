<template>
  <div class="updater">
    <div class="updater-close-button">
      <button @click="cancel">
        <x-mark />
      </button>
    </div>
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
import XMark from "@/icons/XMark.vue";

const props = defineProps<{
  closeFn:()=>void;
}>()

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
  props.closeFn();
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
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 150px;
  z-index: 1000;

  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  padding: 2rem;
  background-color: $background-dark-accent;
}

.updater-close-button {
  @extend .center;
  position: absolute;
  top: 0;
  right: 0;
  height: 1.5rem;
  width: 1.75rem;
  padding: 0.25rem;
  z-index: 2;

  button {
    border: none;
    height: 1.5rem;
    width: 1.75rem;
    padding: 0.25rem;
    border-radius: 0;
    background-color: transparent;
  cursor: pointer;
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
    padding: 0.375rem 0.75rem;
    border-radius: 0.125rem;
    cursor: pointer;
  }
}

.progress-bar {
  height: 0.25rem;
  width: 100%;
  background-color: $background-lighter;
  border-radius: 0.25rem;
  .progress-bar-fill {
    display: block;
    background-color: $valo-red;
    height: 0.25rem;
    border-radius: 0.25rem;
    transition: width 500ms ease-in-out;
  }
}
</style>

<style lang="scss">
.updater-close-button svg {
  height: 100%;
  width: 100%;
  background-color: transparent;
  color: $background-accent;
}
</style>
