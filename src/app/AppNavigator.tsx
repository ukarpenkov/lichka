import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, CalendarDays, Settings } from 'lucide-react-native';

import { useTheme } from '../shared/config/ThemeProvider';
import { ChatListScreen } from '../pages/chat-list';
import { ChatRoomScreen } from '../pages/chat-room';
import { ScheduledScreen } from '../pages/scheduled';
import { SettingsScreen } from '../pages/settings';

import type { ChatStackParamList } from './types';

// --- Navigators ---

const Stack = createNativeStackNavigator<ChatStackParamList>();
const Tab = createBottomTabNavigator();

function ChatStackScreen() {
  const { text, background } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: background },
        headerTintColor: text,
        headerTitleStyle: { color: text },
      }}>
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { text, background } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: background,
            borderTopColor: text + '20',
          },
          tabBarActiveTintColor: text,
          tabBarInactiveTintColor: text + '60',
        }}>
        <Tab.Screen
          name="ChatsTab"
          component={ChatStackScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MessageCircle color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="ScheduledTab"
          component={ScheduledScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <CalendarDays color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Settings color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
