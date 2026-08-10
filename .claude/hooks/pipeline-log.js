#!/usr/bin/env node
// astroblog capstone: PostToolUse-хук, фаза 06. Логирует каждый вызов инструмента в logs/pipeline.log.
// На Node по той же причине, что и block-main-push.js: без jq bash-версия падала на каждом вызове.

const fs = require('fs');
const path = require('path');

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
	process.exit(0);
}

const logDir = 'logs';
try {
	fs.mkdirSync(logDir, { recursive: true });

	const ts = new Date().toISOString();
	const tool = data.tool_name || 'unknown';
	const preview = JSON.stringify(data.tool_input ?? {})
		.slice(0, 200)
		.replace(/\s+/g, ' ');

	fs.appendFileSync(path.join(logDir, 'pipeline.log'), `${ts}  ${tool}  ${preview}\n`);
} catch {
	// Логирование не должно ронять ход.
}

process.exit(0);
