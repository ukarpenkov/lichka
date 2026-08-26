# Ссылки в сообщениях (иконка + переход)

**Дата:** 2026-08-26
**Промпт/задача:** Описать и реализовать фичу: после текста каждой ссылки — пиксельная иконка `link` (высота как у шрифта); тап по тексту URL открывает ссылку. Share — сразу. Ручной ввод — продумать UX. Отчёт.

## Что сделано
- Proposal: `docs/features/inline-message-links-proposal.md` (статус implemented).
- В ленте, подписи к картинке, future-timeline и списке запланированных URL подчёркивается, сразу после него — Streamline Pixel `interface-essential-link` размером с `fontSize` строки.
- Тап по тексту ссылки (или иконке) открывает `http`/`https` во внешнем обработчике.
- Share / вставка полного URL: после Send иконка сразу — URL в конце сообщения не требует пробела.
- Ручной ввод: в композере иконки нет (иначе прыгала бы на каждом символе path). После отправки линкуются только полные адреса (`https://example.com`, `www.…`, localhost/IPv4). Обрывки `https://`, `www.`, `https://git` — обычный текст.
- Долгое нажатие на строку по-прежнему открывает меню сообщения.

## Изменённые файлы
- `docs/features/inline-message-links-proposal.md` — описание и UX
- `src/shared/lib/messageLinks.ts` — разбор URL, `toHttpHref`, `openExternalUrl`
- `src/shared/lib/__tests__/messageLinks.test.ts`
- `src/shared/ui/pixel/icons.ts` — экспорт `Link`
- `src/shared/ui/LinkifiedText.tsx` — рендер сегментов + иконка
- `src/shared/ui/__tests__/LinkifiedText.test.tsx`
- `src/pages/chat-room/MessageLine.tsx`
- `src/widgets/image-message/ImageMessage.tsx`
- `src/pages/chat-room/FutureTimeline.tsx`
- `src/pages/scheduled/ScheduledItem.tsx`
- `src/shared/config/locale/*` — `openLink`, `linkOpenFailed`
- тесты MessageLine, ImageMessage, chatIcons, locale

## Принятые решения
- Ссылки не пишем в БД: это тот же `message.body`, распознавание при отрисовке.
- В `TextInput` иконки нет — нельзя стабильно посадить SVG после символа, и живой preview мешает печатать путь.
- Не линкуем голый `example.com` без схемы (ложные срабатывания).
- Цвет ссылки — цвет текста темы + подчёркивание, не «веб-синий».
- Ошибка открытия — `AlertDialog` с `linkOpenFailed`.

## Известные ограничения
- Композер и редактор сообщения остаются обычным полем: иконка появляется в ленте после отправки.
- Поиск по чату ведёт в сообщение, а не в браузер.
- `javascript:`, `file:` и неполные URL не открываются.

## Тестирование
- `parseMessageLinks` / `toHttpHref`: полный URL без пробела (share), несколько ссылок, хвостовая пунктуация, парные скобки в path, отказ `https://` / `www.` / `javascript:`.
- `LinkifiedText`: иконка 16px для body, 14px если `fontSize` в style; press → `Linking.openURL`.
- `MessageLine`: тап по shared URL открывает адрес.
- `ImageMessage`: URL в подписи — роль `link`.
- Локали: ключи `openLink` / `linkOpenFailed` во всех 6 языках.
- Пиксельный набор содержит `interface-essential-link`.
