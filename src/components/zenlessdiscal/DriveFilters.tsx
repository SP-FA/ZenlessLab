/**
 * @file DriveFilters.tsx
 * @description 驱动盘筛选控件组件（Zenless Discal 专属）。
 *
 * 提供槽位和套装两个维度的筛选下拉框，
 * 使用 NeoSelect 统一选择器样式。
 */

import React from 'react';
import { Filter } from 'lucide-react';
import { NeoSelect } from '../shared/NeoSelect';

/** DriveFilters 组件 Props */
interface DriveFiltersProps {
  /** 当前槽位筛选值 */
  slotFilter: number | 'ALL';
  /**
   * 槽位筛选变化回调
   * @param slot - 新的槽位筛选值
   */
  onSlotFilterChange: (slot: number | 'ALL') => void;
  /** 当前套装筛选值 */
  setFilter: string | 'ALL';
  /**
   * 套装筛选变化回调
   * @param setName - 新的套装名称
   */
  onSetFilterChange: (setName: string) => void;
  /** 可选的套装名称列表 */
  availableSets: string[];
}

/**
 * DriveFilters — 驱动盘筛选控件
 *
 * 两个筛选维度：
 * - 槽位筛选：所有槽位 / 1-6 号盘
 * - 套装筛选：所有套装 / 已入库的套装名称
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const DriveFilters: React.FC<DriveFiltersProps> = ({
  slotFilter,
  onSlotFilterChange,
  setFilter,
  onSetFilterChange,
  availableSets,
}) => {
  return (
    <div className="nm-raised rounded-2xl p-5 bg-[#f0f3f6] border border-zinc-200/10">
      <div className="text-xs font-black text-zinc-600 mb-4 flex items-center gap-1.5 uppercase">
        <Filter size={14} className="text-zinc-500" />
        筛选
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Slot select filter */}
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1.5">槽位筛选</label>
          <NeoSelect
            value={slotFilter}
            onValueChange={(slot) => onSlotFilterChange(slot as number | 'ALL')}
            buttonClassName="text-xs font-bold"
            options={[
              { value: 'ALL', label: '所有槽位' },
              ...[1, 2, 3, 4, 5, 6].map(num => ({ value: num, label: `${num} 号盘` })),
            ]}
            ariaLabel="槽位筛选"
          />
        </div>

        {/* Set filter */}
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1.5">套装筛选</label>
          <NeoSelect
            value={setFilter}
            onValueChange={(setName) => onSetFilterChange(setName as string)}
            buttonClassName="text-xs font-bold"
            options={[
              { value: 'ALL', label: '所有套装' },
              ...availableSets.map(setName => ({ value: setName, label: setName })),
            ]}
            ariaLabel="套装筛选"
          />
        </div>
      </div>
    </div>
  );
};