export interface ValorantRawFriend {
  displayGroup: string;
  game_name: string;
  game_tag: string;
  group: string;
  last_online_ts: number;
  name: string;
  note: string;
  pid: string;
  puuid: string;
  region: string;
}

export default class ValorantFriend {
  gameName: string;
  gameTag: string;
  lastOnlineTimestamp: number;
  note: string;
  pid: string;
  puuid: string;
  region: string;

  constructor(friend: ValorantRawFriend) {
    this.gameName = friend.game_name;
    this.gameTag = friend.game_tag;
    this.lastOnlineTimestamp = friend.last_online_ts;
    this.note = friend.note;
    this.pid = friend.pid;
    this.puuid = friend.puuid;
    this.region = friend.region;
  }
}

export function processFriend(
  friends: ValorantRawFriend[] | undefined
): ValorantFriend[] {
  if(!friends) return [];
  const output: ValorantFriend[] = [];
  return friends?.reduce((arr:ValorantFriend[], currFriend:ValorantRawFriend) => {
    if (currFriend) arr.push(new ValorantFriend(currFriend));
    return arr
  }, output);
}
