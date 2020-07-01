import { useEffect, useState } from "react";

// Hook that returns the latest value that passes the predicate
export default function useLatestValue<T>(value: T, predicate: (value: T) => boolean = Boolean) {
  const [state, setState] = useState(value);
  useEffect(() => {
    if (predicate(value)) setState(value);
  }, [value]);
  return state;
}
