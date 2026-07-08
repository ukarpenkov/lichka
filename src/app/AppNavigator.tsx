import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
  BaseNavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessageCircle, CalendarDays, Settings } from 'lucide-react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '../shared/config/ThemeProvider';
import { useLocale } from '../shared/config/LocaleProvider';
import { ChatListScreen } from '../pages/chat-list';
import { ChatRoomScreen } from '../pages/chat-room';
import { ScheduledScreen } from '../pages/scheduled';
import { SettingsScreen, ThemePickerScreen } from '../pages/settings';
import { AlarmScreen } from '../pages/alarm';
import { useNotificationNavigation } from '../features/notifications';
import { SPRING_SNAP } from '../shared/lib/animations';

import { SwipeablePager, PagerTabBar } from './SwipeablePager';
import { MainTabsProvider } from './MainTabsContext';
import { setMainTabsApi, setNavigationReady } from './mainTabsApi';

import type {
  RootStackParamList,
  ChatStackParamList,
  SettingsStackParamList,
} from './types';

// --- Navigators ---

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<ChatStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function NotificationHandler() {
  useNotificationNavigation();
  return null;
}

function ChatStackScreen() {
  const { text, background } = useTheme();
  const navTheme = React.useMemo(
    () => buildNavTheme(text, background),
    [text, background],
  );

  return (
    <NavigationIndependentTree>
      <BaseNavigationContainer theme={navTheme}>
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
      </BaseNavigationContainer>
    </NavigationIndependentTree>
  );
}

function SettingsStackScreen() {
  const { text, background } = useTheme();
  const { t } = useLocale();
  const navTheme = React.useMemo(
    () => buildNavTheme(text, background),
    [text, background],
  );

  return (
    <NavigationIndependentTree>
      <BaseNavigationContainer theme={navTheme}>
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
      </BaseNavigationContainer>
    </NavigationIndependentTree>
  );
}

function isBackgroundDark(background: string): boolean {
  const hex = background.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
}

function buildNavTheme(text: string, background: string) {
  const isDark = isBackgroundDark(background);
  return {
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
  };
}

const TAB_ICONS = [MessageCircle, CalendarDays, Settings];

function MainTabs() {
  const { text, background } = useTheme();
  const indexSV = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const fromGestureRef = useRef(false);

  const handleIndexChange = useCallback(
    (index: number, fromGesture: boolean) => {
      if (fromGesture) {
        fromGestureRef.current = true;
      }
      setActiveIndex(index);
    },
    [],
  );

  // Программный переход (тап по иконке / вызов API) — анимируем shared value.
  useEffect(() => {
    if (fromGestureRef.current) {
      fromGestureRef.current = false;
      return;
    }
    indexSV.value = withSpring(activeIndex, SPRING_SNAP);
  }, [activeIndex, indexSV]);

  // Регистрируем imperative API для программного переключения табов
  // (уведомления, переходы из Запланировано).
  useEffect(() => {
    const api = {
      switchToTab: (i: number) => handleIndexChange(i, false),
    };
    setMainTabsApi(api);
    return () => setMainTabsApi(null);
  }, [handleIndexChange]);

  return (
    <MainTabsProvider activeIndex={activeIndex}>
      <SwipeablePager
        index={activeIndex}
        onIndexChange={handleIndexChange}
        enabled={true}>
        <ChatStackScreen />
        <ScheduledScreen />
        <SettingsStackScreen />
      </SwipeablePager>
      <PagerTabBar
        activeIndex={activeIndex}
        onIndexChange={handleIndexChange}
        icons={TAB_ICONS}
        activeColor={text}
        inactiveColor={text + '60'}
        backgroundColor={background}
        borderColor={text + '20'}
      />
    </MainTabsProvider>
  );
}

export function AppNavigator() {
  const { text, background } = useTheme();
  const isDark = isBackgroundDark(background);

  const navTheme = React.useMemo(
    () => buildNavTheme(text, background),
    [text, background],
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
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainTabs} />
        <RootStack.Screen
          name="Alarm"
          component={AlarmScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
