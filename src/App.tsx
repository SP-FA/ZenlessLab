import { useState } from 'react';
import { useNeumorphicPressScale } from './hooks/useNeumorphicPressScale';
import { CharacterProfile, CharacterStats, DEFAULT_STATS } from './types';
import { ProfileManager } from './components/ProfileManager';
import { Calculator } from './components/Calculator';
import { FormulaView } from './components/FormulaView';
import { Docs } from './components/Docs';
import { Me } from './components/About';
import { MarginalBenefitChart } from './components/MarginalBenefitChart';
import { DriveManager } from './components/DriveManager';
import { Header, HeaderTab, SubApp } from './components/Header';
import { LayoutDashboard, Calculator as CalcIcon, BookOpen, FileCode, AtSign, Github, TrendingUp, Disc, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from './services/storage';

type Tab = 'CALC' | 'CURVE' | 'FORMULA' | 'DOCS' | 'ME';
type ZenlessDiscalTab = 'DRIVE' | 'DOCS' | 'ABOUT';
type ModManagerTab = 'MODS' | 'DOCS' | 'ABOUT';

const subAppOrder: readonly SubApp[] = ['zenless', 'zenlessdiscal', 'modmanager'] as const;

const zenlessTabs: HeaderTab[] = [
  { id: 'CALC', label: '计算分析', icon: CalcIcon },
  { id: 'CURVE', label: '收益曲线', icon: TrendingUp },
  { id: 'FORMULA', label: '计算公式', icon: FileCode },
  { id: 'DOCS', label: '指南文档', icon: BookOpen },
  { id: 'ME', label: 'About', icon: AtSign },
];

const zenlessDiscalTabs: HeaderTab[] = [
  { id: 'DRIVE', label: '驱动盘仓库', icon: Disc },
  { id: 'DOCS', label: '指南文档', icon: BookOpen },
  { id: 'ABOUT', label: 'About', icon: AtSign },
];

const modManagerTabs: HeaderTab[] = [
  { id: 'MODS', label: 'Mod Manager', icon: Package },
  { id: 'DOCS', label: '指南文档', icon: BookOpen },
  { id: 'ABOUT', label: 'About', icon: AtSign },
];

const transition = { type: 'spring' as const, bounce: 0.1, duration: 0.4 };

export default function App() {
  useNeumorphicPressScale();
  const [subApp, setSubApp] = useState<SubApp>('zenless');
  const [direction, setDirection] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('CALC');
  const [zenlessDiscalTab, setZenlessDiscalTab] = useState<ZenlessDiscalTab>('DRIVE');
  const [modManagerTab, setModManagerTab] = useState<ModManagerTab>('MODS');
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

  const handleSwitchSubApp = (target: SubApp) => {
    const currentIndex = subAppOrder.indexOf(subApp);
    const targetIndex = subAppOrder.indexOf(target);
    setDirection(targetIndex > currentIndex ? 1 : -1);
    setSubApp(target);
    if (target === 'zenless') setActiveTab('CALC');
    else if (target === 'zenlessdiscal') setZenlessDiscalTab('DRIVE');
    else setModManagerTab('MODS');
  };

  return (
    <div className="min-h-screen bg-[#f0f3f6] text-zinc-800 font-sans selection:bg-zzz-orange/20">
      <Header
        subApp={subApp}
        activeTab={
          subApp === 'zenless' ? activeTab :
          subApp === 'zenlessdiscal' ? zenlessDiscalTab :
          modManagerTab
        }
        tabs={
          subApp === 'zenless' ? zenlessTabs :
          subApp === 'zenlessdiscal' ? zenlessDiscalTabs :
          modManagerTabs
        }
        onTabChange={(id) => {
          if (subApp === 'zenless') setActiveTab(id as Tab);
          else if (subApp === 'zenlessdiscal') setZenlessDiscalTab(id as ZenlessDiscalTab);
          else setModManagerTab(id as ModManagerTab);
        }}
        onSwitchSubApp={handleSwitchSubApp}
        direction={direction}
        transition={transition}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {subApp === 'zenless' && activeTab === 'CALC' && (
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

          {subApp === 'zenless' && activeTab === 'CURVE' && (
            <motion.div
              key="curve"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MarginalBenefitChart stats={currentProfile.stats} type={currentProfile.type} />
            </motion.div>
          )}

          {subApp === 'zenless' && activeTab === 'FORMULA' && (
            <motion.div
              key="formula"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FormulaView />
            </motion.div>
          )}

          {subApp === 'zenless' && activeTab === 'DOCS' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Docs />
            </motion.div>
          )}

          {subApp === 'zenless' && activeTab === 'ME' && (
            <motion.div
              key="me"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Me />
            </motion.div>
          )}

          {subApp === 'zenlessdiscal' && zenlessDiscalTab === 'DRIVE' && (
            <motion.div
              key="zd-drive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DriveManager />
            </motion.div>
          )}

          {subApp === 'zenlessdiscal' && zenlessDiscalTab === 'DOCS' && (
            <motion.div
              key="zd-docs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="p-8 nm-raised rounded-2xl text-center">
                <h2 className="text-xl font-black text-zinc-800">指南文档</h2>
                <p className="text-sm text-zinc-500 mt-2">开发中...</p>
              </div>
            </motion.div>
          )}

          {subApp === 'zenlessdiscal' && zenlessDiscalTab === 'ABOUT' && (
            <motion.div
              key="zd-about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="p-8 nm-raised rounded-2xl text-center">
                <h2 className="text-xl font-black text-zinc-800">About</h2>
                <p className="text-sm text-zinc-500 mt-2">开发中...</p>
              </div>
            </motion.div>
          )}

          {subApp === 'modmanager' && modManagerTab === 'MODS' && (
            <motion.div
              key="mm-mods"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="p-8 nm-raised rounded-2xl text-center">
                <h2 className="text-xl font-black text-zinc-800">MOD MANAGER</h2>
                <p className="text-sm text-zinc-500 mt-2">Mod 管理器正在开发中...</p>
              </div>
            </motion.div>
          )}

          {subApp === 'modmanager' && modManagerTab === 'DOCS' && (
            <motion.div
              key="mm-docs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="p-8 nm-raised rounded-2xl text-center">
                <h2 className="text-xl font-black text-zinc-800">指南文档</h2>
                <p className="text-sm text-zinc-500 mt-2">开发中...</p>
              </div>
            </motion.div>
          )}

          {subApp === 'modmanager' && modManagerTab === 'ABOUT' && (
            <motion.div
              key="mm-about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="p-8 nm-raised rounded-2xl text-center">
                <h2 className="text-xl font-black text-zinc-800">About</h2>
                <p className="text-sm text-zinc-500 mt-2">开发中...</p>
              </div>
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
