import { useEffect, useState, type DependencyList } from 'react';

// Runs `fn` on mount and whenever `deps` change, and tracks its state.
// Responses that arrive after unmount, or after `deps` changed, are ignored (stale responses).
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Incrementing this re-runs the effect, which is how reload() works.
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let ignore = false; // set to true by the cleanup below when this run becomes stale
    setIsLoading(true);
    setError(null);

    fn()
      .then((result) => {
        if (ignore) return;
        setData(result);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
    // `fn` is deliberately not a dependency: callers pass a new arrow function every render.
  }, [...deps, reloadCount]);

  const reload = () => setReloadCount((count) => count + 1);

  return { data, error, isLoading, reload };
}
