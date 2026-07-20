# Замена эмодзи чатов на Pixel-Icons

**Дата:** 2026-07-20
**Промпт/задача:** Заменить выбор эмодзи для аватаров чатов на Streamline Pixel Icons (зависимость уже есть); дефолтный чат «избранное» — `social-rewards-certified-ribbon`; иконки под цвет темы.

## Что сделано
- Добавлен каталог `CHAT_AVATAR_ICONS` (49 иконок из `@iconify-json/streamline-pixel`) + `DEFAULT_CHAT_ICON`.
- `EmojiGrid` заменён на `IconGrid` с `PixelIcon` и цветом из темы.
- `Avatar` и `ChatForm` рендерят pixel-иконки с `color={text}`; legacy emoji по-прежнему отображаются.
- Дефолтный чат Seed: `social-rewards-certified-ribbon`; миграция `🔖` → ribbon при старте.
- Локаль: `icon` / `chooseIcon`.

## Изменённые файлы
- `src/shared/ui/pixel/chatIcons.ts` — каталог иконок + `isChatIconAvatar`
- `src/shared/ui/pixel/index.ts` — реэкспорт
- `src/shared/ui/Avatar.tsx` — themed pixel / legacy emoji / file
- `src/widgets/chat-form/IconGrid.tsx` — новый пикер
- `src/widgets/chat-form/EmojiGrid.tsx` — удалён
- `src/widgets/chat-form/ChatForm.tsx` — иконки вместо эмодзи
- `src/entities/chat/model/chatRepository.ts` — дефолт + миграция
- `src/shared/config/locale.ts` — строки icon
- `__mocks__/pixelIcons.js` — `isChatIconAvatar` / каталог
- тесты: `chatIcons`, `Avatar`, `chatRepository`

## Принятые решения
- Аватар-иконка хранится как id Streamline Pixel в `avatar_path` (как раньше emoji).
- Распознавание: `path in pixelSet.icons`; иначе без `/` — legacy emoji; иначе файл.
- «Машина»: в наборе нет обычного car → `ecology-clean-car-cable-charge`.
- «Рюкзак»: `school-science-bag`; «покупки»: `shopping-shipping-bag-1`; «игровой автомат»: arcade-1.

## Известные ограничения
- Уже созданные чаты с emoji остаются с emoji до ручной смены (кроме Saved messages с `🔖`).
- Отдельной иконки легкового авто в пакете нет.

## Тестирование
- `chatIcons.test.ts` — все id из каталога есть в npm-пакете
- `Avatar.test.tsx` — themed icon / legacy emoji / fallback letter
- `chatRepository.test.ts` — seed ribbon + миграция `🔖`
