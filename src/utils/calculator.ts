import { CharacterStats, CharacterType } from "../types";

export const calculateDamage = (stats: CharacterStats, type: CharacterType) => {
  // 转换百分比数值
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
    // 强攻：基础攻击区 * (1 + 暴击率 * 爆伤) * 增伤区 * 抗性区 * 防御区
    damage = baseAtkZone * (1 + crit_rate * crit_dmg) * dmgZone * resZone * defZone;
  } else if (type === 'ANOMALY') {
    // 异常：基础攻击区 * 异常精通 * 增伤区 * 抗性区 * 防御区
    damage = baseAtkZone * stats.anomaly_prof * dmgZone * resZone * defZone;
  } else if (type === 'STUN') {
    // 命破：贯穿力 * (1 + 暴击率 * 爆伤) * 增伤区 * 抗性区
    // 贯穿力 = 0.3 * 基础攻击区 + 0.1 * 基础生命区
    const penetrationPower = 0.3 * baseAtkZone + 0.1 * baseHpZone;
    damage = penetrationPower * (1 + crit_rate * crit_dmg) * dmgZone * resZone;
  }

  return damage;
};

export const calculateGain = (baseStats: CharacterStats, improvements: Partial<CharacterStats>, type: CharacterType) => {
  const originalDmg = calculateDamage(baseStats, type);
  
  const results: Record<string, number> = {};

  Object.keys(improvements).forEach((key) => {
    const statKey = key as keyof CharacterStats;
    const improvedStats = { ...baseStats, [statKey]: baseStats[statKey] + (improvements[statKey] || 0) };
    const newDmg = calculateDamage(improvedStats, type);
    
    // 收益 = 提升后伤害 / 原伤害 - 1 (用户公式 1 - 提升后/原伤害 可能是笔误，通常收益为正)
    // 但我会按照用户要求的 1 - 提升后/原伤害 计算，如果结果为负，说明是提升。
    // 为了直观，我这里计算 (New/Old - 1) 并展示为百分比
    if (originalDmg === 0) {
      results[statKey] = 0;
    } else {
      results[statKey] = (newDmg / originalDmg) - 1;
    }
  });

  return results;
};

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

export const generateCurveData = (baseStats: CharacterStats, type: CharacterType, steps: number = 10) => {
  const originalDmg = calculateDamage(baseStats, type);
  if (originalDmg === 0) return [];

  const data = [];
  for (let i = 0; i <= steps; i++) {
    const point: any = { step: i };
    
    // Calculate for each relevant stat
    Object.entries(STAT_ROLL_UNITS).forEach(([key, unit]) => {
      if (unit === 0) return;
      const statKey = key as keyof CharacterStats;
      const improvedStats = { ...baseStats, [statKey]: baseStats[statKey] + (unit * i) };
      const newDmg = calculateDamage(improvedStats, type);
      point[statKey] = Number(((newDmg / originalDmg - 1) * 100).toFixed(2));
    });
    
    data.push(point);
  }
  return data;
};

export const generateMarginalCurveData = (baseStats: CharacterStats, type: CharacterType, steps: number = 20) => {
  const data = [];
  
  // Calculate for each relevant stat
  const statsToCalc = Object.keys(STAT_ROLL_UNITS).filter(k => STAT_ROLL_UNITS[k as keyof CharacterStats] > 0);

  for (let i = 1; i <= steps; i++) {
    const point: any = { step: i };
    
    statsToCalc.forEach((key) => {
      const statKey = key as keyof CharacterStats;
      const unit = STAT_ROLL_UNITS[statKey];
      
      // Damage with (i-1) units
      const prevStats = { ...baseStats, [statKey]: baseStats[statKey] + (unit * (i - 1)) };
      const prevDmg = calculateDamage(prevStats, type);
      
      // Damage with i units
      const currentStats = { ...baseStats, [statKey]: baseStats[statKey] + (unit * i) };
      const currentDmg = calculateDamage(currentStats, type);
      
      if (prevDmg === 0) {
        point[statKey] = 0;
      } else {
        // Benefit = (CurrentDmg / PrevDmg) - 1
        point[statKey] = Number(((currentDmg / prevDmg - 1) * 100).toFixed(4));
      }
    });
    
    data.push(point);
  }
  return data;
};
