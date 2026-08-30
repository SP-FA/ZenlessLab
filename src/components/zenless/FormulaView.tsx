/**
 * @file FormulaView.tsx
 * @description 伤害计算公式展示页面（Zenless Lab 专属）。
 *
 * 以可视化卡片形式展示绝区零伤害计算的核心公式体系：
 * - 基础乘区（攻击区、生命区、增伤区、抗性区、贯穿力）
 * - 防御区（基础防御力、敌人防御力、防御乘区）
 * - 各职业最终期望公式（强攻、异常、命破）
 * - 词条收益计算公式
 */

import React from 'react';
import { Binary, Shield, Compass, Swords, HelpCircle } from 'lucide-react';

/**
 * FormulaView — 计算公式展示页面
 *
 * 结构：
 * - 基础乘区（5 个公式卡片）
 * - 防御区（3 个公式卡片）
 * - 各职业最终期望公式（3 个卡片）
 * - 词条收益计算说明
 *
 * @returns JSX 元素
 */
export const FormulaView: React.FC = () => {
  return (
    <div className="w-full nm-raised p-8 rounded-2xl">
      <div className="mb-10 text-center">
        <h2 className="text-xl font-bold text-zinc-800 flex items-center justify-center gap-2 mb-2">
          <Binary size={20} className="text-zzz-orange" />
          核心计算公式
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          本工具严格遵循以下公式进行伤害期望与收益计算
        </p>
      </div>

      <div>
        <div className="mb-5 p-6 nm-sunken rounded-2xl flex flex-col gap-6">
          <h3 className="text-x font-bold text-zinc-800 block flex items-center gap-1.5">
            <Swords size={17} className="text-zzz-orange" />
            基础乘区
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col p-6 nm-raised rounded-xl gap-1.5">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-zzz-orange rounded-full"></div>
                基础攻击区
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                (<span className="font-bold">攻击力白值</span> &times; (1 + <span className="text-[#f37f0f] font-bold">战前大攻击%</span>) + <span className="text-[#ffba04] font-bold">战前小攻击</span>) &times; (1 + <span className="text-[#f35f0f] font-bold">战后大攻击%</span>) + <span className="text-[#ff9a04] font-bold">战后小攻击</span>
              </div>
            </div>
            <div className="flex flex-col p-6 nm-raised rounded-xl gap-1.5">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-zzz-orange rounded-full"></div>
                基础生命区
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                (<span className="font-bold">生命值白值</span> &times; (1 + <span className="text-[#f37f0f] font-bold">战前大生命%</span>) + <span className="text-[#ffba04] font-bold">战前小生命</span>) &times; (1 + <span className="text-[#f35f0f] font-bold">战后大生命%</span>) + <span className="text-[#ff9a04] font-bold">战后小生命</span>
              </div>
            </div>
            <div className="flex flex-col p-6 nm-raised rounded-xl gap-1.5">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full"></div>
                增伤区
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                1 + <span className="text-[#8b5cf6] font-bold">增伤%</span>
                <div className="text-[10px] text-zinc-550 mt-2 font-sans">
                  * 包括伤害提升、伤害加成、属性伤害加成
                </div>
              </div>
            </div>
            <div className="flex flex-col p-6 nm-raised rounded-xl gap-1.5">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#ec4899] rounded-full"></div>
                抗性区
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                1 + <span className="text-[#ec4899] font-bold">减抗%</span> - 敌人抗性%
              </div>
            </div>
            <div className="flex flex-col p-6 nm-raised rounded-xl gap-1.5">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-zzz-orange rounded-full"></div>
                贯穿力
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                0.3 &times; <span className="font-bold">基础攻击区</span> + 0.1 &times; <span className="font-bold">基础生命区</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 p-6 nm-sunken rounded-2xl flex flex-col gap-6">
          <h3 className="text-x font-bold text-zinc-800 block flex items-center gap-1.5">
            <Shield size={17} className="text-zzz-orange" />
            防御区
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 nm-raised rounded-xl">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-zzz-orange rounded-full"></div>
                基础防御力
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                <span className="font-bold">标准等级基数</span> &times; <span className="font-bold">防御参数</span> / 50
                <div className="text-[10px] text-zinc-550 mt-2 font-sans">
                  * 默认角色等级60，敌人等级60+，所以标准等级基数取 794，防御参数取 60
                </div>
              </div>
            </div>
            <div className="p-6 nm-raised rounded-xl">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-zzz-orange rounded-full"></div>
                敌人防御力
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                <span className="font-bold">基础防御力</span> &times; (1 + 敌人防御加成% - <span className="text-[#06b6d4] font-bold">减防%</span>) + 固定防御
                <div className="text-[10px] text-zinc-550 mt-2 font-sans">
                  * 计算减防收益时，减防按 100% 封顶；超过 100% 的部分不再提供额外收益
                </div>
              </div>
            </div>
            <div className="p-6 nm-raised rounded-xl">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full"></div>
                防御区
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                <span className="font-bold">标准等级基数</span> / (<span className="font-bold">敌人防御力</span> &times; (1 - <span className="text-[#06bc0a] font-bold">穿透率%</span>) - <span className="text-[#05b669] font-bold">穿透值</span> + <span className="font-bold">标准等级基数</span>)
                <div className="text-[10px] text-zinc-550 mt-2 font-sans">
                  * 计算穿透率收益时，穿透率按 100% 封顶；超过 100% 的部分不再提供额外收益
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 p-6 nm-sunken rounded-2xl flex flex-col gap-6">
          <h3 className="text-x font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
            <Compass size={17} className="text-zzz-orange" />
            各职业最终期望公式
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 nm-raised rounded-xl">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-zzz-orange rounded-full"></div>
                强攻
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                <span className="text-zzz-orange font-bold">基础攻击区</span> &times; (1 + <span className="text-[#ff3207] font-bold">暴击率%</span> &times; <span className="text-[#ef4444] font-bold">暴击伤害%</span>) &times; <span className="text-[#8b5cf6] font-bold">增伤区</span> &times; <span className="text-[#ec4899] font-bold">抗性区</span> &times; <span className="text-[#06b6d4] font-bold">防御区</span>
              </div>
            </div>

            <div className="p-4 nm-raised rounded-xl">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-zzz-orange rounded-full"></div>
                异常
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                <span className="text-zzz-orange font-bold">基础攻击区</span> &times; <span className="text-zzz-orange font-bold">异常精通</span> &times; <span className="text-[#8b5cf6] font-bold">增伤区</span> &times; <span className="text-[#ec4899] font-bold">抗性区</span> &times; <span className="text-[#06b6d4] font-bold">防御区</span>
              </div>
            </div>

            <div className="p-4 nm-raised rounded-2xl">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-zzz-orange rounded-full"></div>
                命破
              </span>
              <div className="bg-[#e9ebf0]/80 p-3 rounded-lg border border-zinc-300/40 font-mono text-xs text-zinc-700 leading-relaxed">
                <span className="text-zzz-orange font-bold">贯穿力</span> &times; (1 + <span className="text-[#ff3207] font-bold">暴击率%</span> &times; <span className="text-[#ef4444] font-bold">暴击伤害%</span>) &times; <span className="text-[#8b5cf6] font-bold">增伤区</span> &times; <span className="text-[#ec4899] font-bold">抗性区</span> &times; <span className="text-[#06b6d4] font-bold">防御区</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 nm-sunken rounded-xl border border-zinc-200/10 flex flex-col gap-2 md:col-span-2">
          <h3 className="text-x font-bold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
            <HelpCircle size={17} className="text-zzz-orange" />
            词条收益计算
          </h3>
          <p className="text-xs text-zinc-650 leading-relaxed">
            设某属性 <code>k</code> 的数值为 <code>x</code>，该属性所在区间计算函数为 <code>f(k, x)</code>，设提升值为 <code>&Delta;</code>，可以通过如下方式计算出 <code>&Delta;</code> 为伤害提升做出了多少贡献，即词条 <code>k</code> 提高 <code>&Delta;</code> 的收益：
          </p>
          <div className="nm-raised text-center py-4 rounded-xl font-mono text-sm text-zzz-orange font-bold">
            <code>收益 = [f(k, x + &Delta;) / f(k, x)] - 1</code>
          </div>
        </div>
      </div>
    </div>
  );
};