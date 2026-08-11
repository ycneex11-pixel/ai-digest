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

MCP-сервер Tavily объявлен в `.mcp.json` в корне — Claude Code читает проектные серверы только оттуда, ключ `mcpServers` в `settings.json` игнорируется. Сервер стартует через обёртку `.claude/mcp/tavily.cjs`: она берёт `TAVILY_API_KEY` из окружения, а если его там нет — читает из `.env` в корне (не в репозитории, см. `.gitignore`). Поэтому Claude Code можно запускать любым способом, включая расширение VSCode; `./run-claude.sh` остался для терминала, но больше не обязателен. Строка `TAVILY_API_KEY=...` в `.env` обязательна, иначе поиск отвечает `Unauthorized`. После смены ключа перезапустите сессию (в VSCode — Reload Window), MCP-сервер читает `.env` только на старте.

Обложки MCP не требуют: `cover-artist` берёт их с `image.pollinations.ai` обычным `curl`, без ключа и без оплаты. Replicate из проекта убран — он требовал привязки карты.

## Архитектура

### Контент

Статьи — коллекция `blog`, читается из `src/content/blog/*.{md,mdx}` (схема в `src/content.config.ts`, Zod). Поля: `title`, `description`, `pubDate`, `updatedDate?`, `heroImage?` (локальное изображение через `astro:assets`), `source?` (URL), `tags[]`.

**Обложки — локальные файлы, не URL.** `cover-artist` скачивает картинку в `src/assets/covers/<slug>.jpg` и пишет во frontmatter `heroImage` с путём относительно статьи. Ссылки на генераторы нестабильны, а `image()` в схеме принимает только локальный файл, поэтому хранить URL в контенте нельзя. Поля `cover` в схеме нет — только `heroImage`.

**У трёх старых статей (`2026-04-23-*`) в frontmatter остался мёртвый `cover:` с недоступным URL.** Zod его игнорирует, на сайте эти статьи просто без картинки. Обложки для них надо перегенерировать через `/cover` или удалить поле.

### Пайплайн публикации — субагенты, не скрипт

Дайджест собирается цепочкой Claude Code субагентов через скилл `/digest` (`.claude/skills/digest/SKILL.md`):

1. **news-scout** (`.claude/agents/news-scout.md`) — ищет 3 темы через MCP Tavily, отбирает по разделу «Редполитика» ниже в этом файле.
2. Для каждой темы параллельно: **writer** (`.claude/agents/writer.md`) пишет статью и сохраняет в `src/content/blog/`, затем **cover-artist** (`.claude/agents/cover-artist.md`) генерирует обложку 16:9 через `image.pollinations.ai`, скачивает её в `src/assets/covers/` и дописывает `heroImage:` во frontmatter.
3. **page-builder** (`.claude/agents/page-builder.md`) — финальная проверка frontmatter всех статей выпуска, коммит в ветку `digest/auto`, `git push origin digest/auto`.

Скилл `/cover` (`.claude/skills/cover/SKILL.md`) — то же генерирование обложки, но как самостоятельная команда вне пайплайна.

**Для шага `page-builder` нужен git-репозиторий с настроенным `origin`.** Репозиторий подключён к `https://github.com/ycneex11-pixel/ai-digest`, ветка по умолчанию — `main`.

### Хуки (`.claude/settings.json`)

- **PreToolUse / Bash|PowerShell** → `.claude/hooks/block-main-push.js`: блокирует `git push` в `main`/`master`, если не выставлена переменная `CAPSTONE_ALLOW_MAIN_PUSH=1`. Автоматика коммитит в `digest/auto`, слияние в `main` — вручную.
- **PostToolUse** → `.claude/hooks/pipeline-log.js`: логирует каждый вызов инструмента в `logs/pipeline.log` (в `.gitignore`).

Хуки написаны на Node, а не на bash с `jq`. Раньше они были shell-скриптами и на машине без `jq` падали с кодом 127 — для PreToolUse это «некритичная ошибка», команда проходит дальше, то есть защита `main` молча не работала. Node обязателен для проекта, лишней зависимости не появляется. В `.claude/hooks/package.json` стоит `"type": "commonjs"`, потому что в корневом `package.json` — `"type": "module"`.
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
