import { useState } from 'react';
import { useNeumorphicPressScale } from './hooks/useNeumorphicPressScale';
import { CharacterProfile, CharacterStats, DEFAULT_STATS } from './types';
import config from '../config.json';
import { ProfileManager } from './components/ProfileManager';
import { Calculator } from './components/Calculator';
import { FormulaView } from './components/FormulaView';
import { Docs } from './components/Docs';
import { Me } from './components/About';
import { MarginalBenefitChart } from './components/MarginalBenefitChart';
import { DriveManager } from './components/DriveManager';
import { LayoutDashboard, Calculator as CalcIcon, BookOpen, FileCode, AtSign, Github, TrendingUp, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from './services/storage';

type Tab = 'CALC' | 'CURVE' | 'DRIVE' | 'FORMULA' | 'DOCS' | 'ME';

export default function App() {
  useNeumorphicPressScale();
  const [activeTab, setActiveTab] = useState<Tab>('CALC');
  const [currentProfile, setCurrentProfile] = useState<CharacterProfile>(() => {
    // Try to load initial profile from storage
    const profiles = storage.getProfiles();
    return profiles.length > 0 ? profiles[0] : {
      name: '新角色',
      type: 'ATTACK',
      stats: { ...DEFAULT_STATS },
      char_preset: 'custom',
      engine_preset: 'custom',
      team: [
        { name: '', engine: '', drive4: '', drive2: '' },
        { name: '', engine: '', drive4: '', drive2: '' },
        { name: '', engine: '', drive4: '', drive2: '' },
      ],
      notes: ''
    };
  });
  const [improvements, setImprovements] = useState<Partial<CharacterStats>>({});

  const handleProfileSelect = (profile: CharacterProfile) => {
    setCurrentProfile(profile);
  };

  const menuItems = [
    { id: 'CALC', label: '计算分析', icon: CalcIcon },
    { id: 'CURVE', label: '收益曲线', icon: TrendingUp },
    { id: 'DRIVE', label: '驱动盘', icon: Disc },
    { id: 'FORMULA', label: '计算公式', icon: FileCode },
    { id: 'DOCS', label: '指南文档', icon: BookOpen },
    { id: 'ME', label: 'About', icon: AtSign },
  ];

  return (
    <div className="min-h-screen bg-[#f0f3f6] text-zinc-800 font-sans selection:bg-zzz-orange/20">
      <header className="header h-16 border-b border-zinc-200/50 flex items-center px-6 bg-[#f0f3f6]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="left flex items-center gap-4">
          <div className="w-10 h-10 nm-orange-raised-interactive rounded-xl flex items-center justify-center text-white font-black">
            Z
          </div>
          <div>
            <h1 className="mt-1.5 text-sm font-black tracking-tight text-zinc-800 leading-none">ZENLESS LAB</h1>
            <p className="text-[10px] text-zinc-500 font-mono mt-1.5 uppercase tracking-widest">v{config.VERSION} • Neumorphism</p>
          </div>
        </div>
        
        <nav className="center flex gap-4 nm-raised p-2 rounded-xl">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 overflow-hidden ${
                activeTab === item.id 
                  ? 'text-zzz-orange nm-raised-active'
                  : 'nm-raised-interactive'
              }`}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-x-0 bottom-0 h-[3px] bg-zzz-orange"
                  transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                />
              )}
              <item.icon size={14} className={activeTab === item.id ? 'text-zzz-orange' : 'text-zinc-500'} />
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'CALC' && (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-8"
            >
              <ProfileManager 
                currentProfile={currentProfile} 
                onSelect={handleProfileSelect}
                onUpdate={setCurrentProfile}
              />
              <Calculator 
                stats={currentProfile.stats} 
                type={currentProfile.type}
                profileName={currentProfile.name}
                charPreset={currentProfile.char_preset}
                enginePreset={currentProfile.engine_preset}
                onStatsChange={(newStats, charPreset, enginePreset) => {
                  const updated: CharacterProfile = { ...currentProfile, stats: newStats };
                  if (charPreset !== undefined) updated.char_preset = charPreset;
                  if (enginePreset !== undefined) updated.engine_preset = enginePreset;
                  setCurrentProfile(updated);
                }}
                improvements={improvements}
                onImprovementsChange={setImprovements}
              />
            </motion.div>
          )}

          {activeTab === 'DRIVE' && (
            <motion.div
              key="drive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DriveManager />
            </motion.div>
          )}

          {activeTab === 'CURVE' && (
            <motion.div
              key="curve"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MarginalBenefitChart stats={currentProfile.stats} type={currentProfile.type} />
            </motion.div>
          )}

          {activeTab === 'FORMULA' && (
            <motion.div
              key="formula"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FormulaView />
            </motion.div>
          )}

          {activeTab === 'DOCS' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Docs />
            </motion.div>
          )}

          {activeTab === 'ME' && (
            <motion.div
              key="me"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Me />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-8 border-t border-zinc-200/60 mt-auto">
        <div className="text-zinc-500 font-medium max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>* 仅供数据模拟参考，具体数值以游戏内为准</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="flex items-center gap-1"><LayoutDashboard size={12} /> Urban Tech UI</span>
            <span className="flex items-center gap-1"><Github size={12} /> Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
