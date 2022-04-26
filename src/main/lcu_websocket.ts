//A simple library to control Riot Games' LCU websockets (https://hextechdocs.dev/getting-started-with-the-lcu-websocket/)

import log from "electron-log";
import WebSocket from "ws";
import { ValorantLCUReply } from "@/types/valorant-websocket-reply";

export class LCUWebsocket {
  private ws: WebSocket;
  private listeners: Map<string, (message: ValorantLCUReply) => void>;

  constructor(password: string, port: string) {
    this.listeners = new Map();
    this.ws = new WebSocket(`wss://riot:${password}@localhost:${port}`, {
      rejectUnauthorized: false,
    });

    this.ws.onclose = function (event) {
      if (event.wasClean) {
        log.info(
          `[LCU Websocket] Connection closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        log.info("[LCU Websocket] Connection died");
      }
    };

    this.ws.onerror = function (error) {
      log.warn(`[LCU Websocket] ${error.message}`);
    };

    this.ws.on("message", (data) => {
      const strMsg = data.toString();
      log.info(`[LCU Websocket] ${strMsg}`);
      try {
        if (strMsg.length == 0) return;
        const jsonMsg = JSON.parse(strMsg);
        if (jsonMsg[0] != 8) {
          log.warn("[LCU Websocket] Not a message");
          return;
        }
        if (!this.listeners.has(jsonMsg[1])) {
          log.warn("[LCU Websocket] Not subscribed");
          return;
        }
        const li = this.listeners.get(jsonMsg[1]);
        if (!li) {
          log.warn("[LCU Websocket] Unknown error in listener");
          return;
        }
        li(jsonMsg[2]);
      } catch (e) {
        log.warn("[LCU Websocket] JSON parse error");
      }
    });
  }

  onReady(callback: () => void) {
    this.ws.on("open", () => {
      log.info("[LCU Websocket] Connection established");
      callback();
    });
  }

  subscribe(
    endpoint: string,
    callback: (message: ValorantLCUReply) => void
  ): void {
    this.ws.send(`[5, "${endpoint}"]`);
    this.listeners.set(endpoint, callback);
  }

  unsubscribe(endpoint: string): void {
    this.ws.send(`[6, "${endpoint}"]`);
    this.listeners.delete(endpoint);
  }
}
