import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StatusBar } from 'react-native';
import {
  NavigationContainer,
  BaseNavigationContainer,
  NavigationIndependentTree,
  useNavigationContainerRef,
} from '@react-navigation/native';
import type { NavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessageCircle, CalendarDays, Settings } from 'lucide-react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '../shared/config/ThemeProvider';
import { useLocale } from '../shared/config/LocaleProvider';
import { fonts, typography } from '../shared/config/tokens';
import { withAlpha } from '../shared/lib/color';
import { ChatListScreen } from '../pages/chat-list';
import { ChatRoomScreen } from '../pages/chat-room';
import { ScheduledScreen } from '../pages/scheduled';
import { SettingsScreen, ThemePickerScreen } from '../pages/settings';
import { AlarmScreen } from '../pages/alarm';
import { useNotificationNavigation } from '../features/notifications';
import { SPRING_SNAP } from '../shared/lib/animations';

import { SwipeablePager, PagerTabBar } from './SwipeablePager';
import { MainTabsProvider, useMainTabs } from './MainTabsContext';
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

const CHAT_TAB_INDEX = 0;
const SETTINGS_TAB_INDEX = 2;

function NotificationHandler() {
  useNotificationNavigation();
  return null;
}

/** Синхронизация вложенного стека с pager + Android back → goBack вместо выхода. */
function useIndependentStackBridge(
  tabIndex: number,
  navRef: React.RefObject<{ canGoBack(): boolean; goBack(): void } | null>,
) {
  const { activeIndex, setNestedStackOpen } = useMainTabs();

  const syncNestedOpen = useCallback(
    (state: NavigationState | undefined) => {
      setNestedStackOpen(tabIndex, (state?.index ?? 0) > 0);
    },
    [tabIndex, setNestedStackOpen],
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeIndex !== tabIndex) return false;
      if (navRef.current?.canGoBack()) {
        navRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [activeIndex, tabIndex, navRef]);

  return syncNestedOpen;
}

function ChatStackScreen() {
  const { text, background } = useTheme();
  const navRef = useNavigationContainerRef<ChatStackParamList>();
  const syncNestedOpen = useIndependentStackBridge(CHAT_TAB_INDEX, navRef);
  const navTheme = React.useMemo(
    () => buildNavTheme(text, background),
    [text, background],
  );

  return (
    <NavigationIndependentTree>
      <BaseNavigationContainer
        ref={navRef}
        theme={navTheme}
        onStateChange={syncNestedOpen}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: background },
            headerTintColor: text,
            headerTitleStyle: { color: text },
            contentStyle: { backgroundColor: background },
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
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
  const navRef = useNavigationContainerRef<SettingsStackParamList>();
  const syncNestedOpen = useIndependentStackBridge(SETTINGS_TAB_INDEX, navRef);
  const navTheme = React.useMemo(
    () => buildNavTheme(text, background),
    [text, background],
  );

  return (
    <NavigationIndependentTree>
      <BaseNavigationContainer
        ref={navRef}
        theme={navTheme}
        onStateChange={syncNestedOpen}>
        <SettingsStack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: background },
            headerTintColor: text,
            headerTitleStyle: { color: text },
            contentStyle: { backgroundColor: background },
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}>
          <SettingsStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <SettingsStack.Screen
            name="ThemePicker"
            component={ThemePickerScreen}
            options={{
              title: t.themeTitle,
              headerTitleStyle: {
                fontFamily: fonts.display,
                fontSize: typography.display.fontSize,
                fontWeight: '400',
              },
            }}
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
      border: withAlpha(text, 0.12),
      notification: text,
    },
    fonts: {
      regular: { fontFamily: fonts.regular, fontWeight: '400' as const },
      medium: { fontFamily: fonts.medium, fontWeight: '500' as const },
      bold: { fontFamily: fonts.semiBold, fontWeight: '600' as const },
      heavy: { fontFamily: fonts.bold, fontWeight: '700' as const },
    },
  };
}

const TAB_ICONS = [MessageCircle, CalendarDays, Settings];

function MainTabsPager({
  activeIndex,
  onIndexChange,
}: {
  activeIndex: number;
  onIndexChange: (index: number, fromGesture: boolean) => void;
}) {
  const { colors } = useTheme();
  const { tabSwipeEnabled } = useMainTabs();

  return (
    <>
      <SwipeablePager
        index={activeIndex}
        onIndexChange={onIndexChange}
        enabled={tabSwipeEnabled}>
        <ChatStackScreen />
        <ScheduledScreen />
        <SettingsStackScreen />
      </SwipeablePager>
      <PagerTabBar
        activeIndex={activeIndex}
        onIndexChange={onIndexChange}
        icons={TAB_ICONS}
        activeColor={colors.ink}
        inactiveColor={colors.muted}
        backgroundColor={colors.canvas}
      />
    </>
  );
}

function MainTabs() {
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
      <MainTabsPager
        activeIndex={activeIndex}
        onIndexChange={handleIndexChange}
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
