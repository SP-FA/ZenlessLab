import React from 'react';
import { Github, Mail, CheckCircle, Circle, HardDrive, Gamepad2, Info } from 'lucide-react';
import { 
  Terminal, Cpu, Heart, Award, Sparkles, Send, Copy, Check, ShieldCheck 
} from 'lucide-react';
import { motion } from 'motion/react';
import avatarImg from '../assets/images/spfa_avatar_1780302650134.png';
import bgImg from '../assets/images/bg.png';


export const Me: React.FC = () => {
  return (
    <div>
      <div className="w-full nm-raised p-8 rounded-3xl grid grid-cols-1 lg:grid-cols-18 gap-4 items-center">
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-6 nm-sunken rounded-2xl">
          <div className="relative mb-5 group">
            <div className="nm-raised flex w-28 h-28 rounded-full justify-center items-center">
                <img 
                  src={avatarImg} 
                  alt="SPFA Avatar" 
                  className="w-25 h-25 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
            </div>
          </div>

          <h2 className="text-xl font-black text-zinc-800 tracking-tight flex items-center gap-1.5 justify-center">
            SPFA
          </h2>
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-zinc-200 to-transparent my-4"></div>

          <p className="text-xs text-zinc-600 leading-relaxed text-left px-2">
            👋 Hi there, 我是 SPFA，感谢使用本工具，欢迎随时与我联系！
          </p>
          <div className="flex flex-col justify-center gap-1 mt-4 w-full border border-zinc-300 rounded-xl p-3">
            <span className="font-bold text-x">
            Contact with me
            </span>
            <div className="w-full h-[2px] bg-gradient-to-r via-zinc-200 my-1"></div>
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 justify-center p-2 nm-raised p-2 text-xs rounded-lg font-bold">
                <Gamepad2 size={14} className="text-zzz-orange" />
                UID：
              </span>
              <a 
                href="https://github.com/SP-FA/ZenlessLab" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 justify-center p-2 nm-raised text-xs font-bold rounded-lg text-zzz-orange"
              >
                <Github size={14} />
                SP-FA / ZenlessLab
              </a>
              <a 
                href="mailto:2997839760@qq.com" 
                className="inline-flex items-center gap-2 justify-center p-2 nm-raised text-xs font-bold rounded-lg text-zzz-orange"
              >
                <Mail size={14} className="text-zzz-orange" />
                2997839760@qq.com
              </a>
            </div>
          </div>
        </div>
        <div className="lg:col-span-13 h-full p-2 flex nm-raised-big rounded-xl">
            <div 
              className="w-full h-full rounded-lg nm-sunken-focus-within" 
              style={{ 
                backgroundImage: `url(${bgImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'left'
              }}
            >
              {/* <img 
                src={bgImg} 
                alt="Background" 
                className="h-full object-cover object-left rounded-lg"
                referrerPolicy="no-referrer"
              /> */}
            </div>
        </div>
      </div>

      <div className="nm-raised mt-8 p-6 rounded-3xl">
        <div className="mt-1 mb-5 text-center">
          <h2 className="text-xl font-bold text-zinc-800 mb-2 flex items-center justify-center gap-2">
            <Cpu size={20} className="text-zzz-orange" />
            TODO
          </h2>
          <p className="text-sm text-zinc-500">💪 我会尽量完成</p>
        </div>
        <div className="p-6 nm-sunken rounded-2xl mb-6">        
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs text-zinc-650">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="text-[#00aa00] shrink-0" size={14} />
                <span className="line-through text-zinc-600">完成边际效益曲线绘制</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="text-[#00aa00] shrink-0" size={14} />
                <span className="line-through text-zinc-600">公式可视化与拆解说明</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="text-[#00aa00] shrink-0" size={14} />
                <span className="line-through text-zinc-600">绝区零核心使用指南文档</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="text-[#00aa00] shrink-0" size={14} />
                <span className="line-through text-zinc-600">档案添加战斗队伍与配队信息</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="text-[#00aa00] shrink-0" size={14} />
                <span className="line-through text-zinc-600">桌面端与PWA离线化架构注入</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="text-[#00aa00] shrink-0" size={14} />
                <span>自动拉取各角色白值</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Circle className="text-zzz-orange/70 shrink-0" size={14} />
                <span>制作 Logo</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Circle className="text-zzz-orange/70 shrink-0" size={14} />
                <span>加入异放机制</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Circle className="text-zzz-orange/70 shrink-0" size={14} />
                <span>智能决策并引荐最优驱动盘搭配</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Circle className="text-zzz-orange/70 shrink-0" size={14} />
                <span>保存代理人+配队+驱动盘快照</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Circle className="text-zzz-orange/70 shrink-0" size={14} />
                <span>加入风属性机制</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Circle className="text-zzz-orange/70 shrink-0" size={14} />
                <span>加入流明属性机制</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Circle className="text-zzz-orange/70 shrink-0" size={14} />
                <span>加入御锋职业</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Circle className="text-zzz-orange/70 shrink-0" size={14} />
                <span>加入黑夜模式</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-[20px] font-mono tracking-[0.25em] text-zinc-500 uppercase">
            - 新艾利都，永不落幕 -
          </p>
        </div>
      </div>
    </div>
  );
};
