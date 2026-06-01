import { CharacterProfile } from '../types';

const STORAGE_KEY = 'zzz_analyzer_profiles';

export const storage = {
  getProfiles: (): CharacterProfile[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
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
