import { useCallback, useRef } from "react";

export function useDebounceCallback<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (
      ...args: Parameters<T>
    ): Promise<ReturnType<T> extends Promise<infer U> ? U : never> => {
      return new Promise((resolve, reject) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
          try {
            const result = await callback(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    },
    [callback, delay],
  );
}
