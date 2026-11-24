import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportDirectory = join(repositoryRoot, 'reports', 'tests');
const scratchDirectory = mkdtempSync(join(tmpdir(), 'div-test-report-'));
const rawReportPath = join(scratchDirectory, 'junit.xml');

const sanitize = (xml) =>
  xml
    .replaceAll(repositoryRoot, '.')
    .replaceAll(homedir(), '~')
    .replace(/ hostname="[^"]*"/g, '');

const readCases = (xml) => {
  const document = new JSDOM(xml, { contentType: 'text/xml' }).window.document;
  return [...document.querySelectorAll('testcase')].map((testCase) => ({
    suite: testCase.parentElement.getAttribute('name') ?? 'root',
    name: testCase.getAttribute('name'),
    status: testCase.querySelector('failure')
      ? 'failed'
      : testCase.querySelector('skipped')
        ? 'skipped'
        : 'passed',
  }));
};

const escapeCell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');

const buildSummary = (cases, startedAt, exitCode) => {
  const count = (status) => cases.filter((testCase) => testCase.status === status).length;
  const rows = cases.map(
    ({ suite, name, status }) => `| ${escapeCell(suite)} | ${escapeCell(name)} | ${status} |`,
  );
  return [
    '# Test Report',
    '',
    `- Generated: ${startedAt}`,
    `- Runtime: Node.js ${process.version} on ${process.platform}`,
    '- Command: `npm run test:report`',
    `- Exit code: ${exitCode}`,
    `- Total: ${cases.length}`,
    `- Passed: ${count('passed')}`,
    `- Failed: ${count('failed')}`,
    `- Skipped: ${count('skipped')}`,
    '',
    '| Suite | Test | Status |',
    '| --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
};

const startedAt = new Date().toISOString();
const run = spawnSync(
  process.execPath,
  [
    '--test',
    '--test-reporter=spec',
    '--test-reporter-destination=stdout',
    '--test-reporter=junit',
    `--test-reporter-destination=${rawReportPath}`,
    'tests/**/*.test.mjs',
  ],
  { cwd: repositoryRoot, stdio: 'inherit' },
);

const exitCode = run.status ?? 1;
const report = sanitize(readFileSync(rawReportPath, 'utf8'));
const cases = readCases(report);
rmSync(scratchDirectory, { recursive: true, force: true });

mkdirSync(reportDirectory, { recursive: true });
writeFileSync(join(reportDirectory, 'junit.xml'), report);
writeFileSync(join(reportDirectory, 'summary.md'), buildSummary(cases, startedAt, exitCode));

process.exitCode = cases.length === 0 ? 1 : exitCode;
