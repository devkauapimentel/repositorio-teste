import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/theme';
import FontLoader from '../../components/FontLoader';

export default function CalendarScreen() {
  return (
    <FontLoader>
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Calendário</Text>
          <Text style={styles.description}>
            A funcionalidade de calendário estará disponível em breve!
          </Text>
        </View>
      </SafeAreaView>
    </FontLoader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 60, // Extra padding for tab bar
  },
  title: {
    fontFamily: Fonts.titleFamily,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  description: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
