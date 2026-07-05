# Увеличение отступа блока ввода от клавиатуры на 4px

**Дата:** 2026-07-05
**Промпт/задача:** Увеличить вертикальный отступ между блоком ввода/отправки сообщений и клавиатурой на 4px. После попыток 1–3 блок по-прежнему перекрывался клавиатурой на ~5px.

## Что сделано

- **Попытка 1:** `marginBottom: 4` в `MessageComposer` — дала обратный эффект (блок оказался на 4px ниже клавиатуры)
- **Попытка 2:** +4px в `chatAreaAnimatedStyle.paddingBottom` — не сработало: Reanimated `paddingBottom` на `flex: 1` контейнере не дал ожидаемого визуального сдвига
- **Попытка 3:** +4px во внутренний `paddingBottom` композера — не сработало: внутренний padding увеличивает высоту контейнера вниз, не поднимая его над клавиатурой
- **Попытка 4 (финальная):** разделение ответственности:
  - `ChatRoomScreen`: `KEYBOARD_ANDROID_LIFT_FUDGE = 5` в формуле `paddingBottom` — компенсирует занижение `keyboardDidShow` (~5px перекрытия)
  - `MessageComposer`: `transform: translateY(-KEYBOARD_COMPOSER_GAP)` при открытой клавиатуре — даёт видимый зазор 4px без зависимости от Yoga-пересчёта padding

## Изменённые файлы

- `src/shared/lib/keyboard.ts` — константы `KEYBOARD_ANDROID_LIFT_FUDGE` (5) и `KEYBOARD_COMPOSER_GAP` (4)
- `src/shared/lib/index.ts` — экспорт констант
- `src/pages/chat-room/ChatRoomScreen.tsx` — Android: `Math.max(keyboardHeight - tabBarHeight + KEYBOARD_ANDROID_LIFT_FUDGE, 0)`
- `src/widgets/message-composer/MessageComposer.tsx` — `paddingBottom: 0` при открытой клавиатуре; `translateY(-4)` для зазора

## Принятые решения

- **Padding/margin в Reanimated не подходят для тонкой подстройки** — на `flex: 1` родителе и внутри композера изменения `paddingBottom` либо не триггерят layout, либо увеличивают блок вниз вместо подъёма над клавиатурой
- **`translateY` для косметического зазора** — transform не участвует в layout, но визуально поднимает композер на 4px; FlatList при этом теряет 4px внизу, что допустимо
- **`KEYBOARD_ANDROID_LIFT_FUDGE` в chatArea** — основная компенсация высоты клавиатуры остаётся в `paddingBottom` chatArea (поднимает и список, и композер); +5px закрывает расхождение между событием `keyboardDidShow` и реальной верхней границей Gboard

## Известные ограничения

- Значения `5` и `4` подобраны эмпирически под Android/Gboard; на других клавиатурах может потребоваться калибровка
- iOS не трогали — система сама ресайзит окно

## Тестирование

- TypeScript-компиляция без ошибок
- Требуется визуальная проверка на Android: блок ввода полностью над клавиатурой с зазором ~4px
