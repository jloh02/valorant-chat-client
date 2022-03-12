<template>
  <div class="chat-list-item-overlay">
    <p>{{ this.data.game_name }}#{{ this.data.game_tag }}</p>
    <div v-if="this.data.note != ''" class="chat-list-item-overlay-note">
      <font-awesome-icon icon="file-lines" />
      <p>
        {{ this.data.note }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChatListItemOverlay",
  props: ["data"],
});
</script>

<style lang="postcss">
.chat-list-item-button:hover + .chat-list-item-overlay {
  @apply opacity-100 transition-opacity;
}

.chat-list-item-button + .chat-list-item-overlay {
  @apply opacity-0 transition-opacity;
}

.chat-list-item-div .chat-list-item-overlay {
  @apply absolute z-10 left-0 right-0 top-14
  bg-stone-900 rounded-md pointer-events-none
  flex flex-col items-start px-4 py-2;
}

.chat-list-item-overlay-note {
  @apply flex flex-row items-center text-sm;
}

.chat-list-item-overlay-note svg {
  @apply pr-2;
}
</style>
