import { CharacterProfile } from '../types';
import { CHARACTER_PRESETS, WENGINE_PRESETS } from '../utils/presets';

const STORAGE_KEY = 'zzz_analyzer_profiles';

function matchPresets(hp: number, atk: number): { char_preset: string; engine_preset: string } {
  // 1. Try to find a perfect combination of character + engine where baseHp matches character baseHp
  // and character baseAtk + engine baseAtk matches total baseAtk perfectly.
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

  // 2. Try to match just character by baseHp and baseAtk
  for (const char of CHARACTER_PRESETS) {
    if (char.baseHp === hp && char.baseAtk === atk) {
      return { char_preset: char.name, engine_preset: 'custom' };
    }
  }

  // 3. Fallback to first character that matches baseHp
  const charByHp = CHARACTER_PRESETS.find(c => c.baseHp === hp);
  if (charByHp) {
    return { char_preset: charByHp.name, engine_preset: 'custom' };
  }

  // 4. Default to custom
  return { char_preset: 'custom', engine_preset: 'custom' };
}

export const storage = {
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
        if (timeA && timeB) {
          return timeB.localeCompare(timeA);
        }
        if (timeA) return -1;
        if (timeB) return 1;
        return (b.id || 0) - (a.id || 0);
      });
    } catch (e) {
      console.error('Failed to parse storage data', e);
      return [];
    }
  },

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

  deleteProfile: (id: number): void => {
    const profiles = storage.getProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};

