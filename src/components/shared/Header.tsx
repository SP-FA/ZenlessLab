/**
 * @file Header.tsx
 * @description 全局顶部导航栏组件。
 *
 * 提供三栏布局（左侧 Logo + 标题、中间子应用内 Tab 导航、右侧子应用切换按钮）。
 * 支持子应用切换时的滑动动画（motion/react AnimatePresence），
 * 以及 Tab 切换时的 layoutId 指示器动画。
 *
 * 被所有子应用共用，是应用的顶层导航入口。
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import config from '../../../config.json';

/** 导航 Tab 定义 */
export interface HeaderTab {
  /** Tab 唯一标识 */
  id: string;
  /** 显示文本 */
  label: string;
  /** Tab 图标组件 */
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

/** 子应用标识 */
export type SubApp = 'zenless' | 'zenlessdiscal' | 'modmanager';

/** Header 组件 Props */
interface HeaderProps {
  /** 当前活跃的子应用 */
  subApp: SubApp;
  /** 当前子应用内活跃的 Tab ID */
  activeTab: string;
  /** 当前子应用的 Tab 列表 */
  tabs: HeaderTab[];
  /**
   * Tab 切换回调
   * @param tabId - 目标 Tab 的 ID
   */
  onTabChange: (tabId: string) => void;
  /**
   * 子应用切换回调
   * @param target - 目标子应用标识
   */
  onSwitchSubApp: (target: SubApp) => void;
  /** 切换方向：1 为向右，-1 为向左 */
  direction: number;
  /** motion/react 动画过渡配置 */
  transition: object;
}

/** 子应用切换动画变体 */
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

/** 子应用标题映射 */
const TITLES: Record<SubApp, string> = {
  zenless: 'ZENLESS LAB',
  zenlessdiscal: 'ZENLESS DISCAL',
  modmanager: 'MOD MANAGER',
};

/** 子应用 Tab 指示器 layoutId 映射（避免跨子应用动画冲突） */
const LAYOUT_KEYS: Record<SubApp, string> = {
  zenless: 'activeTab-zl',
  zenlessdiscal: 'activeTab-zd',
  modmanager: 'activeTab-mm',
};

/** 子应用切换顺序 */
const SUBAPP_ORDER: readonly SubApp[] = ['zenless', 'zenlessdiscal', 'modmanager'] as const;

/**
 * Header — 全局顶部导航栏
 *
 * 三栏布局：
 * - 左侧：Logo + 应用标题 + 版本号
 * - 中间：子应用内 Tab 导航（带 layoutId 动画指示器）
 * - 右侧：上一个/下一个子应用切换按钮
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export function Header({ subApp, activeTab, tabs, onTabChange, onSwitchSubApp, direction, transition }: HeaderProps) {
  const currentIndex = SUBAPP_ORDER.indexOf(subApp);
  const title = TITLES[subApp];
  const layoutKey = LAYOUT_KEYS[subApp];

  return (
    <header className="sticky top-0 z-50 px-4 pt-3">
      <div className="relative h-14">
        <AnimatePresence mode="sync" custom={direction}>
          <motion.div
            key={subApp}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0 header nm-raised rounded-2xl items-center px-4"
          >
          {/* Left: logo + title + version */}
          <div className="left flex items-center gap-3">
            <div className="w-9 h-9 nm-orange-raised-interactive rounded-lg flex items-center justify-center text-white font-black text-sm">
              Z
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tight text-zinc-800 leading-none">{title}</h1>
              <p className="text-[9px] text-zinc-500 font-mono mt-1 uppercase tracking-widest leading-none">v{config.VERSION}</p>
            </div>
          </div>

          {/* Center: navigation tabs */}
          <nav className="center flex gap-2 p-1.5">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 overflow-hidden ${
                  activeTab === item.id
                    ? 'text-zzz-orange nm-raised-active'
                    : 'nm-raised-interactive'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId={layoutKey}
                    className="absolute inset-x-0 bottom-0 h-[3px] bg-zzz-orange"
                    transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                  />
                )}
                <item.icon size={13} className={activeTab === item.id ? 'text-zzz-orange' : 'text-zinc-500'} />
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right: sub-app switch buttons */}
          <div className="right flex items-center justify-end gap-1.5">
            {/* Left button: go to previous sub-app */}
            {currentIndex > 0 && (
              <button
                onClick={() => onSwitchSubApp(SUBAPP_ORDER[currentIndex - 1])}
                className="nm-raised-interactive flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-zinc-600"
              >
                <ArrowLeft size={13} />
                {TITLES[SUBAPP_ORDER[currentIndex - 1]]}
              </button>
            )}

            {/* Right button: go to next sub-app */}
            {currentIndex < SUBAPP_ORDER.length - 1 && (
              <button
                onClick={() => onSwitchSubApp(SUBAPP_ORDER[currentIndex + 1])}
                className="nm-raised-interactive flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-zinc-600"
              >
                {TITLES[SUBAPP_ORDER[currentIndex + 1]]}
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      </div>
    </header>
  );
}