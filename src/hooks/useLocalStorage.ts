import { useEffect, useState } from "react";
import { logger } from "../utils/logger";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      logger.log("warn", `Failed to read localStorage key: ${key}`, error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.log("warn", `Failed to write localStorage key: ${key}`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
