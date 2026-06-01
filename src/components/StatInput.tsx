// import React from 'react';
import React, { useState, useEffect } from 'react';

interface StatInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  isPercentage?: boolean;
}

export const StatInput: React.FC<StatInputProps> = ({ label, value, onChange, isPercentage }) => {
  const [raw, setRaw] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    setRaw(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-mono text-zinc-500 font-semibold uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          // value={value === 0 ? '' : value}
          value={raw}
          placeholder="0"
          onChange={(e) => {
            const nextRaw = e.target.value;
            if (/^\d*\.?\d*$/.test(nextRaw)) {
              setRaw(nextRaw);
              onChange(parseFloat(nextRaw) || 0);
            }
          }}
          onFocus={(e) => e.target.select()}
          className="w-full nm-sunken rounded-lg px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:border-zzz-orange/40 hover:border-zinc-300/80 focus:ring-1 focus:ring-zzz-orange/20 transition-all duration-300"
        />
      </div>
    </div>
  );
};
