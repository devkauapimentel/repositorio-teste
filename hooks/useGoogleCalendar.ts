import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import { Task } from './useStorage';

// Initialize WebBrowser for redirect
WebBrowser.maybeCompleteAuthSession();

// Storage keys
const AUTH_STORAGE_KEY = '@RotinaAutoamor:googleAuth';
const CALENDAR_SYNC_KEY = '@RotinaAutoamor:calendarSync';

// Google API configuration
const CLIENT_ID = '123456789-abcdefghijklmnopqrst.apps.googleusercontent.com'; // Replace with your Google Client ID
const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

// Change this in a real app
const REDIRECT_URI = 'exp://localhost:19000';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export type GoogleAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
};

export type SyncSettings = {
  enabled: boolean;
  addNewTasks: boolean;
  markCompletedTasks: boolean;
  calendarId: string | null;
};

export const useGoogleCalendar = () => {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false,
  });
  
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    enabled: false,
    addNewTasks: true,
    markCompletedTasks: true,
    calendarId: 'primary',
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Setup auth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
      usePKCE: true,
      responseType: 'code',
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    discovery
  );

  // Load auth state and sync settings from storage
  useEffect(() => {
    const loadAuthState = async () => {
      setIsLoading(true);
      try {
        const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const storedSync = await AsyncStorage.getItem(CALENDAR_SYNC_KEY);
        
        if (storedAuth) {
          const auth = JSON.parse(storedAuth) as GoogleAuthState;
          
          // Check if token is expired and needs refresh
          if (auth.expiresAt && auth.expiresAt < Date.now()) {
            if (auth.refreshToken) {
              await refreshAccessToken(auth.refreshToken);
            } else {
              // If no refresh token, auth is invalid
              setAuthState({
                accessToken: null,
                refreshToken: null,
                expiresAt: null,
                isAuthenticated: false,
              });
            }
          } else {
            setAuthState(auth);
          }
        }
        
        if (storedSync) {
          setSyncSettings(JSON.parse(storedSync));
        }
      } catch (error) {
        console.error('Error loading Google auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAuthState();
  }, []);

  // Handle auth response
  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === 'success' && response.params.code) {
        setIsLoading(true);
        try {
          // Exchange code for tokens
          const tokenResult = await AuthSession.exchangeCodeAsync(
            {
              code: response.params.code,
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              extraParams: {
                code_verifier: request?.codeVerifier || '',
              },
            },
            discovery
          );
          
          // Default to 1 hour if expiresIn is undefined
          const expiresAt = Date.now() + (tokenResult.expiresIn || 3600) * 1000;
          
          const newAuthState: GoogleAuthState = {
            accessToken: tokenResult.accessToken,
            refreshToken: tokenResult.refreshToken || null,
            expiresAt: expiresAt,
            isAuthenticated: true,
          };
          
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
          setAuthState(newAuthState);
          
          // Initialize default sync settings if user is newly authenticated
          const storedSync = await AsyncStorage.getItem(CALENDAR_SYNC_KEY);
          if (!storedSync) {
            const defaultSettings: SyncSettings = {
              enabled: true,
              addNewTasks: true,
              markCompletedTasks: true,
              calendarId: 'primary',
            };
            await AsyncStorage.setItem(CALENDAR_SYNC_KEY, JSON.stringify(defaultSettings));
            setSyncSettings(defaultSettings);
          }
        } catch (error) {
          console.error('Error exchanging code for token:', error);
          Alert.alert('Erro', 'Não foi possível autenticar com o Google Calendar.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleAuthResponse();
  }, [response, request]);

  // Refresh expired token
  const refreshAccessToken = async (refreshToken: string) => {
    try {
      // Use this URL for testing
      const tokenEndpoint = 'https://oauth2.googleapis.com/token';
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
      });
      
      const data = await response.json();
      
      if (data.access_token) {
        const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
        
        const newAuthState: GoogleAuthState = {
          accessToken: data.access_token,
          refreshToken: refreshToken, // Keep the existing refresh token
          expiresAt: expiresAt,
          isAuthenticated: true,
        };
        
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
        setAuthState(newAuthState);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Sign out and clear tokens
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      
      setAuthState({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        isAuthenticated: false,
      });
      
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  };

  // Update sync settings
  const updateSyncSettings = async (newSettings: Partial<SyncSettings>) => {
    try {
      const updatedSettings = { ...syncSettings, ...newSettings };
      await AsyncStorage.setItem(CALENDAR_SYNC_KEY, JSON.stringify(updatedSettings));
      setSyncSettings(updatedSettings);
      
      return true;
    } catch (error) {
      console.error('Error updating sync settings:', error);
      return false;
    }
  };

  // Create calendar event from task
  const createEventFromTask = async (task: Task) => {
    if (!authState.accessToken || !syncSettings.enabled) return null;
    
    try {
      const { title, description, dueDate } = task;
      
      // Default event time is 1 hour
      const startTime = dueDate ? new Date(dueDate) : new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
      
      const event = {
        summary: title,
        description: description || 'Tarefa do App RotinaAutoamor',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
          useDefault: true,
        },
      };
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${syncSettings.calendarId || 'primary'}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authState.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Error creating event:', data.error);
        return null;
      }
      
      return data.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  };

  // Get user calendars
  const getUserCalendars = async () => {
    if (!authState.accessToken) return [];
    
    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authState.accessToken}`,
          },
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Error fetching calendars:', data.error);
        return [];
      }
      
      return data.items || [];
    } catch (error) {
      console.error('Error fetching user calendars:', error);
      return [];
    }
  };

  return {
    authState,
    syncSettings,
    isLoading,
    promptLogin: () => promptAsync({ showInRecents: true }),
    signOut,
    updateSyncSettings,
    createEventFromTask,
    getUserCalendars,
  };
};

export default useGoogleCalendar; 