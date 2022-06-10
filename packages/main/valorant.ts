import { LOCKFILE_POLLING_RATE } from "./../constants";
import https from "https";
import log from "electron-log";
import { readFileSync } from "fs";
import { BrowserWindow, ipcMain } from "electron";
import axios, { AxiosRequestHeaders, AxiosResponse, Method } from "axios";
import LcuWebsocketReply from "@interfaces/LcuWebsocketReply";
import LcuWebSocket from "@interfaces/LcuWebsocket";
import { processPresence } from "@interfaces/ValorantPresence";
import { processFriend } from "@interfaces/ValorantFriend";
import { processMessage } from "@interfaces/ValorantMessage";

let ws: LcuWebSocket;
let win: BrowserWindow;
let puuid: string,
  gameName: string,
  port: string,
  region: string,
  shard: string;
let headers: AxiosRequestHeaders, basicHeaders: AxiosRequestHeaders;

enum RequestType {
  GLZ,
  PD,
  LOCALHOST,
}

function readLocalAppdataFile(path: string): string | undefined {
  let content;
  try {
    content = readFileSync(process.env["LOCALAPPDATA"] + path).toString(
      "utf-8"
    );
  } catch (err) {
    log.error("[VALORANT] LocalAppData Error: " + JSON.stringify(err));
  }
  return content;
}

async function query(
  type: RequestType,
  method: Method,
  endpoint: string,
  useBasicHeader?: boolean,
  body?: string | object | undefined
): Promise<AxiosResponse | undefined> {
  let url = "";
  switch (type) {
    case RequestType.GLZ:
      url = `https://glz-${region}-1.${shard}.a.pvp.net`;
      break;
    case RequestType.PD:
      url = `https://pd.${shard}.a.pvp.net`;
      break;
    case RequestType.LOCALHOST:
      url = `https://127.0.0.1:${port}`;
      break;
    default:
      log.warn("[VALORANT] Invalid request type: " + type);
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

export function initializeValorantApi(browserWindow: BrowserWindow) {
  win = browserWindow;

  axios.defaults.headers.common["Content-Type"] = "application/json";

  ipcMain.on("IPC_STATUS", (event, command) => {
    if (command !== "IPC_READY") return;

    initialize();
  });
}

function failInitialize() {
  win.webContents.send(
    "IPC_STATUS",
    "LOCKFILE_UPDATE",
    false,
    undefined,
    undefined
  );
  prevLockfile = "";
  setTimeout(initialize, LOCKFILE_POLLING_RATE);
}

let prevLockfile = "";
async function initialize() {
  const lockfile = readLocalAppdataFile(
    "\\Riot Games\\Riot Client\\Config\\lockfile"
  );
  const shooterlogs = readLocalAppdataFile(
    "\\VALORANT\\Saved\\logs\\ShooterGame.log"
  );

  if (lockfile === prevLockfile) {
    setTimeout(initialize, LOCKFILE_POLLING_RATE);
    return;
  }

  log.info("[VALORANT] Lockfile data: " + lockfile);

  const channelNames = [
    "VALORANT_CHAT",
    "VALORANT_PRESENCES",
    "VALORANT_PARTY",
  ];
  channelNames.forEach((channel) => {
    ipcMain.removeHandler(channel);
    ipcMain.removeAllListeners(channel);
  });

  let regionShardMatch = shooterlogs?.match(
    /https:\/\/glz-(.{2,5})-1\.(.{2,3})\.a\.pvp\.net/
  );

  if (
    !lockfile ||
    !shooterlogs ||
    !regionShardMatch ||
    !regionShardMatch[1] ||
    !regionShardMatch[2]
  ) {
    failInitialize();
    return;
  }

  region = regionShardMatch[1];
  shard = regionShardMatch[2];
  log.info("[VALORANT] Region: " + region);
  log.info("[VALORANT] Shard: " + shard);

  const lockfileDet = lockfile.split(":");
  port = lockfileDet[2];

  const base64LockfilePassword = Buffer.from(`riot:${lockfileDet[3]}`).toString(
    "base64"
  );

  headers = {
    "Content-Type": "application/json",
    "X-Riot-ClientPlatform":
      "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9",
  };

  basicHeaders = {
    "Content-Type": "application/json",
    Authorization: "Basic " + base64LockfilePassword,
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
    log.info("[VALORANT] Entitlement: " + JSON.stringify(entJson));
  } else failInitialize();

  //Get User Info
  const authUserInfoRet = await query(
    RequestType.LOCALHOST,
    "GET",
    "/rso-auth/v1/authorization/userinfo",
    true
  );
  if (authUserInfoRet) {
    const authUserInfoJson = authUserInfoRet.data;
    const userInfo = JSON.parse(authUserInfoJson.userInfo);
    gameName = userInfo.acct.game_name;
    log.info("[VALORANT] Auth User Info: " + JSON.stringify(userInfo));
  } else failInitialize();

  const verRes = await axios.get("https://valorant-api.com/v1/version");
  headers["X-Riot-ClientVersion"] = verRes.data["data"]["riotClientVersion"];
  log.info(
    "[VALORANT] Riot Client Version: " +
      verRes.data["data"]["riotClientVersion"]
  );

  ws = new LcuWebSocket(lockfileDet[3], port);
  ws.onReady(async () => {
    await initPresenceMonitoring();
    log.info("[VALORANT] Initialized presence monitoring");
    initChatListeners();
    log.info("[VALORANT] Created chat monitoring");
    initPartyListeners();
    log.info("[VALORANT] Created party monitoring");

    prevLockfile = lockfile;
    win.webContents.send(
      "IPC_STATUS",
      "LOCKFILE_UPDATE",
      true,
      puuid,
      gameName
    );
    setTimeout(initialize, LOCKFILE_POLLING_RATE);
  });
}

function convertQueryToIpcMsg(res: AxiosResponse | undefined): object {
  return {
    status: res?.status,
    data: res?.data,
  };
}

async function initPresenceMonitoring() {
  async function queryGame(
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
  } while (!pres || pres.status !== 200);
  if (pres.data) {
    win.webContents.send(
      "VALORANT_PRESENCES",
      "Update",
      processPresence(pres.data["presences"], puuid, queryGame)
    );
  }
  ws.subscribe(
    "OnJsonApiEvent_chat_v4_presences",
    (pres: LcuWebsocketReply) => {
      win.webContents.send(
        "VALORANT_PRESENCES",
        pres.eventType,
        processPresence(pres.data.presences, puuid, queryGame)
      );
    }
  );
}

function initChatListeners() {
  ipcMain.handle("VALORANT_CHAT", async (event, command, cid, message) => {
    let res: AxiosResponse | undefined;

    //Query for 5s to ensure msgs/friends not empty (Chat server takes awhile to start)
    switch (command) {
      case "SEND":
        res = await query(
          RequestType.LOCALHOST,
          "POST",
          "/chat/v6/messages",
          true,
          { cid: cid, message: message, type: "chat" }
        );
        log.info("[VALORANT] Send Message: " + JSON.stringify(res?.data));
        return convertQueryToIpcMsg(res);
      case "FRIENDS":
        do {
          res = await query(
            RequestType.LOCALHOST,
            "GET",
            "/chat/v4/friends",
            true
          );
        } while (!res || res.status !== 200 || res.data.friends.length === 0);
        log.info("[VALORANT] Friends Request: " + res?.data.friends.length);
        return processFriend(res.data.friends);
      case "HISTORY":
        do {
          res = await query(
            RequestType.LOCALHOST,
            "GET",
            "/chat/v6/messages",
            true
          );
        } while (!res || res.status !== 200 || res.data.messages.length === 0);
        log.info("[VALORANT] Message History: " + res?.data.messages.length);
        return processMessage(res.data.messages);
      default:
        log.warn("Unknown VALORANT_CHAT message: " + command);
    }
  });
  ws.subscribe("OnJsonApiEvent_chat_v6_messages", (res) => {
    win.webContents.send(
      "VALORANT_CHAT",
      "MESSAGE",
      processMessage(res.data.messages)
    );
  });
  ws.subscribe("OnJsonApiEvent_chat_v4_friends", (res) => {
    win.webContents.send(
      "VALORANT_CHAT",
      "FRIEND",
      processFriend(res.data.friends)
    );
  });
}

async function initPartyListeners() {
  ipcMain.handle("VALORANT_PARTY", async (event, command, paramA, paramB) => {
    switch (command) {
      //paramA: name, paramB: tag
      case "INVITE":
        const partyRes = await query(
          RequestType.GLZ,
          "GET",
          `/parties/v1/players/${puuid}`
        );
        log.info("[VALORANT] Party Response: " + partyRes?.data);
        if (!partyRes || partyRes.status !== 200) return 0;
        const resI = await query(
          RequestType.GLZ,
          "POST",
          `/parties/v1/parties/${partyRes.data.CurrentPartyID}/invites/name/${paramA}/tag/${paramB}`
        );
        log.info("[VALORANT] Party Invite Response: " + resI?.data);
        if (resI?.status === 200) return 1;
        if (resI?.status === 409) return 2;
        return 0;

      //paramA: partyId, paramB: otherPuuid
      case "JOIN":
        const res = await query(
          RequestType.GLZ,
          "POST",
          `/parties/v1/players/${puuid}/joinparty/${paramA}`
        );
        log.info("[VALORANT] Party Join Response: " + res?.data);
        if (res?.status === 200) return 1;

        const res2 = await query(
          RequestType.GLZ,
          "POST",
          `/parties/v1/parties/${paramA}/request`,
          false,
          JSON.stringify({ Subjects: [paramB] })
        );
        log.info("[VALORANT] Party Join Request Response: " + res2?.data);
        if (res2?.status === 200) return 2;
        return 0;
      default:
        log.warn("Unknown VALORANT_PARTY message: " + command);
    }
  });
}
