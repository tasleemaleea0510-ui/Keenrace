import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { KartModel, newRig } from "./KartModel";
import { boxCooldown } from "./Track";
import type { TrackData } from "./tracks";
import { game, rollItem, standings } from "./store";
import { beep, setEngine } from "./audio";

const MAX = 26;
const OFF_MAX = 11;
const BOOST_ADD = 12;
const ACCEL = 20;
const BRAKE = 38;
const TURN = 2.1;
const DRIFT_SLIP = 0.32;
const CAM_DIST = 7.5;
const CAM_H = 3.2;

const tmp = new THREE.Vector3();
const look = new THREE.Vector3();

export function Player({
  localRef,
  td,
}: {
  localRef: React.MutableRefObject<{ x: number; y: number; z: number; ry: number }>;
  td: TrackData;
}) {
  const { N, ROAD_W, WALL, gridSlot, lapProgress, nearest, S, yawAt, boostPads, itemBoxes } = td;
  const LAPS = td.LAPS;

  const group = useRef<THREE.Group>(null);
  const rig = useRef(newRig());
  const { camera } = useThree();
  const st = useRef({
    x: 0,
    z: 0,
    ry: 0,
    speed: 0,
    idx: N - 6,
    half: true,
    driftDir: 0,
    driftCharge: 0,
    driftHeld: false,
    hopT: 0,
    boost: 0,
    itemHeld: false,
    lastHit: 0,
    token: -1,
    lastBeep: 4,
    camYaw: 0,
    spinout: 0,
    starT: 0,
    slowT: 0,
  });

  const reset = () => {
    const g = gridSlot(game.slot);
    const s = st.current;
    Object.assign(s, {
      x: g.x,
      z: g.z,
      ry: g.ry,
      speed: 0,
      idx: g.idx,
      half: true,
      driftDir: 0,
      driftCharge: 0,
      boost: 0,
      camYaw: g.ry,
      spinout: 0,
      starT: 0,
      slowT: 0,
    });
    game.lap = 0;
    game.progress = lapProgress(0, g.idx);
    const fx = g.x - Math.sin(g.ry) * CAM_DIST;
    const fz = g.z - Math.cos(g.ry) * CAM_DIST;
    camera.position.set(fx, CAM_H + 1, fz);
  };

  useEffect(() => {
    reset();
    st.current.token = game.resetToken;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [td]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const s = st.current;
    if (s.token !== game.resetToken) {
      s.token = game.resetToken;
      s.lastBeep = 4;
      reset();
    }
    const now = performance.now();
    const k = game.keys;

    if (game.phase === "countdown") {
      const left = Math.ceil((game.countdownEnd - now) / 1000);
      if (left !== s.lastBeep && left <= 3 && left >= 1) {
        s.lastBeep = left;
        beep(440, 0.18);
      }
      if (now >= game.countdownEnd) {
        game.phase = "racing";
        game.raceStart = now;
        beep(880, 0.4);
      }
    }
    const canDrive = game.phase === "racing" || game.phase === "grid";
    const finished = game.phase === "finished";

    const up = canDrive && (k.has("ArrowUp") || k.has("KeyW"));
    const down = canDrive && (k.has("ArrowDown") || k.has("KeyS"));
    const steer =
      (k.has("ArrowLeft") || k.has("KeyA") ? 1 : 0) -
      (k.has("ArrowRight") || k.has("KeyD") ? 1 : 0);
    const driftKey = canDrive && (k.has("Space") || k.has("ShiftLeft"));
    const itemKey = canDrive && (k.has("KeyE") || k.has("KeyX") || k.has("Enter"));

    // Incoming hit effects from other players
    if (k.has("__spinout") && s.spinout <= 0) {
      s.spinout = 1.2;
      s.boost = 0;
      s.driftDir = 0;
      s.driftCharge = 0;
    }
    if (k.has("__slow") && s.slowT <= 0) {
      s.slowT = 2.5;
    }

    const near = nearest(s.x, s.z, s.idx);
    const off = near.d > ROAD_W + 1.3;
    game.offroad = off;

    // Star: invincible + fast
    if (s.starT > 0) {
      s.starT -= dt;
      game.star = s.starT;
    } else {
      game.star = 0;
    }
    // Slow from lightning
    const slowFactor = s.slowT > 0 ? 0.4 : 1;
    if (s.slowT > 0) s.slowT -= dt;

    const starBoost = s.starT > 0 ? 8 : 0;
    const max =
      ((off && s.boost <= 0 && s.starT <= 0 ? OFF_MAX : MAX) +
        (s.boost > 0 ? BOOST_ADD : 0) +
        starBoost) *
      slowFactor;

    // Spinout: lose control briefly
    if (s.spinout > 0) {
      s.spinout -= dt;
      s.speed *= Math.exp(-4 * dt);
      s.ry += dt * 8;
    }

    if (up) s.speed += ACCEL * dt * (s.speed < 8 ? 1.4 : 1);
    else if (down) s.speed -= (s.speed > 0 ? BRAKE : ACCEL * 0.6) * dt;
    else s.speed *= Math.exp(-(finished ? 1.5 : 0.9) * dt);
    if (s.boost > 0) {
      s.speed = Math.max(s.speed, max);
      s.boost -= dt;
    }
    if (s.speed > max) s.speed += (max - s.speed) * (1 - Math.exp(-3 * dt));
    s.speed = Math.max(s.speed, -9);

    if (driftKey && !s.driftHeld) {
      s.hopT = 0.28;
      if (steer !== 0 && s.speed > 10) s.driftDir = steer;
    }
    if (driftKey && s.driftDir === 0 && s.hopT > 0 && steer !== 0 && s.speed > 10)
      s.driftDir = steer;
    if (!driftKey && s.driftHeld && s.driftDir !== 0) {
      const lvl = s.driftCharge > 2.4 ? 2 : s.driftCharge > 1.1 ? 1 : 0;
      if (lvl) {
        s.boost = Math.max(s.boost, lvl === 2 ? 1.3 : 0.7);
        beep(lvl === 2 ? 660 : 520, 0.2, "sawtooth", 0.08);
      }
      s.driftDir = 0;
      s.driftCharge = 0;
    }
    if (s.speed < 6) {
      s.driftDir = 0;
      s.driftCharge = 0;
    }
    s.driftHeld = driftKey;

    let turn: number;
    if (s.driftDir !== 0) {
      turn = s.driftDir * (0.75 + 0.55 * steer * s.driftDir) * TURN;
      s.driftCharge += dt * (0.8 + Math.max(0, steer * s.driftDir));
    } else {
      turn = steer * TURN * Math.min(1, Math.abs(s.speed) / 7) * Math.sign(s.speed || 1);
      turn *= 1 - Math.min(0.35, Math.abs(s.speed) / 90);
    }
    s.ry += turn * dt;
    {
      const ty = yawAt(s.idx);
      const diff = Math.atan2(Math.sin(s.ry - ty), Math.cos(s.ry - ty));
      const LIMIT = 1.4;
      if (Math.abs(diff) > LIMIT) s.ry = ty + Math.sign(diff) * LIMIT;
    }

    const moveYaw = s.ry - s.driftDir * DRIFT_SLIP;
    s.x += Math.sin(moveYaw) * s.speed * dt;
    s.z += Math.cos(moveYaw) * s.speed * dt;

    const n2 = nearest(s.x, s.z, near.i);
    const LIM = WALL - 0.9;
    if (n2.d > LIM) {
      const p = S(n2.i);
      const f = (LIM - 0.05) / n2.d;
      s.x = p.x + (s.x - p.x) * f;
      s.z = p.z + (s.z - p.z) * f;
      if (now - s.lastHit > 250) {
        s.speed *= 0.6;
        s.lastHit = now;
        beep(120, 0.12, "square", 0.08);
      }
      const ty = yawAt(n2.i);
      const d = Math.atan2(Math.sin(ty - s.ry), Math.cos(ty - s.ry));
      s.ry += d * (1 - Math.exp(-6 * dt));
    }

    for (const r of game.remotes.values()) {
      const dx = s.x - r.x,
        dz = s.z - r.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.01 && d < 2) {
        if (s.starT > 0) {
          // Star: push others away hard
          const push = (2 - d) * 1.5;
          s.x += (dx / d) * push * 0.3;
          s.z += (dz / d) * push * 0.3;
        } else {
          const push = (2 - d) * 0.5;
          s.x += (dx / d) * push;
          s.z += (dz / d) * push;
          s.speed *= 0.97;
        }
      }
    }

    for (const b of boostPads) {
      if ((b.pos.x - s.x) ** 2 + (b.pos.z - s.z) ** 2 < 6) {
        if (s.boost < 0.5) beep(700, 0.12, "triangle", 0.08);
        s.boost = Math.max(s.boost, 1.1);
      }
    }
    itemBoxes.forEach((b, i) => {
      if ((boxCooldown[i] ?? 0) > now) return;
      if ((b.x - s.x) ** 2 + (b.z - s.z) ** 2 < 3.6) {
        boxCooldown[i] = now + 3500;
        if (!game.item) {
          const rank = standings();
          const pos = rank.findIndex((r) => r.id === playerId);
          game.item = rollItem(pos, rank.length);
          beep(990, 0.1, "square", 0.08);
        }
      }
    });
    if (itemKey && !s.itemHeld && game.item) {
      const item = game.item;
      game.item = null;
      if (item === "boost") {
        s.boost = Math.max(s.boost, 1.6);
        beep(330, 0.3, "sawtooth", 0.1);
      } else if (item === "banana") {
        // Drop a banana behind — slows the nearest remote behind you
        let target: { id: string; dist: number } | null = null;
        for (const r of game.remotes.values()) {
          const dx = r.x - s.x,
            dz = r.z - s.z;
          const behind = Math.cos(s.ry) * dz + Math.sin(s.ry) * dx;
          const d = Math.hypot(dx, dz);
          if (behind > 0 && behind < 15 && (!target || d < target.dist)) {
            target = { id: r.id, dist: d };
          }
        }
        game.send("hit", { id: target?.id, kind: "banana", by: playerId });
        beep(200, 0.15, "square", 0.08);
      } else if (item === "shell") {
        // Fire a shell forward — knocks back the nearest remote ahead
        let target: { id: string; dist: number } | null = null;
        for (const r of game.remotes.values()) {
          const dx = r.x - s.x,
            dz = r.z - s.z;
          const ahead = -(Math.cos(s.ry) * dz + Math.sin(s.ry) * dx);
          const d = Math.hypot(dx, dz);
          if (ahead > 0 && ahead < 30 && (!target || d < target.dist)) {
            target = { id: r.id, dist: d };
          }
        }
        game.send("hit", { id: target?.id, kind: "shell", by: playerId });
        beep(440, 0.2, "triangle", 0.1);
      } else if (item === "lightning") {
        // Slow all other racers briefly
        game.send("hit", { id: "all", kind: "lightning", by: playerId });
        beep(150, 0.4, "sawtooth", 0.12);
      } else if (item === "star") {
        // Invincibility + speed boost for 5 seconds
        s.starT = 5;
        s.boost = Math.max(s.boost, 3);
        beep(660, 0.15, "square", 0.1);
        setTimeout(() => beep(880, 0.15, "square", 0.1), 120);
        setTimeout(() => beep(1100, 0.2, "square", 0.1), 240);
      }
    }
    s.itemHeld = itemKey;

    const prev = s.idx;
    s.idx = n2.i;
    if (s.idx > N * 0.45 && s.idx < N * 0.6) s.half = true;
    if (prev > N * 0.8 && s.idx < N * 0.2 && s.half && game.phase !== "finished") {
      s.half = false;
      game.lap += 1;
      if (game.lap > 1 && game.lap <= LAPS) beep(760, 0.15, "triangle");
      if (game.lap > LAPS && game.phase === "racing") {
        game.phase = "finished";
        game.finishTime = Math.round(now - game.raceStart);
        beep(1046, 0.6, "triangle", 0.12);
      }
    } else if (prev < N * 0.2 && s.idx > N * 0.8) {
      game.lap = Math.max(0, game.lap - 1);
      s.half = true;
    }
    game.progress = lapProgress(game.lap, s.idx);
    game.speed = s.speed;
    game.boost = s.boost;
    game.driftLevel = s.driftDir ? (s.driftCharge > 2.4 ? 2 : s.driftCharge > 1.1 ? 1 : 0) : 0;

    s.hopT = Math.max(0, s.hopT - dt);
    const hop = s.hopT > 0 ? Math.sin((s.hopT / 0.28) * Math.PI) * 0.6 : 0;

    const g = group.current;
    if (g) {
      g.position.set(s.x, 0, s.z);
      g.rotation.y = s.ry;
    }
    const r = rig.current;
    r.speed = s.speed;
    r.steer += (steer - r.steer) * (1 - Math.exp(-10 * dt));
    r.drift += (s.driftDir - r.drift) * (1 - Math.exp(-10 * dt));
    r.driftLevel = game.driftLevel;
    r.boost = s.boost;
    r.hop = hop;
    localRef.current.x = s.x;
    localRef.current.z = s.z;
    localRef.current.y = hop;
    localRef.current.ry = s.ry;

    let dy = s.ry - s.camYaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    s.camYaw += dy * (1 - Math.exp(-4.5 * dt));
    const back = s.speed < -2 ? -1 : 1;
    tmp.set(
      s.x - Math.sin(s.camYaw) * CAM_DIST * back,
      CAM_H,
      s.z - Math.cos(s.camYaw) * CAM_DIST * back,
    );
    camera.position.lerp(tmp, 1 - Math.exp(-8 * dt));
    look.set(s.x + Math.sin(s.ry) * 3, 1.2, s.z + Math.cos(s.ry) * 3);
    camera.lookAt(look);
    const cam = camera as THREE.PerspectiveCamera;
    const fov = 62 + Math.min(1, Math.abs(s.speed) / MAX) * 8 + (s.boost > 0 ? 10 : 0);
    cam.fov += (fov - cam.fov) * (1 - Math.exp(-5 * dt));
    cam.updateProjectionMatrix();

    setEngine(Math.min(1, Math.abs(s.speed) / (MAX + BOOST_ADD)), s.boost > 0);
  });

  return (
    <group ref={group}>
      <KartModel kind={game.kart} rig={rig} />
    </group>
  );
}
