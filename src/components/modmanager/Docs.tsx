/**
 * @file Docs.tsx
 * @description Mod Manager 子应用的使用指南文档页面。
 *
 * 提供 Mod 管理器的使用说明，目前为占位状态。
 * 未来将包含 Mod 导入、安装、管理等操作的详细指南。
 */

import React from 'react';
import { HelpCircle, Package } from 'lucide-react';

/**
 * Docs — Mod Manager 使用指南页面
 *
 * @returns JSX 元素
 */
export const Docs: React.FC = () => {
  return (
    <div className="w-full nm-raised p-8 rounded-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-zinc-800 mb-2 flex items-center justify-center gap-2">
          <HelpCircle size={22} className="text-zzz-orange" />
          使用指南
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Mod Manager 使用指南正在编写中，敬请期待
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="p-6 rounded-2xl bg-zzz-orange/10 text-zzz-orange">
          <Package size={48} />
        </div>
        <p className="text-sm text-zinc-500">Mod 管理器功能开发中，文档将随功能同步更新</p>
      </div>
    </div>
  );
};