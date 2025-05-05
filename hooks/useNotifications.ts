import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { Task } from './useStorage';

// Notification settings storage key
const NOTIFICATION_SETTINGS_KEY = '@RotinaAutoamor:notificationSettings';

// Types
export type NotificationSettings = {
  enabled: boolean;
  remindersEnabled: boolean;
  reminderTime: number; // Minutes before due date
};

// Default settings
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  remindersEnabled: true,
  reminderTime: 30, // 30 minutes before by default
};

// Task notification mapping storage
const NOTIFICATION_MAPPING_KEY = '@RotinaAutoamor:notificationMapping';

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [notificationMapping, setNotificationMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Configure notifications on mount
  useEffect(() => {
    const configureNotifications = async () => {
      setIsLoading(true);
      
      try {
        // Configure notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        
        // Load notification settings
        const storedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        } else {
          await AsyncStorage.setItem(
            NOTIFICATION_SETTINGS_KEY, 
            JSON.stringify(DEFAULT_NOTIFICATION_SETTINGS)
          );
        }
        
        // Load notification mapping
        const storedMapping = await AsyncStorage.getItem(NOTIFICATION_MAPPING_KEY);
        if (storedMapping) {
          setNotificationMapping(JSON.parse(storedMapping));
        }
        
        // Check notification permissions
        await checkPermissions();
      } catch (error) {
        console.error('Error configuring notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    configureNotifications();
    
    // Listen for notification responses
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Handle notification tap if needed
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  // Check and request notification permissions
  const checkPermissions = async (): Promise<boolean> => {
    if (!Device.isDevice) {
      // Notifications don't work in simulators/emulators
      setHasPermission(false);
      return false;
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    const hasPermission = finalStatus === 'granted';
    setHasPermission(hasPermission);
    
    return hasPermission;
  };

  // Update notification settings
  const updateSettings = async (newSettings: Partial<NotificationSettings>): Promise<boolean> => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY, 
        JSON.stringify(updatedSettings)
      );
      
      setSettings(updatedSettings);
      
      // If notifications were disabled, cancel all scheduled ones
      if (!updatedSettings.enabled || !updatedSettings.remindersEnabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      } else {
        // Reactivate notifications for tasks if they were turned back on
        // This would require re-scheduling all task notifications
        // You'd need to get all tasks and their due dates from elsewhere
        // ...
      }
      
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  };

  // Schedule a notification for a task
  const scheduleTaskNotification = async (
    task: Task,
    minutesBefore: number = settings.reminderTime
  ): Promise<string | null> => {
    if (!settings.enabled || !settings.remindersEnabled || !hasPermission) {
      return null;
    }
    
    // Only schedule if task has a due date
    if (!task.dueDate) {
      return null;
    }
    
    try {
      // Calculate notification time (X minutes before due date)
      const dueDate = new Date(task.dueDate);
      const notificationTime = new Date(dueDate.getTime() - minutesBefore * 60 * 1000);
      
      // Don't schedule if notification time is in the past
      if (notificationTime <= new Date()) {
        return null;
      }
      
      // Cancel any existing notification for this task
      await cancelTaskNotification(task.id);
      
      // Schedule the new notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lembrete de Tarefa',
          body: `Não esqueça: "${task.title}"`,
          data: { taskId: task.id },
          sound: true,
        },
        trigger: notificationTime,
      });
      
      // Save mapping of task ID to notification ID
      const updatedMapping = { ...notificationMapping, [task.id]: notificationId };
      await AsyncStorage.setItem(NOTIFICATION_MAPPING_KEY, JSON.stringify(updatedMapping));
      setNotificationMapping(updatedMapping);
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  // Cancel a notification for a task
  const cancelTaskNotification = async (taskId: string): Promise<boolean> => {
    try {
      const notificationId = notificationMapping[taskId];
      
      if (notificationId) {
        // Cancel the notification
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        
        // Remove from mapping
        const updatedMapping = { ...notificationMapping };
        delete updatedMapping[taskId];
        await AsyncStorage.setItem(NOTIFICATION_MAPPING_KEY, JSON.stringify(updatedMapping));
        setNotificationMapping(updatedMapping);
      }
      
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  };

  // Send an immediate notification
  const sendImmediateNotification = async (
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<string | null> => {
    if (!settings.enabled || !hasPermission) {
      return null;
    }
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // null means send immediately
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      return null;
    }
  };

  return {
    settings,
    hasPermission,
    isLoading,
    checkPermissions,
    updateSettings,
    scheduleTaskNotification,
    cancelTaskNotification,
    sendImmediateNotification,
  };
};

export default useNotifications; 