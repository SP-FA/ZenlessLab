import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CharacterStats, CharacterType, STAT_LABELS } from '../types';
import { generateMarginalCurveData } from '../utils/calculator';

interface MarginalBenefitChartProps {
  stats: CharacterStats;
  type: CharacterType;
}

const COLORS = [
  '#ffba04', // yellow
  '#f37f0f', // zzz-orange
  '#ff3207', // red
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#24ff00', // green
  '#00ff85', // light-green
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
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow-2xl min-w-[200px]">
          <p className="text-[10px] text-zinc-500 uppercase mb-3 font-bold tracking-widest">投入第 {label} 个单位词条</p>
          <div className="flex flex-col gap-2">
            {payload.sort((a: any, b: any) => b.value - a.value).map((entry: any) => (
              <div key={entry.name} className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium" style={{ color: entry.color }}>
                  {STAT_LABELS[entry.dataKey as keyof CharacterStats].split(' (')[0]}
                </span>
                <span className="text-xs font-mono font-bold text-zinc-100">+{entry.value.toFixed(3)}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50">
      <div className="mb-8" align="center">
        <h2 className="text-[30px] font-bold text-zinc-100 mb-2" size={30}>边际收益曲线</h2>
        <p className="text-sm text-zinc-500">
          展示在当前面板下，每额外投入一个“标准单位”词条所带来的伤害提升百分比
        </p>
      </div>
      <div align="right">
      <span className="text-zzz-orange italic text-xs">* X轴：投入的第 N 个单位词条 | Y轴：第 N 个单位带来的边际收益 (%)</span>
      </div>
      
      <div className="w-full h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="step" 
              stroke="#71717a" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              dy={10}
              label={{ value: '投入词条单位数量 (1-20)', position: 'insideBottom', offset: -20, fontSize: 12, fill: '#71717a', fontWeight: 500 }}
            />
            <YAxis 
              stroke="#71717a" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => `${value}%`}
              label={{ value: '边际收益 (%)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 12, fill: '#71717a', fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle" 
              wrapperStyle={{ paddingTop: '40px' }}
              formatter={(value) => <span className="text-zinc-400 text-xs font-medium">{STAT_LABELS[value as keyof CharacterStats].split(' (')[0]}</span>}
            />
            {relevantStats.map((stat, index) => (
              <Line
                key={stat}
                type="monotone"
                dataKey={stat}
                name={stat}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={3}
                dot={{ r: 2, strokeWidth: 2, fill: '#09090b' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[index % COLORS.length] }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-12 p-6 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-1 h-3 bg-zzz-orange rounded-full"></div>
          词条单位数值说明
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">战前大攻击</span>
            <span className="text-sm font-mono text-zinc-200">3.0%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">战前小攻击</span>
            <span className="text-sm font-mono text-zinc-200">19</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">暴击率</span>
            <span className="text-sm font-mono text-zinc-200">2.4%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">暴击伤害</span>
            <span className="text-sm font-mono text-zinc-200">4.8%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">穿透值</span>
            <span className="text-sm font-mono text-zinc-200">9</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">异常精通</span>
            <span className="text-sm font-mono text-zinc-200">9</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">增伤 / 减抗 / 减防</span>
            <span className="text-sm font-mono text-zinc-200">3.0%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">穿透率</span>
            <span className="text-sm font-mono text-zinc-200">2.4%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
