---
name: cover
description: Генерирует обложку 16:9 для статьи дайджеста через Replicate (модель flux-schnell). Возвращает URL.
---

<!-- astroblog capstone: skill, фаза 06. Копируется в .claude/skills/cover.md в проекте. -->

# /cover — обложка статьи

Аргумент: короткое описание темы статьи (1–2 предложения на английском).

## Действия

1. Вызови `mcp__replicate__execute` с моделью `black-forest-labs/flux-schnell`:
   - `prompt`: «Editorial illustration about {{topic}}, minimalist, flat colors, tech magazine style, 16:9 aspect ratio, no text».
   - `aspect_ratio`: `16:9`.
   - `output_format`: `webp`.
2. Дождись ответа, возьми первый URL из массива `output`.
3. Верни URL одной строкой, без дополнительных комментариев.

## Если не получилось

- Replicate отдал ошибку → сообщи её текстом, не возвращай поддельный URL.
- Пустой `output` → повтори один раз с более общим prompt.

## Ограничения

- Не используй модели с NSFW/unfiltered тегами.
- Не запрашивай больше одной картинки за вызов.
