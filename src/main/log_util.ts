import fs from "fs";
import path from "path";
import log from "electron-log";

function padTwo(n: number): string {
  return ("0" + n).slice(-2);
}

export function initLog() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${padTwo(now.getMonth() + 1)}${padTwo(
    now.getDate()
  )}`;
  const timeStr = `${padTwo(now.getHours())}${padTwo(now.getMinutes())}${padTwo(
    now.getSeconds()
  )}`;
  const filename = `vcc-${dateStr}-${timeStr}.log`;

  log.transports.console.level = "debug";
  log.transports.file.level = "info";
  log.transports.file.fileName = filename;
  log.transports.file.archiveLog = (oldLogFile) => initLog();

  const parent = path.dirname(log.transports.file.getFile().path);
  const files = fs.readdirSync(parent);
  for (const f of files) {
    if (
      f.endsWith(".log") &&
      (dateStr as unknown as number) - (f.substr(4, 8) as unknown as number) > 1
    ) {
      log.info("Deleting old logs:", f);
      fs.unlinkSync(path.join(parent, f));
    }
  }
}
