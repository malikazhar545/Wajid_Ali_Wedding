import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmedDate, clockTime } from '../src/date-time.mjs';

test('ambiguous or impossible saved dates stay unconfirmed instead of rendering Invalid Date', () => {
  assert.equal(confirmedDate('07-10-2026'), '');
  assert.equal(confirmedDate('2026-02-30'), '');
  assert.equal(confirmedDate('2026-10-07'), '2026-10-07');
  assert.equal(confirmedDate(''), '');
});

test('old AM/PM times normalize for calendar inputs without changing their meaning', () => {
  assert.equal(clockTime('10:00 PM'), '22:00');
  assert.equal(clockTime('12:00 AM'), '00:00');
  assert.equal(clockTime('12:00 PM'), '12:00');
  assert.equal(clockTime('19:30'), '19:30');
  assert.equal(clockTime('25:00'), '');
});
