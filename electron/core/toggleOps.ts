// ─────────────────────────────────────────────
// IPC-level toggle operations.
// Thin wrappers around toggler.ts that handle
// the full scan → toggle → reconcile → group
// flow needed by the IPC handlers.
// ─────────────────────────────────────────────

import type { ModUnit } from "./types";
import { isDisabled, disableUnit, activateExclusive } from "./toggler";
import { Store } from "./store";

/**
 * Toggle a single unit (enable if disabled, disable if enabled).
 * All mods use exclusive activation within their character group.
 * Since ini_files are collected recursively, toggling a mod
 * affects all its sub-modules.
 */
export function toggleUnit(
  relPath: string,
  allUnits: ModUnit[],
  store: Store,
): void {
  const unit = allUnits.find(u => u.rel_path === relPath);
  if (!unit) throw new Error(`Mod unit not found: ${relPath}`);

  if (isDisabled(unit)) {
    // Enable: exclusive activation for this character group
    activateExclusive(unit, allUnits);
  } else {
    // Disable
    disableUnit(unit);
    // Update enabled choice for this group
    const groupEnabled = allUnits.filter(
      u => u.character === unit.character && !isDisabled(u),
    );
    if (groupEnabled.length > 0) {
      store.setEnabledChoice(unit.character, groupEnabled[0].rel_path);
    } else {
      store.setEnabledChoice(unit.character, null);
    }
  }
}

/**
 * Disable all mods in a group (including all sub-modules).
 */
export function disableGroup(
  groupKey: string,
  allUnits: ModUnit[],
  store: Store,
): void {
  for (const unit of allUnits) {
    if (unit.character !== groupKey) continue;
    if (!isDisabled(unit)) {
      disableUnit(unit);
    }
  }
  store.setEnabledChoice(groupKey, null);
}