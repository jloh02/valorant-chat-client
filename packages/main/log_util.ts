import fs from "fs";
import path from "path";
import log from "electron-log";

function padTwoDigit(n: number): string {
  return ("0" + n).slice(-2);
}

export function initLog() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${padTwoDigit(
    now.getMonth() + 1
  )}${padTwoDigit(now.getDate())}`;
  const timeStr = `${padTwoDigit(now.getHours())}${padTwoDigit(
    now.getMinutes()
  )}${padTwoDigit(now.getSeconds())}`;
  const filename = `vcc-${dateStr}-${timeStr}.log`;

  log.transports.console.level = "debug";
  log.transports.file.level = "info";
  log.transports.file.fileName = filename;
  log.transports.file.archiveLog = (oldLogFile) => {
    initLog();
  };

  const parent = path.dirname(log.transports.file.getFile().path);
  const files = fs.readdirSync(parent);
  for (const f of files) {
    if (
      f.endsWith(".log") &&
      (dateStr as unknown as number) - (f.substr(4, 8) as unknown as number) > 1
    ) {
      log.info("[Logger] Deleting old logs:", f);
      fs.unlinkSync(path.join(parent, f));
    }
  }
}
