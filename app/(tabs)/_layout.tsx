import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/theme';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primaryButton,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopColor: 'rgba(0,0,0,0.1)',
            height: Platform.OS === 'ios' ? 90 : 65,
            paddingBottom: Platform.OS === 'ios' ? 35 : 10,
            paddingTop: 8,
            ...Platform.select({
              android: {
                elevation: 8,
              },
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }
            }),
          },
          tabBarItemStyle: {
            paddingVertical: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: Platform.OS === 'ios' ? 0 : 5,
          },
          headerStyle: {
            backgroundColor: Colors.background,
            shadowColor: 'transparent',
            borderBottomWidth: 0,
            elevation: 0,
            height: Platform.OS === 'ios' ? 100 : 60,
          },
          headerTitleStyle: {
            fontFamily: 'PatrickHand_400Regular',
            fontSize: 22,
          },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Quadros',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="dashboard" size={size} color={color} />
            ),
            tabBarLabelStyle: {
              fontFamily: Fonts.bodyFamily,
            }
          }}
        />
        <Tabs.Screen
          name="calender"
          options={{
            title: 'Calendário',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="event" size={size} color={color} />
            ),
            tabBarLabelStyle: {
              fontFamily: Fonts.bodyFamily,
            }
          }}
        />
        <Tabs.Screen
          name="prayer"
          options={{
            title: 'Oração',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="favorite" size={size} color={color} />
            ),
            tabBarLabelStyle: {
              fontFamily: Fonts.bodyFamily,
            }
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
            tabBarLabelStyle: {
              fontFamily: Fonts.bodyFamily,
            }
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
