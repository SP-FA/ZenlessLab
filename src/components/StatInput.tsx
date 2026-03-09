import React from 'react';

interface StatInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  isPercentage?: boolean;
}

export const StatInput: React.FC<StatInputProps> = ({ label, value, onChange, isPercentage }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          onFocus={(e) => e.target.select()}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zzz-orange transition-colors"
        />
        {/* {isPercentage && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">%</span>
        )} */}
      </div>
    </div>
  );
};
