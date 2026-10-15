import assert from 'node:assert/strict';
import test from 'node:test';
import Job from './Job.js';

test('requires a company and role, then defaults status and date', () => {
  const job = new Job({ companyName: 'Northstar', role: 'Product Designer' });

  assert.equal(job.status, 'Applied');
  assert.ok(job.dateApplied instanceof Date);
  assert.equal(job.validateSync(), undefined);
});

test('rejects missing required fields and unsupported statuses', () => {
  const job = new Job({ status: 'Maybe' });
  const error = job.validateSync();

  assert.ok(error.errors.companyName);
  assert.ok(error.errors.role);
  assert.ok(error.errors.status);
});