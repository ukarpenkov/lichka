# Кастомные диалоговые окна (Alert Dialog)

**Дата:** 2026-07-02
**Промпт/задача:** Замена стандартных системных диалогов (Alert.alert) на кастомные компоненты, стилизованные под дизайн-систему приложения

## Что сделано
- Создан компонент `AlertDialog` в `shared/ui/` — переиспользуемый модальный диалог с анимацией
- Экспортирован через `shared/ui/index.ts`
- Заменены все 19 вызовов `Alert.alert()` на `AlertDialog` с управлением через состояние
- Рефакторинг `ensureExactAlarmPermission` — удалён `Alert.alert`, возврат `false` без показа диалога
- В `MessageComposer` добавлен кастомный диалог для разрешения точных будильников

## Дизайн компонента AlertDialog
- **Фон:** темизированный (`background` из темы через `useTheme()`)
- **Текст:** темизированный (`text` с разными уровнями прозрачности)
- **Скругление:** `borderRadius: 14` (единый с другими элементами UI)
- **Анимация:** `ZoomIn.springify()` для карточки, `FadeIn` для бэкдропа
- **Кнопки:**
  - `destructive` — красный (`#FF453A`)
  - `cancel` — полупрозрачный (`text + '99'`)
  - `default` — основной цвет текста, `fontWeight: '600'`
- **Тень:** `elevation: 8` + shadow для iOS
- **Поведение:** тап по бэкдропу / кнопка "Назад" закрывают диалог

## Изменённые файлы
| Файл | Изменения |
|------|-----------|
| `src/shared/ui/AlertDialog.tsx` | **Новый** — компонент кастомного диалога |
| `src/shared/ui/index.ts` | Экспорт `AlertDialog` и `AlertButton` |
| `src/pages/chat-room/ChatRoomScreen.tsx` | 1 вызов `Alert.alert` → `setDialog` |
| `src/pages/chat-list/ChatListScreen.tsx` | 1 вызов → `setDialog` |
| `src/pages/settings/SettingsScreen.tsx` | 14 вызовов → `setDialog` (в т.ч. вложенные с `setTimeout`) |
| `src/widgets/chat-form/ChatForm.tsx` | 2 вызова → `setDialog` |
| `src/features/notifications/requestExactAlarmPermission.ts` | Удалён `Alert.alert` и `Linking`; функция только проверяет разрешение |
| `src/widgets/message-composer/MessageComposer.tsx` | Добавлен кастомный диалог для разрешения будильников |

## Принятые решения
- Каждый компонент хранит своё состояние диалога через `useState<{title, message, buttons}>`
- Для вложенных диалогов (SettingsScreen: restore/import → confirm → result) используется `setTimeout(300)` для ожидания закрытия текущего диалога
- Параметр `onClose` вызывается при тапе по кнопке, бэкдропу или системной кнопке "Назад"
- Компонент следует FSD: слой `shared/ui`, нет зависимостей от верхних слоёв

## Известные ограничения
- Вложенные диалоги имеют задержку 300ms (длительность fade-анимации Modal)

## Тестирование
- `npx eslint .` — только pre-existing warnings (no new errors)
- `npx jest` — 111/111 тестов пройдены
