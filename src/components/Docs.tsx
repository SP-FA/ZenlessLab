import React from 'react';
import { Save, Trash2, FolderOpen, Plus, Sparkles, HelpCircle, Compass } from 'lucide-react';

export const Docs: React.FC = () => {
  return (
    <div className="w-full nm-raised p-8 rounded-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-zinc-800 mb-2 flex items-center justify-center gap-2">
          <HelpCircle size={22} className="text-zzz-orange" />
          使用指南
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          通过精确数值计算，实时分析各种词条加成在当前面板下的伤害变动与边际收益，辅助高效的装备和词条分配
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="p-6 nm-sunken rounded-xl border border-zinc-200/10">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-4">
            <div className="w-1.5 h-3.5 bg-zzz-orange rounded-full"></div>
            档案与配队管理
          </h3>
          <ul className="space-y-3.5 text-xs text-zinc-650 pl-2 leading-relaxed">
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">01.</span>
              <span className="flex items-center gap-1.5">
                在<b>【</b><FolderOpen size={12} className="text-zzz-orange"/><b>角色档案管理】</b>中输入角色名、定位类型（强攻、异常、命破）
              </span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">02.</span>
              <span className="flex items-center gap-1.5">
                在<b>【</b><Compass size={12} className="text-zzz-orange"/><b>角色基础数值】</b>中输入当前角色的面板（包括音擎效果、队友 buff 等，越贴合实战越好）
              </span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">03.</span>
              <span className="flex items-center gap-1.5">
                点击 <span className="p-1 nm-raised text-zzz-orange rounded"><Save size={12} className="inline" /></span> 将角色数据保存在本地
              </span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">04.</span>
              <span className="flex items-center gap-1.5">
                点击 <span className="p-1 nm-raised text-zzz-orange rounded"><FolderOpen size={12} className="inline" /></span> 调取已保存的角色数据
              </span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-zzz-orange font-bold font-mono">05.</span>
              <span className="flex items-center gap-1.5">
                点击 <span className="p-1 nm-raised text-zzz-orange rounded"><Plus size={12} className="inline" /></span> 创建新的角色档案
              </span>
            </li>
          </ul>
        </div>

        <div className="p-6 nm-sunken rounded-xl border border-zinc-200/10">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-4">
            <div className="w-1.5 h-3.5 bg-zzz-orange rounded-full"></div>
            数值输入规范
          </h3>
          <ul className="space-y-3.5 text-xs text-zinc-650 pl-2 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-zzz-orange font-bold font-mono">01.</span>
              <span><b>白值：</b>角色基础属性（如攻击力白值=角色基础攻击力+音擎大攻击力词条）。可通过 “绝区零工坊” 等微信小程序中的角色练度面板直接查看角色白值</span>
            </li>
            <li className="flex gap-2">
              <span className="text-zzz-orange font-bold font-mono">02.</span>
              <span><b>战前：</b>局外面板显示的加成（如音擎、驱动盘固定属性）</span>
            </li>
            <li className="flex gap-2">
              <span className="text-zzz-orange font-bold font-mono">03.</span>
              <span><b>战后：</b>局内战斗触发的加成（如音擎效果、驱动盘4件套效果、队友核心技加成）</span>
            </li>
            <li className="flex gap-2">
              <span className="text-zzz-orange font-bold font-mono">04.</span>
              <span><b>百分比数值：</b>直接输入数字（如 50 代表 50%），系统会自动转换</span>
            </li>
          </ul>
        </div>

        <div className="p-6 nm-sunken rounded-xl border border-zinc-200/10">
          <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-4">
            <div className="w-1.5 h-3.5 bg-zzz-orange rounded-full"></div>
            收益计算
          </h3>
          <ul className="space-y-3.5 text-xs text-zinc-650 pl-2 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-zzz-orange font-bold font-mono">01.</span>
              <span className="flex items-center gap-1.5">
                在<b>【</b><Sparkles size={12} className="text-zzz-orange" /><b> 词条提升值】</b>中，输入你计划提升的数值，系统会自动计算该提升相对于当前总伤害的收益。收益越高，说明该词条在当前面板下的性价比越高
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-zzz-orange font-bold font-mono">02.</span>
              <span><b>【边际收益曲线】</b>展示了每额外投入一个单位词条所带来的伤害提升百分比。多数属性的单位数值为驱动盘副词条，因此曲线展示了提升哪些副词条带来的收益更高</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
