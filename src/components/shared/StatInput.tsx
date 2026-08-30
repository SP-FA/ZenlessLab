/**
 * @file StatInput.tsx
 * @description 通用数值输入组件。
 *
 * 提供带标签的数值输入框，支持小数输入校验和百分比标注。
 * 组件内部维护原始字符串状态以支持小数点输入过程中的中间状态
 * （如用户输入 "3." 时不会被 parseFloat 吞掉小数点）。
 *
 * 被 Zenless Lab、Zenless Discal、Mod Manager 三个子应用共用。
 *
 * @example
 * <StatInput
 *   label="暴击率 (%)"
 *   value={stats.crit_rate}
 *   onChange={(v) => handleStatChange('crit_rate', v)}
 *   isPercentage
 * />
 */

import React, { useState, useEffect } from 'react';

/** StatInput 组件 Props */
interface StatInputProps {
  /** 输入框标签文本 */
  label: string;
  /** 当前数值 */
  value: number;
  /**
   * 数值变化回调
   * @param val - 新的数值（已解析为 number）
   */
  onChange: (val: number) => void;
  /** 是否为百分比数值（仅影响标签显示，不影响输入行为） */
  isPercentage?: boolean;
}

/**
 * StatInput — 通用数值输入组件
 *
 * 特性：
 * - 仅允许输入数字和小数点
 * - 值为 0 时显示空字符串（placeholder "0"）
 * - focus 时自动全选文本
 * - 拟物风格凹陷样式（nm-sunken）
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const StatInput: React.FC<StatInputProps> = ({ label, value, onChange, isPercentage }) => {
  const [raw, setRaw] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    setRaw(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-mono text-zinc-500 font-semibold uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          value={raw}
          placeholder="0"
          onChange={(e) => {
            const nextRaw = e.target.value;
            if (/^\d*\.?\d*$/.test(nextRaw)) {
              setRaw(nextRaw);
              onChange(parseFloat(nextRaw) || 0);
            }
          }}
          onFocus={(e) => e.target.select()}
          className="w-full nm-sunken rounded-lg px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:border-zzz-orange/40 hover:border-zinc-300/80 focus:ring-1 focus:ring-zzz-orange/20 transition-all duration-300"
        />
      </div>
    </div>
  );
};