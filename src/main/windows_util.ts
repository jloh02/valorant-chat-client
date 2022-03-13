import path from "path";
import log from "electron-log";
import child_process from "child_process";

export async function runRiotClient() {
  let regedit = require("regedit");
  regedit.setExternalVBSLocation(path.join(__static, "vbs"));

  const regPath =
    "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Riot Game valorant.live";
  regedit.list(
    regPath,
    function (
      err: Error | undefined,
      result: RegistryItemCollection<string[]>
    ) {
      if (err) log.warn(err);
      if (result[regPath].exists) {
        const unins = result[regPath].values.UninstallString.value;
        log.debug(unins);
        if (unins) child_process.exec(unins.split(" --uninstall")[0]);
      }
    }
  );
}
