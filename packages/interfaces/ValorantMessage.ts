export default interface ValorantMessage {
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
};

export interface ValorantSimpleMessage {
  outgoing: boolean;
  message: string;
  timestamp: number;
};