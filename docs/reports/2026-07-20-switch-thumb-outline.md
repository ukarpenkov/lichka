# Обводка кружков тогглов в тёмной теме

**Дата:** 2026-07-20
**Промпт/задача:** В чёрной теме (Green on Black) не видно кружков тогглов — нужна небольшая обводка

## Что сделано
- Заменён системный `react-native` `Switch` на кастомный `shared/ui/Switch` с обводкой thumb цветом `ink` (1.5px)
- В настройках (Звук / Тактильная отдача) подключен новый Switch
- Добавлены unit-тесты; мок Reanimated пробрасывает rest-пропсы (в т.ч. `testID`)

## Изменённые файлы
- `src/shared/ui/Switch.tsx` — новый тематический переключатель с outline у кружка
- `src/shared/ui/index.ts` — экспорт Switch
- `src/pages/settings/SettingsScreen.tsx` — использование кастомного Switch
- `src/shared/ui/__tests__/Switch.test.tsx` — тесты a11y, press, disabled, outline
- `jest.setup.js` — Animated.View пробрасывает остальные пропсы

## Принятые решения
- Системный Switch не умеет border у thumb → свой компонент в `shared/ui`
- Обводка = `colors.ink`, заливка как раньше (`onInk` / `muted`) — на green-on-black чёрный кружок с зелёной рамкой читается на зелёном треке и не сливается с canvas
- Анимация ползунка через Reanimated (`SPRING_SNAP`)

## Известные ограничения
- Размеры приближены к iOS Switch (51×31), на Android визуально может чуть отличаться от системного

## Тестирование
- `npm test -- --testPathPattern='shared/ui/__tests__/Switch'`
- Сценарии: checked a11y, toggle press, disabled, borderColor/backgroundColor thumb на neon theme
