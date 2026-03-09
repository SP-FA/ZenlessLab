import React, { useState, useEffect } from 'react';
import { CharacterProfile, CharacterStats, CharacterType, DEFAULT_STATS, STAT_LABELS } from '../types';
import { StatInput } from './StatInput';
import { Save, Trash2, FolderOpen, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileManagerProps {
  onSelect: (profile: CharacterProfile) => void;
  currentProfile: CharacterProfile;
  onUpdate: (profile: CharacterProfile) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ onSelect, currentProfile, onUpdate }) => {
  const [profiles, setProfiles] = useState<CharacterProfile[]>([]);
  const [showList, setShowList] = useState(false);

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      // Ensure each profile has a team array of 3 objects
      const sanitizedData = data.map((p: CharacterProfile) => ({
        ...p,
        team: p.team || [
          { name: '', engine: '', drive4: '', drive2: '' },
          { name: '', engine: '', drive4: '', drive2: '' },
          { name: '', engine: '', drive4: '', drive2: '' },
        ]
      }));
      setProfiles(sanitizedData);
    } catch (err) {
      console.error('Failed to fetch profiles', err);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSave = async () => {
    try {
      const method = currentProfile.id ? 'PUT' : 'POST';
      const url = currentProfile.id ? `/api/profiles/${currentProfile.id}` : '/api/profiles';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProfile),
      });
      
      if (res.ok) {
        const result = await res.json();
        if (method === 'POST') {
          // Merge the new ID into the current profile data
          onSelect({ ...currentProfile, id: result.id });
        }
        fetchProfiles();
      }
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProfiles();
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleNew = () => {
    onUpdate({
      name: '新档案',
      type: 'ATTACK',
      stats: { ...DEFAULT_STATS },
      team: [
        { name: '', engine: '', drive4: '', drive2: '' },
        { name: '', engine: '', drive4: '', drive2: '' },
        { name: '', engine: '', drive4: '', drive2: '' },
      ],
      notes: ''
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
          <FolderOpen size={20} className="text-zzz-orange" />
          角色档案管理
        </h2>
        <div className="flex gap-2">
          <button onClick={handleNew} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-zinc-300" title="新建档案">
            <Plus size={18} />
          </button>
          <button onClick={handleSave} className="p-2 bg-zzz-orange hover:opacity-90 rounded-md transition-colors text-white" title="保存当前档案">
            <Save size={18} />
          </button>
          <button onClick={() => setShowList(!showList)} className={`p-2 rounded-md transition-colors ${showList ? 'bg-zzz-orange/10 text-zzz-orange border border-zzz-orange/20' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`} title="打开档案列表">
            <FolderOpen size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">档案名称</label>
          <input
            type="text"
            value={currentProfile.name}
            onChange={(e) => onUpdate({ ...currentProfile, name: e.target.value })}
            onFocus={(e) => e.target.select()}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zzz-orange"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">角色类型</label>
          <select
            value={currentProfile.type}
            onChange={(e) => onUpdate({ ...currentProfile, type: e.target.value as CharacterType })}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zzz-orange"
          >
            <option value="ATTACK">强攻 (Attack)</option>
            <option value="ANOMALY">异常 (Anomaly)</option>
            <option value="STUN">命破 (Stun/Support)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-zinc-400 tracking-wider">配队与驱动盘信息</label>
          <div className="overflow-x-auto bg-zinc-900/80 rounded-lg border border-zinc-800/50">
            <table className="w-full text-sm text-left text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="py-2 px-3 font-medium text-zinc-500 text-[10px]">角色名称</th>
                  <th className="py-2 px-3 font-medium text-zinc-500 text-[10px]">音擎</th>
                  <th className="py-2 px-3 font-medium text-zinc-500 text-[10px]">4件套</th>
                  <th className="py-2 px-3 font-medium text-zinc-500 text-[10px]">2件套</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((idx) => (
                  <tr key={idx} className="border-b border-zinc-800/100 last:border-0">
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
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
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
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
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
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
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
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                        placeholder="2件套"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">备注信息</label>
          <textarea
            value={currentProfile.notes}
            onChange={(e) => onUpdate({ ...currentProfile, notes: e.target.value })}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zzz-orange h-35 resize-none placeholder:text-zinc-600"
            placeholder="输入角色备注"
          />
        </div>
      </div>

      <AnimatePresence>
        {showList && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t border-zinc-800 pt-4 overflow-hidden"
          >
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 group transition-all">
                  <div className="flex flex-col cursor-pointer flex-1" onClick={() => { onSelect(p); setShowList(false); }}>
                    <span className="text-sm font-medium text-zinc-200">{p.name}</span>
                    <span className="text-xs text-zinc-500">{p.type === 'ATTACK' ? '强攻' : p.type === 'ANOMALY' ? '异常' : '命破'} · {p.updated_at?.split(' ')[0]}</span>
                  </div>
                  <button onClick={() => handleDelete(p.id!)} className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {profiles.length === 0 && <div className="text-center py-4 text-zinc-600 text-sm">暂无保存的档案</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
