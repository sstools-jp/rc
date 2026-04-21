import { useEffect, useRef, useState } from "react";

/** 一時表示のトーストメッセージを管理するフック */
export function useTransientToast(durationMs = 2500) {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const clearTimers = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const showToast = (nextMessage: string) => {
    clearTimers();

    setMessage(nextMessage);
    setIsVisible(true);

    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
      hideTimeoutRef.current = window.setTimeout(() => {
        setMessage(null);
        hideTimeoutRef.current = null;
      }, 250);
      timeoutRef.current = null;
    }, durationMs);
  };

  const hideToast = () => {
    clearTimers();
    setIsVisible(false);
    hideTimeoutRef.current = window.setTimeout(() => {
      setMessage(null);
      hideTimeoutRef.current = null;
    }, 250);
  };

  return {
    message,
    isVisible,
    showToast,
    hideToast,
  };
}
