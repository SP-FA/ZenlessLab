// ─────────────────────────────────────────────
// Per-mod metadata persisted in Mods/.zzmi_manager.json
// Survives re-scanning. Stores user overrides.
// ─────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import type { ModUnit, StoreData } from "./types";

const STORE_FILENAME = ".zzmi_manager.json";

export class Store {
  modsRoot: string;
  filePath: string;
  characterOverrides: Record<string, string> = {};
  notes: Record<string, string> = {};
  enabledChoice: Record<string, string> = {};

  constructor(modsRoot: string) {
    this.modsRoot = modsRoot;
    this.filePath = path.join(modsRoot, STORE_FILENAME);
    this.load();
  }

  load(): void {
    if (!fs.existsSync(this.filePath)) return;
    try {
      const data = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
      this.characterOverrides = data.character_overrides || {};
      this.notes = data.notes || {};
      this.enabledChoice = data.enabled_choice || {};
    } catch {
      // corrupt — start fresh
    }
  }

  save(): void {
    const data: StoreData = {
      character_overrides: this.characterOverrides,
      notes: this.notes,
      enabled_choice: this.enabledChoice,
    };
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  applyTo(units: ModUnit[]): void {
    for (const u of units) {
      if (u.rel_path in this.characterOverrides) {
        u.character = this.characterOverrides[u.rel_path];
      }
    }
  }

  setCharacter(relPath: string, character: string): void {
    this.characterOverrides[relPath] = character;
    this.save();
  }

  setNote(relPath: string, note: string): void {
    if (note) {
      this.notes[relPath] = note;
    } else {
      delete this.notes[relPath];
    }
    this.save();
  }

  getEnabledChoice(group: string): string | null {
    return this.enabledChoice[group] || null;
  }

  setEnabledChoice(group: string, relPath: string | null): void {
    if (relPath) {
      this.enabledChoice[group] = relPath;
    } else {
      delete this.enabledChoice[group];
    }
    this.save();
  }

  forget(relPath: string): void {
    delete this.characterOverrides[relPath];
    delete this.notes[relPath];
    const emptyKeys = Object.entries(this.enabledChoice)
      .filter(([, rp]) => rp === relPath)
      .map(([g]) => g);
    for (const g of emptyKeys) {
      delete this.enabledChoice[g];
    }
    this.save();
  }
}