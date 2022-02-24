"use strict";

async function get(endpoint: string) {
  return await fetch(`https://valorant-api.com${endpoint}`);
}

export async function getPlayerCardSrc(
  uuid: string
): Promise<string | undefined> {
  const res = await get(`/v1/playercards/${uuid}`);
  if (!res || !res.ok) return undefined;
  const resJson = await res.json();
  if (!resJson) return undefined;
  return resJson["data"]["displayIcon"];
}
