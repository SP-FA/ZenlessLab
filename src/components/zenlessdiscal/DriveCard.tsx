/**
 * @file DriveCard.tsx
 * @description 驱动盘卡片展示组件（Zenless Discal 专属）。
 *
 * 纯展示组件，渲染单个驱动盘的信息卡片：
 * - 套装缩略图 + 颜色条
 * - 槽位 + 等级标签
 * - 主词条名称 + 数值
 * - 副词条列表（名称 + 强化点数 + 数值）
 * - 编辑/删除操作按钮
 */

import React from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2 } from 'lucide-react';
import { DriveDisc, DriveDiscSubStat } from '../../types';
import { DRIVE_DISC_PRESETS } from '../../utils/presets';

/** 主词条配置类型 */
interface MainStatConfig {
  unit: string;
}

/** DriveCard 组件 Props */
interface DriveCardProps {
  /** 驱动盘数据 */
  disc: DriveDisc;
  /** 主词条配置映射 */
  mainStatsConfig: Record<string, MainStatConfig>;
  /** 副词条配置映射 */
  subStatsConfig: Record<string, { unit: string }>;
  /**
   * 编辑按钮点击回调
   * @param disc - 被点击的驱动盘
   */
  onEdit: (disc: DriveDisc) => void;
  /**
   * 删除按钮点击回调
   * @param id - 驱动盘 ID
   * @param e - 鼠标事件
   */
  onDelete: (id: string, e: React.MouseEvent) => void;
}

/**
 * DriveCard — 驱动盘卡片
 *
 * 展示单个驱动盘的完整信息，支持编辑和删除操作。
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const DriveCard: React.FC<DriveCardProps> = ({
  disc,
  mainStatsConfig,
  subStatsConfig,
  onEdit,
  onDelete,
}) => {
  const preset = DRIVE_DISC_PRESETS.find(p => p.name === disc.setName) || { color: '#888888', image: undefined };
  const isMainPct = mainStatsConfig[disc.mainStatName]?.unit === '%';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      key={disc.id}
      className="nm-raised rounded-2xl p-5 flex flex-col gap-4 relative cursor-pointer select-none group overflow-hidden"
    >
      {/* Color strip indicating preset type */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5"
        style={{ backgroundColor: preset.color }}
      />

      {/* Top Block: Title, Slot representation */}
      <div className="flex gap-4 items-center">
        {/* Preset image display */}
        <div className="relative shrink-0" style={{ width: 60, height: 60 }}>
          <div className="h-full w-full overflow-hidden rounded-full bg-zinc-200" style={{ boxShadow: `inset 0 0 0 2px ${preset.color}` }}>
            {preset.image ? (
              <img src={preset.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[8px] font-black text-zinc-400">图片</div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-black text-zinc-800 line-clamp-1">
            {disc.setName}
          </span>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="bg-zinc-800 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide shadow-sm">
              {disc.slot}
            </span>
            <span className="text-[10px] font-black text-zzz-orange bg-zzz-orange/10 px-2 py-0.5 rounded-md font-mono">
              Lv.{disc.level}
            </span>
          </div>
        </div>
      </div>

      {/* Main stats displays */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex justify-center items-center py-2 rounded-lg nm-raised text-xs">
          <span className="font-black font-mono text-zinc-800">
            {disc.mainStatName} +{disc.mainStatValue}{isMainPct ? '%' : ''}
          </span>
        </div>

        {/* Sub stats displaying */}
        <div className="space-y-1.5 mt-1">
          <div className="grid grid-cols-1 gap-1.5 pt-2">
            {disc.subStats.map((sub, sIdx) => {
              const subUnit = subStatsConfig[sub.name]?.unit || '';
              return (
                <div key={sIdx} className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-zinc-500 font-sans flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    {sub.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, dIdx) => (
                        <span
                          key={dIdx}
                          className={`w-1 h-1 rounded-full ${
                            dIdx < sub.hits ? 'bg-zzz-orange' : 'bg-zinc-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-zinc-700 font-black">
                      +{sub.value}{subUnit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions overlay footer */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(disc);
          }}
          className="p-1.5 rounded text-zinc-400 hover:text-zzz-orange hover:bg-zinc-100 transition-colors"
          title="编辑属性"
        >
          <Edit2 size={13} />
        </button>
        <button
          type="button"
          onClick={(e) => onDelete(disc.id, e)}
          className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="废弃盘片"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
};