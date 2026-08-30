/**
 * @file DriveEditor.tsx
 * @description 驱动盘编辑器组件（Zenless Discal 专属）。
 *
 * 统一的驱动盘编辑面板，同时支持"添加"和"编辑"两种模式。
 * 消除了原 DriveManager 中 add/edit 两套状态和逻辑的重复。
 *
 * 包含以下子模块：
 * - 套装选择器（从预设列表中选择）
 * - 套装效果展示（2件套/4件套效果）
 * - 槽位选择（1-6）
 * - 等级滑条（0-15）
 * - 主词条选择（根据槽位动态过滤可用选项）
 * - 副词条管理（最多4条，每条含名称选择 + 强化次数滑条）
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, ChevronRight } from 'lucide-react';
import { DriveDisc, DriveDiscSubStat } from '../../types';
import { DRIVE_DISC_PRESETS, DriveDiscPreset } from '../../utils/presets';
import { NeoSelect } from '../shared/NeoSelect';

// ====================== 游戏数据配置 ======================

/** 主词条配置：基础值、最大值、单位、可用槽位 */
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

/** 副词条配置：基础值（平均满强化值）、单位 */
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

// ====================== 工具函数 ======================

/**
 * 根据槽位获取可选的主词条列表
 * @param slot - 槽位号 (1-6)
 * @returns 主词条名称列表
 */
const getMainStatsForSlot = (slot: number): string[] => {
  return Object.keys(MAIN_STATS_CONFIG).filter(stat =>
    MAIN_STATS_CONFIG[stat].allowedSlots.includes(slot)
  );
};

/**
 * 计算主词条在指定等级下的数值
 * @param name - 主词条名称
 * @param level - 驱动盘等级 (0-15)
 * @returns 计算后的数值（四舍五入）
 */
const calcMainStatValue = (name: string, level: number): number => {
  const config = MAIN_STATS_CONFIG[name];
  if (!config) return 0;
  const value = config.base + (config.max - config.base) * (level / 15);
  return config.unit === '%' ? Math.round(value * 10) / 10 : Math.round(value);
};

/**
 * 计算副词条在指定强化次数下的数值
 * @param name - 副词条名称
 * @param hits - 强化次数 (0-5)
 * @returns 计算后的数值
 */
const calcSubStatValue = (name: string, hits: number): number => {
  const config = SUB_STATS_CONFIG[name];
  if (!config) return 0;
  const value = config.base * (1 + hits);
  return config.unit === '%' ? Math.round(value * 10) / 10 : Math.round(value);
};

// ====================== 组件 ======================

/** 驱动盘编辑器初始数据 */
export interface DriveEditorData {
  setName: string;
  slot: number;
  level: number;
  mainStatName: string;
  subStats: Omit<DriveDiscSubStat, 'value'>[];
}

/** DriveEditor 组件 Props */
interface DriveEditorProps {
  /** 编辑器模式 */
  mode: 'add' | 'edit';
  /** 初始数据 */
  initialData: DriveEditorData;
  /**
   * 提交回调
   * @param data - 编辑完成的驱动盘数据
   */
  onSubmit: (data: DriveEditorData) => void;
  /**
   * 取消回调（仅 edit 模式）
   */
  onCancel?: () => void;
  /** 是否显示为独立面板（含标题） */
  standalone?: boolean;
}

/** 默认编辑器数据 */
const DEFAULT_EDITOR_DATA: DriveEditorData = {
  setName: '啄木鸟电音',
  slot: 1,
  level: 15,
  mainStatName: '固定生命值',
  subStats: [],
};

/**
 * DriveEditor — 驱动盘编辑器
 *
 * 统一的添加/编辑面板，包含：
 * - 套装选择器（网格布局，含缩略图 + 颜色条）
 * - 套装效果折叠面板
 * - 槽位选择（1-6 按钮组）
 * - 等级滑条（0-15）
 * - 主词条选择（根据槽位动态过滤）
 * - 副词条管理（最多 4 条）
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const DriveEditor: React.FC<DriveEditorProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  standalone = false,
}) => {
  const [setName, setSetName] = useState(initialData.setName);
  const [slot, setSlot] = useState(initialData.slot);
  const [level, setLevel] = useState(initialData.level);
  const [mainStatName, setMainStatName] = useState(initialData.mainStatName);
  const [subStats, setSubStats] = useState<Omit<DriveDiscSubStat, 'value'>[]>(initialData.subStats);
  const [isEffectOpen, setIsEffectOpen] = useState(false);

  // 同步外部 initialData 变化（编辑模式下打开不同驱动盘时）
  useEffect(() => {
    setSetName(initialData.setName);
    setSlot(initialData.slot);
    setLevel(initialData.level);
    setMainStatName(initialData.mainStatName);
    setSubStats(initialData.subStats);
  }, [initialData]);

  // 切换槽位时自动更新主词条
  useEffect(() => {
    const validStats = getMainStatsForSlot(slot);
    if (!validStats.includes(mainStatName)) {
      setMainStatName(validStats[0]);
    }
  }, [slot, mainStatName]);

  /** 当前选中的套装预设 */
  const currentPreset = useMemo(() => {
    return DRIVE_DISC_PRESETS.find(p => p.name === setName) || DRIVE_DISC_PRESETS[0];
  }, [setName]);

  /** 计算后的主词条数值 */
  const computedMainValue = useMemo(() => {
    return calcMainStatValue(mainStatName, level);
  }, [mainStatName, level]);

  /**
   * 获取指定索引位置可用的副词条选项（排除已选）
   * @param currentIndex - 当前副词条索引
   * @returns 可用的副词条名称列表
   */
  const getAvailableSubStats = (currentIndex: number): string[] => {
    const selectedNames = subStats
      .map((s, idx) => idx !== currentIndex ? s.name : '')
      .filter(Boolean);
    return Object.keys(SUB_STATS_CONFIG).filter(name => !selectedNames.includes(name));
  };

  /** 添加副词条 */
  const handleAddSubStat = () => {
    if (subStats.length >= 4) return;
    const currentNames = subStats.map(s => s.name);
    const firstAvailable = Object.keys(SUB_STATS_CONFIG).find(name => !currentNames.includes(name));
    if (firstAvailable) {
      setSubStats([...subStats, { name: firstAvailable, hits: 0 }]);
    }
  };

  /** 移除副词条 */
  const handleRemoveSubStat = (index: number) => {
    setSubStats(subStats.filter((_, i) => i !== index));
  };

  /** 更新副词条 */
  const handleSubStatChange = (index: number, fields: Partial<Omit<DriveDiscSubStat, 'value'>>) => {
    setSubStats(subStats.map((item, i) => (i === index ? { ...item, ...fields } : item)));
  };

  /** 提交表单 */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ setName, slot, level, mainStatName, subStats });
    // add 模式下重置表单
    if (mode === 'add') {
      setSlot(1);
      setLevel(15);
      setMainStatName('固定生命值');
      setSubStats([]);
    }
  };

  const editorContent = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* 左侧：套装选择器 */}
      <div className="lg:col-span-5 flex flex-col gap-4 nm-raised rounded-xl p-5">
        <span className="text-xs font-black text-zinc-600">
          {mode === 'add' ? '选择套装' : '修改套装'}
        </span>
        <div className="grid grid-cols-2 gap-2 overflow-y-auto select-none custom-scrollbar max-h-[520px] p-3.5 nm-sunken rounded-xl">
          {DRIVE_DISC_PRESETS.map((preset) => {
            const isActive = setName === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => setSetName(preset.name)}
                className={`relative flex min-w-0 items-center gap-2.5 rounded-xl m-1 p-2.5 text-left transition-all ${
                  isActive ? 'nm-raised-active' : 'nm-raised-interactive'
                }`}
              >
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-200" style={{ boxShadow: `inset 0 0 0 2px ${preset.color}` }}>
                  {preset.image ? (
                    <img src={preset.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] font-black text-zinc-400">图片</div>
                  )}
                </div>
                <span className="min-w-0 text-xs font-black text-zinc-800 line-clamp-2">{preset.name}</span>
                {isActive && <span className="absolute inset-y-3 left-0 w-1 rounded-r" style={{ backgroundColor: preset.color }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 右侧：属性编辑 */}
      <div className="lg:col-span-7 p-5 rounded-xl flex flex-col gap-4 nm-raised">
        {/* 套装效果 */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-zinc-600 uppercase">驱动盘属性</span>
          <button type="button" onClick={() => setIsEffectOpen(!isEffectOpen)} className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 hover:text-zinc-800">
            套装效果
            <ChevronRight size={12} className={`transition-transform ${isEffectOpen ? 'rotate-90' : ''}`} />
          </button>
        </div>
        {isEffectOpen &&
          <div className="rounded-lg border border-zinc-300 px-3 py-2.5 text-[11px] leading-relaxed text-zinc-600">
            <p><strong className="text-zinc-700">2件套：</strong>{currentPreset.twoPieceEffect}</p>
            <p><strong className="text-zinc-700">4件套：</strong>{currentPreset.fourPieceEffect}</p>
          </div>
        }

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 槽位 + 等级 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end px-1 py-3">
            <div className="md:col-span-6">
              <label className="block text-[10px] font-black text-zinc-400 mb-1.5">槽位</label>
              <div className="grid grid-cols-6 gap-1">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button key={num} type="button" onClick={() => setSlot(num)}
                    className={`py-1.5 rounded-lg text-xs font-black font-mono transition-all ${slot === num ? 'text-white bg-zzz-orange' : 'text-zinc-500 hover:bg-zinc-200'}`}
                  >{num}</button>
                ))}
              </div>
            </div>
            <div className="md:col-span-6">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-black text-zinc-400">等级</label>
                <span className="text-xs font-black font-mono text-zzz-orange bg-zzz-orange/10 px-2 py-0.5 rounded-md">+ {level}</span>
              </div>
              <div className="h-[26px] flex items-center mt-2">
                <input type="range" min="0" max="15" step="1" value={level} onChange={(e) => setLevel(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-zzz-orange" />
              </div>
            </div>
          </div>

          {/* 主词条 */}
          <div className="p-4 nm-sunken rounded-xl">
            <span className="block text-xs font-black text-zinc-500 mb-2">主词条</span>
            <div className="grid grid-cols-1 gap-2">
              <NeoSelect
                value={mainStatName}
                onValueChange={(name) => setMainStatName(name as string)}
                buttonClassName="text-xs font-bold"
                options={getMainStatsForSlot(slot).map(stat => ({ value: stat, label: stat }))}
                ariaLabel="主词条"
              />
              <div className="mt-1 flex items-center justify-between text-zinc-700 p-3 rounded-lg text-xs nm-raised">
                <span className="font-bold text-zinc-700">主词条最终结果</span>
                <span className="font-black font-mono text-zinc-800">+{computedMainValue}{MAIN_STATS_CONFIG[mainStatName]?.unit}</span>
              </div>
            </div>
          </div>

          {/* 副词条 */}
          <div className="flex flex-col gap-3 nm-sunken rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="block text-xs font-black text-zinc-500">副词条</span>
              {subStats.length < 4 &&
                <button type="button" onClick={handleAddSubStat}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-zzz-orange nm-raised-interactive">
                  <Plus size={10} />新增副词条
                </button>
              }
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {subStats.map((sub, idx) => {
                const unit = SUB_STATS_CONFIG[sub.name]?.unit || '';
                const value = calcSubStatValue(sub.name, sub.hits);
                return (
                  <div key={idx} className="p-3 nm-raised rounded-xl flex flex-col relative">
                    <div className="flex items-center gap-2">
                      <NeoSelect
                        value={sub.name}
                        onValueChange={(name) => handleSubStatChange(idx, { name: name as string })}
                        className="min-w-0 flex-1"
                        buttonClassName="min-h-0 bg-transparent text-xs font-bold shadow-none hover:shadow-none"
                        menuClassName="min-w-[10rem]"
                        options={getAvailableSubStats(idx).map(opt => ({ value: opt, label: opt }))}
                        ariaLabel={`副词条 ${idx + 1}`}
                      />
                      <button type="button" onClick={() => handleRemoveSubStat(idx)}
                        className="nm-del-raised-interactive hover:text-red-500 hover:bg-red-100"
                        aria-label={`删除副词条 ${idx + 1}`} title="删除副词条">
                        <X size={13} />
                      </button>
                    </div>
                    <div className="p-2 rounded-lg mt-1 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-zinc-500 font-sans">
                          强化: <strong className="text-zzz-orange font-black">+{sub.hits}</strong>
                        </span>
                        <span className="text-zinc-800 font-black text-xs">+{value}{unit}</span>
                      </div>
                      <input type="range" min="0" max="5" step="1" value={sub.hits}
                        onChange={(e) => handleSubStatChange(idx, { hits: parseInt(e.target.value) })}
                        className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-zinc-700" />
                    </div>
                  </div>
                );
              })}
              {subStats.length === 0 && (
                <div className="col-span-2 text-center py-5 text-xs text-zinc-400">未添加副词条。请点击右上角进行添加。</div>
              )}
            </div>
          </div>

          {/* 提交按钮 */}
          {mode === 'edit' ? (
            <div className="flex gap-3 border-t border-zinc-200/50">
              <button type="button" onClick={onCancel}
                className="flex-1 py-3 rounded-xl text-xs font-black text-zinc-600 nm-raised-interactive flex items-center justify-center gap-2">
                取消修改
              </button>
              <button type="submit"
                className="flex-1 py-3 rounded-xl text-xs font-black text-white bg-zzz-orange nm-orange-raised-interactive flex items-center justify-center gap-2 shadow-md hover:brightness-105">
                确认修改
              </button>
            </div>
          ) : (
            <button type="submit"
              className="w-full py-3 rounded-xl text-xs nm-orange-raised-interactive flex items-center justify-center gap-2 shadow-md hover:brightness-105 mt-2">
              <Plus size={14} />
              确认配置并保存
            </button>
          )}
        </form>
      </div>
    </div>
  );

  if (standalone) {
    return (
      <div className="nm-raised rounded-2xl p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
          <Plus size={20} className="text-zzz-orange" />
          {mode === 'add' ? '添加驱动盘' : '编辑驱动盘'}
        </h2>
        {editorContent}
      </div>
    );
  }

  return editorContent;
};