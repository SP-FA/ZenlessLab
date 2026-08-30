/**
 * @file Docs.tsx
 * @description Zenless Discal 子应用的使用指南文档页面。
 *
 * 提供驱动盘管理器的使用说明，包括：
 * - 添加驱动盘的操作步骤
 * - 编辑与删除操作
 * - 筛选与排序功能
 */

import React from 'react';
import { HelpCircle, Plus, Edit2, Trash2, Filter } from 'lucide-react';

/**
 * Docs — Zenless Discal 使用指南页面
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
          驱动盘仓库帮助你记录和管理所有已刷取的驱动盘，方便快速筛选和对比
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="p-6 nm-sunken rounded-xl border border-zinc-200/10">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-4">
            <div className="w-1.5 h-3.5 bg-zzz-orange rounded-full"></div>
            添加驱动盘
          </h3>
          <ul className="space-y-3.5 text-xs text-zinc-650 pl-2 leading-relaxed">
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">01.</span>
              <span>在左侧套装列表中选择驱动盘套装，可查看套装缩略图和颜色标识</span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">02.</span>
              <span>选择槽位（1-6），系统会自动过滤该槽位可选的主词条</span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">03.</span>
              <span>拖动等级滑条设置驱动盘等级（0-15），主词条数值会实时更新</span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">04.</span>
              <span>点击 <span className="p-1 nm-raised text-zzz-orange rounded"><Plus size={10} className="inline" /></span> 新增副词条，最多4条，选择名称并拖动强化次数</span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">05.</span>
              <span>点击"确认配置并保存"将驱动盘存入仓库</span>
            </li>
          </ul>
        </div>

        <div className="p-6 nm-sunken rounded-xl border border-zinc-200/10">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-4">
            <div className="w-1.5 h-3.5 bg-zzz-orange rounded-full"></div>
            管理与筛选
          </h3>
          <ul className="space-y-3.5 text-xs text-zinc-650 pl-2 leading-relaxed">
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">01.</span>
              <span className="flex items-center gap-1.5">
                点击 <span className="p-1 nm-raised rounded"><Edit2 size={12} className="inline" /></span> 编辑驱动盘属性
              </span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">02.</span>
              <span className="flex items-center gap-1.5">
                点击 <span className="p-1 nm-raised rounded"><Trash2 size={12} className="inline" /></span> 删除驱动盘（需确认）
              </span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">03.</span>
              <span className="flex items-center gap-1.5">
                使用 <span className="p-1 nm-raised rounded"><Filter size={12} className="inline" /></span> 筛选器按槽位或套装快速查找
              </span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">04.</span>
              <span>驱动盘默认按套装类型 → 槽位顺序排列，同名套装按添加时间降序</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};