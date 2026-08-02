#!/usr/bin/env node
// astroblog capstone: Stop-хук, фаза 06. Валидирует все недавно изменённые статьи в src/content/blog/ — обязательные поля frontmatter заполнены, ограничения соблюдены.

const fs = require('fs');
const path = require('path');

const hookData = JSON.parse(fs.readFileSync(0, 'utf-8'));
if (hookData.stop_hook_active) process.exit(0);

const blogDir = 'src/content/blog';
if (!fs.existsSync(blogDir)) process.exit(0);

const RECENT_MS = 10 * 60 * 1000;
const now = Date.now();

const recent = fs.readdirSync(blogDir)
  .filter(f => f.endsWith('.md'))
  .map(f => ({ f, full: path.join(blogDir, f), mtime: fs.statSync(path.join(blogDir, f)).mtimeMs }))
  .filter(x => now - x.mtime < RECENT_MS);

if (recent.length === 0) process.exit(0);

const required = ['title', 'description', 'pubDate', 'cover', 'source'];
const errors = [];

for (const { full, f } of recent) {
  const content = fs.readFileSync(full, 'utf-8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) { errors.push(`${f}: нет frontmatter`); continue; }

  const frontmatter = fmMatch[1];
  const missing = required.filter(field => {
    const re = new RegExp(`^${field}\\s*:\\s*(.+)$`, 'm');
    const m = frontmatter.match(re);
    return !m || !m[1].trim() || m[1].trim() === 'null';
  });
  if (missing.length) errors.push(`${f}: не заполнены поля ${missing.join(', ')}`);

  const titleMatch = frontmatter.match(/^title:\s*"?([^"\n]+)"?$/m);
  if (titleMatch && titleMatch[1].length > 60) errors.push(`${f}: title длиннее 60 символов (${titleMatch[1].length})`);

  const descMatch = frontmatter.match(/^description:\s*"?([^"\n]+)"?$/m);
  if (descMatch && descMatch[1].length > 160) errors.push(`${f}: description длиннее 160 символов (${descMatch[1].length})`);
}

if (errors.length) {
  console.error('Stop-хук: найдены проблемы в недавних статьях:\n' + errors.map(e => '  - ' + e).join('\n'));
  process.exit(2);
}

process.exit(0);
