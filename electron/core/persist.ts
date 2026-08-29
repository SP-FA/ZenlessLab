// ─────────────────────────────────────────────
// Port of core/persist.py
// Backs up / restores 3DMigoto d3dx_user.ini
// entries when toggling mods.
// ─────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import { atomicWriteJson, atomicWriteText } from "./fsUtils";

const BACKUP_FILENAME = ".zzmi_persist_backup.json";

/** Walk up from `start` to find the directory containing `d3dx.ini`. */
export function findD3dxRoot(start: string): string | null {
  let p = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(p, "d3dx.ini"))) return p;
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  return null;
}

function userIniPath(d3dxRoot: string): string {
  return path.join(d3dxRoot, "d3dx_user.ini");
}

function backupPath(d3dxRoot: string): string {
  return path.join(d3dxRoot, BACKUP_FILENAME);
}

function persistPrefix(d3dxRoot: string, iniPath: string): string | null {
  const rel = path.relative(d3dxRoot, path.resolve(iniPath));
  if (rel.startsWith("..")) return null;
  const relStr = rel.replace(/\\/g, "/").toLowerCase().replace(/\//g, "\\");
  return `$\\${relStr}\\`;
}

function readLines(filePath: string): string[] {
  try {
    return fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
  } catch {
    return [];
  }
}

function loadBackup(d3dxRoot: string): Record<string, string[]> {
  try {
    const raw = fs.readFileSync(backupPath(d3dxRoot), "utf-8");
    const data = JSON.parse(raw);
    if (data && typeof data === "object") {
      const result: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(data)) {
        if (Array.isArray(v)) result[k] = v as string[];
      }
      return result;
    }
  } catch {
    // missing or corrupt — start fresh
  }
  return {};
}

function keyOf(line: string): string {
  const eqIdx = line.indexOf("=");
  if (eqIdx >= 0) return line.substring(0, eqIdx).trim().toLowerCase();
  return line.trim().toLowerCase();
}

export function backupForInis(iniPaths: string[]): void {
  const paths = iniPaths.filter(Boolean);
  if (paths.length === 0) return;
  const d3dxRoot = findD3dxRoot(paths[0]);
  if (!d3dxRoot) return;
  const userIni = userIniPath(d3dxRoot);
  if (!fs.existsSync(userIni)) return;

  const lines = readLines(userIni);
  const prefixes: Record<string, string[]> = {};
  for (const ini of paths) {
    const pre = persistPrefix(d3dxRoot, ini);
    if (pre) prefixes[pre] = [];
  }
  if (Object.keys(prefixes).length === 0) return;

  for (const ln of lines) {
    const s = ln.trim();
    if (!s.startsWith("$")) continue;
    const low = s.toLowerCase();
    for (const pre of Object.keys(prefixes)) {
      if (low.startsWith(pre)) {
        prefixes[pre].push(s);
        break;
      }
    }
  }

  const backup = loadBackup(d3dxRoot);
  for (const [pre, captured] of Object.entries(prefixes)) {
    backup[pre] = captured;
  }
  atomicWriteJson(backupPath(d3dxRoot), backup);
}

export function restoreForInis(iniPaths: string[]): void {
  const paths = iniPaths.filter(Boolean);
  if (paths.length === 0) return;
  const d3dxRoot = findD3dxRoot(paths[0]);
  if (!d3dxRoot) return;
  const userIni = userIniPath(d3dxRoot);
  if (!fs.existsSync(userIni)) return;
  const backup = loadBackup(d3dxRoot);
  if (Object.keys(backup).length === 0) return;

  const prefixes: string[] = [];
  for (const ini of paths) {
    const pre = persistPrefix(d3dxRoot, ini);
    if (pre && backup[pre]) prefixes.push(pre);
  }
  if (prefixes.length === 0) return;

  const lines = readLines(userIni);
  const currentKeys = new Set<string>();
  for (const ln of lines) {
    if (ln.trim().startsWith("$")) {
      currentKeys.add(keyOf(ln));
    }
  }

  const toAdd: string[] = [];
  for (const pre of prefixes) {
    for (const ln of backup[pre]) {
      const k = keyOf(ln);
      if (!currentKeys.has(k)) {
        toAdd.push(ln);
        currentKeys.add(k);
      }
    }
  }
  if (toAdd.length === 0) return;

  const newText = [...lines, ...toAdd].join("\n") + "\n";
  atomicWriteText(userIni, newText);
}

export function forgetForInis(iniPaths: string[]): void {
  const paths = iniPaths.filter(Boolean);
  if (paths.length === 0) return;
  const d3dxRoot = findD3dxRoot(paths[0]);
  if (!d3dxRoot) return;
  const backup = loadBackup(d3dxRoot);
  if (Object.keys(backup).length === 0) return;

  const prefixes = new Set<string>();
  for (const ini of paths) {
    const pre = persistPrefix(d3dxRoot, ini);
    if (pre) prefixes.add(pre);
  }
  let changed = false;
  for (const pre of prefixes) {
    if (pre in backup) { delete backup[pre]; changed = true; }
  }
  if (changed) atomicWriteJson(backupPath(d3dxRoot), backup);
}