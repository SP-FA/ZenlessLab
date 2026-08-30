/**
 * @file ModManager.tsx
 * @description Mod Manager 子应用主页面（Mod Manager 专属）。
 *
 * Mod 管理器的主页面组件，目前为占位状态。
 * 未来将提供游戏 Mod 的安装、启用/禁用、管理等功能。
 */

import React from 'react';
import { Package } from 'lucide-react';

/**
 * ModManager — Mod 管理器主页面
 *
 * @returns JSX 元素
 */
export const ModManager: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="p-8 nm-raised rounded-2xl text-center">
        <div className="p-4 rounded-2xl bg-zzz-orange text-white nm-orange-raised-interactive inline-flex mb-4">
          <Package size={36} />
        </div>
        <h2 className="text-xl font-black text-zinc-800">MOD MANAGER</h2>
        <p className="text-sm text-zinc-500 mt-2">Mod 管理器正在开发中...</p>
      </div>
    </div>
  );
};