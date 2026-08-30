/**
 * @file About.tsx
 * @description Zenless Discal 子应用的 About 页面。
 *
 * 展示 Zenless Discal（驱动盘管理器）的版本信息和开发计划。
 * 作为独立子应用，拥有独立的 About 内容。
 */

import React from 'react';
import { Disc, Cpu, CheckCircle, Circle } from 'lucide-react';

/**
 * About — Zenless Discal 关于页面
 *
 * @returns JSX 元素
 */
export const About: React.FC = () => {
  return (
    <div>
      <div className="w-full nm-raised p-8 rounded-3xl">
        <div className="text-center mb-8">
          <div className="p-4 rounded-2xl bg-zzz-orange text-white nm-orange-raised-interactive inline-flex mb-4">
            <Disc size={36} />
          </div>
          <h2 className="text-xl font-black text-zinc-800 tracking-tight">ZENLESS DISCAL</h2>
          <p className="text-sm text-zinc-500 mt-2">驱动盘管理与分析工具</p>
        </div>

        <div className="p-6 nm-sunken rounded-2xl mb-6">
          <h3 className="text-sm font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <Cpu size={18} className="text-zzz-orange" />
            功能特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="text-[#00aa00] shrink-0" size={14} />
              <span>驱动盘仓库管理</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="text-[#00aa00] shrink-0" size={14} />
              <span>套装效果查询</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="text-[#00aa00] shrink-0" size={14} />
              <span>主词条/副词条配置</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="text-[#00aa00] shrink-0" size={14} />
              <span>槽位 & 套装筛选</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Circle className="text-zzz-orange/70 shrink-0" size={14} />
              <span>驱动盘评分系统</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Circle className="text-zzz-orange/70 shrink-0" size={14} />
              <span>智能推荐最佳搭配</span>
            </div>
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-[20px] font-mono tracking-[0.25em] text-zinc-500 uppercase">
            - 新艾利都，永不落幕 -
          </p>
        </div>
      </div>
    </div>
  );
};