// ─────────────────────────────────────────────
// Port of core/launcher.py
// Find and launch XXMI Launcher.exe with
// --nogui --xxmi ZZMI
// ─────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import { execFile, execSync } from "child_process";
import { findD3dxRoot } from "./persist";

const LAUNCHER_REL = path.join("Resources", "Bin", "XXMI Launcher.exe");
export const DEFAULT_IMPORTER = "ZZMI";

export class LauncherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LauncherError";
  }
}

export function findLauncherExe(modsRoot: string): string | null {
  const d3dxDir = findD3dxRoot(modsRoot);
  if (!d3dxDir) return null;

  // Walk up from d3dx.ini directory to find Resources/Bin/XXMI Launcher.exe
  let p = d3dxDir;
  while (true) {
    const exe = path.join(p, LAUNCHER_REL);
    if (fs.existsSync(exe)) return exe;
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  return null;
}

export function launchGame(exePath: string, importer: string = DEFAULT_IMPORTER): void {
  if (!fs.existsSync(exePath)) {
    throw new LauncherError(`Launcher not found: ${exePath}`);
  }

  if (process.platform === "win32") {
    // Use ShellExecute with "runas" for UAC elevation (matching Python behavior)
    // On Windows, XXMI Launcher.exe requires administrator privileges
    try {
      // Use PowerShell Start-Process with -Verb RunAs for UAC
      execSync(
        `powershell -Command "Start-Process '${exePath}' -ArgumentList '--nogui --xxmi ${importer}' -Verb RunAs"`,
        { stdio: "ignore" },
      );
    } catch (e) {
      throw new LauncherError(`Failed to launch launcher: ${exePath} (${e})`);
    }
  } else {
    execFile(exePath, ["--nogui", "--xxmi", importer], (err) => {
      if (err) throw new LauncherError(`Failed to launch launcher: ${exePath} (${err})`);
    });
  }
}