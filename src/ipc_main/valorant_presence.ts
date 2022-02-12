"use strict";

import { AxiosResponse } from "axios";

export class ValorantPresence {
  ign: string;
  pid: string;
  state: string; //TODO check "away"
  game_state: string; // INGAME, PREGAME, MENUS
  game_mode: string; //"spikerush", "competitive", "deathmatch", "unrated", "snowball" or empty str (custom game)
  score_ally: number;
  score_enemy: number;
  party_id: string;
  party_size: number;

  constructor(presence: any) {
    this.state = presence["state"];
    this.ign = `${presence["game_name"]}#${presence["game_tag"]}`;
    this.pid = presence["pid"];

    var private_presence = JSON.parse(
      Buffer.from(presence["private"], "base64").toString("ascii")
    );

    this.game_state = private_presence["sessionLoopState"];
    this.game_mode = private_presence["queueId"];
    this.score_ally = private_presence["partyOwnerMatchScoreAllyTeam"];
    this.score_enemy = private_presence["partyOwnerMatchScoreEnemyTeam"];
    this.party_id = private_presence["partyId"];
    this.party_size = private_presence["partySize"];
  }
}

export class ValorantPresenceSelf extends ValorantPresence {
  match_id?: string;

  constructor(
    presence: any,
    get_game_id: (endpoint: string) => Promise<AxiosResponse | undefined>
  ) {
    super(presence);
    switch (this.game_state) {
      case "PREGAME":
        get_game_id(`/pregame/v1/players/${presence["puuid"]}`).then((res) => {
          this.match_id = res?.data["MatchID"];
        });
        break;
      case "INGAME":
        get_game_id(`/core-game/v1/players/${presence["puuid"]}`).then(
          (res) => (this.match_id = res?.data["MatchID"])
        );
        break;
    }
  }
}

export function process_valorant_presence(
  presences: any,
  puuid: string,
  query_function: (endpoint: string) => Promise<AxiosResponse | undefined>
): Map<string, ValorantPresence> {
  var ret = new Map();
  for (var p of presences) {
    console.log(p["puuid"]);
    if (p["puuid"] == puuid) {
      ret.set(p["puuid"], new ValorantPresenceSelf(p, query_function));
    } else ret.set(p["puuid"], new ValorantPresence(p));
  }
  return ret;
}
