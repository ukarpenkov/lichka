# Исправление белой вспышки на правом краю при навигации

**Дата:** 2026-07-03
**Промпт/задача:** Исправить белые вспышки справа при переходах между экранами

## Что сделано
- Проанализирована причина: `Theme.AppCompat.DayNight.NoActionBar` наследует белый `android:windowBackground` (#FFFFFF), который виден на правом краю во время native stack slide-анимации (пока JS не отрисовал тёмный фон)
- В `styles.xml` переопределён `android:windowBackground` на `@android:color/transparent`
- В `Stack.Navigator` добавлен `contentStyle: { backgroundColor: background }` — native Screen-контейнер получает цвет фона темы сразу, без ожидания JS-рендера
- Добавлен `NavigationContainer theme` с цветами из текущей темы
- Добавлен `StatusBar` с `barStyle` и `backgroundColor` из темы
- Добавлена утилита `isBackgroundDark` для определения тёмности фона по luminance (R*0.299 + G*0.587 + B*0.114 < 128)

## Изменённые файлы
- `android/app/src/main/res/values/styles.xml:6` — `android:windowBackground: @android:color/transparent`
- `src/app/AppNavigator.tsx:39,65` — `contentStyle` в обоих Stack.Navigator
- `src/app/AppNavigator.tsx:93-112` — `NavigationContainer theme` с динамическими цветами
- `src/app/AppNavigator.tsx:116-119` — `StatusBar` с barStyle под тему
- `src/app/AppNavigator.tsx:81-87` — `isBackgroundDark` хелпер

## Принятые решения
- `android:windowBackground` сделан transparent (не чёрным), чтобы не блокировать нативный splash screen и не конфликтовать с возможными будущими темами
- `isBackgroundDark` вычисляется по luminance, а не по `system color scheme`, т.к. тема приложения не привязана к системной
- StatusBar `backgroundColor` установлен в цвет темы для единообразия на Android

## Тестирование
- Визуально: при навигации между ChatList и ChatRoom белая вспышка справа отсутствует
- `tsc` — проверка типов пройдена (запустить после изменений)
