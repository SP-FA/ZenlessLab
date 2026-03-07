import React, { useMemo } from 'react';
import { CharacterStats, CharacterType, STAT_LABELS } from '../types';
import { calculateDamage, calculateGain } from '../utils/calculator';
import { StatInput } from './StatInput';
import { TrendingUp } from 'lucide-react';
import { MdAccessible, MdAccessibleForward } from 'react-icons/md';
import { motion } from 'motion/react';

interface CalculatorProps {
  stats: CharacterStats;
  type: CharacterType;
  onStatsChange: (stats: CharacterStats) => void;
  improvements: Partial<CharacterStats>;
  onImprovementsChange: (improvements: Partial<CharacterStats>) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ 
  stats, 
  type, 
  onStatsChange,
  improvements,
  onImprovementsChange
}) => {
  if (!stats) return null;

  const currentDamage = useMemo(() => calculateDamage(stats, type), [stats, type]);
  
  const gains = useMemo(() => {
    return calculateGain(stats, improvements, type);
  }, [stats, improvements, type]);

  const handleStatChange = (key: keyof CharacterStats, val: number) => {
    onStatsChange({ ...stats, [key]: val });
  };

  const handleImprovementChange = (key: keyof CharacterStats, val: number) => {
    onImprovementsChange({ ...improvements, [key]: val });
  };

  const statGroups = {
    攻击: ['atk_base', 'atk_flat_pre', 'atk_pct_pre', 'atk_flat_post', 'atk_pct_post'],
    生命: ['hp_base', 'hp_flat_pre', 'hp_pct_pre', 'hp_flat_post', 'hp_pct_post'],
    双爆: ['crit_rate', 'crit_dmg'],
    其它: ['dmg_bonus', 'res_shred', 'def_shred', 'pen_ratio', 'pen_flat', 'anomaly_prof']
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
      {/* 基础数值输入 */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-md font-medium text-zinc-100 mb-6 flex items-center gap-2">
            <MdAccessible size={20} className="text-zzz-orange" />
            角色基础数值
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {Object.entries(statGroups).map(([group, keys]) => (
              <React.Fragment key={group}>
                <div className="col-span-full mt-2 mb-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{group}</span>
                  <div className="h-[1px] bg-zinc-800 mt-1"></div>
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

        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-md font-medium text-zinc-100 mb-6 flex items-center gap-2">
            <MdAccessibleForward size={20} className="text-zzz-orange" />
            词条提升值输入
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      {/* 收益展示 */}
      <div className="flex flex-col gap-6">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
          <div className="flex flex-col items-center justify-center py-4 border-b border-zinc-800 mb-6">
            <span className="text-xs text-zinc-500 uppercase tracking-widest mb-1">当前伤害期望</span>
            <span className="text-4xl font-mono font-bold text-zzz-orange">
              {currentDamage.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-zzz-orange"/>
            词条收益分析 (%)
          </h3>
          
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(gains)
              .filter(([_, gain]) => gain > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([key, gain]) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={key}
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                >
                  <span className="text-xs text-zinc-300">{STAT_LABELS[key as keyof CharacterStats].split(' (')[0]}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-zzz-orange" 
                        style={{ width: `${Math.min(100, gain * 100 * 5)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-mono font-medium text-zzz-orange">
                      +{(gain * 100).toFixed(2)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            {Object.values(improvements).every(v => !v || v === 0) && (
              <div className="text-center py-10 text-zinc-600 text-xs italic">
                在左侧输入提升值以查看收益分析
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
