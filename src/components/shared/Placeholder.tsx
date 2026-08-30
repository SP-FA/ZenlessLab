/**
 * @file Placeholder.tsx
 * @description 统一的"开发中"占位页面组件。
 *
 * 为所有子应用中的未完成页面提供一致的占位展示，
 * 避免在每个子应用中重复编写相同的占位 JSX。
 *
 * 被 Zenless Lab、Zenless Discal、Mod Manager 三个子应用共用。
 *
 * @example
 * <PlaceholderPage title="指南文档" message="开发中..." />
 * <PlaceholderPage title="MOD MANAGER" message="Mod 管理器正在开发中..." />
 */

import React from 'react';
import { motion } from 'motion/react';

/** PlaceholderPage 组件 Props */
interface PlaceholderPageProps {
  /** 占位页面标题 */
  title: string;
  /** 占位页面描述信息 */
  message?: string;
}

/**
 * PlaceholderPage — 统一占位页面
 *
 * 居中展示一个标题和描述信息，使用 nm-raised 卡片样式。
 * 外部需要包裹 motion.div 动画容器时，直接放在 AnimatePresence 内部即可。
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  message = '开发中...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="p-8 nm-raised rounded-2xl text-center">
        <h2 className="text-xl font-black text-zinc-800">{title}</h2>
        <p className="text-sm text-zinc-500 mt-2">{message}</p>
      </div>
    </div>
  );
};