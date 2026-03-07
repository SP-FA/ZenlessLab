import React from 'react';
import { Save, Trash2, FolderOpen, Plus } from 'lucide-react';
import { MdAccessible, MdAccessibleForward } from 'react-icons/md';

export const Docs: React.FC = () => {
  return (
    <div className="prose prose-invert max-w-none p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
      <div className="w-full bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50">
      <div className="mb-8" align="center">
        <h2 className="text-[30px] font-bold text-zinc-100 mb-2">使用指南</h2>
        <p className="text-sm text-zinc-500">本工具旨在通过精确数值计算帮助各位绳匠找到当前角色提升最大的词条方向，以更好的培养角色</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-[20px] font-bold text-zinc-100 flex items-center gap-2">
            1. 档案管理
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            a. 在 “角色档案” 面板中输入角色名称、类型（强攻、异常、命破）及各项基础数值
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            b. 点击 <Save className="inline text-zzz-orange" size={18} /> 将档案存入本地数据库
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            c. 点击 <FolderOpen className="inline text-zzz-orange" size={18} /> 可随时调取已保存的角色数据
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            d. 点击 <Plus className="inline text-zzz-orange" size={18} /> 可创建新的角色档案
          </h2>
        </div>
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-[20px] font-bold text-zinc-100 flex items-center gap-2">
            2. 数值输入说明
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            a. 白值：<span className="font-medium">角色基础属性（如攻击力白值=角色基础攻击力+音擎大攻击力词条）</span>
          </h2>
          <h2 className="pl-27 pt-3 text-[18px]">
            可通过 “绝区零工坊” 等微信小程序中的角色练度面板直接查看角色白值
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            b. 战前：<span className="font-medium">局外面板显示的加成（如音擎、驱动盘固定属性）</span>
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            c. 战后：<span className="font-medium">局内战斗触发的加成（如音擎效果、驱动盘4件套效果、队友核心技加成）</span>
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            d. 百分比数值：<span className="font-medium">直接输入数字（如 50 代表 50%），系统会自动转换</span>
          </h2>
        </div>
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-[20px] font-bold text-zinc-100 flex items-center gap-2">
            3. 收益计算
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            a. 在 “<MdAccessibleForward size={20} className="inline text-zzz-orange" />词条提升值” 区域输入你计划提升的数值，系统会自动计算该提升相对于当前总伤害的收益
          </h2>
          <h2 className="pl-13 pt-3 text-[18px]">
          收益越高，说明该词条在当前面板下的性价比越高
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            b. 边际收益曲线展示了在当前面板下，每额外投入一个 “标准单位” 词条所带来的伤害提升百分比
          </h2>
          <h2 className="pl-13 pt-3 text-[18px]">
            多数属性的 “标准单位” 即为驱动盘的副词条，因此该曲线直观展示了提升哪些副词条带来的收益更高
          </h2>
        </div>
      </div>
    </div>
    </div>
  );
};
