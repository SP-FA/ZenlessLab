// ─────────────────────────────────────────────
// Mod scanner — scans the Mods directory for
// mod units, resolves character groups via
// hash matching against hash tables.
//
// Directory structure:
//   Mods/
//   ├── 流萤席德2.0/          ← first-level = mod name
//   │   ├── Mod_席德/          ← sub-module
//   │   │   ├── xxx.ini
//   │   │   └── ...
//   │   └── Mod_席德武器/      ← sub-module
//   │       └── yyy.ini
//   └── 艾莲清凉装/            ← mod with direct ini files
//       ├── xxx.ini
//       └── ...
// ─────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import type { ModUnit } from "./types";
import { DISABLED_PREFIX } from "./types";
import { extractKeyBindings } from "./iniParser";
import { stripDisabled, listInis } from "./fsUtils";
import {
  resolveCharacterByHash,
} from "./hashResolver";

// ── Mod Unit Building ────────────────────────

function buildModUnit(
  modFolder: string,
  modsRoot: string,
  hashIndex: Map<string, string>,
): ModUnit {
  const folderName = path.basename(modFolder);
  const { name: cleanName } = stripDisabled(folderName);

  // Recursively find ALL .ini / .ini.disabled files
  const iniFiles = listInis(modFolder, true);

  // Enabled = at least one non-.disabled ini
  const enabled = iniFiles.some(
    p => !path.basename(p).toLowerCase().endsWith(".disabled"),
  );

  // Key bindings from all ini files
  const keyBindings = iniFiles.flatMap(ini => extractKeyBindings(ini));

  // README
  let readme: string | null = null;
  for (const candidate of ["README.txt", "README.md", "readme.txt", "Readme.txt"]) {
    const rp = path.join(modFolder, candidate);
    if (fs.existsSync(rp)) {
      try {
        readme = fs.readFileSync(rp, "utf-8");
      } catch {
        readme = null;
      }
      break;
    }
  }

  // Sidecar files (preview, note)
  let previewPath: string | null = null;
  let note = "";
  try {
    for (const entry of fs.readdirSync(modFolder)) {
      const full = path.join(modFolder, entry);
      if (
        fs.statSync(full).isFile() &&
        entry.startsWith(".zzmi_preview.")
      ) {
        previewPath = full;
        break;
      }
    }
  } catch {
    // skip
  }
  const noteFile = path.join(modFolder, ".zzmi_note.txt");
  if (fs.existsSync(noteFile)) {
    try {
      note = fs.readFileSync(noteFile, "utf-8");
    } catch {
      note = "";
    }
  }

  // Character detection via hash matching
  // Optimization: only read one .ini file — all files in a mod
  // folder belong to the same character.
  let character = resolveCharacterByHash(iniFiles, hashIndex);

  // Fallback: use display name
  if (!character) {
    character = cleanName;
  }

  const rel = path.relative(modsRoot, modFolder).replace(/\\/g, "/");

  return {
    abs_path: modFolder,
    rel_path: rel,
    display_name: cleanName,
    is_enabled: enabled,
    ini_files: iniFiles,
    key_bindings: keyBindings,
    readme: readme,
    character: character,
    preview_path: previewPath,
    note: note,
  };
}

// ── Main Scan ───────────────────────────────

export function scanMods(modsRoot: string, hashIndex: Map<string, string>): ModUnit[] {
  const units: ModUnit[] = [];
  if (!fs.existsSync(modsRoot)) return units;

  try {
    // Only scan first-level subdirectories — each is a mod
    const entries = fs.readdirSync(modsRoot).sort();
    for (const entry of entries) {
      const full = path.join(modsRoot, entry);
      if (!fs.statSync(full).isDirectory()) continue;
      if (entry.startsWith(".")) continue;

      const unit = buildModUnit(full, modsRoot, hashIndex);
      units.push(unit);
    }
  } catch {
    // skip
  }

  return units;
}

// ── Grouping ─────────────────────────────────

export function groupByCharacter(units: ModUnit[]): {
  groups: Record<string, ModUnit[]>;
  groupKeys: string[];
} {
  const groups: Record<string, ModUnit[]> = {};
  for (const u of units) {
    const key = u.character;
    if (!groups[key]) groups[key] = [];
    groups[key].push(u);
  }

  // Sort each group by display name (case-insensitive)
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) =>
      a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase()),
    );
  }

  // Sort group keys alphabetically
  const groupKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  return { groups, groupKeys };
}

// ── Legacy: findModUnits for importer ────────

/**
 * Find all directories that contain .ini files (mod units).
 * Used by the importer to discover mod units in extracted archives.
 * Kept for backward compatibility with the importer.
 */
export function findModUnits(folder: string): string[] {
  const units: string[] = [];
  if (!fs.existsSync(folder)) return units;

  // Check if folder itself has direct INI files
  const directInis = listInis(folder, false);
  if (directInis.length > 0) {
    units.push(folder);
    return units;
  }

  // Recurse into subdirectories
  try {
    const entries = fs.readdirSync(folder).sort();
    for (const entry of entries) {
      const full = path.join(folder, entry);
      if (
        fs.statSync(full).isDirectory() &&
        !entry.startsWith(".")
      ) {
        units.push(...findModUnits(full));
      }
    }
  } catch {
    // skip
  }
  return units;
}