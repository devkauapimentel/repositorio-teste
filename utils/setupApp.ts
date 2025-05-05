import AsyncStorage from '@react-native-async-storage/async-storage';
import { initSounds } from './soundEffects';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Function to set up necessary app configurations at startup
export const setupApp = async (): Promise<void> => {
  try {
    // Configure notification handler for app
    if (Device.isDevice) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
    
    // Initialize sound settings
    await initSounds();
    
    // Additional setup can be added here
    // - Migration logic between app versions
    // - Default data creation
    // - Any other one-time setup
    
    console.log('App setup completed successfully');
  } catch (error) {
    console.error('Error during app setup:', error);
  }
};

// Function to check if app is running for the first time
export const isFirstRun = async (): Promise<boolean> => {
  try {
    const hasRun = await AsyncStorage.getItem('@RotinaAutoamor:hasRun');
    
    if (!hasRun) {
      // Mark that the app has run
      await AsyncStorage.setItem('@RotinaAutoamor:hasRun', 'true');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if first run:', error);
    return false;
  }
};

// Function to handle app onboarding for first-time users
export const handleFirstRun = async (): Promise<void> => {
  try {
    const firstRun = await isFirstRun();
    
    if (firstRun) {
      console.log('First run detected, performing onboarding setup');
      
      // Create default data or show onboarding
      // This is where you'd set up initial prayer data, example tasks, etc.
    }
  } catch (error) {
    console.error('Error during first run setup:', error);
  }
};

export default {
  setupApp,
  isFirstRun,
  handleFirstRun,
}; 