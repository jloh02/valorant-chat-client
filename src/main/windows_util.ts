import { registry } from "windows";
import child_process from "child_process";

export async function runRiotClient() {
  const reg = registry(
    "HKCU/SOFTWARE/Microsoft/Windows/CurrentVersion/Uninstall/Riot Game valorant.live"
  );
  const unins = reg.UninstallString.value;
  if (unins)
    child_process.exec(reg.UninstallString.value.split(" --uninstall")[0]);
}
