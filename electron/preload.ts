import { contextBridge, ipcRenderer } from "electron";
import { IPC } from "./ipc-channels";

// ─────────────────────────────────────────────
// Expose a safe, typed API to the renderer via
// contextBridge. Every method calls invoke() on
// the corresponding IPC channel.
// ─────────────────────────────────────────────

const zzmi = {
  config: {
    get: () => ipcRenderer.invoke(IPC.CONFIG_GET),
    update: (partial: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC.CONFIG_UPDATE, partial),
    defaultModsPath: () => ipcRenderer.invoke(IPC.CONFIG_DEFAULT_MODS_PATH),
  },

  mods: {
    scan: () => ipcRenderer.invoke(IPC.MODS_SCAN),
    remove: (relPath: string) => ipcRenderer.invoke(IPC.MODS_REMOVE, relPath),
  },

  toggle: {
    toggleUnit: (relPath: string) =>
      ipcRenderer.invoke(IPC.TOGGLE_UNIT, relPath),
    disableGroup: (groupKey: string) =>
      ipcRenderer.invoke(IPC.TOGGLE_DISABLE_GROUP, groupKey),
  },

  store: {
    setCharacter: (relPath: string, character: string) =>
      ipcRenderer.invoke(IPC.STORE_SET_CHARACTER, relPath, character),
    setNote: (relPath: string, note: string) =>
      ipcRenderer.invoke(IPC.STORE_SET_NOTE, relPath, note),
    forget: (relPath: string) =>
      ipcRenderer.invoke(IPC.STORE_FORGET, relPath),
  },

  detail: {
    getPreviewUrl: (relPath: string) =>
      ipcRenderer.invoke(IPC.DETAIL_GET_PREVIEW_URL, relPath),
    setPreview: (relPath: string, sourcePath: string) =>
      ipcRenderer.invoke(IPC.DETAIL_SET_PREVIEW, relPath, sourcePath),
    setPreviewFromClipboard: (relPath: string, base64Data: string, ext: string) =>
      ipcRenderer.invoke(IPC.DETAIL_SET_PREVIEW_FROM_CLIPBOARD, relPath, base64Data, ext),
    clearPreview: (relPath: string) =>
      ipcRenderer.invoke(IPC.DETAIL_CLEAR_PREVIEW, relPath),
    getNote: (relPath: string) =>
      ipcRenderer.invoke(IPC.DETAIL_GET_NOTE, relPath),
    setNote: (relPath: string, note: string) =>
      ipcRenderer.invoke(IPC.DETAIL_SET_NOTE, relPath, note),
    getReadme: (relPath: string) =>
      ipcRenderer.invoke(IPC.DETAIL_GET_README, relPath),
  },

  import: {
    selectArchive: () => ipcRenderer.invoke(IPC.IMPORT_SELECT_ARCHIVE),
    preview: (archivePath: string) =>
      ipcRenderer.invoke(IPC.IMPORT_PREVIEW, archivePath),
    commit: (tmpId: string, overwriteIndices: number[]) =>
      ipcRenderer.invoke(IPC.IMPORT_COMMIT, tmpId, overwriteIndices),
    cleanup: (tmpId: string) =>
      ipcRenderer.invoke(IPC.IMPORT_CLEANUP, tmpId),
    isSupported: (path: string) =>
      ipcRenderer.invoke(IPC.IMPORT_IS_SUPPORTED, path),
  },

  launcher: {
    launch: () => ipcRenderer.invoke(IPC.LAUNCHER_LAUNCH),
    findExe: () => ipcRenderer.invoke(IPC.LAUNCHER_FIND_EXE),
  },

  shell: {
    openInExplorer: (relPath: string) =>
      ipcRenderer.invoke(IPC.SHELL_OPEN_IN_EXPLORER, relPath),
    openPath: (absPath: string) =>
      ipcRenderer.invoke(IPC.SHELL_OPEN_PATH, absPath),
    selectDirectory: () =>
      ipcRenderer.invoke(IPC.SHELL_SELECT_DIRECTORY),
  },
};

contextBridge.exposeInMainWorld("zzmi", zzmi);

export type ZzmiAPI = typeof zzmi;