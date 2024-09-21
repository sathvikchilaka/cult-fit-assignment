import { useEffect, useRef, useState } from 'react';

const useThrottleHook = (value, delay) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRef = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now();
      const timeElapsed = now - lastRef.current;

      if (timeElapsed >= delay) {
        setThrottledValue(value);
        lastRef.current = now;
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
};

export default useThrottleHook;
