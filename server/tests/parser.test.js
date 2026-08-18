import { describe, it, expect } from 'vitest';
import { parseCheckIn } from '../src/services/parser.js';

describe('parseCheckIn', () => {
  it('parses the canonical example', () => {
    const r = parseCheckIn('5.5 hrs #project-x fix login issue');
    expect(r).toMatchObject({ hours: 5.5, unit: 'hr', tag: 'project-x', activities: 'fix login issue', valid: true });
  });

  it('parses procurement example', () => {
    const r = parseCheckIn('2 hrs #procurement vendor negotiation');
    expect(r).toMatchObject({ hours: 2, tag: 'procurement', activities: 'vendor negotiation' });
  });

  it('accepts hr without s and integer hours', () => {
    const r = parseCheckIn('1 hr #meeting standup');
    expect(r).toMatchObject({ hours: 1, valid: true });
  });

  it('is case insensitive for unit', () => {
    const r = parseCheckIn('3 HRS #ops shipment tracking');
    expect(r).toMatchObject({ hours: 3, valid: true });
  });

  it('defaults tag to general when missing', () => {
    const r = parseCheckIn('4 hrs wrote test suite');
    expect(r).toMatchObject({ hours: 4, tag: 'general', activities: 'wrote test suite', valid: true });
  });

  it('allows missing activities', () => {
    const r = parseCheckIn('2.5 hrs #support');
    expect(r).toMatchObject({ hours: 2.5, tag: 'support', activities: '', valid: true });
  });

  it('rejects empty text', () => {
    const r = parseCheckIn('');
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });

  it('rejects non-numeric hours', () => {
    const r = parseCheckIn('abc hrs #x work');
    expect(r.valid).toBe(false);
  });

  it('rejects zero and negative hours', () => {
    expect(parseCheckIn('0 hrs #x work').valid).toBe(false);
    expect(parseCheckIn('-2 hrs #x work').valid).toBe(false);
  });
});
