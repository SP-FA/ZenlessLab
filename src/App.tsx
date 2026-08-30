/**
 * @file App.tsx
 * @description 应用根组件。
 *
 * 负责全局状态管理（子应用切换、Tab 导航、角色档案、词条提升值），
 * 以及三个子应用的路由分发：
 * - Zenless Lab：伤害计算分析
 * - Zenless Discal：驱动盘管理
 * - Mod Manager：Mod 管理（开发中）
 *
 * 子应用切换采用 motion/react 的 AnimatePresence 实现滑动动画。
 */

import { useState } from 'react';
import { useNeumorphicPressScale } from './hooks/useNeumorphicPressScale';
import { CharacterProfile, CharacterStats, DEFAULT_STATS } from './types';
import { ProfileManager } from './components/zenless/ProfileManager';
import { CalculatorPage } from './components/zenless/CalculatorPage';
import { FormulaView } from './components/zenless/FormulaView';
import { Docs as ZenlessDocs } from './components/zenless/Docs';
import { About as ZenlessAbout } from './components/zenless/About';
import { MarginalBenefitChart } from './components/zenless/MarginalBenefitChart';
import { DriveManager } from './components/zenlessdiscal/DriveManager';
import { Docs as ZenlessDiscalDocs } from './components/zenlessdiscal/Docs';
import { About as ZenlessDiscalAbout } from './components/zenlessdiscal/About';
import { ModManager } from './components/modmanager/ModManager';
import { Docs as ModManagerDocs } from './components/modmanager/Docs';
import { About as ModManagerAbout } from './components/modmanager/About';
import { Header, HeaderTab, SubApp } from './components/shared/Header';
import { PlaceholderPage } from './components/shared/Placeholder';
import { LayoutDashboard, Calculator as CalcIcon, BookOpen, FileCode, AtSign, Github, TrendingUp, Disc, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from './services/storage';

/** Zenless Lab 子应用的 Tab 标识 */
type Tab = 'CALC' | 'CURVE' | 'FORMULA' | 'DOCS' | 'ME';

/** Zenless Discal 子应用的 Tab 标识 */
type ZenlessDiscalTab = 'DRIVE' | 'DOCS' | 'ABOUT';

/** Mod Manager 子应用的 Tab 标识 */
type ModManagerTab = 'MODS' | 'DOCS' | 'ABOUT';

/** 子应用切换顺序 */
const subAppOrder: readonly SubApp[] = ['zenless', 'zenlessdiscal', 'modmanager'] as const;

/** Zenless Lab 导航 Tab 配置 */
const zenlessTabs: HeaderTab[] = [
  { id: 'CALC', label: '计算分析', icon: CalcIcon },
  { id: 'CURVE', label: '收益曲线', icon: TrendingUp },
  { id: 'FORMULA', label: '计算公式', icon: FileCode },
  { id: 'DOCS', label: '指南文档', icon: BookOpen },
  { id: 'ME', label: 'About', icon: AtSign },
];

/** Zenless Discal 导航 Tab 配置 */
const zenlessDiscalTabs: HeaderTab[] = [
  { id: 'DRIVE', label: '驱动盘仓库', icon: Disc },
  { id: 'DOCS', label: '指南文档', icon: BookOpen },
  { id: 'ABOUT', label: 'About', icon: AtSign },
];

/** Mod Manager 导航 Tab 配置 */
const modManagerTabs: HeaderTab[] = [
  { id: 'MODS', label: 'Mod Manager', icon: Package },
  { id: 'DOCS', label: '指南文档', icon: BookOpen },
  { id: 'ABOUT', label: 'About', icon: AtSign },
];

/** 页面切换动画过渡配置 */
const transition = { type: 'spring' as const, bounce: 0.1, duration: 0.4 };

/**
 * App — 应用根组件
 *
 * 全局状态：
 * - subApp：当前活跃的子应用
 * - direction：子应用切换方向（用于滑动动画）
 * - activeTab / zenlessDiscalTab / modManagerTab：各子应用的 Tab 状态
 * - currentProfile：当前编辑的角色档案
 * - improvements：词条提升值
 *
 * @returns JSX 元素
 */
export default function App() {
  useNeumorphicPressScale();
  const [subApp, setSubApp] = useState<SubApp>('zenless');
  const [direction, setDirection] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('CALC');
  const [zenlessDiscalTab, setZenlessDiscalTab] = useState<ZenlessDiscalTab>('DRIVE');
  const [modManagerTab, setModManagerTab] = useState<ModManagerTab>('MODS');
  const [currentProfile, setCurrentProfile] = useState<CharacterProfile>(() => {
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

  /**
   * 选择档案回调
   * @param profile - 被选中的角色档案
   */
  const handleProfileSelect = (profile: CharacterProfile) => {
    setCurrentProfile(profile);
  };

  /**
   * 切换子应用
   * 根据目标子应用相对于当前子应用的位置计算滑动方向
   * @param target - 目标子应用标识
   */
  const handleSwitchSubApp = (target: SubApp) => {
    const currentIndex = subAppOrder.indexOf(subApp);
    const targetIndex = subAppOrder.indexOf(target);
    setDirection(targetIndex > currentIndex ? 1 : -1);
    setSubApp(target);
    if (target === 'zenless') setActiveTab('CALC');
    else if (target === 'zenlessdiscal') setZenlessDiscalTab('DRIVE');
    else setModManagerTab('MODS');
  };

  /**
   * 属性变化回调
   * @param newStats - 新的属性值
   * @param charPreset - 角色预设
   * @param enginePreset - 音擎预设
   */
  const handleStatsChange = (newStats: CharacterStats, charPreset?: string, enginePreset?: string) => {
    const updated: CharacterProfile = { ...currentProfile, stats: newStats };
    if (charPreset !== undefined) updated.char_preset = charPreset;
    if (enginePreset !== undefined) updated.engine_preset = enginePreset;
    setCurrentProfile(updated);
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
          {/* ==================== Zenless Lab ==================== */}
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
              <CalculatorPage
                stats={currentProfile.stats}
                type={currentProfile.type}
                profileName={currentProfile.name}
                charPreset={currentProfile.char_preset}
                enginePreset={currentProfile.engine_preset}
                onStatsChange={handleStatsChange}
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
              <ZenlessDocs />
            </motion.div>
          )}

          {subApp === 'zenless' && activeTab === 'ME' && (
            <motion.div
              key="me"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ZenlessAbout />
            </motion.div>
          )}

          {/* ==================== Zenless Discal ==================== */}
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
            >
              <ZenlessDiscalDocs />
            </motion.div>
          )}

          {subApp === 'zenlessdiscal' && zenlessDiscalTab === 'ABOUT' && (
            <motion.div
              key="zd-about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ZenlessDiscalAbout />
            </motion.div>
          )}

          {/* ==================== Mod Manager ==================== */}
          {subApp === 'modmanager' && modManagerTab === 'MODS' && (
            <motion.div
              key="mm-mods"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ModManager />
            </motion.div>
          )}

          {subApp === 'modmanager' && modManagerTab === 'DOCS' && (
            <motion.div
              key="mm-docs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ModManagerDocs />
            </motion.div>
          )}

          {subApp === 'modmanager' && modManagerTab === 'ABOUT' && (
            <motion.div
              key="mm-about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ModManagerAbout />
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