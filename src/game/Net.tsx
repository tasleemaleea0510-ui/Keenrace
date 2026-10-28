import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { supabase } from "@/integrations/supabase/client";
import { beginCountdown, game, playerId, type RemoteState } from "./store";
import { beep } from "./audio";

const NET_TICK = 1 / 8;

export function Net({
  room,
  trackId,
  localRef,
}: {
  room: string;
  trackId: string;
  localRef: React.MutableRefObject<{ x: number; y: number; z: number; ry: number }>;
}) {
  const acc = useRef(0);
  const last = useRef({ x: 0, z: 0, ry: 0, p: 0, f: 0, at: -10 });

  useEffect(() => {
    const channel = supabase.channel(`kart:${room}`, {
      config: { broadcast: { self: false }, presence: { key: playerId } },
    });
    channel
      .on("broadcast", { event: "state" }, ({ payload }) => {
        const s = payload as RemoteState;
        if (s.id === playerId) return;
        if (!game.roster.some((r) => r.id === s.id)) return;
        game.remotes.set(s.id, { ...s, at: performance.now() });
      })
      .on("broadcast", { event: "start" }, () => beginCountdown())
      .on("broadcast", { event: "hit" }, ({ payload }) => {
        const p = payload as { id: string; kind: string; by: string };
        if (p.by === playerId) return;
        if (p.id !== playerId && p.id !== "all") return;
        if (game.star > 0) return; // invincible
        if (p.kind === "banana") {
          game.keys.add("__spinout");
          setTimeout(() => game.keys.delete("__spinout"), 1200);
          beep(100, 0.3, "sawtooth", 0.1);
        } else if (p.kind === "shell") {
          game.keys.add("__spinout");
          setTimeout(() => game.keys.delete("__spinout"), 1500);
          beep(80, 0.4, "square", 0.12);
        } else if (p.kind === "lightning") {
          game.keys.add("__slow");
          setTimeout(() => game.keys.delete("__slow"), 2500);
          beep(150, 0.5, "sawtooth", 0.1);
        }
      })
      .on("broadcast", { event: "track" }, ({ payload }) => {
        const p = payload as { trackId: string; by: string };
        if (p.by === playerId) return;
        if (p.trackId && p.trackId !== game.trackId) {
          game.trackId = p.trackId;
        }
      })
      .on("presence", { event: "sync" }, () => {
        const st = channel.presenceState<{ name: string; kart: string }>();
        game.roster = Object.entries(st)
          .filter(([id]) => id !== playerId)
          .map(([id, metas]) => ({
            id,
            name: metas[0]?.name ?? "Racer",
            kart: metas[0]?.kart ?? "oobi",
          }));
        for (const id of [...game.remotes.keys()])
          if (!game.roster.some((r) => r.id === id)) game.remotes.delete(id);
      })
      .subscribe((status) => {
        console.log("[net] channel:", status);
        if (status === "SUBSCRIBED") {
          channel.track({ name: game.name, kart: game.kart });
          if (game.trackId) {
            channel.send({
              type: "broadcast",
              event: "track",
              payload: { trackId: game.trackId, by: playerId },
            });
          }
        }
      });

    game.send = (event, payload) => {
      channel.send({ type: "broadcast", event, payload });
    };
    return () => {
      game.send = () => {};
      game.roster = [];
      game.remotes.clear();
      supabase.removeChannel(channel);
    };
  }, [room]);

  useFrame(({ clock }, raw) => {
    acc.current += Math.min(raw, 0.05);
    if (acc.current < NET_TICK) return;
    acc.current = 0;
    if (document.hidden) return;
    const s = localRef.current;
    const q = (n: number) => Math.round(n * 100) / 100;
    const x = q(s.x),
      z = q(s.z),
      ry = q(s.ry),
      p = q(game.progress),
      f = game.finishTime;
    const l = last.current;
    const moved =
      Math.abs(x - l.x) + Math.abs(z - l.z) + Math.abs(ry - l.ry) > 0.01 || p !== l.p || f !== l.f;
    if (!moved && clock.elapsedTime - l.at < 1) return;
    last.current = { x, z, ry, p, f, at: clock.elapsedTime };
    game.send("state", {
      id: playerId,
      name: game.name,
      kart: game.kart,
      x,
      y: q(s.y),
      z,
      ry,
      p,
      f,
    });
  });

  return null;
}
