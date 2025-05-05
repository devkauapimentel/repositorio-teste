import React, { ReactNode } from 'react';
import { View, ActivityIndicator } from 'react-native';
import {
    useFonts,
    PatrickHand_400Regular,
} from '@expo-google-fonts/patrick-hand';
import {
    ComicNeue_400Regular,
} from '@expo-google-fonts/comic-neue';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/theme';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

interface FontLoaderProps {
    children: ReactNode;
}

const FontLoader: React.FC<FontLoaderProps> = ({ children }) => {
    const [fontsLoaded] = useFonts({
        PatrickHand_400Regular,
        ComicNeue_400Regular,
        'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primaryButton} />
            </View>
        );
    }

    // Hide splash screen once fonts are loaded
    SplashScreen.hideAsync();

    return <>{children}</>;
};

export default FontLoader;