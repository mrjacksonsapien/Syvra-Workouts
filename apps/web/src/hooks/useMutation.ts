import { useState } from 'react';

// Wraps a create/update/delete call and tracks its state.
// `mutate` resolves to the result so the page can reload its data afterwards.
// On failure it stores the error (for display) and rethrows it, so the caller's next
// lines (close the modal, reload) are skipped.
export function useMutation<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function mutate(...args: Args): Promise<Result> {
    setIsPending(true);
    setError(null);
    try {
      return await fn(...args);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  return { mutate, isPending, error };
}
