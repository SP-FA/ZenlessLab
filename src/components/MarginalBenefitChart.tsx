import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CharacterStats, CharacterType, STAT_LABELS } from '../types';
import { generateMarginalCurveData } from '../utils/calculator';

interface MarginalBenefitChartProps {
  stats: CharacterStats;
  type: CharacterType;
}

const COLORS = [
  '#f37f0f', // zzz-orange
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#a855f7', // purple-500
  '#14b8a6', // teal-500
];

export const MarginalBenefitChart: React.FC<MarginalBenefitChartProps> = ({ stats, type }) => {
  if (!stats) return null;
  const data = useMemo(() => generateMarginalCurveData(stats, type, 20), [stats, type]);

  // Fixed stats to show based on character type
  const relevantStats = useMemo(() => {
    if (type === 'ATTACK') {
      return ['atk_flat_pre', 'atk_pct_pre', 'crit_rate', 'crit_dmg', 'dmg_bonus', 'res_shred', 'def_shred', 'pen_ratio', 'pen_flat'];
    } else if (type === 'ANOMALY') {
      return ['anomaly_prof', 'atk_flat_pre', 'atk_pct_pre', 'dmg_bonus', 'res_shred', 'def_shred', 'pen_ratio', 'pen_flat'];
    } else if (type === 'STUN') {
      return ['hp_flat_pre', 'hp_pct_pre', 'atk_flat_pre', 'atk_pct_pre', 'crit_rate', 'crit_dmg', 'dmg_bonus', 'res_shred'];
    }
    return [];
  }, [type]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="nm-raised p-4.5 rounded-xl shadow-xl min-w-[210px] bg-white/95 backdrop-blur-md">
          <p className="text-[10px] font-mono text-zinc-500 uppercase mb-3 font-bold tracking-[0.15em]">投入第 {label} 个单位词条</p>
          <div className="flex flex-col gap-2.5">
            {payload.sort((a: any, b: any) => b.value - a.value).map((entry: any) => (
              <div key={entry.name} className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold" style={{ color: entry.color }}>
                  {STAT_LABELS[entry.dataKey as keyof CharacterStats].split(' (')[0]}
                </span>
                <span className="text-xs font-mono font-bold text-zinc-800">+{entry.value.toFixed(3)}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full nm-raised p-8 rounded-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-zinc-805 mb-2">边际收益曲线</h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          展示在当前面板下，每额外投入一个单位词条所带来的<span className="font-bold">即时伤害提升百分比</span>
          <br />
          <span className="text-zzz-orange/85 italic text-xs font-medium">* X轴：投入 N 个单位词条 | Y轴：第 N 个单位词条带来的收益 (%)</span>
        </p>
      </div>
      
      <div className="w-full h-[650px]">
        <ResponsiveContainer className="nm-raised rounded-xl pt-20 pb-5 pl-10 pr-10">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#8a3e01" vertical={false} opacity={0.8} />
            <XAxis 
              dataKey="step" 
              stroke="#8e8e93" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              dy={10}
              label={{ value: '投入词条数量', position: 'insideBottom', offset: -20, fontSize: 11, fill: '#64748b', fontWeight: 600 }}
            />
            <YAxis 
              stroke="#8e8e93" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              dx={-5}
              tickFormatter={(value) => `${value}%`}
              label={{ value: '边际收益 (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b', fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle" 
              wrapperStyle={{ top: '-40px' }}
              formatter={(value) => <span className="text-zinc-600 text-xs font-semibold">{STAT_LABELS[value as keyof CharacterStats].split(' (')[0]}</span>}
            />
            {relevantStats.map((stat, index) => (
              <Line
                key={stat}
                type="monotone"
                dataKey={stat}
                name={stat}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={3}
                dot={{ r: 2, strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[index % COLORS.length] }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-12 p-6 nm-sunken rounded-xl border border-zinc-200/20">
        <h4 className="text-xs font-bold text-zinc-550 uppercase tracking-widest mb-5 flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-zzz-orange rounded-full"></div>
          单位词条增量参考
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex flex-col gap-1 nm-raised p-3.5 rounded-xl border border-zinc-300/10">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">战前大攻击</span>
            <span className="text-sm font-mono font-bold text-zzz-orange">3.0%</span>
          </div>
          <div className="flex flex-col gap-1 nm-raised p-3.5 rounded-xl border border-zinc-300/10">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">战前小攻击</span>
            <span className="text-sm font-mono font-bold text-zzz-orange">19</span>
          </div>
          <div className="flex flex-col gap-1 nm-raised p-3.5 rounded-xl border border-zinc-300/10">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">暴击率</span>
            <span className="text-sm font-mono font-bold text-zzz-orange">2.4%</span>
          </div>
          <div className="flex flex-col gap-1 nm-raised p-3.5 rounded-xl border border-zinc-300/10">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">暴击伤害</span>
            <span className="text-sm font-mono font-bold text-zzz-orange">4.8%</span>
          </div>
          <div className="flex flex-col gap-1 nm-raised p-3.5 rounded-xl border border-zinc-300/10">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">穿透值</span>
            <span className="text-sm font-mono font-bold text-zzz-orange">9</span>
          </div>
          <div className="flex flex-col gap-1 nm-raised p-3.5 rounded-xl border border-zinc-300/10">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">异常精通</span>
            <span className="text-sm font-mono font-bold text-zzz-orange">9</span>
          </div>
          <div className="flex flex-col gap-1 nm-raised p-3.5 rounded-xl border border-zinc-300/10">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">增伤 / 减抗 / 减防</span>
            <span className="text-sm font-mono font-bold text-zzz-orange">3.0%</span>
          </div>
          <div className="flex flex-col gap-1 nm-raised p-3.5 rounded-xl border border-zinc-300/10">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">穿透率</span>
            <span className="text-sm font-mono font-bold text-zzz-orange">2.4%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
