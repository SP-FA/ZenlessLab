/**
 * @file DriveManager.tsx
 * @description 驱动盘仓库管理页面（Zenless Discal 专属）。
 *
 * 提供驱动盘的完整 CRUD 管理功能：
 * - 添加新驱动盘（含套装选择、主词条/副词条配置）
 * - 编辑已有驱动盘（弹窗模式）
 * - 删除驱动盘
 * - 按槽位/套装筛选 + 排序
 * - 驱动盘卡片网格展示
 *
 * 数据通过 localStorage 持久化存储。
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Disc, FolderOpen, X } from 'lucide-react';
import { DriveDisc, DriveDiscSubStat } from '../../types';
import { storage } from '../../services/storage';
import { DRIVE_DISC_PRESETS } from '../../utils/presets';
import { Modal } from '../shared/Modal';
import { DriveCard } from './DriveCard';
import { DriveFilters } from './DriveFilters';
import { DriveEditor, DriveEditorData } from './DriveEditor';

/** 主词条配置 */
const MAIN_STATS_CONFIG: Record<string, { base: number; max: number; unit: string; allowedSlots: number[] }> = {
  "固定生命值": { base: 147, max: 2200, unit: '', allowedSlots: [1] },
  "固定攻击力": { base: 20, max: 316, unit: '', allowedSlots: [2] },
  "固定防御力": { base: 16, max: 250, unit: '', allowedSlots: [3] },
  "攻击力 (%)": { base: 2.0, max: 30.0, unit: '%', allowedSlots: [4, 5, 6] },
  "生命值 (%)": { base: 2.0, max: 30.0, unit: '%', allowedSlots: [4, 5, 6] },
  "防御力 (%)": { base: 3.2, max: 48.0, unit: '%', allowedSlots: [4, 5, 6] },
  "暴击率 (%)": { base: 1.6, max: 24.0, unit: '%', allowedSlots: [4] },
  "暴击伤害 (%)": { base: 3.2, max: 48.0, unit: '%', allowedSlots: [4] },
  "异常精通": { base: 6, max: 92, unit: '', allowedSlots: [4] },
  "物理伤害加成 (%)": { base: 2.0, max: 30.0, unit: '%', allowedSlots: [5] },
  "火属性伤害加成 (%)": { base: 2.0, max: 30.0, unit: '%', allowedSlots: [5] },
  "冰属性伤害加成 (%)": { base: 2.0, max: 30.0, unit: '%', allowedSlots: [5] },
  "电属性伤害加成 (%)": { base: 2.0, max: 30.0, unit: '%', allowedSlots: [5] },
  "以太伤害加成 (%)": { base: 2.0, max: 30.0, unit: '%', allowedSlots: [5] },
  "穿透率 (%)": { base: 1.6, max: 24.0, unit: '%', allowedSlots: [5] },
  "能量自动回复 (%)": { base: 4.0, max: 60.0, unit: '%', allowedSlots: [6] },
  "异常掌控 (%)": { base: 2.0, max: 30.0, unit: '%', allowedSlots: [6] },
  "冲击力 (%)": { base: 1.2, max: 18.0, unit: '%', allowedSlots: [6] },
};

/** 副词条配置 */
const SUB_STATS_CONFIG: Record<string, { base: number; unit: string }> = {
  "固定攻击力": { base: 19, unit: '' },
  "攻击力 (%)": { base: 3.0, unit: '%' },
  "固定生命值": { base: 112, unit: '' },
  "生命值 (%)": { base: 3.0, unit: '%' },
  "固定防御力": { base: 15, unit: '' },
  "防御力 (%)": { base: 4.8, unit: '%' },
  "暴击率 (%)": { base: 2.4, unit: '%' },
  "暴击伤害 (%)": { base: 4.8, unit: '%' },
  "异常精通": { base: 9, unit: '' },
  "穿透值": { base: 9, unit: '' },
};

/**
 * 计算副词条数值
 * @param name - 副词条名称
 * @param hits - 强化次数
 * @returns 数值
 */
const calcSubStatValue = (name: string, hits: number): number => {
  const config = SUB_STATS_CONFIG[name];
  if (!config) return 0;
  const value = config.base * (1 + hits);
  return config.unit === '%' ? Math.round(value * 10) / 10 : Math.round(value);
};

/**
 * 计算主词条数值
 * @param name - 主词条名称
 * @param level - 等级
 * @returns 数值
 */
const calcMainStatValue = (name: string, level: number): number => {
  const config = MAIN_STATS_CONFIG[name];
  if (!config) return 0;
  const value = config.base + (config.max - config.base) * (level / 15);
  return config.unit === '%' ? Math.round(value * 10) / 10 : Math.round(value);
};

/** 默认添加编辑器数据 */
const DEFAULT_ADD_DATA: DriveEditorData = {
  setName: '啄木鸟电音',
  slot: 1,
  level: 15,
  mainStatName: '固定生命值',
  subStats: [],
};

/**
 * DriveManager — 驱动盘仓库管理页面
 *
 * 页面结构：
 * - 页头：标题 + 已入库数量
 * - 添加驱动盘面板（DriveEditor, mode="add"）
 * - 筛选栏（DriveFilters）
 * - 驱动盘卡片网格（DriveCard 列表）
 * - 编辑弹窗（Modal + DriveEditor, mode="edit"）
 *
 * @returns JSX 元素
 */
export function DriveManager() {
  const [warehouse, setWarehouse] = useState<DriveDisc[]>([]);
  const [slotFilter, setSlotFilter] = useState<number | 'ALL'>('ALL');
  const [setFilter, setSetFilter] = useState<string | 'ALL'>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);

  /** 当前编辑的驱动盘数据 */
  const editingDisc = useMemo(() => {
    if (!editingId) return null;
    return warehouse.find(d => d.id === editingId) || null;
  }, [editingId, warehouse]);

  // 加载数据
  useEffect(() => {
    setWarehouse(storage.getDriveDiscs());
  }, []);

  /** 预设排序映射（用于按预设顺序排序） */
  const presetOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    DRIVE_DISC_PRESETS.forEach((preset, index) => {
      map.set(preset.name, index);
    });
    return map;
  }, []);

  /**
   * 添加驱动盘
   * @param data - 编辑器数据
   */
  const handleAddSubmit = (data: DriveEditorData) => {
    const finalSubStats: DriveDiscSubStat[] = data.subStats.map(sub => ({
      name: sub.name,
      hits: sub.hits,
      value: calcSubStatValue(sub.name, sub.hits),
    }));

    const newDisc: DriveDisc = {
      id: '',
      setName: data.setName,
      slot: data.slot,
      mainStatName: data.mainStatName,
      level: data.level,
      mainStatValue: calcMainStatValue(data.mainStatName, data.level),
      subStats: finalSubStats,
    };

    storage.saveDriveDisc(newDisc);
    setWarehouse(storage.getDriveDiscs());
  };

  /**
   * 编辑驱动盘
   * @param data - 编辑器数据
   */
  const handleEditSubmit = (data: DriveEditorData) => {
    if (!editingId) return;

    const finalSubStats: DriveDiscSubStat[] = data.subStats.map(sub => ({
      name: sub.name,
      hits: sub.hits,
      value: calcSubStatValue(sub.name, sub.hits),
    }));

    const updatedDisc: DriveDisc = {
      id: editingId,
      setName: data.setName,
      slot: data.slot,
      mainStatName: data.mainStatName,
      level: data.level,
      mainStatValue: calcMainStatValue(data.mainStatName, data.level),
      subStats: finalSubStats,
    };

    storage.saveDriveDisc(updatedDisc);
    setWarehouse(storage.getDriveDiscs());
    setEditingId(null);
  };

  /**
   * 打开编辑面板
   * @param disc - 要编辑的驱动盘
   */
  const handleEditInit = (disc: DriveDisc) => {
    setEditingId(disc.id);
  };

  /** 关闭编辑面板 */
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  /**
   * 删除驱动盘
   * @param id - 驱动盘 ID
   * @param e - 鼠标事件
   */
  const handleDeleteDisc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要从你的仓库中删除这个驱动盘吗？此操作无法撤销。')) {
      storage.deleteDriveDisc(id);
      setWarehouse(storage.getDriveDiscs());
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  /** 筛选 + 排序后的驱动盘列表 */
  const sortedAndFilteredDiscs = useMemo(() => {
    return warehouse
      .filter(disc => {
        const matchesSlot = slotFilter === 'ALL' || disc.slot === slotFilter;
        const matchesSet = setFilter === 'ALL' || disc.setName === setFilter;
        return matchesSlot && matchesSet;
      })
      .sort((a, b) => {
        const orderA = presetOrderMap.get(a.setName) ?? 999;
        const orderB = presetOrderMap.get(b.setName) ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        if (a.slot !== b.slot) return a.slot - b.slot;
        const timeA = a.updated_at || '';
        const timeB = b.updated_at || '';
        return timeB.localeCompare(timeA);
      });
  }, [warehouse, slotFilter, setFilter, presetOrderMap]);

  /** 可用的套装筛选列表 */
  const availableFilterSets = useMemo(() => {
    const list = Array.from(new Set(warehouse.map(w => w.setName))) as string[];
    return list.sort((a, b) => a.localeCompare(b));
  }, [warehouse]);

  /** 编辑模式的初始数据 */
  const editInitialData = useMemo((): DriveEditorData => {
    if (!editingDisc) return DEFAULT_ADD_DATA;
    return {
      setName: editingDisc.setName,
      slot: editingDisc.slot,
      level: editingDisc.level,
      mainStatName: editingDisc.mainStatName,
      subStats: editingDisc.subStats.map(s => ({ name: s.name, hits: s.hits })),
    };
  }, [editingDisc]);

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 nm-raised rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zzz-orange text-white nm-orange-raised-interactive">
              <Disc size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-800 tracking-tight">驱动盘仓库</h2>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                维护专属于你的驱动盘仓库
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-zinc-500 font-mono font-bold p-3 rounded-xl">
          <div className="text-center px-1">
            <span className="block text-lg font-black text-zzz-orange">{warehouse.length}</span>
            <span>已入库</span>
          </div>
        </div>
      </div>

      {/* 添加驱动盘 */}
      <DriveEditor
        mode="add"
        initialData={DEFAULT_ADD_DATA}
        onSubmit={handleAddSubmit}
        standalone
      />

      {/* 保存列表 */}
      <div className="flex flex-col gap-6 nm-raised rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
            <FolderOpen size={20} className="text-zinc-600" />
            所有保存的驱动盘
          </h2>
        </div>

        {/* 筛选 */}
        <DriveFilters
          slotFilter={slotFilter}
          onSlotFilterChange={setSlotFilter}
          setFilter={setFilter}
          onSetFilterChange={setSetFilter}
          availableSets={availableFilterSets}
        />

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-5 xl:grid-cols-5 gap-6">
          <AnimatePresence mode="popLayout">
            {sortedAndFilteredDiscs.map((disc) => (
              <DriveCard
                key={disc.id}
                disc={disc}
                mainStatsConfig={MAIN_STATS_CONFIG}
                subStatsConfig={SUB_STATS_CONFIG}
                onEdit={handleEditInit}
                onDelete={handleDeleteDisc}
              />
            ))}
          </AnimatePresence>

          {sortedAndFilteredDiscs.length === 0 && (
            <div className="sm:col-span-5 xl:col-span-5 text-center py-16 px-4 nm-sunken rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-zinc-200 rounded-full text-zinc-400">
                <Disc size={28} className="animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-sm font-black text-zinc-700">未发现匹配的驱动盘</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  目前在你的驱动盘仓库中不包含符合所选过滤标签的驱动盘
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 编辑弹窗 */}
      <Modal isOpen={!!editingId} onClose={handleCancelEdit}>
        <div className="flex items-center justify-between pb-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-zzz-orange text-white rounded-lg shadow-sm">
              <Disc size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-800">编辑驱动盘</h3>
            </div>
          </div>
          <button
            onClick={handleCancelEdit}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {editingDisc && (
          <DriveEditor
            mode="edit"
            initialData={editInitialData}
            onSubmit={handleEditSubmit}
            onCancel={handleCancelEdit}
          />
        )}
      </Modal>
    </div>
  );
}