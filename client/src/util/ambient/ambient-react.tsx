import * as React from "react";

import Ambient, { AmbientStateAction, AmbientStateMapper } from "client/util/ambient/ambient";

declare module "@client/util/ambient/ambient" {
  export default interface Ambient<State> {
    useState<TReturn>(map: AmbientStateMapper<State, TReturn>): TReturn;
    useEffect<TReturn>(effect: AmbientStateAction<State>, map: AmbientStateMapper<State, TReturn>): void;
  }
}

export const ambientContext = React.createContext<Ambient<any> | null>(null);

// Hook that subscribes to state updates using `map`, and calls `effect` when value changes
export function useAmbientEffect<TState, TReturn>(
  store: Ambient<TState>,
  effect: AmbientStateAction<TState>,
  map: AmbientStateMapper<TState, TReturn>
): void {
  React.useEffect(() => {
    const state = store.get();
    effect(state, state);
    // Return the unsubscriber, to be called on unmount
    return store.subscribe(effect, map);
  }, []);
}

// Hook that subscribes to state updates using `map`, and causes re-render when value changes.
export function useAmbientState<TState, TReturn>(
  store: Ambient<TState>,
  map: AmbientStateMapper<TState, TReturn>
): TReturn {
  const [value, setValue] = React.useState(map(store!.get()));
  useAmbientEffect(store, (state) => setValue(map(state)), map);
  return value;
}

(Ambient.prototype as any).useState = function <TState, TReturn>(map: AmbientStateMapper<TState, TReturn>): TReturn {
  return useAmbientState(this, map);
};

(Ambient.prototype as any).useEffect = function <TState, TReturn>(
  effect: AmbientStateAction<TState>,
  map: AmbientStateMapper<TState, TReturn>
): void {
  return useAmbientEffect(this, effect, map);
};
