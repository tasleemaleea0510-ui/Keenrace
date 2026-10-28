import * as THREE from "three";

export type TrackTheme = {
  asphalt: string;
  asphaltSpecks: string[];
  grass: string;
  grassSpecks: string[];
  curbA: string;
  curbB: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  skyColor: string;
  sunPos: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  lightIntensity: number;
  barrierColors: string[];
  treeTrunk: string;
  treeColors: string[];
  mountainColors: string[];
  flagColors: string[];
};

export type TrackDef = {
  id: string;
  name: string;
  emoji: string;
  laps: number;
  roadW: number;
  scale: number;
  points: [number, number][];
  theme: TrackTheme;
  sceneryScale: number;
  treeCount: number;
  mountainCount: number;
  conePositions: number[];
  itemBoxIndices: number[];
  boostPadOffsets: number[];
};

const SUNSET: TrackTheme = {
  asphalt: "#52566a",
  asphaltSpecks: ["#464a5c", "#61667a", "#4b4f62"],
  grass: "#5fd14a",
  grassSpecks: ["#4fc13d", "#78e05c", "#52b83e", "#8eea6e", "#f7f08a"],
  curbA: "#ff3b3b",
  curbB: "#f7f4ee",
  fog: "#a9dcff",
  fogNear: 110,
  fogFar: 380,
  skyColor: "#a9dcff",
  sunPos: [80, 60, 40] as [number, number, number],
  hemiSky: "#e6f6ff",
  hemiGround: "#5fd14a",
  lightIntensity: 2.2,
  barrierColors: ["#ff3b3b", "#ffffff", "#2f7bff", "#ffffff"],
  treeTrunk: "#7a4b2a",
  treeColors: ["#3da53e", "#4fc13d", "#52b83e"],
  mountainColors: ["#4fae6a", "#3f9a73"],
  flagColors: ["#ff3b3b", "#ffd23b", "#2f7bff", "#3bd16f", "#ff7ad9", "#ff9a2e"],
  sceneryScale: 1,
  treeCount: 170,
  mountainCount: 22,
  conePositions: [40, 100, 200, 300, 380, 440, 520, 620, 700, 760],
  itemBoxIndices: [120, 330, 560],
  boostPadOffsets: [60, 250, 470, 690],
};

const DESERT: TrackTheme = {
  ...SUNSET,
  asphalt: "#8a7a5a",
  asphaltSpecks: ["#7a6a4a", "#9a8a6a", "#6a5a3a"],
  grass: "#e8c878",
  grassSpecks: ["#d8b868", "#f0d888", "#c8a858", "#e8c070", "#c0a050"],
  curbA: "#c4862e",
  curbB: "#f0e0c0",
  fog: "#f5e6c0",
  fogNear: 120,
  fogFar: 400,
  skyColor: "#f5e6c0",
  sunPos: [100, 50, 20] as [number, number, number],
  hemiSky: "#fff5d0",
  hemiGround: "#e8c878",
  lightIntensity: 2.6,
  barrierColors: ["#c4862e", "#f0e0c0", "#8a5a2e", "#f0e0c0"],
  treeTrunk: "#8a6a3a",
  treeColors: ["#c4a050", "#d8b868", "#b89840"],
  mountainColors: ["#c4a060", "#b09050"],
  flagColors: ["#c4862e", "#ffd23b", "#e8762e", "#3bd16f", "#ff7ad9", "#2f7bff"],
};

const SNOW: TrackTheme = {
  ...SUNSET,
  asphalt: "#6a6e7a",
  asphaltSpecks: ["#5a5e6a", "#7a7e8a", "#606470"],
  grass: "#e8eef5",
  grassSpecks: ["#d8e0ec", "#f0f5fa", "#c8d0dc", "#e8edf2", "#b8c0cc"],
  curbA: "#2f7bff",
  curbB: "#ffffff",
  fog: "#d8e8f5",
  fogNear: 90,
  fogFar: 320,
  skyColor: "#d8e8f5",
  sunPos: [60, 40, 80] as [number, number, number],
  hemiSky: "#f0f8ff",
  hemiGround: "#e8eef5",
  lightIntensity: 1.8,
  barrierColors: ["#2f7bff", "#ffffff", "#5a9eff", "#ffffff"],
  treeTrunk: "#5a4a3a",
  treeColors: ["#2a6a3a", "#3a7a4a", "#2a5a3a"],
  mountainColors: ["#7a8a9a", "#9aaaba"],
  flagColors: ["#2f7bff", "#ffffff", "#ff3b3b", "#3bd16f", "#ff7ad9", "#ffd23b"],
};

const VOLCANO: TrackTheme = {
  ...SUNSET,
  asphalt: "#4a3a3a",
  asphaltSpecks: ["#3a2a2a", "#5a4a4a", "#403030"],
  grass: "#6a4a3a",
  grassSpecks: ["#5a3a2a", "#7a5a4a", "#4a3020", "#8a6a5a", "#3a2010"],
  curbA: "#ff3b00",
  curbB: "#2a2a2a",
  fog: "#ff8a4a",
  fogNear: 80,
  fogFar: 280,
  skyColor: "#ff6a3a",
  sunPos: [40, 30, 60] as [number, number, number],
  hemiSky: "#ff8a5a",
  hemiGround: "#5a3a2a",
  lightIntensity: 1.5,
  barrierColors: ["#ff3b00", "#2a2a2a", "#ff6a00", "#2a2a2a"],
  treeTrunk: "#3a2a1a",
  treeColors: ["#5a2a1a", "#6a3a2a", "#4a2010"],
  mountainColors: ["#5a3a2a", "#3a2a1a"],
  flagColors: ["#ff3b00", "#ffd23b", "#ff6a00", "#2a2a2a", "#ff9a2e", "#ff7ad9"],
};

const NEON: TrackTheme = {
  ...SUNSET,
  asphalt: "#1a1a2e",
  asphaltSpecks: ["#0a0a1e", "#2a2a3e", "#15152a"],
  grass: "#0a1a1a",
  grassSpecks: ["#081818", "#0c2020", "#061414", "#102828", "#041010"],
  curbA: "#ff00ff",
  curbB: "#00ffff",
  fog: "#1a0a2e",
  fogNear: 100,
  fogFar: 350,
  skyColor: "#1a0a2e",
  sunPos: [60, 80, 40] as [number, number, number],
  hemiSky: "#ff5aff",
  hemiGround: "#0a1a1a",
  lightIntensity: 1.2,
  barrierColors: ["#ff00ff", "#00ffff", "#ff00aa", "#00aaff"],
  treeTrunk: "#2a1a3a",
  treeColors: ["#ff5aff", "#5affff", "#aa5aff"],
  mountainColors: ["#2a1a3a", "#1a0a2a"],
  flagColors: ["#ff00ff", "#00ffff", "#ff00aa", "#00ffaa", "#aa00ff", "#ffaa00"],
};

const BEACH: TrackTheme = {
  ...SUNSET,
  asphalt: "#c4b890",
  asphaltSpecks: ["#b4a880", "#d4c8a0", "#a89870"],
  grass: "#f0e8b8",
  grassSpecks: ["#e0d8a8", "#f5edd0", "#d0c898", "#ede4b0", "#c8b888"],
  curbA: "#2f7bff",
  curbB: "#ffd23b",
  fog: "#bfe8f5",
  fogNear: 120,
  fogFar: 400,
  skyColor: "#bfe8f5",
  sunPos: [120, 70, 10] as [number, number, number],
  hemiSky: "#e0f5ff",
  hemiGround: "#f0e8b8",
  lightIntensity: 2.4,
  barrierColors: ["#2f7bff", "#ffd23b", "#ff7a3b", "#ffffff"],
  treeTrunk: "#8a6a4a",
  treeColors: ["#2a8a4a", "#3a9a5a", "#1a7a3a"],
  mountainColors: ["#6a8a7a", "#5a7a6a"],
  flagColors: ["#2f7bff", "#ffd23b", "#ff7a3b", "#3bd16f", "#ff7ad9", "#00cedd"],
};

const JUNGLE: TrackTheme = {
  ...SUNSET,
  asphalt: "#3a4a2a",
  asphaltSpecks: ["#2a3a1a", "#4a5a3a", "#304020"],
  grass: "#2a7a2a",
  grassSpecks: ["#1a6a1a", "#3a8a3a", "#206020", "#4a9a4a", "#1a5010"],
  curbA: "#3bd16f",
  curbB: "#2a5a2a",
  fog: "#a8e8a8",
  fogNear: 70,
  fogFar: 250,
  skyColor: "#a8e8a8",
  sunPos: [30, 80, 60] as [number, number, number],
  hemiSky: "#d0f5d0",
  hemiGround: "#2a7a2a",
  lightIntensity: 1.6,
  barrierColors: ["#3bd16f", "#2a5a2a", "#5aff5a", "#2a5a2a"],
  treeTrunk: "#5a3a2a",
  treeColors: ["#1a6a1a", "#2a8a2a", "#3a9a3a", "#1a5a1a"],
  mountainColors: ["#3a7a4a", "#2a6a3a"],
  flagColors: ["#3bd16f", "#ffd23b", "#ff3b3b", "#2f7bff", "#ff7ad9", "#ff9a2e"],
};

const SPACE: TrackTheme = {
  ...SUNSET,
  asphalt: "#2a2a4a",
  asphaltSpecks: ["#1a1a3a", "#3a3a5a", "#252545"],
  grass: "#1a1a2a",
  grassSpecks: ["#0a0a1a", "#2a2a3a", "#151525", "#252535", "#080818"],
  curbA: "#5a5aff",
  curbB: "#aaaaff",
  fog: "#0a0a1a",
  fogNear: 100,
  fogFar: 380,
  skyColor: "#050510",
  sunPos: [100, 120, 50] as [number, number, number],
  hemiSky: "#5a5aff",
  hemiGround: "#1a1a2a",
  lightIntensity: 1.0,
  barrierColors: ["#5a5aff", "#aaaaff", "#aa5aff", "#ffffff"],
  treeTrunk: "#3a3a5a",
  treeColors: ["#5a5aff", "#aa5aff", "#5affff"],
  mountainColors: ["#3a3a5a", "#2a2a4a"],
  flagColors: ["#5a5aff", "#aaaaff", "#aa5aff", "#5affff", "#ff5aff", "#ffd23b"],
};

const CANDY: TrackTheme = {
  ...SUNSET,
  asphalt: "#f0a8c8",
  asphaltSpecks: ["#e098b8", "#ffb8d8", "#d888a8"],
  grass: "#c8f0c8",
  grassSpecks: ["#b8e0b8", "#d8f8d8", "#a8d8a8", "#e0ffe0", "#98c898"],
  curbA: "#ff7ad9",
  curbB: "#ffffff",
  fog: "#ffe8f5",
  fogNear: 120,
  fogFar: 400,
  skyColor: "#ffe8f5",
  sunPos: [70, 60, 50] as [number, number, number],
  hemiSky: "#fff0f8",
  hemiGround: "#c8f0c8",
  lightIntensity: 2.2,
  barrierColors: ["#ff7ad9", "#ffffff", "#7ad9ff", "#ffffff"],
  treeTrunk: "#8a5a4a",
  treeColors: ["#ff7ad9", "#7ad9ff", "#ffd23b", "#3bd16f"],
  mountainColors: ["#e0a0c0", "#d090b0"],
  flagColors: ["#ff7ad9", "#7ad9ff", "#ffd23b", "#3bd16f", "#ff3b3b", "#aa5aff"],
};

const ARCTIC_NIGHT: TrackTheme = {
  ...SNOW,
  fog: "#1a2a4a",
  fogNear: 80,
  fogFar: 280,
  skyColor: "#0a1a2a",
  sunPos: [30, 20, 80] as [number, number, number],
  hemiSky: "#2a4a6a",
  hemiGround: "#aac0d8",
  lightIntensity: 0.8,
  barrierColors: ["#5a9eff", "#ffffff", "#3a7eff", "#ffffff"],
  flagColors: ["#5a9eff", "#ffffff", "#ffd23b", "#3bd16f", "#ff7ad9", "#ff3b3b"],
};

const CANYON: TrackTheme = {
  ...DESERT,
  asphalt: "#a86a4a",
  asphaltSpecks: ["#985a3a", "#b87a5a", "#884a2a"],
  grass: "#c4864a",
  grassSpecks: ["#b4763a", "#d4965a", "#a4662a", "#e4a66a", "#94561e"],
  curbA: "#8a4a2a",
  curbB: "#e8c090",
  fog: "#e8a878",
  fogNear: 90,
  fogFar: 300,
  skyColor: "#f0b890",
  sunPos: [80, 50, 30] as [number, number, number],
  hemiSky: "#ffd0a0",
  hemiGround: "#c4864a",
  lightIntensity: 2.0,
  barrierColors: ["#8a4a2a", "#e8c090", "#a85a3a", "#e8c090"],
  mountainColors: ["#a86a4a", "#985a3a"],
  flagColors: ["#8a4a2a", "#ffd23b", "#e8762e", "#3bd16f", "#2f7bff", "#ff7ad9"],
};

const RETRO: TrackTheme = {
  ...SUNSET,
  asphalt: "#2a2a2a",
  asphaltSpecks: ["#1a1a1a", "#3a3a3a", "#252525"],
  grass: "#1a5a1a",
  grassSpecks: ["#0a4a0a", "#2a6a2a", "#1a501a", "#3a7a3a", "#0a3a0a"],
  curbA: "#ff3b3b",
  curbB: "#ffffff",
  fog: "#5a8a5a",
  fogNear: 100,
  fogFar: 340,
  skyColor: "#4a7a4a",
  sunPos: [50, 70, 50] as [number, number, number],
  hemiSky: "#8aca8a",
  hemiGround: "#1a5a1a",
  lightIntensity: 1.4,
  barrierColors: ["#ff3b3b", "#ffffff", "#ff3b3b", "#ffffff"],
  treeTrunk: "#4a3a2a",
  treeColors: ["#1a6a1a", "#2a8a2a", "#1a5a1a"],
  mountainColors: ["#3a6a3a", "#2a5a2a"],
  flagColors: ["#ff3b3b", "#ffd23b", "#2f7bff", "#3bd16f", "#ff7ad9", "#ff9a2e"],
};

export const TRACKS: TrackDef[] = [
  {
    id: "sunset_speedway",
    name: "Sunset Speedway",
    emoji: "🏁",
    laps: 3,
    roadW: 8,
    scale: 1.4,
    points: [
      [0, 0],
      [60, 0],
      [100, 20],
      [110, 60],
      [80, 90],
      [40, 80],
      [20, 110],
      [-30, 120],
      [-70, 90],
      [-60, 40],
      [-95, 10],
      [-70, -35],
      [-25, -25],
    ],
    theme: SUNSET,
    sceneryScale: 1,
    treeCount: 170,
    mountainCount: 22,
    conePositions: [40, 100, 200, 300, 380, 440, 520, 620, 700, 760],
    itemBoxIndices: [120, 330, 560],
    boostPadOffsets: [60, 250, 470, 690],
  },
  {
    id: "dunes_duel",
    name: "Dunes Duel",
    emoji: "🏜️",
    laps: 3,
    roadW: 9,
    scale: 1.3,
    points: [
      [0, 0],
      [70, 10],
      [120, 50],
      [100, 100],
      [50, 130],
      [-20, 120],
      [-80, 80],
      [-100, 20],
      [-70, -40],
      [-20, -60],
      [30, -40],
    ],
    theme: DESERT,
    sceneryScale: 1.2,
    treeCount: 60,
    mountainCount: 30,
    conePositions: [30, 90, 180, 270, 360, 450, 540, 620, 700],
    itemBoxIndices: [100, 280, 480],
    boostPadOffsets: [50, 220, 400, 580],
  },
  {
    id: "frostbite_peak",
    name: "Frostbite Peak",
    emoji: "❄️",
    laps: 3,
    roadW: 8,
    scale: 1.5,
    points: [
      [0, 0],
      [40, 20],
      [80, 10],
      [110, 40],
      [130, 80],
      [100, 120],
      [50, 140],
      [-10, 130],
      [-60, 100],
      [-90, 50],
      [-110, 0],
      [-80, -50],
      [-30, -40],
      [10, -20],
    ],
    theme: SNOW,
    sceneryScale: 1.3,
    treeCount: 120,
    mountainCount: 28,
    conePositions: [35, 95, 190, 285, 375, 435, 515, 615, 695, 755],
    itemBoxIndices: [110, 320, 540],
    boostPadOffsets: [70, 260, 480, 700],
  },
  {
    id: "lava_run",
    name: "Lava Run",
    emoji: "🌋",
    laps: 3,
    roadW: 7,
    scale: 1.3,
    points: [
      [0, 0],
      [50, -10],
      [90, 20],
      [110, 70],
      [80, 110],
      [30, 120],
      [-20, 100],
      [-60, 60],
      [-80, 10],
      [-50, -30],
      [-10, -50],
    ],
    theme: VOLCANO,
    sceneryScale: 1.1,
    treeCount: 40,
    mountainCount: 18,
    conePositions: [25, 85, 175, 260, 350, 425, 505, 595, 680],
    itemBoxIndices: [90, 250, 430],
    boostPadOffsets: [45, 200, 380, 550],
  },
  {
    id: "neon_circuit",
    name: "Neon Circuit",
    emoji: "🌃",
    laps: 4,
    roadW: 9,
    scale: 1.4,
    points: [
      [0, 0],
      [70, 0],
      [120, 30],
      [130, 80],
      [90, 110],
      [30, 100],
      [-20, 120],
      [-80, 90],
      [-110, 40],
      [-80, -20],
      [-30, -10],
      [20, -40],
      [60, -20],
    ],
    theme: NEON,
    sceneryScale: 1.2,
    treeCount: 30,
    mountainCount: 12,
    conePositions: [30, 95, 185, 280, 370, 440, 525, 620, 705, 765],
    itemBoxIndices: [100, 300, 520, 700],
    boostPadOffsets: [55, 240, 420, 600],
  },
  {
    id: "coastal_cruise",
    name: "Coastal Cruise",
    emoji: "🏖️",
    laps: 3,
    roadW: 9,
    scale: 1.5,
    points: [
      [0, 0],
      [80, 10],
      [130, 50],
      [120, 100],
      [70, 130],
      [10, 140],
      [-50, 120],
      [-100, 80],
      [-120, 20],
      [-90, -30],
      [-40, -50],
    ],
    theme: BEACH,
    sceneryScale: 1.3,
    treeCount: 80,
    mountainCount: 16,
    conePositions: [28, 88, 178, 268, 358, 438, 518, 608, 698],
    itemBoxIndices: [95, 275, 475],
    boostPadOffsets: [48, 230, 410, 590],
  },
  {
    id: "jungle_trail",
    name: "Jungle Trail",
    emoji: "🌴",
    laps: 3,
    roadW: 7,
    scale: 1.2,
    points: [
      [0, 0],
      [40, 20],
      [70, 60],
      [50, 100],
      [0, 110],
      [-50, 90],
      [-80, 50],
      [-60, 0],
      [-30, -30],
      [10, -20],
    ],
    theme: JUNGLE,
    sceneryScale: 1,
    treeCount: 220,
    mountainCount: 14,
    conePositions: [22, 78, 155, 232, 310, 388, 465, 542, 620, 698],
    itemBoxIndices: [80, 220, 380, 530],
    boostPadOffsets: [40, 180, 340, 500],
  },
  {
    id: "starlight_station",
    name: "Starlight Station",
    emoji: "🚀",
    laps: 4,
    roadW: 10,
    scale: 1.6,
    points: [
      [0, 0],
      [80, 0],
      [130, 40],
      [150, 100],
      [110, 140],
      [40, 150],
      [-30, 130],
      [-90, 90],
      [-120, 30],
      [-100, -30],
      [-40, -50],
      [20, -30],
    ],
    theme: SPACE,
    sceneryScale: 1.4,
    treeCount: 20,
    mountainCount: 10,
    conePositions: [25, 85, 175, 265, 355, 430, 510, 605, 690, 755],
    itemBoxIndices: [90, 280, 460, 640],
    boostPadOffsets: [50, 220, 400, 580],
  },
  {
    id: "candy_lane",
    name: "Candy Lane",
    emoji: "🍬",
    laps: 3,
    roadW: 9,
    scale: 1.3,
    points: [
      [0, 0],
      [50, 20],
      [90, 60],
      [70, 100],
      [20, 110],
      [-30, 90],
      [-60, 50],
      [-40, 0],
      [-10, -30],
      [30, -20],
    ],
    theme: CANDY,
    sceneryScale: 1.1,
    treeCount: 100,
    mountainCount: 16,
    conePositions: [22, 78, 155, 232, 310, 388, 465, 542, 620, 698],
    itemBoxIndices: [80, 230, 400],
    boostPadOffsets: [40, 190, 360, 520],
  },
  {
    id: "midnight_glacier",
    name: "Midnight Glacier",
    emoji: "🌌",
    laps: 3,
    roadW: 8,
    scale: 1.5,
    points: [
      [0, 0],
      [50, 15],
      [100, 30],
      [120, 70],
      [90, 110],
      [40, 130],
      [-20, 120],
      [-70, 80],
      [-100, 30],
      [-80, -20],
      [-30, -30],
    ],
    theme: ARCTIC_NIGHT,
    sceneryScale: 1.3,
    treeCount: 100,
    mountainCount: 24,
    conePositions: [25, 85, 175, 260, 350, 425, 505, 595, 680],
    itemBoxIndices: [90, 260, 440],
    boostPadOffsets: [45, 210, 390, 560],
  },
  {
    id: "canyon_carve",
    name: "Canyon Carve",
    emoji: "🪨",
    laps: 3,
    roadW: 7,
    scale: 1.4,
    points: [
      [0, 0],
      [45, 25],
      [85, 15],
      [120, 45],
      [100, 90],
      [55, 115],
      [-5, 105],
      [-55, 75],
      [-85, 25],
      [-65, -25],
      [-20, -35],
    ],
    theme: CANYON,
    sceneryScale: 1.2,
    treeCount: 50,
    mountainCount: 32,
    conePositions: [24, 82, 168, 252, 336, 412, 492, 578, 665, 738],
    itemBoxIndices: [85, 250, 430],
    boostPadOffsets: [42, 195, 370, 535],
  },
  {
    id: "retro_ridge",
    name: "Retro Ridge",
    emoji: "🎮",
    laps: 3,
    roadW: 8,
    scale: 1.3,
    points: [
      [0, 0],
      [55, 5],
      [95, 35],
      [85, 80],
      [40, 95],
      [-10, 85],
      [-55, 55],
      [-75, 10],
      [-45, -25],
      [5, -15],
    ],
    theme: RETRO,
    sceneryScale: 1,
    treeCount: 140,
    mountainCount: 20,
    conePositions: [25, 85, 175, 260, 345, 420, 500, 585, 670],
    itemBoxIndices: [90, 250, 420],
    boostPadOffsets: [45, 200, 380, 550],
  },
];

export function getTrack(id: string): TrackDef {
  return TRACKS.find((t) => t.id === id) ?? TRACKS[0]!;
}

export type TrackData = ReturnType<typeof buildTrackData>;

export function buildTrackData(def: TrackDef) {
  const curve = new THREE.CatmullRomCurve3(
    def.points.map(([x, z]) => new THREE.Vector3(x * def.scale, 0, z * def.scale)),
    true,
    "centripetal",
  );
  const N = 800;
  const ROAD_W = def.roadW;
  const WALL = ROAD_W + 4.5;
  const LAPS = def.laps;
  const samples = curve.getSpacedPoints(N).slice(0, N);
  const tangents = samples.map((_, i) => curve.getTangentAt(i / N));
  const trackLength = curve.getLength();

  const S = (i: number) => samples[((i % N) + N) % N]!;
  const T = (i: number) => tangents[((i % N) + N) % N]!;
  const yawAt = (i: number) => Math.atan2(T(i).x, T(i).z);

  function nearest(x: number, z: number, hint = -1) {
    let best = 0;
    let bd = Infinity;
    const from = hint < 0 ? 0 : hint - 40;
    const to = hint < 0 ? N : hint + 40;
    for (let k = from; k < to; k++) {
      const i = ((k % N) + N) % N;
      const p = S(i);
      const d = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return { i: best, d: Math.sqrt(bd) };
  }

  function leftAt(i: number) {
    const t = T(i);
    return new THREE.Vector3(t.z, 0, -t.x).normalize();
  }

  function gridSlot(slot: number) {
    const row = Math.floor(slot / 2);
    const col = slot % 2 === 0 ? 1 : -1;
    const i = N - 6 - row * 7;
    const p = S(i);
    const l = leftAt(i);
    const t = T(i);
    return {
      x: p.x + l.x * col * 3.2,
      z: p.z + l.z * col * 3.2,
      ry: Math.atan2(t.x, t.z),
      idx: i,
    };
  }

  function lapProgress(lap: number, idx: number) {
    return lap + idx / N;
  }

  const itemBoxes = def.itemBoxIndices.flatMap((i) =>
    [-4, 0, 4].map((o) => {
      const p = S(i);
      const l = leftAt(i);
      return new THREE.Vector3(p.x + l.x * o, 1.2, p.z + l.z * o);
    }),
  );

  const boostPads = def.boostPadOffsets.map((i, n) => {
    const p = S(i);
    const l = leftAt(i);
    const o = n % 2 ? 3.5 : -3.5;
    const t = T(i);
    return { pos: new THREE.Vector3(p.x + l.x * o, 0.04, p.z + l.z * o), ry: Math.atan2(t.x, t.z) };
  });

  return {
    def,
    curve,
    N,
    ROAD_W,
    WALL,
    LAPS,
    samples,
    tangents,
    trackLength,
    S,
    T,
    yawAt,
    nearest,
    leftAt,
    gridSlot,
    lapProgress,
    itemBoxes,
    boostPads,
  };
}
