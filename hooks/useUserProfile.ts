import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors as DefaultColors } from '../constants/theme';
import { Alert } from 'react-native';

export type ThemePreset = 'default' | 'blue' | 'green' | 'purple' | 'custom';

export type ThemeColors = {
  background: string;
  listHeader: string;
  card: string;
  primaryButton: string;
  secondaryButton: string;
  deleteButton: string;
  textPrimary: string;
  textSecondary: string;
  checkboxBorder: string;
  checkboxFill: string;
  checkboxCheck: string;
  inputFocusBorder: string;
};

export type UserProfile = {
  name: string;
  photoUri: string | null;
  themePreset: ThemePreset;
  customColors: ThemeColors | null;
  activeThemeColors: ThemeColors;
};

// Theme presets
const themePresets: Record<Exclude<ThemePreset, 'custom'>, ThemeColors> = {
  default: DefaultColors,
  blue: {
    background: '#E6F2FF',
    listHeader: '#B3D9FF',
    card: '#FFFFFF',
    primaryButton: '#4D94FF',
    secondaryButton: '#1A75FF',
    deleteButton: '#FF6347',
    textPrimary: '#333333',
    textSecondary: '#666666',
    checkboxBorder: '#FFF',
    checkboxFill: '#4D94FF',
    checkboxCheck: '#FFF',
    inputFocusBorder: '#4D94FF',
  },
  green: {
    background: '#E6FFF2',
    listHeader: '#B3FFD9',
    card: '#FFFFFF',
    primaryButton: '#4DFFB8',
    secondaryButton: '#1AFF93',
    deleteButton: '#FF6347',
    textPrimary: '#333333',
    textSecondary: '#666666',
    checkboxBorder: '#FFF',
    checkboxFill: '#4DFFB8',
    checkboxCheck: '#FFF',
    inputFocusBorder: '#4DFFB8',
  },
  purple: {
    background: '#F0E6FF',
    listHeader: '#D9B3FF',
    card: '#FFFFFF',
    primaryButton: '#9966FF',
    secondaryButton: '#7F33FF',
    deleteButton: '#FF6347',
    textPrimary: '#333333',
    textSecondary: '#666666',
    checkboxBorder: '#FFF',
    checkboxFill: '#9966FF',
    checkboxCheck: '#FFF',
    inputFocusBorder: '#9966FF',
  },
};

// Default user profile
const DEFAULT_PROFILE: UserProfile = {
  name: 'Usuário',
  photoUri: null,
  themePreset: 'default',
  customColors: null,
  activeThemeColors: DefaultColors,
};

// Storage key
const PROFILE_STORAGE_KEY = '@RotinaAutoamor:userProfile';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from storage on mount
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile) as UserProfile;
          
          // Make sure activeThemeColors is always updated with current theme
          if (parsedProfile.themePreset === 'custom' && parsedProfile.customColors) {
            parsedProfile.activeThemeColors = parsedProfile.customColors;
          } else {
            parsedProfile.activeThemeColors = 
              themePresets[parsedProfile.themePreset as Exclude<ThemePreset, 'custom'>];
          }
          
          setProfile(parsedProfile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, []);

  // Save profile to storage
  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };

  // Update profile name
  const updateName = async (name: string) => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return false;
    }
    
    const updatedProfile = { ...profile, name };
    const success = await saveProfile(updatedProfile);
    
    if (success) {
      setProfile(updatedProfile);
    }
    
    return success;
  };

  // Update profile photo
  const updatePhoto = async (photoUri: string | null) => {
    const updatedProfile = { ...profile, photoUri };
    const success = await saveProfile(updatedProfile);
    
    if (success) {
      setProfile(updatedProfile);
    }
    
    return success;
  };

  // Change theme preset
  const changeThemePreset = async (preset: ThemePreset) => {
    let updatedProfile: UserProfile;
    
    if (preset === 'custom') {
      if (!profile.customColors) {
        // Initialize custom colors with current active theme
        updatedProfile = {
          ...profile,
          themePreset: preset,
          customColors: { ...profile.activeThemeColors },
          activeThemeColors: { ...profile.activeThemeColors },
        };
      } else {
        // Use existing custom colors
        updatedProfile = {
          ...profile,
          themePreset: preset,
          activeThemeColors: { ...profile.customColors },
        };
      }
    } else {
      // Use a predefined theme preset
      updatedProfile = {
        ...profile,
        themePreset: preset,
        activeThemeColors: themePresets[preset],
      };
    }
    
    const success = await saveProfile(updatedProfile);
    
    if (success) {
      setProfile(updatedProfile);
    }
    
    return success;
  };

  // Update custom theme colors
  const updateCustomColors = async (colors: Partial<ThemeColors>) => {
    if (profile.themePreset !== 'custom') {
      // If not already using custom theme, switch to it first
      await changeThemePreset('custom');
    }
    
    const updatedCustomColors = {
      ...(profile.customColors || profile.activeThemeColors),
      ...colors,
    };
    
    const updatedProfile = {
      ...profile,
      customColors: updatedCustomColors,
      activeThemeColors: updatedCustomColors,
    };
    
    const success = await saveProfile(updatedProfile);
    
    if (success) {
      setProfile(updatedProfile);
    }
    
    return success;
  };

  // Reset theme to default
  const resetTheme = async () => {
    return changeThemePreset('default');
  };

  return {
    profile,
    isLoading,
    updateName,
    updatePhoto,
    changeThemePreset,
    updateCustomColors,
    resetTheme,
    themePresets,
  };
};

export default useUserProfile; 