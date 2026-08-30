/**
 * @file ProfileManager.tsx
 * @description 角色档案管理组件（Zenless Lab 专属）。
 *
 * 提供角色档案的 CRUD 操作：
 * - 新建空白档案
 * - 保存当前档案到 localStorage
 * - 从档案列表中选择并加载已有档案
 * - 删除档案
 * - 编辑档案名称、角色类型、配队信息、备注
 *
 * 使用 localStorage 持久化存储，支持跨会话数据保留。
 */

import React, { useState, useEffect } from 'react';
import { CharacterProfile, CharacterType, DEFAULT_STATS } from '../../types';
import { storage } from '../../services/storage';
import { Save, Trash2, FolderOpen, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NeoSelect } from '../shared/NeoSelect';

/** ProfileManager 组件 Props */
interface ProfileManagerProps {
  /**
   * 选择档案回调
   * @param profile - 被选中的角色档案
   */
  onSelect: (profile: CharacterProfile) => void;
  /** 当前正在编辑的角色档案 */
  currentProfile: CharacterProfile;
  /**
   * 更新当前档案回调
   * @param profile - 更新后的角色档案
   */
  onUpdate: (profile: CharacterProfile) => void;
}

/**
 * ProfileManager — 角色档案管理
 *
 * 功能：
 * - 档案名称输入
 * - 角色类型选择（强攻/异常/命破）
 * - 配队与驱动盘信息表格（3 人队伍）
 * - 备注信息文本框
 * - 保存/新建/档案列表按钮
 * - 档案列表面板（展开/收起动画）
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const ProfileManager: React.FC<ProfileManagerProps> = ({ onSelect, currentProfile, onUpdate }) => {
  const [profiles, setProfiles] = useState<CharacterProfile[]>([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    setProfiles(storage.getProfiles());
  }, []);

  /**
   * 保存当前档案到 localStorage
   */
  const handleSave = () => {
    const saved = storage.saveProfile(currentProfile);
    onSelect(saved);
    setProfiles(storage.getProfiles());
  };

  /**
   * 删除指定 ID 的档案
   * @param id - 要删除的档案 ID
   */
  const handleDelete = (id: number) => {
    storage.deleteProfile(id);
    setProfiles(storage.getProfiles());
    if (currentProfile.id === id) {
      handleNew();
    }
  };

  /**
   * 创建新的空白档案
   */
  const handleNew = () => {
    onUpdate({
      name: '新档案',
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
    });
  };

  return (
    <div className="flex flex-col p-7 nm-raised rounded-2xl relative">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
          <FolderOpen size={20} className="text-zzz-orange" />
          角色档案管理
        </h2>
        <div className="flex gap-5">
          <button
            onClick={handleNew}
            className="p-3 nm-raised-interactive hover:text-zzz-orange text-zinc-500 rounded-xl transition-all"
            title="新建档案"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={handleSave}
            className="p-3 nm-orange-raised-interactive text-white rounded-xl transition-all"
            title="保存当前档案"
          >
            <Save size={18} />
          </button>
          <button
            onClick={() => setShowList(!showList)}
            className={`p-3 rounded-xl transition-all ${showList ? 'nm-raised-active text-zzz-orange' : 'nm-raised-interactive text-zinc-500'}`}
            title="打开档案列表"
          >
            <FolderOpen size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">档案名称</label>
          <input
            type="text"
            value={currentProfile.name}
            onChange={(e) => onUpdate({ ...currentProfile, name: e.target.value })}
            onFocus={(e) => e.target.select()}
            className="nm-sunken rounded-lg px-3.5 py-2.5 text-sm text-zinc-700 focus:outline-none focus:border-zzz-orange/40 focus:ring-1 focus:ring-zzz-orange/25 transition-all duration-300"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">角色类型</label>
          <NeoSelect
            value={currentProfile.type}
            onValueChange={(type) => onUpdate({ ...currentProfile, type: type as CharacterType })}
            buttonClassName="text-sm"
            options={[
              { value: 'ATTACK', label: '强攻' },
              { value: 'ANOMALY', label: '异常' },
              { value: 'STUN', label: '命破' },
            ]}
            ariaLabel="角色类型"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-zinc-500 tracking-wider">配队与驱动盘信息</label>
          <div className="overflow-x-auto nm-sunken rounded-xl border border-zinc-200/40 p-1">
            <table className="w-full text-sm text-left text-zinc-700 border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80">
                  <th className="py-2.5 px-3.5 font-medium text-zinc-500 text-[10px]">角色名称</th>
                  <th className="py-2.5 px-3.5 font-medium text-zinc-500 text-[10px]">音擎</th>
                  <th className="py-2.5 px-3.5 font-medium text-zinc-500 text-[10px]">4件套</th>
                  <th className="py-2.5 px-3.5 font-medium text-zinc-500 text-[10px]">2件套</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((idx) => (
                  <tr key={idx} className="border-b border-zinc-200/30 last:border-0 hover:bg-zinc-200/15 transition-colors">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={currentProfile.team?.[idx]?.name || ''}
                        onChange={(e) => {
                          const emptyTeam = [
                            { name: '', engine: '', drive4: '', drive2: '' },
                            { name: '', engine: '', drive4: '', drive2: '' },
                            { name: '', engine: '', drive4: '', drive2: '' },
                          ];
                          const newTeam = [...(currentProfile.team || emptyTeam)];
                          newTeam[idx] = { ...newTeam[idx], name: e.target.value };
                          onUpdate({ ...currentProfile, team: newTeam });
                        }}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] text-zinc-700 placeholder:text-zinc-400 font-medium focus:outline-none"
                        placeholder="角色"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={currentProfile.team?.[idx]?.engine || ''}
                        onChange={(e) => {
                          const emptyTeam = [
                            { name: '', engine: '', drive4: '', drive2: '' },
                            { name: '', engine: '', drive4: '', drive2: '' },
                            { name: '', engine: '', drive4: '', drive2: '' },
                          ];
                          const newTeam = [...(currentProfile.team || emptyTeam)];
                          newTeam[idx] = { ...newTeam[idx], engine: e.target.value };
                          onUpdate({ ...currentProfile, team: newTeam });
                        }}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] text-zinc-700 placeholder:text-zinc-400 font-medium focus:outline-none"
                        placeholder="音擎"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={currentProfile.team?.[idx]?.drive4 || ''}
                        onChange={(e) => {
                          const emptyTeam = [
                            { name: '', engine: '', drive4: '', drive2: '' },
                            { name: '', engine: '', drive4: '', drive2: '' },
                            { name: '', engine: '', drive4: '', drive2: '' },
                          ];
                          const newTeam = [...(currentProfile.team || emptyTeam)];
                          newTeam[idx] = { ...newTeam[idx], drive4: e.target.value };
                          onUpdate({ ...currentProfile, team: newTeam });
                        }}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] text-zinc-700 placeholder:text-zinc-400 font-medium focus:outline-none"
                        placeholder="4件套"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={currentProfile.team?.[idx]?.drive2 || ''}
                        onChange={(e) => {
                          const emptyTeam = [
                            { name: '', engine: '', drive4: '', drive2: '' },
                            { name: '', engine: '', drive4: '', drive2: '' },
                            { name: '', engine: '', drive4: '', drive2: '' },
                          ];
                          const newTeam = [...(currentProfile.team || emptyTeam)];
                          newTeam[idx] = { ...newTeam[idx], drive2: e.target.value };
                          onUpdate({ ...currentProfile, team: newTeam });
                        }}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] text-zinc-700 placeholder:text-zinc-400 font-medium focus:outline-none"
                        placeholder="2件套"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">备注信息</label>
          <textarea
            value={currentProfile.notes}
            onChange={(e) => onUpdate({ ...currentProfile, notes: e.target.value })}
            className="nm-sunken rounded-xl px-3.5 py-3 text-sm text-zinc-750 focus:outline-none focus:border-zzz-orange/40 focus:ring-1 focus:ring-zzz-orange/25 h-[153px] resize-none placeholder:text-zinc-500 transition-all duration-300"
            placeholder="输入角色备注..."
          />
        </div>
      </div>

      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="nm-sunken flex flex-col max-h-80 overflow-hidden overflow-y-auto rounded-xl"
          >
            <div className="flex flex-col gap-4 p-4">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3.5 nm-raised-interactive group rounded-xl">
                  <div className="flex flex-col cursor-pointer flex-1" onClick={() => { onSelect(p); setShowList(false); }}>
                    <span className="text-sm font-semibold text-zinc-700 group-hover:text-zzz-orange transition-colors duration-200">{p.name}</span>
                    <span className="text-xs text-zinc-500 font-mono mt-0.5">{p.type === 'ATTACK' ? '强攻' : p.type === 'ANOMALY' ? '异常' : '命破'} • {p.updated_at?.split('T')[0] || '未知时间'}</span>
                  </div>
                  <button onClick={() => handleDelete(p.id!)} className="delete-btn p-3 nm-raised-interactive hover:text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-zinc-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {profiles.length === 0 && <div className="text-center py-4 text-zinc-500 text-sm">暂无保存的档案</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};