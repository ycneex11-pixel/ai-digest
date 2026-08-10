# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Что это

Автоматический AI-дайджест на Astro. Публикует статьи о новостях AI, машинного обучения и больших языковых моделей — см. реальные примеры в `src/content/blog/`. Проект курса **Claude Code Basics**.

## Команды

- `npm install`
- `npm run dev` — dev-сервер на `:4321`.
- `npm run build` — production-сборка. Абсолютные ссылки в RSS берутся из `site` в `astro.config.mjs` — сейчас это домен деплоя `https://ai-digest-qedk.onrender.com`.
- `npm run preview` — просмотр собранного сайта.

Линтера и тестов в проекте нет — `package.json` их не определяет.

Node `>=22.12.0` (см. `engines` в `package.json`).

MCP-серверы (Tavily, Replicate) объявлены в `.mcp.json` в корне — Claude Code читает проектные серверы только оттуда, ключ `mcpServers` в `settings.json` игнорируется. Ключи подставляются из окружения через `${TAVILY_API_KEY}` и `${REPLICATE_API_TOKEN}`, поэтому запускайте Claude Code через `./run-claude.sh`, а не голым `claude` — скрипт подгружает `.env` (не в репозитории, см. `.gitignore`) перед стартом.

## Архитектура

### Контент

Статьи — коллекция `blog`, читается из `src/content/blog/*.{md,mdx}` (схема в `src/content.config.ts`, Zod). Поля: `title`, `description`, `pubDate`, `updatedDate?`, `heroImage?` (локальное изображение через `astro:assets`), `source?` (URL), `tags[]`.

**Обложки — локальные файлы, не URL.** `cover-artist` скачивает картинку с Replicate в `src/assets/covers/<slug>.webp` и пишет во frontmatter `heroImage` с путём относительно статьи. Ссылки `replicate.delivery` временные (протухают в 404), поэтому хранить их в контенте нельзя. Поля `cover` в схеме нет — только `heroImage` через `image()`.

**У трёх старых статей (`2026-04-23-*`) в frontmatter остался мёртвый `cover:` с недоступным URL.** Zod его игнорирует, на сайте эти статьи просто без картинки. Обложки для них надо перегенерировать через `/cover` или удалить поле.

### Пайплайн публикации — субагенты, не скрипт

Дайджест собирается цепочкой Claude Code субагентов через скилл `/digest` (`.claude/skills/digest.md`):

1. **news-scout** (`.claude/agents/news-scout.md`) — ищет 3 темы через MCP Tavily, отбирает по разделу «Редполитика» ниже в этом файле.
2. Для каждой темы параллельно: **writer** (`.claude/agents/writer.md`) пишет статью и сохраняет в `src/content/blog/`, затем **cover-artist** (`.claude/agents/cover-artist.md`) генерирует обложку через MCP Replicate (модель `flux-schnell`, 16:9), скачивает её в `src/assets/covers/` и дописывает `heroImage:` во frontmatter.
3. **page-builder** (`.claude/agents/page-builder.md`) — финальная проверка frontmatter всех статей выпуска, коммит в ветку `digest/auto`, `git push origin digest/auto`.

Скилл `/cover` (`.claude/skills/cover.md`) — то же генерирование обложки, но как самостоятельная команда вне пайплайна.

**Для шага `page-builder` нужен git-репозиторий с настроенным `origin`.** Репозиторий подключён к `https://github.com/ycneex11-pixel/ai-digest`, ветка по умолчанию — `main`.

### Хуки (`.claude/settings.json`)

- **PreToolUse / Bash** → `.claude/hooks/block-main-push.sh`: блокирует `git push` в `main`/`master`, если не выставлена переменная `CAPSTONE_ALLOW_MAIN_PUSH=1`. Автоматика коммитит в `digest/auto`, слияние в `main` — вручную.
- **PostToolUse** → `.claude/hooks/pipeline-log.sh`: логирует каждый вызов инструмента в `logs/pipeline.log` (в `.gitignore`).
- **Stop** → `.claude/hooks/validate-article.js`: проверяет статьи, изменённые за последние 10 минут, — обязательные поля frontmatter (`title`, `description`, `pubDate`, `heroImage`, `source`), длину `title` (≤60 символов) и `description` (≤160). При нарушении блокирует завершение хода.

## Редполитика

Этот раздел читают агенты `news-scout` и `writer` как критерии отбора и написания — менять формулировки здесь значит менять их поведение.

### Тематика

Новости AI, машинного обучения, больших языковых моделей. Инструменты для разработчиков и продуктовых менеджеров.

### Целевая аудитория

Разработчики, дата-сайентисты, ИТ-предприниматели и технические специалисты, которым нужно быстро быть в курсе главных технологических трендов.

### Стиль

- Информационный стиль (Ильяхов). Без маркетинговой лексики, оценочных прилагательных, канцелярита.
- Язык — русский.
- Предложения до 25 слов. Точки в конце буллетов.
- Без шаблона «от X до Y». Перечисляем конкретно.
- Без AI-маркеров: «погружаться», «ландшафт», «ключевой момент», «является свидетельством».
- Ключевые термины, метрики и выводы — **жирным шрифтом**.
- Без вводных слов и «воды».

### Формат статьи

Файл `src/content/blog/YYYY-MM-DD-slug.md`:

- Заголовок: до 60 символов, без точки.
- Описание: одно предложение до 160 символов.
- Тело: 300–500 слов, 2–4 абзаца.
- Источник: обязательная ссылка на первоисточник.
- Обложка: локальный файл в `src/assets/covers/`, соотношение 16:9. В frontmatter — `heroImage` с путём относительно статьи.

Обязательные поля frontmatter: `title`, `description`, `pubDate`, `heroImage`, `source` — все заполнены (проверяется Stop-хуком).

## Git

- Ветка по умолчанию — `main`.
- Автоматика коммитит в `digest/auto`, слияние в `main` — вручную.
- Прямой `git push` в `main`/`master` заблокирован хуком. Запрещены `git push --force`, `git reset --hard`, `git commit --amend`.

## Git Conventions
- Commits: Conventional Commits format.
- Types: feat, fix, docs, refactor, test, chore.
- Format: type(scope): description.
- Max subject line: 72 characters.
- Branch naming: type/short-description.
- PRs: always target "develop" (или "main", в зависимости от проекта).
