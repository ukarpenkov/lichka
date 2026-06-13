# 14. Анимации (Reanimated)

**Дата:** 2026-06-13
**Промпт/задача:** Внедрение анимаций переходов и micro-interactions с помощью Reanimated

## Что сделано

### 14.1 Message entrance animations
- `MessageBubble`: `FadeInUp.springify()` с spring-физикой вместо duration-based, добавлен `FadeOutDown` для exiting и `Layout.springify()` для перестроения списка
- `ChatListItem`: `FadeInUp.springify()` entering + `Layout.springify()` для плавного reorder
- `ScheduledItem`: `FadeInUp.springify()` entering + `Layout.springify()`

### 14.2 Sticky date header
- `DateSeparator`: добавлен `FadeIn` entering animation
- Sticky date в `ChatRoomScreen` теперь использует `Animated.View` с `FadeIn/FadeOut` при смене даты

### 14.3 Scroll animations
- `ChatRoomScreen`: `AnimatedFlatList` с `useAnimatedScrollHandler` (throttle 16ms)
- Sticky date header анимируется через `useAnimatedStyle` + `withSpring`

### 14.4 useAnimatedKeyboard
- `MessageComposer`: `useAnimatedKeyboard` для плавного отслеживания клавиатуры
- Композер следует за клавиатурой без прыжков через `useAnimatedStyle` с interpolate

### 14.5 Voice recording
- Добавлен `Gesture.Pan()` для swipe-to-cancel во время записи
- Spring-анимация на кнопке остановки (`stopScale`)
- Плавное превью取消 свайпа через `panTranslateX`

### 14.6 Spring press feedback
- Создан `AnimatedPressable` — переиспользуемый компонент с `withSpring` scale (0.95)
- Заменены все `Pressable` с opacity-only feedback:
  - `ChatListItem` — AnimatedPressable
  - `ChatListScreen` FAB — AnimatedPressable с scaleTo=0.9
  - `MessageContextMenu` — AnimatedPressable
  - `ScheduledItem` — AnimatedPressable
  - `SearchOverlay` results — AnimatedPressable
  - `GlobalSearch` results — AnimatedPressable

### 14.7 Shared element transition (experimental)
- Создан `SharedElementAvatar` с `FEATURE_FLAGS.sharedElementAvatar` feature flag
- `SharedElementProvider` для контекста shared element frames
- `ChatListItem` и `ChatHeader` используют `sharedId` для потенциального shared transition
- По умолчанию `sharedElementAvatar: false` — fallback на обычный Avatar

### 14.8 Search/overlay animations
- `SearchOverlay`: `SlideInDown.springify()` entering, `FadeOut` exiting
- `GlobalSearch`: `SlideInDown.springify()` entering, `FadeOut` exiting
- `MessageContextMenu`: Reanimated `FadeIn/FadeOut` вместо Modal `animationType="fade"`

## Изменённые файлы
- `src/shared/lib/animations.ts` — spring/timing presets
- `src/shared/ui/AnimatedPressable.tsx` — новый компонент
- `src/shared/ui/SharedElementAvatar.tsx` — новый компонент
- `src/shared/ui/index.ts` — экспорт новых компонентов
- `src/shared/config/featureFlags.ts` — feature flags
- `src/shared/config/index.ts` — экспорт featureFlags
- `src/pages/chat-room/MessageBubble.tsx` — spring FadeInUp + FadeOutDown + Layout
- `src/pages/chat-room/ChatRoomScreen.tsx` — AnimatedFlatList + scroll handler + sticky date animations
- `src/pages/chat-room/DateSeparator.tsx` — FadeIn entering
- `src/pages/chat-room/SearchOverlay.tsx` — SlideInDown entering, AnimatedPressable
- `src/pages/chat-room/MessageContextMenu.tsx` — Reanimated FadeIn/FadeOut, AnimatedPressable
- `src/pages/chat-room/ChatHeader.tsx` — SharedElementAvatar
- `src/pages/chat-list/ChatListItem.tsx` — FadeInUp + Layout + AnimatedPressable + SharedElementAvatar
- `src/pages/chat-list/ChatListScreen.tsx` — AnimatedPressable FAB
- `src/pages/chat-list/GlobalSearch.tsx` — SlideInDown entering, AnimatedPressable
- `src/pages/scheduled/ScheduledItem.tsx` — FadeInUp + Layout + AnimatedPressable
- `src/widgets/message-composer/MessageComposer.tsx` — useAnimatedKeyboard + Pan gesture + spring stop button
- `App.tsx` — SharedElementProvider wrapper

## Принятые решения
- Spring-физика вместо duration-based для всех enter/exit анимаций — более естественное ощущение
- `AnimatedPressable` обёртка вместо ручного `useAnimatedStyle` в каждом компоненте
- Feature flag для shared element — experimental, по умолчанию выключен
- `useAnimatedKeyboard` с platform-specific logic (iOS прямой, Android с interpolate для clamp)

## Известные ограничения
- Shared element transition пока не реализован полностью — только wrapper с feature flag
- `AnimatedFlatList` типизирован как `any` из-за ограничений Reanimated typings
- `SPRING_PRESS` настроен на быстрый отклик (mass: 0.6), может потребовать тюнинга

## Тестирование
- TypeScript компиляция: pass
- Все компоненты обновлены с сохранением существующего API
- Reduce motion compatibility сохранена (useRef + AccessibilityInfo)
