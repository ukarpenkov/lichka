# План разработки Lichka — промты

> **Правило выполнения:** перед тем как брать следующий промт, убедиться что предыдущий отмечен как `[x]`. Если нет — сначала завершить предыдущий. После выполнения промта — пометить `[x]` и создать отчёт в `docs/reports/`.

> **Итог:** после выполнения всех промтов должно получиться рабочее приложение, соответствующее всем требованиям из `docs/spec/white-requirements.md`.

---

## 1. Инфраструктура и зависимости

- [x] **1.1 Установить зависимости проекта**
  Установи все необходимые зависимости для проекта Lichka (React Native, bare, Android-only). Нужны:
  — `@op-engineering/op-sqlite` (SQLite)
  — `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack` (навигация)
  — `react-native-gesture-handler` (жесты для анимаций и picker)
  — `react-native-safe-area-context`, `react-native-screens` (нативная навигация)
  — `react-native-svg` (для кастомного picker даты/времени)
  — `@react-native-async-storage/async-storage` (понадобится для кэша темы если будет проблема cold start)
  Проверь что проект собирается после установки. Следи за совместимостью с RN 0.85.3 и React 19.

- [x] **1.2 Настроить SQLite и миграции**
  Создай в `src/shared/db/` систему миграций:
  — Файл `migrations/001_initial.sql` — создание таблиц `chats`, `messages`, `schema_migrations`
  — `chats`: id (TEXT, primary key, uuid), title (TEXT NOT NULL), avatar_path (TEXT nullable), created_at (TEXT NOT NULL, UTC ISO8601), updated_at (TEXT NOT NULL)
  — `messages`: id (TEXT, primary key, uuid), chat_id (TEXT NOT NULL, FK → chats.id ON DELETE CASCADE), type (TEXT NOT NULL, CHECK in simple/reminder/alarm/periodic), body (TEXT NOT NULL DEFAULT ''), scheduled_at (TEXT nullable, UTC), interval_minutes (INTEGER nullable), enabled (INTEGER nullable, 0/1), payload (TEXT nullable, JSON), created_at (TEXT NOT NULL, UTC), updated_at (TEXT NOT NULL, UTC)
  — `schema_migrations`: version (INTEGER PRIMARY KEY)
  — Модуль `db.ts` в `src/shared/db/` — инициализация БД через op-sqlite, функция `runMigrations()` которая читает SQL-файлы, сравнивает с `schema_migrations`, применяет недостающие в транзакции. Экспортируй `getDatabase()` и `runMigrations()`.
  — Протестируй: создать БД, прогнать миграцию, проверить что таблицы существуют.

- [x] **1.3 Создать FTS5 миграцию и функцию поиска**
  Добавь миграцию `002_fts5.sql`:
  — Виртуальная таблица `messages_fts` USING fts5(body, content=messages, content_rowid=rowid)
  — Триггеры INSERT/UPDATE/DELETE на `messages` для синхронизации с FTS
  В `src/shared/db/` добавь функцию `searchMessages(query: string, chatId?: string)` — полнотекстовый поиск, возвращает массив сообщений с подсветкой. Если `chatId` передан — поиск только по этому чату, иначе глобальный.

---

## 2. Тема и shared UI

- [x] **2.1 Реализовать систему тем (11 пресетов + light/dark)**
  Создай `src/shared/config/theme.ts`:
  — Тип `ThemePreset`: `{ id: string, name: string, background: string, text: string }`
  — 11 пресетов из ТЗ (#5): green-on-black, amber, cyan, blue, pink, light-gray, cream, mint, lavender, parchment, white-on-navy
  — Дефолтная light: bg `#FAFAFA`, text `#000000`
  — Дефолтная dark: bg `#000000`, text `#FFFFFF`
  — Функция `getTheme(id: string): ThemePreset`
  — Хук `useTheme()` — читает текущую тему из контекста, возвращает `{ background, text, preset }`
  — `ThemeProvider` в `src/shared/config/ThemeProvider.tsx` — React Context, хранит текущий пресет, переключатель `setTheme(id)`
  — Настройки хранятся в SQLite таблице `settings` (key-value). Создай миграцию `003_settings.sql` с таблицей `settings` (key TEXT PRIMARY KEY, value TEXT)
  — При старте приложения — загрузить тему из `settings`, если нет — дефолтная light

- [x] **2.2 Создать базовые shared UI-компоненты**
  Создай в `src/shared/ui/`:
  — `Text.tsx` — базовый текст с цветом из темы (автоматически подставляет `color` из `useTheme`)
  — `Button.tsx` — text-кнопка без border, без primary/secondary различия; поддержка `onPress`, `disabled`
  — `IconButton.tsx` — кнопка-иконка (принимает `name` системной иконки или `source` для кастомной, `size`, `onPress`)
  — `Screen.tsx` — обёртка экрана с `backgroundColor` из темы и `SafeAreaView`
  — `Input.tsx` — текстовое поле с цветами из темы, поддержка `multiline`, `placeholder`
  Все компоненты — через `useTheme()`. Экспорт через `src/shared/ui/index.ts`.

---

## 3. Сущности (entities)

- [x] **3.1 Создать entity Chat**
  Создай `src/entities/chat/`:
  — `model/types.ts`: тип `Chat { id, title, avatarPath, createdAt, updatedAt }`
  — `model/chatRepository.ts`: CRUD-операции с SQLite — `createChat(title, avatarPath)`, `getChats()`, `getChatById(id)`, `updateChat(id, fields)`, `deleteChat(id)` (hard delete + удаление файлов аватара). При создании — генерировать UUID, заполнять timestamps.
  — `index.ts`: экспорт типов и repository
  — Покрой unit-тестами: создание, получение списка, обновление, удаление

- [ ] **3.2 Создать entity Message**
  Создай `src/entities/message/`:
  — `model/types.ts`: тип `Message { id, chatId, type: 'simple'|'reminder'|'alarm'|'periodic', body, scheduledAt, intervalMinutes, enabled, payload, createdAt, updatedAt }`
  — `model/messageRepository.ts`: CRUD — `createMessage(chatId, type, body, scheduledAt?, intervalMinutes?, payload?)`, `getMessagesByChatId(chatId)`, `getMessageById(id)`, `updateMessage(id, fields)`, `deleteMessage(id)` (hard delete + удаление медиафайлов), `searchMessages(query, chatId?)` (через FTS5), `getScheduledMessages()` (все reminder/alarm/periodic с enabled=1 и scheduled_at > now или type=periodic), `getMessagesForChatAtTime(chatId)` — reminder/alarm которые должны появиться в ленте (scheduled_at <= now)
  — `index.ts`: экспорт
  — Покрой unit-тестами

- [ ] **3.3 Создать entity Settings**
  Создай `src/entities/settings/`:
  — `model/types.ts`: тип `AppSettings { themePresetId, hapticEnabled, soundEnabled, locale }`
  — `model/settingsRepository.ts`: `getSettings()`, `updateSettings(partial)` — чтение/запись в таблицу `settings` SQLite
  — `index.ts`: экспорт

---

## 4. Навигация

- [ ] **4.1 Настроить навигацию (3 таба + stack внутри «Чаты»)**
  Настрой React Navigation в `src/app/`:
  — `AppNavigator.tsx` — `BottomTabNavigator` с 3 табами: **Чаты** (иконка чата), **Запланировано** (иконка календаря/часов), **Настройки** (иконка шестерёнки). Иконки — системные Material Icons. Без text-лейблов, только иконки.
  — Внутри таба «Чаты» — `NativeStackNavigator`: экран `ChatList` (по умолчанию) и `ChatRoom` (экран чата). Shared element transition на аватар — feature flag (experimental, можно отложить).
  — Провайдеры: `NavigationContainer` обёрнут в `ThemeProvider`
  — `App.tsx` — рендерит `AppNavigator` внутри провайдеров, запускает `runMigrations()` при старте
  — Цвет таб-бара: из темы (background/text)

---

## 5. Страницы и виджеты — Таб «Чаты»

- [ ] **5.1 Экран списка чатов (ChatList)**
  Создай `src/pages/chat-list/`:
  — Вертикальный список чатов (FlatList или FlashList если установим позже)
  — Элемент списка: круглый аватар (48dp) + название чата. Аватар: если `avatarPath` есть — картинка; если нет — fallback: первая буква названия в круге, цветом текста темы (монохром).
  — Тап по чату → навигация в `ChatRoom` с `chatId`
  — FAB «+» справа снизу для создания нового чата (иконка)
  — Долгое нажатие на чат → контекстное меню: «Редактировать», «Удалить» (hard delete с подтверждением)
  — Загрузка чатов из `chatRepository.getChats()` при фокусе экрана
  — Пустое состояние: текст «Создайте первый чат»

- [ ] **5.2 Виджет создания/редактирования чата (ChatForm)**
  Создай `src/widgets/chat-form/`:
  — Модальное окно (BottomSheet или Modal) с формой: поле «Название чата» + выбор аватара
  — Аватар: кнопка «Выбрать из галереи» (image picker → кадрирование в круг → сохранение в `media/avatars/{chatId}.jpg`, resize ~512px, JPEG 85%) + кнопка «Emoji» (стандартный Android emoji picker или простой grid базовых эмодзи)
  — Кнопка «Создать» / «Сохранить» (text-кнопка без border)
  — При создании: `chatRepository.createChat()`, сохранение аватара в sandbox
  — При редактировании: `chatRepository.updateChat()`, опциональная замена аватара
  — Валидация: название не может быть пустым

- [ ] **5.3 Экран чата (ChatRoom) — лента сообщений**
  Создай `src/pages/chat-room/`:
  — Заголовок: аватар чата + название (тап → редактирование чата через ChatForm)
  — Лента сообщений: инвертированный FlatList (новые внизу). Каждое сообщение — bubble с текстом, временем, и маркером «изменено» если `updatedAt > createdAt`
  — `simple` — показывается сразу. `reminder`/`alarm` — показывается когда `scheduledAt <= now`. `periodic` — показывается при каждом срабатывании (пока заглушка, логика push — позже)
  — Long press на сообщение → контекстное меню: «Редактировать», «Удалить» (hard delete, без undo)
  — Sticky dates: если сообщения за разные дни — разделитель с датой, плавно прилипающий при скролле (Reanimated `LinearTransition`)
  — Анимация появления сообщений: `FadeInUp` через Reanimated entering animation
  — Поиск по чату: иконка в заголовке → поле поиска, результаты подсвечиваются

- [ ] **5.4 Компонент ввода сообщений (MessageComposer)**
  Создай `src/widgets/message-composer/`:
  — Поле ввода (multiline Input) + 4 иконки внизу: отправить (simple), напоминание, будильник, периодичность
  — Иконки — `IconButton`, hit area ≥48dp, визуально компактнее
  — Кнопка «отправить» (simple) — создаёт сообщение типа `simple`, сразу в ленту
  — Кнопка «напоминание» — открывает picker даты/времени → создаёт `reminder` с `scheduledAt`
  — Кнопка «будильник» — открывает picker даты/времени → создаёт `alarm` с `scheduledAt`
  — Кнопка «периодичность» — открывает picker интервала → создаёт `periodic` с `intervalMinutes`
  — Голосовая запись: long press на поле ввода (или отдельная иконка микрофона) → запись до 60 сек, формат AAC m4a mono 16kHz ~64kbps → сохранение в `media/voice/{messageId}.m4a`. Запись только в foreground, при сворачивании — прерывается.
  — Поле не должно прыгать при появлении клавиатуры (`useAnimatedKeyboard`)

- [ ] **5.5 Picker даты/времени (DateTimePicker)**
  Создай `src/widgets/datetime-picker/`:
  — Кастомный picker по ТЗ: 2 концентрических круга (внешний — дни 1–31, внутренний — месяцы 1–12), по центру — скролл часов и минут, год — выбор справа сверху
  — Жесты через `react-native-gesture-handler` (Pan на кругах, скролл по центру)
  — Анимации через Reanimated: `withSpring` / `withTiming` на позициях
  — Возвращает `Date` (UTC) при подтверждении
  — Кнопки «Отмена» и «Готово» (text-кнопки без border)
  — Учитывать локаль устройства для формата (12/24 часа)

- [ ] **5.6 Picker периодичности (PeriodPicker)**
  Создай `src/widgets/period-picker/`:
  — Пресеты: каждые 5 мин / 10 мин / 15 мин / час / день (text-кнопки)
  — Кастомный интервал: поле ввода внизу экрана (минуты)
  — Возвращает `intervalMinutes: number` при подтверждении
  — Кнопки «Отмена» и «Готово»

- [ ] **5.7 Виджет голосового сообщения (VoiceMessage)**
  Создай `src/widgets/voice-message/`:
  — Компонент bubble для голосового сообщения в ленте: иконка play/pause, волна (progress bar), длительность
  — Воспроизведение: per-message player (каждое сообщение — свой экземпляр). При tap на play — воспроизведение; tap на другое сообщение — stop предыдущего.
  — Формат: AAC m4a, до 60 сек. Путь `media/voice/{messageId}.m4a`
  — Без фонового воспроизведения — только в открытом чате
  — Анимация волны при воспроизведении (Reanimated)

---

## 6. Страница «Запланировано»

- [ ] **6.1 Экран «Запланировано» (Scheduled)**
  Создай `src/pages/scheduled/`:
  — Список всех сообщений типов `reminder`, `alarm`, `periodic` с `enabled = 1`, отсортированных по `scheduledAt` (ближайшие сверху)
  — Элемент: иконка типа (напоминание/будильник/периодичность) + текст сообщения + время/дата + название чата
  — Тап → переход в чат к исходному сообщению (deep link с `chatId` и `messageId`)
  — Пустое состояние: текст «Нет запланированных»

---

## 7. Страница «Настройки»

- [ ] **7.1 Экран «Настройки» (Settings)**
  Создай `src/pages/settings/`:
  — Секция «Тема»: текущий пресет + кнопка «Изменить» → экран выбора из 11 пресетов (превью каждого: квадрат с bg + text)
  — Секция «Звук и тактильность»: переключатели haptic / sound (вкл/выкл)
  — Секция «Язык»: RU / EN (переключатель, default по системе)
  — Секция «Резервная копия»: кнопки «Сохранить в Google Drive» и «Восстановить из Google Drive» + «Экспорт в файл» (JSON)
  — Секция «О приложении»: версия
  — Все настройки сохраняются в SQLite `settings`

- [ ] **7.2 Экран выбора темы (ThemePicker)**
  Создай `src/pages/theme-picker/`:
  — Сетка 11 пресетов: каждый — прямоугольник с background-цветом и текстом sample
  — Текущий выделен (подчёркивание или рамка — уточни, border не используем, может opacity/underline)
  — Тап → применить тему, сохранить в `settings`, вернуться на экран настроек
  — Плюс опция «Системная» (Material You) если SDK позволяет подобрать пару фон + текст

---

## 8. Уведомления и напоминания (нативный Android)

- [ ] **8.1 Создать notification channels и регистрацию**
  В `android/app/src/main/java/.../`:
  — Создай `NotificationModule.kt` (React Native Native Module): регистрация 2 каналов при старте: `reminders` (IMPORTANCE_DEFAULT) и `alarms` (IMPORTANCE_HIGH, CATEGORY_ALARM)
  — Вызвать регистрацию каналов из `MainApplication.kt` или из JS через `NativeModules` при инициализации приложения
  — Expo-modules-core не используем — plain RN Native Module

- [ ] **8.2 Реализовать push-напоминания (reminder + periodic)**
  — Для `reminder`: при создании сообщения — запланировать `AlarmManager.set()` (inexact) на `scheduledAt`. При срабатывании — показать notification на канале `reminders` с текстом сообщения и названием чата. Tap → deep link в чат.
  — Для `periodic`: при создании — запланировать первый `AlarmManager.set()` через `intervalMinutes`. При каждом срабатывании — notification + перепланировать следующий.
  — При удалении/отключении сообщения — отменить pending alarm
  — BroadcastReceiver в Kotlin для обработки срабатываний
  — Snooze: action в notification, 5 мин (default)

- [ ] **8.3 Реализовать full-screen alarm (будильник)**
  — `AlarmActivity.kt`: полноэкранный экран поверх lock screen (`showWhenLocked`, `turnScreenOn`). Текст сообщения + кнопки «Отключить» и «Snooze» (5 мин). Звук на `STREAM_ALARM`, вибрация.
  — `AlarmManager.setAlarmClock()` для точного времени (requires `SCHEDULE_EXACT_ALARM` permission на API 31+)
  — Permission flow: перед первым будильником — проверка `canScheduleExactAlarms()` → rationale → запрос. Fallback: inexact + предупреждение.
  — Battery optimization: после первого будильника — запрос `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` (один раз)
  — Manifest: `<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />`

---

## 9. Голосовые сообщения

- [ ] **9.1 Реализовать запись голосового сообщения**
  В `src/features/voice-record/`:
  — Хук `useVoiceRecorder()`: start/stop/cancel, возвращает `{ isRecording, duration, filePath }`
  — Формат: AAC-LC, `.m4a`, mono, 16 kHz, ~64 kbps, max 60 сек (hard stop)
  — Запись только при открытом приложении (foreground), без foreground service
  — При сворачивании — автоматическая остановка и сохранение
  — Использовать `react-native` Audio API или нативный модуль записи (MediaRecorder в Kotlin, exposed в JS)
  — UI: long press на иконке микрофона → запись, отпускание → сохранение как голосовое сообщение. Анимация индикатора записи (Reanimated `withSpring`)

- [ ] **9.2 Реализовать воспроизведение голосовых сообщений**
  В `src/features/voice-play/`:
  — Хук `useVoicePlayer(messageId)`: play/pause/stop, progress, duration
  — Per-message instance: каждый bubble — свой player. Одновременно играет только одно: tap на другое → stop предыдущего (координация через ref/context на уровне экрана чата)
  — Без фонового воспроизведения — lifecycle привязан к сообщению
  — UI: встроено в `VoiceMessage` виджет (см. 5.7)

---

## 10. Редактирование и удаление

- [ ] **10.1 Реализовать редактирование сообщений**
  В `src/features/edit-message/`:
  — Текст: изменение `body` + обновление `updated_at`. При повторном открытии — показ текущего текста в поле ввода
  — Время: изменение `scheduledAt` для reminder/alarm/periodic → перепланирование alarm. Обновление `updated_at`
  — История правок не хранится — только факт «изменено»
  — UI: long press → «Редактировать» → поле ввода с текущим текстом → «Сохранить»

- [ ] **10.2 Реализовать удаление сообщений и чатов**
  — Сообщение: long press → «Удалить» → подтверждение → hard delete из БД + удаление медиафайлов
  — Чат: long press в списке → «Удалить» → подтверждение → hard delete чата + CASCADE удаление всех сообщений + удаление аватара и медиафайлов
  — Startup cleanup: при старте приложения — обход `media/`, сверка с БД, удаление orphan файлов

---

## 11. Поиск

- [ ] **11.1 Реализовать глобальный поиск**
  На экране `ChatList`:
  — Иконка поиска в заголовке → поле поиска
  — Результаты: список сообщений (body + название чата + время), тап → переход в чат к сообщению
  — FTS5 через `searchMessages(query)` из entity Message

- [ ] **11.2 Реализовать поиск по чату**
  На экране `ChatRoom`:
  — Иконка поиска в заголовке → поле поиска
  — Результаты: сообщения только этого чата, подсветка совпадений
  — FTS5 через `searchMessages(query, chatId)`

---

## 12. Backup и экспорт

- [ ] **12.1 Реализовать экспорт в JSON**
  В `src/features/export/`:
  — Функция `exportToJSON()`: выгружает все чаты + сообщения + настройки в JSON-файл
  — `schema_version: 1` (integer), timestamps в UTC
  — Сохранение в файл через `react-native-fs` или Share API
  — Кнопка в настройках → «Экспорт в файл»

- [ ] **12.2 Реализовать импорт из JSON (merge)**
  В `src/features/import/`:
  — Функция `importFromJSON(json)`: merge по `id` — если запись уже есть, keep newer `updated_at`; новые — добавляем
  — Опция «Заменить всё» — destructive, с подтверждением
  — Кнопка в настройках → «Импорт из файла»

- [ ] **12.3 Интеграция Google Drive (manual backup)**
  В `src/features/google-drive/`:
  — OAuth через Google Sign-In (отдельный dependency)
  — Загрузка JSON-экспорта в appDataFolder Google Drive
  — Восстановление: чтение последнего backup из Drive → merge или replace
  — Кнопки в настройках: «Сохранить в Google Drive» и «Восстановить из Google Drive»
  — Manual only — без auto-sync, без WorkManager

---

## 13. Звук и haptic

- [ ] **13.1 Добавить haptic feedback и звуки**
  В `src/shared/lib/haptics.ts` и `src/shared/lib/sounds.ts`:
  — Haptic: `Haptics.impactAsync()` при отправке сообщения, при tap на иконки, при long press. Использовать `react-native` Haptics API
  — Sound: короткий звук при отправке сообщения, при срабатывании напоминания. Файлы — в `src/shared/assets/sounds/`
  — Глобальный переключатель в настройках (haptic + sound вкл/выкл, по умолчанию оба включены)
  — Учитывать `reduceMotion` для accessibility

---

## 14. Анимации (Reanimated)

- [ ] **14.1 Добавить анимации переходов и micro-interactions**
  — Появление сообщений в ленте: `FadeInUp` (Reanimated entering), мягкий spring
  — Sticky dates: `LinearTransition` на заголовке даты, плавное прилипание
  — Скролл: `useAnimatedScrollHandler` для инерции на UI thread
  — Поле ввода + клавиатура: `useAnimatedKeyboard` — composer не прыгает
  — Wheel picker: Gesture Handler Pan + `useSharedValue` / `withSpring` / `withTiming`
  — Запись голоса: LongPress + Pan + `withSpring` на индикаторе
  — Home → Chat (shared element на аватаре): experimental, feature flag; fallback — обычный stack transition
  — Все анимации — билдеры вне компонента или через `useMemo`; стабильные ≥60 FPS

---

## 15. Локализация

- [ ] **15.1 Настроить локализацию RU + EN**
  В `src/shared/config/locale.ts`:
  — Словари для RU и EN (все строки UI: табы, кнопки, пустые состояния, настройки, уведомления)
  — Хук `useLocale()` — возвращает строки для текущего языка
  — Default по системному языку; fallback EN если системный не RU/EN
  — Формат даты/времени: locale-aware (toLocaleDateString/toLocaleTimeString)
  — В БД — всегда UTC; отображение — локальное время устройства

---

## 16. Дефолтный чат и первый запуск

- [ ] **16.1 Реализовать первый запуск (дефолтный чат)**
  — При первом открытии (проверка: нет чатов в БД) — автоматически создать чат «Saved messages» (аналог Telegram) с дефолтным аватаром (иконка/emoji закладки)
  — Без onboarding экранов — сразу таб «Чаты» с этим чатом
  — Пользователь может переименовать или удалить этот чат

---

## 17. Интеграция и финализация

- [ ] **17.1 Собрать всё вместе — провайдеры и инициализация**
  В `App.tsx`:
  — Порядок инициализации: runMigrations() → загрузка settings → ThemeProvider → NavigationContainer → AppNavigator
  — Обработка ошибок миграции (показать экран ошибки)
  — Splash screen до инициализации БД

- [ ] **17.2 Пройтись по всем требованиям и проверить покрытие**
  Сверься с `docs/spec/white-requirements.md`:
  — Все 83 вопроса-ответа покрыты? Пропущенные — дописать промты выше или реализовать.
  — Прогони приложение: создание чата, отправка всех 4 типов сообщений, напоминания, будильник, поиск, настройки, темы, голос, backup.
  — Исправь баги.
  — Создай финальный отчёт в `docs/reports/`.

---

## Правила выполнения

1. **Перед промтом** — проверить что предыдущий отмечен `[x]`
2. **После промта** — пометить `[x]`, создать отчёт в `docs/reports/YYYY-MM-DD-<task>.md`
3. **Коммит** после каждого логического изменения (Conventional Commits)
4. **Тесты** — каждый промт с кодом покрывается unit-тестами (минимум 80%)
5. **FSD** — зависимости только вниз, public API через index.ts
6. **Итог** — после всех промтов: рабочее приложение, соответствующее ТЗ. Всё хорошо.
