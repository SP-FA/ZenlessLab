// ─────────────────────────────────────────────
// Port of core/config.py
// App-level config stored in %APPDATA%.
// Separate from Store (which lives in Mods/).
// ─────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import type { AppConfig } from "./types";
import { DEFAULT_CONFIG } from "./types";

const APP_NAME = "ZZMI_ModManager";
const CONFIG_FILENAME = "config.json";

function appDataDir(): string {
  return process.env.APPDATA || path.join(os.homedir(), ".config");
}

function configPath(): string {
  return path.join(appDataDir(), APP_NAME, CONFIG_FILENAME);
}

function findD3dxRoot(start: string): string | null {
  let p = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(p, "d3dx.ini"))) return p;
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  return null;
}

export function defaultModsPath(): string {
  // 1. CWD upward
  let r = findD3dxRoot(process.cwd());
  if (r) return path.join(r, "ZZMI", "Mods");

  // 2. Exe directory upward
  r = findD3dxRoot(process.execPath);
  if (r) return path.join(r, "ZZMI", "Mods");

  // 3. Common install location
  const candidate = path.join(appDataDir(), "XXMI Launcher", "XXMI", "ZZMI", "Mods");
  if (fs.existsSync(candidate)) return candidate;

  // 4. Legacy fallback
  return path.join(appDataDir(), "XXMI Launcher", "ZZMI", "Mods");
}

export class Config {
  data: AppConfig;
  filePath: string;

  constructor() {
    this.data = { ...DEFAULT_CONFIG };
    this.filePath = configPath();
    this.load();
  }

  load(): Config {
    if (!fs.existsSync(this.filePath)) return this;
    try {
      const raw = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
      if (typeof raw !== "object" || !raw) return this;
      const d = this.data;
      if (typeof raw.mods_path === "string") d.mods_path = raw.mods_path;
      if (["light", "dark", "auto"].includes(raw.theme)) d.theme = raw.theme;
      if (typeof raw.confirm_exclusive === "boolean") d.confirm_exclusive = raw.confirm_exclusive;
      if (typeof raw.window_geometry === "string") d.window_geometry = raw.window_geometry;
      if (typeof raw.launcher_exe === "string") d.launcher_exe = raw.launcher_exe;
    } catch {
      // corrupt file — use defaults
    }
    return this;
  }

  save(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
  }

  resolvedModsPath(): string {
    return this.data.mods_path || defaultModsPath();
  }

  update(partial: Partial<AppConfig>): void {
    if (partial.mods_path !== undefined) this.data.mods_path = partial.mods_path;
    if (partial.theme !== undefined) this.data.theme = partial.theme;
    if (partial.confirm_exclusive !== undefined) this.data.confirm_exclusive = partial.confirm_exclusive;
    if (partial.launcher_exe !== undefined) this.data.launcher_exe = partial.launcher_exe;
    this.save();
  }
}