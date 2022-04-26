<template>
  <div :class="'party-invite-dialog ' + this.visibility">
    {{ this.msg }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PartyInviteDialog",
  data: () => {
    return {
      msg: "",
      visibility: "no-show",
      timeout: 0,
    };
  },
  expose: ["show"],
  methods: {
    show(msg: string) {
      this.msg = msg;
      this.visibility = "show";
      clearTimeout(this.timeout);
      this.timeout = setTimeout(
        () => (this.visibility = "no-show"),
        2500
      ) as unknown as number;
    },
  },
});
</script>

<style lang="postcss">
.party-invite-dialog {
  transform: translateX(-50%);
  left: calc(50% - min(calc(33.33333% + 1rem), 300px) / 2);
  @apply fixed top-9 px-5 py-3
  rounded bg-red-600 shadow-2xl
  whitespace-pre-line;
}

.party-invite-dialog.no-show {
  @apply transition-opacity opacity-0;
}
.party-invite-dialog.show {
  @aplpy transition-opacity opacity-100;
}
</style>
