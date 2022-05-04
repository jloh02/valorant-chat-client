import { App } from "electron";
import log from "electron-log";
import { readFileSync, writeFileSync, existsSync } from "fs";

class Preferences {
  minimizeToTray = true;
  notifications = true;
}

let prefsPath: string,
  prefs = new Preferences();

export function initialize_preferences(app: App) {
  const appPath = app.getPath("userData");
  prefsPath = appPath + "preferences.json";

  log.info("[Preferences] Path to Preferences: " + prefsPath);
  if (existsSync(prefsPath)) {
    const prefStr = readFileSync(prefsPath, "utf-8");
    prefs = JSON.parse(prefStr);
    log.info("[Preferences] Found preferences: " + prefStr);
  } else {
    const prefStr = writePreferences();
    log.info("[Preferences] Initializing new preferences: " + prefStr);
  }
}

function writePreferences() {
  const prefStr = JSON.stringify(prefs);
  writeFileSync(prefsPath, prefStr);
  return prefStr;
}

export function get_preference(option: string): boolean | undefined {
  return (prefs as any)[option];
}

export function flip_preference(option: string) {
  if (option in prefs) (prefs as any)[option] = !(prefs as any)[option];
  const prefStr = writePreferences();
  log.info("[Preferences] Saved preference: " + prefStr);
}
