<template>
  <div class="title-bar">
    <p>VALORANT Chat Client</p>
    <div>
      <title-bar-button icon="minus" />
      <title-bar-button icon="minmax" />
      <title-bar-button icon="xmark" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import TitleBarButton from "./TitleBarButton.vue";
</script>

<style lang="scss" scoped>
.title-bar {
  @extend .flex;
  user-select: none;
  justify-content: space-between;
  align-items: center;
  background-color: $background-dark-accent;
  height: 1.5rem;
  margin: auto;
  cursor: default;
  -webkit-app-region: drag;

  p {
    @extend .text-xs;
    font-weight: bold;
    margin-left: 0.5rem;
    color: $background-accent;
  }

  div {
    @extend .flex;
    height: 1.5rem;
    -webkit-app-region: no-drag;
  }
}
</style>
