import { GAME_MODE } from "../constants";
import log from "electron-log";
import { AxiosResponse } from "axios";

export interface ValorantRawPresence {
  actor: string;
  basic: string;
  details: string;
  game_name: string;
  game_tag: string;
  location: string;
  msg: string;
  name: string;
  patchline: string;
  pid: string;
  platform: string;
  private: string;
  privateJwt: string;
  product: string;
  puuid: string;
  region: string;
  resource: string;
  state: string;
  summary: string;
  time: number;
}

export default class ValorantPresence {
  name: string;
  tag: string;
  pid: string;
  state: string;
  gameState: string; // INGAME, PREGAME, MENUS
  gameMode: string; //"spikerush", "competitive", "deathmatch", "unrated", "snowball" or empty str (custom game)
  scoreAlly: number;
  scoreEnemy: number;
  partyId: string;
  partySize: number;
  cardId: string;
  titleId: string;
  accountLevel: number;
  competitiveTier: number;
  leaderboardPosition: number;

  constructor(presence: ValorantRawPresence) {
    this.state = presence.state;
    this.name = presence.game_name;
    this.tag = presence.game_tag;
    this.pid = presence.pid;

    let privatePresence = JSON.parse(
      Buffer.from(presence.private, "base64").toString("ascii")
    );

    this.gameState = privatePresence["sessionLoopState"];

    if (privatePresence["provisioningFlow"] === "ShootingRange")
      this.gameMode = "In Range";
    else if (privatePresence["provisioningFlow"] === "CustomGame")
      this.gameMode = "Custom";
    else if (privatePresence["provisioningFlow"] === "Matchmaking")
      this.gameMode = "In Queue";
    else
      this.gameMode =
        GAME_MODE.get(privatePresence["queueId"]) ?? privatePresence["queueId"];

    this.scoreAlly = privatePresence["partyOwnerMatchScoreAllyTeam"];
    this.scoreEnemy = privatePresence["partyOwnerMatchScoreEnemyTeam"];
    this.partyId = privatePresence["partyId"];
    this.partySize = privatePresence["partySize"];
    this.cardId = privatePresence["playerCardId"];
    this.titleId = privatePresence["playerTitleId"];
    this.accountLevel = privatePresence["accountLevel"];
    this.competitiveTier = privatePresence["competitiveTier"];
    this.leaderboardPosition = privatePresence["leaderboardPosition"];
  }
}

export class ValorantPresenceSelf extends ValorantPresence {
  matchId?: string;

  constructor(
    presence: ValorantRawPresence,
    getGameId: (endpoint: string) => Promise<AxiosResponse | undefined>
  ) {
    super(presence);
    switch (this.gameState) {
      case "PREGAME":
      case "MENUS":
        getGameId(`/pregame/v1/players/${presence.puuid}`).then((res) => {
          this.matchId = res?.data["MatchID"];
        });
        break;
      case "INGAME":
        getGameId(`/core-game/v1/players/${presence.puuid}`).then(
          (res) => (this.matchId = res?.data["MatchID"])
        );
        break;
      default:
        log.warn("[VALORANT] Invalid game state: " + this.gameState);
    }
  }
}

export function processPresence(
  presences: ValorantRawPresence[] | undefined,
  puuid: string,
  queryFunction: (endpoint: string) => Promise<AxiosResponse | undefined>
): Map<string, ValorantRawPresence> {
  let ret = new Map();
  if (!presences) return ret;
  for (const p of presences) {
    if (p["product"] !== "valorant") continue;
    log.info("[VALORANT] Updating presence: " + p["puuid"]);
    if (p["puuid"] === puuid)
      ret.set(p["puuid"], new ValorantPresenceSelf(p, queryFunction));
    else ret.set(p["puuid"], new ValorantPresence(p));
  }
  return ret;
}
