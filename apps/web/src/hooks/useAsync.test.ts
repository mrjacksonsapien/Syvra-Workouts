import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAsync } from './useAsync';

// A promise we resolve by hand, to control the order in which responses arrive.
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('useAsync', () => {
  it('is loading first, then exposes the data', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve('hello'), []));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBe('hello');
    expect(result.current.error).toBeNull();
  });

  it('exposes the error when the promise rejects', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.reject(new Error('boom')), []));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.data).toBeUndefined();
  });

  it('runs the function again on reload()', async () => {
    const fn = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(fn, []));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.reload());

    await waitFor(() => expect(fn).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('ignores a stale response when the deps changed before it resolved', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const responses: Record<string, Promise<string>> = { a: first.promise, b: second.promise };

    const { result, rerender } = renderHook(({ key }) => useAsync(() => responses[key], [key]), {
      initialProps: { key: 'a' },
    });
    rerender({ key: 'b' });

    // The newer request answers first, then the old one arrives late.
    await act(async () => second.resolve('second'));
    await act(async () => first.resolve('first'));

    expect(result.current.data).toBe('second');
  });
});
