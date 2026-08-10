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

// Сегмент — кусок между шелл-разделителями. Иначе «git push origin fix/x && git checkout main»
// блокируется ложно: push и main из разных команд.
function pushTargetsMain(segment) {
	const afterPush = segment.match(/\bgit\b[^|]*?\bpush\b(.*)$/);
	if (!afterPush) return false;
	return afterPush[1]
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((t) => t.replace(/^["']|["']$/g, ''))
		.filter((t) => !t.startsWith('-'))
		.some(
			(t) =>
				/^\+?(refs\/heads\/)?(main|master)$/.test(t) || // git push origin main
				/^\+?[^:]*:(refs\/heads\/)?(main|master)$/.test(t) // git push origin HEAD:main, :main
		);
}

const pushesToMain = command.split(/&&|\|\||;|\||\r?\n/).some(pushTargetsMain);

if (pushesToMain && process.env.CAPSTONE_ALLOW_MAIN_PUSH !== '1') {
	console.error('BLOCK: прямой push в main запрещён. Коммитим в digest/auto, merge — ручной шаг.');
	process.exit(2);
}

process.exit(0);
