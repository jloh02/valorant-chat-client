import log from "electron-log";
import child_process from "child_process";
import regedit, { RegistryItemCollection } from "regedit";

export async function startRiotClient() {
  regedit.setExternalVBSLocation(
    process.env.NODE_ENV === "production" ? "resources/regedit/vbs" : "vbs"
  );

  const regPath = [
    "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Riot Game valorant.live",
  ];
  regedit.list(
    regPath,
    (err: Error | undefined, result: RegistryItemCollection<string[]>) => {
      if (err) {
        log.warn("[WINDOWS] Registry error: " + err);
      } else if (result[regPath[0]].exists) {
        const uninstallPath = result[regPath[0]].values.UninstallString
          .value as string;
        log.info("[WINDOWS] Uninstall Path: " + uninstallPath);
        if (uninstallPath)
          child_process.exec(uninstallPath.split(" --uninstall")[0]);
      }
    }
  );
}
