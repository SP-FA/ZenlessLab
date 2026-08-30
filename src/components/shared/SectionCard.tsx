/**
 * @file SectionCard.tsx
 * @description 统一的内容区域卡片组件。
 *
 * 封装了应用中反复出现的"卡片容器 + 标题 + 图标"模式，
 * 统一使用 nm-raised 拟物风格，避免在各组件中重复定义相同的布局结构。
 *
 * @example
 * <SectionCard title="角色基础数值" icon={Compass}>
 *   <CharacterStatsPanel ... />
 * </SectionCard>
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

/** SectionCard 组件 Props */
interface SectionCardProps {
  /** 卡片标题 */
  title: string;
  /** 标题前的图标组件 */
  icon?: LucideIcon;
  /** 卡片内容 */
  children: React.ReactNode;
  /** 额外 CSS 类名 */
  className?: string;
  /** 标题右侧的操作区域 */
  actions?: React.ReactNode;
}

/**
 * SectionCard — 统一内容卡片
 *
 * 标准结构：
 * - 外层 nm-raised rounded-2xl 容器
 * - 标题行（图标 + 文字 + 可选操作区）
 * - 内容区域
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon: Icon,
  children,
  className = '',
  actions,
}) => {
  return (
    <div className={`p-7 nm-raised rounded-2xl ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
          {Icon && <Icon size={20} className="text-zzz-orange" />}
          {title}
        </h2>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
};