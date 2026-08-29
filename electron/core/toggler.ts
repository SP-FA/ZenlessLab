// ─────────────────────────────────────────────
// Port of core/toggler.py
// Enable/disable mods by renaming .ini files.
// File-level .disabled suffix (not folder-level
// DISABLED prefix) to handle flat-root variants.
//
// Since scanMods now recursively collects all
// .ini files under a mod folder, toggling a mod
// automatically affects all its sub-modules.
// ─────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import type { ModUnit } from "./types";
import { backupForInis, restoreForInis } from "./persist";
import { listInis } from "./fsUtils";

const DISABLED_SUFFIX = ".disabled";

export class ToggleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToggleError";
  }
}

function disabledIni(ini: string): string {
  return ini + DISABLED_SUFFIX;
}

function enabledIni(ini: string): string {
  const name = path.basename(ini);
  if (name.endsWith(DISABLED_SUFFIX)) {
    return path.join(
      path.dirname(ini),
      name.slice(0, -DISABLED_SUFFIX.length),
    );
  }
  return ini;
}

function unitEnabled(unit: ModUnit): boolean {
  if (unit.ini_files.length === 0) return false;
  return unit.ini_files.some(
    p => !path.basename(p).toLowerCase().endsWith(DISABLED_SUFFIX),
  );
}

export function isDisabled(unit: ModUnit): boolean {
  return !unitEnabled(unit);
}

function refreshAbsPaths(unit: ModUnit): void {
  const folder = unit.ini_files.length > 0
    ? path.dirname(unit.ini_files[0])
    : unit.abs_path;
  if (fs.existsSync(folder)) {
    // Re-scan recursively to catch all sub-module ini files
    unit.ini_files = listInis(unit.abs_path, true);
  }
}

export function disableUnit(unit: ModUnit): string[] {
  backupForInis(
    unit.ini_files.filter(
      p => !path.basename(p).toLowerCase().endsWith(DISABLED_SUFFIX),
    ),
  );

  const changed: string[] = [];
  const srcs = unit.ini_files.filter(
    p => !path.basename(p).toLowerCase().endsWith(DISABLED_SUFFIX),
  );
  if (srcs.length === 0) return changed;

  for (const src of srcs) {
    const dst = disabledIni(src);
    if (fs.existsSync(dst)) {
      // Rollback
      for (const c of changed) {
        try {
          fs.renameSync(disabledIni(c), c);
        } catch {
          /* best-effort */
        }
      }
      throw new ToggleError(
        `Target already exists, cannot disable: ${dst}`,
      );
    }
    try {
      fs.renameSync(src, dst);
    } catch (e) {
      throw new ToggleError(`Rename failed: ${src} -> ${dst} (${e})`);
    }
    changed.push(src);
  }

  refreshAbsPaths(unit);
  unit.is_enabled = false;
  return changed;
}

export function enableUnit(unit: ModUnit): string[] {
  const changed: string[] = [];
  const srcs = unit.ini_files.filter(
    p => path.basename(p).toLowerCase().endsWith(DISABLED_SUFFIX),
  );
  if (srcs.length === 0) return changed;

  for (const src of srcs) {
    const dst = enabledIni(src);
    if (fs.existsSync(dst)) {
      throw new ToggleError(
        `Target already exists, cannot enable: ${dst}`,
      );
    }
    try {
      fs.renameSync(src, dst);
    } catch (e) {
      throw new ToggleError(`Rename failed: ${src} -> ${dst} (${e})`);
    }
    changed.push(src);
  }

  refreshAbsPaths(unit);
  unit.is_enabled = true;
  restoreForInis(unit.ini_files);
  return changed;
}

/**
 * Enable a unit and disable all other units in the same character group.
 * All mods are exclusive within their character group.
 */
export function activateExclusive(
  unit: ModUnit,
  allUnits: ModUnit[],
): Array<{ unit: ModUnit; action: "enabled" | "disabled" }> {
  const log: Array<{ unit: ModUnit; action: "enabled" | "disabled" }> = [];

  const targetGroup = unit.character;
  for (const other of allUnits) {
    if (other === unit) continue;
    if (other.character !== targetGroup) continue;
    if (!isDisabled(other)) {
      disableUnit(other);
      log.push({ unit: other, action: "disabled" });
    }
  }

  enableUnit(unit);
  log.push({ unit, action: "enabled" });
  return log;
}

function unitMtime(unit: ModUnit): number {
  let best = 0;
  for (const p of unit.ini_files) {
    try {
      const mtime = fs.statSync(p).mtimeMs;
      if (mtime > best) best = mtime;
    } catch {
      // skip
    }
  }
  return best;
}

/**
 * Reconcile exclusive state: if multiple mods are enabled in a group,
 * keep only the most recently modified one (or the last-known choice).
 */
export function reconcileExclusive(
  units: ModUnit[],
  store?: {
    getEnabledChoice(g: string): string | null;
    setEnabledChoice(g: string, rp: string | null): void;
  },
): Array<{ unit: ModUnit; action: "enabled" | "disabled" }> {
  const log: Array<{ unit: ModUnit; action: "enabled" | "disabled" }> = [];

  const byGroup: Record<string, ModUnit[]> = {};
  for (const u of units) {
    if (!byGroup[u.character]) byGroup[u.character] = [];
    byGroup[u.character].push(u);
  }

  for (const [group, members] of Object.entries(byGroup)) {
    const enabled = members.filter(u => !isDisabled(u));

    let chosen: ModUnit | null = null;
    if (store) {
      const rec = store.getEnabledChoice(group);
      if (rec) {
        chosen = enabled.find(u => u.rel_path === rec) || null;
      }
    }

    if (chosen === null && enabled.length > 1) {
      chosen = enabled.reduce((a, b) =>
        unitMtime(a) > unitMtime(b) ? a : b,
      );
    }

    if (chosen === null) {
      if (store) {
        store.setEnabledChoice(
          group,
          enabled.length > 0 ? enabled[0].rel_path : null,
        );
      }
      continue;
    }

    for (const u of enabled) {
      if (u === chosen) continue;
      try {
        disableUnit(u);
        log.push({ unit: u, action: "disabled" });
      } catch {
        // skip toggle errors during reconciliation
      }
    }

    if (store) {
      store.setEnabledChoice(group, chosen.rel_path);
    }
  }

  return log;
}