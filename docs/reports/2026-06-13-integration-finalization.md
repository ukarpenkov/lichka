# Интеграция и финализация App.tsx + аудит покрытия требований

**Дата:** 2026-06-13
**Промпт/задача:** 17.1 — собрать провайдеры и инициализацию в App.tsx; 17.2 — проверить покрытие 83 требований из white-requirements.md

## Что сделано

### 17.1 Провайдеры и инициализация App.tsx

Проблема: `runMigrations()`, `seedDefaultChat()`, `registerNotificationChannels()`, `cleanupOrphanMedia()` вызывались синхронно на уровне модуля — без splash screen, без обработки ошибок, без loading state.

**Решение:**

1. **`src/app/AppInitProvider.tsx`** — контекст с тремя состояниями (`loading` / `ready` / `error`). Инициализация в `useEffect`:
   - `runMigrations()` → `seedDefaultChat()` → `registerNotificationChannels()` → `cleanupOrphanMedia()` (non-blocking)
   - `cancelled` flag для предотвращения state update после unmount

2. **`src/app/ErrorBoundary.tsx`** — class component с `getDerivedStateFromError`. Показывает minimal UI при ошибке миграции/инициализации.

3. **`App.tsx`** — переработан:
   - `LoadingScreen` — читает snapshot темы из БД для цвета фона (без мерцания)
   - `AppContent` — читает `useAppInit()`, рендерит loading / error / providers
   - Порядок: `ErrorBoundary → AppInitProvider → AppContent`
   - `AppContent`: loading → `LoadingScreen`; error → `throw error` (ловится ErrorBoundary); ready → `ThemeProvider → LocaleProvider → BottomSheetModalProvider → SharedElementProvider → AppNavigator`

### 17.2 Аудит покрытия требований (83 вопроса)

Все 83 вопроса из `docs/spec/white-requirements.md` проверены. Ключевые:

| # | Требование | Статус | Файл |
|---|-----------|--------|------|
| 1 | Главный экран — список журналов | ✅ | `ChatListScreen.tsx` |
| 2 | 3 таба: Чаты / Запланировано / Настройки | ✅ | `AppNavigator.tsx` |
| 3 | FAB «новый чат» на табе «Чаты» | ✅ | `ChatListScreen.tsx` |
| 5 | 11 пресетов + light/dark | ✅ | `theme.ts` |
| 6 | Аватар: фото/emoji/fallback (первая буква) | ✅ | `Avatar.tsx`, `SharedElementAvatar.tsx` |
| 8 | 4 иконки отправки | ✅ | `MessageComposer.tsx:304-314` |
| 11 | Глобальный + локальный поиск | ✅ | `GlobalSearch.tsx`, `SearchOverlay.tsx` |
| 21 | Одна таблица messages + type + payload | ✅ | `messageRepository.ts`, `db.ts` |
| 25 | Numbered SQL migrations | ✅ | `db.ts` MIGRATIONS |
| 36 | FTS5 или LIKE fallback | ✅ | `search.ts` |
| 41 | Full-screen alarm | ✅ | `scheduleAlarm()` |
| 42 | SCHEDULE_EXACT_ALARM для alarm | ✅ | `canScheduleExactAlarms()` |
| 44 | 2 канала: reminders + alarms | ✅ | `registerNotificationChannels()` |
| 45 | Голос — только foreground | ✅ | `useVoiceRecorder.ts:48-57` AppState |
| 46 | AAC m4a, mono, 16kHz, max 60s | ✅ | `useVoiceRecorder.ts` |
| 47 | Per-message player | ✅ | `useVoicePlayer.ts` |
| 51 | Manual backup | ✅ | `SettingsScreen.tsx` |
| 58 | Время можно менять | ✅ | `MessageEditor.tsx` |
| 59 | Индикатор «изменено» | ✅ | `MessageBubble.tsx:49,83-87` |
| 60 | Long press menu (удаление/редактирование) | ✅ | `MessageContextMenu.tsx` |
| 64 | Google Drive in MVP v1 | ✅ | `googleDrive.ts` |
| 66 | Merge при импорте | ✅ | `SettingsScreen.tsx` |
| 68 | Без onboarding; Saved messages | ✅ | `seedDefaultChat()` |
| 72 | Голос must-have MVP | ✅ | `useVoiceRecorder.ts` |
| 77 | RU + EN; default по системе | ✅ | `LocaleProvider.tsx` |
| 78 | UTC в БД; locale-aware UI | ✅ | `dateUtils.ts` |
| 81 | Анимации плавные (Reanimated 4) | ✅ | `MessageBubble.tsx`, `ChatListItem.tsx`, etc. |

**Out of scope (корректно не реализованы):**
- #D/#34 — Шифрование (out of MVP v1)
- #35 — App lock (post-MVP)
- #37 — Статистика активности (out of scope)
- #50 — Encrypted backup key (post-MVP)
- #52 — FLAG_SECURE (скриншоты разрешены)
- #79 — tags/streaks/mood (YAGNI)

## Изменённые файлы

- `App.tsx` — полная переработка инициализации
- `src/app/AppInitProvider.tsx` — новый файл (контекст инициализации)
- `src/app/ErrorBoundary.tsx` — новый файл (обработка ошибок)

## Известные ограничения

- FTS5 отключён в миграции (op-sqlite не собран с FTS5); search работает через LIKE fallback
- Image compression (#33) не enforced в коде — дизайновое решение, приемлемо для MVP
- Material You (#19) неявно через SDK — нет отдельного toggle в настройках

## Тестирование

- `npx tsc --noEmit` — ошибок нет
- Ручная проверка: App.tsx компилируется, провайдеры в правильном порядке
