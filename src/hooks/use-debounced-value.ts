import { useEffect, useState } from "react";

/**
 * Returns a copy of `value` that only updates once it has stopped changing
 * for `delayMs` milliseconds — used to avoid re-running expensive work
 * (like filtering a list) on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
