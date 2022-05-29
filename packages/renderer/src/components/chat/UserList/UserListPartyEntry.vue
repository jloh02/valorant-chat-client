<template>
  <div class="user-list-party">
    <div :class="active ? ' active' : ''">
      <party class="user-list-party-icon" />
      <p>{{ partyCount }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Party from "@icons/Party.vue";
defineProps<{
  active: boolean;
  partyCount: number;
}>();
</script>

<style lang="scss" scoped>
.user-list-party {
  @extend .flex;
  height: auto;
  width: 100%;

  position: relative;
  margin-top: 0.25rem; 

  div {
    @extend .center;
    height: 0.75rem;
    width: 3.5rem;
    padding-bottom: 0.25rem;
    border-radius: 0 0 0.25rem 0.25rem;
    background-color: transparent;

    &.active {
      background-color: $background-lighter;
    }
  }

  .user-list-party-icon {
    height: 100%;
    width: auto;
    margin-left: -0.5rem;
    padding: 0 0.5rem;
  }
}
</style>
