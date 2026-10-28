import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { TrackData } from "./tracks";
import type { TrackTheme } from "./tracks";
import { Barriers, Scenery } from "./Scenery";

function canvasTex(
  w: number,
  h: number,
  draw: (c: CanvasRenderingContext2D) => void,
  repeat?: [number, number],
) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (repeat) t.repeat.set(...repeat);
  return t;
}

function noise(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  base: string,
  specks: string[],
  n: number,
  size = 2,
) {
  c.fillStyle = base;
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    c.fillStyle = specks[i % specks.length]!;
    c.fillRect(Math.random() * w, Math.random() * h, size, size);
  }
}

function ribbon(td: TrackData, inner: number, outer: number, y: number, vScale: number) {
  const { N, S, leftAt } = td;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const k = i % N;
    const p = S(k);
    const l = leftAt(k);
    const v = (i / N) * vScale;
    pos.push(p.x + l.x * outer, y, p.z + l.z * outer, p.x + l.x * inner, y, p.z + l.z * inner);
    uv.push(0, v, 1, v);
    if (i < N) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const nrm = g.getAttribute("normal") as THREE.BufferAttribute;
  for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0);
  return g;
}

export const boxCooldown: number[] = [];

function Trees({ td, theme }: { td: TrackData; theme: TrackTheme }) {
  const { N, S, WALL } = td;
  const trunks = useRef<THREE.InstancedMesh>(null);
  const tops = useRef<THREE.InstancedMesh>(null);
  const count = theme.treeCount;
  const spots = useMemo(() => {
    const out: { x: number; z: number; s: number }[] = [];
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let tries = 0;
    const range = 360 * td.def.sceneryScale;
    while (out.length < count && tries < 5000) {
      tries++;
      const x = (rnd() - 0.5) * range + 10;
      const z = (rnd() - 0.5) * range + 70;
      let ok = true;
      for (let i = 0; i < N; i += 4) {
        const p = S(i);
        if ((p.x - x) ** 2 + (p.z - z) ** 2 < (WALL + 4) ** 2) {
          ok = false;
          break;
        }
      }
      if (ok) out.push({ x, z, s: 0.8 + rnd() * 0.9 });
    }
    return out;
  }, [N, S, WALL, count, td.def.sceneryScale]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    spots.forEach((s, i) => {
      m.compose(
        new THREE.Vector3(s.x, 1.2 * s.s, s.z),
        new THREE.Quaternion(),
        new THREE.Vector3(s.s, s.s, s.s),
      );
      trunks.current!.setMatrixAt(i, m);
      m.compose(
        new THREE.Vector3(s.x, 3.6 * s.s, s.z),
        new THREE.Quaternion(),
        new THREE.Vector3(s.s, s.s * 1.1, s.s),
      );
      tops.current!.setMatrixAt(i, m);
      const hue = 0.28 + (i % 5) * 0.025;
      const tc = theme.treeColors[i % theme.treeColors.length]!;
      c.set(tc);
      tops.current!.setColorAt(i, c);
    });
    trunks.current!.instanceMatrix.needsUpdate = true;
    tops.current!.instanceMatrix.needsUpdate = true;
    if (tops.current!.instanceColor) tops.current!.instanceColor.needsUpdate = true;
  }, [spots, theme]);
  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, spots.length]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 2.4, 6]} />
        <meshStandardMaterial color={theme.treeTrunk} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={tops} args={[undefined, undefined, spots.length]} castShadow>
        <icosahedronGeometry args={[1.8, 0]} />
        <meshStandardMaterial flatShading roughness={0.8} />
      </instancedMesh>
    </>
  );
}

const ITEM_SHAPES = [
  { color: "#ff6a2e", emissive: "#ff3b00", geo: <coneGeometry args={[0.4, 0.8, 8]} /> }, // boost — cone
  { color: "#ffd23b", emissive: "#ff9a00", geo: <capsuleGeometry args={[0.22, 0.5, 4, 8]} /> }, // banana — capsule
  { color: "#3bd16f", emissive: "#1aa050", geo: <sphereGeometry args={[0.45, 16, 12]} /> }, // shell — sphere
  { color: "#5a9eff", emissive: "#2a6aff", geo: <octahedronGeometry args={[0.5, 0]} /> }, // lightning — octahedron
  { color: "#ff7ad9", emissive: "#ff3aaa", geo: <dodecahedronGeometry args={[0.42, 0]} /> }, // star — dodecahedron
];

function ItemBoxes({ td }: { td: TrackData }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const boxes = td.itemBoxes;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const now = performance.now();
    refs.current.forEach((g, i) => {
      if (!g) return;
      const cd = boxCooldown[i] ?? 0;
      const target = cd > now ? 0.001 : 1;
      const s = g.scale.x + (target - g.scale.x) * 0.15;
      g.scale.setScalar(s);
      g.rotation.set(t * 0.7 + i, t * 1.1 + i, 0);
      g.position.y = boxes[i]!.y + Math.sin(t * 2 + i) * 0.2;
      const m = (g.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.color.setHSL((t * 0.25 + i * 0.1) % 1, 0.85, 0.6);
      m.emissive.setHSL((t * 0.25 + i * 0.1) % 1, 0.9, 0.25);
      const inner = (g.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      const shape = ITEM_SHAPES[i % ITEM_SHAPES.length]!;
      const pulse = 0.7 + Math.sin(t * 3 + i) * 0.3;
      inner.emissiveIntensity = 0.6 + pulse * 0.4;
    });
  });
  return (
    <>
      {boxes.map((p, i) => {
        const shape = ITEM_SHAPES[i % ITEM_SHAPES.length]!;
        return (
          <group
            key={i}
            position={p}
            ref={(g) => {
              refs.current[i] = g;
            }}
          >
            <mesh castShadow>
              <boxGeometry args={[1.3, 1.3, 1.3]} />
              <meshStandardMaterial transparent opacity={0.75} roughness={0.15} metalness={0.2} />
            </mesh>
            <mesh rotation-y={i * 0.5}>
              {shape.geo}
              <meshStandardMaterial
                color={shape.color}
                emissive={shape.emissive}
                emissiveIntensity={0.8}
                roughness={0.2}
                metalness={0.3}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function BoostPads({ td, tex }: { td: TrackData; tex: THREE.Texture }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const pads = td.boostPads;
  useFrame((_, d) => {
    if (mat.current?.map) mat.current.map.offset.y -= d * 1.6;
  });
  return (
    <>
      {pads.map((b, i) => (
        <mesh key={i} position={b.pos} rotation={[-Math.PI / 2, 0, b.ry + Math.PI]}>
          <planeGeometry args={[3.2, 5]} />
          {i === 0 ? (
            <meshBasicMaterial ref={mat} map={tex} transparent />
          ) : (
            <meshBasicMaterial map={tex} transparent />
          )}
        </mesh>
      ))}
    </>
  );
}

function Cones({ td }: { td: TrackData }) {
  const { S, leftAt, ROAD_W } = td;
  const { scene } = useGLTF("/models/cone.glb");
  const items = useMemo(
    () =>
      td.def.conePositions.map((i, n) => {
        const p = S(i);
        const l = leftAt(i);
        const o = (ROAD_W + 2.6) * (n % 2 ? 1 : -1);
        const c = scene.clone(true);
        c.position.set(p.x + l.x * o, 0, p.z + l.z * o);
        c.scale.setScalar(2.2);
        c.traverse((x) =>
          (x as THREE.Mesh).isMesh ? ((x as THREE.Mesh).castShadow = true) : null,
        );
        return c;
      }),
    [scene, S, leftAt, ROAD_W, td.def.conePositions],
  );
  return (
    <>
      {items.map((c, i) => (
        <primitive key={i} object={c} />
      ))}
    </>
  );
}

export function Track({ td }: { td: TrackData }) {
  const theme = td.def.theme;
  const { ROAD_W, trackLength, S, T } = td;

  const tex = useMemo(() => {
    const asphalt = canvasTex(
      256,
      256,
      (c) => {
        noise(c, 256, 256, theme.asphalt, theme.asphaltSpecks, 9000, 2);
        c.fillStyle = "#f4f1e6";
        for (let y = 0; y < 256; y += 64) c.fillRect(124, y, 8, 34);
      },
      [1, trackLength / 18],
    );
    const curb = canvasTex(
      64,
      64,
      (c) => {
        c.fillStyle = theme.curbA;
        c.fillRect(0, 0, 64, 32);
        c.fillStyle = theme.curbB;
        c.fillRect(0, 32, 64, 32);
      },
      [1, trackLength / 3],
    );
    const grass = canvasTex(
      512,
      512,
      (c) => {
        noise(c, 512, 512, theme.grass, theme.grassSpecks, 22000, 3);
      },
      [60, 60],
    );
    const checker = canvasTex(128, 32, (c) => {
      for (let x = 0; x < 16; x++)
        for (let y = 0; y < 4; y++) {
          c.fillStyle = (x + y) % 2 ? "#111111" : "#ffffff";
          c.fillRect(x * 8, y * 8, 8, 8);
        }
    });
    const chevron = canvasTex(
      128,
      128,
      (c) => {
        c.clearRect(0, 0, 128, 128);
        c.fillStyle = "rgba(255,170,30,0.9)";
        c.fillRect(0, 0, 128, 128);
        c.strokeStyle = "#fff4c4";
        c.lineWidth = 14;
        c.beginPath();
        c.moveTo(20, 90);
        c.lineTo(64, 40);
        c.lineTo(108, 90);
        c.stroke();
      },
      [1, 2],
    );
    return { asphalt, curb, grass, checker, chevron };
  }, [theme, trackLength]);

  const road = useMemo(() => ribbon(td, -ROAD_W, ROAD_W, 0.02, 1), [td, ROAD_W]);
  const curbL = useMemo(() => ribbon(td, ROAD_W, ROAD_W + 1.3, 0.03, 1), [td, ROAD_W]);
  const curbR = useMemo(() => ribbon(td, -ROAD_W - 1.3, -ROAD_W, 0.03, 1), [td, ROAD_W]);

  const start = S(0);
  const startRy = Math.atan2(T(0).x, T(0).z);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[10, 0, 70]} receiveShadow>
        <planeGeometry args={[600 * td.def.sceneryScale, 600 * td.def.sceneryScale]} />
        <meshStandardMaterial map={tex.grass} roughness={1} />
      </mesh>
      <mesh geometry={road} receiveShadow>
        <meshStandardMaterial map={tex.asphalt} roughness={0.85} />
      </mesh>
      <mesh geometry={curbL} receiveShadow>
        <meshStandardMaterial map={tex.curb} roughness={0.6} />
      </mesh>
      <mesh geometry={curbR} receiveShadow>
        <meshStandardMaterial map={tex.curb} roughness={0.6} />
      </mesh>

      <group position={[start.x, 0, start.z]} rotation-y={startRy}>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.04, 0]}>
          <planeGeometry args={[ROAD_W * 2, 2]} />
          <meshStandardMaterial map={tex.checker} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (ROAD_W + 1.5), 3.5, 0]} castShadow>
            <boxGeometry args={[0.8, 7, 0.8]} />
            <meshStandardMaterial color="#e8402f" />
          </mesh>
        ))}
        <mesh position={[0, 7.2, 0]} castShadow>
          <boxGeometry args={[ROAD_W * 2 + 4, 1.6, 0.6]} />
          <meshStandardMaterial map={tex.checker} />
        </mesh>
      </group>

      <BoostPads td={td} tex={tex.chevron} />
      <ItemBoxes td={td} />
      <Cones td={td} />
      <Trees td={td} theme={theme} />
      <Barriers td={td} />
      <Scenery td={td} />
    </group>
  );
}

export { boxCooldown as itemBoxCooldown };
