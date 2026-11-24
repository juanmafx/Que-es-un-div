import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, it } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const schema = readFileSync(join(repositoryRoot, 'db', 'schema.sql'), 'utf8');

const openDatabase = () => {
  const database = new DatabaseSync(':memory:');
  database.exec(schema);
  return database;
};

const insertRun = (database, overrides = {}) => {
  const run = {
    run_id: 'run-1',
    commit_sha: null,
    node_version: 'v24.22.0',
    started_at: '2026-11-23T12:00:00.000Z',
    duration_ms: 10.5,
    passed: 1,
    failed: 0,
    skipped: 0,
    ...overrides,
  };
  database
    .prepare(
      `INSERT INTO test_runs (run_id, commit_sha, node_version, started_at, duration_ms, passed, failed, skipped)
       VALUES (:run_id, :commit_sha, :node_version, :started_at, :duration_ms, :passed, :failed, :skipped)`,
    )
    .run(run);
};

const insertCase = (database, runId, status = 'passed') =>
  database
    .prepare(
      `INSERT INTO test_case_results (run_id, suite, name, status, duration_ms)
       VALUES (?, 'suite', 'name', ?, 1.5)`,
    )
    .run(runId, status);

describe('optional results schema', () => {
  it('creates the expected tables', () => {
    const rows = openDatabase()
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all();
    assert.deepEqual(rows.map((row) => row.name), ['test_case_results', 'test_runs']);
  });

  it('can be applied twice', () => {
    const database = openDatabase();
    assert.doesNotThrow(() => database.exec(schema));
  });

  it('stores a run with its results', () => {
    const database = openDatabase();
    insertRun(database);
    insertCase(database, 'run-1');
    assert.equal(database.prepare('SELECT COUNT(*) AS total FROM test_case_results').get().total, 1);
  });

  it('rejects negative counters', () => {
    assert.throws(() => insertRun(openDatabase(), { failed: -1 }), /CHECK/);
  });

  it('rejects a malformed timestamp', () => {
    assert.throws(() => insertRun(openDatabase(), { started_at: 'yesterday' }), /CHECK/);
  });

  it('rejects a short commit hash', () => {
    assert.throws(() => insertRun(openDatabase(), { commit_sha: 'abc123' }), /CHECK/);
  });

  it('rejects an unknown status', () => {
    const database = openDatabase();
    insertRun(database);
    assert.throws(() => insertCase(database, 'run-1', 'unknown'), /CHECK/);
  });

  it('rejects results for a missing run', () => {
    assert.throws(() => insertCase(openDatabase(), 'missing'), /FOREIGN KEY/);
  });

  it('removes results with their run', () => {
    const database = openDatabase();
    insertRun(database);
    insertCase(database, 'run-1');
    database.prepare('DELETE FROM test_runs WHERE run_id = ?').run('run-1');
    assert.equal(database.prepare('SELECT COUNT(*) AS total FROM test_case_results').get().total, 0);
  });
});
