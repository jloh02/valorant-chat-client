<template>
  <li :class="getBoxClass">{{ this.puuid }}</li>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChatListItem",
  props: ["active", "puuid", "presence"],
  computed: {
    getBoxClass() {
      return this.active ? "chat-list-item active" : "chat-list-item";
    },
  },
});
</script>

<style lang="postcss">
li {
  min-height: 2.5rem;
  @apply h-10 px-3 py-1 my-1;
}

.chat-list-item {
  @apply flex;

  .active {
    @apply bg-gray-700;
  }
}
</style>
