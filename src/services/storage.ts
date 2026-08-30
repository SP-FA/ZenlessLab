/**
 * @file storage.ts
 * @description localStorage 数据持久化服务。
 *
 * 提供角色档案和驱动盘数据的 CRUD 操作，数据通过 JSON 序列化存储在 localStorage 中。
 * 支持跨会话数据保留，旧版数据自动兼容（预设回填）。
 */

import { CharacterProfile, DriveDisc } from '../types';
import { CHARACTER_PRESETS, WENGINE_PRESETS } from '../utils/presets';

/** 角色档案存储键 */
const STORAGE_KEY = 'zzz_analyzer_profiles';

/** 驱动盘存储键 */
const DISC_STORAGE_KEY = 'zzz_analyzer_drive_discs';

/**
 * 根据生命值和攻击力反向匹配角色和音擎预设
 *
 * 用于兼容旧版数据（未存储 char_preset 和 engine_preset 的档案）。
 * 匹配策略：
 * 1. 优先匹配角色 + 音擎的完美组合
 * 2. 退而匹配仅角色（baseHp + baseAtk 完全一致）
 * 3. 再退而匹配仅角色（baseHp 一致）
 * 4. 最终回退为 'custom'
 *
 * @param hp - 生命值白值
 * @param atk - 攻击力白值
 * @returns 匹配到的角色和音擎预设名称
 */
function matchPresets(hp: number, atk: number): { char_preset: string; engine_preset: string } {
  for (const char of CHARACTER_PRESETS) {
    if (char.baseHp === hp) {
      const remainingAtk = atk - char.baseAtk;
      if (remainingAtk === 0) {
        return { char_preset: char.name, engine_preset: 'custom' };
      }
      const engine = WENGINE_PRESETS.find(w => w.baseAtk === remainingAtk);
      if (engine) {
        return { char_preset: char.name, engine_preset: engine.name };
      }
    }
  }

  for (const char of CHARACTER_PRESETS) {
    if (char.baseHp === hp && char.baseAtk === atk) {
      return { char_preset: char.name, engine_preset: 'custom' };
    }
  }

  const charByHp = CHARACTER_PRESETS.find(c => c.baseHp === hp);
  if (charByHp) {
    return { char_preset: charByHp.name, engine_preset: 'custom' };
  }

  return { char_preset: 'custom', engine_preset: 'custom' };
}

/**
 * localStorage 数据持久化服务
 *
 * 提供角色档案和驱动盘的完整 CRUD 操作。
 * 所有读取操作自动处理旧版数据兼容（预设回填）。
 */
export const storage = {
  /**
   * 获取所有角色档案
   *
   * 自动为旧版数据（缺少 char_preset/engine_preset）回填预设信息，
   * 并按更新时间降序排列。
   *
   * @returns 角色档案列表
   */
  getProfiles: (): CharacterProfile[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      const list = JSON.parse(data) as CharacterProfile[];

      const populatedList = list.map(profile => {
        if (profile.char_preset === undefined || profile.engine_preset === undefined) {
          const hp = profile.stats?.hp_base || 0;
          const atk = profile.stats?.atk_base || 0;
          const matched = matchPresets(hp, atk);
          return {
            ...profile,
            char_preset: profile.char_preset !== undefined ? profile.char_preset : matched.char_preset,
            engine_preset: profile.engine_preset !== undefined ? profile.engine_preset : matched.engine_preset,
          };
        }
        return profile;
      });

      return populatedList.sort((a, b) => {
        const timeA = a.updated_at || '';
        const timeB = b.updated_at || '';
        if (timeA && timeB) return timeB.localeCompare(timeA);
        if (timeA) return -1;
        if (timeB) return 1;
        return (b.id || 0) - (a.id || 0);
      });
    } catch (e) {
      console.error('Failed to parse storage data', e);
      return [];
    }
  },

  /**
   * 保存角色档案
   *
   * 如果档案已有 ID 则更新，否则创建新档案（自动生成 ID）。
   *
   * @param profile - 要保存的角色档案
   * @returns 保存后的档案（含自动生成的 ID 和更新时间）
   */
  saveProfile: (profile: CharacterProfile): CharacterProfile => {
    const profiles = storage.getProfiles();
    const now = new Date().toISOString();

    let updatedProfile: CharacterProfile;

    if (profile.id) {
      updatedProfile = { ...profile, updated_at: now };
      const index = profiles.findIndex(p => p.id === profile.id);
      if (index !== -1) {
        profiles[index] = updatedProfile;
      } else {
        profiles.push(updatedProfile);
      }
    } else {
      const newId = profiles.length > 0 ? Math.max(...profiles.map(p => p.id || 0)) + 1 : 1;
      updatedProfile = { ...profile, id: newId, updated_at: now };
      profiles.push(updatedProfile);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return updatedProfile;
  },

  /**
   * 删除角色档案
   * @param id - 要删除的档案 ID
   */
  deleteProfile: (id: number): void => {
    const profiles = storage.getProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  /**
   * 获取所有驱动盘
   * @returns 驱动盘列表
   */
  getDriveDiscs: (): DriveDisc[] => {
    const data = localStorage.getItem(DISC_STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data) as DriveDisc[];
    } catch (e) {
      console.error('Failed to parse drive disc storage data', e);
      return [];
    }
  },

  /**
   * 保存驱动盘
   *
   * 如果驱动盘已有 ID 则更新，否则创建新记录（自动生成 ID）。
   *
   * @param disc - 要保存的驱动盘
   * @returns 保存后的驱动盘（含自动生成的 ID 和更新时间）
   */
  saveDriveDisc: (disc: DriveDisc): DriveDisc => {
    const discs = storage.getDriveDiscs();
    const now = new Date().toISOString();
    let updatedDisc: DriveDisc;

    if (disc.id) {
      updatedDisc = { ...disc, updated_at: now };
      const index = discs.findIndex(d => d.id === disc.id);
      if (index !== -1) {
        discs[index] = updatedDisc;
      } else {
        discs.push(updatedDisc);
      }
    } else {
      const newId = 'disc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      updatedDisc = { ...disc, id: newId, updated_at: now };
      discs.push(updatedDisc);
    }

    localStorage.setItem(DISC_STORAGE_KEY, JSON.stringify(discs));
    return updatedDisc;
  },

  /**
   * 删除驱动盘
   * @param id - 要删除的驱动盘 ID
   */
  deleteDriveDisc: (id: string): void => {
    const discs = storage.getDriveDiscs();
    const filtered = discs.filter(d => d.id !== id);
    localStorage.setItem(DISC_STORAGE_KEY, JSON.stringify(filtered));
  }
};