<template>
  <div class="riot-client-closed">
    <div>Error</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Error",
});
</script>

<style lang="postcss">
.riot-client-closed {
  @apply flex flex-col justify-center items-center;
}
</style>
