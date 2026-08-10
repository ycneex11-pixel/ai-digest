---
name: cover
description: Генерирует обложку 16:9 для статьи дайджеста и скачивает её в src/assets/covers/. Ключ не нужен.
---

<!-- astroblog capstone: skill, фаза 06. Копируется в .claude/skills/cover.md в проекте. -->

# /cover — обложка статьи

Аргументы: короткое описание темы (1–2 предложения по-английски) и `<slug>` — имя файла статьи без расширения, если картинка нужна для конкретной статьи.

## Действия

1. Составь prompt: `Editorial illustration about {{topic}}, minimalist, flat colors, tech magazine style, no text`.
2. Закодируй его для URL (пробелы → `%20`, запятые → `%2C`) и скачай картинку:

   ```
   mkdir -p src/assets/covers
   curl -fsSL "https://image.pollinations.ai/prompt/<encoded-prompt>?width=1280&height=720&nologo=true" -o "src/assets/covers/<slug>.jpg"
   ```

3. Проверь, что файл не пустой: `test -s "src/assets/covers/<slug>.jpg"`.
4. Верни путь к файлу одной строкой.

Картинка сразу лежит в репозитории — внешние ссылки на генераторы нестабильны, а `astro:assets` работает только с локальными файлами.

## Если не получилось

- `curl` вернул ошибку или файл нулевой → повтори один раз с более общим prompt.
- Не выдумывай путь к файлу, которого нет: сборка Astro упадёт на несуществующем `heroImage`.

## Ограничения

- Одна картинка за вызов.
- В prompt не должно быть людей по именам, брендов и NSFW-формулировок.
