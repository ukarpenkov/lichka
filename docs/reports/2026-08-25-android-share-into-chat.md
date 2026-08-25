# Поделиться в Lichka (ссылки и картинки)

**Дата:** 2026-08-25
**Промпт/задача:** Добавить Lichka в Android «Поделиться» для ссылок и картинок: выбор чата, черновик в композере (текст/картинка не отправляются сами). Описание в `docs/features`, реализация если возможно, отчёт.

## Что сделано
- Описана фича в `docs/features/android-share-into-chat-proposal.md` (статус implemented).
- Lichka появляется в системном Share для `text/plain`, `text/html` и `image/*`.
- После выбора приложения открывается список чатов («Выберите чат»). Выбор чата открывает комнату:
  - ссылка/текст — уже в поле ввода, можно дописать и нажать Send;
  - картинка — превью в композере (неотправленное вложение), текст пишется вручную, отправка только по Send.
- Native `ShareModule` копирует shared image в cache сразу (URI чужого приложения ненадёжен) и сжимает JPEG ≤1920px / quality 70.

## Изменённые файлы
- `docs/features/android-share-into-chat-proposal.md` — proposal
- `android/app/src/main/AndroidManifest.xml` — intent-filters `ACTION_SEND`
- `android/app/src/main/java/com/lichka/ShareModule.kt` — захват intent, копирование картинки
- `android/app/src/main/java/com/lichka/SharePackage.kt` — регистрация модуля
- `android/app/src/main/java/com/lichka/MainApplication.kt` — `SharePackage`
- `android/app/src/main/java/com/lichka/MainActivity.kt` — capture + emit на cold/warm start
- `src/shared/lib/shareIntent.ts` — JS-бридж
- `src/features/share-into-chat/` — нормализация payload, режим выбора чата, хук навигации
- `src/app/mainTabsApi.ts`, `src/app/types.ts`, `src/app/AppNavigator.tsx` — reveal списка + params черновика
- `src/pages/chat-list/ChatListScreen.tsx` — pick-mode UI
- `src/pages/chat-room/ChatRoomScreen.tsx` — прокидывание черновика в композер
- `src/widgets/message-composer/MessageComposer.tsx` — `initialText` / `initialImageUri`
- `src/shared/config/locale/*` — `shareChooseChat` (ru/en/es/de/fr/pt)

## Принятые решения
- Свой Kotlin-мост по паттерну уведомлений/виджета, без `react-native-receive-sharing-intent`.
- Картинка и ссылка не отправляются автоматически — только черновик в `MessageComposer`.
- Только Android; iOS Share Extension — отдельная задача (другой target / App Groups).
- `ACTION_SEND_MULTIPLE` не регистрируем (одно вложение на сообщение).

## Известные ограничения
- Нужна пересборка native (`react-native run-android`): новый модуль и intent-filters.
- Если чатов нет — сначала создать чат (FAB), затем выбрать его.
- Не-картиночные файлы (PDF и т.п.) в share sheet для Lichka не предлагаются.

## Тестирование
- `npm test` — 487 passed
- Покрыто: нормализация payload, store выбора чата, `begin/complete/cancelSharePick`, cold/warm start хук, `revealChatListForShare` без snapback таба, params `navigateToChat` с черновиком, композер кладёт текст/превью без `createMessage`, iOS no-op бридж, ключ `shareChooseChat` во всех локалях
- На устройстве не гонялось: Share из Chrome (ссылка) и из Галереи (фото) → список чатов → композер → Send
