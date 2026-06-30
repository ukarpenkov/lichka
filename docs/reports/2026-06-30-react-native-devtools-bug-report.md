# Документирование бага React Native DevTools

**Дата:** 2026-06-30
**Промпт/задача:** Задокументировать проблему неработающего React Native DevTools, найти связанную issue

## Что сделано
- Найдена и изучена upstream issue [react/react-native#56714](https://github.com/react/react-native/issues/56714)
- Создан файл бага в `docs/bugs/react-native-devtools-not-working.md`

## Изменённые файлы
- `docs/bugs/react-native-devtools-not-working.md` — описание проблемы, окружения, причины и workaround

## Принятые решения
- Формат отчёта chosen аналогичным существующим файлам в `docs/bugs/`
- Указана связь с upstream issue для отслеживания фикса

## Известные ограничения
- Точная причина бага не установлена — проблема на стороне React Native 0.85.x
- Workaround ограниченный — полного替代 нет до исправления upstream

## Тестирование
- Файл создан и проверен на корректность формата
