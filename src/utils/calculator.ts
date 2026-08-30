/**
 * @file calculator.ts
 * @description 伤害计算核心工具函数。
 *
 * 实现绝区零伤害计算的核心公式，包括：
 * - calculateDamage：根据角色属性和类型计算伤害期望
 * - calculateGain：计算各词条提升的收益百分比
 * - generateCurveData：生成词条收益曲线数据（累计收益）
 * - generateMarginalCurveData：生成边际收益曲线数据（增量收益）
 *
 * 支持三种角色类型：强攻（ATTACK）、异常（ANOMALY）、命破（STUN）。
 */

import { CharacterStats, CharacterType } from "../types";

// ====================== 伤害计算 ======================

/**
 * 计算角色在当前属性面板下的伤害期望值
 *
 * 公式按角色类型区分：
 * - 强攻：基础攻击区 × (1 + 暴击率 × 暴击伤害) × 增伤区 × 抗性区 × 防御区
 * - 异常：基础攻击区 × 异常精通 × 增伤区 × 抗性区 × 防御区
 * - 命破：贯穿力 × (1 + 暴击率 × 暴击伤害) × 增伤区 × 抗性区
 *   （贯穿力 = 0.3 × 基础攻击区 + 0.1 × 基础生命区）
 *
 * @param stats - 角色属性值
 * @param type - 角色类型
 * @returns 伤害期望值
 */
export const calculateDamage = (stats: CharacterStats, type: CharacterType) => {
  // 转换百分比数值为小数
  const atk_pct_pre = stats.atk_pct_pre / 100;
  const atk_pct_post = stats.atk_pct_post / 100;
  const hp_pct_pre = stats.hp_pct_pre / 100;
  const hp_pct_post = stats.hp_pct_post / 100;
  const crit_rate = Math.min(100, stats.crit_rate) / 100;
  const crit_dmg = stats.crit_dmg / 100;
  const dmg_bonus = stats.dmg_bonus / 100;
  const res_shred = stats.res_shred / 100;
  const def_shred = stats.def_shred / 100;
  const pen_ratio = stats.pen_ratio / 100;

  // 基础攻击区
  const baseAtkZone = (stats.atk_base * (1 + atk_pct_pre) + stats.atk_flat_pre) * (1 + atk_pct_post) + stats.atk_flat_post;

  // 基础生命区
  const baseHpZone = (stats.hp_base * (1 + hp_pct_pre) + stats.hp_flat_pre) * (1 + hp_pct_post) + stats.hp_flat_post;

  // 增伤区
  const dmgZone = 1 + dmg_bonus;

  // 抗性区
  const resZone = 1 + res_shred;

  // 防御区
  const baseDef = 794 * 60 / 50; // 952.8
  const enemyDef = baseDef * (1 - def_shred);
  const defZone = 794 / (enemyDef * (1 - pen_ratio) - stats.pen_flat + 794);

  let damage = 0;

  if (type === 'ATTACK') {
    damage = baseAtkZone * (1 + crit_rate * crit_dmg) * dmgZone * resZone * defZone;
  } else if (type === 'ANOMALY') {
    damage = baseAtkZone * stats.anomaly_prof * dmgZone * resZone * defZone;
  } else if (type === 'STUN') {
    const penetrationPower = 0.3 * baseAtkZone + 0.1 * baseHpZone;
    damage = penetrationPower * (1 + crit_rate * crit_dmg) * dmgZone * resZone;
  }

  return damage;
};

// ====================== 收益计算 ======================

/**
 * 对穿透率和减防属性应用 100% 封顶
 *
 * 计算词条收益时，穿透率与减防按 100% 封顶，
 * 超出的提升不再带来额外收益。
 *
 * @param stats - 属性值
 * @param statKey - 属性 key
 * @returns 封顶后的属性值
 */
const applyDefenseBenefitCap = (stats: CharacterStats, statKey: keyof CharacterStats) => {
  if (statKey !== 'pen_ratio' && statKey !== 'def_shred') return stats;
  return { ...stats, [statKey]: Math.min(100, stats[statKey]) };
};

/**
 * 计算各词条提升的收益百分比
 *
 * 收益 = (提升后伤害 / 原伤害) - 1
 *
 * @param baseStats - 基础属性值
 * @param improvements - 各词条的提升值
 * @param type - 角色类型
 * @returns 各词条收益百分比映射（key 为属性 key，value 为收益率小数）
 */
export const calculateGain = (baseStats: CharacterStats, improvements: Partial<CharacterStats>, type: CharacterType) => {
  const originalDmg = calculateDamage(baseStats, type);

  const results: Record<string, number> = {};

  Object.keys(improvements).forEach((key) => {
    const statKey = key as keyof CharacterStats;
    const improvedStats = applyDefenseBenefitCap(
      { ...baseStats, [statKey]: baseStats[statKey] + (improvements[statKey] || 0) },
      statKey,
    );
    const newDmg = calculateDamage(improvedStats, type);

    if (originalDmg === 0) {
      results[statKey] = 0;
    } else {
      results[statKey] = (newDmg / originalDmg) - 1;
    }
  });

  return results;
};

// ====================== 词条单位 ======================

/** 各词条每单位对应的数值（驱动盘副词条平均值） */
export const STAT_ROLL_UNITS: Record<keyof CharacterStats, number> = {
  atk_base: 0,
  atk_flat_pre: 19,
  atk_pct_pre: 3,
  atk_flat_post: 19,
  atk_pct_post: 3,
  hp_base: 0,
  hp_flat_pre: 100,
  hp_pct_pre: 3,
  hp_flat_post: 100,
  hp_pct_post: 3,
  crit_rate: 2.4,
  crit_dmg: 4.8,
  dmg_bonus: 3,
  res_shred: 3,
  def_shred: 3,
  pen_ratio: 2.4,
  pen_flat: 9,
  anomaly_prof: 9
};

// ====================== 曲线数据 ======================

/**
 * 生成词条收益曲线数据（累计收益模式）
 *
 * 计算从 0 到 steps 个单位词条投入时，每个词条的累计伤害提升百分比。
 *
 * @param baseStats - 基础属性值
 * @param type - 角色类型
 * @param steps - 投入步数（默认 10）
 * @returns 曲线数据点数组，每个点包含 step 和各词条的累计收益百分比
 */
export const generateCurveData = (baseStats: CharacterStats, type: CharacterType, steps: number = 10) => {
  const originalDmg = calculateDamage(baseStats, type);
  if (originalDmg === 0) return [];

  const data = [];
  for (let i = 0; i <= steps; i++) {
    const point: any = { step: i };

    Object.entries(STAT_ROLL_UNITS).forEach(([key, unit]) => {
      if (unit === 0) return;
      const statKey = key as keyof CharacterStats;
      const improvedStats = applyDefenseBenefitCap(
        { ...baseStats, [statKey]: baseStats[statKey] + (unit * i) },
        statKey,
      );
      const newDmg = calculateDamage(improvedStats, type);
      point[statKey] = Number(((newDmg / originalDmg - 1) * 100).toFixed(2));
    });

    data.push(point);
  }
  return data;
};

/**
 * 生成边际收益曲线数据（增量收益模式）
 *
 * 计算每额外投入一个单位词条时，该单位带来的即时伤害提升百分比。
 * 边际收益 = (当前伤害 / 上一单位伤害) - 1
 *
 * @param baseStats - 基础属性值
 * @param type - 角色类型
 * @param steps - 投入步数（默认 20）
 * @returns 边际收益数据点数组，每个点包含 step 和各词条的边际收益百分比
 */
export const generateMarginalCurveData = (baseStats: CharacterStats, type: CharacterType, steps: number = 20) => {
  const data = [];

  const statsToCalc = Object.keys(STAT_ROLL_UNITS).filter(k => STAT_ROLL_UNITS[k as keyof CharacterStats] > 0);

  for (let i = 1; i <= steps; i++) {
    const point: any = { step: i };

    statsToCalc.forEach((key) => {
      const statKey = key as keyof CharacterStats;
      const unit = STAT_ROLL_UNITS[statKey];

      // 上一单位伤害
      const prevStats = applyDefenseBenefitCap(
        { ...baseStats, [statKey]: baseStats[statKey] + (unit * (i - 1)) },
        statKey,
      );
      const prevDmg = calculateDamage(prevStats, type);

      // 当前单位伤害
      const currentStats = applyDefenseBenefitCap(
        { ...baseStats, [statKey]: baseStats[statKey] + (unit * i) },
        statKey,
      );
      const currentDmg = calculateDamage(currentStats, type);

      if (prevDmg === 0) {
        point[statKey] = 0;
      } else {
        point[statKey] = Number(((currentDmg / prevDmg - 1) * 100).toFixed(4));
      }
    });

    data.push(point);
  }
  return data;
};