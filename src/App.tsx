import { useState } from 'react';
import { CharacterProfile, CharacterStats, DEFAULT_STATS } from './types';
import { ProfileManager } from './components/ProfileManager';
import { Calculator } from './components/Calculator';
import { FormulaView } from './components/FormulaView';
import { Docs } from './components/Docs';
import { Me } from './components/About';
import { MarginalBenefitChart } from './components/MarginalBenefitChart';
import { LayoutDashboard, Calculator as CalcIcon, BookOpen, FileCode, Github, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'CALC' | 'CURVE' | 'FORMULA' | 'DOCS' | 'ME';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('CALC');
  const [currentProfile, setCurrentProfile] = useState<CharacterProfile>({
    name: '新角色',
    type: 'ATTACK',
    stats: { ...DEFAULT_STATS },
    notes: ''
  });
  const [improvements, setImprovements] = useState<Partial<CharacterStats>>({});

  const handleProfileSelect = (profile: CharacterProfile) => {
    setCurrentProfile(profile);
    // Optional: Clear improvements when switching profiles? 
    // User might want to compare the same improvements across different profiles, 
    // so let's keep them for now.
  };

  const menuItems = [
    { id: 'CALC', label: '计算与分析', icon: CalcIcon },
    { id: 'CURVE', label: '边际收益曲线', icon: TrendingUp },
    { id: 'FORMULA', label: '计算公式', icon: FileCode },
    { id: 'DOCS', label: '使用文档', icon: BookOpen },
    { id: 'ME', label: 'About Me', icon: Github },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zzz-orange rounded-lg flex items-center justify-center text-zinc-950 font-bold">Z</div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-100">绝区零角色养成工具 <span className="text-zinc-600 font-normal text-sm ml-2">v0.3.0</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-zinc-900 text-zzz-orange border border-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
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
                onStatsChange={(newStats) => setCurrentProfile({ ...currentProfile, stats: newStats })}
                improvements={improvements}
                onImprovementsChange={setImprovements}
              />
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

      <footer className="py-8 border-t border-zinc-900 mt-auto">
        <div className="text-zzz-orange max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>* 仅供数据模拟参考，具体数值以游戏内为准</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><LayoutDashboard size={12} /> Urban Tech UI</span>
            <span className="flex items-center gap-1"><Github size={12} /> Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
