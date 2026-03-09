import React from 'react';

export const FormulaView: React.FC = () => {
  return (
    <div className="w-full bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50">
      <div className="mb-8 text-center">
        <h2 className="text-[30px] font-bold text-zinc-100 mb-2">核心计算公式</h2>
        <p className="text-sm text-zinc-500">本工具严格遵循以下公式进行伤害期望与收益计算</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-[20px] font-bold text-zinc-100 flex items-center gap-2">
            基础乘区计算
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            1. 基础攻击区：
          </h2><h2 className="pl-16 pt-2">
            (攻击力白值 * (1 + <span className="text-[#f37f0f]">战前大攻击%</span>) + <span className="text-[#ffba04]">战前小攻击</span>) * (1 + <span className="text-[#f35f0f]">战后大攻击%</span>) + <span className="text-[#ff9a04]">战后小攻击</span>
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            2. 基础生命区：
          </h2><h2 className="pl-16 pt-2">
            (生命值白值 * (1 + <span className="text-[#f37f0f]">战前大生命%</span>) + <span className="text-[#ffba04]">战前小生命</span>) * (1 + <span className="text-[#f35f0f]">战后大生命%</span>) + <span className="text-[#ff9a04]">战后小生命</span>
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            3. 增伤区：
          </h2><h2 className="pl-16 pt-2">
            1 + <span className="text-[#8b5cf6]">增伤%</span><span className="text-[#555555]">(包括伤害提升、伤害加成、属性伤害加成)</span>
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            4. 抗性区：
          </h2><h2 className="pl-16 pt-2">
            1 + <span className="text-[#ec4899]">减抗%</span> - <span className="text-[#555555]">敌人抗性%</span>
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            5. 贯穿力：
          </h2><h2 className="pl-16 pt-2">
            0.3 * 基础攻击区 + 0.1 * 基础生命区
          </h2>
        </div>
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-[20px] font-bold text-zinc-100 flex items-center gap-2">
            防御区计算（默认角色等级60，敌人等级60+）
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            1. 基础防御力：
          </h2><h2 className="pl-16 pt-2">
            794<span className="text-[#555555]">(标准等级基数)</span> * 60<span className="text-[#555555]">(防御参数)</span> / 50
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            2. 敌人防御力：
          </h2><h2 className="pl-16 pt-2">
            基础防御力 * (1 + <span className="text-[#555555]">防御加成%</span> - <span className="text-[#06b6d4]">减防%</span>) + <span className="text-[#555555]">固定防御</span>
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            3. 防御区：
          </h2><h2 className="pl-16 pt-2">
            794<span className="text-[#555555]">(标准等级基数)</span> / (敌人防御力 * (1 - <span className="text-[#24ff00]">穿透率%</span>) - <span className="text-[#00ff85]">穿透值</span> + 794<span className="text-[#555555]">(标准等级基数)</span>)
          </h2>
        </div>
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-[20px] font-bold text-zinc-100 flex items-center gap-2">
            伤害期望
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            1. 强攻
          </h2><h2 className="pl-16 pt-2">
            基础攻击区 * (1 + <span className="text-[#ff3207]">暴击率%</span> * <span className="text-[#ef4444]">暴伤%</span>) * 增伤区 * 抗性区 * 防御区
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            2. 异常
          </h2><h2 className="pl-16 pt-2">
            基础攻击区 * 异常精通 * 增伤区 * 抗性区 * 防御区
          </h2>
          <h2 className="pl-8 pt-3 text-[18px] font-bold">
            3. 命破
          </h2><h2 className="pl-16 pt-2">
            贯穿力 * (1 + <span className="text-[#ff3207]">暴击率%</span> * <span className="text-[#ef4444]">暴伤%</span>) * 增伤区 * 抗性区
          </h2>
        </div>
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-[20px] font-bold text-zinc-100 flex items-center gap-2">
            词条收益计算
          </h2>
          <h2 className="pl-8 pt-2">
            设某属性 k（如暴击率、战前大攻击）的数值为 x，该属性所在区间计算函数为 f(k,x)，设提升值为 a，可以通过如下方式计算出 a 为伤害提升做出了多少贡献，即词条 k 提高 a 的收益：
          </h2>
          <h2 className="pl-8 pt-2 font-bold text-center">
            收益 = f(k, x + a) / f(k, x) - 1
          </h2>
        </div>
      </div>
    </div>
  );
};
