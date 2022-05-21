import ValorantFriend from "./ValorantFriend";
import { ValorantMessage } from "./ValorantMessage";
import { ValorantRawPresence } from "./ValorantPresence";

export default interface LcuWebsocketReply {
  data: LcuWebsocketReplyData;
  eventType: string;
  uri: string;
}

interface LcuWebsocketReplyData {
  messages?: ValorantMessage[];
  friends?: ValorantFriend[];
  presences?: ValorantRawPresence[];
}
