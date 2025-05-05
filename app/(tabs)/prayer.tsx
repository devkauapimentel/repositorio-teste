import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, BorderRadius, Spacing } from '../../constants/theme';
import FontLoader from '../../components/FontLoader';
import { MaterialIcons } from '@expo/vector-icons';
import PrayerCard from '../../components/PrayerCard';
import usePrayers from '../../hooks/usePrayers';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

export default function PrayerScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const { 
    filteredPrayers, 
    categories, 
    selectedCategory, 
    isLoading, 
    showFavoritesOnly,
    timerActive,
    currentTimer,
    setSelectedCategory,
    setShowFavoritesOnly,
    toggleFavorite,
    markCompleted,
    startTimer,
    cancelTimer,
    updateTimer,
  } = usePrayers();

  // Handle prayer card expansion
  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Handle marking a prayer as completed
  const handleMarkCompleted = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markCompleted(id);
  };

  // Handle the meditation timer
  useEffect(() => {
    if (timerActive && currentTimer) {
      const interval = setInterval(() => {
        updateTimer(currentTimer.timeRemaining - 1);
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [timerActive, currentTimer]);

  // Format timer display
  const formatTimerDisplay = () => {
    if (!currentTimer) return '0:00';
    
    const minutes = Math.floor(currentTimer.timeRemaining / 60);
    const seconds = currentTimer.timeRemaining % 60;
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Calculate timer progress
  const calculateProgress = () => {
    if (!currentTimer) return 0;
    const progress = 1 - (currentTimer.timeRemaining / currentTimer.duration);
    return Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1
  };

  return (
    <FontLoader>
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Orações e Meditação</Text>
          
          {/* Categories Scroll */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === null && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === null && styles.categoryTextActive
              ]}>Todas</Text>
            </TouchableOpacity>
            
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Filters */}
          <View style={styles.filtersContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                showFavoritesOnly && styles.filterButtonActive
              ]}
              onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <MaterialIcons 
                name="favorite" 
                size={16} 
                color={showFavoritesOnly ? 'white' : Colors.textSecondary} 
              />
              <Text style={[
                styles.filterText,
                showFavoritesOnly && styles.filterTextActive
              ]}>Favoritos</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.content}>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primaryButton} />
          ) : (
            <FlatList
              data={filteredPrayers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PrayerCard
                  prayer={item}
                  onToggleFavorite={toggleFavorite}
                  onMarkCompleted={handleMarkCompleted}
                  onStartTimer={startTimer}
                  expanded={expandedId === item.id}
                  onToggleExpand={handleToggleExpand}
                />
              )}
              contentContainerStyle={styles.prayersList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <MaterialIcons name="search-off" size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyStateText}>
                    {showFavoritesOnly 
                      ? 'Você ainda não tem orações favoritas.' 
                      : 'Nenhuma oração encontrada.'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
        
        {/* Timer Overlay */}
        {timerActive && currentTimer && (
          <View style={styles.timerOverlay}>
            <BlurView intensity={80} style={styles.blurView} tint="light">
              <View style={styles.timerContainer}>
                <Text style={styles.timerTitle}>
                  Meditação em andamento
                </Text>
                
                <View style={styles.timerProgressContainer}>
                  <View 
                    style={[
                      styles.timerProgress, 
                      { width: `${calculateProgress() * 100}%` }
                    ]} 
                  />
                </View>
                
                <Text style={styles.timerDisplay}>
                  {formatTimerDisplay()}
                </Text>
                
                <Text style={styles.timerInstructions}>
                  Respire profundamente e concentre-se na sua intenção...
                </Text>
                
                <View style={styles.timerActions}>
                  <TouchableOpacity
                    style={styles.timerCancelButton}
                    onPress={cancelTimer}
                  >
                    <Text style={styles.timerButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.timerCompleteButton}
                    onPress={cancelTimer}
                  >
                    <Text style={styles.timerButtonText}>Concluir Agora</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        )}
      </SafeAreaView>
    </FontLoader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.titleFamily,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  categoriesContainer: {
    paddingVertical: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primaryButton,
  },
  categoryText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: Fonts.smallSize,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: 'white',
  },
  filtersContainer: {
    flexDirection: 'row',
    marginVertical: Spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryButton,
  },
  filterText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: Fonts.smallSize,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  filterTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  prayersList: {
    paddingVertical: Spacing.md,
    paddingBottom: 100, // Extra for bottom tab
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  timerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  timerTitle: {
    fontFamily: Fonts.titleFamily,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  timerProgressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  timerProgress: {
    height: '100%',
    backgroundColor: Colors.primaryButton,
  },
  timerDisplay: {
    fontFamily: Fonts.titleFamily,
    fontSize: 48,
    color: Colors.textPrimary,
    marginVertical: Spacing.lg,
  },
  timerInstructions: {
    fontFamily: Fonts.bodyFamily,
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  timerActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  timerCancelButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  timerCompleteButton: {
    backgroundColor: Colors.primaryButton,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  timerButtonText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: Fonts.bodySize,
    color: 'white',
  },
});
