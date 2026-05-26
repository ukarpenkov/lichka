# Fix: NotificationModule unresolved reference build error

**Дата:** 2026-05-26
**Промпт/задача:** Исправить ошибку сборки `Unresolved reference 'currentActivity'` в NotificationModule.kt

## Что сделано
- Заменён `currentActivity` на `reactApplicationContext.currentActivity` в двух местах (строки 108 и 114)

## Изменённые файлы
- `android/app/src/main/java/com/lichka/NotificationModule.kt` — фикс обращения к currentActivity

## Принятые решения
- `ReactContextBaseJavaModule` не имеет прямого доступа к `currentActivity` — нужно обращаться через `reactApplicationContext`

## Тестирование
- Сборка `./gradlew assembleDebug` после фикса
