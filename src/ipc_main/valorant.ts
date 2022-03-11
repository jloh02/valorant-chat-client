"use strict";

import https from "https";
import { readFileSync } from "fs";
import { BrowserWindow, ipcMain } from "electron";
import { LCUWebsocket } from "@/ipc_main/lcu_websocket";
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
    if (err instanceof Error && err.message.includes("ENOENT")) {
      // console.log("File not found");
    }
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
    // console.log(entJson);
  }

  const verRes = await axios.get("https://valorant-api.com/v1/version");
  headers["X-Riot-ClientVersion"] = verRes.data["data"]["riotClientVersion"];

  // const sessRet = await query(
  //   RequestType.LOCALHOST,
  //   "GET",
  //   "/chat/v1/session",
  //   true
  // );
  // if (sessRet) console.log(sessRet.data);

  // const extSessionRet = await query(
  //   RequestType.LOCALHOST,
  //   "GET",
  //   "/product-session/v1/external-sessions",
  //   true
  // );
  // if (extSessionRet) {
  //   const extSessionJson = extSessionRet?.data;
  //   ign = `${extSessionJson["game_name"]}#${extSessionJson["game_tag"]}`;
  //   console.log(extSessionJson);
  // }

  ws = new LCUWebsocket(lockfileDet[3], port);
  ws.onReady(async () => {
    await initialize_presence_monitoring();

    create_chat_listeners();
    create_agent_select_listeners();

    ready = true;
    prev_lockfile = lockfile;
    win.webContents.send("IPC_STATUS", "LOCKFILE_UPDATE", true, puuid);
    setTimeout(initialize, lockfile_polling_rate);
  });

  // query(RequestType.PD, "GET", `/mmr/v1/players/${puuid}`).then((r) => {
  //   console.log("Testing");
  //   console.log(r?.status);
  //   console.log(r?.data);
  // });

  // query(RequestType.LOCALHOST, "GET", "/help", true).then((r) => {
  //   console.log(r.status);
  //   console.log(r.data);
  // });

  // query(
  //   RequestType.LOCALHOST,
  //   "POST",
  //   "/chat/v6/messages",
  //   true,
  //   '{"cid": "095dfd66-c9ed-5d18-920c-1410c6c6cff8@jp1.pvp.net","message": "testing jon","type": "chat"}'
  // ).then((msgRet) => {
  //   if (msgRet) {
  //     console.log(msgRet.status);
  //     console.log(msgRet.data);
  //   }
  // });
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
    console.log(pres.eventType);
    if (pres.eventType == "Delete") console.log(pres.data.presences);
    win.webContents.send(
      "VALORANT_PRESENCES",
      pres.eventType,
      process_valorant_presence(pres.data.presences, puuid, query_game)
    );
  });
}

// function create_lcusocket_listeners() {
//   ipcMain.on(
//     "VALORANT_SOCKET",
//     (event, command, endpoint: string, callback: (data: JSON) => void) => {
//       if (command == "SUBSCRIBE")
//         ws.subscribe(endpoint, (data) => callback(data));
//       else if (command == "UNSUBSCRIBE") ws.unsubscribe(endpoint);
//     }
//   );
// }

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
          // console.log(res?.data["friends"].length);
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
          // console.log(res?.data["messages"].length);
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

function create_agent_select_listeners() {
  ipcMain.handle(
    "VALORANT_PREGAME",
    async (event, command, match_id, agent_id) => {
      switch (command) {
        case "SELECT":
          return await query(
            RequestType.GLZ,
            "POST",
            "/chat/v6/messages",
            false,
            `/pregame/v1/matches/${match_id}/select/${agent_id}`
          );
        default:
          console.warn("Unknown VALORANT_PREGAME message: " + command);
          return undefined;
      }
    }
  );
}
