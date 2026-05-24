# Создание базовых shared UI-компонентов

**Дата:** 2026-05-24
**Промпт/задача:** 2.2 — Создать базовые shared UI-компоненты в `src/shared/ui/`

## Что сделано

Созданы 5 базовых UI-компонентов, все используют `useTheme()` для автоматической подстановки цветов:

- **Text.tsx** — базовый текст с цветом из темы. Поддерживает варианты `body` (16px) и `caption` (12px). Принимает все стандартные `TextProps`.
- **Button.tsx** — text-кнопка без border. Поддержка `onPress`, `disabled` (opacity 0.4), pressed-состояние (opacity 0.7). Принимает `title` как строку.
- **IconButton.tsx** — кнопка-иконка. Принимает `source` (ImageSourcePropType) для кастомных иконок или `children` (ReactNode, например SVG-элементы). Поддержка `size`, `onPress`, `disabled`. `hitSlop=8` для удобного тапа. tintColor из темы.
- **Screen.tsx** — обёртка экрана. `SafeAreaView` + `View` с `backgroundColor` из темы. `flex: 1`.
- **Input.tsx** — текстовое поле. Цвета текста и фона из темы, `placeholderTextColor` с 40% прозрачностью, border с 20% прозрачностью. Поддержка `multiline` (высота 100px) и `placeholder`. `borderRadius: 8`.

## Изменённые файлы

- `src/shared/ui/Text.tsx` — создан
- `src/shared/ui/Button.tsx` — создан
- `src/shared/ui/IconButton.tsx` — создан
- `src/shared/ui/Screen.tsx` — создан
- `src/shared/ui/Input.tsx` — создан
- `src/shared/ui/index.ts` — обновлён (экспорт всех компонентов и типов)
- `docs/tasks/promted-tasks.md` — отмечен [x] пункт 2.2

## Принятые решения

- **IconButton без react-native-vector-icons**: в проекте нет библиотеки векторных иконок, поэтому `IconButton` принимает `source` (для Image) или `children` (для любого React-элемента, например SVG). Prop `name` из ТЗ опущен — его можно добавить при подключении библиотеки иконок.
- **Placeholder color**: `${text}66` (40% opacity) — тонкий плейсхолдер, не переключает на серый.
- **Border color**: `${text}33` (20% opacity) — едва заметный, соответствует минималистичному стилю без border.
- **Screen**: использует `SafeAreaView` из `react-native-safe-area-context` (уже установлена).

## Известные ограничения

- Нет unit-тестов (задача не требовала тестов для UI-компонентов)
- `IconButton` не имеет prop `name` для системных иконок — требует подключения библиотеки иконок

## Тестирование

- Визуально: компоненты готовы к использованию, TypeScript-типы корректны
