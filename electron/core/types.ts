// ─────────────────────────────────────────────
// Canonical domain types for the mod manager.
// Shared between Electron main process and
// the renderer (via JSON serialization over IPC).
// ─────────────────────────────────────────────

/** 3DMigoto convention: folders starting with "DISABLED " are excluded from loading. */
export const DISABLED_PREFIX = "DISABLED "; // trailing space is intentional

// ── Key Binding ─────────────────────────────

export interface KeyBinding {
  section: string;   // e.g. "[KeySwap_0]"
  comment: string;   // `;` comment above the section
  key: string;       // raw key value, e.g. "no_ctrl 7"
  normalized: string; // human-readable, e.g. "7" or "Ctrl+8"
}

// ── Mod Unit ────────────────────────────────

export interface ModUnit {
  abs_path: string;
  rel_path: string;
  display_name: string;
  is_enabled: boolean;
  /** All .ini / .ini.disabled files found recursively under the mod folder. */
  ini_files: string[];
  key_bindings: KeyBinding[];
  readme: string | null;
  /** Character group resolved by hash matching (or user override). */
  character: string;
  preview_path: string | null;
  note: string;
}

// ── Import ──────────────────────────────────

export interface ImportUnitPlan {
  source_folder: string;
  target: string;
  group: string;
  conflict_with: string | null; // non-null = target already exists
}

export interface ImportPlan {
  tmp_dir: string;
  units: ImportUnitPlan[];
}

export interface ImportPreviewResult {
  tmpId: string;
  units: ImportUnitPlan[];
}

// ── Config ──────────────────────────────────

export interface AppConfig {
  mods_path: string;
  theme: "light" | "dark" | "auto";
  confirm_exclusive: boolean;
  window_geometry: string; // base64
  launcher_exe: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  mods_path: "",
  theme: "auto",
  confirm_exclusive: true,
  window_geometry: "",
  launcher_exe: "",
};

// ── Store ───────────────────────────────────

export interface StoreData {
  character_overrides: Record<string, string>;   // rel_path → character
  notes: Record<string, string>;                  // rel_path → note
  enabled_choice: Record<string, string>;         // group_key → rel_path
}

// ── Scan Result ─────────────────────────────

export interface ScanResult {
  units: ModUnit[];
  groups: Record<string, ModUnit[]>;
  groupKeys: string[];
}

// ── IPC Response Wrapper ────────────────────

export interface IpcSuccess<T> {
  ok: true;
  data: T;
}

export interface IpcError {
  ok: false;
  error: {
    type: string;
    message: string;
  };
}

export type IpcResult<T> = IpcSuccess<T> | IpcError;