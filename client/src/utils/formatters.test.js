import { describe, expect, it } from 'vitest';
import { formatHours } from './formatters.js';

describe('formatHours', () => {
  it('bases grammar on the displayed rounded value', () => {
    expect(formatHours(0.96, { long: true })).toBe('1 hour');
    expect(formatHours(1.04, { long: true })).toBe('1 hour');
  });

  it('does not display a positive duration as zero', () => {
    expect(formatHours(0.04, { long: true })).toBe('<0.1 hours');
    expect(formatHours(0.04)).toBe('<0.1 hrs');
  });
});
