/**
 * @file NeoSelect.tsx
 * @description 通用拟物风格下拉选择器组件。
 *
 * 提供统一的单选下拉交互，支持键盘导航（ArrowDown/Enter/Escape）、
 * 外部点击关闭、以及完整的 WAI-ARIA 无障碍属性。
 * 泛型设计支持 string 和 number 两种值类型。
 *
 * 被 Zenless Lab、Zenless Discal、Mod Manager 三个子应用共用。
 *
 * @example
 * <NeoSelect
 *   value={selectedType}
 *   onValueChange={setSelectedType}
 *   options={[
 *     { value: 'ATTACK', label: '强攻' },
 *     { value: 'ANOMALY', label: '异常' },
 *   ]}
 *   ariaLabel="角色类型"
 * />
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/** 下拉选项定义 */
export interface NeoSelectOption<T extends string | number> {
  /** 选项值 */
  value: T;
  /** 选项显示文本 */
  label: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
}

/** NeoSelect 组件 Props */
interface NeoSelectProps<T extends string | number> {
  /** 当前选中值 */
  value: T;
  /** 可选项列表 */
  options: NeoSelectOption<T>[];
  /**
   * 选中值变化回调
   * @param value - 新选中的值
   */
  onValueChange: (value: T) => void;
  /** 根容器额外 CSS 类名 */
  className?: string;
  /** 触发按钮额外 CSS 类名 */
  buttonClassName?: string;
  /** 下拉菜单额外 CSS 类名 */
  menuClassName?: string;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * NeoSelect — 通用拟物风格下拉选择器
 *
 * 特性：
 * - 键盘可访问（ArrowDown 展开，Escape 关闭）
 * - 点击外部自动关闭
 * - 选中项高亮 + Check 图标
 * - 泛型支持 string | number 值类型
 *
 * @typeParam T - 选项值类型，必须是 string 或 number
 * @param props - 组件属性
 * @returns JSX 元素
 */
export function NeoSelect<T extends string | number>({
  value,
  options,
  onValueChange,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  ariaLabel,
}: NeoSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeOnOutsidePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={`neo-select ${className}`}>
      <button
        type="button"
        className={`neo-select__trigger ${buttonClassName}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <span className="neo-select__value">{selected?.label}</span>
        <ChevronDown size={16} className={`neo-select__chevron ${isOpen ? 'neo-select__chevron--open' : ''}`} />
      </button>

      {isOpen && (
        <div id={listboxId} role="listbox" className={`neo-select__menu ${menuClassName}`}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                type="button"
                key={String(option.value)}
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                className={`neo-select__option ${isSelected ? 'neo-select__option--selected' : ''}`}
                onClick={() => {
                  if (!option.disabled) onValueChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}