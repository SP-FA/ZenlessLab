import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Disc, Plus, Trash2, Edit2, X, Sparkles, FolderOpen, 
  HelpCircle, Check, Filter, Undo2, ChevronRight, Info
} from 'lucide-react';
import { DriveDisc, DriveDiscSubStat } from '../types';
import { storage } from '../services/storage';
import { DRIVE_DISC_PRESETS, DriveDiscPreset } from '../utils/presets';
import { NeoSelect } from './NeoSelect';

// Main stat configuration with game-accurate progression mapping
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
  "冲击力 (%)": { base: 1.2, max: 18.0, unit: '%', allowedSlots: [6] }
};

// Sub-stat base values representing average max-rolls
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
  "穿透值": { base: 9, unit: '' }
};

// Helper to determine selectable main stats based on selected slot (1-6)
const getMainStatsForSlot = (slot: number): string[] => {
  return Object.keys(MAIN_STATS_CONFIG).filter(stat => 
    MAIN_STATS_CONFIG[stat].allowedSlots.includes(slot)
  );
};

// Helper calculation formulas
const calculateMainStatValue = (name: string, level: number): number => {
  const config = MAIN_STATS_CONFIG[name];
  if (!config) return 0;
  const value = config.base + (config.max - config.base) * (level / 15);
  return config.unit === '%' ? Math.round(value * 10) / 10 : Math.round(value);
};

const calculateSubStatValue = (name: string, hits: number): number => {
  const config = SUB_STATS_CONFIG[name];
  if (!config) return 0;
  const value = config.base * (1 + hits);
  return config.unit === '%' ? Math.round(value * 10) / 10 : Math.round(value);
};

export function DriveManager() {
  const [warehouse, setWarehouse] = useState<DriveDisc[]>([]);
  
  // Selection states for filters (Search removed as requested)
  const [slotFilter, setSlotFilter] = useState<number | 'ALL'>('ALL');
  const [setFilter, setSetFilter] = useState<string | 'ALL'>('ALL');

  // Add Form states (Fresh draft)
  const [formSetName, setFormSetName] = useState<string>('啄木鸟电音');
  const [formSlot, setFormSlot] = useState<number>(1);
  const [formLevel, setFormLevel] = useState<number>(15);
  const [formMainStatName, setFormMainStatName] = useState<string>('固定生命值');
  const [formSubStats, setFormSubStats] = useState<Omit<DriveDiscSubStat, 'value'>[]>([
    { name: '攻击力 (%)', hits: 0 },
    { name: '暴击率 (%)', hits: 0 },
  ]);
  const [isFormSetEffectOpen, setIsFormSetEffectOpen] = useState(false);

  // Edit Panel / Popup state (For separate edit logic)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSetName, setEditSetName] = useState<string>('啄木鸟电音');
  const [editSlot, setEditSlot] = useState<number>(1);
  const [editLevel, setEditLevel] = useState<number>(15);
  const [editMainStatName, setEditMainStatName] = useState<string>('固定生命值');
  const [editSubStats, setEditSubStats] = useState<Omit<DriveDiscSubStat, 'value'>[]>([]);
  const [isEditSetEffectOpen, setIsEditSetEffectOpen] = useState(false);

  // Loading discs on mount
  useEffect(() => {
    setWarehouse(storage.getDriveDiscs());
  }, []);

  // Update main stats choices automatically when slot changes (For creation form)
  useEffect(() => {
    const validMainStats = getMainStatsForSlot(formSlot);
    if (!validMainStats.includes(formMainStatName)) {
      setFormMainStatName(validMainStats[0]);
    }
  }, [formSlot, formMainStatName]);

  // Update main stats choices automatically when slot changes (For edit modal)
  useEffect(() => {
    if (editingId) {
      const validMainStats = getMainStatsForSlot(editSlot);
      if (!validMainStats.includes(editMainStatName)) {
        setEditMainStatName(validMainStats[0]);
      }
    }
  }, [editSlot, editMainStatName, editingId]);

  // Handle Preset Click
  const handlePresetSelect = (preset: DriveDiscPreset) => {
    setFormSetName(preset.name);
  };

  const handleEditPresetSelect = (preset: DriveDiscPreset) => {
    setEditSetName(preset.name);
  };

  // Safe preset lookup helper
  const currentPreset = useMemo(() => {
    return DRIVE_DISC_PRESETS.find(p => p.name === formSetName) || DRIVE_DISC_PRESETS[0];
  }, [formSetName]);

  const currentEditPreset = useMemo(() => {
    return DRIVE_DISC_PRESETS.find(p => p.name === editSetName) || DRIVE_DISC_PRESETS[0];
  }, [editSetName]);

  // Calculated main stat value
  const computedMainValue = useMemo(() => {
    return calculateMainStatValue(formMainStatName, formLevel);
  }, [formMainStatName, formLevel]);

  const computedEditMainValue = useMemo(() => {
    return calculateMainStatValue(editMainStatName, editLevel);
  }, [editMainStatName, editLevel]);

  // Available sub-stat options remaining (Add Form)
  const getAvailableSubStats = (currentIndex: number) => {
    const selectedNames = formSubStats
      .map((s, idx) => idx !== currentIndex ? s.name : '')
      .filter(Boolean);
    return Object.keys(SUB_STATS_CONFIG).filter(name => !selectedNames.includes(name));
  };

  // Available sub-stat options remaining (Edit Form)
  const getAvailableEditSubStats = (currentIndex: number) => {
    const selectedNames = editSubStats
      .map((s, idx) => idx !== currentIndex ? s.name : '')
      .filter(Boolean);
    return Object.keys(SUB_STATS_CONFIG).filter(name => !selectedNames.includes(name));
  };

  // Add Form actions
  const handleAddSubStat = () => {
    if (formSubStats.length >= 4) return;
    const currentNames = formSubStats.map(s => s.name);
    const firstAvailable = Object.keys(SUB_STATS_CONFIG).find(name => !currentNames.includes(name));
    if (firstAvailable) {
      setFormSubStats([...formSubStats, { name: firstAvailable, hits: 0 }]);
    }
  };

  const handleRemoveSubStat = (index: number) => {
    setFormSubStats(formSubStats.filter((_, i) => i !== index));
  };

  const handleSubStatChange = (index: number, fields: Partial<Omit<DriveDiscSubStat, 'value'>>) => {
    setFormSubStats(formSubStats.map((item, i) => {
      if (i === index) {
        return { ...item, ...fields };
      }
      return item;
    }));
  };

  // Edit Form actions
  const handleAddEditSubStat = () => {
    if (editSubStats.length >= 4) return;
    const currentNames = editSubStats.map(s => s.name);
    const firstAvailable = Object.keys(SUB_STATS_CONFIG).find(name => !currentNames.includes(name));
    if (firstAvailable) {
      setEditSubStats([...editSubStats, { name: firstAvailable, hits: 0 }]);
    }
  };

  const handleRemoveEditSubStat = (index: number) => {
    setEditSubStats(editSubStats.filter((_, i) => i !== index));
  };

  const handleEditSubStatChange = (index: number, fields: Partial<Omit<DriveDiscSubStat, 'value'>>) => {
    setEditSubStats(editSubStats.map((item, i) => {
      if (i === index) {
        return { ...item, ...fields };
      }
      return item;
    }));
  };

  // Submit adding a new drive disc
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalSubStats: DriveDiscSubStat[] = formSubStats.map(sub => ({
      name: sub.name,
      hits: sub.hits,
      value: calculateSubStatValue(sub.name, sub.hits)
    }));

    const newDisc: DriveDisc = {
      id: '',
      setName: formSetName,
      slot: formSlot,
      mainStatName: formMainStatName,
      level: formLevel,
      mainStatValue: computedMainValue,
      subStats: finalSubStats
    };

    storage.saveDriveDisc(newDisc);
    setWarehouse(storage.getDriveDiscs());

    // Reset adding draft representation to defaults
    setFormSlot(1);
    setFormLevel(15);
    setFormMainStatName('固定生命值');
    setFormSubStats([
      { name: '攻击力 (%)', hits: 0 },
      { name: '暴击率 (%)', hits: 0 },
    ]);
  };

  // Submit editing an existing drive disc (Popout modal completion)
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const finalSubStats: DriveDiscSubStat[] = editSubStats.map(sub => ({
      name: sub.name,
      hits: sub.hits,
      value: calculateSubStatValue(sub.name, sub.hits)
    }));

    const updatedDisc: DriveDisc = {
      id: editingId,
      setName: editSetName,
      slot: editSlot,
      mainStatName: editMainStatName,
      level: editLevel,
      mainStatValue: computedEditMainValue,
      subStats: finalSubStats
    };

    storage.saveDriveDisc(updatedDisc);
    setWarehouse(storage.getDriveDiscs());
    setEditingId(null);
  };

  // POPUP MODAL Trigger - open editing panel
  const handleEditInit = (disc: DriveDisc) => {
    setEditingId(disc.id);
    setEditSetName(disc.setName);
    setEditSlot(disc.slot);
    setEditLevel(disc.level);
    setEditMainStatName(disc.mainStatName);
    setEditSubStats(disc.subStats.map(s => ({ name: s.name, hits: s.hits })));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDeleteDisc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering any edit panel init
    if (confirm('确定要从你的仓库中删除这个驱动盘吗？此操作无法撤销。')) {
      storage.deleteDriveDisc(id);
      setWarehouse(storage.getDriveDiscs());
      if (editingId === id) {
        setEditingId(null); // safely close edit if deleted
      }
    }
  };

  // Filter & sort list of saved discs
  const sortedAndFilteredDiscs = useMemo(() => {
    return warehouse
      .filter(disc => {
        const matchesSlot = slotFilter === 'ALL' || disc.slot === slotFilter;
        const matchesSet = setFilter === 'ALL' || disc.setName === setFilter;
        return matchesSlot && matchesSet;
      })
      .sort((a, b) => {
        if (a.setName !== b.setName) {
          return a.setName.localeCompare(b.setName);
        }
        return a.slot - b.slot;
      });
  }, [warehouse, slotFilter, setFilter]);

  // Unique lists for filtering dropdowns
  const availableFilterSets = useMemo(() => {
    const list = Array.from(new Set(warehouse.map(w => w.setName))) as string[];
    return list.sort((a, b) => a.localeCompare(b));
  }, [warehouse]);

  // Quick helper to render the custom futuristic vinyl record graphic
  const renderRecordGraphic = (setName: string, slot: number, size: number = 84) => {
    const preset = DRIVE_DISC_PRESETS.find(p => p.name === setName) || { color: '#888888' };
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];
    const slotLabel = romanNumerals[slot - 1] || slot.toString();

    return (
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        {/* Soft shadow background element */}
        <div className="absolute inset-0.5 rounded-full bg-zinc-200 nm-sunken" />
        
        {/* Rotating Outer CD Rings */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 transition-transform duration-1000 hover:rotate-180">
          <circle cx="50" cy="50" r="45" fill="#18181b" stroke="#374151" strokeWidth="1" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#3f3f46" strokeWidth="0.75" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#27272a" strokeWidth="1.25" strokeDasharray="10 2" />
          <circle cx="50" cy="50" r="18" fill={preset.color} className="opacity-80 animate-pulse" />
          <circle cx="50" cy="50" r="14" fill="#09090b" />
          <circle cx="50" cy="50" r="4" fill="none" stroke="#52525b" strokeWidth="1" />
          <text 
            x="50" 
            y="54" 
            textAnchor="middle" 
            fill="#ffffff" 
            fontSize="11" 
            fontWeight="900" 
            fontFamily="monospace"
          >
            {slotLabel}
          </text>
        </svg>
        
        {/* Ambient Glow background */}
        <div 
          className="absolute inset-4 rounded-full filter blur-md opacity-40 transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: preset.color }}
        />
      </div>
    );
  };

  // Mini rotating vinyl disk graphic for the presets list (Requirement 2)
  const renderPresetDiskMini = (preset: DriveDiscPreset) => {
    return (
      <div className="relative flex items-center justify-center shrink-0 w-11 h-11">
        {/* Soft sunken shadow background */}
        <div className="absolute inset-0 bg-zinc-300 rounded-full" />
        
        {/* rotating disk svg */}
        <svg viewBox="0 0 100 100" className="w-10 h-10 relative z-10 transition-transform duration-1000 group-hover:rotate-185">
          <circle cx="50" cy="50" r="45" fill="#18181b" stroke="#374151" strokeWidth="1" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#27272a" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="26" fill="none" stroke="#3f3f46" strokeWidth="0.75" />
          <circle cx="50" cy="50" r="19" fill={preset.color} className="opacity-85" />
          <circle cx="50" cy="50" r="12" fill="#09090b" />
          <circle cx="50" cy="50" r="3" fill="none" stroke="#52525b" strokeWidth="1.25" />
        </svg>
        {/* Ambient Glow */}
        <div 
          className="absolute inset-2.5 rounded-full filter blur-xs opacity-40 pointer-events-none"
          style={{ backgroundColor: preset.color }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 nm-raised rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zzz-orange text-white nm-orange-raised-interactive">
              <Disc size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-800 tracking-tight">驱动盘仓库</h2>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                维护专属于你的驱动盘仓库
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-zinc-500 font-mono font-bold p-3 rounded-xl">
          <div className="text-center px-1">
            <span className="block text-lg font-black text-zzz-orange">{warehouse.length}</span>
            <span>已入库</span>
          </div>
        </div>
      </div>

      <div className="nm-raised rounded-2xl p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
          <Plus size={20} className="text-zzz-orange" />
          添加驱动盘
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col gap-4 nm-raised rounded-xl p-5">
            <div className="flex items-center justify-between pb-2.5">
              <span className="text-xs font-black text-zinc-600 tracking-wider flex items-center gap-1.5 uppercase">
                选择套装
              </span>
            </div>

            {/* Scrollable preset list with rich rotating vinyl disk indicators (Row-based list) */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 max-h-[590px] overflow-y-auto select-none custom-scrollbar nm-sunken rounded-xl p-3.5">
              {DRIVE_DISC_PRESETS.map((p) => {
                const isActive = formSetName === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`p-3 rounded-xl text-left relative overflow-hidden flex items-center gap-3 group h-[72px] mb-1 ${
                      isActive 
                        ? 'nm-raised-active' 
                        : 'nm-raised-interactive'
                    }`}
                  >
                    {/* Visual Disk Preview integration (Requirement 2) */}
                    {renderPresetDiskMini(p)}

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-xs font-black text-zinc-800 truncate">{p.name}</span>
                    </div>

                    {/* Active highlight bar */}
                    {isActive && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: p.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact property editor keeps the creation workflow distinct from editing. */}
          <div className="lg:col-span-7 p-5 rounded-xl flex flex-col gap-4 nm-raised">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-zinc-600 flex items-center gap-1.5 uppercase">
                驱动盘属性
              </span>
              <button type="button" onClick={() => setIsFormSetEffectOpen(!isFormSetEffectOpen)} className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 hover:text-zinc-800">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentPreset.color }} />
                {currentPreset.name} · 套装效果
                <ChevronRight size={12} className={`transition-transform ${isFormSetEffectOpen ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {isFormSetEffectOpen && (
              <div className="px-3 py-2.5 rounded-lg bg-zinc-100/70 text-[11px] leading-relaxed text-zinc-600 space-y-1">
                <p><strong className="text-zinc-700">2件套：</strong>{currentPreset.twoPieceEffect}</p>
                <p><strong className="text-zinc-700">4件套：</strong>{currentPreset.fourPieceEffect}</p>
              </div>
            )}

            {/* Inputs & settings */}
            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end px-1 py-3 border-y border-zinc-200/70">
                {/* Slot Selector */}
                <div className="md:col-span-5">
                  <label className="block text-[10px] font-black text-zinc-400 mb-1.5">槽位</label>
                  <div className="grid grid-cols-6 gap-1">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormSlot(num)}
                        className={`py-1.5 rounded-lg text-xs font-black font-mono transition-all duration-200 ${
                          formSlot === num 
                            ? 'text-white bg-zinc-800 nm-raised-active'
                            : 'text-zinc-500 bg-zinc-100 hover:bg-zinc-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level slider */}
                <div className="md:col-span-7">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-black text-zinc-400">等级</label>
                    <span className="text-xs font-black font-mono text-zzz-orange bg-zzz-orange/10 px-2 py-0.5 rounded-md">
                      + {formLevel}
                    </span>
                  </div>
                  <div className="h-[26px] flex items-center gap-3 mt-2">
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="1"
                      value={formLevel}
                      onChange={(e) => setFormLevel(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-zzz-orange"
                    />
                  </div>
                </div>
              </div>

              {/* Main attribute is a compact field instead of its own card. */}
              <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center gap-2 px-1">
                <span className="text-[10px] font-black text-zinc-400">主词条</span>
                  <NeoSelect
                    value={formMainStatName}
                    onValueChange={(name) => setFormMainStatName(name as string)}
                    buttonClassName="text-xs font-bold"
                    options={getMainStatsForSlot(formSlot).map(stat => ({ value: stat, label: stat }))}
                    ariaLabel="主词条"
                  />
                <span className="text-xs font-black font-mono text-zinc-800 sm:text-right">+{computedMainValue}{MAIN_STATS_CONFIG[formMainStatName]?.unit}</span>
              </div>

              {/* Sub stats use compact rows, retaining every control and value. */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="block text-xs font-black text-zinc-500">
                    副词条
                  </span>
                  {formSubStats.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddSubStat}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-zzz-orange nm-raised-interactive"
                    >
                      <Plus size={10} /> 新增副词条
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-200/70 overflow-hidden divide-y divide-zinc-200/70">
                  {formSubStats.map((sub, idx) => {
                    const formatUnit = SUB_STATS_CONFIG[sub.name]?.unit || '';
                    const totalRolls = sub.hits + 1;
                    const statValue = calculateSubStatValue(sub.name, sub.hits);

                    return (
                      <div key={idx} className="grid grid-cols-[1rem_minmax(0,1fr)_minmax(7rem,1.4fr)_auto_auto] items-center gap-2 px-3 py-2.5 bg-white/20">
                        {/* Remove card button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubStat(idx)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <X size={11} />
                        </button>

                          <span className="text-[10px] font-bold text-zinc-400 font-mono">{idx+1}</span>
                          <NeoSelect
                            value={sub.name}
                            onValueChange={(name) => handleSubStatChange(idx, { name })}
                            className="min-w-0 flex-1"
                            buttonClassName="min-h-0 bg-transparent px-0 py-0 text-xs font-bold shadow-none hover:shadow-none"
                            menuClassName="min-w-[10rem]"
                            options={getAvailableSubStats(idx).map(opt => ({ value: opt, label: opt }))}
                            ariaLabel={`副词条 ${idx + 1}`}
                          />
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] text-zinc-500 whitespace-nowrap">强化 <strong className="text-zzz-orange">+{sub.hits}</strong></span>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="1"
                            value={sub.hits}
                            onChange={(e) => handleSubStatChange(idx, { hits: parseInt(e.target.value) })}
                            className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-zinc-700"
                          />
                        </div>
                        <span className="text-zinc-800 font-black text-xs font-mono whitespace-nowrap">+{statValue}{formatUnit}</span>
                      </div>
                    );
                  })}

                  {formSubStats.length === 0 && (
                    <div className="text-center py-5 text-xs text-zinc-400">
                      未添加副词条。请点击右上角进行添加。
                    </div>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-black text-white bg-zzz-orange nm-orange-raised-interactive flex items-center justify-center gap-2 shadow-md hover:brightness-105 mt-2"
              >
                <Plus size={14} />
                确认配置并保存
              </button>

            </form>
          </div>

        </div>
      </div>

      <div className="flex flex-col gap-6 nm-raised rounded-2xl p-6">
        
        {/* Section divider and heading overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
            <FolderOpen size={20} className="text-zinc-600" />
            所有保存的驱动盘
          </h2>
        </div>

        {/* Filters Box - Removed search as requested */}
        <div className="nm-raised rounded-2xl p-5 bg-[#f0f3f6] border border-zinc-200/10">
          <div className="text-xs font-black text-zinc-600 mb-4 flex items-center gap-1.5 uppercase">
            <Filter size={14} className="text-zinc-500" />
            筛选
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Slot select filter */}
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1.5">槽位筛选</label>
              <NeoSelect
                value={slotFilter}
                onValueChange={(slot) => setSlotFilter(slot as number | 'ALL')}
                buttonClassName="text-xs font-bold"
                options={[
                  { value: 'ALL', label: '所有槽位' },
                  ...[1, 2, 3, 4, 5, 6].map(num => ({ value: num, label: `${num} 号盘` })),
                ]}
                ariaLabel="槽位筛选"
              />
            </div>

            {/* Set filter */}
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1.5">套装筛选</label>
              <NeoSelect
                value={setFilter}
                onValueChange={(setName) => setSetFilter(setName as string)}
                buttonClassName="text-xs font-bold"
                options={[
                  { value: 'ALL', label: '所有套装' },
                  ...availableFilterSets.map(setName => ({ value: setName, label: setName })),
                ]}
                ariaLabel="套装筛选"
              />
            </div>
          </div>
        </div>

        {/* Display Grid of Saved Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 xl:grid-cols-5 gap-6">
          <AnimatePresence mode="popLayout">
            {sortedAndFilteredDiscs.map((disc) => {
              const preset = DRIVE_DISC_PRESETS.find(p => p.name === disc.setName) || { color: '#888888' };
              const isMainPct = MAIN_STATS_CONFIG[disc.mainStatName]?.unit === '%';

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
                    {renderRecordGraphic(disc.setName, disc.slot, 60)}
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
                    <div className="flex justify-between items-center px-3 py-2 rounded-lg nm-raised text-xs">
                      <span className="font-bold text-zinc-400">主词条:</span>
                      <span className="font-black font-mono text-zinc-800">
                        {disc.mainStatName} +{disc.mainStatValue}{isMainPct ? '%' : ''}
                      </span>
                    </div>

                    {/* Sub stats displaying */}
                    <div className="space-y-1.5 mt-1">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">副词条:</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {disc.subStats.map((sub, sIdx) => {
                          const subUnit = SUB_STATS_CONFIG[sub.name]?.unit || '';
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
                        handleEditInit(disc);
                      }}
                      className="p-1.5 rounded text-zinc-400 hover:text-zzz-orange hover:bg-zinc-100 transition-colors"
                      title="编辑属性"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteDisc(disc.id, e)}
                      className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="废弃盘片"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>

          {sortedAndFilteredDiscs.length === 0 && (
            <div className="sm:col-span-5 xl:col-span-5 text-center py-16 px-4 nm-sunken rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-zinc-200 rounded-full text-zinc-400">
                <Disc size={28} className="animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-sm font-black text-zinc-700">未发现匹配的驱动盘</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  目前在你的驱动盘仓库中不包含符合所选过滤标签的驱动盘
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      <AnimatePresence>
        {editingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelEdit}
              className="absolute inset-0 bg-zinc-950/50"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-2xl bg-[#f0f3f6] rounded-2xl p-6 border border-zinc-200 overflow-y-auto max-h-[90vh] custom-scrollbar z-10"
            >
              {/* Modal header details */}
              <div className="flex items-center justify-between pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-zzz-orange text-white rounded-lg shadow-sm">
                    <Disc size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-800">编辑驱动盘</h3>
                  </div>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Editing Form wrapper layout */}
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
                
                {/* 1. Quick presets overlay inside Edit Modal */}
                <div className="p-4 rounded-xl nm-sunken">
                  <label className="block text-[11px] font-black text-zinc-500 mb-2 uppercase">修改套装</label>
                  <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 max-h-[140px] overflow-y-auto select-none p-2.5">
                    {DRIVE_DISC_PRESETS.map((p) => {
                      const isActive = editSetName === p.name;
                      return (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => handleEditPresetSelect(p)}
                          className={`mb-1 p-2 rounded-lg text-left transition-all duration-300 relative flex items-center gap-2 group h-[52px] ${
                            isActive 
                              ? 'text-black shadow-inner font-black nm-raised-active' 
                              : 'text-zinc-600 nm-raised-interactive'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                          <span className="text-[11px] truncate">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              <button type="button" onClick={() => setIsEditSetEffectOpen(!isEditSetEffectOpen)} className="flex items-center justify-between px-1 text-[10px] font-black text-zinc-500 hover:text-zinc-800">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentEditPreset.color }} />{currentEditPreset.name} · 套装效果</span>
                <ChevronRight size={12} className={`transition-transform ${isEditSetEffectOpen ? 'rotate-90' : ''}`} />
              </button>
              {isEditSetEffectOpen && (
                <div className="px-3 py-2.5 rounded-lg bg-zinc-100/70 text-[11px] leading-relaxed text-zinc-600 space-y-1">
                  <p><strong className="text-zinc-800">2件套：</strong>{currentEditPreset.twoPieceEffect}</p>
                  <p><strong className="text-zinc-800">4件套：</strong>{currentEditPreset.fourPieceEffect}</p>
                </div>
              )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end px-1 py-3 border-y border-zinc-200/70">
                  {/* Slot selector */}
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-black text-zinc-400 mb-1.5">槽位</label>
                    <div className="grid grid-cols-6 gap-1">
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setEditSlot(num)}
                          className={`py-1.5 rounded-lg text-xs font-black font-mono transition-all duration-200 ${
                            editSlot === num 
                              ? 'text-white bg-zinc-800 nm-raised-active'
                            : 'text-zinc-500 bg-zinc-100 hover:bg-zinc-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Level selector */}
                  <div className="md:col-span-7">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-black text-zinc-400 font-sans">等级</label>
                      <span className="text-xs font-black font-mono text-zzz-orange bg-zzz-orange/10 px-2 py-0.5 rounded-md">
                        + {editLevel}
                      </span>
                    </div>
                    <div className="h-[26px] flex items-center gap-3 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="15"
                        step="1"
                        value={editLevel}
                        onChange={(e) => setEditLevel(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-zzz-orange"
                      />
                    </div>
                  </div>
                </div>

                {/* Main stat stays visible in a single concise row. */}
                <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center gap-2 px-1">
                  <span className="text-[10px] font-black text-zinc-400">主词条</span>
                    <NeoSelect
                      value={editMainStatName}
                      onValueChange={(name) => setEditMainStatName(name as string)}
                      buttonClassName="text-xs font-bold"
                      options={getMainStatsForSlot(editSlot).map(stat => ({ value: stat, label: stat }))}
                      ariaLabel="编辑主词条"
                    />
                  <span className="text-xs font-black font-mono text-zinc-800 sm:text-right">+{computedEditMainValue}{MAIN_STATS_CONFIG[editMainStatName]?.unit}</span>
                </div>

                {/* Compact rows replace nested sub-stat cards. */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-zinc-500 uppercase flex items-center gap-1">
                      副词条
                    </span>
                    {editSubStats.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddEditSubStat}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-zzz-orange nm-raised-interactive"
                      >
                        <Plus size={10} />增加副词条
                      </button>
                    )}
                  </div>

                  <div className="rounded-xl border border-zinc-200/70 overflow-hidden divide-y divide-zinc-200/70">
                    {editSubStats.map((sub, idx) => {
                      const formatUnit = SUB_STATS_CONFIG[sub.name]?.unit || '';
                      const totalRolls = sub.hits + 1;
                      const statValue = calculateSubStatValue(sub.name, sub.hits);

                      return (
                        <div key={idx} className="grid grid-cols-[1rem_minmax(0,1fr)_minmax(7rem,1.4fr)_auto_auto] items-center gap-2 px-3 py-2.5 bg-white/20">
                          <button
                            type="button"
                            onClick={() => handleRemoveEditSubStat(idx)}
                            className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <X size={11} />
                          </button>

                            <span className="text-[10px] font-bold text-zinc-400 font-mono">{idx+1}</span>
                            <NeoSelect
                              value={sub.name}
                              onValueChange={(name) => handleEditSubStatChange(idx, { name })}
                              className="min-w-0 flex-1"
                              buttonClassName="min-h-0 bg-transparent px-0 py-0 text-xs font-bold shadow-none hover:shadow-none"
                              menuClassName="min-w-[10rem]"
                              options={getAvailableEditSubStats(idx).map(opt => ({ value: opt, label: opt }))}
                              ariaLabel={`编辑副词条 ${idx + 1}`}
                            />
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] text-zinc-500 whitespace-nowrap">强化 <strong className="text-zzz-orange">+{sub.hits}</strong></span>
                            <input
                              type="range"
                              min="0"
                              max="5"
                              step="1"
                              value={sub.hits}
                              onChange={(e) => handleEditSubStatChange(idx, { hits: parseInt(e.target.value) })}
                              className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-zinc-700"
                            />
                          </div>
                          <span className="text-zinc-800 font-black text-xs font-mono whitespace-nowrap">+{statValue}{formatUnit}</span>
                        </div>
                      );
                    })}

                    {editSubStats.length === 0 && (
                      <div className="text-center py-5 bg-zinc-100/50 text-xs text-zinc-400">
                        该盘片无副属性词条，请在右上角添加副属性。
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm operations footers */}
                <div className="flex gap-3 border-t border-zinc-200/50">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-3 rounded-xl text-xs font-black text-zinc-600 nm-raised-interactive flex items-center justify-center gap-2"
                  >
                    取消修改
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl text-xs font-black text-white bg-zzz-orange nm-orange-raised-interactive flex items-center justify-center gap-2 shadow-md hover:brightness-105"
                  >
                    确认修改
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
