import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import config from '../../config.json';

export interface HeaderTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface HeaderProps {
  subApp: 'zenless' | 'modmanager';
  activeTab: string;
  tabs: HeaderTab[];
  onTabChange: (tabId: string) => void;
  onSwitchSubApp: () => void;
  direction: number;
  transition: object;
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

export function Header({ subApp, activeTab, tabs, onTabChange, onSwitchSubApp, direction, transition }: HeaderProps) {
  const title = subApp === 'zenless' ? 'ZENLESS LAB' : 'ZZMI MOD MANAGER';
  const switchLabel = subApp === 'zenless' ? 'Mod Manager' : 'Zenless Lab';
  const SwitchIcon = subApp === 'zenless' ? ArrowRight : ArrowLeft;
  const layoutKey = subApp === 'zenless' ? 'activeTab-zl' : 'activeTab-mm';

  return (
    <header className="sticky top-0 z-50 px-4 pt-3">
      <div className="relative h-14">
        <AnimatePresence mode="sync" custom={direction}>
          <motion.div
            key={subApp}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0 header nm-raised rounded-2xl items-center px-4"
          >
          {/* Left: logo + title + version */}
          <div className="left flex items-center gap-3">
            <div className="w-9 h-9 nm-orange-raised-interactive rounded-lg flex items-center justify-center text-white font-black text-sm">
              Z
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tight text-zinc-800 leading-none">{title}</h1>
              <p className="text-[9px] text-zinc-500 font-mono mt-1 uppercase tracking-widest leading-none">v{config.VERSION}</p>
            </div>
          </div>

          {/* Center: navigation tabs */}
          <nav className="center flex gap-2 p-1.5">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 overflow-hidden ${
                  activeTab === item.id
                    ? 'text-zzz-orange nm-raised-active'
                    : 'nm-raised-interactive'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId={layoutKey}
                    className="absolute inset-x-0 bottom-0 h-[3px] bg-zzz-orange"
                    transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                  />
                )}
                <item.icon size={13} className={activeTab === item.id ? 'text-zzz-orange' : 'text-zinc-500'} />
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right: sub-app switch button */}
          <div className="right flex items-center justify-end">
            <button
              onClick={onSwitchSubApp}
              className="nm-raised-interactive flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-zinc-600"
            >
              {switchLabel}
              <SwitchIcon size={13} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      </div>
    </header>
  );
}
