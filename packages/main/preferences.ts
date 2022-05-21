import { App, BrowserWindow } from "electron";
import log from "electron-log";
import { readFileSync, writeFileSync, existsSync } from "fs";

class Preferences {
  minimizeToTray = true;
  notifications = true;
  winWidth?: number = undefined;
  winHeight?: number = undefined;
  winX?: number = undefined;
  winY?: number = undefined;
}

let prefsPath: string;
let prefs = new Preferences();

//Returns true if presence already exists
export function readPreferences(app: App): boolean {
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

export function getPreference(
  option: keyof Preferences
): Preferences[typeof option] {
  return prefs[option];
}

export function setPreference<K extends keyof Preferences>(
  option: K,
  value: Preferences[K]
) {
  prefs[option] = value;
  const prefStr = writePreferences();
  if (!option.startsWith("win"))
    log.info("[Preferences] Saved preference: " + prefStr);
}

export function saveWindowPreferences(win: BrowserWindow) {
  const bounds = win.getNormalBounds();
  setPreference("winWidth", bounds.width);
  setPreference("winHeight", bounds.height);
  setPreference("winX", bounds.x);
  setPreference("winY", bounds.y);
}
