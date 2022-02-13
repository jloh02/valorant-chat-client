"use strict";

import https from "https";
import { readFileSync } from "fs";
import { BrowserWindow, ipcMain } from "electron";
import { LCUWebsocket } from "@/ipc_main/lcu_websocket";
import axios, { AxiosRequestHeaders, AxiosResponse, Method } from "axios";
import {
  ValorantPresence,
  process_valorant_presence,
} from "@/ipc_main/valorant_presence";

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
  var content;
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

  return await axios.request({
    method: method,
    url: url,
    data: body,
    headers: useBasicHeader ? basicHeaders : headers,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });
}

let prev_lockfile = "";
export function initialize_valorant_api(browser_window: BrowserWindow) {
  win = browser_window;

  axios.defaults.headers.common["Content-Type"] = "application/json";
  var ready = false,
    started = false;
  ipcMain.on("IPC_READY", () => {
    if (started) return;
    started = true;
    setInterval(async () => {
      const lockfile = readLocalAppdataFile(
        "\\Riot Games\\Riot Client\\Config\\lockfile"
      );
      const logs = readLocalAppdataFile(
        "\\VALORANT\\Saved\\Logs\\ShooterGame.log"
      );
      if (lockfile === prev_lockfile) {
        win.webContents.send("LOCKFILE_UPDATE", ready);
        return;
      }
      if (!lockfile || !logs) {
        ready = false;
        win.webContents.send("LOCKFILE_UPDATE", false);
        return;
      }
      prev_lockfile = lockfile;

      const region_match = logs.match(
        /https:\/\/glz-(.{2})-1\.(?:.{2})\.a\.pvp\.net/
      );
      if (region_match) region = region_match[1];

      const lockfileDet = lockfile.split(":");
      port = lockfileDet[2];

      const b64_lockfile_password = Buffer.from(
        `riot:${lockfileDet[3]}`
      ).toString("base64");

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
        console.log(entJson);
      }

      const verRes = await axios.get("https://valorant-api.com/v1/version");
      headers["X-Riot-ClientVersion"] =
        verRes.data["data"]["riotClientVersion"];

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
      ws.onReady(() => {
        win.webContents.send("VALORANT_SOCKET_READY");
        initialize_presence_monitoring();
      });

      create_lcusocket_listeners();
      create_chat_listeners();
      create_agent_select_listeners();

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

      // const friendRet = await query(
      //   RequestType.LOCALHOST,
      //   "GET",
      //   "/chat/v4/friends",
      //   true
      // );
      // if (friendRet) console.log(friendRet.data);
      ready = true;
      win.webContents.send("LOCKFILE_UPDATE", true);
    }, 5000);
  });
}

function convert_query_to_ipc_msg(res: AxiosResponse | undefined): object {
  return {
    status: res?.status,
    data: res?.data,
  };
}

function initialize_presence_monitoring() {
  async function query_game(
    endpoint: string
  ): Promise<AxiosResponse | undefined> {
    return await query(RequestType.GLZ, "GET", endpoint);
  }
  query(RequestType.LOCALHOST, "GET", "/chat/v4/presences", true).then(
    (pres) => {
      if (pres && pres.data) {
        win.webContents.send(
          "VALORANT_PRESENCES",
          process_valorant_presence(pres.data["presences"], puuid, query_game)
        );
      }
    }
  );
  ws.subscribe("OnJsonApiEvent_chat_v4_presences", (pres) => {
    win.webContents.send(
      "VALORANT_PRESENCES",
      process_valorant_presence(pres["data"]["presences"], puuid, query_game)
    );
  });
}

async function create_lcusocket_listeners() {
  ipcMain.on(
    "VALORANT_SOCKET_SUBSCRIBE",
    (event, endpoint: string, callback: (data: JSON) => void) =>
      ws.subscribe(endpoint, (data) => callback(data))
  );

  ipcMain.on("VALORANT_SOCKET_UNSUBSCRIBE", (event, endpoint: string) =>
    ws.unsubscribe(endpoint)
  );
}

async function create_chat_listeners() {
  ipcMain.handle("VALORANT_CHAT_SEND", async (event, cid, message) =>
    convert_query_to_ipc_msg(
      await query(
        RequestType.LOCALHOST,
        "POST",
        "/chat/v6/messages",
        true,
        `{"cid": "${cid}","message": "${message}","type": "chat"}`
      )
    )
  );

  ipcMain.handle("VALORANT_CHAT_FRIENDS", async (event) =>
    convert_query_to_ipc_msg(
      await query(RequestType.LOCALHOST, "GET", "/chat/v4/friends", true)
    )
  );

  ipcMain.handle("VALORANT_CHAT_HISTORY", async (event) =>
    convert_query_to_ipc_msg(
      await query(RequestType.LOCALHOST, "GET", "/chat/v6/messages", true)
    )
  );
}

async function create_agent_select_listeners() {
  ipcMain.handle(
    "VALORANT_PREGAME_SELECTAGENT",
    async (event) =>
      await query(
        RequestType.GLZ,
        "POST",
        "/chat/v6/messages",
        false,
        `/pregame/v1/matches/{pre-game match id}/select/{agent id}`
      )
  );
}
