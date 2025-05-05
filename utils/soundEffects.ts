import { Audio, AVPlaybackSource } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type SoundType = 'success' | 'notification' | 'timer' | 'click';

// Sound settings storage key
const SOUND_SETTINGS_KEY = '@RotinaAutoamor:soundSettings';

/**
 * Sound settings for the app
 */
export type SoundSettings = {
  enabled: boolean;
  volume: number;
};

// Default sound settings
const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.7, // 70% volume by default
};

/**
 * Map of sound types to their asset files
 * Note: These files need to be added to the project assets
 */
const soundAssets: Record<SoundType, any> = {
  success: require('../assets/sounds/success.mp3'),
  notification: require('../assets/sounds/notification.mp3'),
  timer: require('../assets/sounds/timer.mp3'),
  click: require('../assets/sounds/click.mp3'),
};

// Cache for loaded sounds
const soundCache: Record<SoundType, Audio.Sound | null> = {
  success: null,
  notification: null,
  timer: null,
  click: null,
};

/**
 * Initialize sound settings
 * @returns The current sound settings
 */
export const initSounds = async (): Promise<SoundSettings> => {
  try {
    // Load settings from AsyncStorage
    const storedSettings = await AsyncStorage.getItem(SOUND_SETTINGS_KEY);
    
    if (storedSettings) {
      return JSON.parse(storedSettings) as SoundSettings;
    }
    
    // If no stored settings, save and return defaults
    await AsyncStorage.setItem(
      SOUND_SETTINGS_KEY, 
      JSON.stringify(DEFAULT_SOUND_SETTINGS)
    );
    
    return DEFAULT_SOUND_SETTINGS;
  } catch (error) {
    console.error('Error initializing sound settings:', error);
    return DEFAULT_SOUND_SETTINGS;
  }
};

/**
 * Update sound settings
 * @param settings New sound settings
 * @returns Success status
 */
export const updateSoundSettings = async (
  settings: Partial<SoundSettings>
): Promise<boolean> => {
  try {
    // Get current settings
    const currentSettings = await initSounds();
    
    // Update settings
    const updatedSettings = {
      ...currentSettings,
      ...settings,
    };
    
    // Save updated settings
    await AsyncStorage.setItem(
      SOUND_SETTINGS_KEY, 
      JSON.stringify(updatedSettings)
    );
    
    return true;
  } catch (error) {
    console.error('Error updating sound settings:', error);
    return false;
  }
};

/**
 * Play a sound effect
 * @param type Type of sound to play
 * @returns Promise that resolves when sound is done playing
 */
export const playSound = async (type: SoundType): Promise<void> => {
  try {
    // Get current settings
    const settings = await initSounds();
    
    // If sounds are disabled, do nothing
    if (!settings.enabled) {
      return;
    }
    
    // If sound is not loaded yet, load it
    if (!soundCache[type]) {
      const { sound } = await Audio.Sound.createAsync(soundAssets[type]);
      soundCache[type] = sound;
    }
    
    const sound = soundCache[type];
    if (!sound) return;
    
    // Make sure any previous playing of this sound is stopped
    try {
      await sound.stopAsync();
    } catch (e) {
      // Ignore errors from stopping - the sound might not be playing
    }
    
    // Set volume based on settings
    await sound.setVolumeAsync(settings.volume);
    
    // Play the sound
    await sound.playAsync();
  } catch (error) {
    console.error(`Error playing ${type} sound:`, error);
  }
};

/**
 * Cleanup function to unload all sounds
 * Call this when app is being closed or component unmounted
 */
export const cleanupSounds = async (): Promise<void> => {
  try {
    for (const type of Object.keys(soundCache) as SoundType[]) {
      const sound = soundCache[type];
      if (sound) {
        await sound.unloadAsync();
        soundCache[type] = null;
      }
    }
  } catch (error) {
    console.error('Error cleaning up sounds:', error);
  }
};

export default {
  playSound,
  initSounds,
  updateSoundSettings,
  cleanupSounds,
}; 