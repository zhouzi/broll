// Inspired by: https://github.com/streamich/react-use/blob/master/src/useLatest.ts
import { useCallback, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useLatestCallback = <T extends (...args: any[]) => any>(
  callback: T,
): T => {
  const ref = useRef(callback);
  ref.current = callback;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return useCallback((...args: Parameters<T>) => ref.current(...args), []) as T;
};
