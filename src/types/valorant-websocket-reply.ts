import { ValorantFriend } from "./valorant-friend";
import { ValorantMessage } from "./valorant-message";
import { ValorantRawPresence } from "./valorant-presence";

export type ValorantLCUReply = {
  data: ValorantLCUReplyData;
  eventType: string;
  uri: string;
};

type ValorantLCUReplyData = {
  messages?: ValorantMessage[];
  friends?: ValorantFriend[];
  presences?: ValorantRawPresence[];
};
