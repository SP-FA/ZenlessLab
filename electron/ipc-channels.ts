// ─────────────────────────────────────────────
// IPC channel name constants.
// Shared naming convention: zzmi:<domain>:<action>
// ─────────────────────────────────────────────

export const IPC = {
  // Config
  CONFIG_GET: "zzmi:config:get",
  CONFIG_UPDATE: "zzmi:config:update",
  CONFIG_DEFAULT_MODS_PATH: "zzmi:config:defaultModsPath",

  // Scanning
  MODS_SCAN: "zzmi:mods:scan",
  MODS_REMOVE: "zzmi:mods:remove",

  // Toggle
  TOGGLE_UNIT: "zzmi:toggle:toggleUnit",
  TOGGLE_DISABLE_GROUP: "zzmi:toggle:disableGroup",

  // Store metadata
  STORE_SET_CHARACTER: "zzmi:store:setCharacter",
  STORE_SET_NOTE: "zzmi:store:setNote",
  STORE_FORGET: "zzmi:store:forget",

  // Detail (sidecar files)
  DETAIL_GET_PREVIEW_URL: "zzmi:detail:getPreviewUrl",
  DETAIL_SET_PREVIEW: "zzmi:detail:setPreview",
  DETAIL_SET_PREVIEW_FROM_CLIPBOARD: "zzmi:detail:setPreviewFromClipboard",
  DETAIL_CLEAR_PREVIEW: "zzmi:detail:clearPreview",
  DETAIL_GET_NOTE: "zzmi:detail:getNote",
  DETAIL_SET_NOTE: "zzmi:detail:setNote",
  DETAIL_GET_README: "zzmi:detail:getReadme",

  // Import
  IMPORT_SELECT_ARCHIVE: "zzmi:import:selectArchive",
  IMPORT_PREVIEW: "zzmi:import:preview",
  IMPORT_COMMIT: "zzmi:import:commit",
  IMPORT_CLEANUP: "zzmi:import:cleanup",
  IMPORT_IS_SUPPORTED: "zzmi:import:isSupported",

  // Launcher
  LAUNCHER_LAUNCH: "zzmi:launcher:launch",
  LAUNCHER_FIND_EXE: "zzmi:launcher:findExe",

  // Shell
  SHELL_OPEN_IN_EXPLORER: "zzmi:shell:openInExplorer",
  SHELL_OPEN_PATH: "zzmi:shell:openPath",
  SHELL_SELECT_DIRECTORY: "zzmi:shell:selectDirectory",
} as const;