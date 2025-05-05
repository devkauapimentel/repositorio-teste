import React from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Board from '../components/Board';
import { Colors } from '../constants/theme';
import { StyleSheet } from 'react-native';
import BottomNavigation from '../components/BottomNavigation';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <Board />
            </SafeAreaView>
            <BottomNavigation />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    safeArea: {
        flex: 1,
    },
});