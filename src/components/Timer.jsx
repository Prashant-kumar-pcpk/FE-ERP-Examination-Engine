import React, { useState, useEffect, useRef } from 'react';
import { Timer as TimerIcon, AlertTriangle } from 'lucide-react';
import { formatSeconds } from '../utils/helpers';

const Timer = ({ initialSeconds, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    hasExpiredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            if (onExpireRef.current) {
              onExpireRef.current();
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Color dynamics:
  // > 5 mins (300s): emerald / neutral
  // <= 5 mins: amber warning
  // <= 1 min (60s): red danger with pulse
  const isUrgent = secondsLeft <= 60;
  const isWarning = secondsLeft <= 300 && !isUrgent;

  let timerClasses = 'bg-slate-100 border-slate-200 text-slate-800';
  let iconColor = 'text-slate-600';

  if (isUrgent) {
    timerClasses = 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse ring-2 ring-rose-400';
    iconColor = 'text-rose-600';
  } else if (isWarning) {
    timerClasses = 'bg-amber-50 border-amber-300 text-amber-800';
    iconColor = 'text-amber-600';
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border font-mono font-bold text-base md:text-lg shadow-sm transition-all ${timerClasses}`}
    >
      {isUrgent ? (
        <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
      ) : (
        <TimerIcon className={`w-5 h-5 ${iconColor}`} />
      )}
      <span>{formatSeconds(secondsLeft)}</span>
      <span className="text-[11px] font-sans font-medium uppercase tracking-wider opacity-75">
        Remaining
      </span>
    </div>
  );
};

export default Timer;
