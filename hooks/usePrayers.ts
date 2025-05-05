import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import prayersData from '../assets/prayers.json';

export type Prayer = {
  id: string;
  title: string;
  text: string;
  category: string;
  duration: number;
};

export type UserPrayerData = {
  favorite: boolean;
  completed: boolean;
  lastCompleted?: string;
  completionCount: number;
};

export type PrayerWithUserData = Prayer & {
  userData: UserPrayerData;
};

const PRAYERS_STORAGE_KEY = '@RotinaAutoamor:prayers';

export const usePrayers = () => {
  const [prayers, setPrayers] = useState<PrayerWithUserData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredPrayers, setFilteredPrayers] = useState<PrayerWithUserData[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [currentTimer, setCurrentTimer] = useState<{
    prayerId: string;
    timeRemaining: number;
    duration: number;
  } | null>(null);

  // Initial loading of prayers
  useEffect(() => {
    const loadPrayers = async () => {
      setIsLoading(true);
      try {
        // Get user data from AsyncStorage
        const storedData = await AsyncStorage.getItem(PRAYERS_STORAGE_KEY);
        const userPrayerData: Record<string, UserPrayerData> = storedData 
          ? JSON.parse(storedData) 
          : {};
        
        // Combine predefined prayers with user data
        const combinedPrayers: PrayerWithUserData[] = prayersData.map((prayer: Prayer) => ({
          ...prayer,
          userData: userPrayerData[prayer.id] || {
            favorite: false,
            completed: false,
            completionCount: 0
          }
        }));

        setPrayers(combinedPrayers);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(prayersData.map((prayer: Prayer) => prayer.category))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error loading prayers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrayers();
  }, []);

  // Filter prayers based on selected category and favorites filter
  useEffect(() => {
    let filtered = [...prayers];
    
    if (selectedCategory) {
      filtered = filtered.filter(prayer => prayer.category === selectedCategory);
    }
    
    if (showFavoritesOnly) {
      filtered = filtered.filter(prayer => prayer.userData.favorite);
    }
    
    setFilteredPrayers(filtered);
  }, [prayers, selectedCategory, showFavoritesOnly]);

  // Save prayer user data to AsyncStorage
  const savePrayerData = async (updatedPrayers: PrayerWithUserData[]) => {
    try {
      const userDataOnly: Record<string, UserPrayerData> = {};
      updatedPrayers.forEach(prayer => {
        userDataOnly[prayer.id] = prayer.userData;
      });
      
      await AsyncStorage.setItem(PRAYERS_STORAGE_KEY, JSON.stringify(userDataOnly));
    } catch (error) {
      console.error('Error saving prayer data:', error);
    }
  };

  // Toggle favorite status for a prayer
  const toggleFavorite = (prayerId: string) => {
    const updatedPrayers = prayers.map(prayer => {
      if (prayer.id === prayerId) {
        return {
          ...prayer,
          userData: {
            ...prayer.userData,
            favorite: !prayer.userData.favorite
          }
        };
      }
      return prayer;
    });
    
    setPrayers(updatedPrayers);
    savePrayerData(updatedPrayers);
  };

  // Mark a prayer as completed
  const markCompleted = (prayerId: string) => {
    const now = new Date().toISOString();
    
    const updatedPrayers = prayers.map(prayer => {
      if (prayer.id === prayerId) {
        return {
          ...prayer,
          userData: {
            ...prayer.userData,
            completed: true,
            lastCompleted: now,
            completionCount: prayer.userData.completionCount + 1
          }
        };
      }
      return prayer;
    });
    
    setPrayers(updatedPrayers);
    savePrayerData(updatedPrayers);
  };

  // Start meditation timer for a prayer
  const startTimer = (prayerId: string) => {
    const prayer = prayers.find(p => p.id === prayerId);
    if (!prayer) return;
    
    setTimerActive(true);
    setCurrentTimer({
      prayerId,
      timeRemaining: prayer.duration * 60, // Convert minutes to seconds
      duration: prayer.duration * 60
    });
  };

  // Cancel active timer
  const cancelTimer = () => {
    setTimerActive(false);
    setCurrentTimer(null);
  };

  // Complete timer and mark prayer as completed
  const completeTimer = () => {
    if (currentTimer) {
      markCompleted(currentTimer.prayerId);
      setTimerActive(false);
      setCurrentTimer(null);
    }
  };

  // Update timer countdown
  const updateTimer = (seconds: number) => {
    if (currentTimer) {
      if (seconds <= 0) {
        completeTimer();
      } else {
        setCurrentTimer({
          ...currentTimer,
          timeRemaining: seconds
        });
      }
    }
  };

  return {
    prayers,
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
    completeTimer,
    updateTimer
  };
};

export default usePrayers; 