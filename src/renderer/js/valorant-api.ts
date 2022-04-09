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

let rankIcons: Map<number, string>, rankColors:Map<number,string>;
get("/v1/competitivetiers").then(async (res) => {
  if (!res || !res.ok) return;
  const resJson = await res.json();
  if (!resJson) return;
  rankIcons = new Map();
  rankColors = new Map();
  const tierArr = resJson["data"];
  const tiers = tierArr[tierArr.length-1]["tiers"];
  for (const x of tiers) {
    rankIcons.set(x.tier, x.largeIcon);
    rankColors.set(x.tier, x.color);
  }
});

export function getRankIcon(tier: number) {
  return rankIcons.get(tier);
}

export function getRankColor(tier: number) {
  return rankColors.get(tier);
}