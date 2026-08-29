// ─────────────────────────────────────────────
// Hash resolver — loads character hash tables
// from Zenless_Model_Hash/角色hash表/ and
// builds a hash → character-group index.
// ─────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";

/** Hash → character group name mapping. */
export type HashIndex = Map<string, string>;

/**
 * Build a hash → character_group_name mapping from all
 * JSON files in the hash table directory.
 *
 * Each JSON file is named like "艾莲Ellen.json" and contains
 * an array of component entries with draw_vb, position_vb,
 * texcoord_vb, blend_vb, ib, and texture_hashes fields.
 */
export function loadHashIndex(hashTableDir: string): Map<string, string> {
  const index = new Map<string, string>();

  if (!fs.existsSync(hashTableDir)) return index;

  let files: string[];
  try {
    files = fs.readdirSync(hashTableDir);
  } catch {
    return index;
  }

  for (const file of files) {
    if (!file.toLowerCase().endsWith(".json")) continue;
    const filePath = path.join(hashTableDir, file);
    // File name without extension = group name (e.g. "艾莲Ellen")
    const groupName = path.basename(file, ".json");

    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) continue;

      for (const entry of data) {
        if (!entry || typeof entry !== "object") continue;

        // Collect hash values from standard fields
        const hashFields = ["draw_vb", "position_vb", "texcoord_vb", "blend_vb", "ib"];
        for (const field of hashFields) {
          const val = entry[field];
          if (typeof val === "string" && val.length >= 8) {
            index.set(val.toLowerCase(), groupName);
          }
        }

        // Texture hashes: [[type, ext, hash], ...]
        const texHashes = entry.texture_hashes;
        if (Array.isArray(texHashes)) {
          for (const texGroup of texHashes) {
            if (!Array.isArray(texGroup)) continue;
            for (const tex of texGroup) {
              if (Array.isArray(tex) && tex.length >= 3 && typeof tex[2] === "string") {
                index.set(tex[2].toLowerCase(), groupName);
              }
            }
          }
        }
      }
    } catch {
      // Skip malformed JSON files
    }
  }

  return index;
}

/**
 * Resolve the path to the hash table directory.
 * Zenless_Model_Hash is a sibling of the ZenlessLab app directory.
 */
export function resolveHashTableDir(appRoot: string): string {
  // Try sibling: <repo_root>/Zenless_Model_Hash/角色hash表/
  const sibling = path.join(path.dirname(appRoot), "Zenless_Model_Hash", "角色hash表");
  if (fs.existsSync(sibling)) return sibling;

  // Try within app directory (fallback)
  const within = path.join(appRoot, "Zenless_Model_Hash", "角色hash表");
  if (fs.existsSync(within)) return within;

  // Return the most likely path — caller should handle missing dir
  return sibling;
}

/**
 * Extract all 8-char hex hash values from an INI file.
 * Matches patterns like "hash = abcdef01" or "vb0 = abcdef01".
 */
export function extractHashesFromIni(iniPath: string): string[] {
  try {
    const text = fs.readFileSync(iniPath, "utf-8");
    const hashes: string[] = [];
    // Match key = 8-char-hex patterns (case insensitive)
    const hashRe = /=\s*([0-9a-fA-F]{8})\b/g;
    for (const line of text.split(/\r?\n/)) {
      let match: RegExpExecArray | null;
      // Reset regex for each line
      hashRe.lastIndex = 0;
      while ((match = hashRe.exec(line)) !== null) {
        hashes.push(match[1].toLowerCase());
      }
    }
    return hashes;
  } catch {
    return [];
  }
}

/**
 * Resolve a character group for a mod by reading one .ini file
 * and matching its hashes against the index.
 *
 * Optimization: only reads the first available .ini file since
 * all files in a mod folder belong to the same character.
 */
export function resolveCharacterByHash(
  iniFiles: string[],
  hashIndex: Map<string, string>,
): string | null {
  for (const ini of iniFiles) {
    const hashes = extractHashesFromIni(ini);
    for (const h of hashes) {
      const group = hashIndex.get(h);
      if (group) return group;
    }
  }
  return null;
}