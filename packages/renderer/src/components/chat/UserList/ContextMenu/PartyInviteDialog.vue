<template>
  <div :class="'party-invite-dialog ' + visibility">
    {{ msg }}
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const msg = ref("");
const visibility = ref("no-show");
const timeout = ref(0);
function show(message: string) {
  msg.value = message;
  visibility.value = "show";
  clearTimeout(timeout.value);
  timeout.value = setTimeout(() => {
    visibility.value = "no-show";
  }, 2500);
}

defineExpose({ show });
</script>

<style lang="scss" scoped>
.party-invite-dialog {
  @extend .shadow;
  position: fixed;
  transform: translateX(-50%);
  left: calc(50% - min(calc(33.33333% + 1rem), 300px) / 2);
  top: 2.25rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.25rem;
  background-color: $valo-red;
  white-space: pre-line;

  &.no-show {
    opacity: 0;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  &.show {
    opacity: 100;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
}
</style>
