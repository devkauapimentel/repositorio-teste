import { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, ComicNeue_400Regular } from '@expo-google-fonts/comic-neue';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { setupApp, handleFirstRun } from './utils/setupApp';
import { useUserProfile } from './hooks/useUserProfile';
import { cleanupSounds } from './utils/soundEffects';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { profile, isLoading: profileLoading } = useUserProfile();

  // Load fonts
  const [fontsLoaded] = useFonts({
    ComicNeue_400Regular,
    PatrickHand_400Regular,
  });

  // Initialize app on first load
  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Perform initial setup and onboarding if needed
        await setupApp();
        await handleFirstRun();
      } catch (error) {
        console.error('Error preparing app:', error);
      } finally {
        setAppIsReady(true);
      }
    };

    prepareApp();
  }, []);

  // Hide splash screen once everything is loaded
  useEffect(() => {
    const hideSplash = async () => {
      if (appIsReady && fontsLoaded && !profileLoading) {
        await SplashScreen.hideAsync();
      }
    };

    hideSplash();
  }, [appIsReady, fontsLoaded, profileLoading]);

  // Sound cleanup on app exit
  useEffect(() => {
    return () => {
      cleanupSounds();
    };
  }, []);

  // If not ready, show nothing (splash screen will be visible)
  if (!appIsReady || !fontsLoaded || profileLoading) {
    return null;
  }

  // Import the main app component dynamically once we're ready
  const { default: AppRoot } = require('./app/_layout');

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <AppRoot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 