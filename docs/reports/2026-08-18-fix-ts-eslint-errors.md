# Исправление ошибок TypeScript и ESLint

**Дата:** 2026-08-18
**Промпт/задача:** Проверить проект на ошибки типов и проблемы ESLint, исправить все найденные ошибки и предупреждения.

## Что сделано
- Запущены `npx tsc --noEmit` и `npm run lint`; зафиксированы 19 ошибок TypeScript и 46 проблем ESLint (4 errors, 42 warnings)
- Устранены все ошибки TypeScript
- Устранены все ошибки и предупреждения ESLint
- Валидация: `tsc --noEmit` — 0 ошибок, `eslint .` — 0 проблем, `jest` — 426/426 тестов зелёные

### Исправления TypeScript
- **TS2774** («condition will always return true») в `getUpng()` модулей `pixel-avatar` — проверка `mod?.decode/mod?.encode` всегда истинна по типам. Типизация заменена на `Partial<UpngApi> & { default?: Partial<UpngApi> }`, фолбэк через `require('upng-js')` сохранён
- **`imageCompress.ts`**: `quality: 0.75` не входит в `PhotoQuality` (допустимы только шаги 0.1) → заменён на `0.7`, тест обновлён
- **Тесты**: `syncScheduledWidget.test.ts` — `mockReturnValue(undefined)` → `null` (`Chat | null`); `ImageMessage.test.tsx` — `createMessage` типизирован как `Message` (было `type: string`), анотация колбэка `.map` по `Stop` удалена (несовместима с `ReactTestInstance`)
- **`ImageMessage.test.tsx`**: `payload` по умолчанию теперь подставляется только при `undefined` — тест «fallback при null payload» стал проверять реальный сценарий (раньше `??` подменял `null` на дефолтный JSON)

### Исправления ESLint
- **Errors**: мок `useFocusEffect` в `jest.setup.js` переписан без передачи внешней функции в `useEffect`; `useCallback` с массивом-переменной в `MainTabsContext` снабжён disable-комментарием; удалены неиспользуемые `messages` и `fireEvent` в тестах
- **no-inline-styles (~30 мест)**: литеральные стили вынесены в `StyleSheet` (`App.tsx`, `AlertDialog`, `Switch`, `Input`, `Avatar`, `ChatAvatar`, `ThemePickerScreen`, `DateTimePicker`, `YearGridModal`, `YearPicker`, `PeriodPicker`, `MessageComposer`, `DateTimePickerModal`, `ChatRoomScreen`, `FutureTimeline`, `SearchOverlay` и др.)
- **no-bitwise**: `generateId.ts` переписан на `Math.floor`/`%` без изменения результата; в `VoiceMessage.tsx` (`| 0` для детерминированного seed) оставлен disable-комментарий
- **no-shadow**: переименованы теневые переменные (`text` в `PeriodPicker`, внутренняя функция `FutureTimeline` → `FutureTimelineComponent`, `React` в mock-фабриках `MessageLine.test` и `Avatar.test` — заменён деструктуризацией `createElement`)
- **@react-native/no-deep-imports**: в `clipboard.ts`/`clipboard.test.ts` добавлены disable-комментарии (deep import намеренный — избегает deprecated-варнинга `Clipboard` в RN 0.85)
- Удалены неиспользуемые `eslint-disable` директивы (`no-require-imports` в `pixel-avatar`)
- **no-void**: в `ChatForm.tsx` убраны `void`-операторы перед promise-вызовами

## Изменённые файлы
- `App.tsx` — стиль `root` вынесен в `StyleSheet`
- `jest.setup.js` — мок `useFocusEffect`, удалён неиспользуемый `React` в двух mock-фабриках
- `src/app/MainTabsContext.tsx` — disable для `useCallback` с внешним массивом зависимостей
- `src/entities/message/__tests__/messageRepository.test.ts` — удалена неиспользуемая переменная
- `src/features/chat-future-peek/FuturePeekOverlay.tsx` — стиль `guideFixed`
- `src/features/pixel-avatar/model/{decodeImage,pngEncode}.ts` — типизация `getUpng()`
- `src/features/pixel-avatar/__tests__/processThemePixelBuffer.test.ts` — удалён лишний disable
- `src/features/scheduled-widget/__tests__/syncScheduledWidget.test.ts` — `null` вместо `undefined`
- `src/pages/chat-room/ChatRoomScreen.tsx` — стиль `centerText`
- `src/pages/chat-room/FutureTimeline.tsx` — переименование внутренней функции, стиль `list`
- `src/pages/chat-room/SearchOverlay.tsx` — `fontFamily` перенесён в `styles.input`
- `src/pages/chat-room/__tests__/MessageLine.test.tsx` — mock-фабрики без теневого `React`
- `src/pages/settings/ThemePickerScreen.tsx` — стили `cardActive`/`cardInactive`/`title`
- `src/shared/lib/{clipboard.ts,__tests__/clipboard.test.ts}` — disable для deep import
- `src/shared/lib/generateId.ts` — без побитовых операторов
- `src/shared/lib/{imageCompress.ts,__tests__/imageCompress.test.ts}` — `quality: 0.7`
- `src/shared/ui/AlertDialog.tsx` — стили `pressedLayer`/`buttonLabel`
- `src/shared/ui/Avatar.tsx` — стиль `iconClip`
- `src/shared/ui/Input.tsx` — стили `single`/`multiline`
- `src/shared/ui/Switch.tsx` — стиль `trackDisabled`
- `src/shared/ui/__tests__/Avatar.test.tsx` — mock-фабрика без теневого `React`
- `src/widgets/chat-avatar/ChatAvatar.tsx` — `overflow: 'hidden'` в `styles.wrap`
- `src/widgets/chat-form/ChatForm.tsx` — удалены `void`, стиль `saveButtonDisabled`
- `src/widgets/datetime-picker/DateTimePicker.tsx` — стили `monthLabel`/`dayNumber`
- `src/widgets/datetime-picker/YearGridModal.tsx` — стили `yearLabel`/`yearLabelActive`/`title`
- `src/widgets/datetime-picker/YearPicker.tsx` — стиль `yearLabel`
- `src/widgets/image-message/__tests__/ImageMessage.test.tsx` — типизация `createMessage`
- `src/widgets/message-composer/DateTimePickerModal.tsx` — стиль `btnGap`
- `src/widgets/message-composer/MessageComposer.tsx` — стиль `cancelHint`
- `src/widgets/message-composer/__tests__/MessageComposer.test.tsx` — удалён `fireEvent`
- `src/widgets/period-picker/PeriodPicker.tsx` — переименование `text`→`input`, стили `presetBtnActive`/`unitLabel`/`btnDisabled`
- `src/widgets/voice-message/VoiceMessage.tsx` — disable для `no-bitwise`

## Принятые решения
- Качество сжатия `0.75` → `0.7` (ближайшее допустимое значение `PhotoQuality`; выбор в пользу меньшего размера файла, т.к. модуль — компрессия изображений)
- Побитовые операции в `generateId` переписаны арифметически (`(r % 4) + 8` ≡ `(r & 0x3) | 0x8` для r ∈ 0..15) — результат идентичен
- В `VoiceMessage` побитовое `| 0` оставлено с disable-комментарием: `Math.trunc` изменил бы поведение при переполнении int32 и, как следствие, детерминированный seed волны
- В `ImageMessage.test` семантика `payload` исправлена: `null` больше не подменяется дефолтным JSON (`??` → проверка `!== undefined`)
- Динамические inline-стили (значения из темы) не выносились — правило `no-inline-styles` флагует только литералы

## Известные ограничения
- Deep import `react-native/Libraries/Components/Clipboard/Clipboard` сохранён (с disable) — модуль всё ещё поставляется в RN 0.85, top-level `Clipboard` даёт deprecated-варнинг
- `MainTabsContext` и `jest.setup.js` содержат точечные `eslint-disable` для react-hooks — обёртки с внешними зависимостями, статический анализ там невозможен

## Тестирование
- `npx tsc --noEmit` — 0 ошибок
- `npm run lint` — 0 errors, 0 warnings
- `npm test -- --ci` — 52 suites / 426 tests, все зелёные
