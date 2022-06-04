export const GAME_MODE: Map<string, string> = new Map([
  ["", "Custom"],
  ["ggteam", "Escalation"],
  ["onefa", "Replication"],
  ["Spikerush", "Spike Rush"],
]);

export const SCREEN_DEFAULTS = {
  updaterWidth: 500,
  updaterHeight: 150,
  mainWidth: 1200,
  mainHeight: 800,
  minWidth: 750,
  minHeight: 500,
};

export const LOCKFILE_POLLING_RATE = 5000; //in ms
export const NOTIFICATION_TIMEOUT = 5000; //in ms