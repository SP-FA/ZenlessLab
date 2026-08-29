// ─────────────────────────────────────────────
// Port of core/ini_parser.py
// Extracts key bindings and detects character
// names from 3DMigoto .ini files.
// ─────────────────────────────────────────────

import * as fs from "fs";
import * as path from "path";
import type { KeyBinding } from "./types";

// ── Key Binding Extraction ──────────────────

const KEY_SECTION_RE = /^\s*\[(Key[^\]]*)\]\s*$/i;
const KEY_LINE_RE = /^\s*key\s*=\s*(.+?)\s*$/i;
const COMMENT_RE = /^\s*;(.*)$/;

const MODIFIER_MAP: Record<string, string> = {
  ctrl: "Ctrl", control: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  no_ctrl: "Ctrl×", no_control: "Ctrl×",
  no_alt: "Alt×", no_shift: "Shift×",
};

const MAINKEY_MAP: Record<string, string> = {
  left: "←", vk_left: "←",
  right: "→", vk_right: "→",
  up: "↑", vk_up: "↑",
  down: "↓", vk_down: "↓",
  space: "Space", " ": "Space",
  enter: "Enter", return: "Enter",
  tab: "Tab", esc: "Esc", escape: "Esc",
};

function normalizeKey(raw: string): string {
  const tokens = raw.split(/\s+/);
  const out: string[] = [];
  for (const tok of tokens) {
    const low = tok.toLowerCase();
    if (MODIFIER_MAP[low]) {
      out.push(MODIFIER_MAP[low]);
    } else if (MAINKEY_MAP[low]) {
      out.push(MAINKEY_MAP[low]);
    } else {
      out.push(tok);
    }
  }
  return out.length > 0 ? out.join("+") : raw;
}

export function extractKeyBindings(iniPath: string): KeyBinding[] {
  let text: string;
  try {
    text = fs.readFileSync(iniPath, "utf-8");
  } catch {
    return [];
  }

  const bindings: KeyBinding[] = [];
  const lines = text.split(/\r?\n/);
  let currentSection: string | null = null;
  let lastComment = "";

  for (const line of lines) {
    const mComment = COMMENT_RE.exec(line);
    if (mComment) {
      const commentText = mComment[1].trim();
      if (commentText && !commentText.toUpperCase().startsWith("MARK:")) {
        lastComment = commentText;
      }
      continue;
    }

    const mSec = KEY_SECTION_RE.exec(line);
    if (mSec) {
      currentSection = mSec[1].trim();
      continue;
    }

    const mKey = KEY_LINE_RE.exec(line);
    if (mKey && currentSection) {
      let raw = mKey[1].trim();
      if (raw.includes(";")) {
        raw = raw.split(";", 1)[0].trim();
      }
      if (raw) {
        bindings.push({
          section: `[${currentSection}]`,
          comment: lastComment,
          key: raw,
          normalized: normalizeKey(raw),
        });
        lastComment = "";
      }
    } else if (line.trim() && !mKey) {
      lastComment = "";
    }
  }

  return bindings;
}

// ── Character Name Detection ────────────────

const CHAR_SECTION_RE = /^\s*\[(?:Resource|TextureOverride)([A-Za-z][A-Za-z0-9]*)/;
const CAMEL_SPLIT_RE = /[A-Z][a-z0-9]*|[A-Z](?=[A-Z]|$)/g;
const LOWER_HEAD_RE = /^([a-z]+)(?=[A-Z])/;
const HASH_RE = /^[0-9_]|[-]/;

const PART_WORDS = new Set([
  "Body", "Hair", "Legs", "Head", "Face", "Hand", "Foot", "Feet",
  "BodyA", "BodyB", "HairA", "HairB", "Skin", "Texcoord", "Position",
  "Blend", "Select", "Tab", "Round", "M6", "VertexLimitRaise",
  "PreSkinning", "VB", "IB", "Diffuse", "Normal", "Light", "Material",
  "Map", "LowRes", "Outline", "Override", "Resource", "Texture",
  "Replace", "Config", "Command", "CommandList", "Custom", "Shader",
  "Hash", "Default", "Master",
]);

const LOWERCASE_PART_WORDS = new Set([
  "makeup", "face", "weapon", "wing", "eyebrow", "hair", "body", "skin",
  "head", "hand", "foot", "feet", "legs", "dress", "texcoord", "position",
  "blend", "diffuse", "normal", "light", "material", "map", "outline",
  "override", "resource", "texture", "replace", "config", "command",
  "shader", "hash", "default", "master", "select", "tab", "custom",
]);

function splitCharacterName(token: string): string {
  const segs = token.match(CAMEL_SPLIT_RE);
  if (!segs || segs.length === 0) return token;
  const nameSegs: string[] = [];
  for (const seg of segs) {
    if (PART_WORDS.has(seg)) break;
    nameSegs.push(seg);
  }
  return nameSegs.length > 0 ? nameSegs.join("") : segs[0];
}

function lowercaseCamelName(token: string): string | null {
  const m = LOWER_HEAD_RE.exec(token);
  if (!m) return null;
  const seg = m[1];
  if (seg.length < 2 || LOWERCASE_PART_WORDS.has(seg)) return null;
  return seg;
}

function candidatesFromSections(text: string): string[] {
  const cands: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = CHAR_SECTION_RE.exec(line);
    if (!m) continue;
    const token = m[1];
    if (HASH_RE.test(token)) continue;
    if (token.length < 2) continue;
    if (token[0] === token[0].toUpperCase() && token[0] !== token[0].toLowerCase()) {
      const name = splitCharacterName(token);
      if (name.length >= 2 && !PART_WORDS.has(name)) {
        cands.push(name);
      }
    } else {
      const name = lowercaseCamelName(token);
      if (name) cands.push(name);
    }
  }
  return cands;
}

function commonFilenamePrefix(iniFiles: string[]): string {
  if (iniFiles.length === 0) return "";
  const folder = path.dirname(iniFiles[0]);
  let siblings: string[];
  try {
    siblings = fs.readdirSync(folder).map(f => path.join(folder, f))
      .filter(f => fs.statSync(f).isFile());
  } catch {
    return "";
  }
  const resNames = siblings
    .filter(f => [".ib", ".dds", ".buf"].includes(path.extname(f).toLowerCase()))
    .map(f => path.basename(f, path.extname(f)));
  if (resNames.length === 0) return "";

  const firstSegments: string[] = [];
  for (const name of resNames) {
    const m = /^([A-Z][a-z]+)/.exec(name);
    if (m) firstSegments.push(m[1]);
  }
  if (firstSegments.length === 0) return "";

  const counts: Record<string, number> = {};
  for (const s of firstSegments) {
    counts[s] = (counts[s] || 0) + 1;
  }
  let best = "";
  let bestCount = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (v > bestCount) { best = k; bestCount = v; }
  }
  return bestCount >= 2 ? best : "";
}

export function detectCharacter(iniFiles: string[], folderName: string): string {
  // 1. INI section header plurality vote
  const allCands: string[] = [];
  for (const ini of iniFiles) {
    try {
      const text = fs.readFileSync(ini, "utf-8");
      allCands.push(...candidatesFromSections(text));
    } catch {
      // skip unreadable
    }
  }
  if (allCands.length > 0) {
    const counts: Record<string, number> = {};
    for (const c of allCands) {
      counts[c] = (counts[c] || 0) + 1;
    }
    let top = "";
    let topCount = 0;
    for (const [k, v] of Object.entries(counts)) {
      if (v > topCount) { top = k; topCount = v; }
    }
    if (topCount >= 2) return top;
    if (topCount >= 1 && topCount / allCands.length > 0.5) return top;
  }

  // 2. Resource filename common prefix
  const prefix = commonFilenamePrefix(iniFiles);
  if (prefix) return prefix;

  // 3. INI filename stem — first camelCase word
  for (const ini of iniFiles) {
    const stem = path.basename(ini, path.extname(ini));
    const m = /[A-Z][a-z]+/.exec(stem);
    if (m) {
      const cand = m[0];
      if (!PART_WORDS.has(cand) && cand.length >= 2) return cand;
    }
  }

  // 4. Folder name fallback
  return folderName;
}

/** Get the first camelCase word from a name (e.g. LuciaElowen → Lucia). */
export function firstCamelWord(name: string): string | null {
  const m = /^[A-Z][a-z0-9]*/.exec(name);
  return m ? m[0] : null;
}