import React, { useMemo } from 'react';
import { CharacterStats, CharacterType, STAT_LABELS } from '../types';
import { calculateDamage, calculateGain } from '../utils/calculator';
import { StatInput } from './StatInput';
import { CHARACTER_PRESETS, WENGINE_PRESETS } from '../utils/presets';
import { TrendingUp, Compass, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface CalculatorProps {
  stats: CharacterStats;
  type: CharacterType;
  profileName?: string;
  charPreset?: string;
  enginePreset?: string;
  onStatsChange: (stats: CharacterStats, charPreset?: string, enginePreset?: string) => void;
  improvements: Partial<CharacterStats>;
  onImprovementsChange: (improvements: Partial<CharacterStats>) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ 
  stats, 
  type, 
  profileName = '',
  charPreset,
  enginePreset,
  onStatsChange,
  improvements,
  onImprovementsChange
}) => {
  if (!stats) return null;

  // Resolve presets dynamically to ensure backwards compatibility and instant alignment with stats
  const { displayCharName, displayWEngineName } = useMemo(() => {
    // 1. If explicit presets are passed from storage, use them
    if (charPreset !== undefined || enginePreset !== undefined) {
      return {
        displayCharName: charPreset || 'custom',
        displayWEngineName: enginePreset || 'custom'
      };
    }
    
    // 2. Otherwise try to match based on current stat values (support for old profiles)
    // 2a. Try to find a perfect combination of character + engine
    for (const char of CHARACTER_PRESETS) {
      if (char.baseHp === stats.hp_base) {
        const remainingAtk = stats.atk_base - char.baseAtk;
        if (remainingAtk === 0) {
          return { displayCharName: char.name, displayWEngineName: 'custom' };
        }
        const engine = WENGINE_PRESETS.find(w => w.baseAtk === remainingAtk);
        if (engine) {
          return { displayCharName: char.name, displayWEngineName: engine.name };
        }
      }
    }

    // 2b. Fallback to matching character by baseHp and baseAtk
    const exactChar = CHARACTER_PRESETS.find(c => c.baseHp === stats.hp_base && c.baseAtk === stats.atk_base);
    if (exactChar) {
      return { displayCharName: exactChar.name, displayWEngineName: 'custom' };
    }

    // 2c. Fallback to matching first character by baseHp
    const char = CHARACTER_PRESETS.find(c => c.baseHp === stats.hp_base);
    if (!char) {
      return { displayCharName: 'custom', displayWEngineName: 'custom' };
    }
    const remainingAtk = stats.atk_base - char.baseAtk;
    const engine = WENGINE_PRESETS.find(w => w.baseAtk === remainingAtk);
    
    return {
      displayCharName: char.name,
      displayWEngineName: engine ? engine.name : 'custom'
    };
  }, [charPreset, enginePreset, stats.hp_base, stats.atk_base]);

  const currentDamage = useMemo(() => calculateDamage(stats, type), [stats, type]);
  
  const gains = useMemo(() => {
    return calculateGain(stats, improvements, type);
  }, [stats, improvements, type]);

  const handleStatChange = (key: keyof CharacterStats, val: number) => {
    let nextCharPreset = displayCharName;
    let nextEnginePreset = displayWEngineName;
    if (key === 'hp_base') {
      nextCharPreset = 'custom';
    } else if (key === 'atk_base') {
      nextCharPreset = 'custom';
      nextEnginePreset = 'custom';
    }
    onStatsChange({ ...stats, [key]: val }, nextCharPreset, nextEnginePreset);
  };

  const handleImprovementChange = (key: keyof CharacterStats, val: number) => {
    onImprovementsChange({ ...improvements, [key]: val });
  };

  const handleCharPresetChange = (charName: string) => {
    if (charName === 'custom') {
      onStatsChange(stats, 'custom', 'custom');
      return;
    }
    const char = CHARACTER_PRESETS.find(c => c.name === charName);
    if (char) {
      const currentEngine = WENGINE_PRESETS.find(w => w.name === displayWEngineName);
      const engineAtk = currentEngine ? currentEngine.baseAtk : 0;
      const newStats = {
        ...stats,
        hp_base: char.baseHp,
        atk_base: char.baseAtk + engineAtk
      };
      onStatsChange(newStats, charName, displayWEngineName);
    }
  };

  const handleWEnginePresetChange = (engineName: string) => {
    if (engineName === 'custom') {
      onStatsChange(stats, displayCharName, 'custom');
      return;
    }
    const engine = WENGINE_PRESETS.find(w => w.name === engineName);
    if (engine) {
      const currentChar = CHARACTER_PRESETS.find(c => c.name === displayCharName);
      const charAtk = currentChar ? currentChar.baseAtk : 0;
      const newStats = {
        ...stats,
        atk_base: charAtk + engine.baseAtk
      };
      onStatsChange(newStats, displayCharName, engineName);
    }
  };

  const statGroups = {
    攻击: ['atk_base', 'atk_flat_pre', 'atk_pct_pre', 'atk_flat_post', 'atk_pct_post'],
    生命: ['hp_base', 'hp_flat_pre', 'hp_pct_pre', 'hp_flat_post', 'hp_pct_post'],
    双爆: ['crit_rate', 'crit_dmg'],
    其它: ['dmg_bonus', 'res_shred', 'def_shred', 'pen_ratio', 'pen_flat', 'anomaly_prof']
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 基础数值输入 */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="p-7 nm-raised rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
              <Compass size={20} className="text-zzz-orange" />
              角色基础数值
            </h2>
          </div>

          {/* 预设选择器面板 */}
          <div className="mb-6 p-5 nm-sunken rounded-2xl border border-zinc-200/30 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="mb-2">👤 代理人白值</span>
              </label>
              <div className="relative">
                <select
                  value={displayCharName}
                  onChange={(e) => handleCharPresetChange(e.target.value)}
                  className="w-full nm-raised rounded-lg px-3.5 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zzz-orange/25 cursor-pointer appearance-none"
                >
                  <option value="custom">⚙️ 自定义代理人数据</option>
                  {CHARACTER_PRESETS.map(c => (
                    <option key={c.name} value={c.name}>
                      [{c.rarity}] {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="mb-2">⚔️ 音擎白值</span>
              </label>
              <div className="relative">
                <select
                  value={displayWEngineName}
                  onChange={(e) => handleWEnginePresetChange(e.target.value)}
                  className="w-full nm-raised rounded-lg px-3.5 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zzz-orange/25 cursor-pointer appearance-none"
                >
                  <option value="custom">⚙️ 自定义武器数据</option>
                  {WENGINE_PRESETS.map(w => (
                    <option key={w.name} value={w.name}>
                      [{w.rarity}] {w.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {Object.entries(statGroups).map(([group, keys]) => (
              <React.Fragment key={group}>
                <div className="col-span-full mt-4 mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{group}</span>
                  <div className="h-[1px] bg-gradient-to-r from-zinc-250/80 via-zinc-200 to-transparent mt-1.5"></div>
                </div>
                {keys.map((key) => {
                  const k = key as keyof CharacterStats;
                  return (
                    <StatInput
                      key={k}
                      label={STAT_LABELS[k]}
                      value={stats[k]}
                      onChange={(v) => handleStatChange(k, v)}
                      isPercentage={STAT_LABELS[k].includes('%')}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="p-7 nm-raised rounded-2xl">
          <h2 className="text-xl font-bold text-zinc-800 mb-6 flex items-center gap-2">
            <Sparkles size={20} className="text-zzz-orange" />
            词条提升值
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {Object.keys(STAT_LABELS).filter(k => k !== 'atk_base' && k !== 'hp_base').map((key) => {
              const k = key as keyof CharacterStats;
              return (
                <StatInput
                  key={`imp-${k}`}
                  label={STAT_LABELS[k]}
                  value={improvements[k] || 0}
                  onChange={(v) => handleImprovementChange(k, v)}
                  isPercentage={STAT_LABELS[k].includes('%')}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="p-7 nm-raised rounded-2xl">
          <div className="relative overflow-hidden flex flex-col items-center justify-center py-7 nm-sunken rounded-2xl border border-zinc-200/50 mb-6 group cursor-default transition-all duration-300 hover:border-zzz-orange/15">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.25em] mb-2.5 group-hover:text-zzz-orange transition-colors duration-300">当前伤害期望</span>
            <span className="text-5xl font-mono font-black text-zzz-orange drop-shadow-[0_0_15px_rgba(243,127,15,0.25)] select-all tracking-tight tabular-nums">
              {currentDamage.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-zzz-orange"/>
            词条收益分析 (%)
          </h3>
          
          <div className="flex flex-col gap-5 max-h-[600px] overflow-y-auto p-4">
            {(Object.entries(gains) as [keyof CharacterStats, number][])
              .filter(([_, gain]) => gain > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([key, gain]) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0  }}
                  key={key}
                  className="flex items-center justify-between p-3.5 nm-raised rounded-xl"
                >
                  <span className="text-xs text-zinc-600 font-semibold">{STAT_LABELS[key].split(' (')[0]}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 bg-zinc-200/70 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-zzz-orange" 
                        style={{ width: `${Math.min(100, gain * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-mono font-bold text-zzz-orange min-w-[65px] text-right">
                      +{(gain * 100).toFixed(2)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            {Object.values(improvements).every(v => !v || v === 0) && (
              <div className="text-center py-12 text-zinc-400 text-xs italic font-medium">
                在左侧输入词条提升值，开启实时收益分析
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};




