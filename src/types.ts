/**
 * @file types.ts
 * @description 全局类型定义。
 *
 * 定义了绝区零伤害计算器的核心数据结构，包括：
 * - 角色属性（CharacterStats）
 * - 角色档案（CharacterProfile）
 * - 驱动盘（DriveDisc）及其副词条（DriveDiscSubStat）
 * - 队伍成员（TeamMember）
 * - 角色类型枚举（CharacterType）
 *
 * 被所有子应用共用。
 */

// ====================== 角色相关 ======================

/** 角色类型：强攻（ATTACK）、异常（ANOMALY）、命破（STUN） */
export type CharacterType = 'ATTACK' | 'ANOMALY' | 'STUN';

/**
 * 角色属性值
 * 所有百分比属性以百分数形式存储（如 50 表示 50%），
 * 计算时需除以 100 转换为小数。
 */
export interface CharacterStats {
  /** 攻击力白值（基础攻击力 + 音擎攻击力） */
  atk_base: number;
  /** 战前小攻击（局外固定攻击力加成） */
  atk_flat_pre: number;
  /** 战前大攻击（局外百分比攻击力加成，%） */
  atk_pct_pre: number;
  /** 战后小攻击（局内固定攻击力加成） */
  atk_flat_post: number;
  /** 战后大攻击（局内百分比攻击力加成，%） */
  atk_pct_post: number;

  /** 生命值白值 */
  hp_base: number;
  /** 战前小生命 */
  hp_flat_pre: number;
  /** 战前大生命（%） */
  hp_pct_pre: number;
  /** 战后小生命 */
  hp_flat_post: number;
  /** 战后大生命（%） */
  hp_pct_post: number;

  /** 暴击率（%） */
  crit_rate: number;
  /** 暴击伤害（%） */
  crit_dmg: number;
  /** 增伤（%） */
  dmg_bonus: number;
  /** 减抗（%） */
  res_shred: number;
  /** 减防（%） */
  def_shred: number;
  /** 穿透率（%） */
  pen_ratio: number;
  /** 穿透值 */
  pen_flat: number;
  /** 异常精通 */
  anomaly_prof: number;
}

/** 队伍成员信息 */
export interface TeamMember {
  /** 角色名称 */
  name: string;
  /** 音擎名称 */
  engine: string;
  /** 4 件套驱动盘名称 */
  drive4: string;
  /** 2 件套驱动盘名称 */
  drive2: string;
}

/**
 * 角色档案
 * 包含角色的完整配置信息，通过 localStorage 持久化存储。
 */
export interface CharacterProfile {
  /** 唯一标识（自动生成） */
  id?: number;
  /** 档案名称 */
  name: string;
  /** 角色类型 */
  type: CharacterType;
  /** 角色属性数值 */
  stats: CharacterStats;
  /** 队伍成员列表（最多 3 人） */
  team?: TeamMember[];
  /** 备注信息 */
  notes: string;
  /** 最后更新时间（ISO 8601 格式） */
  updated_at?: string;
  /** 角色预设名称 */
  char_preset?: string;
  /** 音擎预设名称 */
  engine_preset?: string;
}

// ====================== 驱动盘相关 ======================

/** 驱动盘副词条 */
export interface DriveDiscSubStat {
  /** 副词条名称 */
  name: string;
  /** 强化次数（0-5） */
  hits: number;
  /** 当前数值（由 hits 和基础值计算得出） */
  value: number;
}

/**
 * 驱动盘数据
 * 通过 localStorage 持久化存储。
 */
export interface DriveDisc {
  /** 唯一标识（自动生成） */
  id: string;
  /** 套装名称 */
  setName: string;
  /** 槽位号（1-6） */
  slot: number;
  /** 主词条名称 */
  mainStatName: string;
  /** 等级（0-15） */
  level: number;
  /** 主词条数值 */
  mainStatValue: number;
  /** 副词条列表（最多 4 条） */
  subStats: DriveDiscSubStat[];
  /** 最后更新时间（ISO 8601 格式） */
  updated_at?: string;
}

// ====================== 默认值 ======================

/** 角色属性默认值 */
export const DEFAULT_STATS: CharacterStats = {
  atk_base: 0, atk_flat_pre: 0, atk_pct_pre: 0, atk_flat_post: 0, atk_pct_post: 0,
  hp_base: 0, hp_flat_pre: 0, hp_pct_pre: 0, hp_flat_post: 0, hp_pct_post: 0,
  crit_rate: 5, crit_dmg: 50, dmg_bonus: 0, res_shred: 0, def_shred: 0, pen_ratio: 0, pen_flat: 0, anomaly_prof: 0
};

/** 属性中文标签映射 */
export const STAT_LABELS: Record<keyof CharacterStats, string> = {
  atk_base: "攻击力白值",
  atk_flat_pre: "战前小攻击",
  atk_pct_pre: "战前大攻击 (%)",
  atk_flat_post: "战后小攻击",
  atk_pct_post: "战后大攻击 (%)",
  hp_base: "生命值白值",
  hp_flat_pre: "战前小生命",
  hp_pct_pre: "战前大生命 (%)",
  hp_flat_post: "战后小生命",
  hp_pct_post: "战后大生命 (%)",
  crit_rate: "暴击率 (%)",
  crit_dmg: "暴击伤害 (%)",
  dmg_bonus: "增伤 (%)",
  res_shred: "减抗 (%)",
  def_shred: "减防 (%)",
  pen_ratio: "穿透率 (%)",
  pen_flat: "穿透值",
  anomaly_prof: "异常精通"
};