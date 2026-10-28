// Copies WASI binding files into rolldown's dist directory so the runtime
// can find them even when npm's optional-dependencies bug prevents the
// normal resolution path from working.
import { existsSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const wasiPkgDir = join(projectRoot, "node_modules", "@rolldown", "binding-wasm32-wasi");
const rolldownSharedDir = join(projectRoot, "node_modules", "rolldown", "dist", "shared");
const rolldownDistDir = join(projectRoot, "node_modules", "rolldown", "dist");

if (!existsSync(wasiPkgDir)) {
  console.log("[fix-rolldown] @rolldown/binding-wasm32-wasi not found, skipping");
  process.exit(0);
}

// The binding loader tries __require("../rolldown-binding.wasi.cjs")
// relative to node_modules/rolldown/dist/shared/binding-*.mjs
const targets = [
  { from: join(wasiPkgDir, "rolldown-binding.wasi.cjs"), to: join(rolldownDistDir, "rolldown-binding.wasi.cjs") },
  { from: join(wasiPkgDir, "rolldown-binding.wasm32-wasi.wasm"), to: join(rolldownDistDir, "rolldown-binding.wasm32-wasi.wasm") },
  { from: join(wasiPkgDir, "wasi-worker.mjs"), to: join(rolldownDistDir, "wasi-worker.mjs") },
];

// Also copy to dist/shared/ for the ./rolldown-binding.wasi.cjs resolution path
const sharedTargets = [
  { from: join(wasiPkgDir, "rolldown-binding.wasi.cjs"), to: join(rolldownSharedDir, "rolldown-binding.wasi.cjs") },
  { from: join(wasiPkgDir, "rolldown-binding.wasm32-wasi.wasm"), to: join(rolldownSharedDir, "rolldown-binding.wasm32-wasi.wasm") },
  { from: join(wasiPkgDir, "wasi-worker.mjs"), to: join(rolldownSharedDir, "wasi-worker.mjs") },
];

for (const { from, to } of [...targets, ...sharedTargets]) {
  const dir = dirname(to);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (existsSync(from)) {
    copyFileSync(from, to);
    console.log(`[fix-rolldown] Copied ${from.replace(projectRoot + "/", "")} -> ${to.replace(projectRoot + "/", "")}`);
  } else {
    console.log(`[fix-rolldown] Source not found: ${from.replace(projectRoot + "/", "")}`);
  }
}

console.log("[fix-rolldown] Done");
