export type CharacterType = 'ATTACK' | 'ANOMALY' | 'STUN'; // 强攻, 异常, 命破

export interface CharacterStats {
  atk_base: number;      // 攻击力白值
  atk_flat_pre: number;  // 战前小攻击
  atk_pct_pre: number;   // 战前大攻击
  atk_flat_post: number; // 战后小攻击
  atk_pct_post: number;  // 战后大攻击
  
  hp_base: number;       // 生命值白值
  hp_flat_pre: number;   // 战前小生命
  hp_pct_pre: number;    // 战前大生命
  hp_flat_post: number;  // 战后小生命
  hp_pct_post: number;   // 战后大生命
  
  crit_rate: number;     // 暴击率
  crit_dmg: number;      // 暴击伤害
  dmg_bonus: number;     // 增伤
  res_shred: number;     // 减抗
  def_shred: number;     // 减防
  pen_ratio: number;     // 穿透率
  pen_flat: number;      // 穿透值
  anomaly_prof: number;  // 异常精通
}

export interface TeamMember {
  name: string;
  engine: string;
  drive4: string;
  drive2: string;
}

export interface CharacterProfile {
  id?: number;
  name: string;
  type: CharacterType;
  stats: CharacterStats;
  team?: TeamMember[];
  notes: string;
  updated_at?: string;
  char_preset?: string;
  engine_preset?: string;
}

export interface DriveDiscSubStat {
  name: string;
  hits: number;
  value: number;
}

export interface DriveDisc {
  id: string;
  setName: string;
  slot: number;
  mainStatName: string;
  level: number;
  mainStatValue: number;
  subStats: DriveDiscSubStat[];
  updated_at?: string;
}

export const DEFAULT_STATS: CharacterStats = {
  atk_base: 0, atk_flat_pre: 0, atk_pct_pre: 0, atk_flat_post: 0, atk_pct_post: 0,
  hp_base: 0, hp_flat_pre: 0, hp_pct_pre: 0, hp_flat_post: 0, hp_pct_post: 0,
  crit_rate: 5, crit_dmg: 50, dmg_bonus: 0, res_shred: 0, def_shred: 0, pen_ratio: 0, pen_flat: 0, anomaly_prof: 0
};

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
