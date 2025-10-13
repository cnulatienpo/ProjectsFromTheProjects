import { useEffect, useRef, useState, type JSX } from "react";

interface CountdownTimerProps {
  minutes: number;
  onExpire?: () => void;
  onTick?: (remainingSeconds: number) => void;
}

export function CountdownTimer({ minutes, onExpire, onTick }: CountdownTimerProps): JSX.Element {
  const [time, setTime] = useState(() => Math.max(minutes, 0) * 60);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    setTime(Math.max(minutes, 0) * 60);
    hasExpiredRef.current = false;
  }, [minutes]);

  useEffect(() => {
    if (time <= 0) {
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire?.();
      }
      onTick?.(0);
      return;
    }

    onTick?.(time);

    const interval = window.setInterval(() => {
      setTime((previous) => {
        const next = previous - 1;
        return next >= 0 ? next : 0;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [time, onExpire, onTick]);

  const minutesRemaining = Math.floor(time / 60);
  const secondsRemaining = time % 60;

  if (time <= 0) {
    return <p className="text-sm font-semibold text-red-500">⏰ Time’s up!</p>;
  }

  return (
    <p className="text-sm text-gray-400">
      ⏱ {minutesRemaining}:{secondsRemaining.toString().padStart(2, "0")}
    </p>
  );
}
