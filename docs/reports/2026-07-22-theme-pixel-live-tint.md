# Theme-pixel avatar: live tint при смене темы

**Дата:** 2026-07-22  
**Промпт/задача:** Доработать theme-pixel так, чтобы при смене темы аватар менял оттенки под тему.

## Что сделано

- Пайплайн разделён: `buildThemePixelMask` (grayscale) + `paintThemePixelMask` (duotone по теме).
- На диск сохраняется **маска**, не запечённые цвета темы.
- `recolorThemePixelAvatar*` / `getThemeTintedAvatarDataUri` + кэш path+цвета.
- Хук `useThemePixelAvatarUri` + виджет `ChatAvatar` в списке чатов и хедере.
- `ChatForm`: pending = mask; превью перекрашивается при смене темы.

## Изменённые файлы

- `src/features/pixel-avatar/model/processThemePixelBuffer.ts` — mask + paint
- `src/features/pixel-avatar/model/createThemePixelAvatar.ts` — mask/preview + recolor API
- `src/features/pixel-avatar/model/types.ts` — поля `mask*` / `preview*`
- `src/features/pixel-avatar/lib/getThemeTintedAvatarDataUri.ts` — кэш tint
- `src/features/pixel-avatar/ui/useThemePixelAvatarUri.ts` — хук
- `src/features/pixel-avatar/index.ts`
- `src/widgets/chat-avatar/*` — новый виджет
- `src/widgets/chat-form/ChatForm.tsx`
- `src/pages/chat-list/ChatListItem.tsx`, `src/pages/chat-room/ChatHeader.tsx`
- `docs/features/theme-pixel-avatar-proposal.md`

## Принятые решения

- FSD: tint в feature, композиция отображения в `widgets/chat-avatar` (shared Avatar не импортирует features).
- Старые запечённые PNG тоже tintятся через luminance (без миграции файлов).
- Для полного качества новых аватаров — перевыбрать фото (сохранится чистая маска).

## Известные ограничения

- Первый кадр PNG может кратко показать spinner, пока идёт decode+paint.
- Legacy JPG-аватары не tintятся.

## Тестирование

- Unit: mask grayscale, recolor green→amber, paint same mask under two themes — 18 passed.
- `./node_modules/.bin/jest src/features/pixel-avatar` — PASS.
