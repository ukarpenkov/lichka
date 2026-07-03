import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, CalendarDays, Settings } from 'lucide-react-native';

import { useTheme } from '../shared/config/ThemeProvider';
import { useLocale } from '../shared/config/LocaleProvider';
import { ChatListScreen } from '../pages/chat-list';
import { ChatRoomScreen } from '../pages/chat-room';
import { ScheduledScreen } from '../pages/scheduled';
import { SettingsScreen, ThemePickerScreen } from '../pages/settings';
import { useNotificationNavigation, setNavigationReady } from '../features/notifications';

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
        contentStyle: { backgroundColor: background },
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
        contentStyle: { backgroundColor: background },
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

function isBackgroundDark(background: string): boolean {
  const hex = background.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
}

export function AppNavigator() {
  const { text, background } = useTheme();
  const isDark = isBackgroundDark(background);

  const navTheme = React.useMemo(
    () => ({
      dark: isDark,
      colors: {
        primary: text,
        background: background,
        card: background,
        text: text,
        border: text + '20',
        notification: text,
      },
      fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' as const },
        medium: { fontFamily: 'System', fontWeight: '500' as const },
        bold: { fontFamily: 'System', fontWeight: '700' as const },
        heavy: { fontFamily: 'System', fontWeight: '900' as const },
      },
    }),
    [text, background, isDark],
  );

  return (
    <NavigationContainer
      theme={navTheme}
      onReady={() => setNavigationReady()}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={background}
      />
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
              <CalendarDays color={color} size={size} />
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
