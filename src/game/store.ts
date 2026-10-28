import type { TrackData } from "./tracks";

export type Phase = "grid" | "countdown" | "racing" | "finished";

export const KARTS = [
  { id: "oobi", label: "Blitz" },
  { id: "oodi", label: "Dash" },
  { id: "ooli", label: "Lulu" },
  { id: "oopi", label: "Pip" },
  { id: "oozi", label: "Zoom" },
] as const;

export type RemoteState = {
  id: string;
  name: string;
  kart: string;
  x: number;
  y: number;
  z: number;
  ry: number;
  p: number;
  f: number;
  at: number;
};

export const playerId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export type ItemType = "boost" | "banana" | "shell" | "lightning" | "star";

export const ITEMS: { id: ItemType; icon: string; label: string }[] = [
  { id: "boost", icon: "🚀", label: "Turbo Boost" },
  { id: "banana", icon: "🍌", label: "Banana Peel" },
  { id: "shell", icon: "🐢", label: "Green Shell" },
  { id: "lightning", icon: "⚡", label: "Lightning Bolt" },
  { id: "star", icon: "⭐", label: "Invincibility Star" },
];

export const ITEM_ICONS: Record<ItemType, string> = {
  boost: "🚀",
  banana: "🍌",
  shell: "🐢",
  lightning: "⚡",
  star: "⭐",
};

export const ITEM_LABELS: Record<ItemType, string> = {
  boost: "Turbo Boost",
  banana: "Banana Peel",
  shell: "Green Shell",
  lightning: "Lightning Bolt",
  star: "Invincibility Star",
};

export const game = {
  phase: "grid" as Phase,
  countdownEnd: 0,
  raceStart: 0,
  lap: 0,
  progress: 0,
  speed: 0,
  item: null as null | ItemType,
  finishTime: 0,
  driftLevel: 0,
  boost: 0,
  offroad: false,
  star: 0,
  slot: 0,
  resetToken: 0,
  name: "",
  kart: "oobi",
  trackId: "sunset_speedway",
  trackData: null as TrackData | null,
  roster: [] as { id: string; name: string; kart: string }[],
  remotes: new Map<string, RemoteState>(),
  send: (_event: string, _payload: Record<string, unknown>) => {},
  keys: new Set<string>(),
};

// Weighted random item selection — back of the pack gets better items
export function rollItem(position: number, total: number): ItemType {
  const frac = total > 1 ? position / (total - 1) : 0.5;

  // Weights shift based on race position. 1st place rarely gets good items.
  // Items: boost, banana, shell, lightning, star
  const weights: [ItemType, number][] = [
    ["boost", 0.5 + frac * 0.5],
    ["banana", 0.4 + frac * 0.3],
    ["shell", 0.25 + frac * 0.9],
    ["lightning", 0.05 + frac * 0.8],
    ["star", 0.02 + frac * 0.6],
  ];

  // Only 70% chance to get an item at all from a box (harder to get items)
  if (Math.random() > 0.7) return "boost";

  const sum = weights.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * sum;
  for (const [id, w] of weights) {
    r -= w;
    if (r <= 0) return id;
  }
  return "boost";
}

export function isHost() {
  const ids = game.roster
    .map((r) => r.id)
    .concat(playerId)
    .sort();
  return ids[0] === playerId;
}

export function beginCountdown() {
  const ids = Array.from(new Set(game.roster.map((r) => r.id).concat(playerId))).sort();
  game.slot = Math.max(0, ids.indexOf(playerId));
  game.phase = "countdown";
  game.countdownEnd = performance.now() + 3500;
  game.lap = 0;
  game.finishTime = 0;
  game.item = null;
  game.boost = 0;
  game.resetToken++;
}

export function standings() {
  const all = [
    { id: playerId, name: game.name, p: game.progress, f: game.finishTime },
    ...[...game.remotes.values()].map((r) => ({ id: r.id, name: r.name, p: r.p, f: r.f })),
  ];
  all.sort((a, b) => {
    if (a.f && b.f) return a.f - b.f;
    if (a.f) return -1;
    if (b.f) return 1;
    return b.p - a.p;
  });
  return all;
}

export function formatTime(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const c = Math.floor((ms % 1000) / 10);
  return `${m}:${String(s).padStart(2, "0")}.${String(c).padStart(2, "0")}`;
}

export function ordinal(n: number): string {
  if (n >= 100) return `${n + 1}th`;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n + 1}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}
