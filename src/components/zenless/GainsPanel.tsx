/**
 * @file GainsPanel.tsx
 * @description 词条提升值与收益分析面板（Zenless Lab 专属）。
 *
 * 采用两栏布局：左栏为词条提升值输入表单，右栏为当前伤害期望与收益分析。
 * 收益按从高到低排序，以进度条 + 百分比数值的形式展示。
 * 未输入任何提升值时显示引导提示。
 *
 * 被 CalculatorPage 引用。
 */

import React, { useMemo } from 'react';
import { CharacterStats, CharacterType, STAT_LABELS } from '../../types';
import { calculateDamage, calculateGain } from '../../utils/calculator';
import { StatInput } from '../shared/StatInput';
import { TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

/** GainsPanel 组件 Props */
interface GainsPanelProps {
  /** 当前角色属性数值 */
  stats: CharacterStats;
  /** 角色类型 */
  type: CharacterType;
  /** 词条提升值（部分属性） */
  improvements: Partial<CharacterStats>;
  /**
   * 提升值变化回调
   * @param improvements - 更新后的提升值
   */
  onImprovementsChange: (improvements: Partial<CharacterStats>) => void;
}

/**
 * GainsPanel — 词条提升值与收益分析
 *
 * 功能：
 * - 左栏：词条提升值输入（排除白值属性 atk_base 和 hp_base）
 * - 右栏：当前伤害期望（含提升值）+ 实时收益分析
 * - 收益排序 + 进度条可视化
 * - 空状态引导提示
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const GainsPanel: React.FC<GainsPanelProps> = ({
  stats,
  type,
  improvements,
  onImprovementsChange,
}) => {
  /**
   * 计算所有词条的收益
   * @returns 各词条收益百分比映射
   */
  const gains = useMemo(() => {
    return calculateGain(stats, improvements, type);
  }, [stats, improvements, type]);

  /**
   * 计算应用提升值后的伤害期望
   * 将 improvements 合并到 stats 上计算总伤害
   * @returns 提升后的伤害期望值
   */
  const improvedDamage = useMemo(() => {
    const improvedStats = { ...stats };
    (Object.keys(improvements) as Array<keyof CharacterStats>).forEach((key) => {
      improvedStats[key] = (improvedStats[key] || 0) + (improvements[key] || 0);
    });
    return calculateDamage(improvedStats, type);
  }, [stats, improvements, type]);

  /**
   * 处理单个提升值变化
   * @param key - 属性 key
   * @param val - 新值
   */
  const handleImprovementChange = (key: keyof CharacterStats, val: number) => {
    onImprovementsChange({ ...improvements, [key]: val });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左列：词条提升值输入 */}
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

      {/* 右列：当前伤害期望 + 词条收益分析 */}
      <div className="flex flex-col gap-6">
        {/* 当前伤害期望（含提升值） */}
        <div className="relative overflow-hidden flex flex-col items-center justify-center py-7 nm-sunken rounded-2xl border border-zinc-200/50 group cursor-default transition-all duration-300 hover:border-zzz-orange/15">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.25em] mb-2.5 group-hover:text-zzz-orange transition-colors duration-300">当前伤害期望</span>
          <span className="text-5xl font-black text-zzz-orange drop-shadow-[0_0_15px_rgba(243,127,15,0.25)] select-all tracking-tight tabular-nums">
            {improvedDamage.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* 词条收益分析 */}
        <div className="p-7 nm-raised rounded-2xl">
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