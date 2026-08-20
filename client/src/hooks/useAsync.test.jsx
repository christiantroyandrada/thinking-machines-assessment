import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAsync } from './useAsync.js';

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

describe('useAsync', () => {
  it('keeps the newest result when requests resolve out of order', async () => {
    const first = deferred();
    const second = deferred();
    const requests = [first, second];
    const { result } = renderHook(() => useAsync(() => requests.shift().promise, [], { immediate: false }));

    let firstRun;
    let secondRun;
    act(() => {
      firstRun = result.current.run();
      secondRun = result.current.run();
    });
    await act(async () => {
      second.resolve('newest');
      await secondRun;
    });
    await act(async () => {
      first.resolve('stale');
      await firstRun;
    });

    expect(result.current.data).toBe('newest');
  });
});
