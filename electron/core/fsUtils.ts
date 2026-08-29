// ─────────────────────────────────────────────
// Shared filesystem utilities for the mod
// manager core. All synchronous (main process
// only — never called from renderer).
// ─────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { shell } from "electron";
import { DISABLED_PREFIX } from "./types";

/** Strip the 3DMigoto DISABLED prefix from a folder name. */
export function stripDisabled(name: string): { name: string; wasDisabled: boolean } {
  if (name.startsWith(DISABLED_PREFIX)) {
    return { name: name.slice(DISABLED_PREFIX.length), wasDisabled: true };
  }
  if (name.startsWith("DISABLED") && !name.startsWith("DISABLED ")) {
    return { name: name.slice("DISABLED".length).trimStart(), wasDisabled: true };
  }
  return { name, wasDisabled: false };
}

/** Check if a file is an .ini or .ini.disabled. */
export function isIniLike(p: string): boolean {
  const name = path.basename(p).toLowerCase();
  return name.endsWith(".ini") || name.endsWith(".ini.disabled");
}

/** List .ini / .ini.disabled files in a folder. */
export function listInis(folder: string, recursive: boolean = false): string[] {
  if (!fs.existsSync(folder)) return [];
  const results: string[] = [];
  if (recursive) {
    _walk(folder, (p) => {
      if (isIniLike(p)) results.push(p);
    });
  } else {
    for (const entry of fs.readdirSync(folder)) {
      const full = path.join(folder, entry);
      if (fs.statSync(full).isFile() && isIniLike(full)) {
        results.push(full);
      }
    }
  }
  return results.sort();
}

function _walk(dir: string, cb: (p: string) => void): void {
  try {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const st = fs.statSync(full);
      if (st.isFile()) {
        cb(full);
      } else if (st.isDirectory() && !entry.startsWith(".")) {
        _walk(full, cb);
      }
    }
  } catch {
    // Permission errors etc. — skip
  }
}

/** Send a path to the OS recycle bin. Falls back to permanent delete. */
export function sendToTrash(target: string): void {
  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

/** Open a folder in the system file explorer. */
export function openInExplorer(folderPath: string): void {
  const cmd = process.platform === "win32"
    ? `explorer "${folderPath}"`
    : process.platform === "darwin"
      ? `open "${folderPath}"`
      : `xdg-open "${folderPath}"`;
  exec(cmd);
}

/** Open any path with the system default handler. */
export function openPath(absPath: string): void {
  shell.openPath(absPath);
}

/** Atomic JSON write: write to temp file then rename. */
export function atomicWriteJson(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  const tmp = path.join(dir, `.tmp_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tmp, filePath);
  } catch {
    // best-effort
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
}

/** Atomic text write: write to temp file then rename. */
export function atomicWriteText(filePath: string, text: string): void {
  const dir = path.dirname(filePath);
  const tmp = path.join(dir, `.tmp_${Date.now()}_${Math.random().toString(36).slice(2)}.txt`);
  try {
    fs.writeFileSync(tmp, text, "utf-8");
    fs.renameSync(tmp, filePath);
  } catch {
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
}

/** Validate that a path does not escape a target root (path traversal check). */
export function validatePathTraversal(entryPath: string, targetRoot: string): boolean {
  const resolved = path.resolve(targetRoot, entryPath);
  const normalizedRoot = path.resolve(targetRoot);
  return resolved.startsWith(normalizedRoot + path.sep) || resolved === normalizedRoot;
}

/** Beautify: underscores to spaces, collapse multiple spaces. */
export function prettyName(folderName: string): string {
  return folderName.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}