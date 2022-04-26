<template>
  <party-invite-dialog ref="dialog" />
  <div
    class="chat-list-ctx-menu"
    ref="contextMenu"
    @mouseleave="hideContextMenu"
  >
    <div class="chat-list-ctx-menu-inner">
      <button class="chat-list-ctx-menu-item" @click="inviteToParty">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
          <!--! Font Awesome Free 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. -->
          <path
            d="M224 256c70.7 0 128-57.31 128-128S294.7 0 224 0C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3C0 496.5 15.52 512 34.66 512h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304zM616 200h-48v-48C568 138.8 557.3 128 544 128s-24 10.75-24 24v48h-48C458.8 200 448 210.8 448 224s10.75 24 24 24h48v48C520 309.3 530.8 320 544 320s24-10.75 24-24v-48h48C629.3 248 640 237.3 640 224S629.3 200 616 200z"
          />
        </svg>
        Invite
      </button>
      <button class="chat-list-ctx-menu-item" @click="joinParty">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <!--! Font Awesome Free 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. -->
          <path
            d="M416 32h-64c-17.67 0-32 14.33-32 32s14.33 32 32 32h64c17.67 0 32 14.33 32 32v256c0 17.67-14.33 32-32 32h-64c-17.67 0-32 14.33-32 32s14.33 32 32 32h64c53.02 0 96-42.98 96-96V128C512 74.98 469 32 416 32zM342.6 233.4l-128-128c-12.51-12.51-32.76-12.49-45.25 0c-12.5 12.5-12.5 32.75 0 45.25L242.8 224H32C14.31 224 0 238.3 0 256s14.31 32 32 32h210.8l-73.38 73.38c-12.5 12.5-12.5 32.75 0 45.25s32.75 12.5 45.25 0l128-128C355.1 266.1 355.1 245.9 342.6 233.4z"
          />
        </svg>
        Join Party
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PartyInviteDialog from "@/renderer/components/PartyInviteDialog.vue";

export default defineComponent({
  name: "ChatListContextMenu",
  components: { PartyInviteDialog },
  data: () => {
    return {
      puuid: "",
      name: "",
      tag: "",
      party_id: "",
    };
  },
  expose: ["setPosition"],
  methods: {
    hideContextMenu() {
      const el: HTMLElement = this.$refs.contextMenu as HTMLElement;
      if (el) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
      }
    },
    setPosition(
      x: number,
      y: number,
      puuid: string,
      party_id: string,
      name: string,
      tag: string
    ) {
      this.puuid = puuid;
      this.party_id = party_id;
      this.name = name;
      this.tag = tag;

      const el: HTMLElement = this.$refs.contextMenu as HTMLElement;
      if (el) {
        if (x + el.clientWidth > window.innerWidth)
          x = window.innerWidth - el.clientWidth;
        if (y + el.clientWidth > window.innerHeight)
          y = window.innerHeight - el.clientHeight;

        x -= 5;
        y -= 5;

        el.style.top = y + "px";
        el.style.left = x + "px";
        el.style.opacity = "100";
        el.style.pointerEvents = "auto";
      }
    },
    showDialog(msg: string) {
      (this.$refs.dialog as InstanceType<typeof PartyInviteDialog>).show(msg);
    },
    inviteToParty() {
      /* 
      Returns:
      0 - Failed
      1 - Invited
      2 - Already in Party
      */
      window.ipc
        ?.invoke("VALORANT_PARTY", "INVITE", this.name, this.tag)
        .then((res) => {
          if (res == 0)
            this.showDialog(
              "Invite Failed\nCheck that the VALORANT game is open"
            );
          else if (res == 1) this.showDialog("Invite Successful");
          else if (res == 2) this.showDialog("Invite Failed\nAlready in party");
        });
      this.hideContextMenu();
    },
    joinParty() {
      /* 
      Returns:
      0 - Failed
      1 - Accepted Invite
      2 - Requested to Join 
      */
      window.ipc
        ?.invoke("VALORANT_PARTY", "JOIN", this.party_id, this.puuid)
        .then((res) => {
          switch (res) {
            case 0:
              this.showDialog(
                "Request Failed\nCheck that the VALORANT game is open"
              );
              break;
            case 1:
              this.showDialog("Invite to Party Accepted");
              break;
            case 2:
              this.showDialog("Requested to Join Party");
              break;
          }
        });
      this.hideContextMenu();
    },
  },
});
</script>

<style lang="postcss">
.chat-list-ctx-menu {
  @apply fixed rounded z-50 
  drop-shadow bg-stone-600 border-none
  transition-opacity opacity-0 pointer-events-none;
}

.chat-list-ctx-menu-item {
  @apply w-full pl-4 pr-5 py-2 
  flex justify-start items-center 
  text-sm
  bg-stone-600;
}
.chat-list-ctx-menu-item:first-child {
  @apply rounded-t;
}
.chat-list-ctx-menu-item:last-child {
  @apply rounded-b;
}
.chat-list-ctx-menu-item:hover {
  @apply bg-stone-500;
}

.chat-list-ctx-menu-item svg {
  @apply fill-white pr-4 w-4;
}
</style>
