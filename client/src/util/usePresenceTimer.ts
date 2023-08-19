import { usePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function usePresenceTimer(timeout: number) {
  const [isPresent, setSafeExit] = usePresence();

  useEffect(() => {
    if (!isPresent) {
      const t = setTimeout(() => setSafeExit(), timeout);
      return () => clearTimeout(t);
    }
  }, [isPresent]);

  return isPresent;
}
