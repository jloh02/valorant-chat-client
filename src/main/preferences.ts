import { App } from "electron";
import log from "electron-log";
import { readFileSync, writeFileSync, existsSync } from "fs";

class Preferences {
  minimizeToTray = true;
  notifications = true;
  _winWidth?: number = undefined;
  _winHeight?: number = undefined;
  _winX?: number = undefined;
  _winY?: number = undefined;
}

let prefsPath: string,
  prefs = new Preferences();

//Returns true of presence already exists
export function initialize_preferences(app: App): boolean {
  const appPath = app.getPath("userData");
  prefsPath = appPath + "/preferences.json";
  log.info("[Preferences] Path to Preferences: " + prefsPath);

  try {
    if (existsSync(prefsPath)) {
      const prefStr = readFileSync(prefsPath, "utf-8");
      prefs = JSON.parse(prefStr);
      log.info("[Preferences] Found preferences: " + prefStr);
      return true;
    }
  } catch (e) {
    log.warn("[Preferences] Error: " + JSON.stringify(e));
  }

  const prefStr = writePreferences();
  log.info("[Preferences] Initializing new preferences: " + prefStr);
  return false;
}

function writePreferences() {
  const prefStr = JSON.stringify(prefs);
  writeFileSync(prefsPath, prefStr);
  return prefStr;
}

export function get_preference(option: string): boolean | number | undefined {
  return (prefs as any)[option];
}

export function flip_preference(option: string) {
  if (option in prefs) (prefs as any)[option] = !(prefs as any)[option];
  const prefStr = writePreferences();
  if (option.charAt(0) != "_")
    log.info("[Preferences] Saved preference: " + prefStr);
}

export function set_preference(option: string, value: number) {
  if (option in prefs) (prefs as any)[option] = value;
  const prefStr = writePreferences();
  if (option.charAt(0) != "_")
    log.info("[Preferences] Saved preference: " + prefStr);
}
