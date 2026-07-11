# Рефакторинг на Feature-Sliced Design

**Дата:** 2026-07-11
**Статус:** proposal

## Проблема

Текущая архитектура проекта не следует единому стандарту. Код разбросан по папкам без чёткой иерархии, что усложняет:
- Поиск кода
- Понимание зависимостей
- Масштабирование проекта
- Онбординг новых разработчиков

## Решение

Внедрить **Feature-Sliced Design** — архитектурную методологию для фронтенд проектов.

### Структура слоёв

```
src/
├── app/          # Инициализация, провайдеры, роутинг, темы
├── pages/        # Страницы/экраны (Screen-компоненты)
├── widgets/      # Самостоятельные UI-блоки (Header, ChatList, MessageComposer)
├── features/     # Пользовательские действия (отправка сообщения, поиск)
├── entities/     # Бизнес-сущности (Chat, Message, User, Settings)
└── shared/       # UI-kit, утилиты, конфиги, типы
```

### Правило зависимостей

```
app → pages → widgets → features → entities → shared
```

- Каждый слайс зависит только от нижележащих слоёв
- Нет циклических зависимостей
- Нет импортов из верхних слоёв

### Публичное API

Каждый слайс экспортирует только через `index.ts`:

```
entities/
├── chat/
│   ├── model.ts
│   ├── types.ts
│   └── index.ts    # Публичное API
├── message/
│   ├── model.ts
│   ├── types.ts
│   └── index.ts
```

## Влияние на архитектуру

### Текущая структура → FSD

| Текущее расположение | FSD слой | FSD слайс |
|---------------------|----------|-----------|
| `src/screens/` | `pages/` | `chat-room/`, `settings/` |
| `src/components/` | `widgets/` или `shared/ui/` | зависит от назначения |
| `src/navigation/` | `app/` | `routing/` |
| `src/theme/` | `shared/` | `theme/` |
| `src/i18n/` | `shared/` | `i18n/` |
| `src/database/` | `shared/` | `database/` |
| `src/utils/` | `shared/` | `lib/` |

### Пример миграции

**До:**
```
src/
├── screens/ChatRoomScreen.tsx
├── components/MessageBubble.tsx
├── components/MessageComposer.tsx
├── database/models/Message.ts
├── navigation/AppNavigator.tsx
```

**После:**
```
src/
├── app/
│   └── App.tsx
├── pages/
│   └── chat-room/
│       ├── ChatRoomScreen.tsx
│       └── index.ts
├── widgets/
│   ├── message-bubble/
│   │   ├── MessageBubble.tsx
│   │   └── index.ts
│   └── message-composer/
│       ├── MessageComposer.tsx
│       └── index.ts
├── entities/
│   └── message/
│       ├── model.ts
│       ├── types.ts
│       └── index.ts
├── shared/
│   ├── ui/
│   ├── lib/
│   └── config/
```

## Альтернативы

1. **Atomic Design** — хорош для UI-компонентов, но не решает бизнес-логику
2. **Clean Architecture** — слишком абстрактная для React Native
3. **Без стандартов** — текущее состояние, деградирует при росте

**Выбор FSD:** явные правила, хорошая документация, активное комьюнити, подходит для React Native.

## Оценка сложности

- **Время:** 3-5 дней полного рефакторинга
- **Риски:** сломанные импорты, необходимость обновить все относительные пути
- **Подход:** поэтапная миграция по слоям (shared → entities → features → widgets → pages → app)

## Шаги реализации

1. **Shared** — выделить `shared/ui`, `shared/lib`, `shared/config`, `shared/i18n`
2. **Entities** — создать `entities/chat`, `entities/message`, `entities/settings`
3. **Features** — выделить бизнес-логику из экранов
4. **Widgets** — переместить крупные UI-блоки
5. **Pages** — переместить Screen-компоненты
6. **App** — настроить провайдеры и роутинг
