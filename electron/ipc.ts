// ─────────────────────────────────────────────
// IPC handler registration.
// Maps every IPC channel to its core function,
// catches errors, and returns {ok, data/error}.
// ─────────────────────────────────────────────

import { ipcMain, dialog, BrowserWindow, app } from "electron";
import { IPC } from "./ipc-channels";
import type { IpcResult, ImportPlan } from "./core/types";
import { Config, defaultModsPath } from "./core/config";
import { Store } from "./core/store";
import { scanMods, groupByCharacter } from "./core/scanner";
import { toggleUnit, disableGroup } from "./core/toggleOps";
import { reconcileExclusive } from "./core/toggler";
import {
  previewImport,
  commitImport,
  isSupportedArchive,
} from "./core/importer";
import { findLauncherExe, launchGame } from "./core/launcher";
import { openInExplorer, openPath, sendToTrash } from "./core/fsUtils";
import { loadHashIndex, resolveHashTableDir } from "./core/hashResolver";
import * as fs from "fs";
import * as path from "path";

// ── Helpers ─────────────────────────────────

function ok<T>(data: T): IpcResult<T> {
  return { ok: true, data };
}

function err(type: string, message: string): IpcResult<never> {
  return { ok: false, error: { type, message } };
}

// ── Shared state ────────────────────────────

let config: Config;
let store: Store | null = null;
let hashIndex: Map<string, string> | null = null;
const activeImports = new Map<string, ImportPlan>(); // tmpId → ImportPlan

function getStore(): Store {
  if (!store) {
    config = new Config();
    store = new Store(config.resolvedModsPath());
  }
  return store;
}

function getConfig(): Config {
  if (!config) config = new Config();
  return config;
}

function getHashIndex(): Map<string, string> {
  if (!hashIndex) {
    const hashDir = resolveHashTableDir(app.getAppPath());
    hashIndex = loadHashIndex(hashDir);
  }
  return hashIndex;
}

function reinitStore(modsPath: string): Store {
  store = new Store(modsPath);
  return store;
}

// ── Scan helper ─────────────────────────────

function doScan() {
  const c = getConfig();
  const modsPath = c.resolvedModsPath();
  const st = getStore();
  const idx = getHashIndex();
  const units = scanMods(modsPath, idx);
  st.applyTo(units);
  // Reconcile exclusive state
  reconcileExclusive(units, st);
  const { groups, groupKeys } = groupByCharacter(units);
  return { units, groups, groupKeys };
}

// ── Registration ────────────────────────────

export function registerIpcHandlers(): void {
  // ── Config ──
  ipcMain.handle(IPC.CONFIG_GET, async () => {
    try {
      const c = getConfig();
      return ok(c.data);
    } catch (e: any) {
      return err("config", e.message);
    }
  });

  ipcMain.handle(IPC.CONFIG_UPDATE, async (_event, partial: Record<string, unknown>) => {
    try {
      const c = getConfig();
      c.update(partial as any);
      if (partial.mods_path) {
        reinitStore(c.resolvedModsPath());
      }
      return ok(c.data);
    } catch (e: any) {
      return err("config", e.message);
    }
  });

  ipcMain.handle(IPC.CONFIG_DEFAULT_MODS_PATH, async () => {
    try {
      return ok(defaultModsPath());
    } catch (e: any) {
      return err("config", e.message);
    }
  });

  // ── Scanning ──
  ipcMain.handle(IPC.MODS_SCAN, async () => {
    try {
      return ok(doScan());
    } catch (e: any) {
      return err("scan", e.message);
    }
  });

  ipcMain.handle(IPC.MODS_REMOVE, async (_event, relPath: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const absPath = path.join(modsPath, relPath);
      sendToTrash(absPath);
      const st = getStore();
      st.forget(relPath);
      return ok(doScan());
    } catch (e: any) {
      return err("remove", e.message);
    }
  });

  // ── Toggle ──
  ipcMain.handle(IPC.TOGGLE_UNIT, async (_event, relPath: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const st = getStore();
      const idx = getHashIndex();
      const units = scanMods(modsPath, idx);
      st.applyTo(units);
      toggleUnit(relPath, units, st);
      const { groups, groupKeys } = groupByCharacter(units);
      return ok({ units, groups, groupKeys });
    } catch (e: any) {
      return err("toggle", e.message);
    }
  });

  ipcMain.handle(IPC.TOGGLE_DISABLE_GROUP, async (_event, groupKey: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const st = getStore();
      const idx = getHashIndex();
      const units = scanMods(modsPath, idx);
      st.applyTo(units);
      disableGroup(groupKey, units, st);
      const { groups, groupKeys } = groupByCharacter(units);
      return ok({ units, groups, groupKeys });
    } catch (e: any) {
      return err("toggle", e.message);
    }
  });

  // ── Store ──
  ipcMain.handle(IPC.STORE_SET_CHARACTER, async (_event, relPath: string, character: string) => {
    try {
      getStore().setCharacter(relPath, character);
      return ok(undefined);
    } catch (e: any) {
      return err("store", e.message);
    }
  });

  ipcMain.handle(IPC.STORE_SET_NOTE, async (_event, relPath: string, note: string) => {
    try {
      getStore().setNote(relPath, note);
      return ok(undefined);
    } catch (e: any) {
      return err("store", e.message);
    }
  });

  ipcMain.handle(IPC.STORE_FORGET, async (_event, relPath: string) => {
    try {
      getStore().forget(relPath);
      return ok(undefined);
    } catch (e: any) {
      return err("store", e.message);
    }
  });

  // ── Detail ──
  ipcMain.handle(IPC.DETAIL_GET_PREVIEW_URL, async (_event, relPath: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const folder = path.join(modsPath, relPath);
      const entries = fs.readdirSync(folder);
      const previewFile = entries.find(e => e.startsWith(".zzmi_preview."));
      if (!previewFile) return ok(null);
      const previewPath = path.join(folder, previewFile);
      const ext = path.extname(previewFile).toLowerCase();
      const mimeType = ext === ".png" ? "image/png"
        : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg"
        : ext === ".webp" ? "image/webp"
        : ext === ".bmp" ? "image/bmp"
        : "image/png";
      const data = fs.readFileSync(previewPath);
      return ok(`data:${mimeType};base64,${data.toString("base64")}`);
    } catch (e: any) {
      return err("detail", e.message);
    }
  });

  ipcMain.handle(IPC.DETAIL_SET_PREVIEW, async (_event, relPath: string, sourcePath: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const folder = path.join(modsPath, relPath);
      // Remove old preview
      for (const entry of fs.readdirSync(folder)) {
        if (entry.startsWith(".zzmi_preview.")) {
          fs.unlinkSync(path.join(folder, entry));
        }
      }
      const ext = path.extname(sourcePath);
      const dest = path.join(folder, `.zzmi_preview${ext}`);
      fs.copyFileSync(sourcePath, dest);
      return ok(undefined);
    } catch (e: any) {
      return err("detail", e.message);
    }
  });

  ipcMain.handle(IPC.DETAIL_SET_PREVIEW_FROM_CLIPBOARD, async (_event, relPath: string, base64Data: string, ext: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const folder = path.join(modsPath, relPath);
      // Remove old preview
      for (const entry of fs.readdirSync(folder)) {
        if (entry.startsWith(".zzmi_preview.")) {
          fs.unlinkSync(path.join(folder, entry));
        }
      }
      const dest = path.join(folder, `.zzmi_preview${ext}`);
      fs.writeFileSync(dest, Buffer.from(base64Data, "base64"));
      return ok(undefined);
    } catch (e: any) {
      return err("detail", e.message);
    }
  });

  ipcMain.handle(IPC.DETAIL_CLEAR_PREVIEW, async (_event, relPath: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const folder = path.join(modsPath, relPath);
      for (const entry of fs.readdirSync(folder)) {
        if (entry.startsWith(".zzmi_preview.")) {
          fs.unlinkSync(path.join(folder, entry));
        }
      }
      return ok(undefined);
    } catch (e: any) {
      return err("detail", e.message);
    }
  });

  ipcMain.handle(IPC.DETAIL_GET_NOTE, async (_event, relPath: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const noteFile = path.join(modsPath, relPath, ".zzmi_note.txt");
      if (fs.existsSync(noteFile)) {
        return ok(fs.readFileSync(noteFile, "utf-8"));
      }
      return ok("");
    } catch (e: any) {
      return err("detail", e.message);
    }
  });

  ipcMain.handle(IPC.DETAIL_SET_NOTE, async (_event, relPath: string, note: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const noteFile = path.join(modsPath, relPath, ".zzmi_note.txt");
      if (note) {
        fs.writeFileSync(noteFile, note, "utf-8");
      } else if (fs.existsSync(noteFile)) {
        fs.unlinkSync(noteFile);
      }
      return ok(undefined);
    } catch (e: any) {
      return err("detail", e.message);
    }
  });

  ipcMain.handle(IPC.DETAIL_GET_README, async (_event, relPath: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const folder = path.join(modsPath, relPath);
      for (const candidate of ["README.txt", "README.md", "readme.txt", "Readme.txt"]) {
        const rp = path.join(folder, candidate);
        if (fs.existsSync(rp)) {
          return ok(fs.readFileSync(rp, "utf-8"));
        }
      }
      return ok(null);
    } catch (e: any) {
      return err("detail", e.message);
    }
  });

  // ── Import ──
  ipcMain.handle(IPC.IMPORT_SELECT_ARCHIVE, async () => {
    try {
      const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
      if (!win) return ok(null);
      const result = await dialog.showOpenDialog(win, {
        title: "Select Mod Archive",
        filters: [
          { name: "Archives", extensions: ["zip", "7z", "rar"] },
          { name: "All Files", extensions: ["*"] },
        ],
        properties: ["openFile"],
      });
      if (result.canceled || result.filePaths.length === 0) return ok(null);
      return ok(result.filePaths[0]);
    } catch (e: any) {
      return err("import", e.message);
    }
  });

  ipcMain.handle(IPC.IMPORT_PREVIEW, async (_event, archivePath: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const idx = getHashIndex();
      const plan = previewImport(archivePath, modsPath, idx);
      const tmpId = `import_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      activeImports.set(tmpId, plan);
      return ok({ tmpId, units: plan.units });
    } catch (e: any) {
      return err("import", e.message);
    }
  });

  ipcMain.handle(IPC.IMPORT_COMMIT, async (_event, tmpId: string, overwriteIndices: number[]) => {
    try {
      const plan = activeImports.get(tmpId);
      if (!plan) return err("import", "Import plan not found or already completed");
      const result = commitImport(plan, new Set(overwriteIndices));
      return ok({ imported: result });
    } catch (e: any) {
      return err("import", e.message);
    }
  });

  ipcMain.handle(IPC.IMPORT_CLEANUP, async (_event, tmpId: string) => {
    try {
      const plan = activeImports.get(tmpId);
      if (plan) {
        try { fs.rmSync(plan.tmp_dir, { recursive: true, force: true }); } catch { /* ignore */ }
        activeImports.delete(tmpId);
      }
      return ok(undefined);
    } catch (e: any) {
      return err("import", e.message);
    }
  });

  ipcMain.handle(IPC.IMPORT_IS_SUPPORTED, async (_event, filePath: string) => {
    try {
      return ok(isSupportedArchive(filePath));
    } catch (e: any) {
      return err("import", e.message);
    }
  });

  // ── Launcher ──
  ipcMain.handle(IPC.LAUNCHER_LAUNCH, async () => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const exe = c.data.launcher_exe || findLauncherExe(modsPath);
      if (!exe) return err("launcher", "XXMI Launcher.exe not found. Please configure the path in Settings.");
      launchGame(exe);
      return ok(undefined);
    } catch (e: any) {
      return err("launcher", e.message);
    }
  });

  ipcMain.handle(IPC.LAUNCHER_FIND_EXE, async () => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      return ok(findLauncherExe(modsPath));
    } catch (e: any) {
      return err("launcher", e.message);
    }
  });

  // ── Shell ──
  ipcMain.handle(IPC.SHELL_OPEN_IN_EXPLORER, async (_event, relPath: string) => {
    try {
      const c = getConfig();
      const modsPath = c.resolvedModsPath();
      const absPath = path.join(modsPath, relPath);
      openInExplorer(absPath);
      return ok(undefined);
    } catch (e: any) {
      return err("shell", e.message);
    }
  });

  ipcMain.handle(IPC.SHELL_OPEN_PATH, async (_event, absPath: string) => {
    try {
      openPath(absPath);
      return ok(undefined);
    } catch (e: any) {
      return err("shell", e.message);
    }
  });

  ipcMain.handle(IPC.SHELL_SELECT_DIRECTORY, async () => {
    try {
      console.log("[zzmi] SHELL_SELECT_DIRECTORY invoked");
      const result = await dialog.showOpenDialog({
        title: "Select Mods Directory",
        properties: ["openDirectory"],
      });
      console.log("[zzmi] SHELL_SELECT_DIRECTORY result:", result);
      if (result.canceled || result.filePaths.length === 0) return ok(null);
      return ok(result.filePaths[0]);
    } catch (e: any) {
      console.error("[zzmi] SHELL_SELECT_DIRECTORY error:", e);
      return err("shell", e.message);
    }
  });
}