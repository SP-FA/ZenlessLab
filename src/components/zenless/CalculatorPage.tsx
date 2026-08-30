/**
 * @file CalculatorPage.tsx
 * @description 计算分析页面框架（Zenless Lab 专属）。
 *
 * 作为 Zenless Lab 的"计算分析"Tab 的页面级组件，
 * 负责组合 CharacterStatsPanel 和 GainsPanel 的布局。
 * 采用两栏响应式布局（全宽基础数值 + 左栏提升值 + 右栏收益分析）。
 */

import React from 'react';
import { CharacterStats, CharacterType } from '../../types';
import { CharacterStatsPanel } from './CharacterStatsPanel';
import { GainsPanel } from './GainsPanel';

/** CalculatorPage 组件 Props */
interface CalculatorPageProps {
  /** 当前角色属性数值 */
  stats: CharacterStats;
  /** 角色类型 */
  type: CharacterType;
  /** 角色档案名称 */
  profileName?: string;
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
  /** 词条提升值 */
  improvements: Partial<CharacterStats>;
  /**
   * 提升值变化回调
   * @param improvements - 更新后的提升值
   */
  onImprovementsChange: (improvements: Partial<CharacterStats>) => void;
}

/**
 * CalculatorPage — 计算分析页面
 *
 * 布局：
 * - 顶部全宽：CharacterStatsPanel（角色基础数值 + 预设）
 * - 下方两栏：词条提升值（左）+ 当前伤害期望与收益分析（右）
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  stats,
  type,
  profileName = '',
  charPreset,
  enginePreset,
  onStatsChange,
  improvements,
  onImprovementsChange,
}) => {
  return (
    <div className="flex flex-col gap-8">
      <CharacterStatsPanel
        stats={stats}
        type={type}
        charPreset={charPreset}
        enginePreset={enginePreset}
        onStatsChange={onStatsChange}
      />
      <GainsPanel
        stats={stats}
        type={type}
        improvements={improvements}
        onImprovementsChange={onImprovementsChange}
      />
    </div>
  );
};