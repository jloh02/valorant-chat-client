import https from "https";
import log from "electron-log";
import { readFileSync } from "fs";
import { BrowserWindow, ipcMain } from "electron";
import { LCUWebsocket } from "@/main/lcu_websocket";
import axios, { AxiosRequestHeaders, AxiosResponse, Method } from "axios";
import { process_valorant_presence } from "@/types/valorant-presence";
import { ValorantLCUReply } from "@/types/valorant-websocket-reply";

let ws: LCUWebsocket;
let win: BrowserWindow;
let puuid: string, port: string, region: string;
let headers: AxiosRequestHeaders, basicHeaders: AxiosRequestHeaders;

enum RequestType {
  GLZ,
  PD,
  LOCALHOST,
}

function readLocalAppdataFile(path: string): string | undefined {
  let content;
  try {
    content = readFileSync(process.env.LOCALAPPDATA + path).toString("utf-8");
  } catch (err) {
    // AppData file not found
    // if (err instanceof Error && err.message.includes("ENOENT")) {}
  }
  return content;
}

async function query(
  type: RequestType,
  method: Method,
  endpoint: string,
  useBasicHeader?: boolean,
  body?: string | undefined
): Promise<AxiosResponse | undefined> {
  let url = "";
  switch (type) {
    case RequestType.GLZ:
      url = `https://glz-${region}-1.${region}.a.pvp.net`;
      break;
    case RequestType.PD:
      url = `https://pd.${region}.a.pvp.net`;
      break;
    case RequestType.LOCALHOST:
      url = `https://127.0.0.1:${port}`;
      break;
  }
  url += endpoint;

  let res;
  do {
    res = await axios
      .request({
        method: method,
        url: url,
        data: body,
        headers: useBasicHeader ? basicHeaders : headers,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        validateStatus: (status) => true, //Allow all status codes
      })
      .catch((err) => undefined); //Return undefined if error found
  } while (!res);
  return res;
}

export function initialize_valorant_api(browser_window: BrowserWindow) {
  win = browser_window;

  axios.defaults.headers.common["Content-Type"] = "application/json";

  ipcMain.on("IPC_STATUS", (event, command) => {
    if (command != "IPC_READY") return;

    initialize();
  });
}

let ready = false;
let prev_lockfile = "";
const lockfile_polling_rate = 5000;
async function initialize() {
  const lockfile = readLocalAppdataFile(
    "\\Riot Games\\Riot Client\\Config\\lockfile"
  );
  const logs = readLocalAppdataFile("\\VALORANT\\Saved\\Logs\\ShooterGame.log");
  if (lockfile === prev_lockfile) {
    win.webContents.send("IPC_STATUS", "LOCKFILE_UPDATE", ready, puuid);
    setTimeout(initialize, lockfile_polling_rate);
    return;
  }

  log.debug(lockfile);

  const channelNames = ["VALORANT_CHAT", "VALORANT_PRESENCES"];
  channelNames.forEach((channel) => {
    ipcMain.removeHandler(channel);
    ipcMain.removeAllListeners(channel);
  });

  if (!lockfile || !logs) {
    ready = false;
    win.webContents.send("IPC_STATUS", "LOCKFILE_UPDATE", false, undefined);
    prev_lockfile = "";
    setTimeout(initialize, lockfile_polling_rate);
    return;
  }

  const region_match = logs.match(
    /https:\/\/glz-(.{2})-1\.(?:.{2})\.a\.pvp\.net/
  );
  if (region_match) region = region_match[1];

  const lockfileDet = lockfile.split(":");
  port = lockfileDet[2];

  const b64_lockfile_password = Buffer.from(`riot:${lockfileDet[3]}`).toString(
    "base64"
  );

  headers = {
    "Content-Type": "application/json",
    "X-Riot-ClientPlatform":
      "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9",
  };

  basicHeaders = {
    "Content-Type": "application/json",
    Authorization: "Basic " + b64_lockfile_password,
  };

  //Get token and entitlement
  const entRet = await query(
    RequestType.LOCALHOST,
    "GET",
    "/entitlements/v1/token",
    true
  );
  if (entRet) {
    const entJson = entRet.data;
    puuid = entJson["subject"];
    headers["Authorization"] = "Bearer " + entJson["accessToken"]; //Set token
    headers["X-Riot-Entitlements-JWT"] = entJson["token"]; //Set entitlement
    log.debug(entJson);
  }

  const verRes = await axios.get("https://valorant-api.com/v1/version");
  headers["X-Riot-ClientVersion"] = verRes.data["data"]["riotClientVersion"];
  log.debug(verRes);

  ws = new LCUWebsocket(lockfileDet[3], port);
  ws.onReady(async () => {
    await initialize_presence_monitoring();
    log.debug("Initialized presence monitoring");
    create_chat_listeners();
    log.debug("Created chat monitoring");

    ready = true;
    prev_lockfile = lockfile;
    win.webContents.send("IPC_STATUS", "LOCKFILE_UPDATE", true, puuid);
    setTimeout(initialize, lockfile_polling_rate);
  });
}

function convert_query_to_ipc_msg(res: AxiosResponse | undefined): object {
  return {
    status: res?.status,
    data: res?.data,
  };
}

async function initialize_presence_monitoring() {
  async function query_game(
    endpoint: string
  ): Promise<AxiosResponse | undefined> {
    return await query(RequestType.GLZ, "GET", endpoint);
  }
  let pres;
  do {
    pres = await query(
      RequestType.LOCALHOST,
      "GET",
      "/chat/v4/presences",
      true
    );
  } while (!pres || pres.status != 200);
  if (pres.data) {
    win.webContents.send(
      "VALORANT_PRESENCES",
      "Update",
      process_valorant_presence(pres.data["presences"], puuid, query_game)
    );
  }
  ws.subscribe("OnJsonApiEvent_chat_v4_presences", (pres: ValorantLCUReply) => {
    win.webContents.send(
      "VALORANT_PRESENCES",
      pres.eventType,
      process_valorant_presence(pres.data.presences, puuid, query_game)
    );
  });
}

function create_chat_listeners() {
  ipcMain.handle("VALORANT_CHAT", async (event, command, cid, message) => {
    let res: AxiosResponse | undefined;

    //Query for 5s to ensure msgs/friends not empty (Chat server takes awhile to start)
    switch (command) {
      case "SEND":
        return convert_query_to_ipc_msg(
          await query(
            RequestType.LOCALHOST,
            "POST",
            "/chat/v6/messages",
            true,
            `{"cid": "${cid}","message": "${message}","type": "chat"}`
          )
        );
      case "FRIENDS":
        do {
          res = await query(
            RequestType.LOCALHOST,
            "GET",
            "/chat/v4/friends",
            true
          );
        } while (!res || res.status != 200 || res.data["friends"].length == 0);
        return convert_query_to_ipc_msg(res);
      case "HISTORY":
        do {
          res = await query(
            RequestType.LOCALHOST,
            "GET",
            "/chat/v6/messages",
            true
          );
        } while (!res || res.status != 200 || res.data["messages"].length == 0);
        return convert_query_to_ipc_msg(res);
      default:
        console.warn("Unknown VALORANT_CHAT message: " + command);
    }
  });
  ws.subscribe("OnJsonApiEvent_chat_v6_messages", (res) => {
    win.webContents.send("VALORANT_CHAT", "MESSAGE", res.data.messages);
  });
  ws.subscribe("OnJsonApiEvent_chat_v4_friends", (res) => {
    win.webContents.send("VALORANT_CHAT", "FRIEND", res.data.friends);
  });
}
