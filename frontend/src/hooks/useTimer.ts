// src/hooks/useTimer.ts
"use client";

import { useState, useEffect, useRef } from "react";

export function useTimer(seconds: number, onExpire?: () => void) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setTimeLeft(seconds);
    if (seconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds]);

  const percentage = seconds > 0 ? (timeLeft / seconds) * 100 : 0;
  const isUrgent = timeLeft <= 10 && timeLeft > 0;

  return { timeLeft, percentage, isUrgent };
}
