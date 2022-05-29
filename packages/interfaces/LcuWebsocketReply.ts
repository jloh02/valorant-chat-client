import { ValorantRawFriend } from "./ValorantFriend";
import { ValorantRawMessage } from "./ValorantMessage";
import { ValorantRawPresence } from "./ValorantPresence";

export default interface LcuWebsocketReply {
  data: LcuWebsocketReplyData;
  eventType: string;
  uri: string;
}

interface LcuWebsocketReplyData {
  messages?: ValorantRawMessage[];
  friends?: ValorantRawFriend[];
  presences?: ValorantRawPresence[];
}
