import { useEffect, useRef, useState, useCallback } from 'react';

export function useGameStopwatch(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [active]);

  const reset = useCallback(() => setSeconds(0), []);

  return { seconds, reset };
}

export function useQuestionCountdown(seconds: number, key: string | number, onExpire: () => void, active: boolean) {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    expiredRef.current = false;
  }, [key, seconds]);

  useEffect(() => {
    if (!active) return;
    if (remaining <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
      return;
    }
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);

  }, [remaining, active, key]);

  return remaining;
}