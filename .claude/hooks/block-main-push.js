#!/usr/bin/env node
// astroblog capstone: PreToolUse-хук, фаза 08. Блокирует git push в main без флага CAPSTONE_ALLOW_MAIN_PUSH=1.
// На Node, а не на bash с jq: jq — внешняя зависимость, которой на машине может не быть,
// и тогда хук падает с кодом 127. Такой код Claude Code считает некритичным и пропускает
// команду дальше — защита молча перестаёт защищать. Node уже обязателен для проекта.

const fs = require('fs');

let raw = '';
try {
	raw = fs.readFileSync(0, 'utf-8');
} catch {
	process.exit(0);
}

let data;
try {
	data = JSON.parse(raw);
} catch {
	// Payload не разобрался — не тот случай, чтобы блокировать ход.
	process.exit(0);
}

if (data.tool_name !== 'Bash' && data.tool_name !== 'PowerShell') process.exit(0);

const command = data.tool_input?.command ?? '';
const pushesToMain = /git\s+push\b[\s\S]*\b(main|master)\b/.test(command);

if (pushesToMain && process.env.CAPSTONE_ALLOW_MAIN_PUSH !== '1') {
	console.error('BLOCK: прямой push в main запрещён. Коммитим в digest/auto, merge — ручной шаг.');
	process.exit(2);
}

process.exit(0);
