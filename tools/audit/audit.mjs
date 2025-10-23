// tools/audit/audit.mjs
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'tools', 'audit');
const REPORT = path.join(REPORT_DIR, 'REPORT.md');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const nowISO = () => new Date().toISOString();

function safeRead(p) { try { return readFileSync(p, 'utf8'); } catch { return ''; } }
async function sh(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: ROOT, shell: false, ...opts });
    let out = '', err = '';
    child.stdout.on('data', d => out += d.toString());
    child.stderr.on('data', d => err += d.toString());
    child.on('close', code => resolve({ code, out: out.trim(), err: err.trim() }));
  });
}

async function httpJSON(url, init) {
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    try { return { ok: res.ok, status: res.status, json: JSON.parse(text), raw: text }; }
    catch { return { ok: res.ok, status: res.status, json: null, raw: text }; }
  } catch (e) {
    return { ok: false, status: 0, json: null, raw: String(e) };
  }
}

function hasExport(source, name) {
  // cheap static check for named export
  const rx = new RegExp(`export\\s+(?:async\\s+)?function\\s+${name}\\b|export\\s*\\{[^}]*\\b${name}\\b`, 'm');
  return rx.test(source);
}

async function ensureReportDir() { mkdirSync(REPORT_DIR, { recursive: true }); }

async function detectPort() {
  const tryPort = async (p) => (await httpJSON(`http://localhost:${p}/api/healthz`)).ok ? p : null;
  return (await tryPort(3003)) || (await tryPort(3002)) || null;
}

async function startServerIfNeeded() {
  let port = await detectPort();
  if (port) return { port, started: false };
  const log = path.join('/tmp', 'server-audit.log');
  const child = spawn('npm', ['start'], { cwd: ROOT });
  child.stdout.pipe((await import('node:fs')).createWriteStream(log, { flags: 'a' }));
  child.stderr.pipe((await import('node:fs')).createWriteStream(log, { flags: 'a' }));
  // wait up to 15s
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    port = await detectPort();
    if (port) return { port, started: true, log };
  }
  return { port: null, started: false, log };
}

function section(title) { return `\n## ${title}\n`; }
function line(s) { return s + '\n'; }

async function main() {
  await ensureReportDir();
  let report = `# Project Health Report\nGenerated: ${nowISO()}\n`;

  // 1) Environment
  const pkg = JSON.parse(safeRead(path.join(ROOT, 'package.json') || '{}') || '{}');
  const appPkg = JSON.parse(safeRead(path.join(ROOT, 'app', 'package.json') || '{}') || '{}');
  report += section('Environment');
  report += line(`Node: ${process.version}`);
  report += line(`npm: ${(await sh('npm', ['-v'])).out || 'unknown'}`);
  report += line(`root package.json type: ${pkg.type || '(none)'}  | app present: ${!!appPkg.name}`);

  // 2) UI Build
  report += section('UI Build');
  const build = await sh('npm', ['--prefix', 'app', 'run', 'build']);
  report += line(build.code === 0 ? 'PASS: app build ok' : 'FAIL: app build failed');
  if (build.code !== 0) report += '```\n' + (build.out || build.err) + '\n```\n';

  // 3) Server up / port
  report += section('Server');
  const up = await startServerIfNeeded();
  if (!up.port) {
    report += line('FAIL: server not responding on 3002 or 3003 after 15s');
    if (up.log) report += line(`see log: ${up.log}`);
    writeFileSync(REPORT, report); console.log(`Report written: ${REPORT}`); return;
  }
  report += line(`PASS: server responding on :${up.port}${up.started ? ' (started by audit)' : ''}`);

  // 4) Mounted routes
  report += section('Routes');
  for (const r of ['/api/healthz','/api/reports/ping','/api/version','/api/debug/content']) {
    const res = await httpJSON(`http://localhost:${up.port}${r}`);
    report += line(`${res.ok ? 'PASS' : 'FAIL'}: ${r} ${res.status || ''}`);
  }

  // 5) Loaders exports
  report += section('Content Loaders');
  const loadersPath = path.join(ROOT, 'server', 'content', 'loaders.js');
  const loadersSrc = safeRead(loadersPath);
  if (!loadersSrc) {
    report += line('FAIL: missing server/content/loaders.js');
  } else {
    const flags = [
      ['getCatalog', hasExport(loadersSrc, 'getCatalog')],
      ['loadTweetrunk', hasExport(loadersSrc, 'loadTweetrunk')],
      ['loadPractice', hasExport(loadersSrc, 'loadPractice')],
    ];
    for (const [name, ok] of flags) report += line(`${ok ? 'PASS' : 'WARN'}: export ${name}`);
  }

  // 6) /api/next + seeding if needed
  report += section('Next Item');
  let next = await httpJSON(`http://localhost:${up.port}/api/next`);
  let nextId = next?.json?.id ?? null;
  if (!next.ok || nextId == null) {
    report += line('WARN: /api/next returned no id — seeding fallback item and retrying');
    const fallback = path.join(ROOT, 'server', 'content', 'items', 'fallback.json');
    mkdirSync(path.dirname(fallback), { recursive: true });
    writeFileSync(fallback, JSON.stringify([{ id: 'why-boot-001', mode: 'why', prompt: 'Why does short→long rhythm hit harder? One line.', meta: { freshness: 3, level: 1 } }], null, 2));
    await sh('npm', ['--prefix', 'app', 'run', 'build']);
    await sh('pkill', ['-f', 'node server/index.js']).catch(()=>{});
    await startServerIfNeeded();
    next = await httpJSON(`http://localhost:${up.port}/api/next`);
    nextId = next?.json?.id ?? null;
  }
  report += line(nextId != null ? `PASS: /api/next id = ${nextId}` : 'FAIL: /api/next still no id');

  // 7) /api/attempt coercion test
  report += section('Attempt Mode Coercion');
  if (nextId != null) {
    const attempt = await httpJSON(`http://localhost:${up.port}/api/attempt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'dev', itemId: String(nextId), mode: 'madeup', answer: 'short→long rhythm' })
    });
    const rubric = attempt?.json?.rubric || [];
    const unknown = Array.isArray(rubric) && rubric.some(s => typeof s === 'string' && /Unknown mode/i.test(s));
    report += line(attempt.ok ? 'PASS: /api/attempt responded' : 'FAIL: /api/attempt not OK');
    report += line(unknown ? 'FAIL: mode not coerced (rubric includes "Unknown mode.")' : 'PASS: mode coercion ok or not enforced by grader');
    if (!attempt.ok || unknown) {
      report += line('Remediation: coerce mode to "why" inside POST /api/attempt BEFORE calling grader, or wrap grader to coerce and normalize.');
    }
  }

  // 8) UI wiring checks
  report += section('UI Wiring');
  const apiSrc = safeRead(path.join(ROOT, 'app', 'src', 'lib', 'attemptApi.js'));
  const srSrc = safeRead(path.join(ROOT, 'app', 'src', 'pages', 'SigilRunner.jsx'));
  if (!apiSrc) report += line('FAIL: missing app/src/lib/attemptApi.js');
  else {
    for (const name of ['fetchNext','submitAttempt','skipItem']) {
      report += line(apiSrc.includes(`export async function ${name}`) ? `PASS: attemptApi.js exports ${name}` : `FAIL: attemptApi.js missing export ${name}`);
    }
  }
  if (!srSrc) report += line('WARN: missing SigilRunner.jsx');
  else {
    const okImport = /from\s+['"]@\/lib\/attemptApi['"]/.test(srSrc) && /fetchNext\s*,\s*skipItem\s*,\s*submitAttempt/.test(srSrc);
    report += line(okImport ? 'PASS: SigilRunner imports fetchNext/skipItem/submitAttempt' : 'WARN: SigilRunner import mismatch for attemptApi exports');
  }

  // 9) Write report
  writeFileSync(REPORT, report);
  console.log(`\n=== SUMMARY ===\n${report.split('\n').slice(0, 20).join('\n')}\n...\nFull report: ${REPORT}\n`);
}

main().catch(e => {
  try { mkdirSync(REPORT_DIR, { recursive: true }); } catch {}
  writeFileSync(REPORT, `# Project Health Report (crashed)\n${nowISO()}\n\n${String(e.stack || e)}`);
  console.error('Audit crashed:', e);
});

