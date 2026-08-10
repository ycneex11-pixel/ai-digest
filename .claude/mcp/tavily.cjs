// Обёртка запуска tavily-mcp: подставляет TAVILY_API_KEY из окружения,
// а если его там нет — читает из .env в корне проекта. Нужна, потому что
// VSCode-расширение Claude Code стартует без переменных из .env
// (run-claude.sh на него не влияет).
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');

function keyFromDotenv() {
  let text;
  try {
    text = fs.readFileSync(path.join(root, '.env'), 'utf8');
  } catch {
    return '';
  }
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?TAVILY_API_KEY\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return '';
}

const key = process.env.TAVILY_API_KEY || keyFromDotenv();
if (key) {
  console.error(`tavily.cjs: ключ найден (длина ${key.length})`);
} else {
  console.error('tavily.cjs: TAVILY_API_KEY нет ни в окружении, ни в .env — поиск ответит Unauthorized');
}

const opts = {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, TAVILY_API_KEY: key },
};
// на Windows npx — это npx.cmd: без shell современный Node кидает EINVAL,
// а shell + массив аргументов даёт DeprecationWarning, поэтому одной строкой
const child = process.platform === 'win32'
  ? spawn('npx -y tavily-mcp@latest', { ...opts, shell: true })
  : spawn('npx', ['-y', 'tavily-mcp@latest'], opts);

child.on('error', (err) => {
  console.error(`tavily.cjs: не удалось запустить npx: ${err.message}`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code === null ? 1 : code));
