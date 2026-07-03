# Блок отправки сообщения отображается в середине экрана при открытии чата

## Описание
Блок ввода сообщения (`Message...`) и панель иконок отправки отображаются в середине экрана, сразу после последнего сообщения, вместо того чтобы быть прижатыми ко дну. Ниже — большое пустое пространство до нижней навигации.

## Шаги воспроизведения
1. Открыть приложение
2. Перейти в чат "Saved messages"
3. Обратить внимание на положение блока ввода

## Ожидаемый результат
Блок ввода сообщения и панель иконок прижаты к нижней части экрана (над нижней навигацией).

## Фактический результат
Блок ввода и панель иконок отображаются в середине экрана, сразу после последнего сообщения. Оставшаяся ~половина экрана пустая.

## Локализация
- `src/pages/chat-room/ChatRoomScreen.tsx:103-108` — `chatAreaAnimatedStyle` c `paddingBottom: Math.max(keyboard.height.value - tabBarHeight, 0)` на Android
- `src/widgets/message-composer/MessageComposer.tsx:84-86` — `containerAnimatedStyle` с `paddingBottom: keyboard.height.value > 0 ? 0 : 12`

## Причина
`useAnimatedKeyboard().height.value` не всегда равен 0 когда клавиатура закрыта — возникает гонка при навигации: анимация скрытия клавиатуры не успевает завершиться до монтирования экрана чата, и `keyboard.height.value` остаётся на ненулевом значении.

Из-за этого `chatAreaAnimatedStyle` применяет `paddingBottom` (равный `keyboard.height.value - tabBarHeight`) хотя клавиатура не открыта. Этот отступ сдвигает весь `chatArea` (список сообщений + MessageComposer) вверх, оставляя пустое пространство снизу. Блок ввода оказывается в середине экрана.

## Исправление №1 (2026-07-03, недостаточное)
Добавлен трекинг видимости клавиатуры через `Keyboard.addListener('keyboardDidShow'/'keyboardDidHide')`, синхронизированный в reanimated shared value `keyboardVisible`. `paddingBottom` применялся только когда `keyboardVisible.value === true`.

**Почему не сработало:** флаг `keyboardVisible` живёт на JS-потоке и обновляется листенерами, которые гоняются с монтированием экрана; при `windowSoftInputMode="adjustNothing"` события `keyboardDidShow/Hide` на Android приходят с задержкой/нестабильно. К тому же логика была продублирована в двух компонентах и легко рассинхронизировалась (см. историю багов по клавиатуре).

## Исправление №2 (2026-07-03, корневое)
Устранён сам класс проблемы: keyboard-логика вынесена в единый хук `useKeyboardHeight()` (`src/shared/lib/keyboard.ts`), который живёт целиком на UI-потоке и гейтит высоту по `KeyboardState` из reanimated (`OPEN`/`OPENING`). Эффективная высота = 0 во всех остальных состояниях, поэтому стейл/закрытая клавиатура физически не может добавить `paddingBottom` — блок ввода всегда прижат ко дну через flex-layout.

- Убраны JS-листенеры `Keyboard.addListener` и флаг `keyboardVisible` из обоих компонентов.
- Один источник правды вместо дублирования.

### Изменённые файлы
- `src/shared/lib/keyboard.ts` — новый хук `useKeyboardHeight()`
- `src/shared/lib/index.ts` — экспорт хука
- `src/pages/chat-room/ChatRoomScreen.tsx` — использует `useKeyboardHeight`, убраны листенеры
- `src/widgets/message-composer/MessageComposer.tsx` — использует `useKeyboardHeight`, убраны листенеры
- `jest.setup.js` — мок reanimated дополнен `state`, `useDerivedValue`, `KeyboardState`

## Статус
fixed (2026-07-03, корневой рефакторинг)
