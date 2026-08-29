// ─────────────────────────────────────────────
// Archive import: extract → plan → commit.
// Supports .zip, .7z, .rar
//
// Mods are imported as first-level directories
// under Mods/. Character grouping is determined
// by hash matching at scan time.
// ─────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import type { ImportPlan, ImportUnitPlan } from "./types";
import { listInis, stripDisabled, sendToTrash } from "./fsUtils";
import { findModUnits } from "./scanner";
import { forgetForInis } from "./persist";
import { resolveCharacterByHash } from "./hashResolver";

const SUPPORTED_EXTS = new Set([".zip", ".7z", ".rar"]);

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportError";
  }
}

export function isSupportedArchive(filePath: string): boolean {
  return SUPPORTED_EXTS.has(path.extname(filePath).toLowerCase());
}

function findSystem7z(): string | null {
  const candidates = [
    "C:\\Program Files\\7-Zip\\7z.exe",
    "C:\\Program Files (x86)\\7-Zip\\7z.exe",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  // Check PATH
  try {
    const result = execSync("where 7z 2>nul || where 7z.exe 2>nul", {
      encoding: "utf-8",
    });
    const first = result.trim().split(/\r?\n/)[0];
    if (first && fs.existsSync(first)) return first.trim();
  } catch {
    // not found
  }
  return null;
}

function extract(archive: string, dest: string): void {
  const ext = path.extname(archive).toLowerCase();
  try {
    if (ext === ".zip") {
      if (process.platform === "win32") {
        execSync(
          `powershell -Command "Expand-Archive -Path '${archive}' -DestinationPath '${dest}' -Force"`,
          { stdio: "ignore" },
        );
      } else {
        execSync(`unzip -o "${archive}" -d "${dest}"`, { stdio: "ignore" });
      }
    } else if (ext === ".7z") {
      const sevenz = findSystem7z();
      if (!sevenz)
        throw new ImportError(
          "7-Zip not found. Please install 7-Zip to extract .7z files.",
        );
      execSync(`"${sevenz}" x "${archive}" -o"${dest}" -y`, {
        stdio: "ignore",
      });
    } else if (ext === ".rar") {
      const sevenz = findSystem7z();
      if (!sevenz)
        throw new ImportError(
          "7-Zip not found. Please install 7-Zip to extract .rar files.",
        );
      execSync(`"${sevenz}" x "${archive}" -o"${dest}" -y`, {
        stdio: "ignore",
      });
    } else {
      throw new ImportError(`Unsupported format: ${ext}`);
    }
  } catch (e) {
    if (e instanceof ImportError) throw e;
    throw new ImportError(`Extraction failed: ${e}`);
  }
}

function archiveRoot(archive: string): string {
  let name = path.basename(archive, path.extname(archive));
  // Strip version/author noise
  name = name.replace(/[_-]?v?\d+\.\d+.*$/i, "");
  name = name.replace(/\(.*?\)/g, "");
  name = name.replace(/\[.*?\]/g, "");
  name = name.replace(/[_-]/g, " ").trim();
  return name || path.basename(archive, path.extname(archive));
}

function sanitizedFolderName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").trim() || "imported_mod";
}

/**
 * Detect the character group for a mod folder using hash matching.
 * Reads one .ini file and matches against the hash index.
 */
function detectGroupByHash(
  unitFolder: string,
  hashIndex: Map<string, string>,
  fallback: string,
): string {
  const inis = listInis(unitFolder, true);
  if (inis.length === 0) return fallback;

  const resolved = resolveCharacterByHash(inis, hashIndex);
  return resolved || fallback;
}

function planUnit(
  unitFolder: string,
  tmpRoot: string,
  modsRoot: string,
  archive: string,
  fallbackGroup: string,
  hashIndex: Map<string, string>,
): ImportUnitPlan {
  const rel = path.relative(tmpRoot, unitFolder);
  const subName =
    rel === "." || rel === ""
      ? sanitizedFolderName(path.basename(archive, path.extname(archive)))
      : sanitizedFolderName(path.basename(rel));

  // Import as first-level directory: Mods/<modName>
  const target = path.join(modsRoot, subName);
  const conflict = fs.existsSync(target) ? target : null;

  // Detect group via hash matching
  const group = detectGroupByHash(unitFolder, hashIndex, fallbackGroup);

  return {
    source_folder: unitFolder,
    target,
    group,
    conflict_with: conflict,
  };
}

export function previewImport(
  archive: string,
  modsRoot: string,
  hashIndex?: Map<string, string>,
): ImportPlan {
  if (!isSupportedArchive(archive)) {
    throw new ImportError(
      `Only ${[...SUPPORTED_EXTS].join(", ")} supported, got: ${path.extname(archive)}`,
    );
  }
  if (!fs.existsSync(modsRoot)) {
    throw new ImportError(`Mods directory does not exist: ${modsRoot}`);
  }

  const fallbackGroup = sanitizedFolderName(archiveRoot(archive));
  const hashIdx = hashIndex || new Map<string, string>();
  const tmpPath = fs.mkdtempSync(path.join(os.tmpdir(), "zzmi_import_"));

  try {
    extract(archive, path.join(tmpPath, "raw"));

    const unitFolders = findModUnits(path.join(tmpPath, "raw"));
    if (unitFolders.length === 0) {
      throw new ImportError(
        "No mod units with .ini files found in archive (may not be an XXMI mod)",
      );
    }

    const plan: ImportPlan = { tmp_dir: tmpPath, units: [] };
    for (const unitFolder of unitFolders) {
      plan.units.push(
        planUnit(
          unitFolder,
          path.join(tmpPath, "raw"),
          modsRoot,
          archive,
          fallbackGroup,
          hashIdx,
        ),
      );
    }
    return plan;
  } catch (e) {
    // Clean up temp dir on failure
    try {
      fs.rmSync(tmpPath, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    throw e;
  }
}

export function commitImport(
  plan: ImportPlan,
  overwriteUnits: Set<number> | null = null,
): string[] {
  const overwrite = overwriteUnits || new Set();
  const imported: string[] = [];

  for (let i = 0; i < plan.units.length; i++) {
    const u = plan.units[i];
    if (u.conflict_with !== null) {
      if (!overwrite.has(i)) continue; // User chose to skip
      // Overwrite: send old to trash
      const oldInis = listInis(u.target, true);
      sendToTrash(u.target);
      forgetForInis(oldInis);
    }
    // Copy
    copyRecursive(u.source_folder, u.target);
    imported.push(u.target);
  }

  return imported;
}

function copyRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Convenience: import an archive with auto-overwrite.
 */
export function importArchive(
  archive: string,
  modsRoot: string,
  hashIndex?: Map<string, string>,
): string[] {
  const plan = previewImport(archive, modsRoot, hashIndex);
  try {
    const overwrite = new Set<number>();
    for (let i = 0; i < plan.units.length; i++) {
      if (plan.units[i].conflict_with !== null) overwrite.add(i);
    }
    return commitImport(plan, overwrite);
  } finally {
    try {
      fs.rmSync(plan.tmp_dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}