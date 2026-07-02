import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, Settings } from 'lucide-react-native';
import { CalendarDaysIcon } from '../shared/ui';

import { useTheme } from '../shared/config/ThemeProvider';
import { useLocale } from '../shared/config/LocaleProvider';
import { ChatListScreen } from '../pages/chat-list';
import { ChatRoomScreen } from '../pages/chat-room';
import { ScheduledScreen } from '../pages/scheduled';
import { SettingsScreen, ThemePickerScreen } from '../pages/settings';
import { useNotificationNavigation } from '../features/notifications';

import type { ChatStackParamList, SettingsStackParamList } from './types';

// --- Navigators ---

const Stack = createNativeStackNavigator<ChatStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator();

function NotificationHandler() {
  useNotificationNavigation();
  return null;
}

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

function SettingsStackScreen() {
  const { text, background } = useTheme();
  const { t } = useLocale();

  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: background },
        headerTintColor: text,
        headerTitleStyle: { color: text },
      }}>
      <SettingsStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="ThemePicker"
        component={ThemePickerScreen}
        options={{ title: t.themeTitle }}
      />
    </SettingsStack.Navigator>
  );
}

export function AppNavigator() {
  const { text, background } = useTheme();

  return (
    <NavigationContainer>
      <NotificationHandler />
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
              <CalendarDaysIcon color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStackScreen}
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
