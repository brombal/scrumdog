import { usePresence } from "framer-motion";
import { useEffect } from "react";

export default function usePresenceTimer(timeout: number) {
  const [isPresent, setSafeExit] = usePresence();

  useEffect(() => {
    !isPresent && setTimeout(() => setSafeExit(), timeout);
  }, [isPresent]);

  return isPresent;
}
