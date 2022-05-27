<template>
  <li
    :class="props.outgoing ? 'chat-message outgoing' : 'chat-message incoming'"
  >
    <div>
      <p>{{ props.message }}</p>
    </div>
  </li>
</template>

<script lang="ts" setup>
const props = defineProps<{
  outgoing: boolean;
  message: string;
}>();
</script>

<style lang="scss" scoped>
.chat-message {
  @extend .flex;
  height: min-content;
  width: 75%;
  text-align: justify;

  div {
    padding: 0.75rem;
    margin: 0.25rem;
    border-radius: 0.25rem;
  }
}
.outgoing {
  margin-left: 25%;
  justify-content: flex-end;

  div {
    background-color: $background-lighter;
  }
}
.incoming {
  margin-right: 25%;
  justify-content: flex-start;

  div {
    background-color: $background-dark-accent;
  }
}
</style>
