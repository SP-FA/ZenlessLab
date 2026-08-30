/**
 * @file About.tsx
 * @description Mod Manager 子应用的 About 页面。
 *
 * 展示 Mod Manager 的版本信息和开发计划。
 * 作为独立子应用，拥有独立的 About 内容。
 */

import React from 'react';
import { Package, Cpu, Circle } from 'lucide-react';

/**
 * About — Mod Manager 关于页面
 *
 * @returns JSX 元素
 */
export const About: React.FC = () => {
  return (
    <div>
      <div className="w-full nm-raised p-8 rounded-3xl">
        <div className="text-center mb-8">
          <div className="p-4 rounded-2xl bg-zzz-orange text-white nm-orange-raised-interactive inline-flex mb-4">
            <Package size={36} />
          </div>
          <h2 className="text-xl font-black text-zinc-800 tracking-tight">MOD MANAGER</h2>
          <p className="text-sm text-zinc-500 mt-2">游戏 Mod 管理工具</p>
        </div>

        <div className="p-6 nm-sunken rounded-2xl mb-6">
          <h3 className="text-sm font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <Cpu size={18} className="text-zzz-orange" />
            开发计划
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600">
            <div className="flex items-center gap-2.5">
              <Circle className="text-zzz-orange/70 shrink-0" size={14} />
              <span>Mod 导入与安装</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Circle className="text-zzz-orange/70 shrink-0" size={14} />
              <span>Mod 启用/禁用管理</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Circle className="text-zzz-orange/70 shrink-0" size={14} />
              <span>Mod 冲突检测</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Circle className="text-zzz-orange/70 shrink-0" size={14} />
              <span>批量操作支持</span>
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