/**
 * @file CharacterStatsPanel.tsx
 * @description 角色基础数值面板组件（Zenless Lab 专属）。
 *
 * 提供角色属性和音擎的预设选择、以及完整的角色属性数值输入表单。
 * 包含四大属性分组：攻击、生命、双爆、其它（增伤/减抗/减防/穿透/异常精通）。
 *
 * 被 CalculatorPage 引用。
 */

import React, { useMemo } from 'react';
import { CharacterStats, CharacterType, STAT_LABELS } from '../../types';
import { StatInput } from '../shared/StatInput';
import { NeoSelect } from '../shared/NeoSelect';
import { CHARACTER_PRESETS, WENGINE_PRESETS } from '../../utils/presets';
import { Compass } from 'lucide-react';

/** CharacterStatsPanel 组件 Props */
interface CharacterStatsPanelProps {
  /** 当前角色属性数值 */
  stats: CharacterStats;
  /** 角色类型 */
  type: CharacterType;
  /** 角色预设名称 */
  charPreset?: string;
  /** 音擎预设名称 */
  enginePreset?: string;
  /**
   * 属性变化回调
   * @param stats - 更新后的属性
   * @param charPreset - 角色预设名称
   * @param enginePreset - 音擎预设名称
   */
  onStatsChange: (stats: CharacterStats, charPreset?: string, enginePreset?: string) => void;
}

/** 属性分组映射 */
const STAT_GROUPS = {
  攻击: ['atk_base', 'atk_flat_pre', 'atk_pct_pre', 'atk_flat_post', 'atk_pct_post'],
  生命: ['hp_base', 'hp_flat_pre', 'hp_pct_pre', 'hp_flat_post', 'hp_pct_post'],
  双爆: ['crit_rate', 'crit_dmg'],
  其它: ['dmg_bonus', 'res_shred', 'def_shred', 'pen_ratio', 'pen_flat', 'anomaly_prof'],
} as const;

/**
 * CharacterStatsPanel — 角色基础数值面板
 *
 * 功能：
 * - 代理人白值预设选择（自动匹配角色基础 HP + 攻击力）
 * - 音擎白值预设选择（自动匹配音擎基础攻击力）
 * - 四组属性输入（攻击/生命/双爆/其它）
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const CharacterStatsPanel: React.FC<CharacterStatsPanelProps> = ({
  stats,
  type,
  charPreset,
  enginePreset,
  onStatsChange,
}) => {
  if (!stats) return null;

  /**
   * 解析当前预设显示名称
   * 优先使用显式传入的预设名，否则根据属性值反向匹配
   */
  const { displayCharName, displayWEngineName } = useMemo(() => {
    if (charPreset !== undefined || enginePreset !== undefined) {
      return {
        displayCharName: charPreset || 'custom',
        displayWEngineName: enginePreset || 'custom',
      };
    }

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

    const exactChar = CHARACTER_PRESETS.find(c => c.baseHp === stats.hp_base && c.baseAtk === stats.atk_base);
    if (exactChar) {
      return { displayCharName: exactChar.name, displayWEngineName: 'custom' };
    }

    const char = CHARACTER_PRESETS.find(c => c.baseHp === stats.hp_base);
    if (!char) {
      return { displayCharName: 'custom', displayWEngineName: 'custom' };
    }
    const remainingAtk = stats.atk_base - char.baseAtk;
    const engine = WENGINE_PRESETS.find(w => w.baseAtk === remainingAtk);

    return {
      displayCharName: char.name,
      displayWEngineName: engine ? engine.name : 'custom',
    };
  }, [charPreset, enginePreset, stats.hp_base, stats.atk_base]);

  
  /**
   * 处理单个属性变化
   * @param key - 属性 key
   * @param val - 新值
   */
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

  /**
   * 处理角色预设变更
   * @param charName - 角色预设名称
   */
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
        atk_base: char.baseAtk + engineAtk + 75,
      };
      onStatsChange(newStats, charName, displayWEngineName);
    }
  };

  /**
   * 处理音擎预设变更
   * @param engineName - 音擎预设名称
   */
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
        atk_base: charAtk + engine.baseAtk + 75,
      };
      onStatsChange(newStats, displayCharName, engineName);
    }
  };

  return (
    <div className="flex flex-col gap-6">
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
            <NeoSelect
              value={displayCharName}
              onValueChange={handleCharPresetChange}
              buttonClassName="text-sm"
              options={[
                { value: 'custom', label: '⚙️ 自定义代理人数据' },
                ...CHARACTER_PRESETS.map(c => ({ value: c.name, label: `[${c.rarity}] ${c.name}` })),
              ]}
              ariaLabel="代理人白值"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="mb-2">⚔️ 音擎白值</span>
            </label>
            <NeoSelect
              value={displayWEngineName}
              onValueChange={handleWEnginePresetChange}
              buttonClassName="text-sm"
              options={[
                { value: 'custom', label: '⚙️ 自定义武器数据' },
                ...WENGINE_PRESETS.map(w => ({ value: w.name, label: `[${w.rarity}] ${w.name}` })),
              ]}
              ariaLabel="音擎白值"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          {Object.entries(STAT_GROUPS).map(([group, keys]) => (
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
  );
};