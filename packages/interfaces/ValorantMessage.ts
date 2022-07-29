export interface ValorantRawMessage {
  body: string;
  cid: string;
  game_name: string;
  game_tag: string;
  id: string;
  mid: string;
  name: string;
  pid: string;
  puuid: string;
  read: boolean;
  region: string;
  time: string;
  type: string;
}

export default class ValorantMessage {
  body: string;
  cid: string;
  gameName: string;
  gameTag: string;
  id: string;
  mid: string;
  pid: string;
  puuid: string;
  time: string;

  constructor(msg: ValorantRawMessage) {
    this.body = msg.body;
    this.cid = msg.cid;
    this.gameName = msg.game_name;
    this.gameTag = msg.game_tag;
    this.id = msg.id;
    this.mid = msg.mid;
    this.pid = msg.pid;
    this.puuid = msg.puuid;
    this.time = msg.time;
  }
}

export interface ValorantSimpleMessage {
  outgoing: boolean;
  message: string;
  timestamp: number;
}

export function processMessage(
  messages: ValorantRawMessage[] | undefined
): ValorantMessage[] {
  if (!messages) return [];
  return messages?.reduce(
    (arr: ValorantMessage[], currFriend: ValorantRawMessage) => {
      if (currFriend) arr.push(new ValorantMessage(currFriend));
      return arr;
    },
    []
  );
}
